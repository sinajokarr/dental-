import { LegalPage, legalMetadata } from "@/components/sections/LegalPage";

export const generateMetadata = () => legalMetadata("kvkk");

export default function Page() {
  return <LegalPage doc="kvkk" />;
}
