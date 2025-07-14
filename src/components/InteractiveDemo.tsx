import { useState } from "react";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";

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
              name: "TechFlow",
              description: "Next-generation software solutions",
              image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop"
            },
            {
              name: "DataVision",
              description: "AI-powered analytics platform", 
              image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop"
            },
            {
              name: "CloudScale",
              description: "Enterprise cloud infrastructure",
              image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop"
            },
            {
              name: "InnovateLab",
              description: "Research & development hub",
              image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop"
            },
            {
              name: "DigitalCore",
              description: "Digital transformation specialists",
              image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop"
            },
            {
              name: "FutureStack",
              description: "Modern development framework",
              image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop"
            },
            {
              name: "SmartSystems",
              description: "Intelligent automation solutions",
              image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop"
            },
            {
              name: "CodeCraft",
              description: "Premium software craftsmanship",
              image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop"
            }
          ].map((brand, idx) => (
            <div 
              key={idx}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
            >
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="w-full h-48 rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-gray-100 to-gray-200">
                  <img 
                    src={brand.image} 
                    alt={brand.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-purple-700 transition-colors duration-300">
                  {brand.name}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {brand.description}
                </p>
                
                {/* Decorative element */}
                <div className="absolute top-6 right-6 w-4 h-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Hover effect border */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-purple-200 transition-all duration-300"></div>
            </div>
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