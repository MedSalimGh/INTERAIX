import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json();
  const { type, role, level, techstack, amount, userid, userisd } = body;

  // Handle potential typo from frontend/request
  const finalUserId = userid || userisd;

  if (!finalUserId) {
    return Response.json(
      { success: false, error: "Missing required field: userid" },
      { status: 400 }
    );
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const questions = completion.choices[0]?.message?.content || "[]";

    // Create a deterministic seed for cover image based on role and userid
    const coverSeed = `${role}-${finalUserId}-${Date.now()}`;
    
    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: finalUserId,
      finalized: true,
      coverImage: getRandomInterviewCover(coverSeed),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error:", error);
    
    if (
        error.status === 429 || 
        error.code === 429 || 
        error.message?.includes("RESOURCE_EXHAUSTED") || 
        error.message?.includes("429") ||
        error.message?.includes("Quota exceeded") ||
        error.message?.includes("Failed after")
    ) {
        return Response.json(
            { 
                success: false, 
                error: "Service is currently busy (Rate Limit Exceeded). Please try again in a few seconds." 
            }, 
            { status: 429 }
        );
    }

    return Response.json({ success: false, error: error.message || error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
