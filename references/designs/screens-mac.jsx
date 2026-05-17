// screens-mac.jsx — macOS screen renderings for mini-stock
// Sidebar (224px) + main (1056px). Total 1280×820.

function MacSidebar({ active = 'home' }) {
  const nav = [
    { id: 'home',  label: 'Dashboard', icon: 'grid' },
    { id: 'watch', label: 'Watchlists', icon: 'eye' },
    { id: 'trade', label: 'Record Trade', icon: 'plus' },
    { id: 'acc',   label: 'Accounts',  icon: 'wallet' },
    { id: 'news',  label: 'News',      icon: 'tag' },
  ];
  return (
    <aside className="mac-sidebar">
      <div className="brand">
        <span className="dot"/>
        mini-stock
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
          {n.id === 'watch' && <span style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)' }}>12</span>}
        </div>
      ))}

      <div className="group-label">Accounts</div>
      {ACCOUNTS.map((a) => (
        <div key={a.id} className="navitem" style={{ paddingLeft: 10, gap: 8 }}>
          <span style={{
            width: 16, height: 16, borderRadius: 4,
            background: 'linear-gradient(135deg,#5AA9FF,#B98CFF)',
            color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 800,
          }}>F</span>
          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</span>
        </div>
      ))}

      <div style={{ flex: 1 }}/>
      <div className="navitem">
        <Icon name="user" size={16}/>
        <span style={{ flex: 1 }}>Sam Chen</span>
        <Icon name="more" size={14}/>
      </div>
    </aside>
  );
}

function MacTitleBar() {
  return (
    <div className="mac-titlebar">
      <div className="lights">
        <i style={{ background: '#FF5F57' }}/>
        <i style={{ background: '#FEBC2E' }}/>
        <i style={{ background: '#28C840' }}/>
      </div>
    </div>
  );
}

