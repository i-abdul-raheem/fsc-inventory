import type { Metadata } from "next";

import { HowToUseDocumentationUr } from "../documentation-ur";

export const metadata: Metadata = {
  title: "IMS استعمال کرنے کا طریقہ — صارف رہنمائی",
  description:
    "اردو میں صارف رہنمائی: آرڈرز، اسٹاک، Procurement، Inventory، Catalogue، رپورٹس، اور رسائی۔ سعودی عرب کے لیے۔",
};

export default function HowToUseUrPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <HowToUseDocumentationUr />
    </div>
  );
}
