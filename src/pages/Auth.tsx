import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

// Simple auth state cleanup to avoid limbo states
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

const Auth: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Keep basic session state (optional for now)
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthed(!!session?.user);
      if (event === "SIGNED_IN") {
        // give it a tick to settle
        setTimeout(() => {
          window.location.href = "/";
        }, 0);
      }
    });
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session?.user));
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: "global" }); } catch { }
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl }
      });
      if (error) throw error;
      toast({ title: "Check your email", description: "We sent you a confirmation link." });
    } catch (err: any) {
      toast({ title: "Sign up failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: "global" }); } catch { }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // onAuthStateChange will redirect
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: "global" }); } catch { }
      window.location.href = "/auth";
    } catch (err: any) {
      toast({ title: "Sign out failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <main className="container mx-auto max-w-md py-12">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Sign in or create an account</CardTitle>
          <CardDescription>Access Frondex features and manage your subscription.</CardDescription>
        </CardHeader>
        <CardContent>
          {isAuthed ? (
            <div className="space-y-4">
              <p>You are signed in.</p>
              <Button onClick={handleSignOut} variant="secondary">Sign out</Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSignIn}>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-label="Password"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>Sign in</Button>
                <Button type="button" variant="outline" onClick={handleSignUp} disabled={loading}>Sign up</Button>
              </div>
              <Separator className="my-4" />
              <p className="text-sm opacity-80">We'll use your account to track subscription status and credits.</p>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default Auth;
