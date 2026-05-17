// screens-ios.jsx — iOS screen renderings for mini-stock

const { useMemo: _useMemo } = React;

// ─────────────────────────────────────────────────────────────────
// Reusable iOS chrome
// ─────────────────────────────────────────────────────────────────
function IOSStatusBar({ time = '15:35' }) {
  return (
    <div className="ios-statusbar">
      <span>{time}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span className="bars"><i/><i/><i/><i/></span>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <path d="M8.5 2C5.7 2 3.2 3 1.4 4.8L0 3.4A12 12 0 0117 3.4l-1.4 1.4A11.9 11.9 0 008.5 2zm0 3.5c-1.8 0-3.5.7-4.7 1.9L2.4 6c1.7-1.7 4-2.6 6.1-2.6s4.4.9 6.1 2.6l-1.4 1.4A6.7 6.7 0 008.5 5.5zM6.8 9l1.7 1.7L10.2 9c-1-1-2.5-1-3.4 0z" fill="white"/>
        </svg>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginLeft: 2 }}>
          <span style={{
            position: 'relative',
            width: 26, height: 12, borderRadius: 3,
            border: '1.2px solid rgba(255,255,255,0.4)',
            padding: 1.5,
          }}>
            <span style={{
              display: 'block', height: '100%',
              width: '85%',
              background: 'white', borderRadius: 1.5,
            }}/>
            <span style={{
              position: 'absolute', left: '100%', top: 3, bottom: 3,
              width: 1.4, marginLeft: 1, background: 'rgba(255,255,255,0.4)', borderRadius: 1,
            }}/>
          </span>
        </span>
      </span>
    </div>
  );
}

