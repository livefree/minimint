// screens-home-v2.jsx — consolidated Home tab (R-N1) for mini-stock.
// Merges Watchlist + Accounts content into the Home screen with a single
// unified row style. Adds: Market status strip, Accounts ribbon, Watchlist
// list switcher, Movers, Allocation, Recent Activity. 4-tab TabBar (no FAB).

const { useMemo: __useMemoH2 } = React;

// ─────────────────────────────────────────────────────────────────
// Section accent palette — eyebrows only (R-T3)
// ─────────────────────────────────────────────────────────────────
const SEC = {
  portfolio: '#6BE8B8',   // mint
  watchlist: '#7AB6FF',   // sky blue
  symbol:    '#C9B6FF',   // lavender
  activity:  '#FFC176',   // amber
};

// Account color palette (R-N2.b) — muted tones, distinct from sector hues.
const ACCT_COLORS = {
  'fid-ind':  '#7AB0FF',  // ocean
  'fid-roth': '#E0B274',  // bronze
};

// ─────────────────────────────────────────────────────────────────
// Section eyebrow — uppercase label in sector accent + optional action
// ─────────────────────────────────────────────────────────────────
function Eyebrow({ label, accent, action, style = {} }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 20px 8px',
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 11.5, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: accent,
        }}>{label}</span>
        <span style={{
          width: 24, height: 1, background: accent, opacity: 0.55,
        }}/>
      </div>
      {action && (
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'rgb(var(--text-2) / 0.62)' }}>
          {action}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Profile avatar chip — 28px circle
// ─────────────────────────────────────────────────────────────────
function ProfileChip({ name = 'Sam', initials = 'S', color = '#6BE8B8', size = 30 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `rgba(107,232,184,0.18)`,
      color: color,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.46,
      letterSpacing: '-0.01em',
      border: `1px solid ${color}55`,
      flex: '0 0 auto',
    }}>{initials}</div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Market status strip — open/closed + tiny S&P pill
