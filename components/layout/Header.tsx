import Link from "next/link";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { Navigation } from "./Navigation";
import { NotificationHub } from "./NotificationHub";
import { LanguageToggle } from "./LanguageToggle";
import { AuthButtons } from "@/components/auth/AuthButtons";

export const Header = async () => {
  const user = await getCurrentUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Glassmorphism Background with Gradient Overlay - Matches Popup Style */}
      <div className="absolute inset-0 bg-dark-200/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"></div>
      
      {/* Neon Gradient Bottom Border */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50 shadow-[0_0_10px_rgba(0,243,255,0.5)]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo with Glow Effect */}
          <Link href="/" className="flex items-center gap-3 group relative pl-2">
            <div className="absolute -inset-4 bg-neon-cyan/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative text-3xl font-black tracking-tighter">
              <span className="text-white drop-shadow-md">INTER</span>
              <span className="text-neon-cyan group-hover:text-neon-purple transition-all duration-300 drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]">
                VAIX
              </span>
            </div>
          </Link>

          {/* Navigation - Centered & Premium Style */}
          <div className="hidden md:block">
             <Navigation user={user} />
          </div>

          {/* Auth Section & Notifications */}
          <div className="flex items-center gap-5">
            <LanguageToggle />
            {user ? (
              <>
                <NotificationHub userId={user.id} />
                <UserMenu user={user} />
              </>
            ) : (
                <AuthButtons />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