function MacTopBar({ title, eyebrow, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      marginBottom: 18,
    }}>
      <div>
        {eyebrow && <div className="h-eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.022em', lineHeight: 1.05 }}>
          {title}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {right}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// macOS — Dashboard
// ─────────────────────────────────────────────────────────────────
function MacDashboard({ tweaks }) {
  const P = PORTFOLIO;
  const hide = !!tweaks.privacy;

  return (
    <div className="mac">
      <MacTitleBar/>
      <MacSidebar active="home"/>
      <main className="mac-main">
        <MacTopBar
          eyebrow={`Tuesday · May 15 · ${ACCOUNTS.length} accounts`}
          title="Good evening, Sam"
          right={
            <>
              <span className="iconbtn"><Icon name={hide ? 'eye-off' : 'eye'} size={16}/></span>
              <span className="iconbtn"><Icon name="refresh" size={16}/></span>
              <span className="iconbtn"><Icon name="bell" size={16}/></span>
            </>
          }
        />

        {/* Hero row: net worth + chart  |  allocation */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Net worth card */}
          <div style={{
            background: 'rgb(var(--surface-1))',
            borderRadius: 18, padding: '18px 22px 14px',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="h-eyebrow">Net Worth · All Accounts</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6 }}>
                  <PriceText value={P.netWorth} hidden={hide} prefix="$"
                             style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-0.025em' }}/>
                  <PercentPill pct={P.todayPct} size="sm"/>
                </div>
                <div style={{ display: 'flex', gap: 18, marginTop: 6, fontSize: 13 }}>
                  <span>
                    <span style={{ color: 'rgb(var(--text-3) / 0.38)' }}>Today  </span>
                    <span className="tnum" style={{
                      color: P.todayPL >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))', fontWeight: 600
                    }}>
                      {(P.todayPL>=0?'+':'')+fmtMoney(P.todayPL).replace('$','$')}
                    </span>
                  </span>
                  <span>
                    <span style={{ color: 'rgb(var(--text-3) / 0.38)' }}>Total  </span>
                    <span className="tnum" style={{ color: 'rgb(var(--up))', fontWeight: 600 }}>
                      +{fmtMoney(P.totalPL).replace('$','$')} ({P.totalPct.toFixed(2)}%)
                    </span>
                  </span>
                  <span>
                    <span style={{ color: 'rgb(var(--text-3) / 0.38)' }}>Realized YTD  </span>
                    <span className="tnum" style={{ color: 'rgb(var(--text))', fontWeight: 600 }}>
                      +{fmtMoney(P.realizedYTD).replace('$','$')}
                    </span>
                  </span>
                </div>
              </div>
              <RangeChipsRow active="6M" sizes={['1D','1W','1M','3M','6M','YTD','1Y','5Y','ALL']}/>
            </div>

            <div style={{ marginTop: 10, marginLeft: -6, marginRight: -6 }}>
              <AreaChart data={P.history6M} up={true} w={528} h={170} gridY={3} mode="area" showPriceTicks={false}
                         pad={{ l: 0, r: 0, t: 12, b: 18 }}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', padding: '0 0' }}>
              {['Dec','Jan','Feb','Mar','Apr','May'].map(m => <span key={m}>{m}</span>)}
            </div>
          </div>

          {/* Allocation */}
          <div style={{ background: 'rgb(var(--surface-1))', borderRadius: 18, padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="h-eyebrow">Allocation</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgb(var(--text-2) / 0.62)' }}>
                By sector <Icon name="chevron-d" size={12}/>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 6 }}>
              <AllocationDonut data={P.allocation} size={134} thickness={16}
                center={
                  <div>
                    <div style={{ fontSize: 10, color: 'rgb(var(--text-3) / 0.38)', letterSpacing: 0.06, textTransform: 'uppercase' }}>Holdings</div>
                    <div className="tnum" style={{ fontSize: 17, fontWeight: 800 }}>${fmtCompact(P.netWorth)}</div>
                  </div>
                }/>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {P.allocation.slice(0, 6).map((a, i) => {
                  const colors = ['#6BE8B8','#5AA9FF','#F2B45C','#B98CFF','#FF8AAB','#7BD6E0'];
                  return (
                    <div key={a.sector} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: colors[i] }}/>
                      <span style={{ flex: 1, color: 'rgb(var(--text-2) / 0.62)' }}>{a.sector}</span>
                      <span className="tnum" style={{ color: 'rgb(var(--text))', fontWeight: 600 }}>{a.pct.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Movers + Recent activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16 }}>
          {/* Movers grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <div className="h-section">Today's Movers</div>
              <span style={{ fontSize: 12, color: 'rgb(var(--text-2) / 0.62)' }}>From your holdings</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {P.movers.slice(0, 4).map((m) => (
                <div key={m.account.id + m.sym} style={{
                  background: 'rgb(var(--surface-1))',
                  borderRadius: 12, padding: '12px 14px 12px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>{m.sym}</span>
                    <PercentPill pct={m.symbol.pct} size="sm"/>
                  </div>
                  <div style={{ margin: '6px -4px' }}>
                    <Sparkline data={m.symbol.spark} up={m.symbol.up} w={134} h={32}/>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 2 }}>
                    <span className="tnum" style={{ fontSize: 14, fontWeight: 700 }}>${fmtNum(m.symbol.price)}</span>
                    <span className="tnum" style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)' }}>{m.qty} sh</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Compact positions table */}
            <div style={{ marginTop: 18, background: 'rgb(var(--surface-1))', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 0.8fr 1fr 1fr 1fr 1fr',
                padding: '10px 16px',
                fontSize: 10.5, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 600,
                letterSpacing: 0.06, textTransform: 'uppercase',
                borderBottom: '.5px solid var(--separator)',
              }}>
                <span>Holding</span><span style={{ textAlign:'right' }}>Qty</span>
                <span style={{ textAlign:'right' }}>Price</span><span style={{ textAlign:'right' }}>Mkt Value</span>
                <span style={{ textAlign:'right' }}>Today</span><span style={{ textAlign:'right' }}>Total P/L</span>
              </div>
              {P.positions.slice(0, 5).map((p, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 0.8fr 1fr 1fr 1fr 1fr',
                  padding: '10px 16px',
                  alignItems: 'center',
                  borderBottom: i === 4 ? 'none' : '.5px solid var(--separator)',
                  fontSize: 13.5,
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <SymbolLogo sym={p.sym} size={26}/>
                    <span>
                      <div style={{ fontWeight: 700 }}>{p.sym}</div>
                      <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)' }}>{p.symbol.name}</div>
                    </span>
                  </span>
                  <span className="tnum" style={{ textAlign: 'right' }}>{p.qty}</span>
                  <span className="tnum" style={{ textAlign: 'right' }}>${fmtNum(p.symbol.price)}</span>
                  <span className="tnum" style={{ textAlign: 'right', fontWeight: 700 }}>
                    {hide ? <span className="masked">0000</span> : '$' + fmtNum(p.marketValue, 0)}
                  </span>
                  <span className="tnum" style={{ textAlign: 'right',
                                                    color: p.todayPL >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                    {(p.todayPL>=0?'+':'')+fmtMoney(p.todayPL,{sign:false}).replace('$','$')}
                  </span>
                  <span className="tnum" style={{ textAlign: 'right',
                                                    color: p.unrealized >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                    {(p.unrealized>=0?'+':'')+p.unrealizedPct.toFixed(1)+'%'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — recent activity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <div className="h-section">Recent Activity</div>
              <span style={{ fontSize: 12, color: 'rgb(var(--mint))', fontWeight: 600 }}>View all</span>
            </div>
            <div style={{ background: 'rgb(var(--surface-1))', borderRadius: 14, padding: '6px 14px' }}>
              {TRANSACTIONS.slice(0, 5).map((tx, i) => (
                <div key={tx.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 0',
                  borderBottom: i === 4 ? 'none' : '.5px solid var(--separator)',
                }}>
                  <SymbolLogo sym={tx.sym} size={28}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <KindPill kind={tx.kind}/>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{tx.sym}</span>
                      <span style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', marginLeft: 'auto' }} className="tnum">
                        {tx.qty}{tx.kind==='DIV' ? '' : ' sh'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', marginTop: 2,
                                  display: 'flex', justifyContent: 'space-between' }}>
                      <span>{tx.when} · {tx.account}</span>
                      <span className="tnum">${fmtNum(tx.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, background: 'rgb(var(--surface-1))', borderRadius: 14, padding: '14px 16px' }}>
              <div className="h-eyebrow" style={{ marginBottom: 6 }}>Dividends · YTD</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <PriceText value={P.divYTD} prefix="$" hidden={hide}
                           style={{ fontSize: 26, fontWeight: 800 }}/>
                <span style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.38)' }}>across 14 payments</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'flex-end', height: 36 }}>
                {[12, 18, 14, 21, 16, 24, 19, 22, 28, 26, 24, 30].map((h, i) => (
                  <span key={i} style={{
                    flex: 1, height: h, background: 'var(--mint-soft)',
                    borderRadius: 3, borderTop: '2px solid rgb(var(--mint))',
                  }}/>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function RangeChipsRow({ active, sizes }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: 'rgb(var(--surface-2))', padding: 3, borderRadius: 10 }}>
      {sizes.map((r) => (
        <span key={r} style={{
          padding: '5px 9px', borderRadius: 7,
          fontSize: 11.5, fontWeight: 600,
          color: r === active ? '#07120D' : 'rgb(var(--text-2) / 0.62)',
          background: r === active ? 'rgb(var(--mint))' : 'transparent',
        }}>{r}</span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// macOS — Watchlist
// ─────────────────────────────────────────────────────────────────
function MacWatchlist({ tweaks }) {
  const hide = !!tweaks.privacy;
  const sortMode = tweaks.sortMode || 'Manual';
  const layout = tweaks.rowLayout || 'apple';
  const sorted = [...WATCHLIST];
  if (sortMode === 'Percentage Change') sorted.sort((a, b) => b.pct - a.pct);
  else if (sortMode === 'Price Change') sorted.sort((a, b) => b.change - a.change);
  else if (sortMode === 'Symbol') sorted.sort((a, b) => a.symbol.localeCompare(b.symbol));
  else if (sortMode === 'Market Cap') sorted.sort((a, b) => b.price - a.price);

  return (
    <div className="mac">
      <MacTitleBar/>
      <MacSidebar active="watch"/>
      <main className="mac-main">
        <MacTopBar
          eyebrow="May 15, 2026 · Market Closed"
          title="Watchlists"
          right={
            <>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 9,
                background: 'rgb(var(--surface-2))', fontSize: 13, color: 'rgb(var(--text-2) / 0.62)',
              }}>
                <Icon name="plus" size={14}/> Add symbol
              </span>
              <span className="iconbtn"><Icon name="more" size={16}/></span>
            </>
          }
        />

        {/* List chips */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14, padding: '4px 0',
                      borderBottom: '.5px solid var(--separator)' }}>
          {['My Symbols','Mega Cap Tech','Semis','ETFs','Dividends'].map((c, i) => (
            <span key={c} style={{
              padding: '8px 12px', fontSize: 13.5, fontWeight: 600,
              color: i === 0 ? 'rgb(var(--text))' : 'rgb(var(--text-3) / 0.38)',
              borderBottom: i === 0 ? '2px solid rgb(var(--mint))' : '2px solid transparent',
              marginBottom: -1,
            }}>
              {c} <span style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', marginLeft: 4 }}>
                {i === 0 ? WATCHLIST.length : i === 1 ? 6 : i === 2 ? 4 : i === 3 ? 5 : 7}
              </span>
            </span>
          ))}
        </div>

        {/* Sort + filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 13 }}>
          <span style={{ color: 'rgb(var(--text-3) / 0.38)' }}>Sort by</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 7,
            background: 'rgb(var(--surface-2))', color: 'rgb(var(--text))',
            fontWeight: 600,
          }}>
            {sortMode} <Icon name="chevron-d" size={12}/>
          </span>
          <span style={{ marginLeft: 'auto', color: 'rgb(var(--text-3) / 0.38)' }}>{sorted.length} symbols · Updated 15:35 ET</span>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.4fr 0.9fr 1fr 1fr 1fr 1fr',
          padding: '8px 16px',
          fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 600,
          letterSpacing: 0.06, textTransform: 'uppercase',
          borderBottom: '.5px solid var(--separator)',
        }}>
          <span>Symbol</span>
          <span>Intraday</span>
          <span style={{ textAlign: 'right' }}>Last</span>
          <span style={{ textAlign: 'right' }}>Change</span>
          <span style={{ textAlign: 'right' }}>% Change</span>
          <span style={{ textAlign: 'right' }}>Mkt Cap</span>
          {layout === 'yahoo' ? (
            <span style={{ textAlign: 'right' }}>O/N %</span>
          ) : (
            <span style={{ textAlign: 'right' }}>52W Range</span>
          )}
        </div>

        {/* Rows */}
        <div>
          {sorted.slice(0, 11).map((s, i) => (
            <div key={s.symbol} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.4fr 0.9fr 1fr 1fr 1fr 1fr',
              padding: '11px 16px',
              alignItems: 'center',
              borderBottom: '.5px solid var(--separator)',
              fontSize: 14,
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <SymbolLogo sym={s.symbol} size={30}/>
                <span>
                  <div style={{ fontWeight: 700, letterSpacing: 0.01 }}>{s.symbol}</div>
                  <div style={{ fontSize: 11.5, color: 'rgb(var(--text-3) / 0.38)' }}>{s.name}</div>
                </span>
              </span>
              <span>
                <Sparkline data={s.spark} up={s.up} w={140} h={36} prevClose={s.prevCloseLine}/>
              </span>
              <span className="tnum" style={{ textAlign: 'right', fontWeight: 700 }}>
                {hide ? <span className="masked">000.00</span> : fmtNum(s.price)}
              </span>
              <span className="tnum" style={{ textAlign: 'right',
                                                color: s.up ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                {(s.up?'+':'')+s.change.toFixed(2)}
              </span>
              <span style={{ textAlign: 'right' }}>
                <PercentPill pct={s.pct} size="sm"/>
              </span>
              <span className="tnum" style={{ textAlign: 'right', color: 'rgb(var(--text-2) / 0.62)' }}>
                ${fmtCompact(s.price * 12.4e9)}
              </span>
              {layout === 'yahoo' ? (
                <span className="tnum" style={{ textAlign: 'right',
                                                  color: s.up ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                  {(s.up?'+':'-')+(Math.abs(s.pct)*0.18).toFixed(2)+'%'}
                </span>
              ) : (
                <span style={{ textAlign: 'right',
                              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                  <span className="tnum" style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)' }}>{fmtNum(s.price*0.74)}</span>
                  <span style={{ position: 'relative', width: 60, height: 4, borderRadius: 2, background: 'rgb(var(--surface-2))' }}>
                    <span style={{ position: 'absolute', top: -2, left: 30, width: 2, height: 8, borderRadius: 1, background: 'rgb(var(--mint))' }}/>
                  </span>
                  <span className="tnum" style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)' }}>{fmtNum(s.price*1.18)}</span>
                </span>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// macOS — Symbol detail
// ─────────────────────────────────────────────────────────────────
function MacSymbol({ tweaks, sym = 'MSFT' }) {
  const s = SYMBOLS[sym];
  const hist = symbolHistory(sym);
  const cnd = symbolCandles(sym);
  const mode = tweaks.chartStyle || 'area';
  const hide = !!tweaks.privacy;

  let position = null;
  for (const acc of ACCOUNTS) {
    const h = acc.holdings.find((x) => x.sym === sym);
    if (h) { position = { ...h, account: acc }; break; }
  }
  const mv = position ? position.qty * s.price : 0;
  const pCost = position ? position.qty * position.avgCost : 0;
  const pUn = mv - pCost;

  return (
    <div className="mac">
      <MacTitleBar/>
      <MacSidebar active="watch"/>
      <main className="mac-main">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgb(var(--text-3) / 0.38)', marginBottom: 6 }}>
          <span>Watchlists</span>
          <Icon name="chevron-r" size={11}/>
          <span>My Symbols</span>
          <Icon name="chevron-r" size={11}/>
          <span style={{ color: 'rgb(var(--text-2) / 0.62)' }}>{sym}</span>
        </div>

        {/* Hero row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <SymbolLogo sym={sym} size={56}/>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>{sym}</span>
              <span style={{ fontSize: 15, color: 'rgb(var(--text-2) / 0.62)' }}>{s.name}</span>
              <span style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', textTransform: 'uppercase', letterSpacing: 0.08 }}>
                {s.exch} · USD · Market Closed
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 6 }}>
              <PriceText value={s.price} hidden={hide} prefix="$"
                         style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.025em' }}/>
              <span className="tnum" style={{ fontSize: 17, fontWeight: 600,
                                                color: s.up ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                {(s.up?'+':'')+s.change.toFixed(2)} ({(s.up?'+':'')+s.pct.toFixed(2)}%)
              </span>
              <span style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.38)' }}>Today</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{
              padding: '8px 14px', borderRadius: 9,
              background: 'rgb(var(--surface-2))', color: 'rgb(var(--text))',
              fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <Icon name="star" size={14}/> Watchlist
            </span>
            <span style={{
              padding: '8px 14px', borderRadius: 9,
              background: 'rgb(var(--mint))', color: '#07120D',
              fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <Icon name="plus" size={14} color="#07120D" strokeWidth={2.5}/> Record Trade
            </span>
          </div>
        </div>

        {/* Chart + side panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 16 }}>
          {/* Chart */}
          <div style={{ background: 'rgb(var(--surface-1))', borderRadius: 16, padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <RangeChipsRow active="3M" sizes={['1D','1W','1M','3M','6M','YTD','1Y','2Y','5Y','ALL']}/>
              <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgb(var(--surface-2))', borderRadius: 8 }}>
                {[['area','Area'],['line','Line'],['candle','Candle']].map(([k,l]) => (
                  <span key={k} style={{
                    padding: '5px 9px', borderRadius: 6,
                    fontSize: 11.5, fontWeight: 600,
                    background: mode === k ? 'rgb(var(--surface-3))' : 'transparent',
                    color: mode === k ? 'rgb(var(--text))' : 'rgb(var(--text-3) / 0.38)',
                  }}>{l}</span>
                ))}
              </div>
            </div>
            <PriceChart data={hist} candleData={cnd} mode={mode} up={s.up} w={560} h={250} gridY={4}
                        padInner={{ l: 0, r: 36, t: 16, b: 20 }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', padding: '0 0' }}>
              {['Feb 15','Mar 1','Mar 15','Apr 1','Apr 15','May 1','May 15'].map(m => <span key={m}>{m}</span>)}
            </div>

            {/* Key stats grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
              marginTop: 18, paddingTop: 14,
              borderTop: '.5px solid var(--separator)',
            }}>
              {[
                ['Open',    fmtNum(s.prevClose)],
                ['High',    fmtNum(s.price * 1.012)],
                ['Low',     fmtNum(s.price * 0.978)],
                ['Volume',  '50.24M'],
                ['Mkt Cap', '$3.13T'],
                ['P/E TTM', '32.4'],
                ['Yield',   '0.72%'],
                ['Beta',    '0.91'],
                ['52w H',   fmtNum(s.price * 1.18)],
                ['52w L',   fmtNum(s.price * 0.74)],
                ['Avg Vol', '33.8M'],
                ['EPS',     '13.05'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '8px 4px' }}>
                  <div style={{ fontSize: 10.5, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 600,
                                letterSpacing: 0.05, textTransform: 'uppercase' }}>{k}</div>
                  <div className="tnum" style={{ fontSize: 14.5, fontWeight: 700, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Side panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* My position */}
            <div style={{ background: 'rgb(var(--surface-1))', borderRadius: 16, padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div className="h-eyebrow">My Position</div>
                <span style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)' }}>{position?.account.broker} · {position?.account.name}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)' }}>Market Value</div>
                  <PriceText value={mv} prefix="$" hidden={hide}
                             style={{ fontSize: 22, fontWeight: 800 }}/>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)' }}>Unrealized P/L</div>
                  <div className="tnum" style={{
                    fontSize: 22, fontWeight: 800,
                    color: pUn >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))',
                  }}>
                    {(pUn>=0?'+':'')+fmtMoney(pUn).replace('$','$')}
                  </div>
                  <span className="tnum" style={{ fontSize: 12,
                                                    color: pUn >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                    {(pUn>=0?'+':'')+((pUn/pCost)*100).toFixed(2)+'%'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
                            marginTop: 12, paddingTop: 12, borderTop: '.5px solid var(--separator)' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)' }}>Quantity</div>
                  <div className="tnum" style={{ fontSize: 14, fontWeight: 700 }}>{position?.qty}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)' }}>Avg Cost</div>
                  <div className="tnum" style={{ fontSize: 14, fontWeight: 700 }}>${fmtNum(position?.avgCost)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)' }}>% of Port</div>
                  <div className="tnum" style={{ fontSize: 14, fontWeight: 700 }}>
                    {((mv / PORTFOLIO.netWorth) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Dividends */}
            <div style={{ background: 'rgb(var(--surface-1))', borderRadius: 16, padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div className="h-eyebrow">Dividend History</div>
                <span style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)' }}>Quarterly · 8 periods</span>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 76, marginTop: 10 }}>
                {(DIVIDENDS[sym] || DIVIDENDS.MSFT).map((d, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{
                      width: '100%', height: d * 70,
                      background: 'var(--mint-soft)',
                      borderTop: '2px solid rgb(var(--mint))',
                      borderRadius: '3px 3px 0 0',
                    }}/>
                    <span style={{ fontSize: 9, color: 'rgb(var(--text-3) / 0.38)' }}>Q{(i%4)+1}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                            marginTop: 10, paddingTop: 10, borderTop: '.5px solid var(--separator)',
                            fontSize: 12 }}>
                <span><span style={{ color: 'rgb(var(--text-3) / 0.38)' }}>Annual  </span><span className="tnum" style={{ fontWeight: 700 }}>$3.32</span></span>
                <span><span style={{ color: 'rgb(var(--text-3) / 0.38)' }}>Yield  </span><span className="tnum" style={{ fontWeight: 700 }}>0.72%</span></span>
                <span><span style={{ color: 'rgb(var(--text-3) / 0.38)' }}>Next Ex  </span><span className="tnum" style={{ fontWeight: 700 }}>Aug 14</span></span>
              </div>
            </div>

            {/* About */}
            <div style={{ background: 'rgb(var(--surface-1))', borderRadius: 16, padding: '14px 18px' }}>
              <div className="h-eyebrow" style={{ marginBottom: 8 }}>About</div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: 'rgb(var(--text-2) / 0.62)' }}>
                {s.name} develops, licenses, and supports software, services, devices and solutions worldwide.
                CEO Satya Nadella · Redmond, WA · 228k employees.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// macOS — Accounts detail (Yahoo-style broker sections, denser)
// ─────────────────────────────────────────────────────────────────
function MacAccount({ tweaks }) {
  const hide = !!tweaks.privacy;
  const totalMV = PORTFOLIO.netWorth;
  const totalToday = PORTFOLIO.todayPL;
  return (
    <div className="mac" style={{ height: 1180 }}>
      <MacTitleBar/>
      <MacSidebar active="acc"/>
      <main className="mac-main">
        <MacTopBar
          eyebrow="Linked Accounts"
          title="Accounts"
          right={
            <>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 9,
                background: 'rgb(var(--surface-2))', fontSize: 13, color: 'rgb(var(--text-2) / 0.62)',
              }}>
                <Icon name="briefcase" size={14}/> Link broker
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 9,
                background: 'rgb(var(--mint))', color: '#07120D', fontSize: 13, fontWeight: 700,
              }}>
                <Icon name="plus" size={14} color="#07120D" strokeWidth={2.5}/> New account
              </span>
            </>
          }
        />

        {/* Summary strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            ['Total Value',     hide ? '••••••' : '$'+fmtNum(totalMV, 2)],
            ['Today',           (totalToday>=0?'+':'')+fmtMoney(totalToday).replace('$','$')+' ('+PORTFOLIO.todayPct.toFixed(2)+'%)', totalToday>=0],
            ['Total P/L',       '+'+fmtMoney(PORTFOLIO.totalPL).replace('$','$')+' ('+PORTFOLIO.totalPct.toFixed(2)+'%)', true],
            ['Dividends YTD',   '+$'+fmtNum(PORTFOLIO.divYTD), true],
          ].map(([k,v,up], i) => (
            <div key={k} style={{ background: 'rgb(var(--surface-1))', borderRadius: 14, padding: '12px 16px' }}>
              <div style={{ fontSize: 10.5, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 600,
                            letterSpacing: 0.06, textTransform: 'uppercase' }}>{k}</div>
              <div className="tnum" style={{
                fontSize: i === 0 ? 22 : 17,
                fontWeight: 800,
                marginTop: 4,
                color: i > 0 && up !== undefined ? (up ? 'rgb(var(--up))' : 'rgb(var(--down))') : 'rgb(var(--text))',
              }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Broker sections */}
        {ACCOUNTS.map((acc, idx) => {
          const accValue = acc.holdings.reduce((s, h) => s + h.qty * SYMBOLS[h.sym].price, 0);
          const accToday = acc.holdings.reduce((s, h) => s + h.qty * SYMBOLS[h.sym].change, 0);
          const accCost  = acc.holdings.reduce((s, h) => s + h.qty * h.avgCost, 0);
          const accPct   = (accToday / (accValue - accToday)) * 100;

          return (
            <div key={acc.id} style={{ marginBottom: 12, background: 'rgb(var(--surface-1))', borderRadius: 16, overflow: 'hidden' }}>
              {/* Broker header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px',
                borderBottom: idx === 0 ? '.5px solid var(--separator)' : 'none',
              }}>
                <span style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: 'linear-gradient(135deg,#5AA9FF,#B98CFF)',
                  color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800,
                }}>F</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 700,
                                letterSpacing: 0.06, textTransform: 'uppercase' }}>
                    {acc.broker} Investments
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 2 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>{acc.name}</span>
                    <span style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.38)' }} className="tnum">··{acc.last4}</span>
                    <span style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.38)' }}>· {acc.holdings.length} holdings</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <PriceText value={accValue} hidden={hide} prefix="$"
                             style={{ fontSize: 22, fontWeight: 800 }}/>
                  <div className="tnum" style={{ fontSize: 12,
                                                  color: accToday>=0 ? 'rgb(var(--up))' : 'rgb(var(--down))',
                                                  fontWeight: 600, marginTop: 2 }}>
                    {(accToday>=0?'+':'')+fmtMoney(accToday).replace('$','$')} ({(accPct>=0?'+':'')+accPct.toFixed(2)}%)
                  </div>
                </div>
                <span className="iconbtn" style={{ marginLeft: 4 }}><Icon name="more" size={14}/></span>
              </div>

              {/* Column header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.4fr 1fr 1fr 1.1fr 1.1fr 0.8fr',
                padding: '8px 18px',
                fontSize: 10.5, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 600,
                letterSpacing: 0.06, textTransform: 'uppercase',
              }}>
                <span>Symbol</span>
                <span>Intraday</span>
                <span style={{ textAlign: 'right' }}>Last</span>
                <span style={{ textAlign: 'right' }}>Today %</span>
                <span style={{ textAlign: 'right' }}>O/N %</span>
                <span style={{ textAlign: 'right' }}>Mkt Value</span>
                <span style={{ textAlign: 'right' }}>P/L</span>
              </div>

              {acc.holdings.map((h, i) => {
                const s = SYMBOLS[h.sym];
                const mv = h.qty * s.price;
                const pl = mv - h.qty * h.avgCost;
                const plPct = (pl / (h.qty * h.avgCost)) * 100;
                return (
                  <div key={h.sym} style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.4fr 1fr 1fr 1.1fr 1.1fr 0.8fr',
                    padding: '10px 18px',
                    alignItems: 'center',
                    borderTop: '.5px solid var(--separator)',
                    fontSize: 13.5,
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <SymbolLogo sym={h.sym} size={26}/>
                      <span>
                        <div style={{ fontWeight: 700 }}>{h.sym}</div>
                        <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)' }}>{s.name}</div>
                      </span>
                    </span>
                    <span><Sparkline data={s.spark} up={s.up} w={130} h={32} prevClose={s.prevCloseLine}/></span>
                    <span className="tnum" style={{ textAlign: 'right', fontWeight: 700 }}>
                      {hide ? <span className="masked">000.00</span> : fmtNum(s.price)}
                    </span>
                    <span style={{ textAlign: 'right' }}>
                      <PercentPill pct={s.pct} size="sm"/>
                    </span>
                    <span style={{ textAlign: 'right', display: 'inline-flex',
                                    justifyContent: 'flex-end', alignItems: 'center', gap: 6, width: '100%' }}>
                      <Overnight pct={s.pct * 0.22}/>
                    </span>
                    <span className="tnum" style={{ textAlign: 'right', fontWeight: 700 }}>
                      {hide ? <span className="masked">0000</span> : '$'+fmtNum(mv, 0)}
                    </span>
                    <span className="tnum" style={{ textAlign: 'right',
                                                      color: pl>=0 ? 'rgb(var(--up))' : 'rgb(var(--down))', fontWeight: 600 }}>
                      {(pl>=0?'+':'')+plPct.toFixed(1)+'%'}
                    </span>
                  </div>
                );
              })}

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between',
                            padding: '10px 18px',
                            borderTop: '.5px solid var(--separator)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                              color: 'rgb(var(--mint))', fontSize: 12.5, fontWeight: 600 }}>
                  <Icon name="plus" size={13}/> Add ticker to {acc.name}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                              color: 'rgb(var(--text-2) / 0.62)', fontSize: 12 }}>
                  Cost basis ${fmtNum(accCost, 0)} · {((accValue / totalMV) * 100).toFixed(1)}% of portfolio
                </span>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// macOS — Trade modal
// ─────────────────────────────────────────────────────────────────
function MacTrade({ tweaks }) {
  const hide = !!tweaks.privacy;
  return (
    <div className="mac" style={{ position: 'relative' }}>
      <MacTitleBar/>
      <MacSidebar active="trade"/>
      <main className="mac-main" style={{ filter: 'brightness(0.5) blur(1px)' }}>
        <MacTopBar eyebrow="Tuesday · May 15" title="Good evening, Sam" right={<span/>}/>
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16 }}>
          <div style={{ height: 240, background: 'rgb(var(--surface-1))', borderRadius: 18 }}/>
          <div style={{ height: 240, background: 'rgb(var(--surface-1))', borderRadius: 18 }}/>
        </div>
      </main>

      {/* dim */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}/>

      {/* modal */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 540,
        background: '#16161B',
        borderRadius: 18,
        boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 .5px rgba(255,255,255,0.08)',
        padding: '8px 0 16px',
        overflow: 'hidden',
      }}>
        {/* title bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 16px 14px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 14, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 500,
          }}>
            <Icon name="plus" size={14}/> New Trade
          </span>
          <span style={{
            width: 24, height: 24, borderRadius: 999,
            background: 'rgb(var(--surface-2))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="x" size={13}/>
          </span>
        </div>

        {/* segmented */}
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{ display: 'flex', background: 'rgb(var(--surface-2))', borderRadius: 10, padding: 3 }}>
            {['Buy','Sell','Dividend','Split','Cash'].map((k, i) => (
              <span key={k} style={{
                flex: 1, textAlign: 'center', padding: '7px 0',
                borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: i === 0 ? 'rgb(var(--mint))' : 'transparent',
                color: i === 0 ? '#07120D' : 'rgb(var(--text-2) / 0.62)',
              }}>{k}</span>
            ))}
          </div>
        </div>

        {/* Symbol */}
        <div style={{ padding: '4px 16px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <SymbolLogo sym="NVDA" size={48}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>NVDA</div>
            <div style={{ fontSize: 12, color: 'rgb(var(--text-2) / 0.62)' }}>NVIDIA Corporation · $122.18 · NASDAQ</div>
          </div>
          <PercentPill pct={-4.42} size="sm"/>
        </div>

        {/* Fields */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field2 label="Account" value="Fidelity · Individual ··2645" caret/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field2 label="Quantity" value="25" big/>
            <Field2 label="Price per share" value="$120.50" big/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field2 label="Date" value="May 15, 2026 · 14:32" caret/>
            <Field2 label="Fees" value="$0.00"/>
          </div>
          <Field2 label="Note (optional)" value="Adding on the -4% dip" muted/>
        </div>

        {/* Total */}
        <div style={{
          margin: '14px 16px 10px',
          padding: '12px 18px',
          background: 'rgb(var(--surface-2))',
          borderRadius: 12,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 600, letterSpacing: 0.05, textTransform: 'uppercase' }}>Estimated Total</div>
            <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', marginTop: 2 }}>25 × $120.50 + $0.00 fees</div>
          </div>
          <PriceText value={25 * 120.50} prefix="$" hidden={hide}
                     style={{ fontSize: 26, fontWeight: 800 }}/>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, padding: '6px 16px 0' }}>
          <span style={{
            flex: 1, textAlign: 'center', padding: '12px 0',
            borderRadius: 12, background: 'rgb(var(--surface-2))',
            color: 'rgb(var(--text))', fontSize: 14, fontWeight: 600,
          }}>Cancel</span>
          <span style={{
            flex: 2, textAlign: 'center', padding: '12px 0',
            borderRadius: 12,
            background: 'rgb(var(--mint))', color: '#07120D',
            fontSize: 14, fontWeight: 700, letterSpacing: 0.01,
          }}>Record Buy · 25 NVDA · ${fmtNum(25*120.5)}</span>
        </div>
      </div>
    </div>
  );
}

function Field2({ label, value, big = false, caret = false, muted = false }) {
  return (
    <div style={{
      background: 'rgb(var(--surface-1))',
      borderRadius: 12, padding: big ? '10px 14px 12px' : '9px 14px',
      display: 'flex', alignItems: big ? 'flex-end' : 'center', justifyContent: 'space-between',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: 0.05 }}>{label}</div>
        <div className={big ? 'tnum' : ''} style={{
          fontSize: big ? 22 : 14,
          fontWeight: big ? 800 : 500,
          marginTop: big ? 2 : 1,
          color: muted ? 'rgb(var(--text-2) / 0.62)' : 'rgb(var(--text))',
        }}>{value}</div>
      </div>
      {caret && <Icon name="chevron-d" size={14} color="rgb(var(--text-3) / 0.38)"/>}
    </div>
  );
}

Object.assign(window, {
  MacDashboard, MacWatchlist, MacSymbol, MacTrade, MacAccount,
  MacSidebar, MacTitleBar, MacTopBar,
});
