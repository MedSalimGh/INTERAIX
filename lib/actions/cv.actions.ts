"use server";

import { db as adminDb } from "@/firebase/admin";
import { revalidatePath } from "next/cache"; 
// import { uploadImageToStorage } from "@/lib/utils"; // Removed as requested
// import { auth } from "@clerk/nextjs/server"; // Removed logic

export async function createCVInterview(params: {
  userId: string;
  cvId: string;
  name: string;
  language: "en" | "fr";
  role: string;
  techstack: string[];
  level: string;
  type: string;
  questions: string[];
  cvContext: string;
}) {
  try {
    const { userId, cvId, name, language, role, techstack, level, type, questions, cvContext } = params;

    // Generate Pollinations URL for cover image
    const pollinationsUrl = `https://image.pollinations.ai/prompt/minimalist%203d%20icon%20of%20${encodeURIComponent(
      role
    )}%20${encodeURIComponent(
      techstack.join(" ")
    )}%20programming%20technology%20logo%20dark%20theme?nologo=true`;

    const interviewRef = adminDb.collection("interviews").doc();
    
    // We'll skip image upload storage for now to speed up, or use the direct URL if needed
    // But better to follow existing pattern. Assuming uploadImageToStorage exists in lib/utils or similar
    // For now, let's use the direct URL to avoid complex storage logic replication unless I see the existing util
    const coverImage = pollinationsUrl; 

    const interview = {
      userId,
      role: role.toLowerCase(),
      techstack: techstack.map((t) => t.toLowerCase()),
      level: level.toLowerCase(),
      type: type.toLowerCase(),
      questions,
      transcript: [], // Empty transcript initially
      coverImage,
      finalized: true, // CV interviews are pre-generated
      createdAt: new Date().toISOString(),
      generatedFrom: "cv",
      cvId,
      candidateName: name,
      language,
      cvContext,
    };

    await interviewRef.set(interview);

    // Create Notification
    await adminDb.collection("users").doc(userId).collection("notifications").add({
      title: "Interview Ready",
      message: `Your interview for ${role} is ready! Good luck, ${name}.`,
      type: "interview",
      read: false,
      createdAt: new Date(),
    });

    revalidatePath("/"); // Update dashboard
    return { success: true, interviewId: interviewRef.id };
  } catch (error) {
    console.error("Error creating CV interview:", error);
    return { success: false, error: "Failed to create interview" };
  }
}
