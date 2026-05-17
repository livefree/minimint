// components.jsx — shared atomic components for mini-stock
// All SVG-drawn — no external chart libs.

const { useState, useMemo, useId } = React;

// ─────────────────────────────────────────────────────────────────
// Sparkline — small intraday line with optional prevClose dashed line
// ─────────────────────────────────────────────────────────────────
function Sparkline({ data, up, w = 80, h = 32, prevClose = null, strokeWidth = 1.5, showDot = false }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data, prevClose ?? Infinity);
  const max = Math.max(...data, prevClose ?? -Infinity);
  const span = Math.max(max - min, 0.0001);
  const pad = 2;
  const xStep = (w - pad * 2) / (data.length - 1);
  const yOf = (v) => h - pad - ((v - min) / span) * (h - pad * 2);

  const pts = data.map((v, i) => [pad + i * xStep, yOf(v)]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area =
    `M${pts[0][0]},${h} L${pts[0][0]},${pts[0][1]} ` +
    pts.slice(1).map((p) => `L${p[0]},${p[1]}`).join(' ') +
    ` L${pts[pts.length - 1][0]},${h} Z`;

  const stroke = up ? 'rgb(var(--up))' : 'rgb(var(--down))';
  // R-T0.f: React.useId() instead of Math.random() — SSR-safe in Next.js.
  const reactId = useId();
  const gradId = `spk-${reactId.replace(/:/g, '')}-${up ? 'u' : 'd'}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={up ? 'rgb(var(--up))' : 'rgb(var(--down))'} stopOpacity="0.42" />
          <stop offset="100%" stopColor={up ? 'rgb(var(--up))' : 'rgb(var(--down))'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      {prevClose != null && (
        <line
          x1={pad} x2={w - pad}
          y1={yOf(prevClose)} y2={yOf(prevClose)}
          stroke={stroke} strokeOpacity="0.5"
          strokeWidth="1" strokeDasharray="2 3"
        />
      )}
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
      {showDot && (
        <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.4" fill={stroke} />
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Big area / line / candle chart for the symbol detail screen
// ─────────────────────────────────────────────────────────────────
function PriceChart({ data, candleData, mode = 'area', up = true, w = 358, h = 220, gridY = 4, showPriceTicks = true, padInner = { l: 0, r: 0, t: 16, b: 22 } }) {
  if (mode === 'candle' && candleData?.length) {
    return <CandleChart data={candleData} up={up} w={w} h={h} pad={padInner} />;
  }
  return <AreaChart data={data} up={up} w={w} h={h} gridY={gridY} mode={mode} showPriceTicks={showPriceTicks} pad={padInner} />;
}

function AreaChart({ data, up, w, h, gridY, mode, showPriceTicks, pad }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = Math.max(max - min, 0.0001);
  const xStep = (w - pad.l - pad.r) / (data.length - 1);
  const yOf = (v) => h - pad.b - ((v - min) / span) * (h - pad.t - pad.b);
  const pts = data.map((v, i) => [pad.l + i * xStep, yOf(v)]);
  const stroke = up ? 'rgb(var(--up))' : 'rgb(var(--down))';
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area =
    `M${pts[0][0]},${h - pad.b} ` +
    pts.map((p) => `L${p[0]},${p[1]}`).join(' ') +
    ` L${pts[pts.length - 1][0]},${h - pad.b} Z`;
  // R-T0.f: React.useId() instead of Math.random() — SSR-safe in Next.js.
  const reactId = useId();
  const gid = `g-${reactId.replace(/:/g, '')}-${up ? 'u' : 'd'}`;

  // Y ticks for the right-side labels
  const yTicks = [];
  for (let i = 0; i <= gridY; i++) {
    const v = max - (i / gridY) * span;
    yTicks.push({ v, y: pad.t + (i / gridY) * (h - pad.t - pad.b) });
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={up ? 'rgb(var(--up))' : 'rgb(var(--down))'} stopOpacity="0.32" />
          <stop offset="100%" stopColor={up ? 'rgb(var(--up))' : 'rgb(var(--down))'} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* faint grid */}
      {yTicks.map((t, i) => (
        <line key={i} x1={pad.l} x2={w - pad.r} y1={t.y} y2={t.y}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      {mode !== 'line' && <path d={area} fill={`url(#${gid})`} />}
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {showPriceTicks && yTicks.slice(0, -1).map((t, i) => (
        <text key={i} x={w - 2} y={t.y + 3}
              textAnchor="end"
              fontSize="11"
              fill="rgb(var(--text-3) / 0.38)"
              fontWeight="500">
          {t.v.toFixed(0)}
        </text>
      ))}
    </svg>
  );
}

