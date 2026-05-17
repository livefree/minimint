// screens-v3-tabs.jsx — completes R-N2 (Portfolio sub-tabs) and R-N3 (Market sub-tabs)
// Portfolio: Summary · Activity · Balances + AccountSelector sheet + Overflow menu
// Market:    Trending (scrolled Stocks chip set) · ETF · News + Mac Sector Heatmap

// ─────────────────────────────────────────────────────────────────
// Small shared bits
// ─────────────────────────────────────────────────────────────────
// SECT_HUES — GICS sector visual identity (rgb() strings backed by
// --gics-* tokens in styles.css). Used for allocation donut, sector
// heatmap tiles, sector-attributed dots on rows. NEVER use for
// semantic up/down — those stay --up / --down regardless of sector.
const SECT_HUES = {
  Tech:        'rgb(var(--gics-tech))',
  Semis:       'rgb(var(--gics-semis))',
  ETF:         'rgb(var(--gics-etf))',
  Consumer:    'rgb(var(--gics-consumer))',
  Auto:        'rgb(var(--gics-auto))',
  Bonds:       'rgb(var(--gics-bonds))',
  Financials:  'rgb(var(--gics-financials))',
  Energy:      'rgb(var(--gics-energy))',
  Health:      'rgb(var(--gics-health))',
  Industrials: 'rgb(var(--gics-industrials))',
  Materials:   'rgb(var(--gics-materials))',
  Utilities:   'rgb(var(--gics-utilities))',
  RealEstate:  'rgb(var(--gics-realestate))',
  Comm:        'rgb(var(--gics-comm))',
  Staples:     'rgb(var(--gics-staples))',
};

