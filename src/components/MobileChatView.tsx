import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Menu, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useCredits } from "@/hooks/useCredits";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: number;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface MobileChatViewProps {
  onBack: () => void;
  initialQuery?: string;
  onSendMessage: (message: string) => Promise<void>;
  messages: Message[];
  isLoading: boolean;
}

const MobileChatView = ({ 
  onBack, 
  initialQuery = "", 
  onSendMessage,
  messages,
  isLoading 
}: MobileChatViewProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { credits, useCredits: deductCredits, loading: creditsLoading } = useCredits();
  const { isAdmin } = useUserRole();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;
    
    // Wait for credits to load before checking
    if (creditsLoading) {
      toast({
        title: "Loading...",
        description: "Please wait while we load your account information.",
        variant: "default"
      });
      return;
    }
    
    // Check credits
    if (credits < 1) {
      toast({
        title: "Insufficient credits",
        description: "You need at least 1 credit to send a message.",
        variant: "destructive"
      });
      return;
    }
    
    const messageToSend = newMessage;
    setNewMessage("");
    
    try {
      // Deduct 1 credit before sending the message
      const success = await deductCredits(1, "Chat message", "mobile-chat");
      if (!success) {
        toast({
          title: "Credit deduction failed",
          description: "Failed to deduct credits. Please try again.",
          variant: "destructive"
        });
        setNewMessage(messageToSend);
        return;
      }
      
      await onSendMessage(messageToSend);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      setNewMessage(messageToSend);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-semibold text-foreground">Frondex AI</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            {credits} credits
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Menu Dropdown */}
      {showMenu && (
        <div className="border-b border-border bg-muted/50 p-4">
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              New Chat
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Chat History
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Settings
            </Button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Hello! I'm Frondex AI
              </h3>
              <p className="text-muted-foreground text-sm px-4">
                Your private markets intelligence assistant. Ask me anything about investments or market analysis.
              </p>
              
              {/* Quick Actions */}
              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium text-foreground">Quick actions:</p>
                <div className="space-y-2">
                  {["Market analysis", "Investment opportunities", "Deal summaries"].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setNewMessage(suggestion)}
                      className="w-full"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.type === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.type === "assistant" && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
              )}
              
              <div className={cn(
                "max-w-[85%] space-y-1",
                message.type === "user" ? "order-2" : ""
              )}>
                <div className={cn(
                  "rounded-2xl px-4 py-3",
                  message.type === "user" 
                    ? "bg-primary text-primary-foreground ml-auto" 
                    : "bg-muted/50"
                )}>
                  {message.type === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 text-sm">{children}</p>,
                          ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4 text-sm">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-2 last:mb-0 pl-4 text-sm">{children}</ol>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
                
                <div className={cn(
                  "text-xs text-muted-foreground px-2",
                  message.type === "user" ? "text-right" : "text-left"
                )}>
                  {formatTime(message.timestamp)}
                </div>
              </div>

              {message.type === "user" && (
                <div className="flex-shrink-0 order-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="bg-muted/50 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Mobile Input Area - Fixed at bottom */}
      <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 p-4 sticky bottom-0">
        {/* Credit info */}
        <div className="text-center mb-3">
          <span className="text-xs text-muted-foreground">
            💰 1 credit per message • {credits} remaining
            {isAdmin && " (Admin)"}
          </span>
        </div>
        
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[44px] max-h-[120px] resize-none bg-background border-border focus:border-primary transition-colors"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            size="sm"
            className="h-11 w-11 p-0 rounded-full"
            disabled={!newMessage.trim() || isLoading || credits < 1}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {credits < 1 && !isAdmin && (
          <p className="text-xs text-red-500 text-center mt-2">
            ⚠️ Insufficient credits to send messages
          </p>
        )}
      </div>
    </div>
  );
};

export default MobileChatView;