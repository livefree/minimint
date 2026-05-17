// screens-v2-market.jsx — Market tab (Yahoo-style), Me tab, state overlays.

// ─────────────────────────────────────────────────────────────────
// Multi-line comparison chart — used in Market Overview
// All series normalized to 100% at start so they can be compared.
// ─────────────────────────────────────────────────────────────────
function MultiLineChart({ series, w = 358, h = 200,
                          pad = { l: 0, r: 40, t: 12, b: 22 } }) {
  // Normalize each series to start at 1.0 (i.e. percent change vs first point)
  const normSeries = series.map((s) => {
    const start = s.data[0];
    const arr = s.data.map((v) => v / start);
    return { ...s, arr };
  });

  const allVals = normSeries.flatMap((s) => s.arr);
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const span = Math.max(max - min, 0.0001);
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const xStep = innerW / (series[0].data.length - 1);
  const yOf = (v) => pad.t + innerH - ((v - min) / span) * innerH;

  // gridlines (4 horizontal)
  const grid = [0, 1, 2, 3, 4];

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {grid.map((i) => (
        <line key={i}
              x1={pad.l} x2={w - pad.r}
              y1={pad.t + (i / 4) * innerH}
              y2={pad.t + (i / 4) * innerH}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      ))}
      {normSeries.map((s, idx) => {
        const pts = s.arr.map((v, i) => [pad.l + i * xStep, yOf(v)]);
        const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
        const last = pts[pts.length - 1];
        const pctChange = (s.arr[s.arr.length - 1] - 1) * 100;
        const isUp = pctChange >= 0;
        return (
          <g key={s.sym}>
            <path d={d} fill="none" stroke={s.color}
                  strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>
            {/* end-value label */}
            <text x={w - pad.r + 4} y={last[1] + 4}
                  fontSize="10.5" fontWeight="700"
                  fill={isUp ? 'rgb(var(--up))' : 'rgb(var(--down))'}>
              {(isUp ? '+' : '') + pctChange.toFixed(2) + '%'}
            </text>
          </g>
        );
      })}
      {/* x-axis labels (days of month) */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const x = pad.l + t * innerW;
        return (
          <text key={i} x={x} y={h - 4}
                fontSize="10" fill="rgb(var(--text-3) / 0.38)"
                textAnchor="middle">
            {['7','8','9','10','11'][i]}
          </text>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// iOS MARKET — Yahoo Overview (IMG_5093 + IMG_5094)
// ─────────────────────────────────────────────────────────────────
function IOSMarket({ tweaks, height = 1820 }) {
  const hide = !!tweaks.privacy;

  // Synthetic index time series for the multi-line chart (5 days, 60 points)
  const idxData = [
    { sym: 'S&P 500',    last: 5803.40,  pct: -1.24, color: '#7AB6FF',
      data: walk({ n: 60, startPrice: 5874.0, endPrice: 5803.40, seed: 101, vol: 0.005 }) },
    { sym: 'DOW',        last: 42120.30, pct: -1.07, color: '#F2B45C',
      data: walk({ n: 60, startPrice: 42575, endPrice: 42120.30, seed: 102, vol: 0.005 }) },
    { sym: 'NASDAQ',     last: 18672.10, pct: -1.54, color: '#C9B6FF',
      data: walk({ n: 60, startPrice: 18965, endPrice: 18672.10, seed: 103, vol: 0.006 }) },
    { sym: 'Russell 2K', last: 2193.30,  pct: -2.44, color: '#FF8AAB',
      data: walk({ n: 60, startPrice: 2248, endPrice: 2193.30, seed: 104, vol: 0.007 }) },
  ];

  const trending = ['NVDA','META','AMZN','AVGO','TSLA'].map((s) => SYMBOLS[s]);
  const mostActive = ['SPY','QQQ','AAPL','AMD','GOOG'].map((s) => SYMBOLS[s]);

  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* NavHeader */}
          <div style={{ padding: '4px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <ProfileChip/>
            <div style={{ flex: 1,
                          background: 'rgb(var(--surface-1))',
                          borderRadius: 999,
                          padding: '10px 14px',
                          display: 'flex', alignItems: 'center', gap: 8,
                          fontSize: 13, color: 'rgb(var(--text-3) / 0.38)' }}>
              <Icon name="search" size={14} color="rgb(var(--text-3) / 0.38)"/>
              Search for news or tickers
            </div>
            <span className="iconbtn"><Icon name="bell" size={14}/></span>
          </div>

          {/* Sub-tabs */}
          <SubTabs tabs={['Overview','Stocks','ETF','News','Sectors']}
                   active="Overview" accent="rgb(var(--mint))"/>

          {/* Region chips */}
          <div style={{ padding: '14px 16px 12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              background: 'rgb(var(--surface-1))',
              borderRadius: 999, padding: 3,
              display: 'inline-flex', gap: 2,
            }}>
              {['US','Europe','Asia'].map((r, i) => (
                <span key={r} style={{
                  padding: '7px 16px', borderRadius: 999,
                  fontSize: 13, fontWeight: 600,
                  background: i === 0 ? 'rgb(var(--mint))' : 'transparent',
                  color: i === 0 ? '#07120D' : 'rgb(var(--text-2) / 0.62)',
                }}>{r}</span>
              ))}
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                            color: 'rgb(var(--mint))', fontSize: 13, fontWeight: 600 }}>
              <Icon name="x" size={11} color="rgb(var(--mint))"/> Collapse
            </span>
          </div>

          {/* Index pills */}
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {idxData.map((ix) => (
              <div key={ix.sym} style={{
                padding: '14px 16px',
                background: 'rgb(var(--surface-1))',
                borderRadius: 12,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: ix.color }}/>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>{ix.sym}</span>
                <span className="tnum" style={{ fontSize: 15, fontWeight: 700 }}>
                  {ix.last.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="tnum" style={{
                  fontSize: 13, fontWeight: 700, minWidth: 64, textAlign: 'right',
                  color: ix.pct >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))',
                }}>
                  {(ix.pct >= 0 ? '+' : '') + ix.pct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>

          {/* Multi-line comparison chart */}
          <div style={{ padding: '18px 16px 4px' }}>
            <MultiLineChart series={idxData}/>
          </div>

          {/* Range chips (Yahoo set) */}
          <div style={{ padding: '6px 12px 4px' }}>
            <RangeChips active="1D" sizes={['1D','5D','1M','6M','YTD','1Y','5Y','ALL']} compact/>
          </div>

          {/* Last updated */}
          <div style={{ padding: '14px 20px 0', fontSize: 12, color: 'rgb(var(--text-2) / 0.62)' }}>
            <div style={{ color: 'rgb(var(--down))', fontWeight: 600 }}>
              Last updated: 1 day ago
            </div>
            <div style={{ marginTop: 4, lineHeight: 1.4 }}>
              <span style={{ color: 'rgb(var(--text))' }}>
                Stock market today:
              </span>{' '}
              Dow, S&amp;P 500, Nasdaq sink as bond yields jump to cap volatile week ahead of Nvidia earnings
            </div>
          </div>

          {/* TRENDING NOW section */}
          <div style={{ margin: '18px 16px 0', padding: '14px 16px',
                        background: 'rgb(var(--surface-1))', borderRadius: 14,
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          color: 'rgb(var(--text-3) / 0.38)', marginBottom: 4,
                          display: 'flex', alignItems: 'center', gap: 8 }}>
              Trending Now
              <Icon name="chart" size={11} color="rgb(var(--text-3) / 0.38)"/>
            </div>
            {trending.map((s, i) => (
              <UniRow key={s.symbol} s={s} mode="watch"
                      hidden={hide} last={i === trending.length - 1}/>
            ))}
            <div style={{ padding: '12px 0 4px', textAlign: 'right' }}>
              <span style={{ fontSize: 13, color: 'rgb(var(--mint))', fontWeight: 600 }}>
                View more →
              </span>
            </div>
          </div>

          {/* MOST ACTIVE section */}
          <div style={{ margin: '14px 16px 24px', padding: '14px 16px',
                        background: 'rgb(var(--surface-1))', borderRadius: 14,
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          color: 'rgb(var(--text-3) / 0.38)', marginBottom: 4 }}>
              Most Active
            </div>
            {mostActive.map((s, i) => (
              <UniRow key={s.symbol} s={s} mode="watch"
                      hidden={hide} last={i === mostActive.length - 1}/>
            ))}
          </div>
        </div>
        <IOSTabBarV2 active="market"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// iOS ME — Settings rebranded (R-N5)
// ─────────────────────────────────────────────────────────────────
function IOSMe({ tweaks, height = 1080 }) {
  const hide = !!tweaks.privacy;

  const Group = ({ title, accent = SEC.symbol, children }) => (
    <div style={{ margin: '0 16px 18px' }}>
      <div style={{
        fontSize: 11, fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: accent, padding: '0 4px 8px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {title}
        <span style={{ width: 24, height: 1, background: accent, opacity: 0.55 }}/>
      </div>
      <div style={{
        background: 'rgb(var(--surface-1))',
        borderRadius: 14,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
        overflow: 'hidden',
      }}>{children}</div>
    </div>
  );

  const Row = ({ icon, label, value, danger, switchOn, last }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 16px',
      borderBottom: last ? 'none' : '.5px solid var(--separator)',
      fontSize: 14.5,
    }}>
      {icon && (
        <span style={{
          width: 26, height: 26, borderRadius: 7,
          background: 'rgba(255,255,255,0.04)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: danger ? 'rgb(var(--down))' : 'rgb(var(--text-2) / 0.62)',
        }}>
          <Icon name={icon} size={14} color={danger ? 'rgb(var(--down))' : 'rgb(var(--text-2) / 0.62)'}/>
        </span>
      )}
      <span style={{ flex: 1, color: danger ? 'rgb(var(--down))' : 'rgb(var(--text))',
                     fontWeight: 500 }}>{label}</span>
      {switchOn !== undefined ? (
        <span className={'ios-switch ' + (switchOn ? 'on' : '')}/>
      ) : (
        <>
          {value != null && (
            <span style={{ color: 'rgb(var(--text-3) / 0.38)', fontSize: 13, fontWeight: 500 }}>{value}</span>
          )}
          <Icon name="chevron-r" size={12} color="rgb(var(--text-3) / 0.38)"/>
        </>
      )}
    </div>
  );

  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* Header */}
          <div style={{ padding: '4px 20px 16px' }}>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.022em' }}>Me</div>
          </div>

          {/* Profile card */}
          <div style={{ margin: '0 16px 18px',
                        padding: '18px 18px 16px',
                        borderRadius: 16,
                        background: `radial-gradient(120% 90% at 0% 0%, rgba(107,232,184,0.18) 0%, transparent 55%), rgb(var(--surface-1))`,
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <ProfileChip size={48}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 800 }}>Sam Chen</div>
                <div style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.38)', marginTop: 2 }}>
                  Personal account · {ACCOUNTS.length} brokers linked
                </div>
              </div>
              <span style={{
                padding: '6px 12px', borderRadius: 999,
                background: 'rgb(var(--surface-2))',
                fontSize: 12, fontWeight: 600, color: 'rgb(var(--text))',
              }}>Switch</span>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              marginTop: 14, gap: 8,
            }}>
              {[
                ['Net Worth', `$${fmtCompact(PORTFOLIO.netWorth)}`],
                ['Positions', POSITIONS.length],
                ['Today', `${PORTFOLIO.todayPL >= 0 ? '+' : ''}${PORTFOLIO.todayPct.toFixed(2)}%`],
              ].map(([k, v], i) => {
                const isTodayUp = i === 2 && PORTFOLIO.todayPL >= 0;
                const isTodayDown = i === 2 && PORTFOLIO.todayPL < 0;
                return (
                  <div key={k} style={{ background: 'rgba(255,255,255,0.04)',
                                          borderRadius: 10, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: 'rgb(var(--text-3) / 0.38)',
                                  fontWeight: 600, letterSpacing: 0.04, textTransform: 'uppercase' }}>{k}</div>
                    <div className="tnum" style={{
                      fontSize: 14, fontWeight: 800, marginTop: 2,
                      color: isTodayUp ? 'rgb(var(--up))' : isTodayDown ? 'rgb(var(--down))' : 'rgb(var(--text))',
                    }}>{v}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <Group title="Profiles" accent={SEC.portfolio}>
            <Row icon="user" label="Sam (you)" value="Active"/>
            <Row icon="user" label="Mom" value="妈妈"/>
            <Row icon="user" label="Dad" value="父亲" last/>
          </Group>

          <Group title="Appearance" accent={SEC.symbol}>
            <Row icon="sun" label="Theme" value="Dark"/>
            <Row icon="tag" label="Accent color" value="Mint"/>
            <Row icon="grid" label="Density" value="Comfortable" last/>
          </Group>

          <Group title="Privacy & Data" accent={SEC.watchlist}>
            <Row icon="eye-off" label="Hide amounts" switchOn={hide}/>
            <Row icon="refresh" label="Auto-refresh" value="Every 60s"/>
            <Row icon="trash" label="Clear cached quotes" last/>
          </Group>

          <Group title="App" accent={SEC.activity}>
            <Row icon="bell" label="Alerts"/>
            <Row icon="briefcase" label="Linked brokers" value="2"/>
            <Row icon="more" label="About"/>
            <Row icon="x" label="Sign out" danger last/>
          </Group>

          <div style={{ textAlign: 'center', fontSize: 11, color: 'rgb(var(--text-3) / 0.38)',
                        padding: '4px 0 24px' }}>
            mini-stock v2.0.0 · build 26
          </div>
        </div>
        <IOSTabBarV2 active="me"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// STATE OVERLAYS (R-S1) — loading skeleton, empty, error banner
// Stand-alone artboards mounted in the canvas for engineering parity.
// ─────────────────────────────────────────────────────────────────
function ShimmerBlock({ w, h, br = 10, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: br,
      background: 'linear-gradient(110deg, rgb(var(--surface-1)) 30%, rgb(var(--surface-2)) 50%, rgb(var(--surface-1)) 70%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s linear infinite',
      ...style,
    }}/>
  );
}

function IOSStateLoading() {
  return (
    <div className="ios">
      <div className="ios-screen">
        <IOSStatusBar/>
        <style>{`
          @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        `}</style>
        <div className="ios-body">
          <div style={{ padding: '4px 16px 12px', display: 'flex',
                        alignItems: 'center', gap: 12 }}>
            <ShimmerBlock w={30} h={30} br={15}/>
            <div style={{ flex: 1 }}>
              <ShimmerBlock w={110} h={11}/>
              <ShimmerBlock w={70} h={20} style={{ marginTop: 6 }}/>
            </div>
            <ShimmerBlock w={32} h={32} br={16}/>
            <ShimmerBlock w={32} h={32} br={16}/>
          </div>

          {/* Hero skeleton */}
          <div style={{ margin: '0 16px 14px', padding: '18px 18px',
                        borderRadius: 20, background: 'rgb(var(--surface-1))',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)' }}>
            <ShimmerBlock w={120} h={12}/>
            <ShimmerBlock w={220} h={40} br={6} style={{ marginTop: 10 }}/>
            <ShimmerBlock w={180} h={14} style={{ marginTop: 8 }}/>
            <ShimmerBlock w="100%" h={90} br={6} style={{ marginTop: 16 }}/>
          </div>

          {/* Eyebrow + rows */}
          <div style={{ padding: '12px 20px 8px' }}>
            <ShimmerBlock w={80} h={11}/>
          </div>
          <div style={{ padding: '0 20px' }}>
            {[0,1,2,3].map((i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderBottom: i === 3 ? 'none' : '.5px solid var(--separator)',
              }}>
                <div style={{ flex: '0 0 auto' }}>
                  <ShimmerBlock w={48} h={14}/>
                  <ShimmerBlock w={64} h={10} style={{ marginTop: 6 }}/>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <ShimmerBlock w={94} h={28} br={4}/>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column',
                              alignItems: 'flex-end', gap: 6 }}>
                  <ShimmerBlock w={58} h={14}/>
                  <ShimmerBlock w={66} h={20} br={6}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        <IOSTabBarV2 active="home"/>
      </div>
    </div>
  );
}

function IOSStateEmpty() {
  return (
    <div className="ios">
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* NavHeader */}
          <div style={{ padding: '4px 16px 12px', display: 'flex',
                        alignItems: 'center', gap: 12 }}>
            <ProfileChip/>
            <div style={{ flex: 1, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Watchlist
            </div>
            <span className="iconbtn"><Icon name="search" size={14}/></span>
          </div>

          {/* Empty state */}
          <div style={{ flex: 1, display: 'flex',
                        flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', padding: '0 32px',
                        textAlign: 'center', gap: 16 }}>
            <div style={{
              width: 96, height: 96, borderRadius: 24,
              background: 'rgba(122,182,255,0.08)',
              border: '1px solid rgba(122,182,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="eye-off" size={36} color="#7AB6FF"/>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>No symbols yet</div>
              <div style={{ fontSize: 13, color: 'rgb(var(--text-2) / 0.62)', marginTop: 6, lineHeight: 1.5 }}>
                Add tickers you want to watch — prices, sparklines and<br/>
                today's change will appear here.
              </div>
            </div>
            <div style={{
              padding: '12px 22px',
              background: 'rgb(var(--mint))', color: '#07120D',
              borderRadius: 999,
              fontSize: 14, fontWeight: 800, letterSpacing: 0.01,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 6px 18px rgba(107,232,184,0.32)',
            }}>
              <Icon name="plus" size={14} color="#07120D" strokeWidth={2.5}/>
              Add symbol
            </div>
            <div style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.38)', marginTop: 8 }}>
              Tip: paste a ticker from clipboard with ⌘V on mac
            </div>
          </div>
        </div>
        <IOSTabBarV2 active="home"/>
      </div>
    </div>
  );
}

function IOSStateError() {
  return (
    <div className="ios">
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* Error banner */}
          <div style={{
            padding: '10px 18px',
            background: 'rgba(255,193,118,0.14)',
            borderBottom: '1px solid rgba(255,193,118,0.3)',
            color: '#FFC176',
            fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Icon name="bell" size={14} color="#FFC176"/>
            <span style={{ flex: 1 }}>
              Live quotes unavailable · showing data from 10:32 AM
            </span>
            <span style={{ textDecoration: 'underline' }}>Retry</span>
          </div>

          <div style={{ padding: '14px 16px 12px',
                        display: 'flex', alignItems: 'center', gap: 12 }}>
            <ProfileChip/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.38)' }}>Good evening, Sam</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>Home</div>
            </div>
          </div>

          {/* Hero card */}
          <div style={{ margin: '0 16px 14px', padding: '16px 18px',
                        borderRadius: 20, background: 'rgb(var(--surface-1))',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
                        opacity: 0.75 }}>
            <div style={{ fontSize: 11, fontWeight: 700,
                          letterSpacing: 0.08, textTransform: 'uppercase',
                          color: 'rgb(var(--text-3) / 0.38)' }}>Net Worth · stale</div>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>
              $131,430.52
            </div>
            <div style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.38)', marginTop: 4 }}>
              As of 10:32 AM ET · {' '}
              <span style={{ color: '#FFC176' }}>2 brokers offline</span>
            </div>
          </div>

          {/* Offline-friendly snapshot rows */}
          <div style={{ padding: '6px 20px 0', fontSize: 11.5,
                        color: 'rgb(var(--text-3) / 0.38)', fontWeight: 600,
                        letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Cached positions
          </div>
          <div style={{ padding: '4px 20px' }}>
            {POSITIONS.slice(0, 4).map((p, i, arr) => (
              <UniRow key={p.sym} s={p.symbol} mode="position"
                      position={p} hidden={false} showAccountDot
                      last={i === arr.length - 1}/>
            ))}
          </div>

          <div style={{ margin: '24px 16px', padding: '14px 16px',
                        background: 'rgba(255,193,118,0.06)',
                        border: '1px solid rgba(255,193,118,0.2)',
                        borderRadius: 12, fontSize: 12.5,
                        color: 'rgb(var(--text-2) / 0.62)', lineHeight: 1.4 }}>
            <div style={{ fontWeight: 700, color: '#FFC176', marginBottom: 4 }}>
              Connection issue
            </div>
            Could not reach Finnhub. We'll keep retrying every 30s. Your local
            data is safe — only live quotes are paused.
          </div>
        </div>
        <IOSTabBarV2 active="home"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAC PORTFOLIO — Fidelity-style 10-col dense table
// ─────────────────────────────────────────────────────────────────
function MacPortfolio({ tweaks }) {
  const hide = !!tweaks.privacy;

  const cols = ['Symbol', 'Last', 'Chg', 'Today $ G/L', 'Today %', 'Mkt Value', 'Avg Cost', 'Total G/L', '% Port', 'LT/ST'];

  return (
    <div className="mac">
      <MacTitleBar/>
      <MacSidebarV2 active="port"/>
      <main className="mac-main">
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div className="h-eyebrow" style={{ marginBottom: 6 }}>
              All accounts · {POSITIONS.length} open positions
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.022em' }}>
              Portfolio
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="iconbtn"><Icon name="refresh" size={16}/></span>
            <span className="iconbtn"><Icon name="more" size={16}/></span>
            <span style={{
              padding: '8px 14px',
              borderRadius: 8,
              background: 'rgb(var(--mint))', color: '#07120D',
              fontWeight: 700, fontSize: 13.5,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <Icon name="plus" size={13} color="#07120D" strokeWidth={2.5}/>
              Record trade
            </span>
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{
          display: 'flex', gap: 24,
          borderBottom: '.5px solid var(--separator)',
          marginBottom: 16,
        }}>
          {['Summary','Positions','Activity','Balances'].map((t) => {
            const isActive = t === 'Positions';
            return (
              <div key={t} style={{
                position: 'relative',
                padding: '10px 0 12px',
                fontSize: 14, fontWeight: isActive ? 700 : 500,
                color: isActive ? 'rgb(var(--text))' : 'rgb(var(--text-3) / 0.38)',
              }}>
                {t}
                {isActive && (
                  <span style={{
                    position: 'absolute', left: 0, right: 0, bottom: 0,
                    height: 2, borderRadius: 2, background: SEC.portfolio,
                  }}/>
                )}
              </div>
            );
          })}
        </div>

        {/* Filter row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            background: 'rgb(var(--surface-2))', borderRadius: 9, padding: 2,
            display: 'inline-flex', gap: 2,
          }}>
            {['Open','Closed','Options'].map((k, i) => (
              <span key={k} style={{
                padding: '6px 14px', borderRadius: 7,
                fontSize: 12.5, fontWeight: i === 0 ? 700 : 500,
                background: i === 0 ? 'rgb(var(--surface-1))' : 'transparent',
                color: i === 0 ? 'rgb(var(--text))' : 'rgb(var(--text-2) / 0.62)',
              }}>{k}</span>
            ))}
          </div>
          <div style={{ flex: 1 }}/>
          <div style={{
            padding: '6px 12px', background: 'rgb(var(--surface-2))', borderRadius: 8,
            fontSize: 12.5, color: 'rgb(var(--text-2) / 0.62)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name="search" size={12}/> Filter symbols
          </div>
          <div style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.38)' }}>{POSITIONS.length} items</div>
        </div>

        {/* Table */}
        <div style={{
          background: 'rgb(var(--surface-1))',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 0.9fr 0.9fr 1.1fr 0.9fr 1.2fr 1fr 1.2fr 0.8fr 0.8fr',
            padding: '11px 16px',
            fontSize: 11, fontWeight: 600,
            color: 'rgb(var(--text-3) / 0.38)',
            letterSpacing: 0.02,
            background: 'rgba(255,255,255,0.025)',
            borderBottom: '.5px solid var(--separator-strong)',
          }}>
            {cols.map((c, i) => (
              <span key={c} style={{ textAlign: i === 0 ? 'left' : 'right' }}>{c}</span>
            ))}
          </div>

          {/* Account groups */}
          {ACCOUNTS.map((acc) => {
            const positions = acc.holdings.map((h) => {
              const s = SYMBOLS[h.sym];
              return { ...h, symbol: s, mv: h.qty * s.price, cost: h.qty * h.avgCost,
                        todayDollar: h.qty * s.change };
            });
            const value = positions.reduce((sum, p) => sum + p.mv, 0);
            const today = positions.reduce((sum, p) => sum + p.todayDollar, 0);
            const color = ACCT_COLORS[acc.id] || '#8AA0FF';
            return (
              <div key={acc.id}>
                {/* Group header */}
                <div style={{
                  position: 'relative',
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 0.9fr 0.9fr 1.1fr 0.9fr 1.2fr 1fr 1.2fr 0.8fr 0.8fr',
                  padding: '12px 16px 12px 22px',
                  background: 'rgba(255,255,255,0.025)',
                  borderBottom: '.5px solid var(--separator)',
                  alignItems: 'center',
                }}>
                  <span style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                    background: color,
                  }}/>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800 }}>{acc.name}</div>
                    <div style={{ fontSize: 10.5, color: 'rgb(var(--text-3) / 0.38)', marginTop: 1 }}>
                      {acc.broker} · ••{acc.last4}
                    </div>
                  </div>
                  <span/>
                  <span/>
                  <span className="tnum" style={{
                    fontSize: 13, fontWeight: 700, textAlign: 'right',
                    color: today >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))',
                  }}>
                    {hide ? '••••' : (today >= 0 ? '+' : '−') + '$' + fmtNum(Math.abs(today))}
                  </span>
                  <span className="tnum" style={{
                    fontSize: 13, fontWeight: 700, textAlign: 'right',
                    color: today >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))',
                  }}>
                    {(today >= 0 ? '+' : '−') + Math.abs((today / (value - today)) * 100).toFixed(2) + '%'}
                  </span>
                  <span className="tnum" style={{ fontSize: 13.5, fontWeight: 700, textAlign: 'right' }}>
                    {hide ? '••••' : '$' + fmtNum(value)}
                  </span>
                  <span/>
                  <span/>
                  <span/>
                  <span/>
                </div>

                {/* Position rows */}
                {positions.map((p, i) => {
                  const up = p.todayDollar >= 0;
                  const totalUn = p.mv - p.cost;
                  const totalUp = totalUn >= 0;
                  const portPct = (p.mv / TOTAL_MV) * 100;
                  const isLT = Math.random() > 0.4;   // mock LT/ST flag
                  return (
                    <div key={p.sym} style={{
                      display: 'grid',
                      gridTemplateColumns: '1.6fr 0.9fr 0.9fr 1.1fr 0.9fr 1.2fr 1fr 1.2fr 0.8fr 0.8fr',
                      padding: '10px 16px',
                      borderBottom: i === positions.length - 1 ? 'none' : '.5px solid var(--separator)',
                      alignItems: 'center',
                      fontSize: 13,
                    }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{p.sym}</div>
                        <div style={{ fontSize: 10.5, color: 'rgb(var(--text-3) / 0.38)',
                                       letterSpacing: 0.04, textTransform: 'uppercase' }}>
                          {p.symbol.name}
                        </div>
                      </div>
                      <span className="tnum" style={{ fontWeight: 600, textAlign: 'right' }}>
                        ${fmtNum(p.symbol.price)}
                      </span>
                      <span className="tnum" style={{
                        fontWeight: 700, textAlign: 'right',
                        color: up ? 'rgb(var(--up))' : 'rgb(var(--down))',
                      }}>
                        {(up ? '+' : '') + p.symbol.change.toFixed(2)}
                      </span>
                      <span className="tnum" style={{
                        fontWeight: 700, textAlign: 'right',
                        color: up ? 'rgb(var(--up))' : 'rgb(var(--down))',
                      }}>
                        {hide ? '••••' : (up ? '+' : '−') + '$' + fmtNum(Math.abs(p.todayDollar))}
                      </span>
                      <span className="tnum" style={{
                        fontWeight: 700, textAlign: 'right',
                        color: up ? 'rgb(var(--up))' : 'rgb(var(--down))',
                      }}>
                        {(up ? '+' : '') + p.symbol.pct.toFixed(2) + '%'}
                      </span>
                      <span className="tnum" style={{ fontWeight: 700, textAlign: 'right' }}>
                        {hide ? '••••' : '$' + fmtNum(p.mv)}
                      </span>
                      <span className="tnum" style={{ fontWeight: 500, color: 'rgb(var(--text-2) / 0.62)', textAlign: 'right' }}>
                        ${fmtNum(p.avgCost)}
                      </span>
                      <span className="tnum" style={{
                        fontWeight: 700, textAlign: 'right',
                        color: totalUp ? 'rgb(var(--up))' : 'rgb(var(--down))',
                      }}>
                        {hide ? '••••' : (totalUp ? '+' : '−') + '$' + fmtNum(Math.abs(totalUn))}
                      </span>
                      <span className="tnum" style={{ fontWeight: 600, color: 'rgb(var(--text-2) / 0.62)', textAlign: 'right' }}>
                        {portPct.toFixed(1)}%
                      </span>
                      <span style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: 10.5, fontWeight: 800, letterSpacing: 0.04,
                          padding: '2px 6px', borderRadius: 4,
                          color: isLT ? 'rgb(var(--mint))' : '#FFC176',
                          background: isLT ? 'rgba(107,232,184,0.14)' : 'rgba(255,193,118,0.14)',
                        }}>
                          {isLT ? 'LT' : 'ST'}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAC MARKET — Yahoo Overview, denser
// ─────────────────────────────────────────────────────────────────
function MacMarket({ tweaks }) {
  const hide = !!tweaks.privacy;
  const idxData = [
    { sym: 'S&P 500',    last: 5803.40,  pct: -1.24, color: '#7AB6FF',
      data: walk({ n: 80, startPrice: 5874.0, endPrice: 5803.40, seed: 201, vol: 0.005 }) },
    { sym: 'DOW',        last: 42120.30, pct: -1.07, color: '#F2B45C',
      data: walk({ n: 80, startPrice: 42575, endPrice: 42120.30, seed: 202, vol: 0.005 }) },
    { sym: 'NASDAQ',     last: 18672.10, pct: -1.54, color: '#C9B6FF',
      data: walk({ n: 80, startPrice: 18965, endPrice: 18672.10, seed: 203, vol: 0.006 }) },
    { sym: 'Russell 2K', last: 2193.30,  pct: -2.44, color: '#FF8AAB',
      data: walk({ n: 80, startPrice: 2248, endPrice: 2193.30, seed: 204, vol: 0.007 }) },
  ];
  const trending = ['NVDA','META','AMZN','AVGO','TSLA'].map((s) => SYMBOLS[s]);
  const mostActive = ['SPY','QQQ','AAPL','AMD','GOOG'].map((s) => SYMBOLS[s]);

  return (
    <div className="mac">
      <MacTitleBar/>
      <MacSidebarV2 active="market"/>
      <main className="mac-main">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div className="h-eyebrow" style={{ marginBottom: 6 }}>
              Tuesday · May 15 · US Markets Open
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.022em' }}>Market</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              background: 'rgb(var(--surface-2))', borderRadius: 8,
              padding: '8px 14px', display: 'inline-flex',
              alignItems: 'center', gap: 8, fontSize: 13, color: 'rgb(var(--text-3) / 0.38)',
            }}>
              <Icon name="search" size={13}/> Search news or tickers
              <span className="kbd">⌘K</span>
            </div>
            <span className="iconbtn"><Icon name="bell" size={16}/></span>
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{
          display: 'flex', gap: 24,
          borderBottom: '.5px solid var(--separator)',
          marginBottom: 16,
        }}>
          {['Overview','Stocks','ETF','News','Sectors','Movers'].map((t) => {
            const isActive = t === 'Overview';
            return (
              <div key={t} style={{
                position: 'relative',
                padding: '10px 0 12px',
                fontSize: 14, fontWeight: isActive ? 700 : 500,
                color: isActive ? 'rgb(var(--text))' : 'rgb(var(--text-3) / 0.38)',
              }}>
                {t}
                {isActive && (
                  <span style={{
                    position: 'absolute', left: 0, right: 0, bottom: 0,
                    height: 2, borderRadius: 2, background: 'rgb(var(--mint))',
                  }}/>
                )}
              </div>
            );
          })}
        </div>

        {/* Region chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{
            background: 'rgb(var(--surface-1))', borderRadius: 999, padding: 3,
            display: 'inline-flex', gap: 2,
          }}>
            {['US','Europe','Asia'].map((r, i) => (
              <span key={r} style={{
                padding: '6px 16px', borderRadius: 999,
                fontSize: 12.5, fontWeight: 600,
                background: i === 0 ? 'rgb(var(--mint))' : 'transparent',
                color: i === 0 ? '#07120D' : 'rgb(var(--text-2) / 0.62)',
              }}>{r}</span>
            ))}
          </div>
        </div>

        {/* Main: chart + index list side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Index list + chart */}
          <div style={{
            background: 'rgb(var(--surface-1))',
            borderRadius: 14,
            padding: '16px 20px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 12 }}>
              {idxData.map((ix) => (
                <div key={ix.sym} style={{
                  padding: '10px 12px',
                  background: 'rgb(var(--surface-2))',
                  borderRadius: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: ix.color }}/>
                    <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.02 }}>{ix.sym}</span>
                  </div>
                  <div className="tnum" style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>
                    {ix.last.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="tnum" style={{
                    fontSize: 12, fontWeight: 700, marginTop: 2,
                    color: ix.pct >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))',
                  }}>
                    {(ix.pct >= 0 ? '+' : '') + ix.pct.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
            <MultiLineChart series={idxData} w={680} h={300}
                             pad={{ l: 0, r: 60, t: 16, b: 28 }}/>
            <div style={{ marginTop: 8 }}>
              <RangeChips active="1D" sizes={['1D','5D','1M','6M','YTD','1Y','5Y','ALL']} compact/>
            </div>
          </div>

          {/* Right column: Trending + Most active */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { title: 'Trending Now',  rows: trending },
              { title: 'Most Active',   rows: mostActive },
            ].map((sec) => (
              <div key={sec.title} style={{
                background: 'rgb(var(--surface-1))',
                borderRadius: 14, padding: '14px 18px',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700,
                              letterSpacing: '0.08em', textTransform: 'uppercase',
                              color: 'rgb(var(--text-3) / 0.38)', marginBottom: 4,
                              display: 'flex', justifyContent: 'space-between' }}>
                  {sec.title}
                  <span style={{ color: 'rgb(var(--mint))', fontSize: 11.5, letterSpacing: 0, textTransform: 'none' }}>
                    View more →
                  </span>
                </div>
                {sec.rows.slice(0, 5).map((s, i, arr) => (
                  <UniRow key={s.symbol} s={s} mode="watch"
                          hidden={hide} last={i === arr.length - 1}/>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

Object.assign(window, {
  MultiLineChart,
  IOSMarket, IOSMe,
  IOSStateLoading, IOSStateEmpty, IOSStateError,
  ShimmerBlock,
  MacPortfolio, MacMarket,
});
