import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CreditTransaction {
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

interface UseCreditsReturn {
  credits: number;
  transactions: CreditTransaction[];
  loading: boolean;
  useCredits: (amount: number, description?: string, chatSessionId?: string) => Promise<boolean>;
  refreshCredits: () => Promise<void>;
}

export const useCredits = (): UseCreditsReturn => {
  const [credits, setCredits] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCredits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('get-credits');
      
      if (error) {
        console.error('Error fetching credits:', error);
        return;
      }

      const result = await data;
      setCredits(result.credits || 0);
      setTransactions(result.transactions || []);
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const useCredits = async (
    amount: number, 
    description = 'Chat usage', 
    chatSessionId?: string
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use credits.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('use-credits', {
        body: {
          amount,
          description,
          chat_session_id: chatSessionId
        }
      });

      if (error) {
        console.error('Error using credits:', error);
        toast({
          title: "Credit usage failed",
          description: "Failed to deduct credits. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      const result = await data;
      
      if (result.error) {
        if (result.error === 'Insufficient credits') {
          toast({
            title: "Insufficient credits",
            description: "You don't have enough credits for this action.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive"
          });
        }
        return false;
      }

      // Update local state
      setCredits(result.remaining_credits);
      await fetchCredits(); // Refresh to get updated transactions
      
      return true;
    } catch (error) {
      console.error('Error using credits:', error);
      toast({
        title: "Credit usage failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      return false;
    }
  };

  const refreshCredits = async () => {
    await fetchCredits();
  };

  useEffect(() => {
    fetchCredits();
  }, [user]);

  // Set up real-time updates for credits
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('credits-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Credits updated:', payload);
          fetchCredits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    credits,
    transactions,
    loading,
    useCredits,
    refreshCredits
  };
};