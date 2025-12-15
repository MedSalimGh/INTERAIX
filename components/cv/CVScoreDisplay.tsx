"use client";

import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Lightbulb, User, FileText, Check, Sparkles } from "lucide-react";

interface CVScoreDisplayProps {
  rating: {
    scores: {
      overall: number;
      content: number;
      skills: number;
      experience: number;
      formatting: number;
    };
    ats: {
      score: number;
      issues: string[];
      tips: string[];
    };
    skillsGap: {
      targetRole: string;
      missingSkills: string[];
      recommendations: string[];
    };
    feedback: {
      strengths: string[];
      improvements: string[];
    };
  };
}

export function CVScoreDisplay({ rating }: CVScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "#4ade80"; // green-400
    if (score >= 60) return "#facc15"; // yellow-400
    return "#f87171"; // red-400
  };

  // Helper for circular progress
  const CircleProgress = ({ score, label, size = 120, icon }: { score: number; label: string; size?: number; icon?: React.ReactNode }) => {
    const radius = size / 2 - 10;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = getProgressColor(score);

    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative" style={{ width: size, height: size }}>
          {/* Background Circle */}
          <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
          
          <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="6"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={color}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</span>
            {icon && <div className="mt-1 opacity-50">{icon}</div>}
          </div>
        </div>
        <span className="text-gray-300 text-sm font-semibold tracking-wide uppercase">{label}</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mt-12 space-y-8"
    >
        {/* Main Score Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overall Score with Premium Effect */}
            <div className="lg:col-span-1 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-neon-cyan via-white/10 to-neon-purple/50 rounded-2xl opacity-50 blur-md"></div>
                <Card className="relative bg-black h-full border-white/10 flex flex-col items-center justify-center py-8 bg-[url('/grid.svg')] bg-center bg-cover">
                    <CardHeader className="text-center pb-2 pt-0">
                        <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Total Score</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center pb-0">
                        <CircleProgress score={rating.scores.overall} label="Overall Match" size={180} />
                    </CardContent>
                </Card>
            </div>

            {/* Sub-Scores */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                 {[
                     { label: "Content", score: rating.scores.content, icon: <FileText className="w-4 h-4" /> },
                     { label: "Skills", score: rating.scores.skills, icon: <CheckCircle2 className="w-4 h-4" /> },
                     { label: "Experience", score: rating.scores.experience, icon: <User className="w-4 h-4" /> },
                     { label: "Format", score: rating.scores.formatting, icon: <Sparkles className="w-4 h-4" /> },
                 ].map((item, i) => (
                    <Card key={i} className="bg-white/5 border-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center p-4 backdrop-blur-sm">
                        <CircleProgress score={item.score} label={item.label} size={90} icon={item.icon} />
                    </Card>
                 ))}
            </div>
        </div>

      {/* Tabs Section */}
      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-white/10 p-1.5 h-16 rounded-xl backdrop-blur-md">
          <TabsTrigger value="feedback" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan data-[state=active]:border-neon-cyan/30 border border-transparent rounded-lg text-base font-medium transition-all">
             Feedback & Tips
          </TabsTrigger>
          <TabsTrigger value="ats" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple data-[state=active]:border-neon-purple/30 border border-transparent rounded-lg text-base font-medium transition-all">
             ATS Analysis
          </TabsTrigger>
          <TabsTrigger value="skills" className="data-[state=active]:bg-green-500/10 data-[state=active]:text-green-400 data-[state=active]:border-green-500/20 border border-transparent rounded-lg text-base font-medium transition-all">
             Skills Gap
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="feedback" className="space-y-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/40 border-green-500/20 backdrop-blur-md overflow-hidden relative">
               <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-3 text-xl">
                  <div className="p-2 bg-green-500/10 rounded-lg"><CheckCircle2 className="w-6 h-6" /></div>
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {rating.feedback.strengths.map((item, i) => (
                    <li key={i} className="text-gray-200 text-base flex gap-4 items-start p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                      <span className="text-green-500 mt-1"><Check className="w-4 h-4" /></span> {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 border-yellow-500/20 backdrop-blur-md overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-3 text-xl">
                  <div className="p-2 bg-yellow-500/10 rounded-lg"><Lightbulb className="w-6 h-6" /></div>
                  Improvements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {rating.feedback.improvements.map((item, i) => (
                    <li key={i} className="text-gray-200 text-base flex gap-4 items-start p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                       <span className="text-yellow-500 mt-1"><AlertTriangle className="w-4 h-4" /></span> {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ats" className="space-y-6 mt-8">
          <Card className="bg-black/40 border-white/10 backdrop-blur-md relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/5 blur-3xl rounded-full -mr-32 -mt-32"></div>
            <CardHeader className="flex flex-row items-center justify-between relative z-10">
              <div>
                <CardTitle className="text-2xl text-white">ATS Compatibility</CardTitle>
                <CardDescription className="text-gray-400 text-base mt-1">Optimization level for tracking systems</CardDescription>
              </div>
              <div className={`text-5xl font-bold ${getScoreColor(rating.ats.score)} drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                {rating.ats.score}/100
              </div>
            </CardHeader>
            <CardContent className="space-y-8 relative z-10">
              <div>
                <h4 className="text-red-400 font-semibold text-lg mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Critical Issues
                </h4>
                <ul className="grid gap-3">
                   {rating.ats.issues.map((issue, i) => (
                     <li key={i} className="flex items-start gap-3 text-gray-200 text-base bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                       <span className="text-red-500 mt-1">✕</span> {issue}
                     </li>
                   ))}
                </ul>
              </div>
              <div>
                <h4 className="text-blue-400 font-semibold text-lg mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" /> Quick Fixes
                </h4>
                <ul className="grid gap-3">
                   {rating.ats.tips.map((tip, i) => (
                     <li key={i} className="flex items-start gap-3 text-gray-200 text-base bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                       <span className="text-blue-500 mt-1">→</span> {tip}
                     </li>
                   ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6 mt-8">
          <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader className="border-b border-white/5 pb-6">
              <CardTitle className="text-neon-cyan text-2xl flex items-center gap-2">
                 <Sparkles className="w-6 h-6" />
                Gap Analysis: <span className="text-white">{rating.skillsGap.targetRole}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              <div>
                <h4 className="text-red-400 font-semibold text-lg mb-4">Missing Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {rating.skillsGap.missingSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-sm text-red-200 font-medium">
                      {skill}
                    </span>
                  ))}
                  {rating.skillsGap.missingSkills.length === 0 && (
                    <span className="text-gray-400 text-base italic">None detected - Great job!</span>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-green-400 font-semibold text-lg mb-4">Recommendations</h4>
                <ul className="space-y-3">
                  {rating.skillsGap.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-200 text-base">
                      <span className="text-green-500 mt-1">✓</span> {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
