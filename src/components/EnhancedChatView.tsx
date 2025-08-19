import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Paperclip, Loader2, Bot, User, Copy, ThumbsUp, ThumbsDown, RotateCcw, Volume2, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useCredits } from "@/hooks/useCredits";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";
import ChatSidebar from "./ChatSidebar";
import MobileChatView from "./MobileChatView";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: number;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface EnhancedChatViewProps {
  onBack: () => void;
  initialQuery?: string;
  onSendMessage: (message: string) => Promise<void>;
  messages: Message[];
  isLoading: boolean;
}

const EnhancedChatView = ({ 
  onBack, 
  initialQuery = "", 
  onSendMessage,
  messages,
  isLoading 
}: EnhancedChatViewProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [currentChatId, setCurrentChatId] = useState<string>("1");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { credits, useCredits: deductCredits } = useCredits();
  const { isAdmin } = useUserRole();
  const [isMobileState, setIsMobileState] = useState<boolean>(false);

  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      const isMobileScreen = window.innerWidth < 768;
      console.log('Screen width:', window.innerWidth, 'isMobile:', isMobileScreen);
      setIsMobileState(isMobileScreen);
    };
    
    checkMobile(); // Check immediately
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  console.log('Current mobile state:', isMobileState);

  // Force mobile view for testing - remove this line after testing
  const forceMobile = window.innerWidth < 768;
  
  // If mobile, use the dedicated mobile view
  if (forceMobile || isMobileState) {
    console.log('Rendering mobile view');
    return (
      <MobileChatView
        onBack={onBack}
        initialQuery={initialQuery}
        onSendMessage={onSendMessage}
        messages={messages}
        isLoading={isLoading}
      />
    );
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [newMessage]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;
    
    // Check credits for all users (including admins for testing)
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
      const success = await deductCredits(1, "Chat message", currentChatId);
      if (!success) {
        toast({
          title: "Credit deduction failed",
          description: "Failed to deduct credits. Please try again.",
          variant: "destructive"
        });
        // Restore the message if credit deduction failed
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
      // Restore the message if sending failed
      setNewMessage(messageToSend);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    // In a real app, this would create a new chat session
    setCurrentChatId("new-" + Date.now());
    toast({
      title: "New Chat",
      description: "Started a new conversation",
    });
  };

  const handleSelectChat = (chatId: string) => {
    // In a real app, this would load the selected chat history
    setCurrentChatId(chatId);
    toast({
      title: "Chat Loaded",
      description: `Switched to chat ${chatId}`,
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ChatSidebar 
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Frondex AI</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            AI Assistant ready to help
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Hello! I'm Frondex, your private markets intelligence assistant.
                </h3>
                <p className="text-muted-foreground">
                  Ask me anything about investments, market analysis, or private market opportunities.
                </p>
                
                {/* Suggested follow-ups */}
                <div className="mt-6 space-y-2">
                  <p className="text-sm font-medium text-foreground">Suggested follow-ups:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["Tell me more", "Show related information", "Ask another question"].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => setNewMessage(suggestion)}
                        className="text-xs"
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
                  "max-w-[80%] space-y-2",
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
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-2 last:mb-0 pl-4">{children}</ol>,
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
                    "flex items-center gap-1 text-xs text-muted-foreground",
                    message.type === "user" ? "justify-end" : "justify-start"
                  )}>
                    <span>{formatTime(message.timestamp)}</span>
                    {message.type === "assistant" && (
                      <div className="flex items-center gap-1 ml-2">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-background">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-background">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-background">
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-background">
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-background">
                          <Volume2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-background">
                          <Share className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
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

        {/* Input Area */}
        <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
          <div className="max-w-4xl mx-auto p-4">
            {/* Credit usage info for all users */}
            <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>💰 1 credit per message</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{credits} credits remaining {isAdmin && "(Admin - testing mode)"}</span>
              </div>
            </div>
            
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Enter your request... (${credits} credits remaining)`}
                className="min-h-[44px] max-h-[120px] pr-12 resize-none bg-background border-border focus:border-primary transition-colors"
                rows={1}
                disabled={isLoading}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  disabled
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={!newMessage.trim() || isLoading || credits < 1}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Press Enter to send • Shift + Enter for new line
              {!isAdmin && credits < 1 && (
                <span className="text-red-500 block mt-1">
                  ⚠️ Insufficient credits to send messages
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatView;