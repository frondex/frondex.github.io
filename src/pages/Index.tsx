import HeroSection from "@/components/HeroSection";
import InteractiveDemo from "@/components/InteractiveDemo";
import FeaturesGrid from "@/components/FeaturesGrid";
import TrustSection from "@/components/TrustSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-sans">
      <HeroSection />
      <InteractiveDemo />
      <FeaturesGrid />
      <TrustSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
