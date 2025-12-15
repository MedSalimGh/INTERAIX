"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, Lock, User, AlertCircle } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, AuthError } from "firebase/auth";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/firebase/client";
import { setSessionCookie, signUp } from "@/lib/actions/auth.action";

// Schemas
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// --- Components ---

interface AuthFormProps {
    onSuccess?: () => void;
}

export const SignInForm = ({ onSuccess }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const idToken = await userCredential.user.getIdToken();
      await setSessionCookie(idToken);
      
      if (onSuccess) onSuccess();
      router.refresh();
      // Force a full reload to update server-side state
      window.location.reload();
    } catch (err: any) {
      console.error("Sign-in error:", err);
      let msg = "Failed to sign in. Please check your credentials.";
      if (err.code === "auth/invalid-credential") msg = "Invalid email or password.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Email</label>
        <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-neon-cyan transition-colors" />
            <Input 
                {...form.register("email")} 
                placeholder="name@company.com" 
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-neon-cyan/50 focus:bg-white/10 focus:ring-neon-cyan/20 h-11 transition-all rounded-xl"
            />
        </div>
        {form.formState.errors.email && <p className="text-red-400 text-xs pl-1">{form.formState.errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
        </div>
        <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-neon-cyan transition-colors" />
            <Input 
                {...form.register("password")} 
                type="password" 
                placeholder="••••••••" 
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-neon-cyan/50 focus:bg-white/10 focus:ring-neon-cyan/20 h-11 transition-all rounded-xl"
            />
        </div>
        {form.formState.errors.password && <p className="text-red-400 text-xs pl-1">{form.formState.errors.password.message}</p>}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-neon-cyan text-black font-bold hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all h-11 rounded-xl"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
      </Button>
    </form>
  );
};

export const SignUpForm = ({ onSuccess }: AuthFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
  
    const form = useForm<z.infer<typeof signUpSchema>>({
      resolver: zodResolver(signUpSchema),
      defaultValues: { name: "", email: "", password: "" },
    });
  
    const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
      setIsLoading(true);
      setError("");
  
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        
        // Sync to Firestore via server action
        const result = await signUp({
            uid: userCredential.user.uid,
            email: values.email,
            name: values.name,
        });

        if (!result.success) {
            setError(result.message || "Failed to create account profile.");
            return;
        }

        const idToken = await userCredential.user.getIdToken();
        await setSessionCookie(idToken);
  
        if (onSuccess) onSuccess();
        router.refresh();
        // Force a full reload to update server-side state
        window.location.reload();

      } catch (err: any) {
        console.error("Sign-up error:", err);
        let msg = "Failed to create account.";
        if (err.code === "auth/email-already-in-use") msg = "Email already being used.";
        if (err.code === "auth/weak-password") msg = "Password is too weak.";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
          <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-neon-cyan transition-colors" />
              <Input 
                  {...form.register("name")} 
                  placeholder="John Doe" 
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-neon-cyan/50 focus:bg-white/10 focus:ring-neon-cyan/20 h-11 transition-all rounded-xl"
              />
          </div>
          {form.formState.errors.name && <p className="text-red-400 text-xs pl-1">{form.formState.errors.name.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Email</label>
          <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-neon-cyan transition-colors" />
              <Input 
                  {...form.register("email")} 
                  placeholder="name@company.com" 
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-neon-cyan/50 focus:bg-white/10 focus:ring-neon-cyan/20 h-11 transition-all rounded-xl"
              />
          </div>
          {form.formState.errors.email && <p className="text-red-400 text-xs pl-1">{form.formState.errors.email.message}</p>}
        </div>
  
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Password</label>
          <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-neon-cyan transition-colors" />
              <Input 
                  {...form.register("password")} 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-neon-cyan/50 focus:bg-white/10 focus:ring-neon-cyan/20 h-11 transition-all rounded-xl"
              />
          </div>
          {form.formState.errors.password && <p className="text-red-400 text-xs pl-1">{form.formState.errors.password.message}</p>}
        </div>
  
        <Button 
          type="submit" 
          className="w-full bg-white text-black font-bold hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all h-11 rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
        </Button>
      </form>
    );
  };
