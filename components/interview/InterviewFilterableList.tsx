"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Code2, FileText, Bot, Layers, X, ChevronDown } from "lucide-react";

import { InterviewCardClient } from "@/components/InterviewCardClient"; // Direct client import
import { Interview, Feedback } from "@/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InterviewFilterableListProps {
  interviews: any[]; 
  userId: string;
  feedbacks: Feedback[];
}

export const InterviewFilterableList = ({ interviews, userId, feedbacks }: InterviewFilterableListProps) => {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<"all" | "cv" | "standard">("all");
  const [type, setType] = useState<"all" | "technical" | "behavioral" | "mixed">("all");
  const [stackFilter, setStackFilter] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  // Derive unique tech stacks for suggestion (optional, but keep simple for now)
  
  const filteredInterviews = interviews
    .filter((interview) => !deletedIds.includes(interview.id)) // Exclude deleted
    .filter((interview) => {
    // 1. Search (Role/Title)
    const matchesSearch = interview.role.toLowerCase().includes(search.toLowerCase());

    // 2. Source (CV vs Standard)
    let matchesSource = true;
    if (source === "cv") matchesSource = interview.generatedFrom === "cv";
    if (source === "standard") matchesSource = !interview.generatedFrom; // Standard doesn't have the field or it's null

    // 3. Type
    let matchesType = true;
    if (type !== "all") {
        matchesType = interview.type.toLowerCase() === type.toLowerCase();
    }

    // 4. Tech Stack
    let matchesStack = true;
    if (stackFilter) {
        matchesStack = interview.techstack.some((t: string) => 
            t.toLowerCase().includes(stackFilter.toLowerCase())
        );
    }

    return matchesSearch && matchesSource && matchesType && matchesStack;
  });

  const handleDelete = (id: string) => {
      setDeletedIds(prev => [...prev, id]);
  };

  const clearFilters = () => {
    setSearch("");
    setSource("all");
    setType("all");
    setStackFilter("");
  };

  const hasActiveFilters = search || source !== "all" || type !== "all" || stackFilter;

  return (
    <div className="space-y-8">
      {/* Filter Bar */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-4">
          
          {/* Top Row: Search & Toggles */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-neon-cyan transition-colors" />
              <Input
                placeholder="Search interviews by role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-neon-cyan/50 focus:bg-white/10 focus:ring-neon-cyan/20 transition-all rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
               {/* Source Filter Tabs */}
               <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                  <button
                    onClick={() => setSource("all")}
                    className={cn(
                        "px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all",
                        source === "all" ? "bg-neon-cyan/20 text-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.2)]" : "text-gray-400 hover:text-white"
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSource("cv")}
                    className={cn(
                        "px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-2",
                        source === "cv" ? "bg-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]" : "text-gray-400 hover:text-white"
                    )}
                  >
                    <FileText className="w-3 h-3" />
                    CV
                  </button>
                  <button
                    onClick={() => setSource("standard")}
                    className={cn(
                        "px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-2",
                        source === "standard" ? "bg-blue-500/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]" : "text-gray-400 hover:text-white"
                    )}
                  >
                    <Bot className="w-3 h-3" />
                    Gen
                  </button>
               </div>
               
               <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "md:hidden p-2 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white transition-colors",
                    isExpanded && "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30"
                )}
               >
                 <Filter className="w-4 h-4" />
               </button>
            </div>
          </div>

          {/* Expanded Filters (Always visible on Desktop, togglable on mobile) */}
          <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", isExpanded ? "block" : "hidden md:grid")}>
             {/* Type Filter */}
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-2">
                    <Layers className="w-3 h-3" />
                    Interview Type
                </label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-white focus:ring-neon-cyan/20 rounded-xl">
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl text-white">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tech Stack Filter */}
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-2">
                    <Code2 className="w-3 h-3" />
                    Tech Stack
                </label>
                <div className="relative group">
                    <Input 
                        placeholder="e.g. React, Python..." 
                        value={stackFilter}
                        onChange={(e) => setStackFilter(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-neon-cyan/50 focus:bg-white/10 focus:ring-neon-cyan/20 transition-all rounded-xl"
                    />
                     <Code2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-neon-cyan transition-colors pointer-events-none" />
                </div>
            </div>

            {/* Active Filter Summary / Clear */}
            <div className="flex items-end justify-end">
                {hasActiveFilters && (
                    <button 
                        onClick={clearFilters}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
                    >
                        <X className="w-3 h-3" />
                        Clear Filters
                    </button>
                )}
            </div>
          </div>

        </div>
      </div>

      {/* Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 min-h-[200px]"
      >
        <AnimatePresence>
            {filteredInterviews.length > 0 ? (
                filteredInterviews.map((interview) => {
                    // Find feedback for this interview
                    const feedback = feedbacks.find(f => f.interviewId === interview.id);
                    return (
                        <motion.div
                            key={interview.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <InterviewCardClient
                                userId={userId}
                                interviewId={interview.id}
                                role={interview.role}
                                type={interview.type}
                                techstack={interview.techstack}
                                createdAt={interview.createdAt}
                                coverImage={interview.coverImage}
                                feedback={feedback || null} // Pass feedback or null (synchronous)
                                onDelete={() => handleDelete(interview.id)}
                            />
                        </motion.div>
                )})
            ) : (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="col-span-full flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/5"
                >
                    <Filter className="w-12 h-12 text-gray-600 mb-4" />
                    <p className="text-gray-400 font-medium">No interviews match your filters.</p>
                    <button onClick={clearFilters} className="text-neon-cyan text-sm mt-2 hover:underline">
                        Clear all filters
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
