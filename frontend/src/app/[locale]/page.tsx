import { LeadForm } from "@/components/forms/LeadForm";
import { Consultation } from "@/components/sections/Consultation";
import { Faq } from "@/components/sections/Faq";
import { Finale } from "@/components/sections/Finale";
import { Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
import { Treatments } from "@/components/sections/Treatments";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { WhyJokar } from "@/components/sections/WhyJokar";
import { HeroTooth } from "@/components/three/hero-tooth/HeroTooth";

export default function HomePage() {
  return (
    <>
      <Hero visual={<HeroTooth />} />
      <TrustStrip />
      <Treatments />
      <WhyJokar />
      <Journey />
      <Faq />
      <Consultation form={<LeadForm />} />
      <Finale />
    </>
  );
}
