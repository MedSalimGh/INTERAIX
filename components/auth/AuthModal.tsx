"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm, SignUpForm } from "./AuthForms";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup";
}

export const AuthModal = ({ isOpen, onClose, defaultTab = "signin" }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // Sync internal state with prop changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] bg-black/90 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-0 gap-0 overflow-hidden">
        
        {/* Header Section with Neon Gradient */}
        <div className="relative p-6 px-8 text-center bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50" />
            
            <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-neon-cyan animate-pulse" />
                <h2 className="text-2xl font-black text-white tracking-widest drop-shadow-glow">
                    INTER<span className="text-neon-cyan">VAIX</span>
                </h2>
            </div>
            <p className="text-xs text-gray-400 font-mono tracking-wider">SECURE ACCESS TERMINAL</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 rounded-none bg-transparent p-0 border-b border-white/5">
                <TabsTrigger 
                    value="signin"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-neon-cyan data-[state=active]:bg-white/5 data-[state=active]:text-neon-cyan py-4 transition-all"
                >
                    SIGN IN
                </TabsTrigger>
                <TabsTrigger 
                    value="signup"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-neon-purple data-[state=active]:bg-white/5 data-[state=active]:text-neon-purple py-4 transition-all"
                >
                    SIGN UP
                </TabsTrigger>
            </TabsList>

            <div className="p-6 px-8">
                <TabsContent value="signin" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-left-4 duration-300">
                    <SignInForm onSuccess={onClose} />
                </TabsContent>
                
                <TabsContent value="signup" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-300">
                    <SignUpForm onSuccess={onClose} />
                </TabsContent>
            </div>
        </Tabs>
        
        {/* Footer Polish */}
        <div className="p-4 text-center bg-black/40 border-t border-white/5 text-[10px] text-gray-600">
            SECURE CONNECTION • ENCRYPTED • V4.2
        </div>
      </DialogContent>
    </Dialog>
  );
};
