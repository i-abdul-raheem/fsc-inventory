/**
 * Deployment defaults for Kingdom of Saudi Arabia.
 * Copy and UI strings stay in English; currency, locale, and tz follow KSA norms.
 */
export const KSA = {
  /** HTML lang + Intl primary locale */
  htmlLang: "en-SA",
  displayLocale: "en-SA",
  timeZone: "Asia/Riyadh",
  currencyCode: "SAR",
  /** English UI label for the two-decimal minor unit (1 SAR = 100 halalas). */
  minorUnitLabelEnglish: "halalas",
  /** Short geo tag shown in chrome (English). */
  marketLabel: "KSA",
} as const;
