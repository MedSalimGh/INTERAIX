import { NextResponse } from "next/server";
import { db as adminDb } from "@/firebase/admin";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const doc = await adminDb.collection("support_chats").doc(userId).get();

        if (doc.exists) {
            return NextResponse.json({ messages: doc.data()?.messages || [] });
        } 
        
        return NextResponse.json({ messages: [] });

    } catch (error: any) {
        console.error("Fetch History Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
