import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { soundSchema } from "../components/Soundtrack";

/**
 * The OfficeYak reel, as a form.
 *
 * The load at the top is a list, so the numbers that open the reel can be
 * changed to whatever a particular consultancy carries. Everything else is a
 * field: the Yak's recommendation, the three peaks, the screens, the price.
 */
export const figureSchema = z.object({
  n: z.string().describe("The figure, e.g. 400"),
  of: z.string().describe("What it counts, e.g. student files"),
});

export const peakSchema = z.object({
  name: z.string(),
  say: z.string(),
  chips: z.array(z.string()).describe("The modules under it"),
  colour: zColor(),
});

export const proofSchema = z.object({
  shot: z.string().describe("Path under public/"),
  caption: z.string(),
  /**
   * These are desktop screens shown on a phone. Framing the whole window
   * makes the type too small to read at reel speed, so each shot says how far
   * to zoom in and which corner to hold — the sidebar is rarely the point.
   */
  zoom: z.number().min(1).max(3),
  focus: z.string().describe("CSS object-position, e.g. \"18% 12%\""),
});

export const timingSchema = z.object({
  load: z.number().min(1).max(8).describe("Seconds"),
  mark: z.number().min(1).max(8),
  yak: z.number().min(1).max(8),
  peaks: z.number().min(1).max(8),
  proof: z.number().min(1).max(8),
  close: z.number().min(1).max(8),
});

export const officeYakSchema = z.object({
  figures: z.array(figureSchema),
  loadLine: z.string().describe("The line under the figures"),

  markWhat: z.string(),

  yakLabel: z.string(),
  yakSays: z.string().describe("One recommendation, with its reason"),
  yakUnder: z.string(),

  peaksTitle: z.string(),
  peaks: z.array(peakSchema),

  proofs: z.array(proofSchema),
  proofBadges: z.array(z.string()),

  closeLine: z.string(),
  price: z.string(),
  trial: z.string(),
  site: z.string(),

  music: soundSchema,
  voice: soundSchema,
  timing: timingSchema,
});

export type OfficeYakProps = z.infer<typeof officeYakSchema>;

/** Scenes cross-fade, so each starts a few frames before the last ends. */
const OVERLAP = 6;

export const layout = (timing: OfficeYakProps["timing"], fps: number) => {
  const f = (s: number) => Math.round(s * fps);
  const spans = [
    f(timing.load),
    f(timing.mark),
    f(timing.yak),
    f(timing.peaks),
    f(timing.proof),
    f(timing.close),
  ];
  const cues: { from: number; duration: number }[] = [];
  let at = 0;
  for (const duration of spans) {
    cues.push({ from: at, duration });
    at += duration - OVERLAP;
  }
  return { cues, total: at + OVERLAP };
};
