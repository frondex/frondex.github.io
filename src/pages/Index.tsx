import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthContext";
import { SubscriptionManager } from "@/components/SubscriptionManager";
import InteractiveDemo from "@/components/InteractiveDemo";

const Index = () => {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="border-b bg-card p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Frondex</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button variant="outline" onClick={signOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <SubscriptionManager user={user} />
        <InteractiveDemo />
      </div>
    </div>
  );
};

export default Index;
