import { NextRequest, NextResponse } from "next/server";
import { db as adminDb } from "@/firebase/admin";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { cvId, userId, text: providedText } = await req.json();

    if (!cvId || !userId) {
      return NextResponse.json(
        { error: "CV ID and User ID are required" },
        { status: 400 }
      );
    }

    let text = providedText;

    // If text is not provided, fetch from Firestore
    if (!text) {
      const cvDoc = await adminDb.collection("users").doc(userId).collection("cvs").doc(cvId).get();
      if (!cvDoc.exists) {
        console.log(`CV not found at users/${userId}/cvs/${cvId}`);
        return NextResponse.json(
          { error: "CV not found" },
          { status: 404 }
        );
      }
      text = cvDoc.data()?.extractedText;
      
      if (!text) {
        return NextResponse.json(
          { error: "CV has no extracted text" },
          { status: 400 }
        );
      }
    }

    // Generate detailed rating analysis
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert ATS (Applicant Tracking System) and CV Resume Consultant.
          Analyze the following CV text and provide a detailed rating, ATS score, and skills gap analysis.
          
          Return the response in this JSON format:
          {
            "scores": {
              "overall": number, // 0-100
              "content": number, // 0-100
              "skills": number, // 0-100
              "experience": number, // 0-100
              "formatting": number // 0-100
            },
            "ats": {
              "score": number, // 0-100
              "issues": ["issue 1", "issue 2"],
              "tips": ["tip 1", "tip 2"]
            },
            "skillsGap": {
              "targetRole": "Identified/Inferred Role",
              "missingSkills": ["skill 1", "skill 2"],
              "recommendations": ["rec 1", "rec 2"]
            },
            "feedback": {
              "strengths": ["strength 1", "strength 2"],
              "improvements": ["improvement 1", "improvement 2"]
            }
          }`,
        },
        {
          role: "user",
          content: `CV Content:\n${text}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const rating = JSON.parse(completion.choices[0]?.message?.content || "{}");

    // Save rating to Firestore
    await adminDb.collection("users").doc(userId).collection("cvs").doc(cvId).update({
      rating,
      ratedAt: new Date().toISOString(),
    });

    // Create Notification
    await adminDb.collection("users").doc(userId).collection("notifications").add({
      title: "CV Analysis Complete",
      message: `Your CV score is ready! You scored ${rating.scores?.overall || 0}/100.`,
      type: "success",
      read: false,
      createdAt: new Date(), // Using simple Date for server-side logic here
    });

    return NextResponse.json({ success: true, rating });
  } catch (error) {
    console.error("Error rating CV:", error);
    return NextResponse.json(
      { error: "Failed to rate CV" },
      { status: 500 }
    );
  }
}
