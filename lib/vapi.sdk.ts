"use client";

import Vapi from "@vapi-ai/web";

// Lazy initialization to ensure browser APIs are available
let vapiInstance: Vapi | null = null;

export function getVapiInstance(): Vapi {
  // Only initialize on client side
  if (typeof window === "undefined") {
    throw new Error("Vapi can only be used on the client side");
  }

  // Check if mediaDevices is available
  if (!navigator?.mediaDevices) {
    throw new Error("Media devices API is not available. Please use HTTPS or localhost.");
  }

  if (!vapiInstance) {
    const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
    if (!token) {
      throw new Error("NEXT_PUBLIC_VAPI_WEB_TOKEN is not defined");
    }
    vapiInstance = new Vapi(token);
  }

  return vapiInstance;
}

// Export a getter that initializes on first access
export const vapi = new Proxy({} as Vapi, {
  get(_target, prop) {
    try {
      const instance = getVapiInstance();
      const value = instance[prop as keyof Vapi];
      
      // If it's a function, bind it to the instance
      if (typeof value === "function") {
        return value.bind(instance);
      }
      
      return value;
    } catch (error) {
      // Return a no-op function for server-side rendering
      if (typeof window === "undefined") {
        return () => {};
      }
      throw error;
    }
  },
});
