import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Scene } from "../components/Scene";
import { Soundtrack } from "../components/Soundtrack";
import { VoiceLines } from "../components/VoiceLines";
import { mono, outfit } from "../fonts";
import { OY, SAFE, rgba } from "./brand";
import { Bell } from "./components/Bell";
import { Peaks } from "./components/Peaks";
import { Figure, Head, Label, Rise, Say } from "./components/Type";
import { VOICEOVER_READY, VO_LINES } from "./script";
import { OfficeYakProps, layout } from "./schema";

export const REEL_FPS = 30;

/**
 * OfficeYak — Instagram reel.
 *
 * Their own site hands over the hook: "a consultancy in Kathmandu carries 400
 * student files, 12 classes, three offices and a WhatsApp inbox that never
 * sleeps." So the reel opens on the load rather than the product, rings the
 * bell at it, and lets the Yak say the one thing it says best — a
 * recommendation with the number behind it. The price is the last thing, not
 * the first.
 */

const Stage: React.FC<{ children: React.ReactNode; gap?: number; align?: "center" | "flex-start" }> = ({
  children,
  gap = 0,
  align = "center",
}) => (
  <AbsoluteFill
    style={{
      paddingTop: SAFE.top,
      paddingBottom: SAFE.bottom,
      paddingLeft: SAFE.side,
      paddingRight: SAFE.side,
      alignItems: align,
      justifyContent: "center",
      gap,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** The load one office carries, counted up. */
const Load: React.FC<Pick<OfficeYakProps, "figures" | "loadLine">> = ({ figures, loadLine }) => (
  <Stage gap={26} align="flex-start">
    <Rise>
      <Label colour={OY.pink}>Monday morning</Label>
    </Rise>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {figures.map((f, i) => (
        <Figure key={f.of + i} n={f.n} of={f.of} delay={8 + i * 9} />
      ))}
    </div>
    <div style={{ marginTop: 14 }}>
      <Rise delay={10 + figures.length * 9}>
        <Head size={62}>{loadLine}</Head>
      </Rise>
    </div>
  </Stage>
);

/** The bell rings, and the mark lands under it. */
const Mark: React.FC<Pick<OfficeYakProps, "markWhat">> = ({ markWhat }) => (
  <Stage gap={40}>
    <Bell size={300} ringAt={4} />
    <div style={{ textAlign: "center" }}>
      <Rise delay={14}>
        <div
          style={{
            fontFamily: outfit,
            fontWeight: 600,
            fontSize: 104,
            letterSpacing: "-0.035em",
            color: OY.white,
          }}
        >
          OfficeYak
        </div>
      </Rise>
      <div style={{ marginTop: 20 }}>
        <Rise delay={20}>
          <Label>{markWhat}</Label>
        </Rise>
      </div>
    </div>
  </Stage>
);

/** The thing the product actually does, in its own words. */
const Yak: React.FC<Pick<OfficeYakProps, "yakLabel" | "yakSays" | "yakUnder">> = ({
  yakLabel,
  yakSays,
  yakUnder,
}) => (
  <Stage gap={34}>
    <Rise up={30}>
      <div
        style={{
          width: 912,
          background: OY.indigoLift,
          borderRadius: 34,
          border: `2px solid ${rgba.white(0.1)}`,
          padding: "46px 48px 0",
          overflow: "hidden",
        }}
      >
        <Label>{yakLabel}</Label>
        <div style={{ marginTop: 22, paddingBottom: 40 }}>
          <Head size={66}>{yakSays}</Head>
        </div>
        {/* Their own card runs the peaks along its foot; so does this one. */}
        <div style={{ marginLeft: -48, marginRight: -48 }}>
          <Peaks width={1008} height={150} />
        </div>
      </div>
    </Rise>
    <Rise delay={12}>
      <div style={{ textAlign: "center", maxWidth: 860 }}>
        <Say size={36}>{yakUnder}</Say>
      </div>
    </Rise>
  </Stage>
);

/** Grow, Prepare, Run — three peaks, rising as they are named. */
const Three: React.FC<Pick<OfficeYakProps, "peaksTitle" | "peaks">> = ({ peaksTitle, peaks }) => (
  <Stage gap={38}>
    <div style={{ textAlign: "center" }}>
      <Rise>
        <Head size={78}>{peaksTitle}</Head>
      </Rise>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 912 }}>
      {peaks.map((p, i) => (
        <Rise key={p.name} delay={8 + i * 9} up={26}>
          <div
            style={{
              background: OY.indigoLift,
              borderRadius: 26,
              border: `2px solid ${rgba.white(0.09)}`,
              borderLeft: `8px solid ${p.colour}`,
              padding: "26px 30px",
            }}
          >
            <div
              style={{
                fontFamily: outfit,
                fontWeight: 600,
                fontSize: 48,
                color: p.colour,
                letterSpacing: "-0.02em",
              }}
            >
              {p.name}
            </div>
            <div style={{ marginTop: 6 }}>
              <Say size={31}>{p.say}</Say>
            </div>
            <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
              {p.chips.map((c) => (
                <div
                  key={c}
                  style={{
                    fontFamily: mono,
                    fontSize: 23,
                    color: rgba.white(0.82),
                    background: rgba.white(0.08),
                    borderRadius: 999,
                    padding: "7px 18px",
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
        </Rise>
      ))}
    </div>
  </Stage>
);

/** Their real screens, and the three things only a Nepali product says. */
const Proof: React.FC<Pick<OfficeYakProps, "proofs" | "proofBadges">> = ({ proofs, proofBadges }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // One screen per third of the scene, so three land in the time one would.
  const per = durationInFrames / Math.max(1, proofs.length);
  const at = Math.min(proofs.length - 1, Math.floor(frame / per));
  const shot = proofs[at];

  return (
    <Stage gap={30}>
      <Rise up={26}>
        <div
          style={{
            width: 912,
            borderRadius: 24,
            overflow: "hidden",
            border: `2px solid ${rgba.white(0.14)}`,
            background: OY.paper,
          }}
        >
          <Img
            key={shot.shot}
            src={staticFile(shot.shot)}
            style={{
              width: 912,
              height: 600,
              objectFit: "cover",
              objectPosition: shot.focus,
              display: "block",
              transform: `scale(${
                shot.zoom * interpolate(frame % per, [0, per], [1, 1.05], { extrapolateRight: "clamp" })
              })`,
            }}
          />
        </div>
      </Rise>
      <div style={{ textAlign: "center" }}>
        <Head size={52}>{shot.caption}</Head>
      </div>
      <Rise delay={10}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {proofBadges.map((b) => (
            <div
              key={b}
              style={{
                fontFamily: mono,
                fontSize: 24,
                color: OY.yellow,
                border: `2px solid ${rgba.lilac(0.3)}`,
                borderRadius: 999,
                padding: "9px 22px",
              }}
            >
              {b}
            </div>
          ))}
        </div>
      </Rise>
    </Stage>
  );
};

/** The card: their line, the price, and where to go. */
const Close: React.FC<Pick<OfficeYakProps, "closeLine" | "price" | "trial" | "site">> = ({
  closeLine,
  price,
  trial,
  site,
}) => (
  <Stage gap={30}>
    <Bell size={190} ringAt={6} />
    <div style={{ textAlign: "center", maxWidth: 940 }}>
      <Rise delay={10}>
        <Head size={70}>{closeLine}</Head>
      </Rise>
    </div>
    <Rise delay={18}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            fontFamily: outfit,
            fontWeight: 600,
            fontSize: 44,
            color: OY.indigo,
            background: OY.orange,
            borderRadius: 999,
            padding: "16px 40px",
          }}
        >
          {price}
          <span style={{ fontSize: 28, fontWeight: 400 }}> /mo</span>
        </div>
        <div
          style={{
            fontFamily: outfit,
            fontWeight: 400,
            fontSize: 32,
            color: rgba.white(0.9),
            border: `2px solid ${rgba.lilac(0.34)}`,
            borderRadius: 999,
            padding: "15px 30px",
          }}
        >
          {trial}
        </div>
      </div>
    </Rise>
    <Rise delay={24}>
      <div
        style={{
          fontFamily: mono,
          fontWeight: 500,
          fontSize: 44,
          letterSpacing: "0.02em",
          color: OY.yellow,
        }}
      >
        {site}
      </div>
    </Rise>
  </Stage>
);

/** Indigo, with the range along the foot growing over the whole reel. */
const Ground: React.FC<{ rise: number }> = ({ rise }) => (
  <AbsoluteFill style={{ backgroundColor: OY.indigo }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(58% 30% at 16% 4%, rgba(240, 64, 122, 0.16), rgba(21, 19, 58, 0) 70%), radial-gradient(52% 28% at 92% 14%, rgba(255, 122, 26, 0.13), rgba(21, 19, 58, 0) 70%)",
      }}
    />
    <AbsoluteFill style={{ justifyContent: "flex-end" }}>
      <div style={{ opacity: 0.9 }}>
        <Peaks width={1080} height={330} rise={rise} />
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const OfficeYakReel: React.FC<OfficeYakProps> = (props) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const { cues } = layout(props.timing, fps);
  const [load, mark, yak, peaks, proof, close] = cues;

  return (
    <AbsoluteFill style={{ backgroundColor: OY.indigo, fontFamily: outfit }}>
      <Ground rise={interpolate(frame, [0, durationInFrames * 0.62], [0.12, 1], { extrapolateRight: "clamp" })} />
      <Soundtrack music={props.music} voice={props.voice} narrated={VOICEOVER_READY} />
      <VoiceLines lines={VO_LINES} dir="officeyak/vo" ready={VOICEOVER_READY} />

      <Scene {...load} fadeIn={5} fadeOut={6}>
        <Load {...props} />
      </Scene>
      <Scene {...mark} fadeIn={5} fadeOut={6}>
        <Mark {...props} />
      </Scene>
      <Scene {...yak} fadeIn={5} fadeOut={6}>
        <Yak {...props} />
      </Scene>
      <Scene {...peaks} fadeIn={5} fadeOut={6}>
        <Three {...props} />
      </Scene>
      <Scene {...proof} fadeIn={5} fadeOut={6}>
        <Proof {...props} />
      </Scene>
      <Scene {...close} fadeIn={6} fadeOut={0}>
        <Close {...props} />
      </Scene>
    </AbsoluteFill>
  );
};
