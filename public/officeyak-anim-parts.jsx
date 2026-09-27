// Shared OfficeYak motion parts (bell mark, horn-Y, ridge, motion helpers).
window.OY = (() => {
  const C = { navy: '#15133A', orange: '#FF7A1A', pink: '#F0407A', yellow: '#FFC526', white: '#FFFFFF', paper: '#FAFAFC', ink2: '#4B4A62', line: '#E4E4EA' };
  const MOTION = {
    enter: (T, s, d) => Easing.easeOutCubic(clamp((T - s) / d, 0, 1)),
    draw: (T, s, d) => Easing.easeInOutCubic(clamp((T - s) / d, 0, 1)),
    pop: (T, s, d) => Easing.easeOutBack(clamp((T - s) / d, 0, 1)),
  };
  const lerp = (a, b, p) => a + (b - a) * p;
  // decaying bell swing + ring intensity after t0
  const bellRing = (T, t0, amp = 14) => {
    if (T < t0) return { swing: 0, ring: 0 };
    const dt = T - t0;
    return { swing: Math.sin(dt * 14) * amp * Math.exp(-dt * 1.6), ring: Math.max(0, 1 - dt / 1.1) };
  };
  function BellMark({ size = 120, ink = C.white, strap = 1, body = 1, band = 1, clapper = 1, swing = 0, ring = 0, style }) {
    return (
      <svg viewBox="0 0 64 64" style={{ width: size, height: size, display: 'block', overflow: 'visible', flex: 'none', ...style }}>
        <g transform={`rotate(${swing} 32 4)`}>
          <rect x="28" y="4" width="8" height="10" rx="3" fill={ink} style={{ transform: `translateY(${(1 - strap) * -30}px)`, opacity: strap }} />
          <g style={{ transformOrigin: '32px 14px', transform: `rotate(${(1 - body) * -55}deg)`, opacity: clamp(body * 3, 0, 1) }}>
            <path d="M18 18 Q32 10 46 18 L52 44 L12 44 Z" fill={C.orange} />
            <path d="M18 18 Q32 10 46 18 L48 30 L16 30 Z" fill={C.pink} />
          </g>
          <rect x="8" y="42" width="48" height="8" rx="4" fill={C.yellow} style={{ transform: `translateX(${(1 - band) * 48}px)`, opacity: band }} />
          <circle cx="32" cy="55" r="5" fill={ink} style={{ transform: `translateY(${(1 - clapper) * -16}px)`, opacity: clapper }} />
        </g>
        <g stroke={C.yellow} strokeWidth="3" fill="none" strokeLinecap="round" opacity={ring} style={{ transform: `scale(${1 + (1 - ring) * 0.35})`, transformOrigin: '32px 32px' }}>
          <path d="M6 42 Q0 32 6 22" /><path d="M58 42 Q64 32 58 22" />
        </g>
      </svg>
    );
  }
  function HornY({ size = 78, ink = C.white, horns = 1, stem = 1, hub = 1, style }) {
    return (
      <svg viewBox="0 0 64 62" style={{ width: size, height: size, margin: '0 -0.09em 0 0.02em', display: 'block', overflow: 'visible', flex: 'none', ...style }}>
        <path d="M32 33 C30 24 21 17 9 8" fill="none" stroke={C.pink} strokeWidth="15" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - horns} />
        <path d="M32 33 C34 24 43 17 55 8" fill="none" stroke={C.yellow} strokeWidth="15" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - horns} />
        <rect x="24" y="30" width="16" height={32 * stem} rx="7" fill={C.orange} />
        <circle cx="32" cy="33" r="7.5" fill={ink === C.white ? C.navy : ink} style={{ transform: `scale(${hub})`, transformOrigin: '32px 33px' }} />
      </svg>
    );
  }
  // Wordmark with per-letter rise. p(i) → 0..1 for letter index (Office = 0..5, ak = 6..7); yParts = {horns, stem, hub}
  function Wordmark({ fontSize = 108, ink = C.white, p = () => 1, y = {}, style }) {
    const L = (ch, i) => <span key={i} style={{ display: 'inline-block', transform: `translateY(${(1 - p(i)) * 0.37 * fontSize}px)`, opacity: p(i) }}>{ch}</span>;
    return (
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize, fontWeight: 600, letterSpacing: -fontSize / 30, lineHeight: 1, color: ink, display: 'inline-flex', alignItems: 'baseline', ...style }}>
        {'Office'.split('').map(L)}
        <HornY size={fontSize * 0.72} ink={ink} horns={y.horns ?? 1} stem={y.stem ?? 1} hub={y.hub ?? 1} />
        <span style={{ fontWeight: 700, display: 'inline-flex' }}>{'ak'.split('').map((ch, i) => L(ch, i + 6))}</span>
      </span>
    );
  }
  // Ridge silhouette line; w/h = canvas, p = draw progress
  function Ridge({ w = 1280, h = 720, ink = C.yellow, p = 1, fill = 0.06, opacity = 1, y = 0.62, style }) {
    const pts = [[-0.02, 0.78], [0.09, 0.65], [0.19, 0.72], [0.30, 0.55], [0.41, 0.67], [0.52, 0.53], [0.63, 0.64], [0.73, 0.49], [0.84, 0.60], [0.95, 0.51], [1.02, 0.58]];
    const d = pts.map(([x, yy], i) => `${i ? 'L' : 'M'}${x * w} ${(yy - 0.6 + y) * h}`).join(' ');
    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0, width: w, height: h, opacity, ...style }}>
        <path d={d} fill="none" stroke={ink} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} />
        <path d={`${d} L${w * 1.02} ${h * 1.1} L${-w * 0.02} ${h * 1.1} Z`} fill={ink} opacity={fill * p} />
      </svg>
    );
  }
  return { C, MOTION, lerp, bellRing, BellMark, HornY, Wordmark, Ridge };
})();
