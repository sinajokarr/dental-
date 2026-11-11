import { LegalPage, legalMetadata } from "@/components/sections/LegalPage";

export const generateMetadata = () => legalMetadata("privacy");

export default function Page() {
  return <LegalPage doc="privacy" />;
}
