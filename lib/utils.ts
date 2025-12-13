import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    return {
      tech,
      url: `https://image.pollinations.ai/prompt/minimalist%203d%20icon%20of%20${encodeURIComponent(
        tech
      )}%20logo%20dark%20theme?nologo=true&width=100&height=100`,
    };
  });

  return Promise.resolve(logoURLs);
};

// Simple hash function to convert string to number
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

export const getRandomInterviewCover = (seed?: string) => {
  // If no seed provided, use a default (shouldn't happen in production)
  const seedValue = seed || "default";
  const index = hashString(seedValue) % interviewCovers.length;
  return `/covers${interviewCovers[index]}`;
};
