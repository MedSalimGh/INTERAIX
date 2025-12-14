"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer, voiceIds } from "@/constants";
import { createFeedback, createInterview } from "@/lib/actions/general.action";

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
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted and browser APIs are available
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only initialize Vapi after component is mounted
    if (!isMounted || typeof window === "undefined") return;

    // Check if mediaDevices API is available
    if (!navigator?.mediaDevices) {
      console.error("Media devices API is not available. Please use HTTPS or localhost.");
      return;
    }

    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
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

      // Auto-disconnect logic
      if (callStatus === CallStatus.ACTIVE) {
        const lowerContent = lastMsg.content.toLowerCase();
        
        // If assistant says goodbye, end call after a short delay to let audio finish
        if (
          lastMsg.role === "assistant" && 
          lowerContent.includes("goodbye")
        ) {
          setTimeout(() => {
            handleDisconnect();
          }, 3000);
        }

        // If user says bye, we expect the assistant to reply with goodbye, 
        // but we can also set a failsafe timeout ensuring it hangs up if AI doesn't.
        if (
          lastMsg.role === "user" && 
          (lowerContent.includes("bye") || 
           lowerContent.includes("goodbye") || 
           lowerContent.includes("end call"))
        ) {
           // Optional: You could force hangup here, but better to let AI reply.
           // However, user specifically asked "when i say bye... i want agent to end call"
           // So let's give the AI 4 seconds to reply "Goodbye" and then force quit if it hasn't.
           setTimeout(() => {
             if (callStatus === CallStatus.ACTIVE) { // Check if still active
               handleDisconnect();
             }
           }, 4000);
        }
      }
    }

    const handleCreateInterview = async (messages: SavedMessage[]) => {
      console.log("handleCreateInterview");

      const hasUserInteraction = messages.some((msg) => msg.role === "user");

      if (!hasUserInteraction) {
        console.log("No user interaction, skipping interview creation");
        router.push("/");
        return;
      }

      const { success, interviewId: id } = await createInterview({
        userId: userId!,
        transcript: messages,
      });

      if (success && id) {
        router.push("/");
      } else {
        console.log("Error creating interview");
        router.push("/");
      }
    };

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        handleCreateInterview(messages);
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    if (!isMounted || typeof window === "undefined" || !navigator?.mediaDevices) {
      alert("Media devices are not available. Please use HTTPS or localhost.");
      return;
    }

    try {
      setCallStatus(CallStatus.CONNECTING);
      console.log("Starting call with Vapi...");
      
      const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
      console.log("Vapi Token present:", !!token);

      if (type === "generate") {
        console.log("Starting generation call...");
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        });
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        // Randomize Voice
        const randomVoiceId = voiceIds[Math.floor(Math.random() * voiceIds.length)];
        const interviewerConfig = {
          ...interviewer,
          voice: {
            ...interviewer.voice,
            voiceId: randomVoiceId,
          },
        } as CreateAssistantDTO;

        console.log("Starting interview call with config:", { 
          interviewer: interviewerConfig, 
          questions: formattedQuestions 
        });

        await vapi.start(interviewerConfig, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
      console.log("Call started successfully");
    } catch (error) {
      console.error("Error starting call:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      setCallStatus(CallStatus.INACTIVE);
      alert("Failed to start call. Please check your microphone permissions.");
    }
  };

  const handleDisconnect = () => {
    try {
      setCallStatus(CallStatus.FINISHED);
      if (isMounted && typeof window !== "undefined") {
        vapi.stop();
      }
    } catch (error) {
      console.error("Error stopping call:", error);
    }
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={150}
              height={150}
              className="object-cover size-[150px]"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>INTER X </h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
