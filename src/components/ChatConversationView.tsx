import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Paperclip, Loader2, Sparkles, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FlowithService, FlowithSettings, FlowithMessage } from "@/lib/flowith";
import FlowithSettingsComponent from "./FlowithSettings";

interface ChatConversationViewProps {
  onBack: () => void;
  initialQuery?: string;
}

const ChatConversationView = ({ onBack, initialQuery = "" }: ChatConversationViewProps) => {
  const [messages, setMessages] = useState<Array<{
    id: number;
    type: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [flowithService, setFlowithService] = useState<FlowithService | null>(null);
  const [settings, setSettings] = useState<FlowithSettings | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedSettings = FlowithService.getStoredSettings();
    if (storedSettings) {
      setSettings(storedSettings);
      setFlowithService(new FlowithService(storedSettings));
    }

    // Add initial query if provided
    if (initialQuery) {
      setMessages([{
        id: 1,
        type: "user",
        content: initialQuery,
        timestamp: new Date()
      }]);
      
      // Send initial query to API if settings are available
      if (storedSettings) {
        handleInitialQuery(initialQuery, new FlowithService(storedSettings));
      }
    }
  }, [initialQuery]);

  const handleInitialQuery = async (query: string, service: FlowithService) => {
    setIsLoading(true);
    try {
      const flowithMessages: FlowithMessage[] = [{ role: 'user', content: query }];
      const response = await service.sendMessage(flowithMessages);
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: "assistant",
        content: response,
        timestamp: new Date()
      }]);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    if (!flowithService || !settings) {
      toast({
        title: "Configuration Required",
        description: "Please configure your Flowith API settings first.",
        variant: "destructive"
      });
      return;
    }

    const userMessage = {
      id: messages.length + 1,
      type: "user" as const,
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      // Convert messages to Flowith format
      const flowithMessages: FlowithMessage[] = [...messages, userMessage].map(msg => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content
      }));

      const response = await flowithService.sendMessage(flowithMessages);
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: "assistant",
        content: response,
        timestamp: new Date()
      }]);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsChange = (newSettings: FlowithSettings) => {
    setSettings(newSettings);
    setFlowithService(new FlowithService(newSettings));
    toast({
      title: "Settings Updated",
      description: "Flowith API settings have been saved successfully.",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [newMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Modern Header */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-4 p-4 max-w-5xl mx-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="shrink-0 hover:bg-muted/60 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
              <div>
                <h1 className="font-semibold text-lg text-foreground tracking-tight">Frondex AI</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Private Markets Assistant
                </p>
              </div>
            </div>
          </div>
          
          <FlowithSettingsComponent 
            onSettingsChange={handleSettingsChange}
            currentSettings={settings || undefined}
          />
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 relative">
        <div className="max-w-4xl mx-auto py-8">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Welcome to Frondex AI</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Ask me anything about private markets, deal flow, portfolio insights, or market analysis.
              </p>
            </div>
          )}
          
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 animate-fade-in ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "assistant" && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shrink-0 shadow-lg">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                
                <div className={`max-w-[75%] ${message.type === "user" ? "order-1" : ""}`}>
                  <div
                    className={`rounded-2xl px-5 py-4 shadow-sm ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-card text-card-foreground border border-border/50"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                  <div className={`text-xs text-muted-foreground mt-2 px-2 ${
                    message.type === "user" ? "text-right" : "text-left"
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {message.type === "user" && (
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 order-2 shadow-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 justify-start animate-fade-in">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shrink-0 shadow-lg">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="max-w-[75%]">
                  <div className="rounded-2xl px-5 py-4 bg-card text-card-foreground border border-border/50 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Modern Input Area */}
      <div className="border-t border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-card border border-border/60 rounded-2xl shadow-lg">
            <div className="flex items-end gap-3 p-4">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    adjustTextareaHeight();
                  }}
                  placeholder="Ask about private markets, deal flow, or portfolio insights..."
                  className="resize-none border-0 bg-transparent text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[20px] max-h-[120px] py-0"
                  style={{ height: 'auto' }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  className="h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-3">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatConversationView;