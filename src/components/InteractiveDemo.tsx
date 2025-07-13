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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-50">
      {/* Logo */}
      <div className="-mb-20">
        <img 
          src="/lovable-uploads/160f2a0f-b791-4f94-8817-0cd61d047a14.png" 
          alt="Frondex" 
          className="h-54 md:h-72 w-full mx-auto object-contain"
        />
      </div>
      
      {/* Main Heading */}
      <div className="text-center mb-16 max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
          What can I help with?
        </h1>
        <p className="text-gray-600 text-xl md:text-2xl">
          Ask anything about private markets, deal flow, or portfolio insights
        </p>
      </div>
      
      {/* Chat Input */}
      <div className="w-full max-w-4xl mb-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything"
              className="border-0 bg-transparent text-lg py-4 focus-visible:ring-0 flex-1 text-gray-900 placeholder:text-gray-500"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-12 w-12 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              disabled={!query.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
      
      {/* Sector Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl w-full">
        {[
          "HF",
          "Infrastructure", 
          "Institutional",
          "Natural Resources",
          "Private Debt",
          "Private Equity",
          "Real Estate",
          "Public Markets"
        ].map((sector) => (
          <Button
            key={sector}
            variant="outline"
            className="aspect-square h-20 text-sm font-bold bg-white border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            {sector}
          </Button>
        ))}
      </div>

      {/* Footer Text */}
      <div className="text-center text-sm text-gray-600 max-w-lg">
        <p>Frondex can make mistakes. Please double-check responses.</p>
      </div>
    </div>
  );
};

export default InteractiveDemo;