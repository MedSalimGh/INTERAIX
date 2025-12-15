"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer, voiceIds } from "@/constants";
import { createFeedback, createInterview } from "@/lib/actions/general.action";
import { db } from "@/firebase/client"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  profilePictureURL,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  
  // Animation States
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  // Configuration States
  const [difficulty, setDifficulty] = useState([50]); // 0-100
  const [topic, setTopic] = useState("General");
  const [persona, setPersona] = useState("Professional");

  // Ensure component is mounted and browser APIs are available
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only initialize Vapi after component is mounted
    if (!isMounted || typeof window === "undefined") return;

    if (!navigator?.mediaDevices) {
      console.error("Media devices API is not available. Please use HTTPS or localhost.");
      return;
    }

    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      setIsUserSpeaking(false);
      setIsAiSpeaking(false);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript") {
         // Broaden AI check: Any role that is NOT user and NOT system is considered AI (assistant, model, tool, etc.)
         const isAi = message.role !== "user" && message.role !== "system";
         
         if (message.transcriptType === "final") {
            const newMessage = { role: message.role, content: message.transcript };
            setMessages((prev) => [...prev, newMessage]);
            
            // If final transcript received, turn off AI
            if (isAi) setIsAiSpeaking(false);
         } else {
            // Partial transcript implies speaking
            if (isAi) {
                setIsAiSpeaking(true);
                // We removed the strict 'setIsUserSpeaking(false)' here to allow user interruptions.
            }
         }
      }
    };

    const onSpeechStart = () => {
      // User started speaking
      setIsUserSpeaking(true);
      // STRICT MODE: If User is speaking, AI is NOT. (Handles interruptions)
      setIsAiSpeaking(false);
    };

    const onSpeechEnd = () => {
      // User stopped speaking
      setIsUserSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    try {
      vapi.on("call-start", onCallStart);
      vapi.on("call-end", onCallEnd);
      vapi.on("message", onMessage);
      vapi.on("speech-start", onSpeechStart);
      vapi.on("speech-end", onSpeechEnd);
      vapi.on("error", onError);

      return () => {
        try {
          vapi.off("call-start", onCallStart);
          vapi.off("call-end", onCallEnd);
          vapi.off("message", onMessage);
          vapi.off("speech-start", onSpeechStart);
          vapi.off("speech-end", onSpeechEnd);
          vapi.off("error", onError);
        } catch (error) {
          console.error("Error cleaning up Vapi listeners:", error);
        }
      };
    } catch (error) {
      console.error("Error initializing Vapi:", error);
    }
  }, [isMounted]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      setLastMessage(lastMsg.content);

      if (callStatus === CallStatus.ACTIVE) {
        const lowerContent = lastMsg.content.toLowerCase();
        if (lastMsg.role === "assistant" && lowerContent.includes("goodbye")) {
          setTimeout(() => handleDisconnect(), 3000);
        }
        if (lastMsg.role === "user" && (lowerContent.includes("bye") || lowerContent.includes("goodbye") || lowerContent.includes("end call"))) {
          setTimeout(() => { if (callStatus === CallStatus.ACTIVE) handleDisconnect(); }, 4000);
        }
      }
    }

    const handleCreateInterview = async (messages: SavedMessage[]) => {
      const hasUserInteraction = messages.some((msg) => msg.role === "user");
      if (!hasUserInteraction) {
        router.push("/");
        return;
      }
      const result = await createInterview({ userId: userId!, transcript: messages });
      if (result.success) {
         if (userId) {
             addDoc(collection(db, "users", userId, "notifications"), {
                 title: "Interview Created",
                 message: "Redirecting you to the dashboard...",
                 type: "redirect",
                 read: false,
                 createdAt: serverTimestamp(),
             }).catch(e => console.error("Notification failed", e));
         }
         window.location.assign("/");
      } else {
         window.location.assign("/");
      }
    };

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      const { success, feedbackId: id } = await createFeedback({ interviewId: interviewId!, userId: userId!, transcript: messages, feedbackId });
      if (success && id) router.push(`/interview/${interviewId}/feedback`);
      else router.push("/");
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") handleCreateInterview(messages); 
      else handleGenerateFeedback(messages);
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    if (!isMounted || typeof window === "undefined" || !navigator?.mediaDevices) {
      alert("Media devices are not available. Please use HTTPS or localhost.");
      return;
    }

    try {
      setCallStatus(CallStatus.CONNECTING);
      
      const difficultyLabel = difficulty[0] < 30 ? "Easy" : difficulty[0] < 70 ? "Medium" : "Hard";

      if (type === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: userName,
            userid: userId,
            difficulty: difficultyLabel,
            persona: persona,
            focus_topic: topic
          },
        });
      } else {
        // Standard Interview logic remains same (or can be enhanced later)
        let formattedQuestions = questions ? questions.map((q) => `- ${q}`).join("\n") : "";
        const randomVoiceId = voiceIds[Math.floor(Math.random() * voiceIds.length)];
        const interviewerConfig = { ...interviewer, voice: { ...interviewer.voice, voiceId: randomVoiceId } } as CreateAssistantDTO;
        await vapi.start(interviewerConfig, { variableValues: { questions: formattedQuestions } });
      }

      if (userId) {
          addDoc(collection(db, "users", userId, "notifications"), {
              title: "Call Started",
              message: `Session started: ${topic} (${difficultyLabel} | ${persona})`,
              type: "call",
              read: false,
              createdAt: serverTimestamp(),
          }).catch(e => console.error("Notification failed", e));
      }
    } catch (error) {
      console.error("Error starting call:", error);
      setCallStatus(CallStatus.INACTIVE);
      alert("Failed to start call. Please check your microphone permissions.");
    }
  };

  const handleDisconnect = () => {
    try {
      setCallStatus(CallStatus.FINISHED);
      if (isMounted && typeof window !== "undefined") vapi.stop();
    } catch (error) {
      console.error("Error stopping call:", error);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start relative z-10">
      
      {/* LEFT PANEL: Mission Control (Sidebar) */}
      <div className="w-full lg:w-1/4 flex flex-col gap-6 animate-in slide-in-from-left duration-700">
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6 relative overflow-hidden group">
            {/* Decorative Header */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan to-transparent opacity-50" />
            
            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
                <h2 className="text-lg font-bold text-white tracking-widest uppercase">Mission Control</h2>
            </div>
            
            {/* Controls (Only active when inactive, else disabled appearance) */}
            <div className={cn("space-y-6 transition-opacity duration-300", callStatus === "ACTIVE" ? "opacity-50 pointer-events-none" : "opacity-100")}>
                <div className="space-y-3">
                    <Label className="text-gray-400 text-xs uppercase font-bold tracking-wider">Simulation Difficulty</Label>
                    <div className="flex items-center justify-between text-neon-cyan font-mono text-sm mb-1">
                         <span>{difficulty[0]}%</span>
                         <span>{difficulty[0] < 30 ? "NET_RUNNER" : difficulty[0] < 70 ? "EXEC_LEVEL" : "GOD_MODE"}</span>
                    </div>
                    <Slider value={difficulty} onValueChange={setDifficulty} max={100} step={1} className="py-2" />
                </div>

                <div className="space-y-3">
                    <Label className="text-gray-400 text-xs uppercase font-bold tracking-wider">Focus Vector</Label>
                    <Select value={topic} onValueChange={setTopic}>
                        <SelectTrigger className="bg-black/50 border-white/10 text-white h-12 font-mono"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#050510] border-white/10 text-white">
                            <SelectItem value="General">GENERAL_PURPOSE</SelectItem>
                            <SelectItem value="System Design">SYSTEM_ARCH</SelectItem>
                            <SelectItem value="Algorithms">ALGO_OPTIMIZATION</SelectItem>
                            <SelectItem value="Behavioral">HUMAN_RELATIONS</SelectItem>
                            <SelectItem value="React/Frontend">UI_FRAMEWORKS</SelectItem>
                            <SelectItem value="Backend/API">SERVER_LOGIC</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                    <Label className="text-gray-400 text-xs uppercase font-bold tracking-wider">AI Persona</Label>
                    <Select value={persona} onValueChange={setPersona}>
                        <SelectTrigger className="bg-black/50 border-white/10 text-white h-12 font-mono"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#050510] border-white/10 text-white">
                            <SelectItem value="Professional">CORPORATE</SelectItem>
                            <SelectItem value="Friendly">EMPATHETIC</SelectItem>
                            <SelectItem value="Strict">ADVERSARIAL</SelectItem>
                            <SelectItem value="Casual">INFORMAL</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Status Indicator */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-xs">
                <span className="text-gray-500">SYSTEM_STATUS</span>
                <span className={cn("font-bold", callStatus === "ACTIVE" ? "text-green-500 animate-pulse" : "text-neon-cyan")}>
                    {callStatus === "ACTIVE" ? "ONLINE" : "STANDBY"}
                </span>
            </div>
        </div>

        {/* Action Button (Sidebar) */}
        <div className="glass-panel p-1 rounded-2xl">
             {callStatus !== "ACTIVE" ? (
              <button 
                className="w-full relative overflow-hidden group bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]" 
                onClick={() => handleCall()} 
                disabled={callStatus === "CONNECTING"}
              >
                <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest">
                  {callStatus === "CONNECTING" ? "INITIALIZING..." : "INITIATE LINK"}
                </span>
                <div className="absolute inset-0 bg-neon-cyan/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            ) : (
              <button 
                className="w-full relative overflow-hidden group bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-500 font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]" 
                onClick={() => handleDisconnect()}
              >
                <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest">
                  TERMINATE LINK
                </span>
              </button>
            )}
        </div>
      </div>

      {/* RIGHT PANEL: Neural Bridge (Main Stage) */}
      <div className="w-full lg:w-3/4 flex flex-col gap-6 animate-in slide-in-from-right duration-700 delay-100">
         <div className="glass-panel min-h-[500px] lg:h-[600px] rounded-3xl relative flex flex-col items-center justify-center p-8 overflow-hidden">
            
            {/* Background Decor */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black opacity-80" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 bg-center" />

            {/* CENTRAL STAGE */}
            <div className="relative z-10 w-full max-w-4xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0 h-full">
                
                {/* AI Node (Left) */}
                <div className="flex flex-col items-center gap-6 relative group">
                    <div className={cn(
                        "relative z-10 rounded-full p-1 transition-all duration-500",
                        isAiSpeaking ? "scale-110 shadow-[0_0_60px_rgba(0,243,255,0.8)]" : "shadow-[0_0_20px_rgba(0,243,255,0.1)] opacity-50"
                    )}>
                        <div className={cn("absolute inset-0 border-2 border-neon-cyan rounded-full transition-all duration-1000", isAiSpeaking ? "animate-[spin_3s_linear_infinite] opacity-100" : "animate-[spin_10s_linear_infinite] opacity-60")} />
                        <div className={cn("absolute -inset-2 border border-neon-cyan/60 rounded-full transition-all duration-1000", isAiSpeaking ? "animate-[spin_4s_linear_infinite_reverse] opacity-100" : "animate-[spin_15s_linear_infinite_reverse] opacity-40")} />
                         <div className="size-[160px] rounded-full overflow-hidden border-4 border-black bg-black relative">
                            <Image src="/ai-avatar.png" alt="ai" width={160} height={160} className="object-cover" />
                            {isAiSpeaking && <div className="absolute inset-0 bg-neon-cyan/20 animate-pulse" />}
                         </div>
                    </div>
                    <div className="text-center">
                        <h2 className={cn("text-3xl font-black tracking-tight transition-colors duration-300", isAiSpeaking ? "text-neon-cyan drop-shadow-glow" : "text-gray-500")}>INTER X</h2>
                        <div className={cn("flex items-center justify-center gap-2 font-mono text-xs mt-1 transition-opacity duration-300", isAiSpeaking ? "text-neon-cyan opacity-100" : "text-gray-600 opacity-50")}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", isAiSpeaking ? "bg-neon-cyan animate-ping" : "bg-gray-600")} />
                            {isAiSpeaking ? "TRANSMITTING..." : "AI_CORE_ONLINE"}
                        </div>
                    </div>
                </div>

                {/* THE BRIDGE (Connection) */}
                <div className="flex-1 w-full lg:h-[2px] lg:mx-8 relative flex items-center justify-center">
                    {/* Horizontal Line for Desktop */}
                    <div className="hidden lg:block w-full h-[1px] bg-gradient-to-r from-neon-cyan via-white/50 to-neon-purple opacity-30" />
                    <div className={cn("hidden lg:block absolute inset-0 connecting-line transition-opacity duration-500", callStatus === "ACTIVE" ? "opacity-100" : "opacity-0")} />
                    
                    {/* Vertical Line for Mobile */}
                    <div className="lg:hidden h-24 w-[1px] bg-gradient-to-b from-neon-cyan via-white/50 to-neon-purple opacity-30" />
                    <div className={cn("lg:hidden absolute inset-0 w-[2px] h-full mx-auto connecting-line-vertical transition-opacity duration-500", callStatus === "ACTIVE" ? "opacity-100" : "opacity-0")} />

                    {/* Central Status Node */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-white/20 px-4 py-1 rounded-full text-[10px] font-mono text-gray-400 backdrop-blur-md uppercase tracking-widest whitespace-nowrap z-20">
                        {callStatus === "ACTIVE" ? (
                            <span className="flex items-center gap-2 text-white">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                LINK_ESTABLISHED
                            </span>
                        ) : "LINK_OFFLINE"}
                    </div>
                </div>

                {/* User Node (Right) */}
                <div className="flex flex-col items-center gap-6 relative">
                    <div className={cn(
                        "relative z-10 rounded-full p-1 transition-all duration-500",
                        isUserSpeaking ? "scale-110 shadow-[0_0_60px_rgba(188,19,254,0.8)]" : "shadow-[0_0_20px_rgba(188,19,254,0.1)] opacity-50"
                    )}>
                        <div className={cn("absolute inset-0 border-2 border-neon-purple rounded-full transition-all duration-1000", isUserSpeaking ? "animate-[spin_3s_linear_infinite] opacity-100" : "animate-[spin_10s_linear_infinite] opacity-60")} />
                        <div className={cn("absolute -inset-2 border border-neon-purple/60 rounded-full transition-all duration-1000", isUserSpeaking ? "animate-[spin_4s_linear_infinite_reverse] opacity-100" : "animate-[spin_15s_linear_infinite_reverse] opacity-40")} />
                        <div className="size-[160px] rounded-full overflow-hidden border-4 border-black bg-black relative">
                            {profilePictureURL ? (
                                <img src={profilePictureURL} alt="user" className="object-cover size-full" />
                            ) : (
                                <Image src="/user-avatar.png" alt="user" width={160} height={160} className="object-cover" />
                            )}
                            {isUserSpeaking && <div className="absolute inset-0 bg-neon-purple/20 animate-pulse" />}
                        </div>
                    </div>
                     <div className="text-center">
                        <h2 className={cn("text-3xl font-black tracking-tight transition-colors duration-300", isUserSpeaking ? "text-neon-purple drop-shadow-glow" : "text-gray-500")}>{userName}</h2>
                         <div className={cn("flex items-center justify-center gap-2 font-mono text-xs mt-1 transition-opacity duration-300", isUserSpeaking ? "text-neon-purple opacity-100" : "text-gray-600 opacity-50")}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", isUserSpeaking ? "bg-neon-purple animate-ping" : "bg-gray-600")} />
                            {isUserSpeaking ? "TRANSMITTING..." : "CANDIDATE_READY"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Transcript Terminal (Bottom Overlay) */}
            <div className="absolute bottom-6 left-6 right-6">
                <div className="glass-panel p-6 rounded-xl min-h-[100px] flex items-center justify-center border-t-2 border-white/5 bg-black/80">
                    {messages.length > 0 ? (
                        <div key={messages.length} className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl w-full">
                             <span className={cn(
                                 "text-xs font-mono uppercase tracking-[0.2em] font-bold py-1 px-3 rounded-full border",
                                 messages[messages.length - 1].role === "assistant" 
                                    ? "text-neon-cyan border-neon-cyan/30 bg-neon-cyan/5" 
                                    : "text-neon-purple border-neon-purple/30 bg-neon-purple/5"
                             )}>
                                {messages[messages.length - 1].role === "assistant" ? ">> INTER_X_CORE" : ">> CANDIDATE_NODE"}
                             </span>
                             <p className={cn(
                                 "text-lg text-center font-medium leading-relaxed drop-shadow-md",
                                 messages[messages.length - 1].role === "assistant" ? "text-neon-cyan" : "text-white"
                             )}>
                                {lastMessage}
                                <span className={cn("animate-pulse ml-2 inline-block w-2.5 h-5 align-middle", messages[messages.length - 1].role === "assistant" ? "bg-neon-cyan" : "bg-neon-purple")} />
                             </p>
                        </div>
                    ) : (
                        <p className="text-gray-500 font-mono text-sm tracking-widest uppercase animate-pulse flex items-center gap-3">
                            <span className="w-2 h-2 bg-red-500 rounded-full" />
                            Awaiting Audio Stream...
                        </p>
                    )}
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Agent;
