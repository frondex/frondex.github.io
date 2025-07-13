import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

const InteractiveDemo = () => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      console.log("Demo query:", query);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-16">
        <img 
          src="/lovable-uploads/6b7371f7-ab10-4ed6-8a3e-3fdfd1a7fbc5.png" 
          alt="Frondex" 
          className="h-16 mx-auto"
        />
      </div>
      
      {/* Main Heading */}
      <div className="text-center mb-12 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          What can I help with?
        </h1>
        <p className="text-muted-foreground text-lg">
          Ask anything about private markets, deal flow, or portfolio insights
        </p>
      </div>
      
      {/* Chat Input */}
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="frondex-input">
          <div className="flex items-center gap-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything"
              className="border-0 bg-transparent text-lg py-4 focus-visible:ring-0 flex-1"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-foreground text-background hover:bg-foreground/90"
              disabled={!query.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
      
      {/* Footer Text */}
      <div className="mt-8 text-center text-sm text-muted-foreground max-w-lg">
        <p>Frondex can make mistakes. Please double-check responses.</p>
      </div>
    </div>
  );
};

export default InteractiveDemo;