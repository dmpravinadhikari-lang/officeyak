// Vertical reel 1080x1920 — brand story: weight → yak → bell → lockup → tagline.
(() => {
  const { C, MOTION, lerp, bellRing, BellMark, Wordmark, Ridge } = window.OY;
  const DEF = window.TWEAK_DEFAULTS || { motionEditor: true, handle: 'officeyak.com' };
  const W = 1080, H = 1920;
  const FONT = "'Outfit', sans-serif";
  function Line({ T, at, text, size = 72, color = C.white, weight = 600, top, until }) {
    const p = MOTION.enter(T, at, 0.7);
    const o = until ? 1 - MOTION.enter(T, until, 0.4) : 1;
    return <div style={{ position: 'absolute', left: 90, right: 90, top, fontFamily: FONT, fontSize: size, fontWeight: weight, lineHeight: 1.08, letterSpacing: -size / 40, color, opacity: p * o, transform: `translateY(${(1 - p) * 40}px)`, textWrap: 'pretty' }}>{text}</div>;
  }
  function Piece({ t }) {
    const { T, CUES, authoredTotal } = useComposition();
    const out = 1 - MOTION.enter(T, authoredTotal - 0.5, 0.5);
    // Weight: stack of "files" piles up then is lifted off by the bell arriving
    const W1 = CUES.Weight, B = CUES.Bell, L = CUES.Lockup, G = CUES.Tagline;
    const cards = [0, 1, 2, 3, 4];
    // bell: drops from top, lands with pop at B+0.3; rings; then shrinks up into lockup
    const drop = MOTION.pop(T, B, 0.9);
    const { swing, ring } = bellRing(T, B + 0.85, 16);
    const toLock = MOTION.draw(T, L - 0.2, 0.9);
    const bellSize = lerp(360, 180, toLock);
    const bellY = lerp(lerp(-400, 640, drop), 560, toLock);
    const wordP = (i) => MOTION.enter(T, L + 0.2 + i * 0.07, 0.5);
    const y = { stem: MOTION.enter(T, L + 0.55, 0.45), horns: MOTION.draw(T, L + 0.6, 0.6), hub: MOTION.pop(T, L + 1.0, 0.45) };
    const ridgeP = MOTION.draw(T, CUES.Weight, 1.4);
    const tagP = MOTION.enter(T, G, 0.7);
    return (
      <div data-screen-label={`t=${Math.floor(T)}s`} style={{ position: 'absolute', inset: 0, background: C.navy, overflow: 'hidden', opacity: out }}>
        <Ridge w={W} h={H} p={ridgeP} y={0.78 + toLock * 0.1} opacity={0.9} />
        {/* Weight beat */}
        <Line T={T} at={W1 + 0.1} until={B - 0.1} top={330} text="The office is where the weight is." size={84} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: 14, opacity: 1 - MOTION.enter(T, B + 0.4, 0.5) }}>
          {cards.map((i) => {
            const p = MOTION.pop(T, W1 + 0.6 + i * 0.22, 0.6);
            const labels = ['Student files', 'Class attendance', 'Visa deadlines', 'Mock tests', 'Payroll'];
            return <div key={i} style={{ width: lerp(560, 400, i / 4), height: 74, borderRadius: 18, background: i % 2 ? C.paper : C.yellow, color: C.navy, fontFamily: FONT, fontSize: 30, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${(1 - p) * -120}px) rotate(${(i % 2 ? -1 : 1) * (1 - p) * 8}deg)`, opacity: p, boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>{labels[i]}</div>;
          })}
        </div>
        {/* Bell + lockup */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: bellY, display: 'flex', justifyContent: 'center' }}>
          <BellMark size={bellSize} ink={C.white} swing={swing} ring={ring} />
        </div>
        <Line T={T} at={B + 1.0} until={L - 0.2} top={1120} text="It carries the whole office up the mountain — and rings when something needs you." size={56} weight={500} color={C.yellow} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 770, display: 'flex', justifyContent: 'center' }}>
          <Wordmark fontSize={132} ink={C.white} p={wordP} y={y} />
        </div>
        {/* Tagline + handle */}
        <div style={{ position: 'absolute', left: 90, right: 90, top: 1010, opacity: tagP, transform: `translateY(${(1 - tagP) * 30}px)`, fontFamily: FONT, color: C.white, textAlign: 'center' }}>
          <div style={{ fontSize: 54, fontWeight: 600, lineHeight: 1.15, letterSpacing: -1 }}>Carries the whole office.<br /><span style={{ color: C.yellow }}>Climbs with you.</span></div>
          <div style={{ marginTop: 40, fontSize: 30, fontWeight: 500, color: C.orange, opacity: MOTION.enter(T, G + 0.5, 0.5) }}>{t.handle}</div>
        </div>
      </div>
    );
  }
  function App() {
    const [t, set] = useTweaks(DEF);
    return (
      <div style={{ width: '100%', height: '100%', minHeight: 600, background: '#0b0b0e' }}>
        <CompositionStage width={W} height={H} bg={C.navy} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}><Piece t={t} /></CompositionStage>
        <TweaksPanel>
          <TweakSection label="Reel" />
          <TweakText label="Handle / URL" value={t.handle} onChange={(v) => set('handle', v)} />
          <TweakSection label="Editor" />
          <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => set('motionEditor', v)} />
        </TweaksPanel>
      </div>
    );
  }
  window.OfficeYakReel = App;
})();
