import { INK, PAPER, SANS } from "../../shared/config/design-tokens";
import { FeaturesSection } from "./components/FeaturesSection";
import { FinalCtaSection } from "./components/FinalCtaSection";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { Nav } from "./components/Nav";
import { ProblemSection } from "./components/ProblemSection";
import { ProductPreviewSection } from "./components/ProductPreviewSection";

export function WaitlistPage() {
  return (
    <div className="min-h-screen" style={{ background: PAPER, color: INK, fontFamily: SANS }}>
      <Nav />
      <HeroSection />
      <ProblemSection />
      <ProductPreviewSection />
      <HowItWorksSection />
      <FeaturesSection />
      <FinalCtaSection />
      <Footer />
    </div>
  );
}
