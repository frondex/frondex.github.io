import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import { ChevronDown, Copy, ThumbsUp, ThumbsDown, RotateCcw, Volume2, Share, Crown, Settings, Loader2, ArrowLeft, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ModernPricingSection } from "./ModernPricingSection";
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
import { supabase } from "@/integrations/supabase/client";
import CreditDisplay from "./CreditDisplay";
import { useCredits } from "@/hooks/useCredits";
import { useUserRole } from "@/hooks/useUserRole";
import UserAccountDropdown from "./UserAccountDropdown";
import EnhancedChatView from "./EnhancedChatView";
import ThreeDotsLoader from "./ui/three-dots-loader";
import ModernChatSidebar from "./ModernChatSidebar";
import ComingSoonPage from "./ComingSoonPage";
import { useChatSessions } from "@/hooks/useChatSessions";
import { ConnectWalletHeaderButton } from "./ConnectWalletHeaderButton";

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
  attachment?: File;
  attachmentUrl?: string;
}

interface InteractiveDemoProps {
  user?: User | null;
}

const InteractiveDemo = ({ user }: InteractiveDemoProps) => {
  const navigate = useNavigate();
  const [showChatView, setShowChatView] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
  const [queryCount, setQueryCount] = useState(0);
  const [currentService, setCurrentService] = useState<'openai' | 'private-markets'>('private-markets');
  const [privateMarketsService, setPrivateMarketsService] = useState<PrivateMarketsService | null>(null);
  const [currentChatSessionId, setCurrentChatSessionId] = useState<string | null>(null);
  const { credits, useCredits: deductCredits } = useCredits();
  const { isAdmin } = useUserRole();
  const { createSession, refreshSessions } = useChatSessions();
  const { toast } = useToast();

  const loadChatSession = useCallback(async (sessionId: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setShowChatView(true);
      setCurrentChatSessionId(sessionId);
      
      // Fetch messages for this session
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_session_id', sessionId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      // Convert database messages to UI messages
      const loadedMessages: Message[] = messagesData?.map((msg, index) => ({
        id: index,
        type: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: new Date(msg.created_at),
      })) || [];
      
      setMessages(loadedMessages);
      
    } catch (error) {
      console.error('Error loading chat session:', error);
      toast({
        title: "Error",
        description: "Failed to load chat session",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setCurrentChatSessionId(null);
    setShowChatView(false);
    setInitialQuery("");
  }, []);

  const handleChatSubmit = useCallback(async (query: string, attachments?: File[]) => {
    const file = attachments && attachments.length > 0 ? attachments[0] : undefined;
    if (!query.trim()) return;
    
    // Check if user is authenticated
    if (!user) {
      window.location.href = "/auth";
      return;
    }

    // Check credits for all users (including admins for testing)
    if (credits < 1) {
      toast({
        title: "Insufficient credits",
        description: "You need at least 1 credit to send a message. Please upgrade your plan or purchase more credits.",
        variant: "destructive"
      });
      return;
    }

    // Show chat view immediately when a message is submitted
    setShowChatView(true);
    setIsLoading(true);
    setInitialQuery(query);
    
    // Create new chat session if this is the first message
    let sessionId = currentChatSessionId;
    if (!sessionId && messages.length === 0) {
      // Generate a title from the first few words of the query
      const title = query.length > 50 ? query.substring(0, 47) + "..." : query;
      const newSession = await createSession(title);
      if (newSession) {
        sessionId = newSession.id;
        setCurrentChatSessionId(sessionId);
        refreshSessions(); // Update the sidebar
      }
    }
    
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: query,
      timestamp: new Date(),
      attachment: file,
      attachmentUrl: file ? URL.createObjectURL(file) : undefined,
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to database
    if (sessionId) {
      try {
        await supabase
          .from('chat_messages')
          .insert({
            chat_session_id: sessionId,
            user_id: user.id,
            content: query,
            role: 'user'
          });
      } catch (error) {
        console.error('Error saving user message:', error);
      }
    }
    
    
    // Deduct credits for all users (including admins for testing)
    const success = await deductCredits(1, 'Chat message', sessionId);
    if (!success) {
      toast({
        title: "Credit deduction failed",
        description: "Unable to process your message. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    try {

      if (currentService === 'private-markets') {
        // Initialize Private Markets service if not already done
        if (!privateMarketsService) {
          const settings = PrivateMarketsService.getSettings();
          const service = new PrivateMarketsService(settings);
          await service.initSession();
          setPrivateMarketsService(service);
        }
        
        const response = await (privateMarketsService || new PrivateMarketsService(PrivateMarketsService.getSettings())).sendMessage(query, file);
        
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
        
        // Save assistant message to database
        if (sessionId) {
          try {
            await supabase
              .from('chat_messages')
              .insert({
                chat_session_id: sessionId,
                user_id: user.id,
                content: response.message,
                role: 'assistant'
              });
            
            // Update session timestamp
            await supabase
              .from('chat_sessions')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', sessionId);
              
            refreshSessions(); // Update the sidebar with new message count
          } catch (error) {
            console.error('Error saving assistant message:', error);
          }
        }
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
        
        // Save assistant message to database
        if (sessionId) {
          try {
            await supabase
              .from('chat_messages')
              .insert({
                chat_session_id: sessionId,
                user_id: user.id,
                content: response,
                role: 'assistant'
              });
              
            // Update session timestamp
            await supabase
              .from('chat_sessions')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', sessionId);
              
            refreshSessions(); // Update the sidebar
          } catch (error) {
            console.error('Error saving assistant message:', error);
          }
        }
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
  }, [currentService, privateMarketsService, user, credits, deductCredits, toast, currentChatSessionId, messages.length, createSession, refreshSessions, isAdmin]);

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

  const handleUpgradeClick = () => {
    navigate('/subscription');
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
      <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-gray-50 relative">
        {/* Top Right Controls */}
        <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-10 flex gap-2">
          <ConnectWalletHeaderButton />
          {!user ? (
            <Button 
              asChild
              variant="outline"
              size="sm"
              className="gap-1 sm:gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 bg-white/90 backdrop-blur-sm shadow-sm text-xs sm:text-sm"
            >
              <Link to="/auth">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Log In or Sign Up</span>
                <span className="sm:hidden">Sign In</span>
              </Link>
            </Button>
          ) : (
            <UserAccountDropdown 
              user={user} 
              onUpgradeClick={handleUpgradeClick}
            />
          )}
        </div>

        {/* Logo */}
        <div className="mb-1 sm:mb-6 md:-mb-16 lg:-mb-20">
          <img 
            src="/lovable-uploads/160f2a0f-b791-4f94-8817-0cd61d047a14.png" 
            alt="Frondex" 
            className="h-32 sm:h-40 md:h-54 lg:h-72 w-auto mx-auto object-contain"
          />
        </div>
        
        {/* Main Heading */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16 max-w-3xl px-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-gray-900 leading-tight">
            What can I help with?
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">
            Your business copilot for smarter insights, sharper strategy, seamless execution.
          </p>
        </div>
        
        {/* Chat Input */}
        <div className="w-full max-w-4xl mb-8 sm:mb-12 md:mb-16 px-2">
          <VercelV0Chat onSubmit={(query, attachments) => handleChatSubmit(query, attachments)} />
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
        <section id="brands-section" className="w-full max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900">
              Our Brands
            </h2>
            <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-2">
              Discover the innovative companies and visionary brands that shape tomorrow's markets
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[
              { 
                name: "Landlord Ledger", 
                description: "",
                grayscaleImage: "/lovable-uploads/aef212a4-3d8f-4d55-848b-f4038a325eb7.png",
                colorImage: landlordLedgerColor,
                detailedDescription: "Insights and analysis on real estate, covering market trends, key deals, and investment strategies shaping the industry.",
                link: "https://thelandlordledger.github.io/"
              },
              { 
                name: "Carry and Conquer", 
                description: "",
                grayscaleImage: "/lovable-uploads/3f43d804-c779-497c-84af-f344445d637e.png",
                colorImage: carryConquerColor,
                detailedDescription: "Analysis and insights on private equity, covering key transactions, market trends, and firm strategies.",
                link: "https://carryandconquer.github.io/"
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
            ].map((brand, idx) => {
              const handleCardClick = async () => {
                if (!user) {
                  toast({
                    title: "Authentication required",
                    description: "Please sign in to explore brands.",
                    variant: "destructive"
                  });
                  return;
                }


                // Open the brand link
                window.open(brand.link, '_blank');
                
                toast({
                  title: "Brand Explored!",
                  description: `You've successfully explored ${brand.name}.`,
                });
              };

              return (
                <div key={idx} onClick={handleCardClick} className="cursor-pointer">
                  <AnimatedBrandCard
                    name={brand.name}
                    description={brand.description}
                    grayscaleImage={brand.grayscaleImage}
                    colorImage={brand.colorImage}
                    detailedDescription={brand.detailedDescription}
                    link={brand.link}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer Text */}
        <div className="text-center text-sm text-gray-600 max-w-lg">
          <p>Frondex can make mistakes. <a href="/admin" className="text-gray-600 hover:text-gray-800">Please</a> double-check responses.</p>
        </div>

      </div>
    );
  }

  // Chat view layout - restored original with mobile optimizations
  return (
    <>
      <div className="flex h-screen bg-background">
        {/* Modern Chat Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <ModernChatSidebar 
            onNewChat={handleNewChat}
            onSelectChat={loadChatSession}
            currentChatId={currentChatSessionId || undefined}
            onBackToHome={() => setShowChatView(false)}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with back button and user dropdown */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 p-2 sm:p-4 bg-white border-b">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowChatView(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Frondex AI</span>
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <UserAccountDropdown 
                  user={user} 
                  onUpgradeClick={() => setShowWaitlistModal(true)}
                />
              ) : (
                <Button 
                  asChild
                  variant="outline"
                  size="sm"
                  className="gap-1 sm:gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 text-xs sm:text-sm"
                >
                  <Link to="/auth">
                    <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Log In</span>
                    <span className="sm:hidden">Sign In</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Messages area - mobile optimized */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 bg-white">
            <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] sm:max-w-[85%] md:max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}>
                    {message.type === "user" ? (
                      <div className="bg-primary text-primary-foreground rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-right">
                        <div className="text-sm sm:text-base break-words">{message.content}</div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-muted/50 rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0 text-sm sm:text-base leading-relaxed">{children}</p>,
                                h1: ({ children }) => <h1 className="text-lg sm:text-xl font-bold mb-3 text-foreground">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base sm:text-lg font-semibold mb-2 text-foreground">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm sm:text-base font-medium mb-2 text-foreground">{children}</h3>,
                                ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4 text-sm sm:text-base space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="mb-2 last:mb-0 pl-4 text-sm sm:text-base space-y-1 list-decimal">{children}</ol>,
                                li: ({ children }) => <li className="text-foreground">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
                                code: ({ children }) => <code className="bg-background px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono text-foreground">{children}</code>,
                                pre: ({ children }) => <pre className="bg-background p-3 rounded-lg overflow-x-auto mb-2 text-xs sm:text-sm">{children}</pre>,
                                blockquote: ({ children }) => <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground mb-2">{children}</blockquote>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading indicator with three dots in chat */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ThreeDotsLoader />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat input fixed at bottom - mobile optimized */}
          <div className="border-t bg-background p-2 sm:p-3 md:p-4 sticky bottom-0">
            <div className="max-w-4xl mx-auto">
              <VercelV0Chat onSubmit={handleChatSubmit} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
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
    </>
  );
};

export default InteractiveDemo;