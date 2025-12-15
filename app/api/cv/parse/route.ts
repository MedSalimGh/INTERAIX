import { NextRequest, NextResponse } from "next/server";
import { db as adminDb } from "@/firebase/admin";
import mammoth from "mammoth";
import Groq from "groq-sdk";

// @ts-ignore
const PDFParser = require("pdf2json");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Helper to parse PDF buffer
function parsePdfBuffer(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1); // 1 = text only

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      reject(new Error(errData.parserError));
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      // Extract text from the JSON structure
      // pdf2json returns raw text content in a specific format
      // We often need to reduce it to a string.
      // simpler way: use getRawTextContent() if available or map the pages
      
      const text = pdfParser.getRawTextContent();
      resolve(text);
    });

    try {
        pdfParser.parseBuffer(buffer);
    } catch (e) {
        reject(e);
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "File and userId are required" },
        { status: 400 }
      );
    }

    // 1. Extract text based on file type
    let text = "";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`Processing file: ${file.name} (${file.type})`);

    if (file.type === "application/pdf") {
      try {
        text = await parsePdfBuffer(buffer);
        console.log("PDF parsed successfully. Text length:", text.length);
      } catch (pdfError: any) {
        console.error("Error parsing PDF:", pdfError);
        throw new Error(`Failed to parse PDF: ${pdfError.message || "Unknown error"}`);
      }
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
        console.log("DOCX parsed successfully. Text length:", text.length);
      } catch (docxError) {
        console.error("Error parsing DOCX:", docxError);
        throw new Error("Failed to parse DOCX file content");
      }
    } else if (file.type === "text/plain") {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    // 2. Send text to Groq AI for analysis
    console.log("Sending text to Groq AI...");
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert recruiter and technical interviewer. Extract the following information from the CV text:
          - Candidate Name
          - Primary Language (en or fr) - detect from text
          - Target Role (e.g., Frontend Developer, DevOps Engineer)
          - Tech Stack (list of key technologies)
          - Seniority Level (Junior, Mid, Senior)
          - Interview Type (Technical, Behavioral, System Design)
          - Summary/Context (a brief 2-3 sentence summary of the candidate's background)
          
          Also generate 5 relevant initial interview questions.
          
          Return response in JSON format:
          {
            "name": "string",
            "language": "en" | "fr",
            "role": "string",
            "techstack": ["string"],
            "level": "string",
            "type": "string",
            "questions": ["string"],
            "cvContext": "string"
          }`,
        },
        {
          role: "user",
          content: `CV Content:\n${text.substring(0, 15000)}`, // Limit context window
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(completion.choices[0]?.message?.content || "{}");

    // 3. Store CV metadata in Firestore (users/{userId}/cvs)
    console.log(`Saving CV for user ${userId} to Firestore...`);
    const cvRef = adminDb.collection("users").doc(userId).collection("cvs").doc();
    
    await cvRef.set({
      userId,
      fileName: file.name,
      fileType: file.type,
      extractedText: text,
      analysis,
      uploadedAt: new Date().toISOString(),
    });
    console.log("CV saved successfully with ID:", cvRef.id);

    return NextResponse.json({
      success: true,
      cvId: cvRef.id,
      analysis,
    });
  } catch (error: any) {
    console.error("Error processing CV in /api/cv/parse:", error);
    return NextResponse.json(
      { error: `Failed to process CV: ${error.message}` },
      { status: 500 }
    );
  }
}
