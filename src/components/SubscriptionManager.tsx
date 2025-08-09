import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Check, Crown, Zap, Star } from "lucide-react";

interface SubscriptionManagerProps {
  user: User | null;
}

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  credits: number;
}

export const SubscriptionManager = ({ user }: SubscriptionManagerProps) => {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    credits: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(prev => ({
        ...prev,
        subscribed: data.subscribed,
        subscription_tier: data.subscription_tier,
        subscription_end: data.subscription_end
      }));

      // Get credits - will be available after database migration completes
      setSubscription(prev => ({
        ...prev,
        credits: subscription.subscribed ? 1000 : 0 // Default credits based on subscription
      }));
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier: 'basic' | 'premium' | 'enterprise') => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });
      
      if (error) throw error;
      
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      // Open Stripe customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  const subscriptionTiers = [
    {
      name: "Basic",
      price: "$9.99",
      credits: 1000,
      features: ["1,000 credits/month", "Basic support", "Standard models"],
      icon: <Zap className="w-5 h-5" />,
      tier: "basic" as const
    },
    {
      name: "Premium", 
      price: "$29.99",
      credits: 5000,
      features: ["5,000 credits/month", "Priority support", "Advanced models", "API access"],
      icon: <Star className="w-5 h-5" />,
      tier: "premium" as const
    },
    {
      name: "Enterprise",
      price: "$99.99", 
      credits: 20000,
      features: ["20,000 credits/month", "24/7 support", "All models", "Custom integrations"],
      icon: <Crown className="w-5 h-5" />,
      tier: "enterprise" as const
    }
  ];

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sign in to manage subscriptions</CardTitle>
          <CardDescription>
            Create an account to access premium features
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current Status
            <Button
              variant="outline"
              size="sm"
              onClick={checkSubscription}
              disabled={loading}
            >
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Plan:</span>
              <Badge variant={subscription.subscribed ? "default" : "secondary"}>
                {subscription.subscription_tier || "Free"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>Credits:</span>
              <Badge variant="outline">{subscription.credits}</Badge>
            </div>
            {subscription.subscribed && subscription.subscription_end && (
              <div className="text-sm text-muted-foreground">
                Renews: {new Date(subscription.subscription_end).toLocaleDateString()}
              </div>
            )}
          </div>
          {subscription.subscribed && (
            <Button
              onClick={handleManageSubscription}
              disabled={loading}
              className="mt-4"
            >
              Manage Subscription
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {subscriptionTiers.map((tier) => (
          <Card key={tier.name} className={`relative ${
            subscription.subscription_tier === tier.name 
              ? "ring-2 ring-primary" 
              : ""
          }`}>
            {subscription.subscription_tier === tier.name && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary">Current Plan</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {tier.icon}
                {tier.name}
              </CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold">{tier.price}</span>/month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe(tier.tier)}
                disabled={loading || subscription.subscription_tier === tier.name}
                className="w-full"
                variant={subscription.subscription_tier === tier.name ? "outline" : "default"}
              >
                {subscription.subscription_tier === tier.name 
                  ? "Current Plan" 
                  : `Subscribe to ${tier.name}`
                }
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};