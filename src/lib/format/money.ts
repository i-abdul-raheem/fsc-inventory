import { KSA } from "@/lib/region/constants";

/**
 * Stored amounts use SAR minor units (halalas): 125 halalas → SAR&nbsp;1.25.
 */
export function formatSarFromHalalas(halalas: number): string {
  return new Intl.NumberFormat(KSA.displayLocale, {
    style: "currency",
    currency: KSA.currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(halalas / 100);
}
