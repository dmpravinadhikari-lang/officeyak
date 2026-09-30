import React from "react";
import { interpolate } from "remotion";
import { OY } from "../brand";

/**
 * Three peaks along the foot of the frame — theirs, off the card the Yak
 * speaks from, and the shape their three modules are named after.
 *
 * `rise` walks them up from nothing to full height, so the range can grow as
 * Grow, Prepare and Run are named.
 */
export const Peaks: React.FC<{ width: number; height: number; rise?: number }> = ({
  width,
  height,
  rise = 1,
}) => {
  const h = (f: number) => height * f * interpolate(rise, [0, 1], [0.04, 1]);
  const y = height;

  // Left to right: pink, orange tallest, yellow, and a pink shoulder running off.
  const peak = (cx: number, half: number, top: number, fill: string) => (
    <path d={`M${cx - half} ${y} L${cx} ${y - top} L${cx + half} ${y} Z`} fill={fill} />
  );

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {peak(width * 0.16, width * 0.2, h(0.62), OY.pink)}
      {peak(width * 0.75, width * 0.19, h(0.58), OY.yellow)}
      {peak(width * 0.99, width * 0.17, h(0.5), OY.pink)}
      {peak(width * 0.45, width * 0.26, h(1), OY.orange)}
    </svg>
  );
};
