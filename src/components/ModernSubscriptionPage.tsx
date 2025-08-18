import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Sparkles, Zap, Building, Crown, CheckCircle, ArrowRight, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ModernSubscriptionPageProps {
  user: SupabaseUser | null;
}

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  credits?: number;
}

const ModernSubscriptionPage: React.FC<ModernSubscriptionPageProps> = ({ user }) => {
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
    if (tier === 'free') {
      toast({
        title: "Free Plan",
        description: "You're already on the free plan! Sign up to start using your daily queries.",
      });
      return;
    }

    if (tier === 'enterprise') {
      toast({
        title: "Enterprise Sales",
        description: "Please contact our sales team for enterprise pricing.",
      });
      return;
    }

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

  useEffect(() => {
    checkSubscription();
  }, [user]);

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  const plans = [
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
      tier: "free",
      icon: <Sparkles className="w-5 h-5" />,
      buttonText: "Current Plan"
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
      icon: <Zap className="w-5 h-5" />,
      isPopular: true,
      buttonText: "Upgrade to Pro"
    },
    {
      name: "Business",
      price: "$400",
      period: "/month",
      description: "For growing teams",
      features: [
        "2,500 agent queries/month",
        "All features in Pro, plus:",
        "Multi-agent workflows (sourcing + diligence + comps)",
        "Sector-specific research agents (PE, RE, Infra, Debt)",
        "AI-generated presentations & exports",
        "API access (basic)",
        "Team collaboration with shared memory",
        "Option to exclude data from AI training"
      ],
      tier: "business",
      icon: <Building className="w-5 h-5" />,
      buttonText: "Upgrade to Business"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large organizations",
      features: [
        "Unlimited or custom allotment",
        "Everything in Business, plus:",
        "Dedicated AI agent fine-tuned to your firm's workflow",
        "Multi-user orchestration & compliance controls (SSO, audit logs)",
        "Advanced API & data feed integrations",
        "CRM / Data room integration",
        "Dedicated onboarding & training",
        "24/7 priority support"
      ],
      tier: "enterprise",
      icon: <Crown className="w-5 h-5" />,
      buttonText: "Contact Sales"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4">Private Markets AI Agent</Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Supercharge Your
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {" "}Private Markets{" "}
              </span>
              Intelligence
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              From basic market inquiries to advanced multi-agent workflows. 
              Choose the plan that scales with your investment sophistication.
            </p>
          </div>

          {/* Current Status Card - Only show if user is logged in */}
          {user && (
            <Card className="max-w-md mx-auto mb-16 border-primary/20 bg-gradient-to-r from-primary/5 to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-center">
                  <CreditCard className="w-5 h-5" />
                  Current Plan Status
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-semibold">
                      {subscription?.subscribed ? subscription.subscription_tier || 'Pro' : 'Free'} Plan
                    </span>
                  </div>
                  {subscription?.credits !== undefined && (
                    <p className="text-sm text-muted-foreground">
                      {subscription.credits} credits available
                    </p>
                  )}
                  {subscription?.subscription_end && (
                    <p className="text-sm text-muted-foreground">
                      Renews {new Date(subscription.subscription_end).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex gap-2 justify-center">
                    <Button onClick={checkSubscription} variant="outline" size="sm">
                      Refresh Status
                    </Button>
                    {subscription?.subscribed && (
                      <Button onClick={handleManageSubscription} variant="outline" size="sm">
                        Manage Plan
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.subscription_tier?.toLowerCase() === plan.name.toLowerCase();
            const isUpgrade = !isCurrentPlan && subscription?.subscribed;
            
            return (
              <Card 
                key={plan.tier} 
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  plan.isPopular ? 'border-primary shadow-lg scale-105' : ''
                } ${isCurrentPlan ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' : ''}`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Current Plan
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {plan.icon}
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <div className="mb-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <Button
                    onClick={() => isCurrentPlan ? handleManageSubscription() : handleSubscribe(plan.tier)}
                    disabled={checkoutLoading === plan.tier}
                    className="w-full"
                    variant={plan.isPopular ? "default" : isCurrentPlan ? "secondary" : "outline"}
                  >
                    {checkoutLoading === plan.tier ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      "Manage Plan"
                    ) : plan.tier === 'enterprise' ? (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Sales
                      </>
                    ) : (
                      <>
                        {plan.buttonText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Admin View */}
      {isAdmin && (
        <div className="max-w-7xl mx-auto px-6 mt-16">
          <Card className="border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Crown className="w-6 h-6" />
                Administrator Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                  Unlimited Access to All Features
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  As an admin, you have unlimited credits and access to all premium features across all tiers.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Ready to Transform Your Private Markets Intelligence?
        </h2>
        <p className="text-muted-foreground mb-8">
          Join thousands of investment professionals already using Frondex to make smarter decisions.
        </p>
        {!user && (
          <Button size="lg" className="gap-2">
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ModernSubscriptionPage;