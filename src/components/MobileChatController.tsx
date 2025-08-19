import React, { useState, useCallback, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useCredits } from "@/hooks/useCredits";
import { PrivateMarketsService } from "@/lib/private-markets";
import { OpenAIService, type ChatMessage } from "@/lib/openai";
import { supabase } from "@/integrations/supabase/client";
import { useChatSessions } from "@/hooks/useChatSessions";
import MobileChatView from "./MobileChatView";

interface Message {
  id: number;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface MobileChatControllerProps {
  user: User;
  onBack: () => void;
  initialQuery?: string;
}

const MobileChatController = ({ user, onBack, initialQuery }: MobileChatControllerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatSessionId, setCurrentChatSessionId] = useState<string | null>(null);
  const [privateMarketsService, setPrivateMarketsService] = useState<PrivateMarketsService | null>(null);
  const { toast } = useToast();
  const { credits, useCredits: deductCredits } = useCredits();
  const { createSession, refreshSessions } = useChatSessions();

  const handleSendMessage = useCallback(async (query: string) => {
    if (!query.trim() || isLoading) return;

    // Check credits
    if (credits < 1) {
      toast({
        title: "Insufficient credits",
        description: "You need at least 1 credit to send a message. Please upgrade your plan or purchase more credits.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Create new chat session if this is the first message
    let sessionId = currentChatSessionId;
    if (!sessionId && messages.length === 0) {
      const title = query.length > 50 ? query.substring(0, 47) + "..." : query;
      const newSession = await createSession(title);
      if (newSession) {
        sessionId = newSession.id;
        setCurrentChatSessionId(sessionId);
        refreshSessions();
      }
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: query,
      timestamp: new Date(),
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

    // Deduct credits
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

          refreshSessions();
        } catch (error) {
          console.error('Error saving assistant message:', error);
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
  }, [user, credits, deductCredits, toast, currentChatSessionId, messages.length, createSession, refreshSessions, privateMarketsService, isLoading]);

  // Handle initial query if provided
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery, handleSendMessage]);

  return (
    <MobileChatView
      onBack={onBack}
      initialQuery={initialQuery}
      onSendMessage={handleSendMessage}
      messages={messages}
      isLoading={isLoading}
    />
  );
};

export default MobileChatController;