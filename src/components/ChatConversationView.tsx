import { useState, useEffect } from "react";
import { ArrowLeft, Send, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <img 
              src="/lovable-uploads/160f2a0f-b791-4f94-8817-0cd61d047a14.png" 
              alt="Frondex" 
              className="h-8 w-auto"
            />
            <div>
              <h1 className="font-semibold text-foreground">Frondex AI</h1>
              <p className="text-sm text-muted-foreground">Private Markets Assistant</p>
            </div>
          </div>
          <FlowithSettingsComponent 
            onSettingsChange={handleSettingsChange}
            currentSettings={settings || undefined}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-4xl mx-auto py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.type === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                  <span className="text-primary-foreground text-sm font-medium">F</span>
                </div>
              )}
              
              <div className={`max-w-[70%] ${message.type === "user" ? "order-1" : ""}`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1 px-2">
                  {formatTime(message.timestamp)}
                </div>
              </div>

              {message.type === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1 order-2">
                  <span className="text-muted-foreground text-sm font-medium">You</span>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                <span className="text-primary-foreground text-sm font-medium">F</span>
              </div>
              <div className="max-w-[70%]">
                <div className="rounded-2xl px-4 py-3 bg-muted text-foreground">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analyzing your question...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask about private markets, deal flow, or portfolio insights..."
                className="pr-12 py-3 min-h-[48px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="h-12 w-12 shrink-0"
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
    </div>
  );
};

export default ChatConversationView;