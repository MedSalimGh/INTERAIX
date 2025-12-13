"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Set session cookie
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  try {
    // Create session cookie - expiresIn should be in milliseconds
    // Max 14 days (1209600000 ms)
    const expiresInMs = SESSION_DURATION * 1000; // Convert seconds to milliseconds
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: expiresInMs,
    });

    // Set cookie in the browser
    cookieStore.set("session", sessionCookie, {
      maxAge: SESSION_DURATION,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
  } catch (error: any) {
    console.error("Error in setSessionCookie:", error);
    throw error;
  }
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    // check if user exists in db
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };

    // save user to db
    await db.collection("users").doc(uid).set({
      name,
      email,
      // profileURL,
      // resumeURL,
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle Firebase specific errors
    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    // Verify the user exists in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (authError: any) {
      if (authError.code === "auth/user-not-found") {
        return {
          success: false,
          message: "User does not exist. Please create an account.",
        };
      }
      throw authError;
    }

    // Verify the user exists in the database
    const userDoc = await db.collection("users").doc(userRecord.uid).get();
    if (!userDoc.exists) {
      // If user exists in Auth but not in DB, create the DB record
      // This can happen if sign-up was incomplete
      try {
        await db.collection("users").doc(userRecord.uid).set({
          name: userRecord.displayName || userRecord.email?.split("@")[0] || "User",
          email: userRecord.email || email,
        });
      } catch (dbError: any) {
        console.error("Error creating user in database:", dbError);
        return {
          success: false,
          message: "User account not properly set up. Please try signing up again.",
        };
      }
    }

    // Create session cookie
    try {
      await setSessionCookie(idToken);
    } catch (cookieError: any) {
      console.error("Error setting session cookie:", cookieError);
      return {
        success: false,
        message: "Failed to create session. Please try again.",
      };
    }
    
    return {
      success: true,
      message: "Signed in successfully.",
    };
  } catch (error: any) {
    console.error("Error signing in:", error);
    console.error("Error code:", error?.code);
    console.error("Error message:", error?.message);

    // Handle specific Firebase errors
    if (error?.code === "auth/user-not-found") {
      return {
        success: false,
        message: "User does not exist. Please create an account.",
      };
    }

    if (error?.code === "auth/invalid-credential") {
      return {
        success: false,
        message: "Invalid credentials. Please check your email and password.",
      };
    }

    return {
      success: false,
      message: `Failed to log into account: ${error?.message || "Unknown error"}`,
    };
  }
}

// Sign out user by clearing the session cookie
export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.delete("session");
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // get user info from db
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log(error);

    // Invalid or expired session
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
