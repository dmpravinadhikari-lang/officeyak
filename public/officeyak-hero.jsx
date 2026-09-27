// Website hero / interface animation 1280x720 — headline + dashboard builds + Yak says.
(() => {
  const { C, MOTION, lerp, bellRing, BellMark, Wordmark, Ridge } = window.OY;
  const DEF = window.TWEAK_DEFAULTS || { motionEditor: true, showCursor: true };
  const FONT = "'Outfit', sans-serif";
  const KPIS = [['Active leads', '1,284', C.pink], ['Classes today', '18', C.orange], ['Visa deadlines', '7', C.yellow]];
  const ROWS = [['Sujata Karki', 'IELTS · Australia', 'Docs pending'], ['Bikash Thapa', 'PTE · Canada', 'Offer received'], ['Anisha Rai', 'TOPIK · Korea', 'Visa lodged'], ['Roshan Gurung', 'JLPT · Japan', 'Counselling']];
  function Piece({ t }) {
    const { T, CUES, authoredTotal } = useComposition();
    const out = 1 - MOTION.enter(T, authoredTotal - 0.5, 0.5);
    const O = CUES.Open, D = CUES.Dashboard, Y = CUES.Yak;
    const nav = MOTION.enter(T, O, 0.6);
    const h1 = (i) => MOTION.enter(T, O + 0.3 + i * 0.12, 0.6);
    const cta = MOTION.pop(T, O + 1.0, 0.6);
    const panel = MOTION.enter(T, D, 0.8);
    const kpi = (i) => MOTION.pop(T, D + 0.4 + i * 0.12, 0.6);
    const row = (i) => MOTION.enter(T, D + 0.8 + i * 0.1, 0.5);
    const bar = MOTION.draw(T, D + 0.9, 1.2);
    const yak = MOTION.pop(T, Y, 0.6);
    const { swing, ring } = bellRing(T, Y + 0.1, 12);
    const typed = 'Sujata Karki’s Australia file is missing the GTE statement — due Friday.';
    const nChars = Math.floor(MOTION.draw(T, Y + 0.4, 1.6) * typed.length);
    // cursor glides from CTA to the Yak card
    const cur = MOTION.draw(T, Y - 0.6, 0.7);
    const cx = lerp(250, 1030, cur), cy = lerp(395, 560, cur);
    return (
      <div data-screen-label={`t=${Math.floor(T)}s`} style={{ position: 'absolute', inset: 0, background: C.navy, overflow: 'hidden', fontFamily: FONT, opacity: out }}>
        <Ridge p={MOTION.draw(T, O, 1.2)} y={0.85} opacity={0.6} />
        {/* nav */}
        <div style={{ position: 'absolute', left: 64, right: 64, top: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: nav, transform: `translateY(${(1 - nav) * -16}px)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><BellMark size={34} /><Wordmark fontSize={26} /></div>
          <div style={{ display: 'flex', gap: 28, color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: 500 }}><span>Product</span><span>Pricing</span><span>Partners</span><span style={{ color: C.yellow }}>Book a demo</span></div>
        </div>
        {/* headline */}
        <div style={{ position: 'absolute', left: 64, top: 150, width: 520, color: C.white }}>
          {['The AI-powered', 'operating system for', 'education consultancies.'].map((l, i) => <div key={i} style={{ fontSize: 52, fontWeight: 600, lineHeight: 1.08, letterSpacing: -1.6, opacity: h1(i), transform: `translateY(${(1 - h1(i)) * 30}px)`, color: i === 2 ? C.yellow : C.white }}>{l}</div>)}
          <div style={{ marginTop: 26, fontSize: 18, lineHeight: 1.5, color: 'rgba(255,255,255,0.72)', opacity: h1(3), textWrap: 'pretty' }}>Leads, classes, mock tests, SOPs, HR and payroll — carried in one place, and it rings when something needs you.</div>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, opacity: cta, transform: `scale(${lerp(0.9, 1, cta)})`, transformOrigin: 'left center' }}>
            <div style={{ background: C.orange, color: C.white, padding: '14px 24px', borderRadius: 12, fontSize: 16, fontWeight: 600 }}>Start free trial</div>
            <div style={{ border: '1.5px solid rgba(255,255,255,0.35)', color: C.white, padding: '14px 24px', borderRadius: 12, fontSize: 16, fontWeight: 500 }}>Watch 2‑min tour</div>
          </div>
        </div>
        {/* dashboard glass panel */}
        <div style={{ position: 'absolute', left: 640, top: 130, width: 580, height: 470, borderRadius: 22, background: C.white, boxShadow: '0 40px 80px rgba(0,0,0,0.35)', opacity: panel, transform: `translateY(${(1 - panel) * 60}px) rotate(${(1 - panel) * -2}deg)`, overflow: 'hidden', color: C.navy }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 22px 12px', fontSize: 13, color: C.ink2 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: C.orange }} />Kathmandu branch · Today<span style={{ marginLeft: 'auto', fontWeight: 600, color: C.navy }}>Overview</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '0 22px' }}>
            {KPIS.map(([l, v, c], i) => <div key={l} style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, padding: '14px 16px', opacity: kpi(i), transform: `scale(${lerp(0.85, 1, kpi(i))})` }}>
              <div style={{ fontSize: 12, color: C.ink2 }}>{l}</div><div style={{ fontSize: 30, fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 8 }}>{v}<span style={{ width: 8, height: 8, borderRadius: 2, background: c }} /></div>
            </div>)}
          </div>
          <div style={{ margin: '14px 22px 0', border: `1px solid ${C.line}`, borderRadius: 14, overflow: 'hidden', fontSize: 13 }}>
            {ROWS.map(([n, c, s], i) => <div key={n} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.1fr 1fr', gap: 10, padding: '11px 14px', borderTop: i ? `1px solid ${C.line}` : 'none', opacity: row(i), transform: `translateX(${(1 - row(i)) * 24}px)` }}>
              <span style={{ fontWeight: 600 }}>{n}</span><span style={{ color: C.ink2 }}>{c}</span><span style={{ color: i === 0 ? C.pink : C.ink2, fontWeight: i === 0 ? 600 : 400 }}>{s}</span>
            </div>)}
          </div>
          <div style={{ margin: '14px 22px 0', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: C.ink2 }}>Applications this month<div style={{ flex: 1, height: 8, borderRadius: 4, background: C.paper, overflow: 'hidden' }}><div style={{ width: `${bar * 72}%`, height: '100%', background: `linear-gradient(90deg, ${C.pink}, ${C.orange})` }} /></div><b style={{ color: C.navy }}>{Math.round(bar * 72)}%</b></div>
        </div>
        {/* Yak says */}
        <div style={{ position: 'absolute', left: 700, top: 520, width: 500, borderRadius: 18, background: C.navy, border: `1.5px solid ${C.yellow}`, boxShadow: '0 30px 60px rgba(0,0,0,0.45)', padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', color: C.white, opacity: yak, transform: `translateY(${(1 - yak) * 40}px) scale(${lerp(0.9, 1, yak)})` }}>
          <BellMark size={44} swing={swing} ring={ring} />
          <div><div style={{ fontSize: 12, fontWeight: 600, color: C.yellow, letterSpacing: 1, textTransform: 'uppercase' }}>Yak says</div><div style={{ fontSize: 16, lineHeight: 1.45, marginTop: 4, minHeight: 46 }}>{typed.slice(0, nChars)}<span style={{ opacity: nChars < typed.length && Math.floor(T * 3) % 2 ? 1 : 0 }}>|</span></div></div>
        </div>
        {t.showCursor && <svg width="28" height="28" viewBox="0 0 24 24" style={{ position: 'absolute', left: cx, top: cy, opacity: MOTION.enter(T, O + 1.2, 0.4) * (1 - MOTION.enter(T, Y + 2.2, 0.4)), filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}><path d="M4 3 L20 11 L12 13 L9 21 Z" fill={C.white} stroke={C.navy} strokeWidth="1.5" /></svg>}
      </div>
    );
  }
  function App() {
    const [t, set] = useTweaks(DEF);
    return (
      <div style={{ width: '100%', height: '100%', minHeight: 480, background: '#0b0b0e' }}>
        <CompositionStage width={1280} height={720} bg={C.navy} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}><Piece t={t} /></CompositionStage>
        <TweaksPanel>
          <TweakSection label="Hero" />
          <TweakToggle label="Show cursor" value={t.showCursor} onChange={(v) => set('showCursor', v)} />
          <TweakSection label="Editor" />
          <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => set('motionEditor', v)} />
        </TweaksPanel>
      </div>
    );
  }
  window.OfficeYakHero = App;
})();
