import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { InterviewCardClient } from "@/components/InterviewCardClient"; // Use Client Component directly
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { InterviewFilterableList } from "@/components/interview/InterviewFilterableList";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getAllInterviews,
  getAppUserFeedback,
} from "@/lib/actions/general.action";

import { AuthButtons } from "@/components/auth/AuthButtons";
import { Sparkles, Brain, Zap, Target, Mic, BarChart3, Trophy, Shield, Rocket, Users } from "lucide-react";

async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="relative overflow-hidden min-h-screen">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-neon-cyan/10 blur-[120px] rounded-full opacity-50 pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-neon-purple/10 blur-[100px] rounded-full opacity-30 pointer-events-none animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-pink-500/5 blur-[100px] rounded-full opacity-20 pointer-events-none animate-pulse" style={{animationDelay: '2s'}} />

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8 relative z-10 flex flex-col items-center text-center">
            
            {/* Hero Badge */}
            <div className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-top-4 duration-700 hover:border-neon-cyan/50 hover:bg-white/10 transition-all cursor-pointer hover:scale-105">
                <Sparkles className="w-4 h-4 text-neon-cyan animate-pulse" />
                <span className="text-sm font-bold text-gray-300 tracking-widest group-hover:text-neon-cyan transition-colors">AI-POWERED INTERVIEW MASTERY</span>
                <div className="absolute inset-0 rounded-full bg-neon-cyan/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </div>

            {/* Hero Title with Gradient Animation */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 animate-in fade-in zoom-in-95 duration-700 delay-100">
                DOMINATE YOUR <br className="hidden md:block" />
                <span className="relative inline-block">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-purple to-pink-500 animate-gradient-x drop-shadow-glow">
                        NEXT INTERVIEW
                    </span>
                    <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-neon-cyan/30 via-neon-purple/30 to-pink-500/30 -z-10 animate-pulse" />
                </span>
            </h1>

            {/* Subtitle with Typing Effect Feel */}
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 font-light">
                Master the <span className="text-neon-cyan font-bold">art of conversation</span> with our AI-powered simulation platform. 
                <br className="hidden md:block" />Train in <span className="text-neon-purple font-bold">real-time</span>, receive <span className="text-pink-400 font-bold">instant feedback</span>, and land your dream job.
            </p>

            {/* CTA Buttons with Magnetic Effect */}
            <div className="flex flex-col sm:flex-row gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 mb-20">
                <AuthButtons />
            </div>

            {/* Feature Showcase - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                {[
                    { 
                        icon: Brain, 
                        title: "Adaptive AI Engine", 
                        desc: "Our neural network learns your patterns and adjusts difficulty in real-time, just like a human interviewer.",
                        color: "cyan"
                    },
                    { 
                        icon: Mic, 
                        title: "Voice Intelligence", 
                        desc: "Practice with voice recognition that analyzes tone, pace, clarity, and confidence levels.",
                        color: "purple"
                    },
                    { 
                        icon: BarChart3, 
                        title: "Performance Analytics", 
                        desc: "Get detailed breakdowns of your answers with actionable insights to improve every response.",
                        color: "pink"
                    }
                ].map((feature, i) => (
                    <div 
                        key={i} 
                        className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-neon-cyan/50 transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden"
                        style={{animationDelay: `${i * 100}ms`}}
                    >
                        {/* Glow Effect on Hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${
                            feature.color === 'cyan' ? 'from-neon-cyan/10' : 
                            feature.color === 'purple' ? 'from-neon-purple/10' : 
                            'from-pink-500/10'
                        } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        
                        {/* Icon with Glow */}
                        <div className="relative w-14 h-14 rounded-xl bg-black/50 border border-white/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <feature.icon className={`w-7 h-7 ${
                                feature.color === 'cyan' ? 'text-neon-cyan' : 
                                feature.color === 'purple' ? 'text-neon-purple' : 
                                'text-pink-400'
                            }`} />
                            <div className={`absolute inset-0 rounded-xl ${
                                feature.color === 'cyan' ? 'bg-neon-cyan/30' : 
                                feature.color === 'purple' ? 'bg-neon-purple/30' : 
                                'bg-pink-500/30'
                            } blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                        </div>
                        
                        <h3 className="relative text-xl font-black text-white mb-3 group-hover:text-neon-cyan transition-colors">{feature.title}</h3>
                        <p className="relative text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{feature.desc}</p>
                    </div>
                ))}
            </div>

            {/* How It Works Section */}
            <div className="w-full max-w-6xl mb-20">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 animate-in fade-in">
                    HOW IT <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">WORKS</span>
                </h2>
                <p className="text-gray-400 mb-12 text-lg">Your path to interview excellence in three simple steps</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { num: "01", title: "Choose Your Role", desc: "Select from engineering, product, leadership, or custom interview types.", icon: Target },
                        { num: "02", title: "Train with AI", desc: "Engage in realistic conversations powered by advanced language models.", icon: Rocket },
                        { num: "03", title: "Master & Iterate", desc: "Review detailed feedback and practice until you're interview-ready.", icon: Trophy }
                    ].map((step, i) => (
                        <div key={i} className="group relative text-left">
                            {/* Step Number with Glow */}
                            <div className="absolute -top-8 -left-4 text-8xl font-black text-white/5 group-hover:text-neon-cyan/10 transition-colors">
                                {step.num}
                            </div>
                            
                            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-neon-purple/50 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                                <step.icon className="w-10 h-10 text-neon-cyan mb-4 group-hover:scale-110 group-hover:text-neon-purple transition-all" />
                                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="w-full max-w-6xl mb-20">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 text-center">
                    WHAT <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">USERS SAY</span>
                </h2>
                <p className="text-gray-400 mb-12 text-lg text-center">Real stories from professionals who transformed their careers</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            quote: "Intervaix helped me land my dream role at a FAANG company. The AI feedback was incredibly detailed and actionable.",
                            name: "Sarah Chen",
                            role: "Senior Software Engineer",
                            company: "Meta",
                            avatar: "SC"
                        },
                        {
                            quote: "The real-time adaptation is game-changing. It's like having a personal interview coach available 24/7.",
                            name: "Marcus Rodriguez",
                            role: "Product Manager",
                            company: "Stripe",
                            avatar: "MR"
                        },
                        {
                            quote: "I went from nervous wreck to confident communicator in just 2 weeks. The voice analysis feature is pure gold.",
                            name: "Aisha Patel",
                            role: "UX Designer",
                            company: "Figma",
                            avatar: "AP"
                        }
                    ].map((testimonial, i) => (
                        <div 
                            key={i} 
                            className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-neon-cyan/50 transition-all duration-500 hover:scale-105"
                        >
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                            
                            {/* Quote */}
                            <div className="relative mb-6">
                                <svg className="w-8 h-8 text-neon-cyan/30 mb-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                                </svg>
                                <p className="text-gray-300 leading-relaxed group-hover:text-white transition-colors">"{testimonial.quote}"</p>
                            </div>
                            
                            {/* Author */}
                            <div className="relative flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-black font-bold">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <p className="font-bold text-white">{testimonial.name}</p>
                                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                                    <p className="text-xs text-neon-cyan">{testimonial.company}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Social Proof Stats - Enhanced */}
            <div className="w-full max-w-5xl mb-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl bg-gradient-to-r from-white/5 to-transparent border border-white/10">
                    {[
                        { label: "AI SIMULATIONS", value: "10,000+", icon: Zap },
                        { label: "SUCCESS RATE", value: "94%", icon: Trophy },
                        { label: "ACTIVE USERS", value: "2,500+", icon: Users },
                        { label: "AVG. IMPROVEMENT", value: "+68%", icon: BarChart3 }
                    ].map((stat, i) => (
                        <div key={i} className="group text-center hover:scale-110 transition-transform cursor-pointer">
                            <stat.icon className="w-8 h-8 mx-auto mb-2 text-neon-cyan group-hover:text-neon-purple transition-colors" />
                            <div className="text-4xl font-black text-white mb-1 group-hover:text-neon-cyan transition-colors">{stat.value}</div>
                            <div className="text-xs font-bold text-gray-500 tracking-widest">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trust Badges - Premium Bento Grid */}
            <div className="w-full max-w-6xl mb-20 px-4">
                <h3 className="text-center text-sm font-bold text-gray-500 tracking-[0.3em] mb-8 uppercase">Trusted by Thousands</h3>
                
                {/* Asymmetric Grid */}
                <div className="grid grid-cols-4 md:grid-cols-8 gap-4 h-[400px] md:h-[320px]">
                    
                    {/* Large Featured Card - Security */}
                    <div className="col-span-4 md:col-span-3 row-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-neon-cyan/10 via-black/50 to-transparent border border-white/10 hover:border-neon-cyan/50 transition-all duration-500 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Floating Icon */}
                        <div className="absolute top-8 left-8">
                            <div className="relative">
                                <Shield className="w-16 h-16 text-neon-cyan" />
                                <div className="absolute inset-0 bg-neon-cyan/30 blur-2xl animate-pulse" />
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="absolute bottom-8 left-8 right-8">
                            <h4 className="text-2xl font-black text-white mb-2 group-hover:text-neon-cyan transition-colors">Bank-Level Security</h4>
                            <p className="text-gray-400 text-sm mb-3">End-to-end 256-bit AES encryption protects your data</p>
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-12 bg-gradient-to-r from-neon-cyan to-transparent rounded-full" />
                                <span className="text-xs text-neon-cyan font-mono">ENCRYPTED</span>
                            </div>
                        </div>
                        
                        {/* Decorative Lines */}
                        <div className="absolute top-0 right-0 w-32 h-32 border-r border-t border-neon-cyan/20 rounded-tr-3xl" />
                    </div>

                    {/* AI Powered - Medium Card */}
                    <div className="col-span-2 md:col-span-3 row-span-1 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-neon-purple/10 via-black/50 to-transparent border border-white/10 hover:border-neon-purple/50 transition-all duration-500 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="p-6 h-full flex flex-col justify-between">
                            <Zap className="w-10 h-10 text-neon-purple group-hover:scale-110 transition-transform" />
                            <div>
                                <h4 className="text-lg font-black text-white mb-1">AI-Powered</h4>
                                <p className="text-xs text-gray-500">GPT-4 Technology</p>
                            </div>
                        </div>
                    </div>

                    {/* Uptime - Compact Card */}
                    <div className="col-span-2 md:col-span-2 row-span-1 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/10 via-black/50 to-transparent border border-white/10 hover:border-pink-500/50 transition-all duration-500 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="p-6 h-full flex flex-col justify-between">
                            <Trophy className="w-8 h-8 text-pink-400 group-hover:rotate-12 transition-transform" />
                            <div>
                                <h4 className="text-lg font-black text-white">99.9%</h4>
                                <p className="text-xs text-gray-500">Uptime</p>
                            </div>
                        </div>
                    </div>

                    {/* GDPR - Medium Card */}
                    <div className="col-span-2 md:col-span-3 row-span-1 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 via-black/50 to-transparent border border-white/10 hover:border-green-500/50 transition-all duration-500 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="p-6 h-full flex flex-col justify-between">
                            <Users className="w-10 h-10 text-green-400 group-hover:scale-110 transition-transform" />
                            <div>
                                <h4 className="text-lg font-black text-white mb-1">GDPR Compliant</h4>
                                <p className="text-xs text-gray-500">Your privacy, our priority</p>
                            </div>
                        </div>
                    </div>

                    {/* Verified Badge - Compact */}
                    <div className="col-span-2 md:col-span-2 row-span-1 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 via-black/50 to-transparent border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-[1.02]">
                        <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center mb-2 group-hover:rotate-180 transition-transform duration-700">
                                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                            </div>
                            <p className="text-xs font-bold text-white">Verified</p>
                            <p className="text-[10px] text-gray-500">Platform</p>
                        </div>
                    </div>

                </div>

                {/* Decorative Bottom Line */}
                <div className="mt-8 h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
            </div>

            {/* Final CTA */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 via-neon-purple/20 to-pink-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                <div className="relative bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-3xl p-12 text-center backdrop-blur-md">
                    <Shield className="w-16 h-16 mx-auto mb-6 text-neon-cyan" />
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                        READY TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">ACE YOUR NEXT INTERVIEW?</span>
                    </h2>
                    <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                        Join thousands of professionals who've transformed their interview skills with Intervaix.
                    </p>
                    <AuthButtons />
                </div>
            </div>

            {/* Footer - Black Star Branding */}
            <footer className="w-full max-w-7xl mt-16 mb-8 border-t border-white/10 pt-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    {/* Left - Branding */}
                    <div className="group flex items-center gap-3">
                        <div className="relative">
                            <div className="text-2xl font-black text-white group-hover:text-neon-cyan transition-colors">
                                INTER<span className="text-neon-cyan group-hover:text-neon-purple transition-colors">VAIX</span>
                            </div>
                            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-cyan to-neon-purple opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    {/* Center - Made By */}
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-gray-400 text-sm">
                            Crafted with <span className="text-neon-cyan animate-pulse">⚡</span> by
                        </p>
                        <a 
                            href="https://github.com/MedSalimGh" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-neon-cyan/50 hover:bg-white/10 transition-all"
                        >
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-neon-cyan transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                            <span className="text-lg font-bold text-white group-hover:text-neon-cyan transition-colors">Black Star</span>
                        </a>
                    </div>

                    {/* Right - Social Links */}
                    <div className="flex items-center gap-4">
                        <a 
                            href="https://beacons.ai/blackstarx_o" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-white/10 hover:border-neon-purple/50 hover:scale-105 transition-all"
                        >
                            <Sparkles className="w-4 h-4 text-neon-purple" />
                            <span className="text-sm font-bold text-gray-300 group-hover:text-neon-purple transition-colors">All Links</span>
                        </a>
                    </div>
                </div>

                {/* Bottom - Copyright */}
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-xs text-gray-600">
                        © {new Date().getFullYear()} Intervaix. All rights reserved. • Built with Next.js & AI
                    </p>
                </div>
            </footer>
        </div>
      </div>
    );
  }

  const [allInterviews, userFeedback] = await Promise.all([
    getAllInterviews(),
    getAppUserFeedback(user.id),
  ]);

  // Create a Set of interview IDs that the user has feedback for
  const takenInterviewIds = new Set(userFeedback.map((f) => f.interviewId));

  // Filter interviews
  const userInterviews = allInterviews.filter((interview) =>
    takenInterviewIds.has(interview.id)
  );
  
  const availableInterviews = allInterviews.filter(
    (interview) => !takenInterviewIds.has(interview.id)
  );

  const hasPastInterviews = userInterviews.length > 0;
  
  return (
    <>
      <AnimatedSection className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
             Get Interview-Ready with <span className="text-neon-cyan">AI-Powered</span> Practice & Feedback
          </h2>
          <p className="text-lg text-gray-300">
            Practice real interview questions & get instant feedback
          </p>

          <Button asChild className="max-sm:w-full" variant="neon">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden drop-shadow-[0_0_15px_rgba(0,243,255,0.3)]"
        />
      </AnimatedSection>

      <AnimatedSection className="flex flex-col gap-6 mt-16" delay={0.2}>
        <h2 className="text-3xl font-bold text-white pl-4 border-l-4 border-neon-cyan">
            Your Interviews
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {hasPastInterviews ? (
            userInterviews.map((interview) => {
              // Synchronously find feedback
              const feedback = userFeedback.find(f => f.interviewId === interview.id) || null;
              return (
              <InterviewCardClient
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                coverImage={interview.coverImage}
                feedback={feedback}
              />
            )})
          ) : (
            <p className="text-gray-400 pl-4 col-span-full">You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </AnimatedSection>

      <AnimatedSection className="flex flex-col gap-6 mt-16 pb-20" delay={0.4}>
        <h2 className="text-3xl font-bold text-white pl-4 border-l-4 border-neon-cyan">
             Take Interviews
        </h2>

        <InterviewFilterableList interviews={availableInterviews} userId={user.id} feedbacks={userFeedback} />
      </AnimatedSection>
    </>
  );
}

export default Home;
