"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "./AuthModal";

export const AuthButtons = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");

  const openAuth = (tab: "signin" | "signup") => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  return (
    <>
      <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => openAuth("signin")}
            className="hidden sm:inline-flex text-lg font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 px-6 py-6"
          >
            Sign In
          </Button>
          <Button
            onClick={() => openAuth("signup")}
            className="bg-neon-cyan text-black text-lg font-black hover:bg-neon-purple hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(0,243,255,0.5)] hover:shadow-[0_0_35px_rgba(188,19,254,0.7)] border-2 border-neon-cyan/50 rounded-full px-8 py-6"
          >
            Get Started
          </Button>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        defaultTab={authTab}
      />
    </>
  );
};
