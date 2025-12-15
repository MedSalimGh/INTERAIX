import { NextResponse } from "next/server";
import { db as adminDb } from "@/firebase/admin";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
You are the "Intervaix Assistant", a helpful and professional support bot for the Intervaix platform.
Your goal is to help users navigate the website, prepare for interviews, and understand the features.

Key Features to Explain:
1. **Mock Interviews**: We generate personalized interviews based on role, tech stack, or uploaded CV.
2. **CV Analysis**: We score CVs out of 100.
    - Score < 60: "Locked" (Must pay 30 TND to unlock/improve).
    - Score >= 60: Good, but optional "Premium Rewrite" (50 TND) available.
3. **Enhanced CV**: Users can pay to get their CV rewritten by AI for better ATS scoring.
4. **General Tips**: Give brief, high-value advice on body language, STAR method, and confidence.

Tone: Professional, encouraging, concise, and modern. Use emojis sparingly.
`;

export async function POST(req: Request) {
    try {
        const { messages, userId } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 500,
        });

        const reply = completion.choices[0]?.message?.content || "I apologize, I'm having trouble connecting right now.";
        
        // Save to Firestore
        if (userId) {
            const chatRef = adminDb.collection("support_chats").doc(userId);
            
            const updatedMessages = [
                ...messages,
                { role: "assistant", content: reply, timestamp: new Date().toISOString() }
            ];

            await chatRef.set({
                userId,
                messages: updatedMessages,
                lastUpdated: new Date().toISOString()
            }, { merge: true });
        }

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error("Support Chat Error:", error);
        return NextResponse.json(
            { error: "Failed to process chat request" },
            { status: 500 }
        );
    }
}
