import LP2Navbar from "@/components/lp2/LP2Navbar";
import LP2Hero from "@/components/lp2/LP2Hero";
import LP2SocialProofBar from "@/components/lp2/LP2SocialProofBar";
import LP2Manifesto from "@/components/lp2/LP2Manifesto";
import LP2MatchProfiles from "@/components/lp2/LP2MatchProfiles";
import LP2Steps from "@/components/lp2/LP2Steps";
import LP2Phases from "@/components/lp2/LP2Phases";
import LP2DarkCTA from "@/components/lp2/LP2DarkCTA";
import LP2Testimonials from "@/components/lp2/LP2Testimonials";
import LP2Tools from "@/components/lp2/LP2Tools";
import LP2FAQ from "@/components/lp2/LP2FAQ";
import LP2CTAFinal from "@/components/lp2/LP2CTAFinal";
import LP2Footer from "@/components/lp2/LP2Footer";

const LP2 = () => {
  return (
    <div className="min-h-screen lp2-theme lp2-page bg-lp2-bg">
      <LP2Navbar />
      <div
        className="flex flex-col mx-auto w-full px-6 xl:px-10"
        style={{ gap: 24, maxWidth: 1280 }}
      >
        <LP2Hero />
        <LP2SocialProofBar />
        <LP2Manifesto />
        <LP2MatchProfiles />
        <LP2Steps />
        <LP2DarkCTA />
        <LP2Phases />
        <LP2Testimonials />
        <LP2Tools />
        <LP2FAQ />
        <LP2CTAFinal />
      </div>
      <LP2Footer />
    </div>
  );
};

export default LP2;
