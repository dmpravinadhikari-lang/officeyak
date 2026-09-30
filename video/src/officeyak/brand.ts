/**
 * OfficeYak — the palette, the facts, and the pictures.
 *
 * Sampled from officeyak.com by pixel count: the indigo the whole site is set
 * on, and the pink, orange and yellow of the bell and the three peaks. Outfit
 * and JetBrains Mono are the two faces their own site loads.
 *
 * Every fact below is quoted from their site. Prices carry the date they were
 * set, because prices move and a reel outlives a price list.
 */
export const OY = {
  indigo: "#15133A", // the ground
  indigoLift: "#1E1B4D", // cards a step off it
  paper: "#FAFAFC",
  pink: "#F0407A",
  orange: "#FF7A1A",
  yellow: "#FFC526",
  lilac: "#B9B8CC",
  white: "#FFFFFF",
} as const;

export const rgba = {
  white: (a: number) => `rgba(255, 255, 255, ${a})`,
  lilac: (a: number) => `rgba(185, 184, 204, ${a})`,
  indigo: (a: number) => `rgba(21, 19, 58, ${a})`,
} as const;

/** Straight off the site. */
export const FACTS = {
  name: "OfficeYak",
  what: "AI-powered consultancy OS",
  line: "Every branch, carried like your best branch.",
  site: "officeyak.com",
  from: "Rs 4,999",
  trial: "30 days free · no card",
} as const;

/** Their own screens and sections, resized for a 1080-wide render. */
export const ART = {
  students: "officeyak/students.jpg",
  attendance: "officeyak/attendance.jpg",
  reports: "officeyak/reports.jpg",
  tools: "officeyak/tools.jpg",
  pricing: "officeyak/pricing.jpg",
  security: "officeyak/security.jpg",
  peaks: "officeyak/peaks.jpg",
} as const;

/** Clear of Instagram's caption bar and its buttons up the right. */
export const SAFE = { top: 190, bottom: 340, side: 84 } as const;