function MiniSpark({ data, up, w = 88, h = 28, stroke = 1.5 }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const c = up ? 'rgb(var(--up))' : 'rgb(var(--down))';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={c} strokeWidth={stroke}
                strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS — Portfolio Summary
// ─────────────────────────────────────────────────────────────────
function IOSPortfolioSummary({ tweaks, height = 1480 }) {
  const hide = !!tweaks.privacy;
  const P = PORTFOLIO;
  const top5 = [...POSITIONS].sort((a, b) => b.marketValue - a.marketValue).slice(0, 5);

  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* NavHeader */}
          <div style={{ padding: '4px 16px 12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <ProfileChip/>
            <div className="t-h-sub">Portfolio</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="iconbtn"><Icon name="more" size={15}/></span>
              <span className="iconbtn"><Icon name="search" size={14}/></span>
            </div>
          </div>

          <AccountSelector label="All accounts" count={accountsForProfile('sam').length}/>

          <SubTabs tabs={['Summary','Positions','Activity','Balances']} active="Summary"/>

          {/* KPI strip */}
          <div style={{
            margin: '14px 16px 8px',
            background: 'rgb(var(--surface-1))',
            borderRadius: 16,
            padding: '14px 0',
            boxShadow: 'var(--hairline-top)',
            backgroundImage: 'var(--hero-grad-up)',
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          }}>
            {[
              { lbl: 'Total Value',  v: hide ? '••••' : fmtMoney(P.netWorth, { cents: false }),
                sub: '',                                  col: 'rgb(var(--text))' },
              { lbl: 'Today',        v: (P.todayPL >= 0 ? '+' : '') + fmtMoney(Math.abs(P.todayPL)),
                sub: fmtPct(P.todayPct),                  col: P.todayPL >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))' },
              { lbl: 'Total P/L',    v: (P.totalPL >= 0 ? '+' : '') + fmtMoney(Math.abs(P.totalPL), { cents: false }),
                sub: fmtPct(P.totalPct),                  col: P.totalPL >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))' },
              { lbl: 'Dividends YTD', v: fmtMoney(P.divYTD, { cents: false }),
                sub: '',                                  col: 'rgb(var(--mint))' },
            ].map((k) => (
              <div key={k.lbl} style={{
                padding: '0 10px', borderRight: '.5px solid rgb(255 255 255 / 0.06)',
              }}>
                <div className="t-meta" style={{ marginBottom: 6 }}>{k.lbl}</div>
                <div className="tnum" style={{ fontSize: 'var(--t-row-strong)', fontWeight: 'var(--weight-bold)', color: k.col,
                                                letterSpacing: '-0.01em' }}>{k.v}</div>
                {k.sub && (
                  <div className="tnum" style={{ fontSize: 'var(--t-caption)', fontWeight: 'var(--weight-semi)', color: k.col, opacity: 0.78,
                                                  marginTop: 2 }}>{k.sub}</div>
                )}
              </div>
            ))}
          </div>

          {/* Performance card */}
          <SectionTitle title="Performance" right="View full →"
                        accent={SEC.portfolio}/>
          <div style={{
            margin: '0 16px 16px', padding: '14px 4px 6px',
            background: 'rgb(var(--surface-1))', borderRadius: 16,
            boxShadow: 'var(--hairline-top)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 14px 8px',
            }}>
              <div>
                <div className="t-meta">VS SPY · 1Y</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                  <span className="tnum t-h" style={{ color: 'rgb(var(--up))' }}>+18.3%</span>
                  <span className="tnum t-aux">SPY +9.1%</span>
                </div>
              </div>
              <RangeChips active="1Y" compact/>
            </div>
            <div style={{ padding: '0 8px' }}>
              <PriceChart data={P.history1Y} mode="area" up={true} w={350} h={150}
                          padInner={{ l: 0, r: 0, t: 8, b: 16 }}/>
            </div>
            {/* SPY benchmark dashed overlay marker */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '6px 14px 4px', fontSize: 'var(--t-caption)', fontWeight: 'var(--weight-semi)',
              color: 'rgb(var(--text-2) / 0.62)',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 2, background: 'rgb(var(--up))', borderRadius: 1 }}/>
                Portfolio
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 2,
                                background: 'repeating-linear-gradient(90deg, rgb(var(--text-2) / 0.62), rgb(var(--text-2) / 0.62) 3px, transparent 3px, transparent 6px)',
                                borderRadius: 1 }}/>
                SPY
              </span>
            </div>
          </div>

          {/* Allocation */}
          <SectionTitle title="Allocation" right="By sector" accent={SEC.symbol}/>
          <div style={{
            margin: '0 16px 16px',
            padding: '14px',
            background: 'rgb(var(--surface-1))', borderRadius: 16,
            boxShadow: 'var(--hairline-top)',
            display: 'grid', gridTemplateColumns: '180px 1fr', gap: 14, alignItems: 'center',
          }}>
            <AllocationDonut data={P.allocation} size={150} thickness={20}
                              center={<div style={{ textAlign: 'center' }}>
                                <div className="t-meta">SECTORS</div>
                                <div className="t-h-sub" style={{ marginTop: 2 }}>{P.allocation.length}</div>
                              </div>}/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {P.allocation.slice(0, 5).map((a) => (
                <div key={a.sector} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%',
                                  background: SECT_HUES[a.sector] || 'rgb(var(--text-3) / 0.42)' }}/>
                  <span style={{ flex: 1, fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-semi)' }}>{a.sector}</span>
                  <span className="tnum" style={{ fontSize: 'var(--t-aux)', fontWeight: 'var(--weight-semi)',
                                                    color: 'rgb(var(--text-2) / 0.62)' }}>
                    {a.pct.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 holdings */}
          <SectionTitle title="Top 5 Holdings" right="See all →" accent={SEC.portfolio}/>
          <div style={{
            margin: '0 16px 16px', padding: '4px 0',
            background: 'rgb(var(--surface-1))', borderRadius: 16,
            boxShadow: 'var(--hairline-top)',
          }}>
            {top5.map((p, i) => (
              <div key={p.sym} style={{
                display: 'grid',
                gridTemplateColumns: '46px 1fr 88px 80px',
                alignItems: 'center', gap: 10,
                padding: '11px 14px',
                borderBottom: i === top5.length - 1 ? 'none' : '.5px solid var(--separator)',
              }}>
                <div>
                  <div style={{ fontSize: 'var(--t-base)', fontWeight: 'var(--weight-bold)' }}>{p.sym}</div>
                  <div className="t-meta" style={{ marginTop: 2 }}>{p.account.broker}</div>
                </div>
                <div className="tnum" style={{ fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-semi)',
                                                  color: 'rgb(var(--text-2) / 0.62)' }}>
                  {hide ? '••••' : fmtMoney(p.marketValue, { cents: false })}
                </div>
                <MiniSpark data={p.symbol.spark} up={p.symbol.up} w={84} h={26}/>
                <span className={'pill-soft ' + (p.symbol.up ? 'up' : 'down')}
                      style={{ marginLeft: 'auto' }}>
                  {(p.symbol.pct >= 0 ? '+' : '') + p.symbol.pct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>

          {/* Dividends mini */}
          <SectionTitle title="Dividends" right="View dividends →" accent={SEC.activity}/>
          <div style={{
            margin: '0 16px 24px', padding: '16px',
            background: 'rgb(var(--surface-1))', borderRadius: 16,
            boxShadow: 'var(--hairline-top)',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
          }}>
            <div>
              <div className="t-meta">YTD</div>
              <div className="tnum t-h" style={{ marginTop: 4, color: 'rgb(var(--mint))' }}>
                {fmtMoney(P.divYTD, { cents: false })}
              </div>
              <div className="tnum t-aux" style={{ marginTop: 4 }}>
                <span style={{ color: 'rgb(var(--up))', fontWeight: 'var(--weight-bold)' }}>+12.4%</span>
                {' '}vs last yr
              </div>
            </div>
            <div>
              <div className="t-meta">NEXT EX-DATE</div>
              <div style={{ marginTop: 4, fontSize: 'var(--t-base)', fontWeight: 'var(--weight-bold)' }}>MSFT · May 21</div>
              <div className="tnum t-aux" style={{ marginTop: 4 }}>
                Est. $37.35 · 45 sh × $0.83
              </div>
            </div>
          </div>
        </div>
        <IOSTabBarV2 active="portfolio"/>
      </div>
    </div>
  );
}

// Reusable inline section title (used through this file)
function SectionTitle({ title, right, accent }) {
  return (
    <div style={{
      padding: '4px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 18, height: 2, background: accent, borderRadius: 2, opacity: 0.65 }}/>
        <span className="t-eyebrow" style={{ color: accent, opacity: 0.85 }}>{title}</span>
      </div>
      {right && (
        <span style={{ fontSize: 'var(--t-chip)', fontWeight: 'var(--weight-semi)',
                        color: 'rgb(var(--text-2) / 0.62)' }}>{right}</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS — Portfolio Activity
// ─────────────────────────────────────────────────────────────────
function IOSPortfolioActivity({ tweaks, height = 1280 }) {
  // Build a richer transaction list grouped by month
  const txByMonth = [
    {
      label: 'MAY 2026',
      total: '+$1,420.30',
      rows: [
        { d: '14',  kind: 'BUY',  sym: 'NVDA', qty: 10, price: 118.40, acc: 'Fidelity · Individual',  tot:  1184.00 },
        { d: '13',  kind: 'DIV',  sym: 'AAPL', qty: 80, price:   0.25, acc: 'Fidelity · Individual',  tot:    20.00 },
        { d: '12',  kind: 'SELL', sym: 'TSLA', qty:  5, price: 348.10, acc: 'Fidelity · Individual',  tot:  1740.50 },
        { d: '09',  kind: 'BUY',  sym: 'QQQ',  qty:  4, price: 506.70, acc: 'Fidelity · Roth IRA',    tot:  2026.80 },
        { d: '06',  kind: 'BUY',  sym: 'COST', qty:  2, price: 911.20, acc: 'Fidelity · Roth IRA',    tot:  1822.40 },
      ],
    },
    {
      label: 'APR 2026',
      total: '+$3,602.80',
      rows: [
        { d: '28', kind: 'DIV',  sym: 'MSFT', qty: 45, price:  0.83, acc: 'Fidelity · Individual',  tot:   37.35 },
        { d: '22', kind: 'BUY',  sym: 'AVGO', qty:  6, price: 187.40, acc: 'Fidelity · Roth IRA',    tot: 1124.40 },
        { d: '15', kind: 'SELL', sym: 'AMD',  qty: 10, price: 148.30, acc: 'Fidelity · Individual',  tot: 1483.00 },
        { d: '09', kind: 'BUY',  sym: 'GOOG', qty: 12, price: 162.80, acc: 'Fidelity · Individual',  tot: 1953.60 },
      ],
    },
    {
      label: 'MAR 2026',
      total: '−$842.10',
      rows: [
        { d: '24', kind: 'BUY',  sym: 'META', qty:  3, price: 514.20, acc: 'Fidelity · Roth IRA',    tot: 1542.60 },
        { d: '11', kind: 'DIV',  sym: 'AVGO', qty: 22, price:   1.31, acc: 'Fidelity · Roth IRA',    tot:   28.82 },
      ],
    },
  ];

  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          <div style={{ padding: '4px 16px 12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <ProfileChip/>
            <div className="t-h-sub">Portfolio</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="iconbtn"><Icon name="more" size={15}/></span>
              <span className="iconbtn"><Icon name="search" size={14}/></span>
            </div>
          </div>

          <AccountSelector label="All accounts" count={2}/>
          <SubTabs tabs={['Summary','Positions','Activity','Balances']} active="Activity"/>

          {/* Filter chip row */}
          <div style={{
            display: 'flex', gap: 8, padding: '14px 16px 6px',
            overflowX: 'auto', WebkitOverflowScrolling: 'touch',
          }}>
            {[
              { l: 'All',          active: true },
              { l: 'Buys',         active: false },
              { l: 'Sells',        active: false },
              { l: 'Dividends',    active: false },
              { l: 'Fees',         active: false },
              { l: 'Splits',       active: false },
            ].map((c) => (
              <span key={c.l} style={{
                padding: '7px 14px', borderRadius: 999,
                fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-semi)', whiteSpace: 'nowrap',
                background: c.active ? 'rgb(var(--surface-3))' : 'rgb(var(--surface-1))',
                color: c.active ? 'rgb(var(--text))' : 'rgb(var(--text-2) / 0.62)',
                boxShadow: c.active ? 'var(--hairline-top)' : 'none',
              }}>{c.l}</span>
            ))}
          </div>

          {/* Counter + Import/Export row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 18px 6px',
          }}>
            <span style={{ fontSize: 'var(--t-chip)', fontWeight: 'var(--weight-semi)',
                            color: 'rgb(var(--text-2) / 0.62)' }}>
              11 transactions · YTD
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 16,
                            fontSize: 'var(--t-chip)', fontWeight: 'var(--weight-semi)', color: 'rgb(var(--mint))' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Icon name="plus" size={11}/> Trade
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Icon name="arrow-r" size={11}/> Export
              </span>
            </span>
          </div>

          {/* Month groups */}
          {txByMonth.map((g) => (
            <div key={g.label}>
              {/* Month eyebrow */}
              <div style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                padding: '14px 20px 6px',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 18, height: 2,
                                  background: SEC.activity, opacity: 0.65, borderRadius: 2 }}/>
                  <span className="t-eyebrow" style={{ color: SEC.activity, opacity: 0.85 }}>{g.label}</span>
                </span>
                <span className="tnum" style={{ fontSize: 'var(--t-aux)', fontWeight: 'var(--weight-semi)',
                                                  color: g.total.startsWith('−') ? 'rgb(var(--down))' : 'rgb(var(--up))' }}>
                  {g.total}
                </span>
              </div>

              {/* Rows */}
              <div style={{
                margin: '0 16px 4px',
                background: 'rgb(var(--surface-1))', borderRadius: 14,
                boxShadow: 'var(--hairline-top)',
                overflow: 'hidden',
              }}>
                {g.rows.map((r, i) => (
                  <div key={r.d + r.sym + i} style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 56px 1fr 90px',
                    alignItems: 'center', gap: 12,
                    padding: '11px 14px',
                    borderBottom: i === g.rows.length - 1 ? 'none' : '.5px solid var(--separator)',
                  }}>
                    <div className="tnum" style={{ fontSize: 'var(--t-row-strong)', fontWeight: 'var(--weight-bold)', textAlign: 'center',
                                                    color: 'rgb(var(--text))', letterSpacing: '-0.01em' }}>
                      {r.d}
                    </div>
                    <KindPill kind={r.kind}/>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 'var(--t-base)', fontWeight: 'var(--weight-bold)' }}>{r.sym}</span>
                        <span className="tnum t-aux">{r.qty} × ${r.price.toFixed(2)}</span>
                      </div>
                      <div className="t-aux" style={{ marginTop: 2 }}>{r.acc}</div>
                    </div>
                    <div className="tnum" style={{
                      fontSize: 'var(--t-base)', fontWeight: 'var(--weight-bold)', textAlign: 'right',
                      color: r.kind === 'SELL' || r.kind === 'DIV' ? 'rgb(var(--up))'
                          : r.kind === 'FEE'  ? 'rgb(var(--down))'
                          : 'rgb(var(--text))',
                    }}>
                      {r.kind === 'BUY'  ? '−' : '+'}{fmtMoney(r.tot)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* CSV nudge */}
          <div style={{
            margin: '16px 16px 24px',
            padding: '14px 16px',
            background: 'rgb(var(--surface-1) / 0.6)',
            borderRadius: 14, border: '.5px dashed rgb(255 255 255 / 0.12)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ width: 32, height: 32, borderRadius: 8,
                            background: 'rgb(var(--mint) / 0.16)', color: 'rgb(var(--mint))',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="arrow-u" size={14}/>
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--t-row)', fontWeight: 'var(--weight-bold)' }}>Import CSV from broker</div>
              <div className="t-aux" style={{ marginTop: 2 }}>
                Fidelity · Schwab · Vanguard · IBKR
              </div>
            </div>
            <span style={{ padding: '7px 14px', borderRadius: 999,
                            background: 'rgb(var(--mint))', color: 'rgb(var(--on-mint))',
                            fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-bold)' }}>Import</span>
          </div>
        </div>
        <IOSTabBarV2 active="portfolio"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS — Portfolio Balances
// ─────────────────────────────────────────────────────────────────
function IOSPortfolioBalances({ tweaks, height = 1080 }) {
  const hide = !!tweaks.privacy;
  const accs = accountsForProfile('sam').map((a) => {
    const mv = a.holdings.reduce((s, h) => s + h.qty * SYMBOLS[h.sym].price, 0);
    const cash = a.id === 'fid-ind' ? 8420.18 : 1240.55;
    const buyingPower = cash * 2;
    return { ...a, mv, cash, buyingPower };
  });
  const totalCash = accs.reduce((s, a) => s + a.cash, 0);
  const totalBP   = accs.reduce((s, a) => s + a.buyingPower, 0);
  const totalMV   = accs.reduce((s, a) => s + a.mv, 0);

  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          <div style={{ padding: '4px 16px 12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <ProfileChip/>
            <div className="t-h-sub">Portfolio</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="iconbtn"><Icon name="more" size={15}/></span>
              <span className="iconbtn"><Icon name="search" size={14}/></span>
            </div>
          </div>
          <AccountSelector label="All accounts" count={accs.length}/>
          <SubTabs tabs={['Summary','Positions','Activity','Balances']} active="Balances"/>

          {/* Aggregate stat tiles */}
          <div style={{ padding: '14px 16px 6px', display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { lbl: 'Total Cash',       v: totalCash,    col: 'rgb(var(--text))' },
              { lbl: 'Buying Power',     v: totalBP,      col: 'rgb(var(--mint))' },
              { lbl: 'Securities',       v: totalMV,      col: 'rgb(var(--text))' },
            ].map((k) => (
              <div key={k.lbl} style={{
                padding: '14px 12px',
                background: 'rgb(var(--surface-1))', borderRadius: 12,
                boxShadow: 'var(--hairline-top)',
              }}>
                <div className="t-meta">{k.lbl}</div>
                <div className="tnum" style={{
                  fontSize: 'var(--t-row-strong-2)', fontWeight: 'var(--weight-black)', marginTop: 6,
                  letterSpacing: '-0.015em', color: k.col,
                }}>{hide ? '••••' : fmtMoney(k.v, { cents: false })}</div>
              </div>
            ))}
          </div>

          {/* Per-account breakdown */}
          <SectionTitle title="By Account" accent={SEC.portfolio}/>
          {accs.map((a) => (
            <div key={a.id} style={{ margin: '0 16px 12px' }}>
              {/* Header strip in account color */}
              <div style={{
                position: 'relative', overflow: 'hidden',
                background: 'rgb(var(--surface-1))', borderRadius: 16,
                boxShadow: 'var(--hairline-top)',
              }}>
                <span style={{
                  position: 'absolute', top: 0, bottom: 0, left: 0, width: 3,
                  background: ACCT_COLORS[a.id] || 'rgb(var(--text-3) / 0.42)',
                }}/>
                <div style={{ padding: '14px 16px 6px 18px',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 'var(--t-base)', fontWeight: 'var(--weight-bold)' }}>{a.broker} · {a.name}</div>
                    <div className="t-meta" style={{ marginTop: 2 }}>•••• {a.last4}</div>
                  </div>
                  <div className="tnum" style={{ fontSize: 'var(--t-base)', fontWeight: 'var(--weight-bold)', textAlign: 'right' }}>
                    {hide ? '••••' : fmtMoney(a.mv + a.cash, { cents: false })}
                  </div>
                </div>
                <div style={{ padding: '8px 16px 14px 18px' }}>
                  {[
                    { l: 'Securities',    v: a.mv,            sub: '' },
                    { l: 'Cash & equiv.', v: a.cash,          sub: '4.50% APY money mkt' },
                    { l: 'Margin (avail)',v: 0,               sub: 'Not enabled' },
                    { l: 'Buying power',  v: a.buyingPower,   sub: '2× cash · day-trade' },
                  ].map((r, i) => (
                    <div key={r.l} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 0',
                      borderTop: i === 0 ? 'none' : '.5px solid var(--separator)',
                    }}>
                      <div>
                        <div style={{ fontSize: 'var(--t-body)', fontWeight: 'var(--weight-semi)' }}>{r.l}</div>
                        {r.sub && <div className="t-aux" style={{ marginTop: 2 }}>{r.sub}</div>}
                      </div>
                      <div className="tnum" style={{ fontSize: 'var(--t-stat-mac)', fontWeight: 'var(--weight-bold)',
                                                      color: r.v === 0 ? 'rgb(var(--text-3) / 0.38)' : 'rgb(var(--text))' }}>
                        {hide ? '••••' : (r.v === 0 ? '—' : fmtMoney(r.v))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Manual cash entry hint */}
          <div style={{
            margin: '6px 16px 24px',
            padding: '14px 16px',
            background: 'rgb(var(--surface-1) / 0.6)',
            border: '.5px dashed rgb(255 255 255 / 0.12)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 'var(--t-row)', fontWeight: 'var(--weight-bold)' }}>Add an external cash balance</div>
              <div className="t-aux" style={{ marginTop: 2 }}>
                Track a bank or HYSA alongside your brokerage cash
              </div>
            </div>
            <Icon name="plus" size={16} color="rgb(var(--mint))"/>
          </div>
        </div>
        <IOSTabBarV2 active="portfolio"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS — Account selector sheet  (R-N2)
// ─────────────────────────────────────────────────────────────────
function IOSAccountSelectorSheet({ tweaks, height = 844 }) {
  const accs = accountsForProfile('sam').map((a) => {
    const mv = a.holdings.reduce((s, h) => s + h.qty * SYMBOLS[h.sym].price, 0);
    const today = a.holdings.reduce((s, h) => s + h.qty * SYMBOLS[h.sym].change, 0);
    return { ...a, mv, today };
  });
  const totalMV  = accs.reduce((s, a) => s + a.mv,    0);
  const totalTdy = accs.reduce((s, a) => s + a.today, 0);

  return (
    <div className="ios" style={{ height, position: 'relative' }}>
      {/* dimmed backdrop preview */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgb(7 7 10 / 0.65)',
      }}/>
      {/* sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'rgb(28 28 36)', borderRadius: '22px 22px 0 0',
        boxShadow: '0 -10px 40px rgb(0 0 0 / 0.5)',
        padding: '8px 0 36px',
      }}>
        {/* grabber */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 4px' }}>
          <span style={{ width: 36, height: 5, borderRadius: 4, background: 'rgb(255 255 255 / 0.22)' }}/>
        </div>
        {/* header */}
        <div style={{ padding: '4px 20px 12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="t-h-sub">Choose account</div>
          <span className="iconbtn"><Icon name="x" size={14}/></span>
        </div>

        {/* All accounts row */}
        <div style={{ padding: '0 16px 6px' }}>
          <div style={{
            padding: '13px 14px',
            background: 'rgb(var(--surface-2))', borderRadius: 12,
            display: 'grid', gridTemplateColumns: '36px 1fr auto auto', gap: 12, alignItems: 'center',
            boxShadow: 'var(--hairline-top)',
          }}>
            <span style={{ width: 36, height: 36, borderRadius: 10,
                            background: 'rgb(var(--mint) / 0.16)', color: 'rgb(var(--mint))',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="briefcase" size={16}/>
            </span>
            <div>
              <div style={{ fontSize: 'var(--t-base)', fontWeight: 'var(--weight-bold)' }}>All accounts</div>
              <div className="t-aux" style={{ marginTop: 2 }}>
                {accs.length} brokerage · {accs.reduce((s, a) => s + a.holdings.length, 0)} positions
              </div>
            </div>
            <div className="tnum" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--t-row)', fontWeight: 'var(--weight-bold)' }}>{fmtMoney(totalMV, { cents: false })}</div>
              <div style={{ fontSize: 'var(--t-caption)', fontWeight: 'var(--weight-semi)',
                              color: totalTdy >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))', marginTop: 2 }}>
                {(totalTdy >= 0 ? '+' : '') + fmtMoney(Math.abs(totalTdy))}
              </div>
            </div>
            <Icon name="check" size={16} color="rgb(var(--mint))"/>
          </div>
        </div>

        {/* divider */}
        <div style={{ height: '.5px', background: 'var(--separator)', margin: '8px 16px' }}/>

        {/* Per-account rows */}
        <div style={{ padding: '0 16px' }}>
          {accs.map((a) => (
            <div key={a.id} style={{
              padding: '12px 14px',
              borderBottom: '.5px solid var(--separator)',
              display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 12, alignItems: 'center',
            }}>
              <span style={{ width: 36, height: 36, borderRadius: 10,
                              background: 'rgb(var(--surface-2))',
                              position: 'relative', overflow: 'hidden' }}>
                <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                                background: ACCT_COLORS[a.id] }}/>
                <span style={{ position: 'absolute', inset: 0, display: 'inline-flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: 'var(--t-caption)', fontWeight: 'var(--weight-black)', letterSpacing: '0.04em',
                                color: 'rgb(var(--text-2) / 0.62)' }}>
                  {a.broker.slice(0, 3).toUpperCase()}
                </span>
              </span>
              <div>
                <div style={{ fontSize: 'var(--t-base)', fontWeight: 'var(--weight-bold)' }}>{a.broker} · {a.name}</div>
                <div className="t-aux" style={{ marginTop: 2 }}>
                  {a.holdings.length} positions · •••• {a.last4}
                </div>
              </div>
              <div className="tnum" style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 'var(--t-row)', fontWeight: 'var(--weight-bold)' }}>{fmtMoney(a.mv, { cents: false })}</div>
                <div style={{ fontSize: 'var(--t-caption)', fontWeight: 'var(--weight-semi)',
                                color: a.today >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))', marginTop: 2 }}>
                  {(a.today >= 0 ? '+' : '') + fmtMoney(Math.abs(a.today))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div style={{ padding: '14px 16px 0',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                          color: 'rgb(var(--mint))', fontSize: 'var(--t-row)', fontWeight: 'var(--weight-bold)' }}>
            <Icon name="plus" size={13}/> Add account
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                          color: 'rgb(var(--text-2) / 0.62)', fontSize: 'var(--t-body)', fontWeight: 'var(--weight-semi)' }}>
            Manage <Icon name="chevron-r" size={11}/>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS — Portfolio overflow menu (R-N4 — replaces FAB invocation)
// ─────────────────────────────────────────────────────────────────
function IOSPortfolioOverflowMenu({ tweaks, height = 844 }) {
  return (
    <div className="ios" style={{ height, position: 'relative' }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* dimmed snapshot of portfolio behind */}
          <div style={{ padding: '4px 16px 12px', opacity: 0.45,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <ProfileChip/>
            <div className="t-h-sub">Portfolio</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="iconbtn" style={{ outline: '2px solid rgb(var(--mint))', outlineOffset: 2 }}>
                <Icon name="more" size={15}/>
              </span>
              <span className="iconbtn"><Icon name="search" size={14}/></span>
            </div>
          </div>
          <div style={{ opacity: 0.18, padding: '0 16px' }}>
            <AccountSelector label="All accounts" count={2}/>
            <SubTabs tabs={['Summary','Positions','Activity','Balances']} active="Positions"/>
          </div>
        </div>
      </div>

      {/* anchored popover */}
      <div style={{
        position: 'absolute', top: 86, right: 14, width: 264,
        background: 'rgb(50 50 55 / 0.94)',
        border: '.5px solid rgb(255 255 255 / 0.10)', borderRadius: 14,
        backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        boxShadow: '0 16px 40px rgb(0 0 0 / 0.45)',
        overflow: 'hidden', color: 'rgb(var(--text))',
      }}>
        {[
          { lbl: 'Record trade',    icon: 'plus',     sub: 'For current selection' },
          { lbl: 'Import CSV…',     icon: 'arrow-u' },
          { lbl: 'Export CSV',      icon: 'arrow-r' },
          { div: true },
          { lbl: 'Sort by…',        icon: 'arrow-ud', sub: 'Market value · desc' },
          { lbl: 'Edit columns',    icon: 'grid' },
          { lbl: 'Hide closed positions', icon: 'eye-off' },
          { div: true },
          { lbl: 'Privacy mode',    icon: 'eye-off',  trail: 'off' },
          { lbl: 'Set alert…',      icon: 'bell' },
        ].map((m, i) => (
          m.div
            ? <div key={'d'+i} style={{ height: '.5px', background: 'rgb(255 255 255 / 0.08)', margin: '4px 0' }}/>
            : (
              <div key={m.lbl} style={{
                padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 12,
                fontSize: 'var(--t-stat-mac)', fontWeight: 'var(--weight-medium)',
              }}>
                <span style={{ width: 20, color: 'rgb(var(--text))' }}>
                  <Icon name={m.icon} size={15}/>
                </span>
                <span style={{ flex: 1 }}>
                  {m.lbl}
                  {m.sub && <div className="t-aux" style={{ marginTop: 2 }}>{m.sub}</div>}
                </span>
                {m.trail && <span className="t-aux">{m.trail}</span>}
              </div>
            )
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAC — Portfolio Summary
// ─────────────────────────────────────────────────────────────────
function MacPortfolio_NavBar({ active }) {
  // Top bar w/ ProfileChip + section sub-tabs
  return (
    <div style={{
      padding: '8px 24px 0', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <ProfileChip size={28}/>
        <div className="t-h" style={{ fontSize: 'var(--t-h)' }}>Portfolio</div>
        <div style={{
          marginLeft: 12, padding: '6px 14px', borderRadius: 999,
          background: 'rgb(var(--surface-1))', boxShadow: 'var(--hairline-top)',
          fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-semi)', display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          <Icon name="briefcase" size={13} color="rgb(var(--text-2) / 0.62)"/>
          All accounts
          <span style={{ fontSize: 'var(--t-caption)', padding: '2px 7px', borderRadius: 999,
                          background: 'rgb(var(--surface-2))', color: 'rgb(var(--text-3) / 0.38)' }}>2</span>
          <Icon name="chevron-d" size={11} color="rgb(var(--text-2) / 0.62)"/>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <span className="iconbtn"><Icon name="search" size={14}/></span>
        <span className="iconbtn"><Icon name="bell" size={14}/></span>
        <span className="iconbtn"><Icon name="more" size={15}/></span>
      </div>
    </div>
  );
}

function MacPortfolioSubTabs({ active }) {
  return (
    <div style={{
      padding: '14px 24px 0', display: 'flex', gap: 24,
      borderBottom: '.5px solid var(--separator)',
    }}>
      {['Summary','Positions','Activity','Balances'].map((t) => {
        const a = t === active;
        return (
          <div key={t} style={{
            position: 'relative', padding: '10px 0 14px',
            fontSize: 'var(--t-row)', fontWeight: a ? 700 : 500,
            color: a ? 'rgb(var(--text))' : 'rgb(var(--text-2) / 0.62)',
          }}>
            {t}
            {a && <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0,
                                  height: 2, borderRadius: 2, background: SEC.portfolio }}/>}
          </div>
        );
      })}
    </div>
  );
}

function MacPortfolioSummary({ tweaks }) {
  const hide = !!tweaks.privacy;
  const P = PORTFOLIO;
  const top5 = [...POSITIONS].sort((a, b) => b.marketValue - a.marketValue).slice(0, 5);
  return (
    <div className="mac">
      <MacSidebar active="portfolio"/>
      <MacTitleBar/>
      <div className="mac-main" style={{ padding: '40px 0 0' }}>
        <MacPortfolio_NavBar/>
        <MacPortfolioSubTabs active="Summary"/>

        {/* Body — 2 columns */}
        <div style={{ padding: '20px 24px',
                      display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
          {/* Left: KPI strip + performance chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'rgb(var(--surface-1))', borderRadius: 16,
              boxShadow: 'var(--hairline-top)',
              backgroundImage: 'var(--hero-grad-up)',
              padding: '18px 20px',
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
            }}>
              {[
                { lbl: 'Total Value',  v: hide ? '••••' : fmtMoney(P.netWorth, { cents: false }),
                  sub: 'Across 2 accounts', col: 'rgb(var(--text))' },
                { lbl: 'Today',        v: (P.todayPL >= 0 ? '+' : '') + fmtMoney(Math.abs(P.todayPL)),
                  sub: fmtPct(P.todayPct),  col: P.todayPL >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))' },
                { lbl: 'Total P/L',    v: (P.totalPL >= 0 ? '+' : '') + fmtMoney(Math.abs(P.totalPL), { cents: false }),
                  sub: fmtPct(P.totalPct),  col: P.totalPL >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))' },
                { lbl: 'Dividends YTD',v: fmtMoney(P.divYTD, { cents: false }),
                  sub: '+12.4% YoY',         col: 'rgb(var(--mint))' },
              ].map((k) => (
                <div key={k.lbl}>
                  <div className="t-meta">{k.lbl}</div>
                  <div className="tnum" style={{ fontSize: 'var(--t-h-2)', fontWeight: 'var(--weight-black)',
                                                    color: k.col, letterSpacing: '-0.02em',
                                                    marginTop: 8 }}>{k.v}</div>
                  <div className="tnum" style={{ fontSize: 'var(--t-eyebrow)', fontWeight: 'var(--weight-semi)',
                                                    color: k.col, opacity: 0.78, marginTop: 4 }}>
                    {k.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Performance chart */}
            <div style={{
              background: 'rgb(var(--surface-1))', borderRadius: 16,
              boxShadow: 'var(--hairline-top)',
              padding: '16px 20px 8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="t-eyebrow" style={{ color: SEC.portfolio, opacity: 0.85 }}>
                    Performance · vs SPY
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8 }}>
                    <span className="tnum" style={{ fontSize: 'var(--t-h-mac)', fontWeight: 'var(--weight-black)',
                                                      letterSpacing: '-0.025em', color: 'rgb(var(--up))' }}>
                      +18.3%
                    </span>
                    <span className="tnum t-aux">SPY +9.1% · last 1Y</span>
                  </div>
                </div>
                <RangeChips active="1Y" compact/>
              </div>
              <PriceChart data={P.history1Y} mode="area" up={true} w={680} h={220}
                          padInner={{ l: 0, r: 0, t: 16, b: 24 }}/>
            </div>
          </div>

          {/* Right: Allocation + Top 5 + Dividends mini */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'rgb(var(--surface-1))', borderRadius: 16,
              boxShadow: 'var(--hairline-top)', padding: '16px 18px',
            }}>
              <div className="t-eyebrow" style={{ color: SEC.symbol, opacity: 0.85 }}>Allocation</div>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr',
                              gap: 14, alignItems: 'center', marginTop: 10 }}>
                <AllocationDonut data={P.allocation} size={130} thickness={18}
                                  center={<div style={{ textAlign: 'center' }}>
                                    <div className="t-meta">SECTORS</div>
                                    <div className="t-h-sub" style={{ marginTop: 2 }}>
                                      {P.allocation.length}
                                    </div>
                                  </div>}/>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {P.allocation.slice(0, 6).map((a) => (
                    <div key={a.sector} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%',
                                      background: SECT_HUES[a.sector] || 'rgb(var(--text-3) / 0.42)' }}/>
                      <span style={{ flex: 1, fontSize: 'var(--t-chip)', fontWeight: 'var(--weight-semi)' }}>{a.sector}</span>
                      <span className="tnum" style={{ fontSize: 'var(--t-eyebrow)', fontWeight: 'var(--weight-semi)',
                                                        color: 'rgb(var(--text-2) / 0.62)' }}>
                        {a.pct.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgb(var(--surface-1))', borderRadius: 16,
              boxShadow: 'var(--hairline-top)', padding: '14px 4px 8px',
            }}>
              <div className="t-eyebrow"
                    style={{ color: SEC.portfolio, opacity: 0.85, padding: '0 14px 8px' }}>
                Top 5 holdings
              </div>
              {top5.map((p, i) => (
                <div key={p.sym} style={{
                  display: 'grid',
                  gridTemplateColumns: '46px 1fr 80px 70px',
                  alignItems: 'center', gap: 10,
                  padding: '8px 14px',
                  borderBottom: i === top5.length - 1 ? 'none' : '.5px solid var(--separator)',
                }}>
                  <div style={{ fontSize: 'var(--t-row)', fontWeight: 'var(--weight-bold)' }}>{p.sym}</div>
                  <div className="tnum t-aux" style={{ color: 'rgb(var(--text-2) / 0.62)' }}>
                    {hide ? '••••' : fmtMoney(p.marketValue, { cents: false })}
                  </div>
                  <MiniSpark data={p.symbol.spark} up={p.symbol.up} w={74} h={22}/>
                  <span className={'pill-soft ' + (p.symbol.up ? 'up' : 'down')}
                        style={{ marginLeft: 'auto', fontSize: 'var(--t-caption)' }}>
                    {(p.symbol.pct >= 0 ? '+' : '') + p.symbol.pct.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAC — Portfolio Activity
// ─────────────────────────────────────────────────────────────────
function MacPortfolioActivity({ tweaks }) {
  const tx = [
    { dy: 'MAY 14', kind: 'BUY',  sym: 'NVDA', qty: 10, price: 118.40, acc: 'Fidelity · Individual',  tot:  1184.00, run:  '+11,420.30' },
    { dy: 'MAY 13', kind: 'DIV',  sym: 'AAPL', qty: 80, price:   0.25, acc: 'Fidelity · Individual',  tot:    20.00, run:  '+12,604.30' },
    { dy: 'MAY 12', kind: 'SELL', sym: 'TSLA', qty:  5, price: 348.10, acc: 'Fidelity · Individual',  tot:  1740.50, run:  '+12,584.30' },
    { dy: 'MAY 09', kind: 'BUY',  sym: 'QQQ',  qty:  4, price: 506.70, acc: 'Fidelity · Roth IRA',    tot:  2026.80, run:  '+10,843.80' },
    { dy: 'MAY 06', kind: 'BUY',  sym: 'COST', qty:  2, price: 911.20, acc: 'Fidelity · Roth IRA',    tot:  1822.40, run:   '+8,817.00' },
    { dy: 'APR 28', kind: 'DIV',  sym: 'MSFT', qty: 45, price:   0.83, acc: 'Fidelity · Individual',  tot:    37.35, run:   '+6,994.60' },
    { dy: 'APR 22', kind: 'BUY',  sym: 'AVGO', qty:  6, price: 187.40, acc: 'Fidelity · Roth IRA',    tot:  1124.40, run:   '+6,957.25' },
    { dy: 'APR 15', kind: 'SELL', sym: 'AMD',  qty: 10, price: 148.30, acc: 'Fidelity · Individual',  tot:  1483.00, run:   '+8,081.65' },
    { dy: 'APR 09', kind: 'BUY',  sym: 'GOOG', qty: 12, price: 162.80, acc: 'Fidelity · Individual',  tot:  1953.60, run:   '+6,598.65' },
    { dy: 'MAR 24', kind: 'BUY',  sym: 'META', qty:  3, price: 514.20, acc: 'Fidelity · Roth IRA',    tot:  1542.60, run:   '+8,552.25' },
    { dy: 'MAR 11', kind: 'DIV',  sym: 'AVGO', qty: 22, price:   1.31, acc: 'Fidelity · Roth IRA',    tot:    28.82, run:  '+10,094.85' },
  ];

  return (
    <div className="mac">
      <MacSidebar active="portfolio"/>
      <MacTitleBar/>
      <div className="mac-main" style={{ padding: '40px 0 0' }}>
        <MacPortfolio_NavBar/>
        <MacPortfolioSubTabs active="Activity"/>

        {/* Filters row */}
        <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center',
                      gap: 8, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['All', 'Buys', 'Sells', 'Dividends', 'Fees'].map((c, i) => (
              <span key={c} style={{
                padding: '6px 12px', borderRadius: 999, fontSize: 'var(--t-chip)', fontWeight: 'var(--weight-semi)',
                background: i === 0 ? 'rgb(var(--surface-3))' : 'rgb(var(--surface-1))',
                color: i === 0 ? 'rgb(var(--text))' : 'rgb(var(--text-2) / 0.62)',
                boxShadow: i === 0 ? 'var(--hairline-top)' : 'none',
              }}>{c}</span>
            ))}
            <span style={{ padding: '6px 12px', borderRadius: 999, fontSize: 'var(--t-chip)', fontWeight: 'var(--weight-semi)',
                            background: 'rgb(var(--surface-1))', color: 'rgb(var(--text-2) / 0.62)',
                            display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Icon name="calendar" size={11}/> Last 12 mo
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ padding: '6px 12px', borderRadius: 8, fontSize: 'var(--t-chip)', fontWeight: 'var(--weight-semi)',
                            background: 'rgb(var(--surface-1))', boxShadow: 'var(--hairline-top)',
                            display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="arrow-u" size={11}/> Import CSV
            </span>
            <span style={{ padding: '6px 12px', borderRadius: 8, fontSize: 'var(--t-chip)', fontWeight: 'var(--weight-bold)',
                            background: 'rgb(var(--mint))', color: 'rgb(var(--on-mint))',
                            display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="plus" size={11} color="rgb(var(--on-mint))"/> Record trade
            </span>
          </div>
        </div>

        {/* Table */}
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{
            background: 'rgb(var(--surface-1))', borderRadius: 14,
            boxShadow: 'var(--hairline-top)',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px 70px 80px 1fr 100px 120px 130px 110px',
              padding: '10px 16px',
              fontSize: 'var(--t-caption)', fontWeight: 'var(--weight-bold)', letterSpacing: '0.04em',
              textTransform: 'uppercase', color: 'rgb(var(--text-3) / 0.38)',
              borderBottom: '.5px solid var(--separator-strong)',
            }}>
              <span>Date</span><span>Type</span><span>Symbol</span><span>Account</span>
              <span style={{ textAlign: 'right' }}>Qty</span>
              <span style={{ textAlign: 'right' }}>Price</span>
              <span style={{ textAlign: 'right' }}>Total</span>
              <span style={{ textAlign: 'right' }}>Running P/L</span>
            </div>
            {tx.map((r, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '80px 70px 80px 1fr 100px 120px 130px 110px',
                padding: '10px 16px', alignItems: 'center',
                borderBottom: i === tx.length - 1 ? 'none' : '.5px solid var(--separator)',
                fontSize: 'var(--t-stat)',
              }}>
                <span className="tnum" style={{ fontWeight: 'var(--weight-semi)',
                                                  color: 'rgb(var(--text-2) / 0.62)' }}>{r.dy}</span>
                <span><KindPill kind={r.kind}/></span>
                <span style={{ fontWeight: 'var(--weight-bold)' }}>{r.sym}</span>
                <span className="t-aux">{r.acc}</span>
                <span className="tnum" style={{ textAlign: 'right', fontWeight: 'var(--weight-semi)' }}>{r.qty}</span>
                <span className="tnum" style={{ textAlign: 'right', fontWeight: 'var(--weight-semi)',
                                                color: 'rgb(var(--text-2) / 0.62)' }}>
                  ${r.price.toFixed(2)}
                </span>
                <span className="tnum" style={{
                  textAlign: 'right', fontWeight: 'var(--weight-bold)',
                  color: r.kind === 'SELL' || r.kind === 'DIV' ? 'rgb(var(--up))' :
                         r.kind === 'FEE' ? 'rgb(var(--down))' : 'rgb(var(--text))',
                }}>
                  {r.kind === 'BUY' ? '−' : '+'}{fmtMoney(r.tot)}
                </span>
                <span className="tnum" style={{ textAlign: 'right', fontWeight: 'var(--weight-bold)',
                                                  color: r.run.startsWith('+') ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                  {r.run}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAC — Portfolio Balances
// ─────────────────────────────────────────────────────────────────
function MacPortfolioBalances({ tweaks }) {
  const hide = !!tweaks.privacy;
  const accs = accountsForProfile('sam').map((a) => {
    const mv = a.holdings.reduce((s, h) => s + h.qty * SYMBOLS[h.sym].price, 0);
    const cash = a.id === 'fid-ind' ? 8420.18 : 1240.55;
    const buyingPower = cash * 2;
    return { ...a, mv, cash, buyingPower };
  });
  const tot = {
    cash: accs.reduce((s, a) => s + a.cash, 0),
    bp:   accs.reduce((s, a) => s + a.buyingPower, 0),
    mv:   accs.reduce((s, a) => s + a.mv, 0),
  };
  return (
    <div className="mac">
      <MacSidebar active="portfolio"/>
      <MacTitleBar/>
      <div className="mac-main" style={{ padding: '40px 0 0' }}>
        <MacPortfolio_NavBar/>
        <MacPortfolioSubTabs active="Balances"/>

        <div style={{ padding: '20px 24px',
                      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
          {[
            { lbl: 'Total Value',  v: tot.mv + tot.cash, c: 'rgb(var(--text))' },
            { lbl: 'Cash',         v: tot.cash,          c: 'rgb(var(--text))' },
            { lbl: 'Buying Power', v: tot.bp,            c: 'rgb(var(--mint))' },
            { lbl: 'Securities',   v: tot.mv,            c: 'rgb(var(--text))' },
          ].map((k) => (
            <div key={k.lbl} style={{
              background: 'rgb(var(--surface-1))', borderRadius: 14,
              boxShadow: 'var(--hairline-top)',
              padding: '16px 18px',
            }}>
              <div className="t-meta">{k.lbl}</div>
              <div className="tnum" style={{ fontSize: 'var(--t-h-3)', fontWeight: 'var(--weight-black)',
                                                letterSpacing: '-0.025em',
                                                color: k.c, marginTop: 8 }}>
                {hide ? '••••' : fmtMoney(k.v, { cents: false })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '0 24px 24px',
                      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {accs.map((a) => (
            <div key={a.id} style={{
              position: 'relative', overflow: 'hidden',
              background: 'rgb(var(--surface-1))', borderRadius: 16,
              boxShadow: 'var(--hairline-top)',
            }}>
              <span style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 4,
                              background: ACCT_COLORS[a.id] }}/>
              <div style={{ padding: '16px 22px 8px',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 'var(--t-row-strong)', fontWeight: 'var(--weight-bold)' }}>{a.broker} · {a.name}</div>
                  <div className="t-meta" style={{ marginTop: 3 }}>•••• {a.last4}</div>
                </div>
                <div className="tnum" style={{ fontSize: 'var(--t-h-sub)', fontWeight: 'var(--weight-black)' }}>
                  {hide ? '••••' : fmtMoney(a.mv + a.cash, { cents: false })}
                </div>
              </div>
              <div style={{ padding: '0 22px 16px' }}>
                {[
                  { l: 'Securities',     v: a.mv,           sub: a.holdings.length + ' positions' },
                  { l: 'Cash & equiv.',  v: a.cash,         sub: '4.50% APY money mkt' },
                  { l: 'Margin (avail)', v: 0,              sub: 'Not enabled' },
                  { l: 'Buying power',   v: a.buyingPower,  sub: '2× cash · day-trade' },
                ].map((r, i) => (
                  <div key={r.l} style={{
                    display: 'grid', gridTemplateColumns: '1fr auto 130px',
                    padding: '10px 0', gap: 12, alignItems: 'center',
                    borderTop: i === 0 ? 'none' : '.5px solid var(--separator)',
                  }}>
                    <div>
                      <div style={{ fontSize: 'var(--t-body)', fontWeight: 'var(--weight-semi)' }}>{r.l}</div>
                      <div className="t-aux" style={{ marginTop: 2 }}>{r.sub}</div>
                    </div>
                    <span/>
                    <div className="tnum" style={{ fontSize: 'var(--t-stat-mac)', fontWeight: 'var(--weight-bold)',
                                                      textAlign: 'right',
                                                      color: r.v === 0 ? 'rgb(var(--text-3) / 0.38)' : 'rgb(var(--text))' }}>
                      {hide ? '••••' : (r.v === 0 ? '—' : fmtMoney(r.v))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS — Market · Trending (scrolled Stocks tab; IMG_5094 reference)
// ─────────────────────────────────────────────────────────────────
function IOSMarketTrending({ tweaks, height = 1480 }) {
  const trending = ['NVDA','META','AMZN','AVGO','TSLA','AMD','GOOG','SPY'].map((s) => SYMBOLS[s]);
  const gainers  = ['MSFT','AAPL','META','COST','SCHD'].map((s) => SYMBOLS[s]);
  const losers   = ['NVDA','TSLA','AMD','GOOG','AMZN'].map((s) => SYMBOLS[s]);
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          <div style={{ padding: '4px 16px 12px',
                        display: 'flex', alignItems: 'center', gap: 10 }}>
            <ProfileChip/>
            <div style={{ flex: 1, background: 'rgb(var(--surface-1))',
                            borderRadius: 999, padding: '10px 14px',
                            display: 'flex', alignItems: 'center', gap: 8,
                            fontSize: 'var(--t-stat)', color: 'rgb(var(--text-3) / 0.38)' }}>
              <Icon name="search" size={14} color="rgb(var(--text-3) / 0.38)"/>
              Search for news or tickers
            </div>
            <span className="iconbtn"><Icon name="bell" size={14}/></span>
          </div>

          <SubTabs tabs={['Overview','Stocks','ETF','News','Sectors']}
                   active="Stocks" accent="rgb(var(--mint))"/>

          {/* Section chip carousel */}
          <div style={{ padding: '14px 16px 6px',
                        display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {['Trending', 'Most active', 'Day gainers', 'Day losers', 'Undervalued growth', 'High dividend'].map((c, i) => (
              <span key={c} style={{
                padding: '7px 14px', borderRadius: 999,
                fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-semi)', whiteSpace: 'nowrap',
                background: i === 0 ? 'rgb(var(--mint))' : 'rgb(var(--surface-1))',
                color:      i === 0 ? 'rgb(var(--on-mint))'         : 'rgb(var(--text-2) / 0.62)',
                boxShadow:  i === 0 ? 'none'            : 'var(--hairline-top)',
              }}>{c}</span>
            ))}
          </div>

          {/* TRENDING header */}
          <div style={{ padding: '14px 20px 6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 18, height: 2, background: 'rgb(var(--mint))',
                              opacity: 0.7, borderRadius: 2 }}/>
              <span className="t-eyebrow" style={{ color: 'rgb(var(--mint))' }}>
                Trending Now <Icon name="chart" size={11}/></span>
            </span>
            <span className="t-aux">15:35 ET</span>
          </div>

          <div style={{ margin: '0 16px', padding: '4px 14px',
                        background: 'rgb(var(--surface-1))', borderRadius: 14,
                        boxShadow: 'var(--hairline-top)' }}>
            {trending.map((s, i) => (
              <UniRow key={s.symbol} s={s} mode="watch" last={i === trending.length - 1}/>
            ))}
          </div>

          {/* GAINERS & LOSERS */}
          <div style={{ padding: '18px 20px 6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 18, height: 2, background: 'rgb(var(--up))',
                              opacity: 0.7, borderRadius: 2 }}/>
              <span className="t-eyebrow" style={{ color: 'rgb(var(--up))' }}>Day Gainers</span>
            </span>
            <span className="t-aux">View all →</span>
          </div>
          <div style={{ margin: '0 16px', padding: '4px 14px',
                        background: 'rgb(var(--surface-1))', borderRadius: 14,
                        boxShadow: 'var(--hairline-top)' }}>
            {gainers.map((s, i) => (
              <UniRow key={s.symbol} s={{ ...s, up: true,
                                            pct: Math.abs(s.pct) + (i + 1) * 0.4,
                                            change: Math.abs(s.change) + (i + 1) }}
                      mode="watch" last={i === gainers.length - 1}/>
            ))}
          </div>

          <div style={{ padding: '18px 20px 6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 18, height: 2, background: 'rgb(var(--down))',
                              opacity: 0.7, borderRadius: 2 }}/>
              <span className="t-eyebrow" style={{ color: 'rgb(var(--down))' }}>Day Losers</span>
            </span>
            <span className="t-aux">View all →</span>
          </div>
          <div style={{ margin: '0 16px 24px', padding: '4px 14px',
                        background: 'rgb(var(--surface-1))', borderRadius: 14,
                        boxShadow: 'var(--hairline-top)' }}>
            {losers.map((s, i) => (
              <UniRow key={s.symbol} s={{ ...s, up: false,
                                            pct: -(Math.abs(s.pct) + (i + 1) * 0.3),
                                            change: -(Math.abs(s.change) + i) }}
                      mode="watch" last={i === losers.length - 1}/>
            ))}
          </div>
        </div>
        <IOSTabBarV2 active="market"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS — Market · ETF (IMG_5095 reference)
// ─────────────────────────────────────────────────────────────────
function IOSMarketETF({ tweaks, height = 1480 }) {
  const trending = [
    { sym: 'SPY',  name: 'SPDR S&P 500',          aum: '579B', pct:  1.24 },
    { sym: 'QQQ',  name: 'Invesco QQQ',            aum: '301B', pct:  0.85 },
    { sym: 'VTI',  name: 'Vanguard Total Stock',   aum: '462B', pct:  0.51 },
    { sym: 'VOO',  name: 'Vanguard S&P 500',       aum: '518B', pct:  1.20 },
    { sym: 'IVV',  name: 'iShares Core S&P 500',   aum: '492B', pct:  1.22 },
  ];
  const movers = [
    { sym: 'XLE',  name: 'Energy Select Sector',   pct: -3.81 },
    { sym: 'ARKK', name: 'ARK Innovation',          pct:  4.62 },
    { sym: 'TQQQ', name: 'ProShares UltraPro QQQ',  pct:  2.55 },
    { sym: 'SQQQ', name: 'ProShares UltraPro Short QQQ', pct: -2.55 },
    { sym: 'XLF',  name: 'Financial Select Sector', pct: -1.10 },
  ];

  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          <div style={{ padding: '4px 16px 12px',
                        display: 'flex', alignItems: 'center', gap: 10 }}>
            <ProfileChip/>
            <div style={{ flex: 1, background: 'rgb(var(--surface-1))',
                            borderRadius: 999, padding: '10px 14px',
                            display: 'flex', alignItems: 'center', gap: 8,
                            fontSize: 'var(--t-stat)', color: 'rgb(var(--text-3) / 0.38)' }}>
              <Icon name="search" size={14} color="rgb(var(--text-3) / 0.38)"/>
              Search ETFs
            </div>
            <span className="iconbtn"><Icon name="bell" size={14}/></span>
          </div>

          <SubTabs tabs={['Overview','Stocks','ETF','News','Sectors']}
                   active="ETF" accent="rgb(var(--mint))"/>

          {/* TRENDING & MOVERS heading */}
          <div style={{ padding: '14px 20px 4px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 18, height: 2, background: 'rgb(var(--mint))',
                              opacity: 0.7, borderRadius: 2 }}/>
              <span className="t-eyebrow" style={{ color: 'rgb(var(--mint))' }}>
                Trending & Movers
              </span>
            </span>
          </div>

          {/* Trending */}
          <div style={{ padding: '6px 16px' }}>
            <div style={{ display: 'flex', gap: 8, padding: '4px 4px 10px' }}>
              {['Trending ETFs', 'Most actives'].map((c, i) => (
                <span key={c} style={{
                  padding: '7px 14px', borderRadius: 999, fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-semi)',
                  background: i === 0 ? 'rgb(var(--surface-3))' : 'rgb(var(--surface-1))',
                  color:      i === 0 ? 'rgb(var(--text))'     : 'rgb(var(--text-2) / 0.62)',
                  boxShadow:  i === 0 ? 'var(--hairline-top)'  : 'none',
                }}>{c}</span>
              ))}
            </div>

            <div style={{
              background: 'rgb(var(--surface-1))', borderRadius: 14,
              boxShadow: 'var(--hairline-top)', overflow: 'hidden',
            }}>
              {trending.map((e, i) => {
                const data = walk({ n: 28, startPrice: 100, endPrice: 100 + e.pct * 4, seed: 200 + i });
                return (
                  <div key={e.sym} style={{
                    display: 'grid', gridTemplateColumns: '54px 1fr 90px 84px',
                    alignItems: 'center', gap: 10, padding: '12px 16px',
                    borderBottom: i === trending.length - 1 ? 'none' : '.5px solid var(--separator)',
                  }}>
                    <div>
                      <div style={{ fontSize: 'var(--t-base)', fontWeight: 'var(--weight-bold)' }}>{e.sym}</div>
                      <div className="t-meta" style={{ marginTop: 2 }}>${e.aum} AUM</div>
                    </div>
                    <div className="t-aux" style={{ color: 'rgb(var(--text-2) / 0.62)' }}>{e.name}</div>
                    <MiniSpark data={data} up={e.pct >= 0} w={86} h={26}/>
                    <span className={'pill ' + (e.pct >= 0 ? 'up' : 'down')}
                          style={{ marginLeft: 'auto', minWidth: 68, fontSize: 'var(--t-stat)' }}>
                      {(e.pct >= 0 ? '+' : '') + e.pct.toFixed(2)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DAY GAINERS & LOSERS */}
          <div style={{ padding: '20px 20px 4px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 18, height: 2, background: SEC.activity,
                              opacity: 0.7, borderRadius: 2 }}/>
              <span className="t-eyebrow" style={{ color: SEC.activity }}>
                Day Gainers & Losers
              </span>
            </span>
          </div>
          <div style={{ padding: '6px 16px 24px' }}>
            <div style={{ display: 'flex', gap: 8, padding: '4px 4px 10px' }}>
              {['Day gainers', 'Day losers'].map((c, i) => (
                <span key={c} style={{
                  padding: '7px 14px', borderRadius: 999, fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-semi)',
                  background: i === 0 ? 'rgb(var(--surface-3))' : 'rgb(var(--surface-1))',
                  color:      i === 0 ? 'rgb(var(--text))'     : 'rgb(var(--text-2) / 0.62)',
                  boxShadow:  i === 0 ? 'var(--hairline-top)'  : 'none',
                }}>{c}</span>
              ))}
            </div>
            <div style={{
              background: 'rgb(var(--surface-1))', borderRadius: 14,
              boxShadow: 'var(--hairline-top)', overflow: 'hidden',
            }}>
              {movers.map((e, i) => {
                const data = walk({ n: 28, startPrice: 100, endPrice: 100 + e.pct * 5, seed: 300 + i });
                return (
                  <div key={e.sym} style={{
                    display: 'grid', gridTemplateColumns: '54px 1fr 90px 84px',
                    alignItems: 'center', gap: 10, padding: '12px 16px',
                    borderBottom: i === movers.length - 1 ? 'none' : '.5px solid var(--separator)',
                  }}>
                    <div style={{ fontSize: 'var(--t-base)', fontWeight: 'var(--weight-bold)' }}>{e.sym}</div>
                    <div className="t-aux" style={{ color: 'rgb(var(--text-2) / 0.62)' }}>{e.name}</div>
                    <MiniSpark data={data} up={e.pct >= 0} w={86} h={26}/>
                    <span className={'pill ' + (e.pct >= 0 ? 'up' : 'down')}
                          style={{ marginLeft: 'auto', minWidth: 68, fontSize: 'var(--t-stat)' }}>
                      {(e.pct >= 0 ? '+' : '') + e.pct.toFixed(2)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <IOSTabBarV2 active="market"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS — Market · News
// ─────────────────────────────────────────────────────────────────
function IOSMarketNews({ tweaks, height = 1480 }) {
  const stories = [
    { tag: 'For you',  head: 'Nvidia jumps 4% ahead of earnings call as analysts revise targets higher',
      pub: 'Bloomberg', ago: '14m', tickers: ['NVDA'], hot: true },
    { tag: 'Top',      head: 'Fed minutes show split on rate path; Treasury yields snap higher across curve',
      pub: 'Reuters', ago: '38m', tickers: ['SPY','QQQ','BND'] },
    { tag: 'You hold', head: 'Microsoft expands Azure AI capacity in Asia, signs $4B Indonesia deal',
      pub: 'WSJ', ago: '1h', tickers: ['MSFT'] },
    { tag: 'Earnings', head: 'Costco beats Q3 estimates; same-store sales up 7.8% as member renewals near record',
      pub: 'CNBC', ago: '2h', tickers: ['COST'] },
    { tag: 'You hold', head: 'Tesla deliveries miss forecast; Musk hints at robotaxi launch this quarter',
      pub: 'The Verge', ago: '3h', tickers: ['TSLA'] },
    { tag: 'Macro',    head: 'Crude oil climbs 2% as OPEC+ signals tighter output through year-end',
      pub: 'FT', ago: '4h', tickers: [] },
  ];
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          <div style={{ padding: '4px 16px 12px',
                        display: 'flex', alignItems: 'center', gap: 10 }}>
            <ProfileChip/>
            <div style={{ flex: 1, background: 'rgb(var(--surface-1))',
                            borderRadius: 999, padding: '10px 14px',
                            display: 'flex', alignItems: 'center', gap: 8,
                            fontSize: 'var(--t-stat)', color: 'rgb(var(--text-3) / 0.38)' }}>
              <Icon name="search" size={14} color="rgb(var(--text-3) / 0.38)"/>
              Search news
            </div>
            <span className="iconbtn"><Icon name="bell" size={14}/></span>
          </div>

          <SubTabs tabs={['Overview','Stocks','ETF','News','Sectors']}
                   active="News" accent="rgb(var(--mint))"/>

          {/* Filter chips */}
          <div style={{ padding: '14px 16px 6px',
                        display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {['For you','Top stories','Your holdings','Watchlist','Earnings','Macro','Crypto'].map((c, i) => (
              <span key={c} style={{
                padding: '7px 14px', borderRadius: 999,
                fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-semi)', whiteSpace: 'nowrap',
                background: i === 0 ? 'rgb(var(--mint))' : 'rgb(var(--surface-1))',
                color:      i === 0 ? 'rgb(var(--on-mint))'         : 'rgb(var(--text-2) / 0.62)',
                boxShadow:  i === 0 ? 'none'            : 'var(--hairline-top)',
              }}>{c}</span>
            ))}
          </div>

          {/* Feature card */}
          <div style={{ padding: '12px 16px' }}>
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              background: 'rgb(var(--surface-1))', boxShadow: 'var(--hairline-top)',
            }}>
              {/* Faux thumbnail */}
              <div style={{
                height: 160,
                background: 'linear-gradient(135deg, rgb(122 182 255 / 0.35), rgb(201 182 255 / 0.18) 60%, rgb(255 193 118 / 0.25)), rgb(var(--surface-2))',
                position: 'relative',
              }}>
                <span style={{
                  position: 'absolute', top: 12, left: 12,
                  padding: '4px 10px', borderRadius: 999,
                  background: 'rgb(0 0 0 / 0.55)',
                  fontSize: 'var(--t-caption)', fontWeight: 'var(--weight-bold)', letterSpacing: '0.05em',
                  textTransform: 'uppercase', color: 'rgb(var(--mint))',
                  backdropFilter: 'blur(6px)',
                }}>For you · Hot</span>
                <span style={{
                  position: 'absolute', bottom: 14, left: 14, right: 14,
                  fontSize: 'var(--t-h-sub)', fontWeight: 'var(--weight-black)', lineHeight: 1.25,
                  letterSpacing: '-0.015em',
                }}>{stories[0].head}</span>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center',
                              justifyContent: 'space-between', fontSize: 'var(--t-aux)', fontWeight: 'var(--weight-semi)',
                              color: 'rgb(var(--text-2) / 0.62)' }}>
                <span>{stories[0].pub} · {stories[0].ago} ago</span>
                <span style={{ display: 'inline-flex', gap: 6 }}>
                  {stories[0].tickers.map((t) => (
                    <span key={t} style={{
                      padding: '3px 8px', borderRadius: 6, fontSize: 'var(--t-caption)', fontWeight: 'var(--weight-bold)',
                      background: 'rgb(var(--mint) / 0.16)', color: 'rgb(var(--mint))',
                    }}>{t}</span>
                  ))}
                </span>
              </div>
            </div>
          </div>

          {/* List of remaining stories */}
          {stories.slice(1).map((st, i) => (
            <div key={i} style={{
              margin: '6px 16px',
              padding: '14px',
              background: 'rgb(var(--surface-1))', borderRadius: 14,
              boxShadow: 'var(--hairline-top)',
              display: 'grid', gridTemplateColumns: '64px 1fr', gap: 12,
            }}>
              {/* fake thumb */}
              <div style={{
                width: 64, height: 64, borderRadius: 10,
                background: st.tag === 'Earnings' ? 'linear-gradient(135deg, rgb(var(--sec-activity)), rgb(var(--gics-financials)))'
                          : st.tag === 'You hold' ? 'linear-gradient(135deg, rgb(var(--mint)), rgb(var(--up)))'
                          : st.tag === 'Macro'    ? 'linear-gradient(135deg, rgb(var(--gics-tech)), rgb(var(--gics-comm)))'
                          : 'linear-gradient(135deg, rgb(var(--gics-semis)), rgb(var(--gics-realestate)))',
              }}/>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span className="t-meta" style={{
                    color: st.tag === 'You hold' ? 'rgb(var(--mint))' :
                           st.tag === 'Earnings' ? SEC.activity :
                           'rgb(var(--text-3) / 0.38)',
                  }}>{st.tag}</span>
                  {st.tickers.map((t) => (
                    <span key={t} style={{
                      padding: '1px 6px', borderRadius: 4, fontSize: 'var(--t-meta)', fontWeight: 'var(--weight-bold)',
                      background: 'rgb(var(--surface-2))', color: 'rgb(var(--text-2) / 0.62)',
                    }}>{t}</span>
                  ))}
                </div>
                <div style={{ fontSize: 'var(--t-row)', fontWeight: 'var(--weight-bold)', lineHeight: 1.32,
                                letterSpacing: '-0.005em', textWrap: 'pretty' }}>{st.head}</div>
                <div className="t-aux" style={{ marginTop: 4 }}>
                  {st.pub} · {st.ago} ago
                </div>
              </div>
            </div>
          ))}
        </div>
        <IOSTabBarV2 active="market"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAC — Market · Sectors Heatmap (R-N3, v1.5)
// ─────────────────────────────────────────────────────────────────
function MacMarketSectorsHeatmap({ tweaks }) {
  // 11 GICS sectors with synthetic pcts & sub-rows of top 3 by weight
  const sectors = [
    { name: 'Tech',         pct:  1.84, mc: '14.20T', top: ['AAPL','MSFT','NVDA'] },
    { name: 'Semis',        pct: -2.42, mc:  '5.65T', top: ['NVDA','AVGO','AMD'] },
    { name: 'Comm',         pct:  0.41, mc:  '4.85T', top: ['GOOG','META','NFLX'] },
    { name: 'Consumer',     pct:  0.78, mc:  '5.42T', top: ['AMZN','HD','MCD'] },
    { name: 'Financials',   pct: -0.21, mc:  '8.72T', top: ['BRK.B','JPM','V'] },
    { name: 'Health',       pct:  0.92, mc:  '6.20T', top: ['LLY','UNH','JNJ'] },
    { name: 'Energy',       pct: -3.81, mc:  '2.12T', top: ['XOM','CVX','COP'] },
    { name: 'Industrials',  pct: -0.36, mc:  '4.40T', top: ['CAT','GE','RTX'] },
    { name: 'Materials',    pct: -1.08, mc:  '1.10T', top: ['LIN','SHW','APD'] },
    { name: 'Utilities',    pct:  0.18, mc:    '880B', top: ['NEE','SO','DUK'] },
    { name: 'RealEstate',   pct: -0.92, mc:  '1.30T', top: ['PLD','AMT','EQIX'] },
  ];

  function bgFor(p) {
    if (p > 2)    return 'linear-gradient(135deg, rgb(52 211 153 / 0.50), rgb(52 211 153 / 0.18))';
    if (p > 0.5)  return 'linear-gradient(135deg, rgb(52 211 153 / 0.30), rgb(52 211 153 / 0.10))';
    if (p > 0)    return 'linear-gradient(135deg, rgb(52 211 153 / 0.16), rgb(52 211 153 / 0.04))';
    if (p > -0.5) return 'linear-gradient(135deg, rgb(251 113 133 / 0.14), rgb(251 113 133 / 0.04))';
    if (p > -2)   return 'linear-gradient(135deg, rgb(251 113 133 / 0.30), rgb(251 113 133 / 0.10))';
    return                'linear-gradient(135deg, rgb(251 113 133 / 0.50), rgb(251 113 133 / 0.18))';
  }

  return (
    <div className="mac">
      <MacSidebar active="market"/>
      <MacTitleBar/>
      <div className="mac-main" style={{ padding: '40px 0 0' }}>
        {/* nav */}
        <div style={{ padding: '8px 24px 0',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <ProfileChip size={28}/>
            <div className="t-h" style={{ fontSize: 'var(--t-h)' }}>Market</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="kbd"><Icon name="cmd" size={11}/> K</span>
            <span className="iconbtn"><Icon name="bell" size={14}/></span>
            <span className="iconbtn"><Icon name="more" size={15}/></span>
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{ padding: '14px 24px 0', display: 'flex', gap: 24,
                        borderBottom: '.5px solid var(--separator)' }}>
          {['Overview','Stocks','ETF','News','Sectors','Movers'].map((t) => {
            const a = t === 'Sectors';
            return (
              <div key={t} style={{
                position: 'relative', padding: '10px 0 14px',
                fontSize: 'var(--t-row)', fontWeight: a ? 700 : 500,
                color: a ? 'rgb(var(--text))' : 'rgb(var(--text-2) / 0.62)',
              }}>
                {t}
                {a && <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0,
                                      height: 2, borderRadius: 2, background: 'rgb(var(--mint))' }}/>}
              </div>
            );
          })}
        </div>

        {/* Heatmap legend */}
        <div style={{ padding: '16px 24px 0',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
            <span className="t-h-sub">GICS Sectors</span>
            <span className="t-aux">11 sectors · 1D · S&amp;P 500 constituents</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
                          fontSize: 'var(--t-eyebrow)', fontWeight: 'var(--weight-semi)', color: 'rgb(var(--text-2) / 0.62)' }}>
            <span>−2%</span>
            <span style={{
              width: 220, height: 10, borderRadius: 5,
              background: 'linear-gradient(90deg, rgb(251 113 133), rgb(251 113 133 / 0.2), rgb(38 38 48), rgb(52 211 153 / 0.2), rgb(52 211 153))',
            }}/>
            <span>+2%</span>
          </div>
        </div>

        {/* Heatmap grid */}
        <div style={{ padding: '14px 24px 24px',
                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
                        gridAutoRows: '136px' }}>
          {sectors.map((s) => (
            <div key={s.name} style={{
              position: 'relative', borderRadius: 14,
              background: bgFor(s.pct),
              boxShadow: 'var(--hairline-top)',
              padding: '14px 16px',
              overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 'var(--t-base)', fontWeight: 'var(--weight-black)',
                                  letterSpacing: '-0.01em' }}>{s.name}</div>
                  <div className="t-aux" style={{ marginTop: 3 }}>${s.mc} mkt cap</div>
                </div>
                <div className="tnum" style={{
                  fontSize: 'var(--t-h)', fontWeight: 'var(--weight-black)', letterSpacing: '-0.02em',
                  color: s.pct >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))',
                }}>
                  {(s.pct >= 0 ? '+' : '') + s.pct.toFixed(2)}%
                </div>
              </div>
              <div style={{
                position: 'absolute', left: 16, right: 16, bottom: 12,
                display: 'flex', gap: 6,
              }}>
                {s.top.map((t) => (
                  <span key={t} style={{
                    padding: '3px 8px', borderRadius: 5,
                    fontSize: 'var(--t-caption)', fontWeight: 'var(--weight-bold)',
                    background: 'rgb(0 0 0 / 0.30)', backdropFilter: 'blur(8px)',
                    color: 'rgb(255 255 255 / 0.92)',
                  }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
          {/* spacer */}
          <div style={{
            borderRadius: 14, border: '.5px dashed rgb(255 255 255 / 0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgb(var(--text-3) / 0.38)', fontSize: 'var(--t-aux)', fontWeight: 'var(--weight-semi)',
            gap: 6,
          }}>
            <Icon name="plus" size={13}/> Crypto · v2
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Globals export
// ─────────────────────────────────────────────────────────────────
Object.assign(window, {
  MiniSpark, SectionTitle, SECT_HUES,
  IOSPortfolioSummary, IOSPortfolioActivity, IOSPortfolioBalances,
  IOSAccountSelectorSheet, IOSPortfolioOverflowMenu,
  MacPortfolioSummary, MacPortfolioActivity, MacPortfolioBalances,
  MacPortfolio_NavBar, MacPortfolioSubTabs,
  IOSMarketTrending, IOSMarketETF, IOSMarketNews,
  MacMarketSectorsHeatmap,
});
