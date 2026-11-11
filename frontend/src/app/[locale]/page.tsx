import { Hero } from "@/components/sections/Hero";
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
    </>
  );
}
