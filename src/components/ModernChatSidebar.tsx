import { useState } from "react";
import { Plus, MessageCircle, Clock, Settings, Bot, PanelLeftClose, PanelLeftOpen, MoreVertical, Link, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useChatSessions } from "@/hooks/useChatSessions";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/modern-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface ModernChatSidebarProps {
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  currentChatId?: string;
  className?: string;
  onBackToHome?: () => void;
}

const ModernChatSidebar = ({ onNewChat, onSelectChat, currentChatId, className, onBackToHome }: ModernChatSidebarProps) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { sessions, loading, createSession, deleteSession, copySessionLink } = useChatSessions();

  const handleNewChat = async () => {
    const session = await createSession("New Chat");
    if (session) {
      onNewChat();
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
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
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Logo clicked - going back to home');
          if (onBackToHome) {
            onBackToHome();
          } else {
            navigate('/');
          }
        }} 
        className="font-normal flex space-x-2 items-center text-sm py-1 relative z-50 cursor-pointer hover:opacity-80 transition-opacity"
        type="button"
      >
        <img src="/lovable-uploads/29ff1713-d01d-40e9-8e7d-a9a5dfade80d.png" alt="Frondex" className="h-32 w-auto flex-shrink-0 pointer-events-none" />
      </button>
    );
  };

  const LogoIcon = () => {
    return (
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Logo icon clicked - going back to home');
          if (onBackToHome) {
            onBackToHome();
          } else {
            navigate('/');
          }
        }} 
        className="font-normal flex items-center justify-start text-sm py-2 relative z-50 cursor-pointer hover:opacity-80 transition-opacity"
        type="button"
      >
        <div className="text-4xl font-bold bg-gradient-to-r from-green-500 via-teal-500 to-blue-600 bg-clip-text text-transparent pointer-events-none">
          f
        </div>
      </button>
    );
  };

  return (
    <Sidebar open={open} setOpen={setOpen} animate={true}>
      <SidebarBody className="justify-between gap-1">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo and Collapse Button - Above header line */}
          <div className="mb-0 pt-4">
            {open ? (
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  onClick={() => setOpen(!open)}
                  className="p-2 hover:bg-muted rounded-md transition-colors flex-shrink-0"
                >
                  <PanelLeftClose className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <LogoIcon />
                <button
                  onClick={() => setOpen(!open)}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <PanelLeftOpen className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
          
          {/* New Task Button - Just below header line */}
          <div className="mb-0 pt-2">
            <motion.div
              animate={{
                opacity: open ? 1 : 0,
                display: open ? "block" : "none",
              }}
            >
              <Button 
                onClick={handleNewChat} 
                className="w-full gap-2 bg-blue-500 hover:bg-blue-600 text-white"
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
                onClick={handleNewChat}
                size="icon"
                className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Task History Section - Just below header line */}
          <div className="flex-1 overflow-hidden">
            <motion.div
              animate={{
                opacity: open ? 1 : 0,
                display: open ? "block" : "none",
              }}
              className="mb-0"
            >
              <div className="flex items-center gap-2 px-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Task History</span>
              </div>
            </motion.div>

            <ScrollArea className="flex-1">
              <div className="space-y-1 pb-4">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : sessions.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No chat history yet</div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        currentChatId === session.id ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                    >
                      <MessageCircle 
                        className="h-4 w-4 text-muted-foreground flex-shrink-0" 
                        onClick={() => onSelectChat(session.id)}
                      />
                      <motion.div
                        animate={{
                          display: open ? "block" : "none",
                          opacity: open ? 1 : 0,
                        }}
                        className="flex flex-col min-w-0 flex-1"
                        onClick={() => onSelectChat(session.id)}
                      >
                        <p className="text-sm font-medium text-foreground truncate">
                          {session.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(session.updated_at)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {session.messageCount || 0} messages
                          </span>
                        </div>
                      </motion.div>
                      
                      {open && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copySessionLink(session.id)}>
                              <Link className="h-4 w-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteSession(session.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))
                )}
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