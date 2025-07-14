import { useState } from "react";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AnimatedBrandCard from "./AnimatedBrandCard";
import { RunwareService } from "@/lib/runware";

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
  const [query, setQuery] = useState("");
  const [generatedImages, setGeneratedImages] = useState<{[key: string]: string}>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentlyGenerating, setCurrentlyGenerating] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      console.log("Demo query:", query);
    }
  };

  const brandPrompts = {
    'long-short': {
      grayscale: "Professional embossed silver card design, The Long & Short hedge fund theme, financial charts and graphs, bull and bear market symbols, elegant monochromatic silver tones, embossed metallic texture, sophisticated financial aesthetic, trading floor elements, grayscale",
      color: "Professional embossed silver card design, The Long & Short hedge fund theme, financial charts and graphs, bull and bear market symbols, rich blue and gold accents, embossed metallic texture, sophisticated financial aesthetic, trading floor elements, premium colors"
    },
    'infraledger': {
      grayscale: "Professional embossed silver card design, InfraLedger infrastructure theme, modern bridges and smart city elements, power grids and construction symbols, elegant monochromatic silver tones, embossed metallic texture, engineering aesthetic, grayscale",
      color: "Professional embossed silver card design, InfraLedger infrastructure theme, modern bridges and smart city elements, power grids and construction symbols, deep green and steel blue accents, embossed metallic texture, engineering aesthetic, premium colors"
    },
    'allocator': {
      grayscale: "Professional embossed silver card design, The Allocator's Almanac theme, portfolio allocation diagrams, institutional investment symbols, balance scales and charts, elegant monochromatic silver tones, embossed metallic texture, institutional aesthetic, grayscale",
      color: "Professional embossed silver card design, The Allocator's Almanac theme, portfolio allocation diagrams, institutional investment symbols, balance scales and charts, rich purple and gold accents, embossed metallic texture, institutional aesthetic, premium colors"
    },
    'natural-currency': {
      grayscale: "Professional embossed silver card design, Natural Currency commodities theme, gold bars and oil symbols, agricultural products and natural resources, elegant monochromatic silver tones, embossed metallic texture, commodities trading aesthetic, grayscale",
      color: "Professional embossed silver card design, Natural Currency commodities theme, gold bars and oil symbols, agricultural products and natural resources, warm amber and earth tone accents, embossed metallic texture, commodities trading aesthetic, premium colors"
    },
    'debt-capital': {
      grayscale: "Professional embossed silver card design, Debt Capital Chronicles theme, bonds and lending documents, capital structure diagrams, financial instruments, elegant monochromatic silver tones, embossed metallic texture, corporate finance aesthetic, grayscale",
      color: "Professional embossed silver card design, Debt Capital Chronicles theme, bonds and lending documents, capital structure diagrams, financial instruments, deep red and silver accents, embossed metallic texture, corporate finance aesthetic, premium colors"
    },
    'carry-conquer': {
      grayscale: "Professional embossed silver card design, Carry and Conquer private equity theme, growth arrows and acquisition symbols, business expansion elements, elegant monochromatic silver tones, embossed metallic texture, private equity aesthetic, grayscale",
      color: "Professional embossed silver card design, Carry and Conquer private equity theme, growth arrows and acquisition symbols, business expansion elements, bold orange and black accents, embossed metallic texture, private equity aesthetic, premium colors"
    },
    'landlord-ledger': {
      grayscale: "Professional embossed silver card design, Landlord Ledger real estate theme, modern buildings and property portfolios, keys and real estate symbols, elegant monochromatic silver tones, embossed metallic texture, real estate aesthetic, grayscale",
      color: "Professional embossed silver card design, Landlord Ledger real estate theme, modern buildings and property portfolios, keys and real estate symbols, rich teal and copper accents, embossed metallic texture, real estate aesthetic, premium colors"
    },
    'republic': {
      grayscale: "Professional embossed silver card design, Republic public markets theme, stock exchange and trading floor elements, public market symbols and charts, elegant monochromatic silver tones, embossed metallic texture, public markets aesthetic, grayscale",
      color: "Professional embossed silver card design, Republic public markets theme, stock exchange and trading floor elements, public market symbols and charts, patriotic blue and red accents, embossed metallic texture, public markets aesthetic, premium colors"
    }
  };

  const generateAllImages = async () => {
    setIsGenerating(true);
    const apiKey = "2VyUGYZi0jAxOcmctIJX3um3kZMoTOXV";
    const runware = new RunwareService(apiKey);

    try {
      toast.success("Starting image generation for all 8 brands...");
      
      for (const [brandKey, prompts] of Object.entries(brandPrompts)) {
        setCurrentlyGenerating(`${brandKey} (grayscale)`);
        
        // Generate grayscale version
        const grayscaleResult = await runware.generateImage({
          positivePrompt: prompts.grayscale,
          model: "runware:100@1",
          CFGScale: 7,
          scheduler: "FlowMatchEulerDiscreteScheduler",
          outputFormat: "WEBP"
        });

        setCurrentlyGenerating(`${brandKey} (color)`);
        
        // Generate color version
        const colorResult = await runware.generateImage({
          positivePrompt: prompts.color,
          model: "runware:100@1",
          CFGScale: 7,
          scheduler: "FlowMatchEulerDiscreteScheduler",
          outputFormat: "WEBP"
        });

        setGeneratedImages(prev => ({
          ...prev,
          [`${brandKey}-grayscale`]: grayscaleResult.imageURL,
          [`${brandKey}-color`]: colorResult.imageURL
        }));

        toast.success(`Generated images for ${brandKey}`);
      }
      
      toast.success("All brand images generated successfully!");
    } catch (error) {
      console.error("Error generating images:", error);
      toast.error("Failed to generate images. Please try again.");
    } finally {
      setIsGenerating(false);
      setCurrentlyGenerating('');
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

      {/* Generate Images Button */}
      <div className="flex items-center justify-center mb-8">
        <Button 
          onClick={generateAllImages}
          disabled={isGenerating}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg"
        >
          {isGenerating ? `Generating ${currentlyGenerating}...` : "Generate Better Images"}
        </Button>
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
              description: "",
              grayscaleImage: generatedImages['long-short-grayscale'] || longShortGrayNew,
              colorImage: generatedImages['long-short-color'] || longShortColor,
              detailedDescription: "Advanced hedge fund strategies combining quantitative analysis with traditional long/short equity approaches. Real-time market sentiment tracking and algorithmic trading signals for institutional investors.",
              link: "https://longshorthf.substack.com/"
            },
            { 
              name: "InfraLedger", 
              description: "",
              grayscaleImage: generatedImages['infraledger-grayscale'] || infraLedgerGrayNew,
              colorImage: generatedImages['infraledger-color'] || infraLedgerColor,
              detailedDescription: "Infrastructure investment tracking - Global platform for transportation, renewable energy, and smart city investments with sustainable infrastructure opportunities.",
              link: "https://theinfraledger.substack.com/"
            },
            { 
              name: "The Allocator's Almanac", 
              description: "",
              grayscaleImage: generatedImages['allocator-grayscale'] || allocatorGrayNew,
              colorImage: generatedImages['allocator-color'] || allocatorColor,
              detailedDescription: "Sophisticated portfolio allocation tools for institutional investors including pension funds, endowments, and family offices. Advanced risk management and diversification strategies across multiple asset classes.",
              link: "https://allocatorsalmanac.substack.com/"
            },
            { 
              name: "Natural Currency", 
              description: "",
              grayscaleImage: generatedImages['natural-currency-grayscale'] || naturalCurrencyGrayNew,
              colorImage: generatedImages['natural-currency-color'] || naturalCurrencyColor,
              detailedDescription: "Comprehensive commodities trading platform covering precious metals, energy resources, and agricultural products. Real-time market data and supply chain analytics for natural resource investments.",
              link: "https://naturalcurrency.substack.com/"
            },
            { 
              name: "Debt Capital Chronicles", 
              description: "",
              grayscaleImage: generatedImages['debt-capital-grayscale'] || debtCapitalGrayNew,
              colorImage: generatedImages['debt-capital-color'] || debtCapitalColor,
              detailedDescription: "Private debt marketplace connecting institutional lenders with corporate borrowers. Structured credit products, direct lending opportunities, and comprehensive credit risk assessment tools.",
              link: "https://debtcapitalchronicles.substack.com/"
            },
            { 
              name: "Carry and Conquer", 
              description: "",
              grayscaleImage: generatedImages['carry-conquer-grayscale'] || carryConquerGrayNew,
              colorImage: generatedImages['carry-conquer-color'] || carryConquerColor,
              detailedDescription: "Elite private equity platform featuring growth capital, buyout opportunities, and venture investments. Comprehensive due diligence tools and portfolio company performance tracking for institutional investors.",
              link: "https://carryandconquer.substack.com/"
            },
            { 
              name: "Landlord Ledger", 
              description: "",
              grayscaleImage: generatedImages['landlord-ledger-grayscale'] || landlordLedgerGrayNew,
              colorImage: generatedImages['landlord-ledger-color'] || landlordLedgerColor,
              detailedDescription: "Institutional real estate investment platform covering commercial properties, residential developments, and REITs. Advanced property analytics, market trends, and portfolio optimization tools.",
              link: "https://landlordledger.substack.com/"
            },
            { 
              name: "Republic", 
              description: "",
              grayscaleImage: generatedImages['republic-grayscale'] || republicGrayNew,
              colorImage: generatedImages['republic-color'] || republicColor,
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