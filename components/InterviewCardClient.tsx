"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";
import DeleteButton from "./DeleteButton";
import { cn, getRandomInterviewCover } from "@/lib/utils";

dayjs.extend(utc);

interface InterviewCardClientProps {
  interviewId: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt: any;
  coverImage?: string;
  feedback?: any;
  onDelete?: () => void;
}

export const InterviewCardClient = ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
  coverImage,
  feedback,
  onDelete,
}: InterviewCardClientProps) => {
  const [isDeleted, setIsDeleted] = useState(false);

  if (isDeleted) return null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
      }[normalizedType] || "bg-light-600";

  const dateToFormat = feedback?.createdAt || createdAt;
  const formattedDate = dateToFormat
    ? dayjs.utc(dateToFormat).format("MMM D, YYYY")
    : "No date";

  return (
    <div className="group relative w-full h-[420px] rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent hover:from-neon-cyan/50 hover:to-neon-cyan/10 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,243,255,0.15)] animate-in fade-in zoom-in-95 duration-300">
      <div className="w-full h-full bg-black/40 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between border border-white/5 relative overflow-hidden group-hover:bg-black/60 transition-colors">
        {/* Hover Glow Effect Background */}
        <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div>
          <div className="flex justify-between items-start">
            {/* Cover Image with Glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-neon-cyan/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image
                src={coverImage || getRandomInterviewCover(interviewId || role)}
                alt="cover-image"
                width={80}
                height={80}
                className="rounded-full object-cover size-20 relative z-10 border-2 border-white/10 group-hover:border-neon-cyan/50 transition-colors"
                priority
              />
            </div>

            <div className="flex flex-col items-end gap-2">
              {/* Type Badge */}
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border border-white/10 backdrop-blur-sm",
                  badgeColor,
                  "text-white bg-opacity-80"
                )}
              >
                {normalizedType}
              </div>
              {/* Delete Button */}
              {userId && interviewId && (
                <DeleteButton 
                    interviewId={interviewId} 
                    userId={userId} 
                    onDelete={() => {
                        setIsDeleted(true);
                        if (onDelete) onDelete();
                    }}
                />
              )}
            </div>
          </div>

          {/* Interview Role */}
          <h3 className="mt-6 text-2xl font-bold text-white group-hover:text-neon-cyan transition-colors capitalize truncate">
            {role}{" "}
            <span className="text-gray-400 font-normal text-lg">Interview</span>
          </h3>

          {/* Date & Score */}
          <div className="flex flex-row gap-5 mt-4 text-gray-400 text-sm">
            <div className="flex flex-row gap-2 items-center">
              <Image
                src="/calendar.svg"
                width={18}
                height={18}
                alt="calendar"
                className="opacity-70"
              />
              <p>{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Image
                src="/star.svg"
                width={18}
                height={18}
                alt="star"
                className="opacity-70"
              />
              <p
                className={cn(
                  feedback?.totalScore ? "text-neon-cyan font-bold" : ""
                )}
              >
                {feedback?.totalScore || "---"}
                <span className="text-gray-500 font-normal">/100</span>
              </p>
            </div>
          </div>

          {/* Feedback or Placeholder Text */}
          <p className="line-clamp-2 mt-4 text-gray-300 text-sm h-10">
            {feedback?.finalAssessment ||
              "You haven't taken this interview yet. Take it now to improve your skills."}
          </p>
        </div>

        <div className="flex flex-row justify-between items-end mt-4 pt-4 border-t border-white/5">
          <DisplayTechIcons
            techStack={techstack}
            className="size-9 opacity-80 group-hover:opacity-100 transition-opacity"
          />

          <Button className="z-20" variant="neon" size="sm" asChild>
            <Link
              href={
                feedback
                  ? `/interview/${interviewId}/feedback`
                  : `/interview/${interviewId}`
              }
            >
              {feedback ? "View Feedback" : "Start Now"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
