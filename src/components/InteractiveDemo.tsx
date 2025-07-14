import { useState } from "react";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import AnimatedBrandCard from "./AnimatedBrandCard";

// Import all generated images
import longShortGray from "@/assets/long-short-grayscale.jpg";
import longShortColor from "@/assets/long-short-color.jpg";
import infraLedgerGray from "/lovable-uploads/25257823-3fe9-4deb-adbe-c27f2e30fe2f.png";
import infraLedgerColor from "@/assets/infraledger-color.jpg";
import allocatorGray from "@/assets/allocator-grayscale.jpg";
import allocatorColor from "@/assets/allocator-color.jpg";
import naturalCurrencyGray from "@/assets/natural-currency-grayscale.jpg";
import naturalCurrencyColor from "@/assets/natural-currency-color.jpg";
import debtCapitalGray from "@/assets/debt-capital-grayscale.jpg";
import debtCapitalColor from "@/assets/debt-capital-color.jpg";
import carryConquerGray from "@/assets/carry-conquer-grayscale.jpg";
import carryConquerColor from "@/assets/carry-conquer-color.jpg";
import landlordLedgerGray from "@/assets/landlord-ledger-grayscale.jpg";
import landlordLedgerColor from "@/assets/landlord-ledger-color.jpg";
import republicGray from "@/assets/republic-grayscale.jpg";
import republicColor from "@/assets/republic-color.jpg";

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
              description: "Hedge fund strategies and market analysis",
              grayscaleImage: longShortGray,
              colorImage: longShortColor,
              detailedDescription: "Advanced hedge fund strategies combining quantitative analysis with traditional long/short equity approaches. Real-time market sentiment tracking and algorithmic trading signals for institutional investors."
            },
            { 
              name: "InfraLedger", 
              description: "",
              grayscaleImage: infraLedgerGray,
              colorImage: infraLedgerColor,
              detailedDescription: "Infrastructure investment tracking - Global platform for transportation, renewable energy, and smart city investments with sustainable infrastructure opportunities."
            },
            { 
              name: "The Allocator's Almanac", 
              description: "Institutional investment allocation",
              grayscaleImage: allocatorGray,
              colorImage: allocatorColor,
              detailedDescription: "Sophisticated portfolio allocation tools for institutional investors including pension funds, endowments, and family offices. Advanced risk management and diversification strategies across multiple asset classes."
            },
            { 
              name: "Natural Currency", 
              description: "Natural resources and commodities",
              grayscaleImage: naturalCurrencyGray,
              colorImage: naturalCurrencyColor,
              detailedDescription: "Comprehensive commodities trading platform covering precious metals, energy resources, and agricultural products. Real-time market data and supply chain analytics for natural resource investments."
            },
            { 
              name: "Debt Capital Chronicles", 
              description: "Private debt and credit markets",
              grayscaleImage: debtCapitalGray,
              colorImage: debtCapitalColor,
              detailedDescription: "Private debt marketplace connecting institutional lenders with corporate borrowers. Structured credit products, direct lending opportunities, and comprehensive credit risk assessment tools."
            },
            { 
              name: "Carry and Conquer", 
              description: "Private equity opportunities",
              grayscaleImage: carryConquerGray,
              colorImage: carryConquerColor,
              detailedDescription: "Elite private equity platform featuring growth capital, buyout opportunities, and venture investments. Comprehensive due diligence tools and portfolio company performance tracking for institutional investors."
            },
            { 
              name: "Landlord Ledger", 
              description: "Real estate investment platform",
              grayscaleImage: landlordLedgerGray,
              colorImage: landlordLedgerColor,
              detailedDescription: "Institutional real estate investment platform covering commercial properties, residential developments, and REITs. Advanced property analytics, market trends, and portfolio optimization tools."
            },
            { 
              name: "Republic", 
              description: "Public markets and equity research",
              grayscaleImage: republicGray,
              colorImage: republicColor,
              detailedDescription: "Comprehensive public markets research platform with institutional-grade equity analysis, market intelligence, and trading execution. Advanced charting tools and fundamental analysis for professional investors."
            }
          ].map((brand, idx) => (
            <AnimatedBrandCard
              key={idx}
              name={brand.name}
              description={brand.description}
              grayscaleImage={brand.grayscaleImage}
              colorImage={brand.colorImage}
              detailedDescription={brand.detailedDescription}
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