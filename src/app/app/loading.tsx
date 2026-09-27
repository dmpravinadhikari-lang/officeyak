import { Splash } from "@/components/motion/BellMotion";

/**
 * What the app shows while a page is being fetched.
 *
 * There was nothing here, which meant a blank screen on a slow Kathmandu
 * connection: the browser holds the old page, nothing indicates that anything
 * is happening, and people press the link again. Next renders this the moment
 * a navigation starts, so the wait now looks deliberate.
 *
 * The bell swings rather than a spinner turning, because the motion sheet
 * allows exactly one moving motif and this is the moment somebody is looking
 * hardest at the screen.
 */
export default function Loading() {
  return <Splash />;
}
