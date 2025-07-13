import { Search, Target, Shield, PieChart, Users, Zap } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Market Intelligence",
    description: "Deep insights into private market trends, valuations, and emerging opportunities across all sectors."
  },
  {
    icon: Target,
    title: "Deal Sourcing",
    description: "AI-powered deal discovery and pipeline management to identify the best investment opportunities."
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "Comprehensive due diligence tools and risk analysis to make informed investment decisions."
  },
  {
    icon: PieChart,
    title: "Portfolio Analytics",
    description: "Real-time portfolio monitoring, performance tracking, and detailed reporting capabilities."
  },
  {
    icon: Users,
    title: "LP Relations",
    description: "Streamlined investor communications and reporting tools for enhanced transparency."
  },
  {
    icon: Zap,
    title: "Automated Workflows",
    description: "Intelligent automation for routine tasks, compliance, and operational efficiency."
  }
];

const FeaturesGrid = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Everything you need for{" "}
            <span className="gradient-text">private markets</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive platform built for sophisticated investors, fund managers, and institutional players
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;