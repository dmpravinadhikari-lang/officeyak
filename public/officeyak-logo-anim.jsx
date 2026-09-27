// OfficeYak logo reveal — continuous composition on animations-v3.
const NAVY = '#15133A', ORANGE = '#FF7A1A', PINK = '#F0407A', YELLOW = '#FFC526', WHITE = '#FFFFFF';
const TWEAK_DEFAULTS = window.TWEAK_DEFAULTS || { motionEditor: true, ground: 'navy', showRidge: true };

const MOTION = {
  enter: (T, start, dur) => Easing.easeOutCubic(clamp((T - start) / dur, 0, 1)),
  draw: (T, start, dur) => Easing.easeInOutCubic(clamp((T - start) / dur, 0, 1)),
  pop: (T, start, dur) => Easing.easeOutBack(clamp((T - start) / dur, 0, 1)),
};

function Ridge({ T, CUES, ink, total }) {
  const p = MOTION.draw(T, CUES.Ridge, 1.1);
  const fade = 1 - MOTION.enter(T, CUES.Wordmark + 0.2, 0.8) * 0.75;
  const out = 1 - MOTION.enter(T, total - 0.5, 0.5);
  const d = 'M-20 560 L120 470 L240 520 L380 400 L520 480 L660 380 L800 460 L940 350 L1080 430 L1220 370 L1300 420';
  return (
    <svg viewBox="0 0 1280 720" style={{ position: 'absolute', inset: 0, width: 1280, height: 720, opacity: fade * out }}>
      <path d={d} fill="none" stroke={ink} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} />
      <path d={d + ' L1300 760 L-20 760 Z'} fill={ink} opacity={0.06 * p} />
    </svg>
  );
}

function Bell({ T, CUES, ink, total }) {
  const B = CUES.Bell;
  const strap = MOTION.enter(T, B, 0.5);
  const body = MOTION.pop(T, B + 0.25, 0.75);
  const band = MOTION.enter(T, B + 0.6, 0.5);
  const clapper = MOTION.pop(T, B + 0.9, 0.5);
  const t0 = B + 1.35;
  const swing = T > t0 ? Math.sin((T - t0) * 14) * 14 * Math.exp(-(T - t0) * 1.6) : 0;
  const ring = T > t0 ? Math.max(0, 1 - (T - t0) / 1.1) : 0;
  const move = MOTION.draw(T, CUES.Wordmark - 0.2, 0.9);
  const lerp = (a, b) => a + (b - a) * move;
  const size = lerp(260, 132);
  const cx = lerp(640, 402);
  const cy = lerp(330, 360);
  const out = 1 - MOTION.enter(T, total - 0.5, 0.5);
  return (
    <div style={{ position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, opacity: out }}>
    <svg viewBox="0 0 64 64" style={{ width: size, height: size, display: 'block', overflow: 'visible' }}>
      <g transform={`rotate(${swing} 32 4)`}>
        <rect x="28" y="4" width="8" height="10" rx="3" fill={ink} style={{ transform: `translateY(${(1 - strap) * -30}px)`, opacity: strap }} />
        <g style={{ transformOrigin: '32px 14px', transform: `rotate(${(1 - body) * -55}deg)`, opacity: clamp(body * 3, 0, 1) }}>
          <path d="M18 18 Q32 10 46 18 L52 44 L12 44 Z" fill={ORANGE} />
          <path d="M18 18 Q32 10 46 18 L48 30 L16 30 Z" fill={PINK} />
        </g>
        <rect x="8" y="42" width="48" height="8" rx="4" fill={YELLOW} style={{ transform: `translateX(${(1 - band) * 48}px)`, opacity: band }} />
        <circle cx="32" cy="55" r="5" fill={ink} style={{ transform: `translateY(${(1 - clapper) * -16}px)`, opacity: clapper }} />
      </g>
      <g stroke={YELLOW} strokeWidth="3" fill="none" strokeLinecap="round" opacity={ring} style={{ transform: `scale(${1 + (1 - ring) * 0.35})`, transformOrigin: '32px 32px' }}>
        <path d="M6 42 Q0 32 6 22" /><path d="M58 42 Q64 32 58 22" />
      </g>
    </svg>
    </div>
  );
}

