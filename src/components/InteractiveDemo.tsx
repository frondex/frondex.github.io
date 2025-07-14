import { useState } from "react";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import AnimatedBrandCard from "./AnimatedBrandCard";
import ChatConversationView from "./ChatConversationView";

// Import all generated images
import longShortGrayNew from "@/assets/long-short-grayscale-new.jpg";
import longShortColor from "@/assets/long-short-color.jpg";
import infraLedgerGrayNew from "@/assets/infraledger-grayscale-new.jpg";
import infraLedgerColor from "@/assets/infraledger-color.jpg";
import allocatorGrayNew from "@/assets/allocator-grayscale-new.jpg";
import allocatorColor from "@/assets/allocator-color.jpg";
import naturalCurrencyGrayNew from "@/assets/natural-currency-grayscale-new.jpg";
import naturalCurrencyColor from "@/assets/natural-currency-color.jpg";
import debtCapitalGrayNew from "@/assets/debt-capital-grayscale-new.jpg";
import debtCapitalColor from "@/assets/debt-capital-color.jpg";
import carryConquerGrayNew from "@/assets/carry-conquer-grayscale-new.jpg";
import carryConquerColor from "@/assets/carry-conquer-color.jpg";
import landlordLedgerGrayNew from "@/assets/landlord-ledger-grayscale-new.jpg";
import landlordLedgerColor from "@/assets/landlord-ledger-color.jpg";
import republicGrayNew from "@/assets/republic-grayscale-new.jpg";
import republicColor from "@/assets/republic-color.jpg";

const InteractiveDemo = () => {
  const [showChatView, setShowChatView] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");

  const handleChatSubmit = (query: string) => {
    setInitialQuery(query);
    setShowChatView(true);
  };

  if (showChatView) {
    return (
      <ChatConversationView 
        onBack={() => setShowChatView(false)}
        initialQuery={initialQuery}
      />
    );
  }

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
        <VercelV0Chat onSubmit={handleChatSubmit} />
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
              description: "",
              grayscaleImage: longShortGrayNew,
              colorImage: longShortColor,
              detailedDescription: "Advanced hedge fund strategies combining quantitative analysis with traditional long/short equity approaches. Real-time market sentiment tracking and algorithmic trading signals for institutional investors.",
              link: "https://longshorthf.substack.com/"
            },
            { 
              name: "InfraLedger", 
              description: "",
              grayscaleImage: infraLedgerGrayNew,
              colorImage: infraLedgerColor,
              detailedDescription: "Infrastructure investment tracking - Global platform for transportation, renewable energy, and smart city investments with sustainable infrastructure opportunities.",
              link: "https://theinfraledger.substack.com/"
            },
            { 
              name: "The Allocator's Almanac", 
              description: "",
              grayscaleImage: allocatorGrayNew,
              colorImage: allocatorColor,
              detailedDescription: "Sophisticated portfolio allocation tools for institutional investors including pension funds, endowments, and family offices. Advanced risk management and diversification strategies across multiple asset classes.",
              link: "https://allocatorsalmanac.substack.com/"
            },
            { 
              name: "Natural Currency", 
              description: "",
              grayscaleImage: naturalCurrencyGrayNew,
              colorImage: naturalCurrencyColor,
              detailedDescription: "Comprehensive commodities trading platform covering precious metals, energy resources, and agricultural products. Real-time market data and supply chain analytics for natural resource investments.",
              link: "https://naturalcurrency.substack.com/"
            },
            { 
              name: "Debt Capital Chronicles", 
              description: "",
              grayscaleImage: debtCapitalGrayNew,
              colorImage: debtCapitalColor,
              detailedDescription: "Private debt marketplace connecting institutional lenders with corporate borrowers. Structured credit products, direct lending opportunities, and comprehensive credit risk assessment tools.",
              link: "https://debtcapitalchronicles.substack.com/"
            },
            { 
              name: "Carry and Conquer", 
              description: "",
              grayscaleImage: carryConquerGrayNew,
              colorImage: carryConquerColor,
              detailedDescription: "Elite private equity platform featuring growth capital, buyout opportunities, and venture investments. Comprehensive due diligence tools and portfolio company performance tracking for institutional investors.",
              link: "https://carryandconquer.substack.com/"
            },
            { 
              name: "Landlord Ledger", 
              description: "",
              grayscaleImage: landlordLedgerGrayNew,
              colorImage: landlordLedgerColor,
              detailedDescription: "Institutional real estate investment platform covering commercial properties, residential developments, and REITs. Advanced property analytics, market trends, and portfolio optimization tools.",
              link: "https://landlordledger.substack.com/"
            },
            { 
              name: "Republic", 
              description: "",
              grayscaleImage: republicGrayNew,
              colorImage: republicColor,
              detailedDescription: "Comprehensive public markets research platform with institutional-grade equity analysis, market intelligence, and trading execution. Advanced charting tools and fundamental analysis for professional investors.",
              link: "https://www.frondex.com/"
            }
          ].map((brand, idx) => (
            <AnimatedBrandCard
              key={idx}
              name={brand.name}
              description={brand.description}
              grayscaleImage={brand.grayscaleImage}
              colorImage={brand.colorImage}
              detailedDescription={brand.detailedDescription}
              link={brand.link}
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