import { useState } from "react";
import { Plus, MessageCircle, Clock, Settings, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/modern-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
}

interface ModernChatSidebarProps {
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  currentChatId?: string;
  className?: string;
}

const ModernChatSidebar = ({ onNewChat, onSelectChat, currentChatId, className }: ModernChatSidebarProps) => {
  const [open, setOpen] = useState(true);
  
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

  const Logo = () => {
    return (
      <div className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20">
        <Bot className="h-6 w-6 text-primary flex-shrink-0" />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-semibold text-foreground whitespace-pre"
        >
          Frondex AI
        </motion.span>
      </div>
    );
  };

  const LogoIcon = () => {
    return (
      <div className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20">
        <Bot className="h-6 w-6 text-primary flex-shrink-0" />
      </div>
    );
  };

  return (
    <Sidebar open={open} setOpen={setOpen} animate={true}>
      <SidebarBody className="justify-between gap-4">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          <div className="mb-4">
            {open ? <Logo /> : <LogoIcon />}
          </div>
          
          {/* New Task Button */}
          <div className="mb-6">
            <motion.div
              animate={{
                opacity: open ? 1 : 0,
                display: open ? "block" : "none",
              }}
            >
              <Button 
                onClick={onNewChat} 
                className="w-full gap-2 bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </motion.div>
            
            {/* Collapsed state button */}
            <motion.div
              animate={{
                opacity: open ? 0 : 1,
                display: open ? "none" : "block",
              }}
            >
              <Button 
                onClick={onNewChat}
                size="icon"
                className="w-8 h-8 bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Task History Section */}
          <div className="flex-1 overflow-hidden">
            <motion.div
              animate={{
                opacity: open ? 1 : 0,
                display: open ? "block" : "none",
              }}
              className="mb-3"
            >
              <div className="flex items-center gap-2 px-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Task History</span>
              </div>
            </motion.div>

            <ScrollArea className="flex-1">
              <div className="space-y-1 pb-4">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => onSelectChat(session.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      currentChatId === session.id ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                  >
                    <MessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <motion.div
                      animate={{
                        display: open ? "block" : "none",
                        opacity: open ? 1 : 0,
                      }}
                      className="flex flex-col min-w-0 flex-1"
                    >
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
                    </motion.div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer Settings */}
        <div>
          <SidebarLink
            link={{
              label: "Settings",
              icon: <Settings className="h-4 w-4 text-muted-foreground flex-shrink-0" />,
              onClick: () => console.log("Settings clicked")
            }}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
};

export default ModernChatSidebar;