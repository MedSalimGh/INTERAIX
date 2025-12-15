"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";

interface NavigationProps {
  user: any; // Using basic type for simple existence check
}

export const Navigation = ({ user }: NavigationProps) => {
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/interview", label: "Practice" },
    { href: "/cv-interview", label: "CV Interview" },
  ];

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href === "/") return; // Always allow home
    
    if (!user) {
        e.preventDefault();
        setShowAuthModal(true);
    }
  };

  return (
    <>
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={`relative text-lg font-bold tracking-wide transition-all duration-300 px-3 py-1 rounded-lg hover:bg-white/5 ${
                pathname === link.href
                  ? "text-neon-cyan drop-shadow-[0_0_8px_rgba(0,243,255,0.6)]"
                  : "text-gray-300 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
              }`}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-neon-cyan rounded-full shadow-[0_0_8px_rgba(0,243,255,0.8)]" />
              )}
            </Link>
          ))}
        </nav>

        <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)} 
            defaultTab="signup"
        />
    </>
  );
};
