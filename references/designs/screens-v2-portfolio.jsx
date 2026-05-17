// screens-v2-portfolio.jsx — Portfolio + Symbol detail v2 (Fidelity-style)
// Portfolio: 4 sub-tabs (Summary · Positions · Activity · Balances).
// Default landed view = Positions, matches IMG_5096 (Fidelity reference).
// Symbol v2 = Overview with sticky bottom Trade CTA per IMG_5097.

// ─────────────────────────────────────────────────────────────────
// Shared sub-tab bar — used by Portfolio + Symbol detail v2
// ─────────────────────────────────────────────────────────────────
function SubTabs({ tabs, active, accent = SEC.portfolio, padX = 16 }) {
  return (
    <div style={{
      display: 'flex', gap: 18, padding: `2px ${padX}px 0`,
      borderBottom: '.5px solid var(--separator)',
    }}>
      {tabs.map((t) => {
        const isActive = t === active;
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
                height: 2, borderRadius: 2, background: accent,
              }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Segmented Open/Closed/Options pill row (Fidelity-style)
function SegmentedPill({ items, active }) {
  return (
    <div style={{
      margin: '12px 16px',
      background: 'rgb(var(--surface-2))',
      borderRadius: 11,
      padding: 3,
      display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`,
      gap: 2,
    }}>
      {items.map((k) => {
        const isActive = k === active;
        return (
          <span key={k} style={{
            textAlign: 'center', padding: '8px 0',
            borderRadius: 9,
            fontSize: 13, fontWeight: isActive ? 700 : 500,
            background: isActive ? 'rgb(var(--surface-1))' : 'transparent',
            color: isActive ? 'rgb(var(--text))' : 'rgb(var(--text-2) / 0.62)',
            boxShadow: isActive ? '0 1px 0 rgba(255,255,255,0.06) inset, 0 1px 4px rgba(0,0,0,0.2)' : 'none',
          }}>{k}</span>
        );
      })}
    </div>
  );
}

// Account selector dropdown (full-width)
function AccountSelector({ label = 'All accounts', count }) {
  return (
    <div style={{
      margin: '14px 16px 8px',
      padding: '13px 16px',
      borderRadius: 999,
      background: 'rgb(var(--surface-1))',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontSize: 15, fontWeight: 600,
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <Icon name="briefcase" size={15} color="rgb(var(--text-2) / 0.62)"/> {label}
        {count != null && (
          <span style={{
            fontSize: 11, padding: '2px 7px', borderRadius: 999,
            background: 'rgb(var(--surface-2))', color: 'rgb(var(--text-3) / 0.38)', fontWeight: 600,
          }}>{count}</span>
        )}
      </span>
      <Icon name="chevron-d" size={14} color="rgb(var(--text-2) / 0.62)"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// iOS PORTFOLIO — Positions view (Fidelity-style, dark)
// ─────────────────────────────────────────────────────────────────
function IOSPortfolio({ tweaks, height = 1280 }) {
  const hide = !!tweaks.privacy;

  // Group positions by account; each block has a header row + symbol rows
  const groups = ACCOUNTS.map((acc) => {
    const positions = acc.holdings.map((h) => {
      const s = SYMBOLS[h.sym];
      const mv = h.qty * s.price;
      const cost = h.qty * h.avgCost;
      return {
        ...h, account: acc, symbol: s,
        mv, cost,
        todayDollar: h.qty * s.change,
        todayPct: s.pct,
      };
    });
    const value = positions.reduce((sum, p) => sum + p.mv, 0);
    const today = positions.reduce((sum, p) => sum + p.todayDollar, 0);
    return { acc, positions, value, today, color: ACCT_COLORS[acc.id] || '#8AA0FF' };
  });

  const totalItems = groups.reduce((s, g) => s + g.positions.length, 0);

  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* NavHeader */}
          <div style={{
            padding: '4px 16px 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <ProfileChip/>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Portfolio</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="iconbtn"><Icon name="more" size={15}/></span>
              <span className="iconbtn"><Icon name="search" size={14}/></span>
            </div>
          </div>

          {/* Account selector */}
          <AccountSelector label="All accounts" count={ACCOUNTS.length}/>

          {/* Sub-tabs */}
          <SubTabs tabs={['Summary','Positions','Activity','Balances']} active="Positions"/>

          {/* Open/Closed/Options segmented */}
          <SegmentedPill items={['Open','Closed','Options']} active="Open"/>

          {/* Item counter + Overview link */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '4px 18px 10px',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13.5, color: 'rgb(var(--text-2) / 0.62)', fontWeight: 600 }}>
                {totalItems} items
              </span>
              <span style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'rgb(var(--surface-2))',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="search" size={14} color="rgb(var(--text-2) / 0.62)"/>
              </span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
                            fontSize: 13.5, color: 'rgb(var(--text-2) / 0.62)', fontWeight: 600 }}>
              Overview
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                border: '1.5px solid rgb(var(--text-3) / 0.38)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="more" size={11} color="rgb(var(--text-2) / 0.62)"/>
              </span>
            </span>
          </div>

          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '88px 1fr 1fr 1fr',
            padding: '8px 16px',
            fontSize: 11, fontWeight: 600,
            color: 'rgb(var(--text-3) / 0.38)',
            letterSpacing: 0.02,
            borderBottom: '.5px solid var(--separator-strong)',
            background: 'rgba(255,255,255,0.015)',
          }}>
            <span>Symbol</span>
            <span style={{ textAlign: 'right' }}>Last</span>
            <span style={{ textAlign: 'right' }}>$ Tdy G/L</span>
            <span style={{ textAlign: 'right' }}>% Tdy</span>
          </div>

          {/* Groups */}
          {groups.map((g) => (
            <div key={g.acc.id}>
              {/* Group header row — color stripe + account name + summary */}
              <div style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '88px 1fr 1fr 1fr',
                padding: '10px 16px 10px 20px',
                background: 'rgba(255,255,255,0.025)',
                borderBottom: '.5px solid var(--separator)',
                alignItems: 'center',
              }}>
                <span style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: 4, background: g.color,
                }}/>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{g.acc.name}</div>
                  <div className="tnum" style={{ fontSize: 10, color: 'rgb(var(--text-3) / 0.38)', marginTop: 1 }}>
                    {g.acc.broker} · {g.acc.last4}
                  </div>
                </div>
                <span/>
                <span className="tnum" style={{
                  fontSize: 13, fontWeight: 700, textAlign: 'right',
                  color: g.today >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))',
                }}>
                  {hide ? '••••' : ((g.today >= 0 ? '+' : '−') + '$' + fmtNum(Math.abs(g.today)))}
                </span>
                <span className="tnum" style={{
                  fontSize: 13, fontWeight: 700, textAlign: 'right',
                  color: g.today >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))',
                }}>
                  {(g.today >= 0 ? '+' : '−') + Math.abs((g.today / (g.value - g.today)) * 100).toFixed(2) + '%'}
                </span>
              </div>

              {/* Position rows */}
              {g.positions.map((p, i) => {
                const up = p.todayDollar >= 0;
                return (
                  <div key={p.sym} style={{
                    display: 'grid',
                    gridTemplateColumns: '88px 1fr 1fr 1fr',
                    padding: '11px 16px',
                    borderBottom: i === g.positions.length - 1 ? 'none' : '.5px solid var(--separator)',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{p.sym}</div>
                      <div style={{
                        fontSize: 10, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 500,
                        letterSpacing: 0.04, textTransform: 'uppercase',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        maxWidth: 80,
                      }}>{p.symbol.name}</div>
                    </div>
                    <span className="tnum" style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>
                      ${fmtNum(p.symbol.price)}
                    </span>
                    <span className="tnum" style={{
                      fontSize: 13, fontWeight: 700, textAlign: 'right',
                      color: up ? 'rgb(var(--up))' : 'rgb(var(--down))',
                    }}>
                      {hide ? '••••' : (up ? '+' : '−') + '$' + fmtNum(Math.abs(p.todayDollar))}
                    </span>
                    <span className="tnum" style={{
                      fontSize: 13, fontWeight: 700, textAlign: 'right',
                      color: up ? 'rgb(var(--up))' : 'rgb(var(--down))',
                    }}>
                      {(up ? '+' : '') + p.todayPct.toFixed(2) + '%'}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}

          {/* CASH summary row */}
          <div style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '88px 1fr 1fr 1fr',
            padding: '12px 16px 12px 20px',
            background: 'rgba(255,255,255,0.03)',
            alignItems: 'center',
            borderTop: '.5px solid var(--separator-strong)',
          }}>
            <span style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: 4, background: '#5AA9FF',
            }}/>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.04 }}>CASH</div>
              <div className="tnum" style={{ fontSize: 10, color: 'rgb(var(--text-3) / 0.38)', marginTop: 1 }}>
                SPAXX · ••2645
              </div>
            </div>
            <span className="tnum" style={{ fontSize: 12, fontWeight: 600, textAlign: 'right', color: 'rgb(var(--text-2) / 0.62)' }}>
              $4,820.00
            </span>
            <span className="tnum" style={{ fontSize: 12, fontWeight: 600, textAlign: 'right', color: 'rgb(var(--text-3) / 0.38)' }}>
              +$0.00
            </span>
            <span className="tnum" style={{ fontSize: 12, fontWeight: 600, textAlign: 'right', color: 'rgb(var(--text-3) / 0.38)' }}>
              —
            </span>
          </div>
        </div>
        <IOSTabBarV2 active="port"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// iOS SYMBOL detail v2 — Overview tab + sticky Trade CTA (IMG_5097)
// ─────────────────────────────────────────────────────────────────
function IOSSymbolV2({ tweaks, sym = 'MSFT', height = 1480 }) {
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
  const accColor = position ? ACCT_COLORS[position.account.id] : '#7AB0FF';

  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* Top bar — close + bell + add */}
          <div style={{
            padding: '4px 16px 8px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span className="iconbtn"><Icon name="x" size={15}/></span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: 0.01 }}>{sym}</div>
              <div className="tnum" style={{
                fontSize: 12, fontWeight: 600, marginTop: 1,
              }}>
                ${fmtNum(s.price)}{' '}
                <span style={{ color: s.up ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                  ({(s.up?'+':'')+s.change.toFixed(2)}, {(s.up?'+':'')+s.pct.toFixed(2)}%)
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="iconbtn"><Icon name="plus" size={15}/></span>
              <span className="iconbtn"><Icon name="bell" size={15}/></span>
            </div>
          </div>

          {/* Sub-tabs */}
          <SubTabs tabs={['Overview','Research','Options','Positions']} active="Overview"/>

          {/* Hero — large price + change */}
          <div style={{ padding: '20px 20px 6px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <SymbolLogo sym={sym} size={48}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, color: 'rgb(var(--text-2) / 0.62)', fontWeight: 500 }}>
                {s.name} · {s.exch}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 2 }}>
                <PriceText value={s.price} hidden={hide}
                           style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.024em' }}/>
                <PercentPill pct={s.pct} size="sm"/>
              </div>
              <div className="tnum" style={{
                fontSize: 13, marginTop: 2,
                color: s.up ? 'rgb(var(--up))' : 'rgb(var(--down))', fontWeight: 600,
              }}>
                {(s.up?'+':'')+s.change.toFixed(2)} Today · As of May 16 7:00 PM ET
              </div>
            </div>
          </div>

          {/* Range chips */}
          <div style={{ padding: '8px 12px 0' }}>
            <RangeChips active="3M" sizes={['1D','1W','1M','3M','6M','YTD','1Y','5Y']} compact/>
          </div>

          {/* Chart */}
          <div style={{ padding: '4px 16px 6px' }}>
            <PriceChart data={hist} candleData={cnd} mode={mode} up={s.up}
                        w={358} h={188} gridY={4}
                        padInner={{ l: 0, r: 32, t: 12, b: 18 }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', padding: '0 4px' }}>
              <span>Feb</span><span>Mar</span><span>Apr</span><span>May</span>
            </div>
          </div>

          {/* Stat grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                        padding: '8px 16px 12px', gap: 6 }}>
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
              <div key={k} style={{
                background: 'rgb(var(--surface-1))', borderRadius: 10,
                padding: '8px 9px',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              }}>
                <div style={{ fontSize: 10, color: 'rgb(var(--text-3) / 0.38)',
                              fontWeight: 600, letterSpacing: 0.04, textTransform: 'uppercase' }}>
                  {k}
                </div>
                <div className="tnum" style={{ fontSize: 13, fontWeight: 700, marginTop: 1 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* My Position */}
          {position && (
            <div style={{ margin: '4px 16px 14px',
                          padding: '14px 16px',
                          borderRadius: 14,
                          position: 'relative',
                          background: 'rgb(var(--surface-1))',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
                          overflow: 'hidden' }}>
              <span style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                background: accColor,
              }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 11.5, fontWeight: 700,
                                letterSpacing: 0.08, textTransform: 'uppercase',
                                color: SEC.portfolio }}>My Position</span>
                <span style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 500 }}>
                  {position.account.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end',
                            justifyContent: 'space-between', marginTop: 6 }}>
                <div>
                  <PriceText value={mv} hidden={hide} prefix="$"
                             style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.012em' }}/>
                  <div className="tnum" style={{ fontSize: 11.5, color: 'rgb(var(--text-3) / 0.38)', marginTop: 2 }}>
                    {position.qty} sh · avg ${fmtNum(position.avgCost)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="tnum" style={{
                    fontSize: 15, fontWeight: 700,
                    color: pUn>=0 ? 'rgb(var(--up))' : 'rgb(var(--down))',
                  }}>
                    {(pUn>=0?'+':'')+fmtMoney(pUn)}
                  </div>
                  <div className="tnum" style={{
                    fontSize: 12, fontWeight: 600, marginTop: 1,
                    color: pUn>=0 ? 'rgb(var(--up))' : 'rgb(var(--down))',
                  }}>
                    {(pUn>=0?'+':'')+((pUn/pCost)*100).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Purchase history */}
          <div style={{ margin: '0 16px 14px',
                        padding: '14px 16px',
                        borderRadius: 14,
                        background: 'rgb(var(--surface-1))',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13.5, fontWeight: 700 }}>Purchase history</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontSize: 11.5, color: 'rgb(var(--text-3) / 0.38)' }}>
                Acquired <Icon name="chevron-d" size={11} color="rgb(var(--text-3) / 0.38)"/>
              </span>
            </div>
            <div style={{ marginTop: 8 }}>
              {[
                { d: 'Apr 15, 2025', avg: 388.67, pnl: 332.50, pct: 8.55 },
                { d: 'Apr 14, 2025', avg: 393.08, pnl: 288.40, pct: 7.34 },
                { d: 'Mar 02, 2024', avg: 312.40, pnl: 540.10, pct: 14.21 },
              ].map((r, i, arr) => (
                <div key={r.d} style={{
                  display: 'grid', gridTemplateColumns: '1.3fr 1fr 1.2fr',
                  padding: '10px 0',
                  borderBottom: i === arr.length - 1 ? 'none' : '.5px solid var(--separator)',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.d}</span>
                  <span className="tnum" style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>
                    ${r.avg.toFixed(2)}
                  </span>
                  <span className="tnum" style={{
                    fontSize: 13, fontWeight: 700, color: 'rgb(var(--up))', textAlign: 'right',
                  }}>
                    +${r.pnl.toFixed(2)} ({r.pct.toFixed(2)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* About card */}
          <div style={{ margin: '0 16px 14px',
                        padding: '14px 16px',
                        borderRadius: 14,
                        background: 'rgb(var(--surface-1))',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)' }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>About</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 14px',
                          fontSize: 12, color: 'rgb(var(--text-2) / 0.62)' }}>
              <div><span style={{ color: 'rgb(var(--text-3) / 0.38)' }}>CEO</span><br/>
                <span style={{ color: 'rgb(var(--text))', fontWeight: 600 }}>Satya Nadella</span></div>
              <div><span style={{ color: 'rgb(var(--text-3) / 0.38)' }}>HQ</span><br/>
                <span style={{ color: 'rgb(var(--text))', fontWeight: 600 }}>Redmond, WA</span></div>
              <div><span style={{ color: 'rgb(var(--text-3) / 0.38)' }}>Employees</span><br/>
                <span style={{ color: 'rgb(var(--text))', fontWeight: 600 }} className="tnum">228,000</span></div>
              <div><span style={{ color: 'rgb(var(--text-3) / 0.38)' }}>Industry</span><br/>
                <span style={{ color: 'rgb(var(--text))', fontWeight: 600 }}>Software</span></div>
            </div>
          </div>

          {/* News card */}
          <div style={{ margin: '0 16px 16px',
                        padding: '6px 16px 4px',
                        borderRadius: 14,
                        background: 'rgb(var(--surface-1))',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)' }}>
            <div style={{ padding: '10px 0 6px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13.5, fontWeight: 700 }}>News</span>
              <span style={{ fontSize: 11.5, color: SEC.activity, fontWeight: 600 }}>See all</span>
            </div>
            {[
              { src: 'Reuters', t: 'Microsoft pledges $4B in AI infrastructure across Europe', when: '2h' },
              { src: 'Bloomberg', t: 'Azure growth re-accelerates as enterprise migrations pick up', when: '5h' },
              { src: 'WSJ', t: 'Activision tie-ups drive 13% lift in gaming revenue', when: '1d' },
            ].map((n, i, arr) => (
              <div key={n.t} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0',
                borderTop: '.5px solid var(--separator)',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 8,
                  background: `linear-gradient(135deg, #2A3A5A, #3F2A5A)`,
                  flex: '0 0 auto',
                }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.25,
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                overflow: 'hidden' }}>
                    {n.t}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', marginTop: 3 }}>
                    {n.src} · {n.when}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Spacer for sticky bottom bar */}
          <div style={{ height: 76 }}/>
        </div>

        {/* Sticky bottom Trade CTA (R-N4 / IMG_5097) */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          padding: '10px 16px 22px',
          display: 'flex', gap: 10, alignItems: 'center',
          background: 'linear-gradient(to top, rgb(var(--bg)) 70%, rgba(7,7,10,0))',
        }}>
          {/* Account picker */}
          <div style={{
            flex: '0 0 auto', minWidth: 140, padding: '10px 14px',
            borderRadius: 999,
            background: 'rgb(var(--surface-1))',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%', background: accColor,
              boxShadow: `0 0 0 2px ${accColor}33`,
            }}/>
            <div style={{ flex: 1, lineHeight: 1.1 }}>
              <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)' }}>Account</div>
              <div style={{ fontSize: 12.5, fontWeight: 700,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            maxWidth: 100 }}>
                {position ? position.account.name : 'Individual'}
              </div>
            </div>
            <Icon name="chevron-d" size={12} color="rgb(var(--text-3) / 0.38)"/>
          </div>
          {/* Trade button */}
          <div style={{
            flex: 1, padding: '14px 0',
            background: 'rgb(var(--mint))',
            color: '#07120D',
            textAlign: 'center',
            borderRadius: 999,
            fontSize: 15.5, fontWeight: 800, letterSpacing: 0.01,
            boxShadow: '0 6px 18px rgba(107,232,184,0.35)',
          }}>
            Trade
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  SubTabs, SegmentedPill, AccountSelector,
  IOSPortfolio, IOSSymbolV2,
});
