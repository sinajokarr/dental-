import { TreatmentPage, treatmentMetadata } from "@/components/sections/TreatmentPage";

export const generateMetadata = () => treatmentMetadata("veneers");

export default function Page() {
  return <TreatmentPage treatment="veneers" />;
}
