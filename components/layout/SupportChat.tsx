"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X, MessageSquare, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SupportChatProps {
  userId?: string;
}

export const SupportChat = ({ userId }: SupportChatProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm the Intervaix Assistant. 👋" },
    { role: "assistant", content: "Ask me about CV scoring, Mock Interviews, or general tips!" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sound Effect
  const playSound = (type: "open" | "message") => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "open") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(500, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } else {
            // Message receive sound (High tech blip)
            osc.type = "sine";
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        }
    } catch (e) {
        console.error("Audio play failed", e);
    }
  };

  // Auto-scroll & Sound on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if(messages.length > 0 && isOpen && messages[messages.length-1].role === "assistant") {
        playSound("message");
    }
  }, [messages, isOpen]);

  // Auto-Open on Mount / Login
  useEffect(() => {
    if (!userId) return;
    
    const timer = setTimeout(() => {
        setIsOpen(true);
        playSound("open");
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [userId]); // Only run when userId changes (login/refresh)

  // Load History when Opened
  useEffect(() => {
    if (isOpen && userId && messages.length <= 2) {
        fetch("/api/support/history?userId=" + userId)
            .then(res => res.json())
            .then(data => {
                if(data.messages && data.messages.length > 0) {
                    setMessages(data.messages);
                }
            })
            .catch(err => console.error(err));
    }
  }, [isOpen, userId]);

  // Hide if not logged in OR on Interview Simulation pages
  if (!userId) return null;
  if (pathname.includes("/interview/") && pathname.split("/").length > 3) {
      return null;
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue.trim();
    setInputValue("");
    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
           messages: newMessages, 
           userId  
        }),
      });

      const data = await response.json();
      
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
         throw new Error("No reply");
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: "I'm having trouble connecting. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50, rotate: 5 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="w-[380px] h-[500px] bg-black/90 backdrop-blur-xl border border-neon-cyan/50 rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.2)] flex flex-col overflow-hidden ring-1 ring-white/10"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-neon-cyan/10 to-transparent border-b border-white/10 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-neon-cyan/5 animate-pulse"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative w-10 h-10 rounded-full border border-neon-cyan/50 overflow-hidden bg-black p-1 shadow-[0_0_15px_rgba(0,243,255,0.4)]">
                   <Image src="/chatbot.png" alt="AI" width={40} height={40} className="object-cover" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm tracking-wide">Intervaix Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-[pulse_2s_infinite]"></span>
                    <span className="text-xs text-neon-cyan font-mono">ONLINE</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neon-cyan/20 scrollbar-track-transparent">
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  key={i}
                  className={cn(
                    "max-w-[85%] text-sm rounded-2xl px-4 py-3 leading-relaxed shadow-lg",
                    msg.role === "user"
                      ? "bg-neon-cyan text-black font-medium ml-auto rounded-tr-none shadow-neon-cyan/10"
                      : "bg-white/10 text-gray-100 border border-white/5 mr-auto rounded-tl-none"
                  )}
                >
                  {msg.content}
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="bg-white/5 text-gray-400 text-xs rounded-xl px-4 py-2 mr-auto w-fit flex items-center gap-2 border border-white/5"
                >
                   <Loader2 className="w-3 h-3 animate-spin text-neon-cyan" />
                   <span className="animate-pulse">Thinking...</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-black/40 border-t border-white/10">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all focus:bg-white/10"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!inputValue.trim() || isLoading}
                  className="rounded-full bg-neon-cyan text-black hover:bg-neon-purple hover:text-white transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)] disabled:opacity-50 disabled:shadow-none"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
              setIsOpen(true);
          }}
          className="relative group w-20 h-20 rounded-full border-2 border-neon-cyan bg-black shadow-[0_0_30px_rgba(0,243,255,0.6)] flex items-center justify-center overflow-hidden z-50 hover:shadow-[0_0_60px_rgba(188,19,254,0.9)] transition-all duration-300"
        >
          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping opacity-30 group-hover:opacity-50"></div>
          
          <Image 
            src="/chatbot.png" 
            alt="Support" 
            width={80} 
            height={80} 
            className="object-cover opacity-100 group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Notification Dot */}
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
        </motion.button>
      )}
    </div>
  );
};
