import { KSA } from "@/lib/region/constants";

/** Dates/times for business views: English copy, Saudi presentation, Riyadh time zone. */
export function formatDateTimeKsa(value: Date | null | undefined): string {
  if (!value) return "";
  return value.toLocaleString(KSA.displayLocale, {
    timeZone: KSA.timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  });
}
