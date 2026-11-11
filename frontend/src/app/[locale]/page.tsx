import { Hero } from "@/components/sections/Hero";
import { HeroTooth } from "@/components/three/hero-tooth/HeroTooth";

export default function HomePage() {
  return <Hero visual={<HeroTooth />} />;
}
