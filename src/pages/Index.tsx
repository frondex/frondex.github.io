import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import InteractiveDemo from "@/components/InteractiveDemo";

const Index = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {user && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="text-xs"
            >
              Sign Out
            </Button>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <InteractiveDemo user={user} />
      </div>
    </div>
  );
};

export default Index;
