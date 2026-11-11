import { TreatmentPage, treatmentMetadata } from "@/components/sections/TreatmentPage";

export const generateMetadata = () => treatmentMetadata("smileDesign");

export default function Page() {
  return <TreatmentPage treatment="smileDesign" />;
}
