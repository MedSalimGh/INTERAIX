"use server";

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

import { db, storage } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";
import { getRandomInterviewCover } from "@/lib/utils";

async function uploadImageToStorage(imageUrl: string, destinationPath: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const bucket = storage.bucket();
    const file = bucket.file(destinationPath);

    await file.save(buffer, {
      contentType: "image/png", // Pollinations returns PNGs usually
    });

    // Make the file public
    await file.makePublic();

    // Get the public URL
    return file.publicUrl();
  } catch (error) {
    console.error("Error uploading image to storage:", error);
    // Fallback to the original URL if upload fails
    return imageUrl;
  }
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories.
          
          Return the response in the following JSON format:
          {
            "totalScore": number (0-100),
            "categoryScores": [
              { "name": "Communication Skills", "score": number, "comment": string },
              { "name": "Technical Knowledge", "score": number, "comment": string },
              { "name": "Problem Solving", "score": number, "comment": string },
              { "name": "Cultural Fit", "score": number, "comment": string },
              { "name": "Confidence and Clarity", "score": number, "comment": string }
            ],
            "strengths": string[],
            "areasForImprovement": string[],
            "finalAssessment": string
          }
          `,
        },
        {
          role: "user",
          content: `Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const object = JSON.parse(completion.choices[0]?.message?.content || "{}");

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getAppUserFeedback(userId: string): Promise<Feedback[]> {
  if (!userId) return [];

  const feedbackSnapshot = await db
    .collection("feedback")
    .where("userId", "==", userId)
    .get();

  return feedbackSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Feedback[];
}

export async function getAllInterviews(): Promise<Interview[]> {
  // Fetch all finalized interviews, sorted by creation date
  // Note: This matches the logic of getLatestInterviews but without filtering by user
  try {
    const allInterviews = await db
      .collection("interviews")
      .where("finalized", "==", true)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    return allInterviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error: any) {
    console.error("Error fetching all interviews:", error);

    // Fallback for missing index
    if (
      error.code === 9 ||
      error.message?.includes("index") ||
      error.message?.includes("FAILED_PRECONDITION")
    ) {
      const allInterviews = await db
        .collection("interviews")
        .where("finalized", "==", true)
        .limit(100)
        .get();

      return allInterviews.docs
        .sort((a, b) => {
          const aDate = a.data().createdAt || "";
          const bDate = b.data().createdAt || "";
          return bDate.localeCompare(aDate);
        })
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Interview[];
    }
    return [];
  }
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  // Use fallback approach directly to avoid index requirement
  // This works by fetching all finalized interviews and filtering client-side
  try {
    // Get all finalized interviews, filter out current user's, then sort
    const allInterviews = await db
      .collection("interviews")
      .where("finalized", "==", true)
      .orderBy("createdAt", "desc")
      .limit(100) // Get more to ensure we have enough after filtering
      .get();

    // Filter out current user's interviews and limit
    const filteredInterviews = allInterviews.docs
      .filter((doc) => {
        const data = doc.data();
        return data.userId !== userId;
      })
      .slice(0, limit)
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Interview[];

    return filteredInterviews;
  } catch (error: any) {
    console.error("Error fetching latest interviews:", error);
    
    // If the error is about missing index on orderBy, try without orderBy
    if (error.code === 9 || error.message?.includes("index") || error.message?.includes("FAILED_PRECONDITION")) {
      try {
        console.warn("Index required for orderBy. Fetching without sorting.");
        const allInterviews = await db
          .collection("interviews")
          .where("finalized", "==", true)
          .limit(100)
          .get();

        const filteredInterviews = allInterviews.docs
          .filter((doc) => {
            const data = doc.data();
            return data.userId !== userId;
          })
          .sort((a, b) => {
            // Sort by createdAt in memory
            const aDate = a.data().createdAt || "";
            const bDate = b.data().createdAt || "";
            return bDate.localeCompare(aDate); // Descending
          })
          .slice(0, limit)
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Interview[];

        return filteredInterviews;
      } catch (fallbackError: any) {
        console.error("Error in fallback query:", fallbackError);
        return [];
      }
    }
    
    return [];
  }
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  if (!userId) return [];

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function createInterview(params: {
  userId: string;
  transcript: { role: string; content: string }[];
}) {
  const { userId, transcript } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert interviewer. You just conducted a conversation to gather requirements for a mock interview. 
          Extract the interview details from the transcript.
          
          Return the response in the following JSON format:
          {
            "role": string, // e.g., "Frontend Developer"
            "techstack": string[], // e.g., ["React", "TypeScript"]
            "level": string, // e.g., "Junior", "Senior", "Mid-level"
            "type": string, // e.g., "Technical", "Behavioral", "System Design"
            "questions": string[], // The list of questions generated or discussed for the interview
            "isValid": boolean // true if the user provided sufficient context/subject, false if conversation was empty, just greetings, or lacked substance.
          }

          If specific details weren't explicitly mentioned, infer reasonable defaults based on the context.
          However, if the conversation implies the user did not actually set up an interview or just ended the call, set "isValid" to false.
          `,
        },
        {
          role: "user",
          content: `Transcript:
        ${formattedTranscript}
        
        Extract the interview configuration.
        `,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const object = JSON.parse(completion.choices[0]?.message?.content || "{}");
    
    // Check if the interview is valid based on context
    if (object.isValid === false) {
      console.log("Interview context invalid, not saving.");
      return { success: false };
    }

    const role = object.role || "General Interview";

    // Generate Pollinations URL
    const pollinationsUrl = `https://image.pollinations.ai/prompt/minimalist%203d%20icon%20of%20${encodeURIComponent(
      role
    )}%20${encodeURIComponent(
      (object.techstack || []).join(" ")
    )}%20programming%20technology%20logo%20dark%20theme?nologo=true`;

    // Generate ID first so it can be used for storage path
    const interviewRef = db.collection("interviews").doc();
    const interviewId = interviewRef.id;
    const storagePath = `covers/${interviewId}.png`;
    const coverImage = await uploadImageToStorage(pollinationsUrl, storagePath);

    const interview = {
      userId: userId,
      role: role.toLowerCase(),
      techstack: (object.techstack || []).map((t: string) => t.toLowerCase()),
      level: (object.level || "Mid-level").toLowerCase(),
      type: (object.type || "Technical").toLowerCase(),
      questions: object.questions || [],
      transcript: transcript,
      coverImage: coverImage, 
      finalized: true,
      createdAt: new Date().toISOString(),
    };

    await interviewRef.set(interview);

    return { success: true, interviewId: interviewRef.id };
  } catch (error) {
    console.error("Error creating interview:", error);
    return { success: false };
  }
}

export async function deleteInterview(params: {
  interviewId: string;
  userId: string;
}) {
  const { interviewId, userId } = params;

  try {
    // First, verify the interview exists and belongs to the user
    const interviewDoc = await db.collection("interviews").doc(interviewId).get();
    
    if (!interviewDoc.exists) {
      return { success: false, error: "Interview not found" };
    }

    const interviewData = interviewDoc.data();
    if (interviewData?.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete the interview
    await db.collection("interviews").doc(interviewId).delete();

    // Optionally delete associated feedback
    const feedbackSnapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .get();

    const deletePromises = feedbackSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);

    return { success: true };
  } catch (error) {
    console.error("Error deleting interview:", error);
    return { success: false, error: "Failed to delete interview" };
  }
}