// ─────────────────────────────────────────────────────────────────
function MarketStatusStrip({ open = true }) {
  const dot = open ? 'rgb(var(--up))' : 'rgb(var(--text-3) / 0.38)';
  return (
    <div style={{
      margin: '0 16px 12px',
      padding: '8px 12px',
      borderRadius: 10,
      background: 'rgba(255,255,255,0.04)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontSize: 12,
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgb(var(--text-2) / 0.62)' }}>
        <span style={{
          display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
          background: dot,
          boxShadow: `0 0 0 3px ${open ? 'rgba(52,211,153,0.18)' : 'transparent'}`,
        }}/>
        <span style={{ color: 'rgb(var(--text))', fontWeight: 600 }}>US Markets</span>
        <span>· {open ? 'Open' : 'Closed'}</span>
        <span style={{ color: 'rgb(var(--text-3) / 0.38)' }}>· Closes 4:00 PM ET</span>
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
        <span style={{ color: 'rgb(var(--text-3) / 0.38)', fontSize: 11 }}>S&amp;P</span>
        <span style={{ color: 'rgb(var(--down))' }} className="tnum">−1.24%</span>
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// V2 nav header (iOS) — avatar + greeting + actions
// ─────────────────────────────────────────────────────────────────
function NavHeaderV2({ greeting, title, trailing }) {
  return (
    <div style={{
      padding: '4px 16px 12px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <ProfileChip/>
      <div style={{ flex: 1, minWidth: 0 }}>
        {greeting && (
          <div style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 500, lineHeight: 1.1 }}>
            {greeting}
          </div>
        )}
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {title}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>{trailing}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Hero — Net worth with directional radial gradient (R-T2)
// ─────────────────────────────────────────────────────────────────
function NetWorthHero({ portfolio, hide }) {
  const P = portfolio;
  const up = P.todayPL >= 0;
  const grad = up
    ? 'radial-gradient(140% 90% at 0% 0%, rgba(52,211,153,0.18) 0%, transparent 55%)'
    : 'radial-gradient(140% 90% at 0% 0%, rgba(251,113,133,0.16) 0%, transparent 55%)';
  return (
    <div style={{
      margin: '0 16px 14px',
      padding: '16px 18px 10px',
      borderRadius: 20,
      background: `${grad}, rgb(var(--surface-1))`,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: SEC.portfolio }}>
          Net Worth
        </div>
        <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 500 }}>
          {ACCOUNTS.length} accounts · {POSITIONS.length} positions
        </div>
      </div>
      <div style={{ marginTop: 6 }}>
        <PriceText value={P.netWorth} hidden={hide} prefix="$" decimals={2}
                   style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.026em' }}/>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4, fontSize: 14, fontWeight: 600 }}>
        <span className="tnum" style={{ color: up ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
          {hide ? '••••••' : ((up ? '+' : '') + fmtMoney(P.todayPL))}
        </span>
        <span className="tnum" style={{ color: up ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
          {(up ? '+' : '') + P.todayPct.toFixed(2)}%
        </span>
        <span style={{ color: 'rgb(var(--text-3) / 0.38)', fontWeight: 500 }}>Today</span>
        <span style={{ flex: 1 }}/>
        <span className="tnum" style={{ color: 'rgb(var(--up))', fontSize: 12.5 }}>
          +{fmtMoney(P.totalPL)} all-time
        </span>
      </div>
      <div style={{ marginTop: 6, marginLeft: -4, marginRight: -4 }}>
        <AreaChart data={P.history6M} up={up} w={326} h={86} gridY={3} mode="area"
                   showPriceTicks={false} pad={{ l: 0, r: 0, t: 8, b: 6 }}/>
      </div>
      <RangeChips active="6M" sizes={['1D','1W','1M','3M','6M','1Y','ALL']} compact/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Accounts ribbon — horizontal scroll of broker chips w/ color stripe
// ─────────────────────────────────────────────────────────────────
function AccountsRibbon({ hide }) {
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '0 16px',
      overflow: 'hidden',
    }}>
      {ACCOUNTS.map((acc) => {
        const val = acc.holdings.reduce((s, h) => s + h.qty * SYMBOLS[h.sym].price, 0);
        const today = acc.holdings.reduce((s, h) => s + h.qty * SYMBOLS[h.sym].change, 0);
        const pct = (today / (val - today)) * 100;
        const up = today >= 0;
        const color = ACCT_COLORS[acc.id] || '#8AA0FF';
        return (
          <div key={acc.id} style={{
            flex: '0 0 calc(50% - 5px)',
            position: 'relative',
            background: 'rgb(var(--surface-1))',
            borderRadius: 14,
            padding: '14px 14px 12px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
            overflow: 'hidden',
          }}>
            {/* color stripe */}
            <span style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: color,
            }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6,
                background: `${color}33`,
                color: color,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, letterSpacing: 0.02,
              }}>F</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.1,
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {acc.name}
                </div>
                <div style={{ fontSize: 10, color: 'rgb(var(--text-3) / 0.38)', marginTop: 1 }}>
                  {acc.broker} · ••{acc.last4}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <PriceText value={val} hidden={hide} prefix="$" decimals={2}
                         style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.015em' }}/>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <span className="tnum" style={{ fontSize: 12, fontWeight: 600,
                                                color: up ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                {(up ? '+' : '') + fmtMoney(today)}
              </span>
              <span className="pill-soft" style={{
                color: up ? 'rgb(var(--up))' : 'rgb(var(--down))',
                background: up ? 'var(--up-bg)' : 'var(--down-bg)',
                fontSize: 11,
              }}>
                {(up ? '+' : '') + pct.toFixed(2)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Watchlist tab chips — switch between user lists
// ─────────────────────────────────────────────────────────────────
function WatchlistTabs({ active = 0, lists = ['My Symbols', 'Mega Cap', 'ETFs', 'Watching'] }) {
  return (
    <div style={{
      display: 'flex', gap: 6, padding: '0 16px 10px',
      overflow: 'hidden',
    }}>
      {lists.map((l, i) => (
        <span key={l} style={{
          padding: '6px 12px',
          borderRadius: 999,
          fontSize: 12.5, fontWeight: 600,
          background: i === active ? 'rgb(var(--surface-2))' : 'transparent',
          color: i === active ? 'rgb(var(--text))' : 'rgb(var(--text-3) / 0.38)',
          border: i === active ? '0' : '1px solid rgba(255,255,255,0.06)',
          whiteSpace: 'nowrap',
        }}>{l}</span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// UNIFIED ROW — same list shape for watchlist symbols AND positions
//
// modes:
//   'watch'    — symbol + name + sparkline + price + %-pill
//   'position' — same + small "qty · avg cost" line under name +
//                  small account-color dot leading
//   'index'    — index name + last + %-pill (no sparkline / position info)
//
// Yahoo-style: filled colored pill on the right (matches IMG_5094 trending row).
// ─────────────────────────────────────────────────────────────────
function UniRow({ s, mode = 'watch', hidden, position = null, last = false,
                  showAccountDot = false, accentColor }) {
  const up = s.up;
  const dot = accentColor || (position ? ACCT_COLORS[position.account.id] : null);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 4px',
      borderBottom: last ? 'none' : '.5px solid var(--separator)',
      minHeight: 56,
    }}>
      {/* Leading: optional account color dot */}
      {showAccountDot && dot && (
        <span style={{
          width: 4, alignSelf: 'stretch',
          background: dot,
          borderRadius: 2, flex: '0 0 auto',
          margin: '4px 0',
        }}/>
      )}

      {/* Symbol + name (+ position qty) */}
      <div style={{ flex: '0 0 auto', minWidth: 96, maxWidth: 110 }}>
        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 0.01, lineHeight: 1.15 }}>
          {s.symbol}
        </div>
        <div style={{ fontSize: 11.5, color: 'rgb(var(--text-3) / 0.38)', lineHeight: 1.2,
                       whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {s.name}
        </div>
        {mode === 'position' && position && (
          <div className="tnum" style={{ fontSize: 10.5, color: 'rgb(var(--text-3) / 0.38)',
                                          marginTop: 2, letterSpacing: 0.02 }}>
            {position.qty} sh · ${fmtNum(position.avgCost)}
          </div>
        )}
      </div>

      {/* Sparkline */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Sparkline data={s.spark} up={up} w={94} h={34}
                   prevClose={s.prevCloseLine} showDot/>
      </div>

      {/* Right: price + filled % pill (Yahoo style) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                    gap: 4, minWidth: 84 }}>
        <PriceText value={s.price} hidden={hidden}
                   style={{ fontSize: 16, fontWeight: 700, letterSpacing: 0.01 }}/>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 66, padding: '4px 9px',
          borderRadius: 6,
          background: up ? 'rgb(var(--up))' : 'rgb(var(--down))',
          color: '#fff',
          fontSize: 12, fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {(up ? '+' : '') + s.change.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 4-tab v2 tab bar (Home · Portfolio · Market · Me — no FAB)
// ─────────────────────────────────────────────────────────────────
function IOSTabBarV2({ active = 'home' }) {
  const tabs = [
    { id: 'home',     label: 'Home',      icon: 'chart' },
    { id: 'port',     label: 'Portfolio', icon: 'briefcase' },
    { id: 'market',   label: 'Market',    icon: 'grid' },
    { id: 'me',       label: 'Me',        icon: 'user' },
  ];
  return (
    <div className="ios-tabbar" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
      {tabs.map((t) => (
        <div key={t.id} className={`tab ${active === t.id ? 'active' : ''}`}>
          <Icon name={t.icon} size={22}
                color={active === t.id ? 'rgb(var(--mint))' : 'rgb(var(--text-2) / 0.62)'}
                strokeWidth={active === t.id ? 2 : 1.8}/>
          <span>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS HOME V2 — single consolidated home screen
// ─────────────────────────────────────────────────────────────────
function IOSHomeV2({ tweaks, height = 1820 }) {
  const hide = !!tweaks.privacy;
  const P = PORTFOLIO;

  // Build "Today's Movers" — pick top 4 holdings by abs %
  const movers = __useMemoH2(() => P.movers.slice(0, 4), []);

  // For the watchlist strip: use the user's WATCHLIST, sliced.
  const wlSlice = __useMemoH2(() => WATCHLIST.slice(0, 5), []);

  // Indices for market strip (synthetic)
  const indices = [
    { sym: 'S&P 500', price: 5803.40, pct: -1.24, up: false, dot: '#7AB6FF' },
    { sym: 'NASDAQ',  price: 18672.10, pct: -1.54, up: false, dot: '#C9B6FF' },
    { sym: 'DOW',     price: 42120.30, pct: -1.07, up: false, dot: '#F2B45C' },
  ];

  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* Header */}
          <NavHeaderV2
            greeting="Good evening, Sam"
            title="Home"
            trailing={
              <>
                <span className="iconbtn"><Icon name="search" size={15}/></span>
                <span className="iconbtn" style={{ position: 'relative' }}>
                  <Icon name="bell" size={15}/>
                  <span style={{
                    position: 'absolute', top: 6, right: 7,
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'rgb(var(--down))', border: '1.5px solid rgb(var(--surface-2))',
                  }}/>
                </span>
              </>
            }
          />

          {/* Market status strip */}
          <MarketStatusStrip open/>

          {/* Hero */}
          <NetWorthHero portfolio={P} hide={hide}/>

          {/* ── ACCOUNTS ─────────────────────────────────────── */}
          <Eyebrow
            label="Accounts"
            accent={SEC.portfolio}
            action={<span>Manage <Icon name="chevron-r" size={11} color="rgb(var(--text-3) / 0.38)"/></span>}
            style={{ padding: '6px 20px 10px' }}
          />
          <AccountsRibbon hide={hide}/>

          {/* ── WATCHLIST ────────────────────────────────────── */}
          <Eyebrow
            label="Watchlist"
            accent={SEC.watchlist}
            action={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon name="arrow-ud" size={12} color="rgb(var(--text-3) / 0.38)"/> Manual
              </span>
            }
          />
          <WatchlistTabs active={0}/>
          <div style={{ padding: '0 20px' }}>
            {wlSlice.map((s, i) => {
              // Mark "owned" rows with the account-color dot.
              const pos = POSITIONS.find((p) => p.sym === s.symbol);
              return (
                <UniRow
                  key={s.symbol} s={s}
                  mode={pos ? 'position' : 'watch'}
                  position={pos || null}
                  hidden={hide}
                  showAccountDot={!!pos}
                  last={i === wlSlice.length - 1}
                />
              );
            })}
          </div>
          <div style={{ padding: '6px 20px 0', textAlign: 'right' }}>
            <span style={{ fontSize: 12.5, color: SEC.watchlist, fontWeight: 600 }}>
              See all {WATCHLIST.length} →
            </span>
          </div>

          {/* ── TODAY'S MOVERS ──────────────────────────────── */}
          <Eyebrow label="Today's Movers" accent={SEC.activity} action="In portfolio"/>
          <div style={{ display: 'flex', gap: 10, padding: '0 16px', overflow: 'hidden' }}>
            {movers.map((m) => (
              <div key={m.sym + m.account.id} style={{
                flex: '0 0 110px',
                background: 'rgb(var(--surface-1))',
                borderRadius: 12,
                padding: '10px 11px 11px',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800 }}>{m.sym}</span>
                  <PercentPill pct={m.symbol.pct} size="sm"/>
                </div>
                <div style={{ margin: '6px -3px 4px' }}>
                  <Sparkline data={m.symbol.spark} up={m.symbol.up} w={96} h={28}/>
                </div>
                <div className="tnum" style={{ fontSize: 13, fontWeight: 700 }}>
                  ${fmtNum(m.symbol.price)}
                </div>
              </div>
            ))}
          </div>

          {/* ── INDICES ─────────────────────────────────────── */}
          <Eyebrow label="US Indices" accent={SEC.watchlist} action="1D"/>
          <div style={{ padding: '0 20px' }}>
            {indices.map((ix, i) => (
              <div key={ix.sym} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 4px',
                borderBottom: i === indices.length - 1 ? 'none' : '.5px solid var(--separator)',
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: ix.dot, flex: '0 0 auto',
                }}/>
                <span style={{ fontSize: 14.5, fontWeight: 700, flex: 1 }}>{ix.sym}</span>
                <span className="tnum" style={{ fontSize: 14, fontWeight: 700 }}>
                  {ix.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="tnum" style={{
                  fontSize: 12.5, fontWeight: 700,
                  minWidth: 64, textAlign: 'right',
                  color: ix.up ? 'rgb(var(--up))' : 'rgb(var(--down))',
                }}>
                  {(ix.up ? '+' : '') + ix.pct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>

          {/* ── ALLOCATION ──────────────────────────────────── */}
          <Eyebrow label="Allocation" accent={SEC.symbol} action={`${P.allocation.length} sectors`}/>
          <div style={{ padding: '0 16px' }}>
            <div style={{
              background: 'rgb(var(--surface-1))',
              borderRadius: 14,
              padding: '14px 16px',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <AllocationDonut data={P.allocation} size={92} thickness={12}
                center={
                  <div>
                    <div style={{ fontSize: 9, color: 'rgb(var(--text-3) / 0.38)',
                                  letterSpacing: 0.06, textTransform: 'uppercase' }}>Total</div>
                    <div className="tnum" style={{ fontSize: 13, fontWeight: 800 }}>
                      ${fmtCompact(P.netWorth)}
                    </div>
                  </div>
                }/>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {P.allocation.slice(0, 5).map((a, i) => {
                  const colors = ['#6BE8B8','#5AA9FF','#F2B45C','#B98CFF','#FF8AAB'];
                  return (
                    <div key={a.sector} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 2, background: colors[i] }}/>
                      <span style={{ flex: 1, color: 'rgb(var(--text-2) / 0.62)' }}>{a.sector}</span>
                      <span className="tnum" style={{ color: 'rgb(var(--text))', fontWeight: 700 }}>
                        {a.pct.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── RECENT ACTIVITY ─────────────────────────────── */}
          <Eyebrow label="Recent Activity" accent={SEC.activity} action="All →"/>
          <div style={{ padding: '0 20px 24px' }}>
            {TRANSACTIONS.slice(0, 4).map((t, i, arr) => {
              const s = SYMBOLS[t.sym];
              const total = t.qty * t.price;
              const isBuy = t.kind === 'BUY';
              const isSell = t.kind === 'SELL';
              const isDiv = t.kind === 'DIV';
              return (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderBottom: i === arr.length - 1 ? 'none' : '.5px solid var(--separator)',
                }}>
                  <KindPill kind={t.kind}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                      {t.sym}
                      <span style={{ color: 'rgb(var(--text-3) / 0.38)', fontWeight: 500, fontSize: 12.5 }}>
                        {' · '}{t.qty} sh @ ${fmtNum(t.price)}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', marginTop: 1 }}>
                      {t.when} · {t.account}
                    </div>
                  </div>
                  <div className="tnum" style={{
                    fontSize: 14, fontWeight: 700,
                    color: isDiv ? 'rgb(var(--mint))' : isSell ? 'rgb(var(--down))' : 'rgb(var(--text))',
                  }}>
                    {isBuy ? '−' : isSell || isDiv ? '+' : ''}${fmtNum(total)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <IOSTabBarV2 active="home"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAC HOME V2 — denser 2-col layout
// ─────────────────────────────────────────────────────────────────
function MacSidebarV2({ active = 'home' }) {
  const nav = [
    { id: 'home',   label: 'Home',      icon: 'chart' },
    { id: 'port',   label: 'Portfolio', icon: 'briefcase' },
    { id: 'market', label: 'Market',    icon: 'grid' },
    { id: 'me',     label: 'Me',        icon: 'user' },
  ];
  return (
    <aside className="mac-sidebar">
      <div className="brand">
        <span className="dot"/> mini-stock
      </div>

      {/* Profile chip */}
      <div style={{
        margin: '0 4px 12px',
        padding: '8px 10px',
        background: 'rgba(107,232,184,0.08)',
        border: '1px solid rgba(107,232,184,0.18)',
        borderRadius: 10,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <ProfileChip size={26}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.1 }}>Sam Chen</div>
          <div className="tnum" style={{ fontSize: 10.5, color: 'rgb(var(--text-3) / 0.38)' }}>
            ${fmtCompact(PORTFOLIO.netWorth)} ·
            <span style={{ color: PORTFOLIO.todayPL >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
              {' '}{(PORTFOLIO.todayPL >= 0 ? '+' : '') + PORTFOLIO.todayPct.toFixed(2)}%
            </span>
          </div>
        </div>
        <Icon name="chevron-d" size={12} color="rgb(var(--text-3) / 0.38)"/>
      </div>

      <div style={{ position: 'relative', margin: '0 4px 14px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 10px',
          background: 'rgb(var(--surface-2))',
          borderRadius: 9,
          fontSize: 13, color: 'rgb(var(--text-3) / 0.38)',
        }}>
          <Icon name="search" size={14}/>
          <span style={{ flex: 1 }}>Search</span>
          <span className="kbd">⌘K</span>
        </div>
      </div>

      {nav.map((n) => (
        <div key={n.id} className={`navitem ${active === n.id ? 'active' : ''}`}>
          <Icon name={n.icon} size={16}/>
          <span style={{ flex: 1 }}>{n.label}</span>
        </div>
      ))}

      <div className="group-label">Accounts</div>
      {ACCOUNTS.map((a) => {
        const color = ACCT_COLORS[a.id] || '#8AA0FF';
        return (
          <div key={a.id} className="navitem" style={{ paddingLeft: 10, gap: 8 }}>
            <span style={{
              width: 16, height: 16, borderRadius: 4,
              background: `${color}33`,
              color: color,
              border: `1px solid ${color}55`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 800,
            }}>F</span>
            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {a.name}
            </span>
          </div>
        );
      })}

      <div style={{ flex: 1 }}/>
      <div className="navitem">
        <Icon name="user" size={16}/>
        <span style={{ flex: 1 }}>Sam Chen</span>
        <Icon name="more" size={14}/>
      </div>
    </aside>
  );
}

function MacHomeV2({ tweaks }) {
  const P = PORTFOLIO;
  const hide = !!tweaks.privacy;
  const up = P.todayPL >= 0;
  const grad = up
    ? 'radial-gradient(80% 100% at 0% 0%, rgba(52,211,153,0.14) 0%, transparent 60%)'
    : 'radial-gradient(80% 100% at 0% 0%, rgba(251,113,133,0.13) 0%, transparent 60%)';

  const wlSlice = WATCHLIST.slice(0, 8);

  return (
    <div className="mac">
      <MacTitleBar/>
      <MacSidebarV2 active="home"/>
      <main className="mac-main">
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div className="h-eyebrow" style={{ marginBottom: 6 }}>
              Tuesday · May 15 · {ACCOUNTS.length} accounts · markets open
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.022em', lineHeight: 1.05 }}>
              Good evening, Sam
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="iconbtn"><Icon name={hide ? 'eye-off' : 'eye'} size={16}/></span>
            <span className="iconbtn"><Icon name="refresh" size={16}/></span>
            <span className="iconbtn"><Icon name="bell" size={16}/></span>
          </div>
        </div>

        {/* Row 1: Net worth hero  +  Accounts column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Net worth */}
          <div style={{
            background: `${grad}, rgb(var(--surface-1))`,
            borderRadius: 18, padding: '20px 24px 16px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                            textTransform: 'uppercase', color: SEC.portfolio }}>
                Net Worth · All Accounts
              </div>
              <div style={{ fontSize: 11.5, color: 'rgb(var(--text-3) / 0.38)' }}>
                Updated 4 sec ago
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 8 }}>
              <PriceText value={P.netWorth} hidden={hide} prefix="$"
                         style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-0.026em' }}/>
              <span className="tnum" style={{ fontSize: 17, fontWeight: 700,
                                                color: up ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                {(up ? '+' : '') + fmtMoney(P.todayPL)}
              </span>
              <span className="tnum" style={{ fontSize: 15, fontWeight: 600,
                                                color: up ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                {(up ? '+' : '') + P.todayPct.toFixed(2)}%
              </span>
              <span style={{ color: 'rgb(var(--text-3) / 0.38)', fontSize: 13, fontWeight: 500 }}>Today</span>
            </div>
            <div style={{ marginTop: 12, marginLeft: -4, marginRight: -4 }}>
              <AreaChart data={P.history6M} up={up} w={560} h={140} gridY={4} mode="area"
                         showPriceTicks pad={{ l: 0, r: 36, t: 8, b: 12 }}/>
            </div>
            <RangeChips active="6M" sizes={['1D','1W','1M','3M','6M','YTD','1Y','ALL']} compact/>
          </div>

          {/* Accounts column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                          textTransform: 'uppercase', color: SEC.portfolio,
                          display: 'flex', alignItems: 'center', gap: 8 }}>
              Accounts
              <span style={{ width: 24, height: 1, background: SEC.portfolio, opacity: 0.55 }}/>
              <span style={{ flex: 1 }}/>
              <span style={{ color: 'rgb(var(--text-3) / 0.38)', fontWeight: 500, letterSpacing: 0,
                              textTransform: 'none', fontSize: 11.5 }}>
                {ACCOUNTS.length} linked
              </span>
            </div>
            {ACCOUNTS.map((acc) => {
              const val = acc.holdings.reduce((s, h) => s + h.qty * SYMBOLS[h.sym].price, 0);
              const today = acc.holdings.reduce((s, h) => s + h.qty * SYMBOLS[h.sym].change, 0);
              const pct = (today / (val - today)) * 100;
              const accUp = today >= 0;
              const color = ACCT_COLORS[acc.id] || '#8AA0FF';
              return (
                <div key={acc.id} style={{
                  position: 'relative',
                  background: 'rgb(var(--surface-1))',
                  borderRadius: 14, padding: '14px 16px',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
                  overflow: 'hidden',
                }}>
                  <span style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                    background: color,
                  }}/>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{acc.name}</div>
                      <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', marginTop: 1 }}>
                        {acc.broker} · ••{acc.last4} · {acc.holdings.length} positions
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <PriceText value={val} hidden={hide} prefix="$"
                                 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.012em' }}/>
                      <div className="tnum" style={{ fontSize: 12, fontWeight: 600,
                                                       color: accUp ? 'rgb(var(--up))' : 'rgb(var(--down))', marginTop: 2 }}>
                        {(accUp ? '+' : '') + fmtMoney(today)} ({(accUp ? '+' : '') + pct.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Watchlist  |  Movers + Allocation + Indices */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          {/* Unified Watchlist (with positions blended in) */}
          <div style={{
            background: 'rgb(var(--surface-1))',
            borderRadius: 16,
            padding: '14px 18px 8px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700,
                                letterSpacing: '0.08em', textTransform: 'uppercase', color: SEC.watchlist }}>
                  Watchlist
                </span>
                <span style={{ width: 24, height: 1, background: SEC.watchlist, opacity: 0.55 }}/>
              </div>
              <div style={{ display: 'flex', gap: 4, fontSize: 12, color: 'rgb(var(--text-3) / 0.38)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="arrow-ud" size={11}/> Manual
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, padding: '10px 0 8px' }}>
              {['My Symbols', 'Mega Cap', 'ETFs', 'Watching'].map((l, i) => (
                <span key={l} style={{
                  padding: '5px 11px', borderRadius: 999,
                  fontSize: 12, fontWeight: 600,
                  background: i === 0 ? 'rgb(var(--surface-2))' : 'transparent',
                  color: i === 0 ? 'rgb(var(--text))' : 'rgb(var(--text-3) / 0.38)',
                  border: i === 0 ? '0' : '1px solid rgba(255,255,255,0.06)',
                }}>{l}</span>
              ))}
            </div>
            <div>
              {wlSlice.map((s, i) => {
                const pos = POSITIONS.find((p) => p.sym === s.symbol);
                return (
                  <UniRow key={s.symbol} s={s}
                          mode={pos ? 'position' : 'watch'}
                          position={pos || null}
                          showAccountDot={!!pos}
                          hidden={hide}
                          last={i === wlSlice.length - 1}/>
                );
              })}
            </div>
          </div>

          {/* Right column: Movers + Allocation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Movers (vertical list, denser on mac) */}
            <div style={{
              background: 'rgb(var(--surface-1))',
              borderRadius: 16, padding: '14px 18px',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700,
                                letterSpacing: '0.08em', textTransform: 'uppercase', color: SEC.activity }}>
                  Today's Movers
                </span>
                <span style={{ width: 24, height: 1, background: SEC.activity, opacity: 0.55 }}/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {PORTFOLIO.movers.slice(0, 4).map((m) => (
                  <div key={m.sym + m.account.id} style={{
                    background: 'rgb(var(--surface-2))',
                    borderRadius: 10, padding: '8px 10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 800 }}>{m.sym}</span>
                      <PercentPill pct={m.symbol.pct} size="sm"/>
                    </div>
                    <div className="tnum" style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                      ${fmtNum(m.symbol.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Allocation */}
            <div style={{
              background: 'rgb(var(--surface-1))',
              borderRadius: 16, padding: '14px 18px',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700,
                                letterSpacing: '0.08em', textTransform: 'uppercase', color: SEC.symbol }}>
                  Allocation
                </span>
                <span style={{ width: 24, height: 1, background: SEC.symbol, opacity: 0.55 }}/>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <AllocationDonut data={P.allocation} size={90} thickness={11}
                  center={
                    <div>
                      <div style={{ fontSize: 9, color: 'rgb(var(--text-3) / 0.38)',
                                    letterSpacing: 0.06, textTransform: 'uppercase' }}>Total</div>
                      <div className="tnum" style={{ fontSize: 13, fontWeight: 800 }}>
                        ${fmtCompact(P.netWorth)}
                      </div>
                    </div>
                  }/>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {P.allocation.slice(0, 5).map((a, i) => {
                    const colors = ['#6BE8B8','#5AA9FF','#F2B45C','#B98CFF','#FF8AAB'];
                    return (
                      <div key={a.sector} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 2, background: colors[i] }}/>
                        <span style={{ flex: 1, color: 'rgb(var(--text-2) / 0.62)' }}>{a.sector}</span>
                        <span className="tnum" style={{ color: 'rgb(var(--text))', fontWeight: 700 }}>
                          {a.pct.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

Object.assign(window, {
  IOSHomeV2, MacHomeV2,
  IOSTabBarV2, MacSidebarV2,
  NavHeaderV2, NetWorthHero, AccountsRibbon, WatchlistTabs,
  UniRow, Eyebrow, ProfileChip, MarketStatusStrip,
  SEC, ACCT_COLORS,
});
