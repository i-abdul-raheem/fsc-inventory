import type { Metadata } from "next";

import { HowToUseDocumentation } from "./documentation";

export const metadata: Metadata = {
  title: "How to use IMS — user guide",
  description:
    "Plain-language guide to IMS: orders, stock, procurement, customers, sellers, reports, and who can use each part of the app.",
};

export default function HowToUsePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <HowToUseDocumentation />
    </div>
  );
}
