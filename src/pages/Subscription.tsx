import React from 'react';
import { useAuth } from "@/components/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PricingSection } from "@/components/ui/pricing-section";

const PAYMENT_FREQUENCIES = ["monthly", "yearly"];

const TIERS = [
  {
    name: "Free",
    price: {
      monthly: "Free",
      yearly: "Free",
    },
    description: "For basic private markets questions",
    features: [
      "5 queries/day (150/month)",
      "Ask basic private markets questions",
      "Public data lookups", 
      "Limited deal summaries",
      "Community support"
    ],
    cta: "Current Plan",
  },
  {
    name: "Pro",
    price: {
      monthly: 200,
      yearly: 170,
    },
    description: "Advanced AI-powered insights",
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
  },
  {
    name: "Business", 
    price: {
      monthly: 400,
      yearly: 340,
    },
    description: "Multi-agent workflows for teams",
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
  },
  {
    name: "Enterprise",
    price: {
      monthly: "Custom",
      yearly: "Custom",
    },
    description: "Dedicated AI agent for your firm",
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
  },
];

const Subscription = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
      
      <div className="relative flex justify-center items-center w-full mt-20">
        <div className="absolute inset-0 -z-10">
          <div className="h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:35px_35px] opacity-30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>
        <PricingSection
          title="Choose Your Plan"
          subtitle="Select the perfect plan for your private markets AI needs"
          frequencies={PAYMENT_FREQUENCIES}
          tiers={TIERS}
        />
      </div>
    </div>
  );
};

export default Subscription;