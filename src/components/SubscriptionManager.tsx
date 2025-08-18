import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Users, Building, Zap, Sparkles, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import PricingCard from './PricingCard';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface SubscriptionManagerProps {
  user: SupabaseUser | null;
}

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  credits?: number;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ user }) => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();

  const checkSubscription = async () => {
    if (!user) {
      setSubscription({ subscribed: false });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        setSubscription({ subscribed: false });
        return;
      }

      setSubscription({
        subscribed: data?.subscribed || false,
        subscription_tier: data?.subscription_tier,
        subscription_end: data?.subscription_end,
        credits: data?.credits
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription({ subscribed: false });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe.",
        variant: "destructive"
      });
      return;
    }

    setCheckoutLoading(tier);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Checkout error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to manage subscription.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Open customer portal in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Portal error",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  useEffect(() => {
    checkSubscription();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground mb-4">Please sign in to view subscription options.</p>
      </div>
    );
  }

  // Show admin status for admin users
  if (isAdmin) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <Card className="border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Crown className="w-6 h-6" />
              Administrator Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                Unlimited Access
              </p>
              <p className="text-amber-700 dark:text-amber-300">
                You have unlimited credits and full access to all features.
              </p>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                Admin Status Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Available Plans</h2>
          <p className="text-muted-foreground">These are the plans available to users</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              name: "Free",
              price: "$0",
              period: "/month",
              description: "Perfect for getting started",
              features: [
                "5 queries per day (150/month)",
                "Ask basic private markets questions",
                "Public data lookups",
                "Limited deal summaries",
                "Community support"
              ],
              tier: "free"
            },
            {
              name: "Pro",
              price: "$200",
              period: "/month",
              description: "Most popular choice",
              features: [
                "1,000 agent queries/month",
                "Everything in Free, plus:",
                "Weekly AI-generated insights email",
                "Deeper deal analysis & comps",
                "Private project spaces",
                "Portfolio monitoring alerts",
                "Smart watchlists (AI-curated)",
                "Role-based permissions",
                "Credit rollover"
              ],
              tier: "pro",
              isPopular: true
            },
            {
              name: "Business",
              price: "$400",
              period: "/month",
              description: "For growing teams",
              features: [
                "2,500 agent queries/month",
                "All features in Pro, plus:",
                "Multi-agent workflows",
                "Sector-specific research agents",
                "AI-generated presentations & exports",
                "API access (basic)",
                "Team collaboration with shared memory",
                "Option to exclude data from AI training"
              ],
              tier: "business"
            },
            {
              name: "Enterprise",
              price: "Custom",
              period: "pricing",
              description: "For large organizations",
              features: [
                "Unlimited or custom allotment",
                "Everything in Business, plus:",
                "Dedicated AI agent fine-tuned to your firm",
                "Multi-user orchestration & compliance controls",
                "Advanced API & data feed integrations",
                "CRM / Data room integration",
                "Dedicated onboarding & training",
                "24/7 priority support"
              ],
              tier: "enterprise"
            }
          ].map((plan) => (
            <PricingCard
              key={plan.tier}
              title={plan.name}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              isPopular={plan.isPopular}
              loading={false}
              buttonText="Admin View"
              onSelect={() => {}}
              className="opacity-75"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-lg font-semibold">
                {subscription?.subscribed ? subscription.subscription_tier || 'Pro' : 'Free'} Plan
              </p>
              {subscription?.credits !== undefined && (
                <p className="text-sm text-muted-foreground">
                  {subscription.credits} credits available
                </p>
              )}
              {subscription?.subscription_end && (
                <p className="text-sm text-muted-foreground">
                  Renews on {new Date(subscription.subscription_end).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={checkSubscription} variant="outline" size="sm">
                Refresh Status
              </Button>
              {subscription?.subscribed && (
                <Button onClick={handleManageSubscription} variant="outline" size="sm">
                  Manage Subscription
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Tiers */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
          <p className="text-muted-foreground">Unlock powerful AI research tools with our subscription plans</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "Free",
              price: "$0",
              period: "/month",
              description: "Perfect for getting started",
              features: [
                "5 queries per day (150/month)",
                "Ask basic private markets questions",
                "Public data lookups",
                "Limited deal summaries",
                "Community support"
              ],
              tier: "free"
            },
            {
              name: "Pro",
              price: "$200",
              period: "/month",
              description: "Most popular choice",
              features: [
                "1,000 agent queries/month",
                "Everything in Free, plus:",
                "Weekly AI-generated insights email",
                "Deeper deal analysis & comps",
                "Private project spaces",
                "Portfolio monitoring alerts",
                "Smart watchlists (AI-curated)",
                "Role-based permissions",
                "Credit rollover"
              ],
              tier: "pro",
              isPopular: true
            },
            {
              name: "Business",
              price: "$400",
              period: "/month",
              description: "For growing teams",
              features: [
                "2,500 agent queries/month",
                "All features in Pro, plus:",
                "Multi-agent workflows",
                "Sector-specific research agents",
                "AI-generated presentations & exports",
                "API access (basic)",
                "Team collaboration with shared memory",
                "Option to exclude data from AI training"
              ],
              tier: "business"
            },
            {
              name: "Enterprise",
              price: "Custom",
              period: "pricing",
              description: "For large organizations",
              features: [
                "Unlimited or custom allotment",
                "Everything in Business, plus:",
                "Dedicated AI agent fine-tuned to your firm",
                "Multi-user orchestration & compliance controls",
                "Advanced API & data feed integrations",
                "CRM / Data room integration",
                "Dedicated onboarding & training",
                "24/7 priority support"
              ],
              tier: "enterprise"
            }
          ].map((plan) => (
            <PricingCard
              key={plan.tier}
              title={plan.name}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              isPopular={plan.isPopular}
              loading={checkoutLoading === plan.tier}
              buttonText={
                subscription?.subscription_tier === plan.name.toLowerCase()
                  ? "Current Plan"
                  : "Subscribe"
              }
              onSelect={() => 
                subscription?.subscription_tier === plan.name.toLowerCase()
                  ? handleManageSubscription()
                  : handleSubscribe(plan.tier)
              }
              className={
                subscription?.subscription_tier === plan.name.toLowerCase()
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : ""
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;