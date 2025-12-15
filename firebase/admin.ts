import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  const apps = getApps();
  let app;

  if (!apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Validate required environment variables
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Missing Firebase Admin credentials. Please check your .env.local file has FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY set."
      );
    }

    // Handle private key formatting
    // Replace escaped newlines with actual newlines
    privateKey = privateKey
      .replace(/\\n/g, "\n") // Replace \n with actual newlines
      .replace(/"/g, ""); // Remove any quotes

    // Ensure the private key starts and ends correctly
    if (!privateKey.includes("BEGIN PRIVATE KEY")) {
      // If the key doesn't have the full format, it might be malformed
      console.warn("Private key format might be incorrect");
    }

    // Fallback logic for bucket name
    let storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.replace("gs://", "");
    
    if (!storageBucket || storageBucket === "undefined") {
      // Default to standard Firebase bucket name format
      storageBucket = `${projectId}.appspot.com`;
      console.log(`No explicit bucket env var found. Defaulting to: ${storageBucket}`);
    }

    console.log("---------------------------------------------------");
    console.log("FIREBASE ADMIN INIT DEBUG");
    console.log("Using Storage Bucket:", storageBucket);
    console.log("---------------------------------------------------");

    try {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: storageBucket,
      });
    } catch (error: any) {
      console.error("Firebase Admin initialization error:", error);
      throw new Error(
        `Failed to initialize Firebase Admin: ${error.message}. Please check your FIREBASE_PRIVATE_KEY format in .env.local`
      );
    }
  } else {
    app = apps[0]; // If already initialized, use the existing app
  }

  return {
    auth: getAuth(app),
    db: getFirestore(app),
    storage: getStorage(app),
  };
}

export const { auth, db, storage } = initFirebaseAdmin();