function IOSTabBar({ active = 'home' }) {
  const tabs = [
    { id: 'home',  label: 'Home',      icon: 'chart' },
    { id: 'watch', label: 'Watchlist', icon: 'eye' },
    { id: 'add',   label: '',          icon: 'plus', fab: true },
    { id: 'acc',   label: 'Accounts',  icon: 'wallet' },
    { id: 'me',    label: 'Me',        icon: 'user' },
  ];
  return (
    <div className="ios-tabbar">
      {tabs.map((t) => (
        <div key={t.id} className={`tab ${active === t.id ? 'active' : ''} ${t.fab ? 'fab' : ''}`}>
          {t.fab ? (
            <div style={{
              width: 44, height: 44, borderRadius: 22,
              background: 'rgb(var(--mint))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#07120D',
              boxShadow: '0 4px 14px rgba(107,232,184,0.32)',
            }}>
              <Icon name="plus" size={22} color="#07120D" strokeWidth={2.5}/>
            </div>
          ) : (
            <>
              <Icon name={t.icon} size={22} color={active === t.id ? 'rgb(var(--mint))' : 'rgb(var(--text-2) / 0.62)'} strokeWidth={1.8}/>
              <span>{t.label}</span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function RangeChips({ active = '6M', sizes = ['1D','1W','1M','3M','6M','YTD','1Y','ALL'], compact = false }) {
  return (
    <div style={{
      display: 'flex', gap: compact ? 4 : 6,
      justifyContent: 'space-between',
      padding: compact ? '6px 16px' : '4px 16px',
    }}>
      {sizes.map((r) => (
        <span key={r} style={{
          padding: compact ? '5px 9px' : '6px 11px',
          borderRadius: compact ? 7 : 999,
          fontSize: compact ? 12 : 13,
          fontWeight: 600,
          color: r === active ? '#07120D' : 'rgb(var(--text-2) / 0.62)',
          background: r === active ? 'rgb(var(--mint))' : 'transparent',
        }}>{r}</span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// iOS — Dashboard
// ─────────────────────────────────────────────────────────────────
function IOSDashboard({ tweaks }) {
  const P = PORTFOLIO;
  const hide = !!tweaks.privacy;

  return (
    <div className="ios">
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* Header */}
          <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 500, letterSpacing: 0.02 }}>
                Good evening, Sam
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.022em', marginTop: 2 }}>
                Portfolio
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
              <span className="iconbtn"><Icon name={hide ? 'eye-off' : 'eye'} size={16}/></span>
              <span className="iconbtn"><Icon name="bell" size={16}/></span>
            </div>
          </div>

          {/* Net worth + equity curve card */}
          <div style={{ margin: '4px 16px 12px', padding: '16px 18px 8px', borderRadius: 20, background: 'rgb(var(--surface-1))' }}>
            <div style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 600, letterSpacing: 0.05, textTransform: 'uppercase' }}>
              Net Worth · All Accounts
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <PriceText value={P.netWorth} hidden={hide} prefix="$" decimals={2}
                         style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.025em' }}/>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6, fontSize: 14, fontWeight: 600 }}>
              <span style={{ color: P.todayPL >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))' }} className="tnum">
                {hide ? '••••••' : (P.todayPL >= 0 ? '+' : '') + fmtMoney(P.todayPL).replace('$', '$')}
              </span>
              <span style={{ color: P.todayPL >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))' }} className="tnum">
                {(P.todayPL >= 0 ? '+' : '') + P.todayPct.toFixed(2) + '%'}
              </span>
              <span style={{ color: 'rgb(var(--text-3) / 0.38)' }}>Today</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 2, fontSize: 13, fontWeight: 500 }}>
              <span style={{ color: 'rgb(var(--up))' }} className="tnum">+{fmtMoney(P.totalPL).replace('$','$')}</span>
              <span style={{ color: 'rgb(var(--up))' }} className="tnum">+{P.totalPct.toFixed(2)}%</span>
              <span style={{ color: 'rgb(var(--text-3) / 0.38)' }}>Total</span>
            </div>

            <div style={{ marginTop: 6, marginLeft: -4, marginRight: -4 }}>
              <AreaChart data={P.history6M} up={true} w={326} h={92} gridY={3} mode="area" showPriceTicks={false}
                         pad={{ l: 0, r: 0, t: 8, b: 6 }}/>
            </div>
            <RangeChips active="6M" sizes={['1D','1W','1M','3M','6M','1Y','ALL']} compact={true}/>
          </div>

          {/* Movers strip */}
          <div style={{ padding: '4px 0 14px' }}>
            <div style={{ padding: '0 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="h-section" style={{ fontSize: 17 }}>Today's Movers</div>
              <span style={{ fontSize: 13, color: 'rgb(var(--mint))', fontWeight: 500 }}>See all</span>
            </div>
            <div style={{
              display: 'flex', gap: 10, padding: '0 16px',
              overflow: 'hidden',
            }}>
              {P.movers.slice(0, 4).map((m) => (
                <div key={m.account.id + m.sym} style={{
                  flex: '0 0 122px',
                  background: 'rgb(var(--surface-1))',
                  borderRadius: 14,
                  padding: '10px 12px 12px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.02 }}>{m.sym}</div>
                    <PercentPill pct={m.symbol.pct} size="sm"/>
                  </div>
                  <div style={{ margin: '6px -4px 4px' }}>
                    <Sparkline data={m.symbol.spark} up={m.symbol.up} w={106} h={28}/>
                  </div>
                  <div className="tnum" style={{ fontSize: 14, fontWeight: 700 }}>
                    {fmtNum(m.symbol.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Allocation + recent activity row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, padding: '0 16px' }}>
            <div style={{ background: 'rgb(var(--surface-1))', borderRadius: 16, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="h-eyebrow">Allocation by Sector</div>
                <span style={{ fontSize: 12, color: 'rgb(var(--text-2) / 0.62)' }}>{P.allocation.length} sectors</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
                <AllocationDonut data={P.allocation} size={86} thickness={11}
                  center={
                    <div>
                      <div style={{ fontSize: 9, color: 'rgb(var(--text-3) / 0.38)', letterSpacing: 0.06, textTransform: 'uppercase' }}>Total</div>
                      <div className="tnum" style={{ fontSize: 13, fontWeight: 700 }}>${fmtCompact(P.netWorth)}</div>
                    </div>
                  }/>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {P.allocation.slice(0, 5).map((a, i) => {
                    const colors = ['#6BE8B8','#5AA9FF','#F2B45C','#B98CFF','#FF8AAB'];
                    return (
                      <div key={a.sector} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 2, background: colors[i] }}/>
                        <span style={{ flex: 1, color: 'rgb(var(--text-2) / 0.62)' }}>{a.sector}</span>
                        <span className="tnum" style={{ color: 'rgb(var(--text))', fontWeight: 600 }}>{a.pct.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <IOSTabBar active="home"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// iOS — Watchlist
// ─────────────────────────────────────────────────────────────────
function IOSWatchlist({ tweaks }) {
  const hide = !!tweaks.privacy;
  const layout = tweaks.rowLayout || 'apple';   // apple | yahoo
  const sortMode = tweaks.sortMode || 'Manual';
  const sorted = [...WATCHLIST];
  if (sortMode === 'Percentage Change') sorted.sort((a, b) => b.pct - a.pct);
  else if (sortMode === 'Price Change') sorted.sort((a, b) => b.change - a.change);
  else if (sortMode === 'Symbol') sorted.sort((a, b) => a.symbol.localeCompare(b.symbol));
  else if (sortMode === 'Market Cap') sorted.sort((a, b) => b.price - a.price);

  return (
    <div className="ios">
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* Title */}
          <div style={{ padding: '0 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.022em', lineHeight: 1.05 }}>Stocks</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.022em', color: 'rgb(var(--text-3) / 0.38)', lineHeight: 1.1 }}>
                May 15
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
              <span className="iconbtn"><Icon name="search" size={16}/></span>
              <span className="iconbtn"><Icon name="more" size={16}/></span>
            </div>
          </div>

          {/* List name + sort */}
          <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 17, fontWeight: 700 }}>
              My Symbols
              <Icon name="chevron-d" size={14} color="rgb(var(--text-2) / 0.62)"/>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgb(var(--text-2) / 0.62)' }}>
              <Icon name="arrow-ud" size={13}/> {sortMode}
            </span>
          </div>

          {/* Rows */}
          <div style={{ padding: '0 20px' }}>
            {sorted.slice(0, 7).map((s, i) => (
              <StockRow key={s.symbol} s={s} layout={layout} hidden={hide} last={i === 6}/>
            ))}
          </div>
        </div>
        <IOSTabBar active="watch"/>
      </div>
    </div>
  );
}

function StockRow({ s, layout, hidden, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0',
      borderBottom: last ? 'none' : '.5px solid var(--separator)',
    }}>
      <div style={{ flex: '0 0 auto', minWidth: 76 }}>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: 0.01 }}>{s.symbol}</div>
        <div style={{ fontSize: 12, color: 'rgb(var(--text-2) / 0.62)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 86 }}>
          {s.name}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <Sparkline data={s.spark} up={s.up} w={86} h={32} prevClose={s.prevCloseLine}/>
      </div>
      {layout === 'yahoo' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, minWidth: 96 }}>
          <PriceText value={s.price} hidden={hidden}
                     style={{ fontSize: 16, fontWeight: 700 }}/>
          <span className="pill" style={{
            background: s.up ? 'rgb(var(--up))' : 'rgb(var(--down))',
            minWidth: 66, padding: '4px 9px', fontSize: 13,
          }}>{(s.up?'+':'')+s.pct.toFixed(2)+'%'}</span>
          <Overnight pct={s.pct * 0.22}/>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, minWidth: 90 }}>
          <PriceText value={s.price} hidden={hidden}
                     style={{ fontSize: 17, fontWeight: 700 }}/>
          <PercentPill pct={s.pct} size="lg"/>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// iOS — Symbol detail (MSFT default)
// ─────────────────────────────────────────────────────────────────
function IOSSymbol({ tweaks, sym = 'MSFT' }) {
  const s = SYMBOLS[sym];
  const hist = symbolHistory(sym);
  const cnd = symbolCandles(sym);
  const mode = tweaks.chartStyle || 'area';
  const hide = !!tweaks.privacy;

  // Find user's position in this symbol
  let position = null;
  for (const acc of ACCOUNTS) {
    const h = acc.holdings.find((x) => x.sym === sym);
    if (h) { position = { ...h, account: acc }; break; }
  }
  const mv = position ? position.qty * s.price : 0;
  const pCost = position ? position.qty * position.avgCost : 0;
  const pUn = mv - pCost;

  return (
    <div className="ios">
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body" style={{ overflow: 'hidden' }}>
          {/* Top bar */}
          <div style={{ padding: '4px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="iconbtn"><Icon name="chevron-l" size={16}/></span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="iconbtn"><Icon name="star" size={16}/></span>
              <span className="iconbtn"><Icon name="more" size={16}/></span>
            </div>
          </div>

          {/* Hero */}
          <div style={{ padding: '0 20px 6px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <SymbolLogo sym={sym} size={44}/>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05 }}>{sym}</div>
              <div style={{ fontSize: 13, color: 'rgb(var(--text-2) / 0.62)' }}>{s.name} · {s.exch}</div>
            </div>
          </div>
          <div style={{ padding: '8px 20px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <PriceText value={s.price} hidden={hide}
                         style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.025em' }}/>
              <PercentPill pct={s.pct} size="lg"/>
            </div>
            <div className="tnum" style={{ fontSize: 14, marginTop: 2,
                                            color: s.up ? 'rgb(var(--up))' : 'rgb(var(--down))', fontWeight: 600 }}>
              {(s.up?'+':'')+s.change.toFixed(2)} <span style={{ color: 'rgb(var(--text-3) / 0.38)', fontWeight: 500 }}>Today</span>
            </div>
          </div>

          {/* Range chips */}
          <div style={{ padding: '8px 12px 0' }}>
            <RangeChips active="3M" sizes={['1D','1W','1M','3M','6M','YTD','1Y','5Y']} compact={true}/>
          </div>

          {/* Chart */}
          <div style={{ padding: '4px 16px 6px' }}>
            <PriceChart data={hist} candleData={cnd} mode={mode} up={s.up} w={358} h={188} gridY={4}
                        padInner={{ l: 0, r: 32, t: 12, b: 18 }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', padding: '0 4px' }}>
              <span>Feb</span><span>Mar</span><span>Apr</span><span>May</span>
            </div>
          </div>

          {/* Chart mode toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '2px 16px 8px' }}>
            {['area','line','candle'].map((m) => (
              <span key={m} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 999,
                background: m === mode ? 'rgb(var(--surface-2))' : 'transparent',
                color: m === mode ? 'rgb(var(--text))' : 'rgb(var(--text-3) / 0.38)',
                fontWeight: 600, textTransform: 'capitalize',
              }}>{m}</span>
            ))}
          </div>

          {/* Stat strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                        padding: '2px 16px 8px', gap: 6 }}>
            {[
              ['Open',  fmtNum(s.prevClose)],
              ['High',  fmtNum(s.price * 1.012)],
              ['Low',   fmtNum(s.price * 0.978)],
              ['Vol',   '50.24M'],
              ['Mkt Cap','3.13T'],
              ['P/E',   '32.4'],
              ['52w H', fmtNum(s.price * 1.18)],
              ['52w L', fmtNum(s.price * 0.74)],
            ].map(([k,v]) => (
              <div key={k} style={{ background: 'rgb(var(--surface-1))', borderRadius: 10, padding: '7px 9px' }}>
                <div style={{ fontSize: 10, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 600, letterSpacing: 0.04, textTransform: 'uppercase' }}>{k}</div>
                <div className="tnum" style={{ fontSize: 13, fontWeight: 700, marginTop: 1 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* My Position */}
          {position && (
            <div style={{ margin: '4px 16px 10px', padding: '12px 14px', borderRadius: 14, background: 'rgb(var(--surface-1))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div className="h-eyebrow">My Position</div>
                <span style={{ fontSize: 12, color: 'rgb(var(--mint))', fontWeight: 600 }}>{position.account.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
                <div>
                  <PriceText value={mv} hidden={hide} prefix="$"
                             style={{ fontSize: 22, fontWeight: 700 }}/>
                  <div style={{ fontSize: 12, color: 'rgb(var(--text-2) / 0.62)', marginTop: 2 }} className="tnum">
                    {position.qty} sh · avg ${fmtNum(position.avgCost)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="tnum" style={{ fontSize: 14, color: pUn>=0 ? 'rgb(var(--up))' : 'rgb(var(--down))', fontWeight: 700 }}>
                    {(pUn>=0?'+':'')+fmtMoney(pUn).replace('$','$')}
                  </div>
                  <div className="tnum" style={{ fontSize: 12, color: pUn>=0 ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                    {(pUn>=0?'+':'')+((pUn/pCost)*100).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <IOSTabBar active="watch"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// iOS — Account / Positions detail (Yahoo Finance-style)
// ─────────────────────────────────────────────────────────────────
function IOSAccount({ tweaks }) {
  const hide = !!tweaks.privacy;
  const acc = ACCOUNTS[0];
  const acc2 = ACCOUNTS[1];
  const accValue = acc.holdings.reduce((s, h) => s + h.qty * SYMBOLS[h.sym].price, 0);
  const accToday = acc.holdings.reduce((s, h) => s + h.qty * SYMBOLS[h.sym].change, 0);
  const accPct   = (accToday / (accValue - accToday)) * 100;
  const acc2Value = acc2.holdings.reduce((s, h) => s + h.qty * SYMBOLS[h.sym].price, 0);
  const acc2Today = acc2.holdings.reduce((s, h) => s + h.qty * SYMBOLS[h.sym].change, 0);
  const acc2Pct   = (acc2Today / (acc2Value - acc2Today)) * 100;

  return (
    <div className="ios">
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* Title row */}
          <div style={{ padding: '0 20px 12px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.022em', lineHeight: 1.05 }}>Accounts</div>
              <div style={{ fontSize: 13, color: 'rgb(var(--text-3) / 0.38)', marginTop: 2 }}>
                2 linked · ${fmtNum(accValue + acc2Value, 2)} total
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
              <span className="iconbtn"><Icon name="edit" size={15}/></span>
              <span className="iconbtn" style={{ background: 'rgb(var(--mint))' }}>
                <Icon name="plus" size={16} color="#07120D" strokeWidth={2.5}/>
              </span>
            </div>
          </div>

          {/* Account card 1 — expanded */}
          <div style={{ margin: '0 16px 12px', background: 'rgb(var(--surface-1))', borderRadius: 16, overflow: 'hidden' }}>
            <BrokerHeader name={acc.broker.toUpperCase()+' INVESTMENTS : '+acc.name.toUpperCase()+' -'+acc.last4}
                          value={accValue} today={accToday} pct={accPct} hidden={hide} open/>
            <div style={{ height: .5, background: 'var(--separator)' }}/>

            {/* Holdings list */}
            <div style={{ padding: '6px 14px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 4px 6px',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.06,
                              textTransform: 'uppercase', color: 'rgb(var(--text-3) / 0.38)' }}>
                  Holdings · {acc.holdings.length}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'rgb(var(--text-2) / 0.62)', fontSize: 11 }}>
                  <Icon name="more" size={12}/>
                  <Icon name="chevron-u" size={12}/>
                </span>
              </div>

              {acc.holdings.slice(0, 4).map((h, i) => {
                const s = SYMBOLS[h.sym];
                const last = i === Math.min(3, acc.holdings.length - 1);
                return (
                  <PositionRow key={h.sym} s={s} h={h} hidden={hide} last={last}/>
                );
              })}
            </div>

            {/* Footer actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '12px 18px 16px',
                          borderTop: '.5px solid var(--separator)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                            color: 'rgb(var(--mint))', fontSize: 13.5, fontWeight: 600 }}>
                <Icon name="plus" size={14}/> Add ticker
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                            color: 'rgb(var(--mint))', fontSize: 13.5, fontWeight: 600 }}>
                View details <Icon name="arrow-r" size={13}/>
              </span>
            </div>
          </div>

          {/* Account card 2 — collapsed */}
          <div style={{ margin: '0 16px 12px', background: 'rgb(var(--surface-1))', borderRadius: 16 }}>
            <BrokerHeader name={acc2.broker.toUpperCase()+' INVESTMENTS : '+acc2.name.toUpperCase()+' -'+acc2.last4}
                          value={acc2Value} today={acc2Today} pct={acc2Pct} hidden={hide}/>
          </div>
        </div>
        <IOSTabBar active="acc"/>
      </div>
    </div>
  );
}

function BrokerHeader({ name, value, today, pct, hidden, open = false }) {
  const up = today >= 0;
  return (
    <div style={{ padding: '14px 18px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.06,
                       color: 'rgb(var(--text-3) / 0.38)', textTransform: 'uppercase' }}>
          {name}
        </span>
        <Icon name={open ? 'chevron-u' : 'chevron-d'} size={14} color="rgb(var(--text-2) / 0.62)"/>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
        <PriceText value={value} hidden={hidden} prefix="$"
                   style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em' }}/>
        <span className="tnum" style={{ fontSize: 14, color: up ? 'rgb(var(--up))' : 'rgb(var(--down))', fontWeight: 600 }}>
          {(up?'+':'')+fmtMoney(today).replace('$','$')}
        </span>
        <span className="tnum" style={{ fontSize: 13, color: up ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
          ({(up?'+':'')+pct.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}

function PositionRow({ s, h, hidden, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 4px',
      borderBottom: last ? 'none' : '.5px solid var(--separator)',
    }}>
      <div style={{ flex: '0 0 auto', minWidth: 72 }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 0.01 }}>{s.symbol}</div>
        <div style={{ fontSize: 11, color: 'rgb(var(--text-2) / 0.62)', whiteSpace: 'nowrap',
                       overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 84 }}>
          {s.name}
        </div>
        <div style={{ fontSize: 10.5, color: 'rgb(var(--text-3) / 0.38)', marginTop: 1 }} className="tnum">
          {h.qty} sh · ${fmtNum(h.avgCost)}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <Sparkline data={s.spark} up={s.up} w={86} h={36} prevClose={s.prevCloseLine} showDot/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, minWidth: 84 }}>
        <PriceText value={s.price} hidden={hidden}
                   style={{ fontSize: 15, fontWeight: 700 }}/>
        <span className="pill" style={{
          background: s.up ? 'rgb(var(--up))' : 'rgb(var(--down))',
          minWidth: 60, padding: '3px 8px', fontSize: 12,
        }}>{(s.up?'+':'')+s.pct.toFixed(2)+'%'}</span>
        <Overnight pct={s.pct * 0.22}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// iOS — Trade Sheet (over the dashboard)
// ─────────────────────────────────────────────────────────────────
function IOSTrade({ tweaks }) {
  const hide = !!tweaks.privacy;
  return (
    <div className="ios" style={{ position: 'relative' }}>
      {/* Dim'd dashboard underneath */}
      <div className="ios-screen" style={{ filter: 'brightness(0.45) blur(0.5px)' }}>
        <IOSStatusBar/>
        <div className="ios-body">
          <div style={{ padding: '6px 20px 16px' }}>
            <div style={{ fontSize: 13, color: 'rgb(var(--text-3) / 0.38)' }}>Good evening, Sam</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 2 }}>Portfolio</div>
          </div>
          <div style={{ margin: '0 16px 14px', height: 184, borderRadius: 20, background: 'rgb(var(--surface-1))' }}/>
          <div style={{ margin: '0 16px 14px', height: 140, borderRadius: 16, background: 'rgb(var(--surface-1))' }}/>
        </div>
        <IOSTabBar active="add"/>
      </div>

      {/* Modal */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.42)',
        backdropFilter: 'blur(4px)',
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: '#16161B',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: '8px 0 28px',
        boxShadow: '0 -2px 30px rgba(0,0,0,0.5)',
        maxHeight: '90%',
        overflow: 'hidden',
      }}>
        {/* Grabber */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 12px' }}>
          <span style={{ width: 38, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.22)' }}/>
        </div>

        {/* Header */}
        <div style={{ padding: '0 18px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, color: 'rgb(var(--mint))', fontWeight: 600 }}>Cancel</span>
          <span style={{ fontSize: 17, fontWeight: 700 }}>New Trade</span>
          <span style={{ fontSize: 15, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 600 }}>Save</span>
        </div>

        {/* Segmented */}
        <div style={{ padding: '12px 16px 14px' }}>
          <div style={{ display: 'flex', background: 'rgb(var(--surface-2))', borderRadius: 10, padding: 2 }}>
            {['Buy','Sell','Dividend','Split'].map((k, i) => (
              <span key={k} style={{
                flex: 1, textAlign: 'center', padding: '7px 0',
                borderRadius: 8,
                fontSize: 13, fontWeight: 600,
                background: i === 0 ? 'rgb(var(--mint))' : 'transparent',
                color: i === 0 ? '#07120D' : 'rgb(var(--text-2) / 0.62)',
              }}>{k}</span>
            ))}
          </div>
        </div>

        {/* Symbol hero */}
        <div style={{ padding: '4px 18px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <SymbolLogo sym="NVDA" size={44}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>NVDA</div>
            <div style={{ fontSize: 12, color: 'rgb(var(--text-2) / 0.62)' }}>NVIDIA Corporation · $122.18</div>
          </div>
          <PercentPill pct={-4.42} size="sm"/>
        </div>

        {/* Fields */}
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field label="Account" value="Fidelity · Individual"/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Quantity" value="25" big/>
            <Field label="Price" value="$120.50" big/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Date" value="May 15, 2026"/>
            <Field label="Fees" value="$0.00"/>
          </div>
        </div>

        {/* Total */}
        <div style={{ margin: '14px 16px 12px', padding: '12px 16px',
                      borderRadius: 14, background: 'rgb(var(--surface-2))',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'rgb(var(--text-2) / 0.62)' }}>Estimated Total</span>
          <PriceText value={25 * 120.50} prefix="$" decimals={2} hidden={hide}
                     style={{ fontSize: 22, fontWeight: 800 }}/>
        </div>

        {/* Big save */}
        <div style={{ padding: '4px 16px' }}>
          <div style={{
            background: 'rgb(var(--mint))',
            color: '#07120D',
            textAlign: 'center',
            padding: '14px 0',
            borderRadius: 14,
            fontSize: 16, fontWeight: 700, letterSpacing: 0.01,
          }}>
            Record Buy · 25 NVDA
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, big = false }) {
  return (
    <div style={{
      background: 'rgb(var(--surface-1))',
      borderRadius: 12, padding: big ? '10px 14px 12px' : '8px 14px',
    }}>
      <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.06 }}>
        {label}
      </div>
      <div className={big ? 'tnum' : ''} style={{
        fontSize: big ? 22 : 15,
        fontWeight: big ? 700 : 500,
        marginTop: big ? 2 : 1,
      }}>{value}</div>
    </div>
  );
}

Object.assign(window, {
  IOSDashboard, IOSWatchlist, IOSSymbol, IOSTrade, IOSAccount,
  IOSStatusBar, IOSTabBar, RangeChips,
});
