import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CleanMinimalSignIn } from "@/components/ui/clean-minimal-sign-in";

const Auth: React.FC = () => {
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Give it a tick to settle then redirect
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
      }
    });
    
    return () => listener.subscription.unsubscribe();
  }, []);

  return <CleanMinimalSignIn />;
};

export default Auth;
