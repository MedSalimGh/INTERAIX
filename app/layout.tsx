import { Toaster } from "@/components/ui/sonner";
import { NeonBackground } from "@/components/canvas/NeonBackground";
import { NeonCursor } from "@/components/ui/NeonCursor";
import { AnimationOrchestrator } from "@/components/utils/AnimationOrchestrator";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/utils/PageTransition";
import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google"; // Single declaration
import { ClientProviders } from "@/components/providers/ClientProviders";
import { SupportChat } from "@/components/layout/SupportChat";
import { getCurrentUser } from "@/lib/actions/auth.action";
import "./globals.css";

const monaSans = Mona_Sans({ // Kept only one declaration
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "INTERVAIX",
  description: "An AI-powered platform for preparing for mock interviews",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${monaSans.className} antialiased pattern`} suppressHydrationWarning>
        <ClientProviders>
          <NeonBackground />
          <NeonCursor />
          <AnimationOrchestrator />
          <Header />
          <div className="animate-fade-in pt-16">
            <PageTransition>{children}</PageTransition>
          </div>

          <Toaster />
          <SupportChat userId={user?.id} />
        </ClientProviders>
      </body>
    </html>
  );
}
