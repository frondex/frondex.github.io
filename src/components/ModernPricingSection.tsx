import React, { useState } from 'react';
import { PricingSection } from "@/components/ui/pricing-section";
import { PricingTier } from "@/components/ui/pricing-card";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ModernPricingSectionProps {
  user?: SupabaseUser | null;
}

export const PAYMENT_FREQUENCIES = ["monthly", "yearly"];

export const ModernPricingSection: React.FC<ModernPricingSectionProps> = ({ user }) => {
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { toast } = useToast();

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
        description: "Please contact our sales team for enterprise pricing at sales@frondex.com",
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

  const TIERS: PricingTier[] = [
    {
      name: "Free",
      price: {
        monthly: "Free",
        yearly: "Free",
      },
      description: "Perfect for getting started",
      features: [
        "5 queries per day (150/month)",
        "Ask basic private markets questions",
        "Public data lookups",
        "Limited deal summaries",
        "Community support"
      ],
      cta: "Get Started",
      onSelect: () => handleSubscribe('free'),
      loading: checkoutLoading === 'free'
    },
    {
      name: "Pro",
      price: {
        monthly: 200,
        yearly: 160,
      },
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
      cta: "Upgrade to Pro",
      popular: true,
      onSelect: () => handleSubscribe('pro'),
      loading: checkoutLoading === 'pro'
    },
    {
      name: "Business",
      price: {
        monthly: 400,
        yearly: 320,
      },
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
      cta: "Upgrade to Business",
      onSelect: () => handleSubscribe('business'),
      loading: checkoutLoading === 'business'
    },
    {
      name: "Enterprise",
      price: {
        monthly: "Custom",
        yearly: "Custom",
      },
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
      cta: "Contact Sales",
      highlighted: true,
      onSelect: () => handleSubscribe('enterprise'),
      loading: checkoutLoading === 'enterprise'
    }
  ];

  return (
    <div className="relative flex justify-center items-center w-full">
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:35px_35px] opacity-30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>
      <PricingSection
        title="Supercharge Your Private Markets Intelligence"
        subtitle="From basic market inquiries to advanced multi-agent workflows. Choose the plan that scales with your investment sophistication."
        frequencies={PAYMENT_FREQUENCIES}
        tiers={TIERS}
      />
    </div>
  );
};