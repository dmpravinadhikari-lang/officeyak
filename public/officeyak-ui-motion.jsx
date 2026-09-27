// UI micro-motion library — six system states, each looping on the shared clock.
(() => {
  const { C, MOTION, lerp, BellMark, HornY, Ridge } = window.OY;
  const DEF = window.TWEAK_DEFAULTS || { motionEditor: true, ground: 'light' };
  const FONT = "'Outfit', sans-serif";
  const cyc = (T, period, offset = 0) => ((T + offset) % period) / period; // 0..1
  function Tile({ title, note, children, dark }) {
    return (
      <div style={{ background: dark ? 'rgba(255,255,255,0.05)' : C.white, border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : C.line}`, borderRadius: 18, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, color: dark ? C.white : C.navy }}>
        <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>{children}</div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.6)' : C.ink2, lineHeight: 1.4 }}>{note}</div>
      </div>
    );
  }
  function Piece({ t }) {
    const { T } = useComposition();
    const dark = t.ground === 'navy';
    const ink = dark ? C.white : C.navy;
    // 1 spinner: bell swings continuously
    const u1 = cyc(T, 1.6);
    // 2 notification ping: ring every 2s
    const u2 = cyc(T, 2.4);
    const ping = u2 < 0.45 ? Easing.easeOutCubic(u2 / 0.45) : 1;
    const pingSwing = u2 < 0.6 ? Math.sin(u2 * 26) * 12 * (1 - u2 / 0.6) : 0;
    const badge = MOTION.pop(u2, 0.05, 0.3);
    // 3 success: horn-Y draws then tick
    const u3 = cyc(T, 3);
    const y3 = { stem: MOTION.enter(u3, 0, 0.18), horns: MOTION.draw(u3, 0.1, 0.25), hub: MOTION.pop(u3, 0.33, 0.15) };
    const tick = MOTION.draw(u3, 0.45, 0.2);
    const fade3 = 1 - MOTION.enter(u3, 0.88, 0.1);
    // 4 skeleton shimmer
    const u4 = cyc(T, 1.4);
    // 5 button press → loading → done
    const u5 = cyc(T, 3.2);
    const press = u5 > 0.1 && u5 < 0.18 ? 0.96 : 1;
    const loading = u5 > 0.18 && u5 < 0.7;
    const done = u5 >= 0.7 && u5 < 0.95;
    // 6 empty state: ridge draws, bell drifts
    const u6 = cyc(T, 4);
    const ridge6 = MOTION.draw(u6, 0, 0.35);
    const fade6 = 1 - MOTION.enter(u6, 0.9, 0.1);
    const shimmer = (i) => ({ height: 10, borderRadius: 5, width: ['80%', '55%', '68%'][i], background: `linear-gradient(90deg, ${dark ? 'rgba(255,255,255,0.08)' : '#ECECF1'} 0%, ${dark ? 'rgba(255,255,255,0.18)' : '#F7F7FA'} 50%, ${dark ? 'rgba(255,255,255,0.08)' : '#ECECF1'} 100%)`, backgroundSize: '200% 100%', backgroundPosition: `${lerp(100, -100, u4)}% 0` });
    return (
      <div data-screen-label={`t=${Math.floor(T)}s`} style={{ position: 'absolute', inset: 0, background: dark ? C.navy : C.paper, fontFamily: FONT, padding: '34px 48px', display: 'grid', gridTemplateRows: 'auto 1fr', gap: 22, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: ink }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><BellMark size={34} ink={ink} /><span style={{ fontSize: 20, fontWeight: 600 }}>System motion</span></div>
          <span style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.6)' : C.ink2 }}>Ease-out cubic · 200–600 ms · one motif: the bell</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 18 }}>
          <Tile dark={dark} title="Loading spinner" note="Bell swings ±12° on a sine; replaces generic spinners in the dashboard.">
            <BellMark size={72} ink={ink} swing={Math.sin(u1 * Math.PI * 2) * 12} />
          </Tile>
          <Tile dark={dark} title="Notification ping" note="Ring arcs expand once, badge pops. Fires when the Yak has something for you.">
            <div style={{ position: 'relative' }}>
              <BellMark size={72} ink={ink} swing={pingSwing} ring={1 - ping} />
              <div style={{ position: 'absolute', right: -6, top: -4, minWidth: 22, height: 22, borderRadius: 11, background: C.pink, color: C.white, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', transform: `scale(${badge})` }}>3</div>
            </div>
          </Tile>
          <Tile dark={dark} title="Success" note="Horn-Y draws in, then a tick lands on the hub. Used after save, submit, upload.">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: fade3 }}>
              <HornY size={72} ink={ink} {...y3} style={{ margin: 0 }} />
              <svg width="44" height="44" viewBox="0 0 24 24" style={{ opacity: tick > 0 ? 1 : 0 }}><circle cx="12" cy="12" r="10" fill={C.yellow} opacity={0.25 * tick} /><path d="M6 12.5 L10 16.5 L18 8" fill="none" stroke={C.orange} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - tick} /></svg>
            </div>
          </Tile>
          <Tile dark={dark} title="Skeleton shimmer" note="Sweeps left→right in 1.4 s while a record loads. Never more than one shimmer group per view.">
            <div style={{ width: '100%', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 24, flex: 'none', ...shimmer(0), width: 48 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>{[0, 1, 2].map((i) => <div key={i} style={shimmer(i)} />)}</div>
            </div>
          </Tile>
          <Tile dark={dark} title="Button states" note="Press scales to 96%, loading swaps label for a mini bell, done flashes yellow.">
            <div style={{ background: done ? C.yellow : C.orange, color: done ? C.navy : C.white, padding: '14px 26px', borderRadius: 12, fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10, transform: `scale(${press})`, minWidth: 170, justifyContent: 'center' }}>
              {loading && <BellMark size={20} ink={C.white} swing={Math.sin(T * 12) * 14} />}
              {loading ? 'Saving…' : done ? 'Saved' : 'Save student'}
            </div>
          </Tile>
          <Tile dark={dark} title="Empty state" note="Ridge draws in under a resting bell — no files yet, nothing to carry.">
            <div style={{ position: 'absolute', inset: 0, opacity: fade6, overflow: 'hidden', borderRadius: 12 }}>
              <Ridge w={340} h={130} p={ridge6} ink={dark ? C.yellow : C.navy} y={0.9} fill={0.08} style={{ width: '100%', height: '100%' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, top: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: 12, color: dark ? 'rgba(255,255,255,0.7)' : C.ink2 }}>
                <BellMark size={44} ink={ink} swing={Math.sin(u6 * Math.PI * 2) * 4} style={{ opacity: MOTION.enter(u6, 0.2, 0.2) }} />
                <span style={{ opacity: MOTION.enter(u6, 0.35, 0.2) }}>No students yet. Add your first lead.</span>
              </div>
            </div>
          </Tile>
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
          <TweakSection label="Library" />
          <TweakRadio label="Ground" value={t.ground} options={['light', 'navy']} onChange={(v) => set('ground', v)} />
          <TweakSection label="Editor" />
          <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => set('motionEditor', v)} />
        </TweaksPanel>
      </div>
    );
  }
  window.OfficeYakUIMotion = App;
})();
