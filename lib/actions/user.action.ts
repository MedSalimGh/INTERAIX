"use server";

import { db } from "@/firebase/admin";

export async function updateUserProfile(
  userId: string,
  data: UpdateUserProfileParams
) {
  try {
    // Remove undefined values
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    await db.collection("users").doc(userId).update(updateData);

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      message: "Failed to update profile. Please try again.",
    };
  }
}

export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    
    if (!userDoc.exists) return null;

    return {
      ...userDoc.data(),
      id: userDoc.id,
    } as User;
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function uploadProfilePicture(
  userId: string,
  fileData: string,
  fileName: string
) {
  try {
    // ALTERNATIVE STRATEGY: Store as Base64 directly in Firestore
    // This bypasses the "bucket not found" Cloud Storage errors entirely.
    // Since we limit file size to 5MB, this is acceptable for profile pictures.
    
    // The fileData is already a data URL (e.g., "data:image/jpeg;base64,...")
    // We just save this string as the profilePictureURL
    
    await db.collection("users").doc(userId).update({
      profilePictureURL: fileData
    });

    return {
      success: true,
      url: fileData,
    };
  } catch (error: any) {
    console.error("Error saving profile picture:", error);
    return {
      success: false,
      message: "Failed to save profile picture",
    };
  }
}
