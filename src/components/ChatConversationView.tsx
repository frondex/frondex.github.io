import { useState } from "react";
import { ArrowLeft, Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatConversationViewProps {
  onBack: () => void;
  initialQuery?: string;
}

const ChatConversationView = ({ onBack, initialQuery = "" }: ChatConversationViewProps) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "user" as const,
      content: initialQuery || "What are the latest trends in private equity investments?",
      timestamp: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
      id: 2,
      type: "assistant" as const,
      content: "Based on current market analysis, here are the key trends in private equity:\n\n1. **ESG Integration**: Environmental, social, and governance factors are becoming central to investment decisions, with 78% of PE firms now incorporating ESG criteria.\n\n2. **Technology Focus**: Software and fintech deals continue to dominate, representing 32% of all PE transactions in 2024.\n\n3. **Healthcare Innovation**: Medical technology and biotechnology investments have increased by 45% year-over-year.\n\n4. **Supply Chain Resilience**: Investments in supply chain technology and logistics have grown significantly post-pandemic.\n\nWould you like me to dive deeper into any of these trends or explore specific sectors?",
      timestamp: new Date(Date.now() - 1 * 60 * 1000)
    }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user" as const,
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: "assistant" as const,
        content: "I'm analyzing your question about private markets. Let me provide you with detailed insights based on the latest market data and trends...",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
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
          <div className="flex items-center gap-3">
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
              disabled={!newMessage.trim()}
              className="h-12 w-12 shrink-0"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatConversationView;