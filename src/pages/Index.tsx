import { useAuth } from "@/components/AuthContext";
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
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <InteractiveDemo user={user} />
      </div>
    </div>
  );
};

export default Index;
