import { useState } from "react";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import AnimatedBrandCard from "./AnimatedBrandCard";

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
      <div className="w-full max-w-4xl mb-64">
        <VercelV0Chat />
      </div>
      
      {/* Our Brands Section */}
      <section className="w-full max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Our Brands
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Discover the innovative companies and visionary brands that shape tomorrow's markets
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              name: "The Long & Short",
              description: "Hedge Funds",
              image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop"
            },
            {
              name: "InfraLedger",
              description: "Infrastructure", 
              image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop"
            },
            {
              name: "The Allocator's Almanac",
              description: "Institutional",
              image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
            },
            {
              name: "Natural Currency",
              description: "Natural Resources",
              image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop"
            },
            {
              name: "Debt Capital Chronicles",
              description: "Private Debt",
              image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop"
            },
            {
              name: "Carry and Conquer",
              description: "Private Equity",
              image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop"
            },
            {
              name: "Landlord Ledger",
              description: "Real Estate",
              image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"
            },
            {
              name: "Republic",
              description: "Public Markets",
              image: "https://images.unsplash.com/photo-1611095973362-ee02dcb0ed4c?w=400&h=300&fit=crop"
            }
          ].map((brand, idx) => (
            <AnimatedBrandCard
              key={idx}
              name={brand.name}
              description={brand.description}
              image={brand.image}
            />
          ))}
        </div>
      </section>

      {/* Footer Text */}
      <div className="text-center text-sm text-gray-600 max-w-lg">
        <p>Frondex can make mistakes. Please double-check responses.</p>
      </div>
    </div>
  );
};

export default InteractiveDemo;