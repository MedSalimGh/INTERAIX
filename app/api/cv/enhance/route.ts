import { NextResponse } from "next/server";
import { db as adminDb } from "@/firebase/admin";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { cvId, userId } = await req.json();

        if (!cvId || !userId) {
            return NextResponse.json(
                { error: "CV ID and User ID are required" },
                { status: 400 }
            );
        }

        // 1. Fetch Original CV
        const cvRef = adminDb
            .collection("users")
            .doc(userId)
            .collection("cvs")
            .doc(cvId);
            
        const cvDoc = await cvRef.get();

        if (!cvDoc.exists) {
            return NextResponse.json({ error: "CV not found" }, { status: 404 });
        }

        const originalData = cvDoc.data();
        const originalText = originalData?.extractedText || "";

        if (!originalText) {
             return NextResponse.json({ error: "Original CV has no text content" }, { status: 400 });
        }

        console.log(`Enhancing CV ${cvId} for user ${userId}...`);

        // 2. AI Enhancement Prompt
        const prompt = `
        You are an expert Resume Writer and Career Coach. 
        Rewrite the following CV content to be a "Premium Top 1%" resume.
        
        Rules:
        1. Professional Summary: Make it punchy, result-oriented, and tailored for a senior/mid-level role.
        2. Experience: Rewrite bullet points to use strong action verbs (Achieved, Spearheaded, Engineered). quantifying results where possible. 
        3. Skills: Group them logically (Languages, Frameworks, Tools).
        4. Remove clutter, typos, and weak language.
        5. formatting: Use clear Markdown headers (##) and lists.
        
        Original CV Content:
        "${originalText}"

        Return ONLY the rewritten CV text in clean Markdown format. Do not add conversational filler.
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 2000,
        });

        const enhancedText = completion.choices[0]?.message?.content || "";

        if (!enhancedText) {
            throw new Error("AI failed to generate enhanced text");
        }

        // 3. Save Enhanced Version
        const enhancedCvRef = adminDb
            .collection("users")
            .doc(userId)
            .collection("cvs")
            .doc(); // New ID

        const enhancedData = {
            userId,
            fileName: `Enhanced_${originalData?.fileName || "Resume"}`,
            fileType: "md", // It's markdown text now
            extractedText: enhancedText,
            uploadedAt: new Date().toISOString(),
            isEnhanced: true,
            originalCvId: cvId,
            candidateName: originalData?.candidateName || "Candidate", // Preserve name
        };

        await enhancedCvRef.set(enhancedData);

        console.log(`Enhanced CV saved: ${enhancedCvRef.id}`);

        return NextResponse.json({ 
            success: true, 
            enhancedCvId: enhancedCvRef.id,
            enhancedText: enhancedText 
        });

    } catch (error: any) {
        console.error("Error enhancing CV:", error);
        return NextResponse.json(
            { error: `Failed to enhance CV: ${error.message}` },
            { status: 500 }
        );
    }
}