function CandleChart({ data, w, h, pad }) {
  const min = Math.min(...data.map((d) => d.l));
  const max = Math.max(...data.map((d) => d.h));
  const span = Math.max(max - min, 0.0001);
  const inner = w - pad.l - pad.r;
  const cw = (inner / data.length) * 0.6;
  const cs = inner / data.length;
  const yOf = (v) => h - pad.b - ((v - min) / span) * (h - pad.t - pad.b);

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={pad.l} x2={w - pad.r}
              y1={pad.t + (i / 3) * (h - pad.t - pad.b)}
              y2={pad.t + (i / 3) * (h - pad.t - pad.b)}
              stroke="rgba(255,255,255,0.05)" />
      ))}
      {data.map((d, i) => {
        const x = pad.l + i * cs + cs / 2;
        const up = d.c >= d.o;
        const col = up ? 'rgb(var(--up))' : 'rgb(var(--down))';
        const yo = yOf(d.o), yc = yOf(d.c), yh = yOf(d.h), yl = yOf(d.l);
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={yh} y2={yl} stroke={col} strokeWidth="1" />
            <rect x={x - cw/2} y={Math.min(yo, yc)}
                  width={cw} height={Math.max(Math.abs(yc - yo), 1)}
                  fill={col} rx="0.5" />
          </g>
        );
      })}
      {[0,1,2,3].map(i => {
        const v = max - (i / 3) * span;
        const y = pad.t + (i / 3) * (h - pad.t - pad.b);
        return (
          <text key={i} x={w - 2} y={y + 3} textAnchor="end" fontSize="11" fill="rgb(var(--text-3) / 0.38)">
            {v.toFixed(0)}
          </text>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Donut for allocation
// ─────────────────────────────────────────────────────────────────
function AllocationDonut({ data, size = 180, thickness = 22, center = null }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2;
  const inner = r - thickness;
  const palette = [
    '#6BE8B8', '#5AA9FF', '#F2B45C', '#B98CFF', '#FF8AAB', '#7BD6E0', '#9AD16B',
  ];
  let acc = 0;
  const segs = data.map((d, i) => {
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += d.value;
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
    return { start, end, d, color: palette[i % palette.length] };
  });
  const arc = (s, e) => {
    const x1 = r + r * Math.cos(s);
    const y1 = r + r * Math.sin(s);
    const x2 = r + r * Math.cos(e);
    const y2 = r + r * Math.sin(e);
    const xi1 = r + inner * Math.cos(s);
    const yi1 = r + inner * Math.sin(s);
    const xi2 = r + inner * Math.cos(e);
    const yi2 = r + inner * Math.sin(e);
    const large = e - s > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${xi2},${yi2} A${inner},${inner} 0 ${large} 0 ${xi1},${yi1} Z`;
  };
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        {segs.map((s, i) => (
          <path key={i} d={arc(s.start, s.end - 0.005)} fill={s.color} />
        ))}
      </svg>
      {center && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>{center}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Stacked allocation bar — used in compact AccountCard
// ─────────────────────────────────────────────────────────────────
function StackBar({ segments, w = 200, h = 6, r = 3 }) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  const palette = ['#6BE8B8','#5AA9FF','#F2B45C','#B98CFF','#FF8AAB'];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect x="0" y="0" width={w} height={h} fill="rgba(255,255,255,0.05)" rx={r} />
      {segments.map((s, i) => {
        const x = (acc / total) * w;
        const sw = (s.value / total) * w;
        acc += s.value;
        return (
          <rect key={i} x={x} y="0" width={Math.max(sw - 1, 0)} height={h}
                fill={s.color || palette[i % palette.length]} rx={r} />
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Pills
// ─────────────────────────────────────────────────────────────────
function PercentPill({ pct, size = 'lg' }) {
  const up = pct >= 0;
  if (size === 'sm') {
    return (
      <span className={'pill-soft ' + (up ? 'up' : 'down')}>
        {(up ? '+' : '') + pct.toFixed(2) + '%'}
      </span>
    );
  }
  return (
    <span className={'pill ' + (up ? 'up' : 'down')}>
      {(up ? '+' : '') + pct.toFixed(2) + '%'}
    </span>
  );
}

function KindPill({ kind }) {
  const cls = kind === 'BUY' ? 'buy' : kind === 'SELL' ? 'sell' : 'div';
  return <span className={'kindpill ' + cls}>{kind}</span>;
}

// ─────────────────────────────────────────────────────────────────
// Number / money displays — react to "privacy" tweak
// ─────────────────────────────────────────────────────────────────
function PriceText({ value, decimals = 2, hidden = false, prefix = '', suffix = '', style = {}, className = '' }) {
  if (hidden) {
    return <span className={'tnum masked ' + className} style={style}>0000.00</span>;
  }
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  });
  return <span className={'tnum ' + className} style={style}>{prefix}{formatted}{suffix}</span>;
}

// ─────────────────────────────────────────────────────────────────
// Tiny icons (SF Symbol-ish, hand-rolled SVG paths)
// ─────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = 'currentColor', strokeWidth = 1.75 }) => {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'search':       return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>;
    case 'plus':         return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case 'minus':        return <svg {...common}><path d="M5 12h14"/></svg>;
    case 'check':        return <svg {...common}><path d="M5 13l4 4L19 7"/></svg>;
    case 'chevron-r':    return <svg {...common}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevron-l':    return <svg {...common}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'chevron-d':    return <svg {...common}><path d="M6 9l6 6 6-6"/></svg>;
    case 'chevron-u':    return <svg {...common}><path d="M6 15l6-6 6 6"/></svg>;
    case 'chart':        return <svg {...common}><path d="M3 17l5-5 4 4 8-9"/><path d="M14 7h6v6"/></svg>;
    case 'eye':          return <svg {...common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'eye-off':      return <svg {...common}><path d="M3 3l18 18"/><path d="M10.6 6.1A10.8 10.8 0 0112 6c6.5 0 10 6 10 6a17.7 17.7 0 01-3.2 4"/><path d="M6.7 6.7A17.6 17.6 0 002 12s3.5 6 10 6a10.7 10.7 0 005.3-1.4"/><path d="M14.1 14.1A3 3 0 019.9 9.9"/></svg>;
    case 'wallet':       return <svg {...common}><rect x="2" y="6" width="20" height="14" rx="3"/><path d="M16 13h2"/><path d="M2 10h20"/></svg>;
    case 'user':         return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>;
    case 'bell':         return <svg {...common}><path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9z"/><path d="M10 21a2 2 0 004 0"/></svg>;
    case 'more':         return <svg {...common}><circle cx="5" cy="12" r="1.2" fill={color}/><circle cx="12" cy="12" r="1.2" fill={color}/><circle cx="19" cy="12" r="1.2" fill={color}/></svg>;
    case 'cmd':          return <svg {...common}><path d="M9 3a3 3 0 100 6h6a3 3 0 100-6 3 3 0 00-3 3v12a3 3 0 11-3-3h6a3 3 0 113 3"/></svg>;
    case 'arrow-r':      return <svg {...common}><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>;
    case 'arrow-u':      return <svg {...common}><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>;
    case 'arrow-d':      return <svg {...common}><path d="M12 5v14"/><path d="M5 12l7 7 7-7"/></svg>;
    case 'arrow-ud':     return <svg {...common}><path d="M7 4v16M3 8l4-4 4 4"/><path d="M17 20V4M21 16l-4 4-4-4"/></svg>;
    case 'x':            return <svg {...common}><path d="M6 6l12 12M6 18L18 6"/></svg>;
    case 'edit':         return <svg {...common}><path d="M4 20h4l10-10-4-4L4 16v4z"/></svg>;
    case 'trash':        return <svg {...common}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M5 6l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14"/></svg>;
    case 'calendar':     return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>;
    case 'refresh':      return <svg {...common}><path d="M21 12a9 9 0 11-3-6.7"/><path d="M21 4v5h-5"/></svg>;
    case 'sun':          return <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5"/></svg>;
    case 'briefcase':    return <svg {...common}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M3 13h18"/></svg>;
    case 'grid':         return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case 'tag':          return <svg {...common}><path d="M20 12l-8 8a2 2 0 01-3 0L3 14a2 2 0 010-3l8-8h8v8z"/><circle cx="15" cy="9" r="1.2" fill={color}/></svg>;
    case 'mic':          return <svg {...common}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0"/><path d="M12 18v3"/></svg>;
    case 'expand':       return <svg {...common}><path d="M4 9V4h5"/><path d="M20 9V4h-5"/><path d="M4 15v5h5"/><path d="M20 15v5h-5"/></svg>;
    case 'star':         return <svg {...common}><path d="M12 3l3 6 6 .9-4.5 4.3 1 6.3L12 17.8 6.5 20.5l1-6.3L3 9.9 9 9z"/></svg>;
    case 'apple':        return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M16.4 12.7c0-2.6 2.1-3.8 2.2-3.9-1.2-1.7-3-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.6 1.3 10 .9 1.2 1.9 2.5 3.2 2.5 1.3-.1 1.7-.8 3.3-.8s1.9.8 3.3.8c1.4 0 2.2-1.2 3-2.4.5-.7.9-1.6 1.2-2.5-1.8-.7-3.4-2.4-3.4-4.2zM13.7 5.2c.7-.9 1.2-2.1 1.1-3.2-1 0-2.3.7-3 1.5-.7.8-1.3 2-1.1 3.1 1.2.1 2.3-.6 3-1.4z"/></svg>;
    default:             return null;
  }
};

// ── Brand logo dot (tiny "minimint" mark, for hero / sidebar) ──
function BrandMark({ size = 22 }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: size * 0.28,
      background: 'linear-gradient(135deg, rgb(var(--mint)), rgb(var(--mint-2)))',
      boxShadow: 'inset 0 .5px 0 rgba(255,255,255,0.4)',
      color: '#07120D',
      fontWeight: 800,
      fontSize: size * 0.5,
      letterSpacing: '-0.04em',
    }}>m</span>
  );
}

// Symbol "logo" — colored rounded square with letter
function SymbolLogo({ sym, size = 36 }) {
  const colors = {
    AAPL: '#FFFFFF', MSFT: '#7BD6E0', NVDA: '#9AD16B', GOOG: '#5AA9FF',
    TSLA: '#FF8AAB', AMZN: '#F2B45C', META: '#5AA9FF', AVGO: '#B98CFF',
    SPY:  '#6BE8B8', QQQ:  '#6BE8B8', COST: '#F2B45C', AMD:  '#FF8AAB',
  };
  const c = colors[sym] || '#9AA0AA';
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: c,
      color: '#07120D',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800,
      fontSize: size * 0.36,
      letterSpacing: '-0.02em',
      flex: '0 0 auto',
    }}>{sym[0]}</div>
  );
}

Object.assign(window, {
  Sparkline, PriceChart, AreaChart, CandleChart,
  AllocationDonut, StackBar,
  PercentPill, KindPill, PriceText,
  Icon, BrandMark, SymbolLogo,
});