function Wordmark({ T, CUES, ink, total }) {
  const W = CUES.Wordmark;
  const letters = 'Office'.split('');
  const horns = MOTION.draw(T, W + 0.55, 0.6);
  const stem = MOTION.enter(T, W + 0.5, 0.45);
  const hub = MOTION.pop(T, W + 1.0, 0.45);
  const ak = MOTION.enter(T, W + 1.05, 0.5);
  const out = 1 - MOTION.enter(T, total - 0.5, 0.5);
  const letterStyle = (p) => ({ display: 'inline-block', transform: `translateY(${(1 - p) * 40}px)`, opacity: p });
  return (
    <div style={{ position: 'absolute', left: 484, top: 0, height: 720, display: 'flex', alignItems: 'center', opacity: out }}>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 108, fontWeight: 600, letterSpacing: -3.6, lineHeight: 1, color: ink, display: 'inline-flex', alignItems: 'baseline', marginTop: 4 }}>
        {letters.map((ch, i) => <span key={i} style={letterStyle(MOTION.enter(T, W + 0.1 + i * 0.07, 0.5))}>{ch}</span>)}
        <svg viewBox="0 0 64 62" style={{ width: 78, height: 78, margin: '0 -0.09em 0 0.02em', display: 'block', overflow: 'visible', flex: 'none' }}>
          <path d="M32 33 C30 24 21 17 9 8" fill="none" stroke={PINK} strokeWidth="15" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - horns} />
          <path d="M32 33 C34 24 43 17 55 8" fill="none" stroke={YELLOW} strokeWidth="15" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - horns} />
          <rect x="24" y="30" width="16" height={32 * stem} rx="7" fill={ORANGE} />
          <circle cx="32" cy="33" r="7.5" fill={ink === WHITE ? NAVY : ink} style={{ transform: `scale(${hub})`, transformOrigin: '32px 33px' }} />
        </svg>
        <span style={{ fontWeight: 700, display: 'inline-flex' }}>
          {'ak'.split('').map((ch, i) => <span key={i} style={letterStyle(MOTION.enter(T, W + 1.05 + i * 0.08, 0.5))}>{ch}</span>)}
        </span>
      </span>
    </div>
  );
}

function Piece({ tweaks }) {
  const { T, CUES, authoredTotal } = useComposition();
  const dark = tweaks.ground === 'navy';
  const ink = dark ? WHITE : NAVY;
  const bg = dark ? NAVY : '#FAFAFC';
  const secs = Math.floor(T);
  return (
    <div data-screen-label={`t=${secs}s`} style={{ position: 'absolute', inset: 0, background: bg, overflow: 'hidden' }}>
      {tweaks.showRidge && <Ridge T={T} CUES={CUES} ink={dark ? YELLOW : NAVY} total={authoredTotal} />}
      <Bell T={T} CUES={CUES} ink={ink} total={authoredTotal} />
      <Wordmark T={T} CUES={CUES} ink={ink} total={authoredTotal} />
    </div>
  );
}

function OfficeYakLogoAnimation() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 480, background: '#0b0b0e' }}>
      <CompositionStage width={1280} height={720} bg={t.ground === 'navy' ? NAVY : '#FAFAFC'} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}>
        <Piece tweaks={t} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Logo" />
        <TweakRadio label="Ground" value={t.ground} options={['navy', 'light']} onChange={(v) => setTweak('ground', v)} />
        <TweakToggle label="Ridge motif" value={t.showRidge} onChange={(v) => setTweak('showRidge', v)} />
        <TweakSection label="Editor" />
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
      </TweaksPanel>
    </div>
  );
}
window.OfficeYakLogoAnimation = OfficeYakLogoAnimation;
