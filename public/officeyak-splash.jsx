// Website splash / loading screen — 2.8s seamless loop.
(() => {
  const { C, MOTION, BellMark, Ridge } = window.OY;
  const DEF = window.TWEAK_DEFAULTS || { motionEditor: true, ground: 'navy', caption: 'Loading your office…' };
  function Piece({ t }) {
    const { T, CUES, authoredTotal } = useComposition();
    const dark = t.ground === 'navy';
    const ink = dark ? C.white : C.navy;
    const u = (T % authoredTotal) / authoredTotal;
    // one full swing cycle per loop, eased so it pauses at the ends like a real bell
    const swing = Math.sin(u * Math.PI * 2) * 11;
    const ring = Math.max(0, Math.cos(u * Math.PI * 2)) ** 3 * 0.9; // peaks when passing centre
    const bob = Math.sin(u * Math.PI * 4) * 4;
    const barP = u; // progress bar sweeps once per loop
    return (
      <div data-screen-label={`t=${Math.floor(T)}s`} style={{ position: 'absolute', inset: 0, background: dark ? C.navy : C.paper, overflow: 'hidden' }}>
        <Ridge ink={dark ? C.yellow : C.navy} opacity={0.5} y={0.78} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
          <div style={{ transform: `translateY(${bob}px)` }}><BellMark size={168} ink={ink} swing={swing} ring={ring} /></div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 30, fontWeight: 500, color: ink, letterSpacing: -0.4 }}>{t.caption}</div>
          <div style={{ width: 280, height: 4, borderRadius: 2, background: dark ? 'rgba(255,255,255,0.14)' : C.line, overflow: 'hidden' }}>
            <div style={{ width: `${barP * 100}%`, height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${C.pink}, ${C.orange}, ${C.yellow})` }} />
          </div>
        </div>
      </div>
    );
  }
  function App() {
    const [t, set] = useTweaks(DEF);
    return (
      <div style={{ width: '100%', height: '100%', minHeight: 480, background: '#0b0b0e' }}>
        <CompositionStage width={1280} height={720} bg={t.ground === 'navy' ? C.navy : C.paper} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}><Piece t={t} /></CompositionStage>
        <TweaksPanel>
          <TweakSection label="Splash" />
          <TweakRadio label="Ground" value={t.ground} options={['navy', 'light']} onChange={(v) => set('ground', v)} />
          <TweakText label="Caption" value={t.caption} onChange={(v) => set('caption', v)} />
          <TweakSection label="Editor" />
          <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => set('motionEditor', v)} />
        </TweaksPanel>
      </div>
    );
  }
  window.OfficeYakSplash = App;
})();
