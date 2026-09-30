import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { mono, outfit } from "../../fonts";
import { OY, rgba } from "../brand";

/** Everything arrives the same way: up a little, and in. */
export const Rise: React.FC<{ delay?: number; up?: number; children: React.ReactNode }> = ({
  delay = 0,
  up = 24,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 160, mass: 0.7 },
    durationInFrames: 22,
  });
  return (
    <div
      style={{
        opacity: interpolate(s, [0, 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        transform: `translateY(${(1 - s) * up}px)`,
      }}
    >
      {children}
    </div>
  );
};

/** Small tracked capitals in the mono, the way their site labels a section. */
export const Label: React.FC<{ colour?: string; children: React.ReactNode }> = ({
  colour = OY.yellow,
  children,
}) => (
  <div
    style={{
      fontFamily: mono,
      fontWeight: 500,
      fontSize: 25,
      letterSpacing: "0.26em",
      textTransform: "uppercase",
      color: colour,
      textIndent: "0.26em",
    }}
  >
    {children}
  </div>
);

/** The headline voice: Outfit, semibold, tight, sentence case like their site. */
export const Head: React.FC<{ size?: number; colour?: string; children: React.ReactNode }> = ({
  size = 88,
  colour = OY.white,
  children,
}) => (
  <div
    style={{
      fontFamily: outfit,
      fontWeight: 600,
      fontSize: size,
      lineHeight: 1.08,
      letterSpacing: "-0.028em",
      color: colour,
    }}
  >
    {children}
  </div>
);

export const Say: React.FC<{ size?: number; colour?: string; children: React.ReactNode }> = ({
  size = 34,
  colour = rgba.lilac(0.92),
  children,
}) => (
  <div style={{ fontFamily: outfit, fontWeight: 400, fontSize: size, lineHeight: 1.4, color: colour }}>
    {children}
  </div>
);

/** A figure, set in the mono so the digits line up as they stack. */
export const Figure: React.FC<{ n: string; of: string; delay: number }> = ({ n, of, delay }) => (
  <Rise delay={delay} up={30}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
      <div
        style={{
          fontFamily: mono,
          fontWeight: 500,
          fontSize: 92,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: OY.white,
          fontVariantNumeric: "tabular-nums",
          minWidth: 200,
          textAlign: "right",
        }}
      >
        {n}
      </div>
      <div style={{ fontFamily: outfit, fontWeight: 400, fontSize: 40, color: rgba.lilac(0.86) }}>{of}</div>
    </div>
  </Rise>
);
