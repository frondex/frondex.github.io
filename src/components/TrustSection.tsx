import { Star, Shield, Award, Users } from "lucide-react";

const stats = [
  { value: "$2.5B+", label: "Assets Under Management", icon: Award },
  { value: "150+", label: "Fund Partners", icon: Users },
  { value: "99.9%", label: "Platform Uptime", icon: Shield },
  { value: "4.9/5", label: "Client Satisfaction", icon: Star }
];

const TrustSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Trusted by leading investors
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of fund managers and institutional investors who rely on Frondex 
            for their private market intelligence
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-display font-bold text-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        
        {/* Testimonial */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 text-center shadow-soft">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-primary fill-current" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl text-foreground mb-6 leading-relaxed">
              "Frondex has transformed how we analyze private market opportunities. 
              The AI insights and real-time data have given us a significant competitive advantage."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-full"></div>
              <div className="text-left">
                <div className="font-semibold">Sarah Chen</div>
                <div className="text-sm text-muted-foreground">Managing Partner, Apex Ventures</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Security Badges */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-16 opacity-60">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-5 w-5" />
            <span>SOC 2 Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-5 w-5" />
            <span>GDPR Ready</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-5 w-5" />
            <span>256-bit Encryption</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;