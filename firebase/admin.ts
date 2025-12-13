import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  const apps = getApps();

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

    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: `${projectId}.firebasestorage.app`, // Infer bucket name from project ID
      });
    } catch (error: any) {
      console.error("Firebase Admin initialization error:", error);
      throw new Error(
        `Failed to initialize Firebase Admin: ${error.message}. Please check your FIREBASE_PRIVATE_KEY format in .env.local`
      );
    }
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
    storage: getStorage(),
  };
}

export const { auth, db, storage } = initFirebaseAdmin();
