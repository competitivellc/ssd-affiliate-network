// AdSense helpers.
//
// Compliance context (verified 2026-08-09):
// - Google AdSense display ads and Amazon Associates can run on the same
//   site (both program TOS permit it; AdSense is not "paid advertising
//   linking to Amazon", so the April 2026 Associates paid/boosted-ad
//   disqualification does not apply — our Amazon Special Links are never
//   placed in or near ad units).
// - Google's EU User Consent Policy requires a Google-certified CMP (IAB
//   TCF v2.3, Consent Mode v2) to serve ads to visitors in the EEA, UK,
//   and Switzerland. This site's cookie banner is a custom, uncertified
//   CMP — using it to serve ads to those visitors is a policy violation
//   that can suspend the AdSense account. Until a certified CMP is
//   integrated, ad serving is geo-gated OFF for those countries (both the
//   slot markup and the SDK load are skipped server-side).
// - Outside the EEA/UK/CH, ad scripts only load after the visitor accepts
//   cookies (same localStorage gate as GA4), and AdSense units are kept
//   visually separate from affiliate Special Links.

// EEA + UK + Switzerland scope for Google's certified-CMP requirement:
// EU-27, United Kingdom, Norway, Iceland, Liechtenstein, Switzerland.
const EEA_COUNTRY_CODES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "GB", "NO", "IS", "LI", "CH",
]);

export function isEeaCountry(countryCode: string): boolean {
  if (!countryCode) return false;
  return EEA_COUNTRY_CODES.has(countryCode.toUpperCase());
}