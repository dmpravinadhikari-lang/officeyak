/** V1 destinations. Adding a country is adding a line here. */
export const COUNTRIES = {
  AU: {
    name: "Australia", flag: "🇦🇺", currency: "AUD",
    visa: "Subclass 500 student visa",
    statement: "Genuine Student (GS) statement",
    statementNote:
      "Australia replaced the GTE with the Genuine Student requirement. Answers must address your circumstances in Nepal, why this course, and what you do afterwards, assessors read for a real study purpose, not a migration plan dressed as one.",
    interview: "au_gs",
  },
  NZ: {
    name: "New Zealand", flag: "🇳🇿", currency: "NZD",
    visa: "Fee Paying Student visa",
    statement: "Statement of purpose",
    statementNote: "Immigration New Zealand weighs genuine intent and whether funds are demonstrably available.",
    interview: "au_gs",
  },
  UK: {
    name: "United Kingdom", flag: "🇬🇧", currency: "GBP",
    visa: "Student Route",
    statement: "Personal statement (CAS-aligned)",
    statementNote:
      "Most UK universities interview Nepali applicants for credibility before issuing a CAS. Your statement and your interview answers must not contradict each other. That mismatch is a common refusal reason.",
    interview: "uk_credibility",
  },
  IE: {
    name: "Ireland", flag: "🇮🇪", currency: "EUR",
    visa: "Stamp 2 student permission",
    statement: "Statement of purpose",
    statementNote: "Irish visa officers look hard at finances and at the link between your past study and the chosen course.",
    interview: "uk_credibility",
  },
  US: {
    name: "United States", flag: "🇺🇸", currency: "USD",
    visa: "F-1 student visa",
    statement: "Personal statement / SOP",
    statementNote:
      "The F-1 is a non-immigrant visa: you must show non-immigrant intent and strong ties to Nepal. The consular interview is short and decisive.",
    interview: "us_f1",
  },
  CA: {
    name: "Canada", flag: "🇨🇦", currency: "CAD",
    visa: "Study permit",
    statement: "Statement of purpose / study plan",
    statementNote:
      "IRCC weighs the study plan, your funds, and whether the course makes sense after your existing qualifications. A provincial attestation letter is usually required.",
    interview: "ca_study_permit",
  },
} as const;

export type CountryCode = keyof typeof COUNTRIES;
export const COUNTRY_CODES = Object.keys(COUNTRIES) as CountryCode[];

/**
 * The other spellings of the same six destinations.
 *
 * The database holds codes written by seeds, by imports of a consultancy's
 * old spreadsheets, and by earlier versions of this product, and they do not
 * all agree: eighteen student profiles said "GB" where the registry says
 * "UK", and two said "Australia" rather than "AU".
 *
 * That mattered more than a cosmetic label. `country()` quietly fell back to
 * Australia for anything it did not know, so a family heading to London was
 * shown an Australian visa and an Australian statement requirement, and the
 * cost table had no fallback at all, so the same value crashed the page.
 * Translating the spelling is the honest fix; guessing a different country
 * is not.
 */
const ALIASES: Record<string, CountryCode> = {
  GB: "UK", "GB-ENG": "UK", ENG: "UK",
  UNITEDKINGDOM: "UK", BRITAIN: "UK", ENGLAND: "UK",
  AUS: "AU", AUSTRALIA: "AU",
  NEWZEALAND: "NZ", NZL: "NZ",
  IRELAND: "IE", EIRE: "IE", IRL: "IE",
  USA: "US", UNITEDSTATES: "US", AMERICA: "US",
  CAN: "CA", CANADA: "CA",
};

/**
 * The registry code for whatever a record happens to hold, or null when it is
 * genuinely not one of the six. Callers decide what to do with a null, which
 * is the point: a missing country is a thing to say out loud rather than to
 * paper over with a default.
 */
export function countryCode(code: string | null | undefined): CountryCode | null {
  if (!code) return null;
  const key = code.trim().toUpperCase().replace(/[\s._-]/g, "");
  if (key in COUNTRIES) return key as CountryCode;
  return ALIASES[key] ?? null;
}

export const country = (code: string) => COUNTRIES[countryCode(code) ?? "AU"];

export const INTERVIEW_KINDS = {
  us_f1: { label: "US F-1 consular interview", blurb: "Short, direct, and decided in minutes. Non-immigrant intent is everything." },
  uk_credibility: { label: "UK credibility interview", blurb: "Run by the university before your CAS. Course knowledge and funding." },
  ca_study_permit: { label: "Canada study permit questioning", blurb: "Study plan logic, funds, and why this course after your last one." },
  au_gs: { label: "Australia Genuine Student questioning", blurb: "Your circumstances in Nepal, course choice, and what happens after." },
  admission: { label: "University admission interview", blurb: "Academic fit, motivation, and what you bring to the cohort." },
  scholarship: { label: "Scholarship panel", blurb: "Merit, need, and what the funder gets for their money." },
} as const;
export type InterviewKind = keyof typeof INTERVIEW_KINDS;
