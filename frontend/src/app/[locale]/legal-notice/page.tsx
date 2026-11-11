import { LegalPage, legalMetadata } from "@/components/sections/LegalPage";

export const generateMetadata = () => legalMetadata("notice");

export default function Page() {
  return <LegalPage doc="notice" />;
}
