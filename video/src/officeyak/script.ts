/**
 * The narration for the OfficeYak reel.
 *
 * English, because the site is: this sells to consultancy owners who read
 * product copy in English all day. Frames are the cues `layout()` produces
 * from the default timings.
 */
import type { Line } from "../components/VoiceLines";

export const VOICEOVER_READY = true;

export const VO_LINES: Line[] = [
  // One line per scene, not one per idea. The pictures carry the detail; the
  // voice only has to hand over the turn.
  { id: "01-load", at: 8, text: "Four hundred files. Twelve classes. Three offices." },
  { id: "02-carry", at: 126, text: "Something has to carry it." },
  { id: "03-yak", at: 204, text: "One thing to do next, with the reason." },
  { id: "04-peaks", at: 312, text: "Grow. Prepare. Run. One system." },
  { id: "05-proof", at: 414, text: "Built in Nepal. Nepali-month payroll." },
  { id: "06-close", at: 516, text: "Thirty days free. officeyak dot com." },
];
