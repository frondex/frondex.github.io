import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import { ChevronDown, Copy, ThumbsUp, ThumbsDown, RotateCcw, Volume2, Share, Crown, Settings, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Pricing } from "@/components/ui/pricing-cards";
import { OpenAISettings } from "./OpenAISettings";
import { AnamSettings } from "./AnamSettings";
import { PrivateMarketsSettings } from "./PrivateMarketsSettings";
import { OpenAIService, type ChatMessage } from "@/lib/openai";
import { PrivateMarketsService, type PrivateMarketsResponse, type PrivateMarketsEntity, type PrivateMarketsSuggestion } from "@/lib/private-markets";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SignupPrompt } from "./SignupPrompt";
import { JoinWaitlistModal } from "./JoinWaitlistModal";
import AnimatedBrandCard from "./AnimatedBrandCard";
import { User } from "@supabase/supabase-js";

// Import all generated images
import longShortGrayNew from "@/assets/long-short-grayscale-new.jpg";
import longShortColor from "@/assets/long-short-color.jpg";
// import infraLedgerGrayNew from "@/assets/infraledger-grayscale-new.jpg";
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

interface Message {
  id: number;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  entities?: PrivateMarketsEntity[];
  suggestions?: PrivateMarketsSuggestion[];
  visualizations?: any[];
}

interface InteractiveDemoProps {
  user?: User | null;
}

