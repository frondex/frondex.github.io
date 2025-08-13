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

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: "global" }); } catch { }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
    } catch (err: any) {
      toast({
        title: "Google sign in failed",
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
              <button 
                type="button"
                onClick={async () => {
                  if (!email) {
                    toast({
                      title: "Error",
                      description: "Please enter your email address first.",
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

                  try {
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/auth`
                    });
                    
                    if (error) throw error;
                    
                    toast({
                      title: "Password reset sent",
                      description: "Check your email for the password reset link."
                    });
                  } catch (err: any) {
                    toast({
                      title: "Reset failed",
                      description: err.message,
                      variant: "destructive"
                    });
                  }
                }}
                className="text-xs hover:underline font-medium text-primary"
              >
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
        
        <div className="flex items-center w-full my-4">
          <div className="flex-grow border-t border-dashed border-border"></div>
          <span className="mx-3 text-xs text-muted-foreground">or</span>
          <div className="flex-grow border-t border-dashed border-border"></div>
        </div>

        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full bg-white border border-input text-foreground font-medium py-2 rounded-xl shadow hover:bg-gray-50 cursor-pointer transition mb-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        
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