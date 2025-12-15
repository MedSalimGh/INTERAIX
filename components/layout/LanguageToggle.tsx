"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="relative w-20 h-9 bg-black/50 border border-white/10 rounded-full flex items-center p-1 cursor-pointer overflow-hidden group shadow-inner ring-1 ring-white/5"
    >
      {/* Sliding Neon Background */}
      <motion.div
        className="absolute top-1 bottom-1 w-[34px] rounded-full shadow-[0_0_15px_rgba(0,243,255,0.4)] z-0"
        animate={{
          x: language === "en" ? 0 : 42,
          backgroundColor: language === "en" ? "rgba(0, 243, 255, 0.2)" : "rgba(188, 19, 254, 0.2)",
          borderColor: language === "en" ? "rgba(0, 243, 255, 0.5)" : "rgba(188, 19, 254, 0.5)",
        }}
        style={{ borderWidth: 1,borderStyle: "solid" }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />

      {/* Text Labels */}
      <div className="relative z-10 flex justify-between w-full px-2.5">
        <span
          className={`text-xs font-bold transition-colors duration-300 ${
            language === "en" ? "text-neon-cyan drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]" : "text-gray-500"
          }`}
        >
          EN
        </span>
        <span
          className={`text-xs font-bold transition-colors duration-300 ${
            language === "fr" ? "text-neon-purple drop-shadow-[0_0_5px_rgba(188,19,254,0.8)]" : "text-gray-500"
          }`}
        >
          FR
        </span>
      </div>
    </button>
  );
};
