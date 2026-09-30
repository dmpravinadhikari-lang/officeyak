import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { OY } from "../brand";

/**
 * The mark: a banded bell, and the one thing in the reel that moves on its own.
 *
 * Their whole promise is in it — "the Yak rings when something needs you" — so
 * the bell is drawn rather than dropped in as a logo file: it can swing, and
 * the rings can come off it. Bands are pink, orange, yellow from their own
 * lockup; the knob is white because theirs is indigo and would vanish on the
 * indigo ground.
 */
export const Bell: React.FC<{
  size: number;
  /** Frame the swing starts on. */
  ringAt?: number;
  /** Draw the sound arcs coming off it. */
  rings?: boolean;
}> = ({ size, ringAt = 0, rings = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - ringAt;

  // A struck bell swings hard once and settles, so the rotation is a decaying
  // sine rather than a spring easing to a stop.
  const swing = t < 0 ? 0 : Math.sin(t * 0.55) * 13 * Math.exp(-t / 16);
  const pop = spring({ frame: t, fps, config: { damping: 11, stiffness: 190, mass: 0.6 }, durationInFrames: 22 });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: "block", overflow: "visible", transform: `scale(${interpolate(pop, [0, 1], [0.7, 1])})` }}
    >
      {rings ? (
        <g stroke={OY.yellow} strokeWidth="4" fill="none" strokeLinecap="round">
          {[0, 1, 2].map((i) => {
            const at = t - 2 - i * 4;
            const o = at < 0 ? 0 : interpolate(at, [0, 6, 20], [0, 0.75, 0], { extrapolateRight: "clamp" });
            const r = 44 + i * 13 + (at < 0 ? 0 : Math.min(at, 20) * 0.5);
            return (
              <g key={i} opacity={o}>
                <path d={`M${50 - r} 46 A${r} ${r} 0 0 1 ${50 - r * 0.72} ${46 - r * 0.6}`} />
                <path d={`M${50 + r} 46 A${r} ${r} 0 0 0 ${50 + r * 0.72} ${46 - r * 0.6}`} />
              </g>
            );
          })}
        </g>
      ) : null}

      <g transform={`rotate(${swing} 50 12)`}>
        {/* knob */}
        <rect x="43" y="4" width="14" height="16" rx="7" fill={OY.white} />
        {/* the cap, the body, the base — their three bands */}
        <path d="M24 54 A26 30 0 0 1 76 54 Z" fill={OY.pink} />
        <path d="M23 54 H77 L80 74 H20 Z" fill={OY.orange} />
        <rect x="16" y="74" width="68" height="13" rx="4" fill={OY.yellow} />
        <circle cx="50" cy="95" r="6.5" fill={OY.pink} />
      </g>
    </svg>
  );
};