const InteractiveDemo = ({ user }: InteractiveDemoProps) => {
  const [showChatView, setShowChatView] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
  const [showPricing, setShowPricing] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
  const [queryCount, setQueryCount] = useState(0);
  const [currentService, setCurrentService] = useState<'openai' | 'private-markets'>('private-markets');
  const [privateMarketsService, setPrivateMarketsService] = useState<PrivateMarketsService | null>(null);
  const { toast } = useToast();

  const handleChatSubmit = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setInitialQuery(query);
    setShowChatView(true);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: query,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      if (currentService === 'private-markets') {
        // Initialize Private Markets service if not already done
        if (!privateMarketsService) {
          const settings = PrivateMarketsService.getSettings();
          const service = new PrivateMarketsService(settings);
          await service.initSession();
          setPrivateMarketsService(service);
        }
        
        const response = await (privateMarketsService || new PrivateMarketsService(PrivateMarketsService.getSettings())).sendMessage(query);
        
        const assistantMessage: Message = {
          id: Date.now() + 1,
          type: "assistant",
          content: response.message,
          timestamp: new Date(),
          entities: response.entities,
          suggestions: response.suggestions,
          visualizations: response.visualizations,
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // OpenAI fallback
        const chatMessages: ChatMessage[] = [{ role: 'user', content: query }];
        const response = await OpenAIService.sendMessage(chatMessages);
        
        const assistantMessage: Message = {
          id: Date.now() + 1,
          type: "assistant", 
          content: response,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: "assistant",
        content: `I'm sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentService, privateMarketsService]);

  const handleSignup = () => {
    setShowSignupPrompt(false);
    toast({
      title: "Sign Up",
      description: "Redirecting to sign up page...",
    });
  };

  const handleLogin = () => {
    setShowSignupPrompt(false);
    toast({
      title: "Log In", 
      description: "Redirecting to login page...",
    });
  };

  const handleMessageAction = (action: string, messageId: number) => {
    // Handle message actions like copy, thumbs up, etc.
    console.log(`Action: ${action} for message: ${messageId}`);
  };

  const scrollToBrands = () => {
    const brandsSection = document.getElementById('brands-section');
    if (brandsSection) {
      brandsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!showChatView) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-50 relative">
        {/* Top Right Controls */}
        <div className="fixed top-4 right-4 z-10 flex items-center gap-2">
          {!user ? (
            <Button 
              asChild
              variant="outline"
              className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Link to="/auth">
                <Crown className="w-4 h-4" />
                Log In or Sign Up
              </Link>
            </Button>
          ) : (
            <Button 
              className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              onClick={() => {
                console.log('Upgrade button clicked, showPricing before:', showPricing);
                setShowPricing(true);
                console.log('Upgrade button clicked, showPricing after setShowPricing(true)');
              }}
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro
            </Button>
          )}
        </div>

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
        <div className="w-full max-w-4xl mb-16">
          <VercelV0Chat onSubmit={handleChatSubmit} />
        </div>
        
        {/* Scroll Down Indicator */}
        <div className="flex flex-col items-center mb-32">
          <button
            onClick={scrollToBrands}
            className="group flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            aria-label="Scroll to brands section"
          >
            <span className="text-sm font-medium">Explore Our Brands</span>
            <ChevronDown 
              className="h-6 w-6 animate-bounce group-hover:translate-y-1 transition-transform duration-200" 
            />
          </button>
        </div>
        
        {/* Our Brands Section */}
        <section id="brands-section" className="w-full max-w-7xl px-6">
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
                name: "Carry and Conquer", 
                description: "",
                grayscaleImage: "/lovable-uploads/3f43d804-c779-497c-84af-f344445d637e.png",
                colorImage: carryConquerColor,
                detailedDescription: "Analysis and insights on private equity, covering key transactions, market trends, and firm strategies.",
                link: "https://carryandconquer.github.io/"
              },
              { 
                name: "Landlord Ledger", 
                description: "",
                grayscaleImage: "/lovable-uploads/aef212a4-3d8f-4d55-848b-f4038a325eb7.png",
                colorImage: landlordLedgerColor,
                detailedDescription: "Insights and analysis on real estate, covering market trends, key deals, and investment strategies shaping the industry.",
                link: "https://thelandlordledger.github.io/"
              },
              { 
                name: "InfraLedger", 
                description: "",
                grayscaleImage: "/lovable-uploads/b4ce8e3a-c44e-4bf9-8709-8d3175ceac17.png",
                colorImage: infraLedgerColor,
                detailedDescription: "Insights and analysis on infrastructure investing, covering key projects, capital flows, and market trends shaping global development.",
                link: "https://infraledger.github.io/"
              },
              { 
                name: "The Long & Short", 
                description: "",
                grayscaleImage: "/lovable-uploads/f74daaa2-426f-4449-a037-75ae04104ef6.png",
                colorImage: longShortColor,
                detailedDescription: "Insights and analysis on hedge funds, covering market trends, fund strategies, and key moves shaping the industry.",
                link: "https://thelongshort.github.io/"
              },
              { 
                name: "Natural Currency", 
                description: "",
                grayscaleImage: "/lovable-uploads/b71bf268-6fe7-4ed4-b3e0-4a604f452fd0.png",
                colorImage: naturalCurrencyColor,
                detailedDescription: "Explores the dynamic world of natural resource transactions, delving into the value, trade, and sustainability of earth's most precious assets.",
                link: "https://naturalcurrency.github.io/"
              },
              { 
                name: "Debt Capital Chronicles", 
                description: "",
                grayscaleImage: "/lovable-uploads/2f36adb1-6c20-470c-a2c8-3eb23c28f831.png",
                colorImage: debtCapitalColor,
                detailedDescription: "Insights and analysis on private debt, covering credit markets, direct lending, and key trends shaping the industry.",
                link: "https://debtcapitalchronicles.github.io/"
              },
              { 
                name: "The Allocator's Almanac", 
                description: "",
                grayscaleImage: "/lovable-uploads/efc117d7-1c03-438b-b3db-b0a9c3e78fcc.png",
                colorImage: allocatorColor,
                detailedDescription: "Providing in-depth insights into institutional investors' transactions, market movements, and capital allocation strategies.",
                link: "https://allocatorsalmanac.github.io/"
              },
              { 
                name: "Dividenz", 
                description: "",
                grayscaleImage: "/lovable-uploads/7e131ed6-c038-487d-8493-87b5caf06016.png",
                colorImage: "/lovable-uploads/7e131ed6-c038-487d-8493-87b5caf06016.png",
                detailedDescription: "Insights on the global public markets",
                link: "https://dividenz.github.io/"
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
          <p>Frondex can make mistakes. <a href="/admin" className="text-gray-600 hover:text-gray-800">Please</a> double-check responses.</p>
        </div>
      </div>
    );
  }

  // Chat view layout - same VercelV0Chat component, just positioned at bottom
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with back button and logo */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white border-b">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowChatView(false)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <img 
            src="/lovable-uploads/160f2a0f-b791-4f94-8817-0cd61d047a14.png" 
            alt="Frondex" 
            className="h-8 w-auto"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            onClick={() => {
              console.log('Chat view upgrade button clicked');
              setShowWaitlistModal(true);
            }}
          >
            <Crown className="w-4 h-4" />
            Upgrade
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}>
                {message.type === "user" ? (
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 text-right">
                    <div className="text-gray-900 text-sm">{message.content}</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-gray-900 text-base leading-relaxed prose prose-gray max-w-none">
                      {message.type === "assistant" ? (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                            h1: ({ children }) => <h1 className="text-xl font-semibold mb-3 text-gray-900">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-gray-900">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-base font-semibold mb-2 text-gray-900">{children}</h3>,
                            ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-gray-900">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                            em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                            code: ({ children }) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">{children}</code>,
                            pre: ({ children }) => <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                            blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-4">{children}</blockquote>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="mb-0">{message.content}</p>
                      )}
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-5 bg-gray-800 ml-1 animate-pulse" />
                      )}
                    </div>
                     
                     {/* Rich content for Private Markets responses */}
                     {message.entities && message.entities.length > 0 && (
                       <div className="mt-4 space-y-3">
                         <h4 className="font-semibold text-gray-900">Key Information:</h4>
                         <div className="grid gap-3">
                           {message.entities.map((entity, index) => (
                             <div key={entity.id || index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                               <div className="flex justify-between items-start">
                                 <div>
                                   <h5 className="font-semibold text-gray-900">{entity.name}</h5>
                                   <p className="text-sm text-gray-600">{entity.type}</p>
                                   {entity.location && <p className="text-sm text-gray-500">{entity.location}</p>}
                                 </div>
                                 <div className="text-right">
                                   {entity.aumFormatted && (
                                     <div className="text-lg font-bold text-gray-900">{entity.aumFormatted}</div>
                                   )}
                                   {entity.rank && (
                                     <div className="text-sm text-gray-500">Rank #{entity.rank}</div>
                                   )}
                                 </div>
                               </div>
                               {entity.highlight && (
                                 <p className="mt-2 text-sm text-gray-700 font-medium">{entity.highlight}</p>
                               )}
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Suggestions */}
                     {message.suggestions && message.suggestions.length > 0 && (
                       <div className="mt-4">
                         <h4 className="font-semibold text-gray-900 mb-3">Suggested follow-ups:</h4>
                         <div className="flex flex-wrap gap-2">
                           {message.suggestions.map((suggestion, index) => (
                             <Button
                               key={index}
                               variant="outline"
                               size="sm"
                               onClick={() => handleChatSubmit(suggestion.text)}
                               className="text-sm"
                             >
                               {suggestion.text}
                             </Button>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Visualizations */}
                     {message.visualizations && message.visualizations.length > 0 && (
                       <div className="mt-4">
                         <h4 className="font-semibold text-gray-900 mb-3">Suggested Charts:</h4>
                         <div className="space-y-2">
                           {message.visualizations.map((viz, index) => (
                             <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                               <div className="flex items-center gap-2">
                                 <span className="text-lg">📊</span>
                                 <div>
                                   <p className="font-medium text-amber-900">{viz.title}</p>
                                   <p className="text-sm text-amber-700">{viz.description}</p>
                                 </div>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Action buttons for AI messages */}
                     {!message.isStreaming && (
                       <div className="flex items-center gap-2 mt-4">
                         <button
                           onClick={() => {
                             navigator.clipboard.writeText(message.content);
                             toast({ title: "Copied to clipboard" });
                           }}
                           className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                           title="Copy"
                         >
                           <Copy className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                         </button>
                        <button
                          onClick={() => handleMessageAction('thumbsUp', message.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                          title="Good response"
                        >
                          <ThumbsUp className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                        </button>
                        <button
                          onClick={() => handleMessageAction('thumbsDown', message.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                          title="Bad response"
                        >
                          <ThumbsDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                        </button>
                        <button
                          onClick={() => handleMessageAction('regenerate', message.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                          title="Regenerate"
                        >
                          <RotateCcw className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                        </button>
                        <button
                          onClick={() => handleMessageAction('speak', message.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                          title="Read aloud"
                        >
                          <Volume2 className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                        </button>
                        <button
                          onClick={() => handleMessageAction('share', message.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                          title="Share"
                        >
                          <Share className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat input fixed at bottom - same VercelV0Chat component */}
      <div className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto relative">
          <VercelV0Chat onSubmit={handleChatSubmit} />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            </div>
          )}
        </div>
      </div>
      
      {/* Signup Prompt Modal */}
        <SignupPrompt
          open={showSignupPrompt}
          onOpenChange={setShowSignupPrompt}
          onSignup={handleSignup}
          onLogin={handleLogin}
        />
        
        <JoinWaitlistModal
          open={showWaitlistModal}
          onOpenChange={setShowWaitlistModal}
        />

        <Dialog open={showPricing} onOpenChange={setShowPricing}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
            <div className="p-6">
              <Pricing />
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default InteractiveDemo;