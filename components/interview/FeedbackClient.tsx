"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { CheckCircle2, AlertTriangle, Sparkles, ChevronRight, Share2, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Confetti from "react-confetti";

dayjs.extend(utc);

interface FeedbackClientProps {
  feedback: any;
  interview: any;
  interviewId: string;
}

const ScoreRing = ({ score }: { score: number }) => {
    const circumference = 2 * Math.PI * 40; // radius 40
    const offset = circumference - (score / 100) * circumference;
    
    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Background Ring */}
            <svg className="absolute w-full h-full rotate-[-90deg]">
                <circle
                    cx="64"
                    cy="64"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/10"
                />
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    cx="64"
                    cy="64"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    className="text-neon-cyan drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]"
                    strokeLinecap="round"
                />
            </svg>
            <div className="flex flex-col items-center">
                <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, type: "spring" }}
                    className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                >
                    {score}
                </motion.span>
                <span className="text-xs text-gray-400 uppercase tracking-widest">Score</span>
            </div>
        </div>
    )
}

const CategoryBar = ({ label, score, index }: { label: string, score: number, index: number }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + (index * 0.1) }}
            className="space-y-2"
        >
            <div className="flex justify-between text-sm">
                <span className="text-gray-300 font-medium">{label}</span>
                <span className="text-neon-cyan font-bold">{score}/100</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay: 0.8 + (index * 0.1), ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.5)]"
                />
            </div>
        </motion.div>
    )
}

export const FeedbackClient = ({ feedback, interview, interviewId }: FeedbackClientProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (feedback?.totalScore && feedback.totalScore >= 70) {
        setShowConfetti(true);
        // Stop confetti after 5 seconds
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }
  }, [feedback]);

  if (!feedback) return null;

  return (
    <div className="relative min-h-screen py-10 overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}

      <div className="container mx-auto max-w-5xl px-4 relative z-10 space-y-8">
        
        {/* Header Section */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-6 items-center justify-between"
        >
            <div>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 text-neon-cyan mb-2"
                >
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-bold tracking-widest uppercase">Interview Analysis</span>
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    <span className="capitalize">{interview.role}</span> <span className="text-gray-500">Feedback</span>
                </h1>
                <p className="text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {dayjs.utc(feedback.createdAt).format("MMMM D, YYYY • h:mm A")}
                </p>
            </div>

            <div className="flex gap-4">
                 <Button variant="outline" className="border-white/10 hover:bg-white/5 text-gray-300 gap-2">
                    <Share2 className="w-4 h-4" /> Share
                 </Button>
                 <Button asChild variant="neon" className="gap-2">
                    <Link href={`/interview/${interviewId}`}>
                         Retake Interview <ChevronRight className="w-4 h-4" />
                    </Link>
                 </Button>
            </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Score & Summary */}
            <div className="lg:col-span-1 space-y-6">
                 {/* Score Card */}
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(0,0,0,0.3)] relative overflow-hidden group"
                 >
                    <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <ScoreRing score={feedback.totalScore} />
                    
                    <div className="mt-6 space-y-2 relative z-10">
                        <h3 className="text-xl font-bold text-white">Overall Score</h3>
                        <p className="text-sm text-gray-400">
                           {feedback.totalScore >= 70 ? "Excellent work! You're clearly prepared." : "Good effort! A bit more practice will get you there."}
                        </p>
                    </div>
                 </motion.div>

                 {/* Breakdown Mini-Chart */}
                 <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                 >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        Performance Breakdown
                    </h3>
                    <div className="space-y-4">
                        {feedback.categoryScores?.map((cat: any, i: number) => (
                            <CategoryBar key={i} label={cat.name} score={cat.score} index={i} />
                        ))}
                    </div>
                 </motion.div>
            </div>

            {/* Right Column: Detailed Assessment */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Executive Summary */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.3)] relative overflow-hidden"
                >
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-neon-cyan to-purple-500" />
                    <h3 className="text-xl font-bold text-white mb-4">Executive Summary</h3>
                    <p className="text-gray-300 leading-relaxed text-lg">
                        {feedback.finalAssessment}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-green-500/5 backdrop-blur-xl border border-green-500/20 rounded-3xl p-6"
                    >
                         <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" /> Key Strengths
                         </h3>
                         <ul className="space-y-3">
                            {feedback.strengths?.map((item: string, i: number) => (
                                <motion.li 
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + (i * 0.1) }}
                                    className="flex items-start gap-3 text-gray-300 text-sm"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                    {item}
                                </motion.li>
                            ))}
                         </ul>
                    </motion.div>

                    {/* Improvements */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-3xl p-6"
                    >
                         <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Area for Improvement
                         </h3>
                         <ul className="space-y-3">
                            {feedback.areasForImprovement?.map((item: string, i: number) => (
                                <motion.li 
                                    key={i}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.0 + (i * 0.1) }}
                                    className="flex items-start gap-3 text-gray-300 text-sm"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                    {item}
                                </motion.li>
                            ))}
                         </ul>
                    </motion.div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};
