import { TreatmentPage, treatmentMetadata } from "@/components/sections/TreatmentPage";

export const generateMetadata = () => treatmentMetadata("implants");

export default function Page() {
  return <TreatmentPage treatment="implants" />;
}
