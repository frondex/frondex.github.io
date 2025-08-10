import * as React from "react"
import { useState } from "react";
import { LogIn, Lock, Mail, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CleanMinimalSignInProps {
  onSuccess?: () => void;
}

const CleanMinimalSignIn = ({ onSuccess }: CleanMinimalSignInProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const cleanupAuthState = () => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage || {}).forEach((key) => {
        if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
          sessionStorage.removeItem(key);
        }
      });
    } catch { }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateEmail(email)) {
      toast({
        title: "Error", 
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: "global" }); } catch { }

      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl }
        });
        
        if (error) throw error;
        
        toast({
          title: "Check your email",
          description: "We sent you a confirmation link."
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        
        if (error) throw error;
        
        // Auth state change will handle redirect
        onSuccess?.();
      }
    } catch (err: any) {
      toast({
        title: isSignUp ? "Sign up failed" : "Sign in failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      cleanupAuthState();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
    } catch (err: any) {
      toast({
        title: "OAuth sign in failed",
        description: err.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-sm bg-gradient-to-b from-sky-50/50 to-white rounded-3xl shadow-xl p-8 flex flex-col items-center border border-blue-100 text-foreground">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white mb-6 shadow-lg">
          {isSignUp ? (
            <UserPlus className="w-7 h-7 text-foreground" />
          ) : (
            <LogIn className="w-7 h-7 text-foreground" />
          )}
        </div>
        
        <h2 className="text-2xl font-semibold mb-2 text-center">
          {isSignUp ? "Create your account" : "Sign in to Frondex"}
        </h2>
        
        <p className="text-muted-foreground text-sm mb-6 text-center">
          {isSignUp 
            ? "Get started with your Frondex account and access premium features"
            : "Access your account to manage subscriptions and premium features"
          }
        </p>
        
        <div className="w-full flex flex-col gap-3 mb-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="w-4 h-4" />
            </span>
            <input
              placeholder="Email"
              type="email"
              value={email}
              disabled={loading}
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground text-sm disabled:opacity-50"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock className="w-4 h-4" />
            </span>
            <input
              placeholder="Password"
              type="password"
              value={password}
              disabled={loading}
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground text-sm disabled:opacity-50"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {!isSignUp && (
            <div className="w-full flex justify-end">
              <button className="text-xs hover:underline font-medium text-primary">
                Forgot password?
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-gradient-to-b from-gray-700 to-gray-900 text-white font-medium py-2 rounded-xl shadow hover:brightness-105 cursor-pointer transition mb-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
        </button>
        
        <div className="flex items-center w-full my-2">
          <div className="flex-grow border-t border-dashed border-border"></div>
          <span className="mx-2 text-xs text-muted-foreground">Or sign in with</span>
          <div className="flex-grow border-t border-dashed border-border"></div>
        </div>
        
        <div className="flex gap-3 w-full justify-center mt-2 mb-4">
          <button 
            onClick={() => handleOAuthSignIn('google')}
            disabled={loading}
            className="flex items-center justify-center w-12 h-12 rounded-xl border bg-background hover:bg-muted transition grow disabled:opacity-50"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-6 h-6"
            />
          </button>
          <button 
            onClick={() => handleOAuthSignIn('github')}
            disabled={loading}
            className="flex items-center justify-center w-12 h-12 rounded-xl border bg-background hover:bg-muted transition grow disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center w-full my-2">
          <div className="flex-grow border-t border-dashed border-border"></div>
          <span className="mx-2 text-xs text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </span>
          <div className="flex-grow border-t border-dashed border-border"></div>
        </div>
        
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          disabled={loading}
          className="text-sm text-primary hover:underline font-medium disabled:opacity-50"
        >
          {isSignUp ? "Sign in instead" : "Create account"}
        </button>
      </div>
    </div>
  );
};

export { CleanMinimalSignIn };