import { useState } from "react";
import { Plus, MessageCircle, Clock, Settings, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
}

interface ChatSidebarProps {
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  currentChatId?: string;
  className?: string;
}

const ChatSidebar = ({ onNewChat, onSelectChat, currentChatId, className }: ChatSidebarProps) => {
  // Mock chat history - in a real app, this would come from a backend/state management
  const [chatSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "Private Markets Analysis",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      messageCount: 8
    },
    {
      id: "2", 
      title: "Investment Opportunities",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      messageCount: 12
    },
    {
      id: "3",
      title: "Market Research",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      messageCount: 5
    }
  ]);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  return (
    <div className={cn("w-64 bg-background border-r border-border flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="h-6 w-6 text-primary" />
          <span className="font-semibold text-foreground">Frondex AI</span>
        </div>
        
        <Button 
          onClick={onNewChat} 
          className="w-full gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Task History</span>
          </div>
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 pb-4">
            {chatSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSelectChat(session.id)}
                className={cn(
                  "flex flex-col p-3 mx-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50",
                  currentChatId === session.id && "bg-muted border border-border"
                )}
              >
                <div className="flex items-start gap-2">
                  <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {session.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(session.timestamp)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {session.messageCount} messages
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default ChatSidebar;