import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthContext";
import { SubscriptionManager } from "@/components/SubscriptionManager";
import InteractiveDemo from "@/components/InteractiveDemo";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="flex justify-between items-center p-6">
        <h1 className="text-3xl font-bold text-primary">Frondex</h1>
        <div className="flex items-center gap-3">
          {!user && (
            <Button asChild variant="outline">
              <Link to="/auth">Log In or Sign Up</Link>
            </Button>
          )}
          <Button className="bg-purple-600 hover:bg-purple-700">
            Upgrade to Pro
          </Button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {user && <SubscriptionManager user={user} />}
        <InteractiveDemo />
      </div>
    </div>
  );
};

export default Index;
