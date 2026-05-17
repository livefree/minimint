// screens-flows.jsx — multi-step flows + gesture states
// R-SC2 (CSV import 4 steps), R-I5 (⌘K palette + iOS search),
// R-I3 (large-title collapse), R-I4 (swipe / long-press / pull-refresh)

// ─────────────────────────────────────────────────────────────────
// CSV IMPORT — 4-step wizard (R-SC2)
// ─────────────────────────────────────────────────────────────────

// Wizard stepper used in headers (1 ─ 2 ─ 3 ─ 4)
function WizardSteps({ active, steps = ['Pick', 'Map', 'Review', 'Done'] }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 18px 16px',
    }}>
      {steps.map((s, i) => {
        const isActive = i === active;
        const isDone = i < active;
        const dotBg = isActive || isDone ? 'rgb(var(--mint))' : 'rgb(255 255 255 / 0.10)';
        const dotColor = isActive || isDone ? '#07120D' : 'rgb(var(--text-3) / 0.62)';
        return (
          <React.Fragment key={s}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                background: dotBg, color: dotColor,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800,
              }}>{isDone ? '✓' : i + 1}</span>
              <span style={{
                fontSize: 12, fontWeight: isActive ? 700 : 500,
                color: isActive ? 'rgb(var(--text))'
                       : isDone ? 'rgb(var(--mint))'
                       : 'rgb(var(--text-3) / 0.62)',
              }}>{s}</span>
            </span>
            {i < steps.length - 1 && (
              <span style={{
                flex: 1, height: 1,
                background: i < active ? 'rgb(var(--mint) / 0.4)' : 'rgb(255 255 255 / 0.06)',
                margin: '0 2px',
              }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function CSVHeader({ title, subtitle, step }) {
  return (
    <>
      <div style={{ padding: '4px 16px 4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, color: 'rgb(var(--mint))', fontWeight: 600 }}>Cancel</span>
        <span style={{ fontSize: 17, fontWeight: 700 }}>Import CSV</span>
        <span style={{ fontSize: 15, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 600 }}>Help</span>
      </div>
      <WizardSteps active={step}/>
      <div style={{ padding: '0 20px 14px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 12.5, color: 'rgb(var(--text-2) / 0.62)',
                          marginTop: 4, lineHeight: 1.4 }}>
            {subtitle}
          </div>
        )}
      </div>
    </>
  );
}

function IOSCSVImportPick({ tweaks, height = 900 }) {
  const profile = profileById('sam');
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* Profile attribution band (R-P3 carries here per R-P7) */}
          <div style={{
            padding: '6px 18px 8px',
            background: profileRgb(profile, 0.06),
            borderBottom: `.5px solid ${profileRgb(profile, 0.18)}`,
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 11, color: profileRgb(profile), fontWeight: 600,
          }}>
            <ProfileAvatar profile={profile} size={20}/>
            Importing to {profile.name} · accounts will land here
          </div>

          <CSVHeader step={0} title="Pick a CSV file"
                     subtitle="Drag-drop onto this area, or pick from Files. We auto-detect common broker exports."/>

          {/* Drag-drop zone */}
          <div style={{ margin: '0 16px 18px',
                          padding: '36px 18px',
                          border: '2px dashed rgb(var(--mint) / 0.35)',
                          background: 'rgb(var(--mint) / 0.05)',
                          borderRadius: 16,
                          textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, margin: '0 auto 12px',
              borderRadius: 14,
              background: 'rgb(var(--mint) / 0.16)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="arrow-u" size={22} color="rgb(var(--mint))" strokeWidth={2.2}/>
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 700 }}>Drop file or tap to browse</div>
            <div style={{ fontSize: 12, color: 'rgb(var(--text-2) / 0.62)',
                            marginTop: 4 }}>
              CSV / TSV · up to 5 MB
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginTop: 16, padding: '9px 18px',
              background: 'rgb(var(--mint))', color: '#07120D',
              borderRadius: 999, fontSize: 13.5, fontWeight: 800,
            }}>
              <Icon name="briefcase" size={13} color="#07120D" strokeWidth={2.2}/>
              Choose from Files
            </div>
          </div>

          {/* Supported brokers */}
          <div style={{ padding: '0 20px 6px',
                        fontSize: 11.5, fontWeight: 700,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: 'rgb(var(--text-3) / 0.38)' }}>
            Tested with
          </div>
          <div style={{ padding: '6px 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Fidelity', 'Schwab', 'Vanguard', 'IBKR', 'E*TRADE', 'Robinhood', 'Custom'].map((b, i) => (
              <span key={b} style={{
                padding: '7px 13px',
                borderRadius: 999,
                fontSize: 12.5, fontWeight: 600,
                background: i < 4 ? 'rgb(var(--surface-2))' : 'transparent',
                border: i < 4 ? 'none' : '1px dashed rgb(255 255 255 / 0.10)',
                color: i < 4 ? 'rgb(var(--text))' : 'rgb(var(--text-3) / 0.62)',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                {i < 4 && <Icon name="check" size={11} color="rgb(var(--mint))" strokeWidth={2.5}/>}
                {b}
              </span>
            ))}
          </div>

          {/* Reassurance note */}
          <div style={{ margin: '20px 16px 16px', padding: '14px 16px',
                        background: 'rgb(var(--surface-1))', borderRadius: 12,
                        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgb(var(--mint))' }}/>
              Files never leave your device
            </div>
            <div style={{ fontSize: 12, color: 'rgb(var(--text-2) / 0.62)',
                            marginTop: 4, lineHeight: 1.4 }}>
              Parsing happens locally. We do not upload your CSV to any server.
              Use Undo within 24h if anything looks off.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IOSCSVImportMap({ tweaks, height = 1180 }) {
  const profile = profileById('sam');

  const mappings = [
    { src: 'Trade Date',     tgt: 'Date',     conf: 'high'   },
    { src: 'Symbol',         tgt: 'Symbol',   conf: 'high'   },
    { src: 'Action',         tgt: 'Kind',     conf: 'high'   },
    { src: 'Quantity',       tgt: 'Quantity', conf: 'high'   },
    { src: 'Execution Price',tgt: 'Price',    conf: 'medium' },
    { src: 'Commission',     tgt: 'Fees',     conf: 'medium' },
    { src: 'Account',        tgt: 'Account',  conf: 'high'   },
    { src: '(none)',         tgt: 'Profile',  conf: 'manual', value: 'Sam (current)' },
  ];

  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          <div style={{
            padding: '6px 18px 8px',
            background: profileRgb(profile, 0.06),
            borderBottom: `.5px solid ${profileRgb(profile, 0.18)}`,
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 11, color: profileRgb(profile), fontWeight: 600,
          }}>
            <ProfileAvatar profile={profile} size={20}/>
            Importing to {profile.name}
          </div>

          <CSVHeader step={1} title="Map columns"
                     subtitle="fidelity-may-2026.csv · 42 rows · We auto-detected high-confidence matches (✓). Confirm or override."/>

          {/* Preview strip — first 3 rows of CSV */}
          <div style={{ margin: '0 16px 18px',
                          background: 'rgb(var(--surface-1))',
                          borderRadius: 12,
                          padding: '10px 12px',
                          boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)' }}>
            <div style={{ fontSize: 10, fontWeight: 700,
                          letterSpacing: 0.06, textTransform: 'uppercase',
                          color: 'rgb(var(--text-3) / 0.38)', marginBottom: 6 }}>
              Preview · first 3 rows
            </div>
            <div style={{ fontFamily: 'ui-monospace, "SF Mono", monospace',
                            fontSize: 10.5, lineHeight: 1.5,
                            color: 'rgb(var(--text-2) / 0.62)',
                            whiteSpace: 'nowrap', overflow: 'hidden',
                            textOverflow: 'ellipsis' }}>
              <div>05/14/26,NVDA,Buy,10,118.40,0.00,Z262...</div>
              <div>05/13/26,AAPL,Div,80,0.25,0.00,Z262...</div>
              <div>05/12/26,TSLA,Sell,5,348.10,0.00,Z262...</div>
            </div>
          </div>

          {/* Mapping rows */}
          <div style={{ margin: '0 16px',
                          background: 'rgb(var(--surface-1))',
                          borderRadius: 14,
                          overflow: 'hidden',
                          boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)' }}>
            {mappings.map((m, i, arr) => {
              const tone = m.conf === 'high'
                ? 'rgb(var(--mint))'
                : m.conf === 'medium'
                ? '#FFC176'
                : profileRgb(profile);
              const icon = m.conf === 'high' ? 'check'
                          : m.conf === 'medium' ? 'edit'
                          : 'user';
              return (
                <div key={m.tgt} style={{
                  display: 'grid',
                  gridTemplateColumns: '1.1fr 18px 1fr 20px',
                  alignItems: 'center', gap: 10,
                  padding: '12px 14px',
                  borderBottom: i === arr.length - 1 ? 'none' : '.5px solid rgb(255 255 255 / 0.06)',
                }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{m.src}</div>
                    <div style={{ fontSize: 10, color: 'rgb(var(--text-3) / 0.38)',
                                    letterSpacing: 0.04, textTransform: 'uppercase' }}>
                      Source
                    </div>
                  </div>
                  <Icon name="arrow-r" size={12} color="rgb(var(--text-3) / 0.62)"/>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon name={icon} size={11} color={tone} strokeWidth={2.5}/>
                      <span style={{ color: tone }}>{m.tgt}</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'rgb(var(--text-3) / 0.38)',
                                    marginTop: 1 }}>
                      {m.value || (m.conf === 'high' ? 'Auto · 100%' : m.conf === 'medium' ? 'Auto · 78%' : 'Manual')}
                    </div>
                  </div>
                  <Icon name="chevron-d" size={11} color="rgb(var(--text-3) / 0.62)"/>
                </div>
              );
            })}
          </div>

          {/* Bottom action */}
          <div style={{ padding: '24px 16px 0' }}>
            <div style={{
              background: 'rgb(var(--mint))', color: '#07120D',
              textAlign: 'center', padding: '14px 0',
              borderRadius: 14, fontSize: 15, fontWeight: 800,
              boxShadow: '0 6px 18px rgb(var(--mint) / 0.32)',
            }}>
              Continue · Review 42 rows
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IOSCSVImportReview({ tweaks, height = 1020 }) {
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          <CSVHeader step={2} title="Review"
                     subtitle="42 rows parsed · 38 ready to import · 4 issues to resolve."/>

          {/* Summary stat strip */}
          <div style={{ padding: '0 16px',
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { k: 'Total',  v: 42, tone: 'rgb(var(--text))' },
              { k: 'Valid',  v: 38, tone: 'rgb(var(--up))' },
              { k: 'Issues', v: 4,  tone: 'rgb(var(--down))' },
            ].map((s) => (
              <div key={s.k} style={{
                background: 'rgb(var(--surface-1))', borderRadius: 12,
                padding: '12px 14px',
                boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: 0.04,
                  textTransform: 'uppercase', color: 'rgb(var(--text-3) / 0.62)',
                }}>{s.k}</div>
                <div className="tnum" style={{ fontSize: 24, fontWeight: 800,
                                                  marginTop: 4, color: s.tone }}>
                  {s.v}
                </div>
              </div>
            ))}
          </div>

          {/* Issues panel */}
          <div style={{
            margin: '18px 16px 14px', padding: '12px 16px',
            background: 'rgb(var(--down) / 0.06)',
            border: '1px solid rgb(var(--down) / 0.2)',
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 12.5, fontWeight: 700,
                            color: 'rgb(var(--down))', marginBottom: 8 }}>
              Issues to resolve
            </div>
            {[
              { row: 14, code: 'unknown-symbol',  msg: 'Symbol "NVDIA" not found · suggest NVDA' },
              { row: 22, code: 'date-format',     msg: 'Date "5/22" missing year · assume 2026?' },
              { row: 31, code: 'duplicate',       msg: 'Identical to row 9 · skip duplicate' },
              { row: 38, code: 'unknown-account', msg: 'Account "Z262999" not on file · create?' },
            ].map((iss) => (
              <div key={iss.row} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '8px 0',
                borderTop: '.5px solid rgb(var(--down) / 0.15)',
              }}>
                <span style={{
                  flex: '0 0 auto',
                  width: 28, height: 22, borderRadius: 5,
                  background: 'rgb(var(--down) / 0.18)',
                  color: 'rgb(var(--down))',
                  fontSize: 11, fontWeight: 800,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>#{iss.row}</span>
                <div style={{ flex: 1, fontSize: 12, color: 'rgb(var(--text-2) / 0.62)' }}>
                  <div style={{ fontWeight: 600, color: 'rgb(var(--text))' }}>{iss.msg}</div>
                  <div style={{ fontSize: 10.5, marginTop: 1,
                                  letterSpacing: 0.04, color: 'rgb(var(--text-3) / 0.62)',
                                  textTransform: 'uppercase' }}>{iss.code}</div>
                </div>
                <span style={{
                  fontSize: 11.5, color: 'rgb(var(--mint))',
                  fontWeight: 600, alignSelf: 'center',
                }}>Fix</span>
              </div>
            ))}
          </div>

          {/* Valid sample */}
          <div style={{ padding: '0 20px 6px', fontSize: 11.5,
                          fontWeight: 700, letterSpacing: 0.08,
                          textTransform: 'uppercase',
                          color: 'rgb(var(--mint))' }}>
            Will import · sample
          </div>
          <div style={{ margin: '6px 16px', padding: '6px 14px',
                          background: 'rgb(var(--surface-1))', borderRadius: 12,
                          boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)' }}>
            {TRANSACTIONS.slice(0, 4).map((t, i, arr) => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0',
                borderBottom: i === arr.length - 1 ? 'none' : '.5px solid rgb(var(--separator-alpha))',
                fontSize: 12.5,
              }}>
                <KindPill kind={t.kind}/>
                <span style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700 }}>{t.sym}</span>
                  <span style={{ color: 'rgb(var(--text-3) / 0.62)' }}>
                    {' · '}{t.qty} sh @ ${fmtNum(t.price)}
                  </span>
                </span>
                <span style={{ fontSize: 10.5, color: 'rgb(var(--text-3) / 0.38)' }}>
                  {t.when}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom actions */}
          <div style={{ padding: '18px 16px 0', display: 'flex', gap: 10 }}>
            <div style={{
              flex: 1, padding: '13px 0', textAlign: 'center',
              background: 'rgb(var(--surface-2))', borderRadius: 14,
              fontSize: 13.5, fontWeight: 700, color: 'rgb(var(--text-2) / 0.62)',
            }}>Skip 4 · Import 38</div>
            <div style={{
              flex: 1.2, padding: '13px 0', textAlign: 'center',
              background: 'rgb(var(--mint))', color: '#07120D',
              borderRadius: 14,
              fontSize: 13.5, fontWeight: 800,
              boxShadow: '0 6px 18px rgb(var(--mint) / 0.32)',
            }}>Fix &amp; import all 42</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IOSCSVImportDone({ tweaks, height = 844 }) {
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '4px 16px 4px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ width: 50 }}/>
            <span style={{ fontSize: 17, fontWeight: 700 }}>Import CSV</span>
            <span style={{ fontSize: 15, color: 'rgb(var(--mint))', fontWeight: 600 }}>Done</span>
          </div>
          <WizardSteps active={3}/>

          {/* Success */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          textAlign: 'center', padding: '0 32px', gap: 18 }}>
            <div style={{
              width: 96, height: 96, borderRadius: 48,
              background: 'rgb(var(--mint) / 0.16)',
              border: '1px solid rgb(var(--mint) / 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 30px rgb(var(--mint) / 0.18)',
            }}>
              <Icon name="check" size={44} color="rgb(var(--mint))" strokeWidth={2.4}/>
            </div>

            <div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>
                42 transactions imported
              </div>
              <div style={{ fontSize: 13, color: 'rgb(var(--text-2) / 0.62)',
                              marginTop: 6, lineHeight: 1.5 }}>
                Cost basis and today's P/L will recompute when you return to
                Portfolio. Holdings reconciled across 1 account.
              </div>
            </div>

            {/* Stat strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 8, width: '100%' }}>
              {[
                ['Buys', 28], ['Sells', 8], ['Dividends', 6],
              ].map(([k, v]) => (
                <div key={k} style={{
                  background: 'rgb(var(--surface-1))', borderRadius: 10,
                  padding: '10px 8px',
                  boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
                }}>
                  <div style={{ fontSize: 10, color: 'rgb(var(--text-3) / 0.62)',
                                fontWeight: 600, letterSpacing: 0.04, textTransform: 'uppercase' }}>{k}</div>
                  <div className="tnum" style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Undo */}
            <div style={{
              padding: '10px 16px', borderRadius: 999,
              background: 'rgb(255 193 118 / 0.10)',
              border: '1px solid rgb(255 193 118 / 0.3)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 12.5, color: '#FFC176', fontWeight: 600,
            }}>
              <Icon name="refresh" size={12} color="#FFC176" strokeWidth={2.2}/>
              Undo within 24h · expires May 17 7:00 PM
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ padding: '0 16px 28px' }}>
            <div style={{
              background: 'rgb(var(--mint))', color: '#07120D',
              textAlign: 'center', padding: '14px 0',
              borderRadius: 14, fontSize: 15, fontWeight: 800,
              boxShadow: '0 6px 18px rgb(var(--mint) / 0.32)',
            }}>
              View Portfolio
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAC ⌘K PALETTE (R-I5)
// ─────────────────────────────────────────────────────────────────
function MacSearchPalette({ tweaks }) {
  const profile = profileById('sam');
  const myHoldings = POSITIONS.slice(0, 3);
  const watchlists = [
    { name: 'Mega Cap',  count: 8,  c: 'rgb(var(--sec-watchlist))' },
    { name: 'ETFs',      count: 12, c: 'rgb(var(--sec-symbol))' },
    { name: 'Watching',  count: 5,  c: 'rgb(var(--sec-activity))' },
  ];
  const marketResults = [
    { sym: 'PLTR', name: 'Palantir Technologies', exch: 'NYSE', price: 32.10, pct: 4.8 },
    { sym: 'COIN', name: 'Coinbase Global',       exch: 'NASDAQ', price: 218.42, pct: -1.2 },
    { sym: 'RKLB', name: 'Rocket Lab',            exch: 'NASDAQ', price: 19.85, pct: 7.4 },
  ];

  return (
    <div className="mac">
      <MacTitleBar/>
      <MacSidebarV2 active="home"/>
      <main className="mac-main" style={{ overflow: 'hidden' }}>
        {/* Backdrop dim */}
        <div style={{ position: 'absolute', inset: 0,
                      background: 'rgb(0 0 0 / 0.55)', backdropFilter: 'blur(20px)' }}/>

        {/* Palette */}
        <div style={{
          position: 'absolute',
          left: '50%', top: 100,
          transform: 'translateX(-50%)',
          width: 560,
          background: 'rgb(36 36 42 / 0.96)',
          backdropFilter: 'blur(40px) saturate(180%)',
          border: '.5px solid rgb(255 255 255 / 0.10)',
          borderRadius: 16,
          boxShadow: '0 24px 70px rgb(0 0 0 / 0.55), inset 0 1px 0 rgb(255 255 255 / 0.06)',
          overflow: 'hidden',
        }}>
          {/* Input row */}
          <div style={{
            padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 12,
            borderBottom: '.5px solid rgb(255 255 255 / 0.06)',
          }}>
            <Icon name="search" size={16} color="rgb(var(--text-2) / 0.62)"/>
            <span style={{ flex: 1, fontSize: 16, color: 'rgb(var(--text))' }}>
              ro
              <span style={{
                display: 'inline-block', width: 1.5, height: 16,
                background: 'rgb(var(--mint))', marginLeft: 2,
                verticalAlign: 'middle',
              }}/>
            </span>
            <span style={{
              padding: '3px 8px', borderRadius: 6,
              background: 'rgb(255 255 255 / 0.08)',
              fontSize: 11, color: 'rgb(var(--text-2) / 0.62)',
              fontWeight: 600,
            }}>3 sources · 9 results</span>
          </div>

          {/* Section: My Holdings */}
          <div style={{ padding: '8px 14px 4px',
                          fontSize: 10.5, fontWeight: 700,
                          letterSpacing: 0.08, textTransform: 'uppercase',
                          color: 'rgb(var(--sec-portfolio))' }}>
            My Holdings · {profile.name}
          </div>
          {myHoldings.map((p, i) => {
            const isFirst = i === 0;
            return (
              <div key={p.sym + p.account.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 14px',
                background: isFirst ? 'rgb(var(--mint) / 0.10)' : 'transparent',
                borderLeft: isFirst ? '2px solid rgb(var(--mint))' : '2px solid transparent',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'rgb(var(--sec-portfolio))',
                }}/>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{p.sym}</span>
                <span style={{ fontSize: 11.5, color: 'rgb(var(--text-2) / 0.62)' }}>
                  {p.symbol.name}
                </span>
                <span style={{ flex: 1 }}/>
                <span className="tnum" style={{
                  fontSize: 11.5, color: 'rgb(var(--text-3) / 0.62)',
                }}>{p.qty} sh · ${fmtNum(p.symbol.price)}</span>
              </div>
            );
          })}

          {/* Section: Watchlists */}
          <div style={{ padding: '12px 14px 4px',
                          fontSize: 10.5, fontWeight: 700,
                          letterSpacing: 0.08, textTransform: 'uppercase',
                          color: 'rgb(var(--sec-watchlist))' }}>
            Watchlists
          </div>
          {watchlists.map((w) => (
            <div key={w.name} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 14px',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: w.c,
              }}/>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{w.name}</span>
              <span style={{ flex: 1 }}/>
              <span style={{ fontSize: 11.5, color: 'rgb(var(--text-3) / 0.38)' }}>
                {w.count} symbols
              </span>
            </div>
          ))}

          {/* Section: Market */}
          <div style={{ padding: '12px 14px 4px',
                          fontSize: 10.5, fontWeight: 700,
                          letterSpacing: 0.08, textTransform: 'uppercase',
                          color: 'rgb(var(--text-3) / 0.38)' }}>
            Market · Finnhub
          </div>
          {marketResults.map((r) => (
            <div key={r.sym} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 14px',
            }}>
              <span style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: 0.04,
                padding: '1px 5px', borderRadius: 3,
                background: 'rgb(255 255 255 / 0.06)',
                color: 'rgb(var(--text-3) / 0.62)',
                minWidth: 38, textAlign: 'center',
              }}>{r.exch}</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{r.sym}</span>
              <span style={{ fontSize: 11.5, color: 'rgb(var(--text-2) / 0.62)' }}>{r.name}</span>
              <span style={{ flex: 1 }}/>
              <span className="tnum" style={{ fontSize: 11.5, fontWeight: 600 }}>
                ${fmtNum(r.price)}
              </span>
              <span className="tnum" style={{
                fontSize: 11.5, fontWeight: 700, minWidth: 50, textAlign: 'right',
                color: r.pct >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))',
              }}>
                {(r.pct >= 0 ? '+' : '') + r.pct.toFixed(2)}%
              </span>
            </div>
          ))}

          {/* Footer: shortcuts */}
          <div style={{
            padding: '10px 14px',
            background: 'rgb(0 0 0 / 0.2)',
            borderTop: '.5px solid rgb(255 255 255 / 0.06)',
            display: 'flex', alignItems: 'center', gap: 16,
            fontSize: 11, color: 'rgb(var(--text-3) / 0.62)',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="kbd">↑↓</span> navigate
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="kbd">↵</span> open
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="kbd">⌘↵</span> open in new tab
            </span>
            <span style={{ flex: 1 }}/>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="kbd">esc</span> close
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS FULLSCREEN SEARCH (R-I5)
// ─────────────────────────────────────────────────────────────────
function IOSSearchFullscreen({ tweaks, height = 980 }) {
  const profile = profileById('sam');
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* Search bar + Cancel */}
          <div style={{ padding: '4px 16px 14px',
                        display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1,
                            background: 'rgb(var(--surface-1))',
                            borderRadius: 999, padding: '10px 14px',
                            display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="search" size={14} color="rgb(var(--text-2) / 0.62)"/>
              <span style={{ flex: 1, fontSize: 14 }}>
                ro<span style={{
                  display: 'inline-block', width: 1.5, height: 14,
                  background: 'rgb(var(--mint))', verticalAlign: 'middle',
                }}/>
              </span>
              <Icon name="mic" size={13} color="rgb(var(--text-2) / 0.62)"/>
            </div>
            <span style={{ fontSize: 15, color: 'rgb(var(--mint))', fontWeight: 600 }}>
              Cancel
            </span>
          </div>

          {/* Section: My holdings */}
          <div style={{ padding: '0 20px 6px', fontSize: 11.5, fontWeight: 700,
                          letterSpacing: 0.08, textTransform: 'uppercase',
                          color: 'rgb(var(--sec-portfolio))' }}>
            My holdings · {profile.name}
          </div>
          <div style={{ padding: '0 20px 8px' }}>
            {POSITIONS.slice(0, 2).map((p, i, arr) => (
              <UniRow key={p.sym} s={p.symbol} mode="position"
                      position={p} showAccountDot hidden={false}
                      last={i === arr.length - 1}/>
            ))}
          </div>

          {/* Section: Market */}
          <div style={{ padding: '14px 20px 6px', fontSize: 11.5, fontWeight: 700,
                          letterSpacing: 0.08, textTransform: 'uppercase',
                          color: 'rgb(var(--text-3) / 0.38)' }}>
            Market
          </div>
          <div style={{ padding: '0 16px' }}>
            {[
              { sym: 'PLTR', name: 'Palantir Technologies', exch: 'NYSE', price: 32.10, pct: 4.8 },
              { sym: 'COIN', name: 'Coinbase Global',       exch: 'NASDAQ', price: 218.42, pct: -1.2 },
              { sym: 'RKLB', name: 'Rocket Lab',            exch: 'NASDAQ', price: 19.85, pct: 7.4 },
              { sym: 'RBLX', name: 'Roblox',                exch: 'NYSE', price: 42.18, pct: 2.1 },
            ].map((r, i, arr) => (
              <div key={r.sym} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 4px',
                borderBottom: i === arr.length - 1 ? 'none' : '.5px solid rgb(var(--separator-alpha))',
              }}>
                <span style={{
                  fontSize: 9.5, fontWeight: 700, letterSpacing: 0.04,
                  padding: '1px 5px', borderRadius: 3,
                  background: 'rgb(255 255 255 / 0.06)',
                  color: 'rgb(var(--text-3) / 0.62)',
                  minWidth: 42, textAlign: 'center',
                }}>{r.exch}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{r.sym}</div>
                  <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.62)' }}>
                    {r.name}
                  </div>
                </div>
                <span className="tnum" style={{ fontSize: 13, fontWeight: 700 }}>
                  ${fmtNum(r.price)}
                </span>
                <span className="tnum" style={{
                  fontSize: 12, fontWeight: 700, minWidth: 50, textAlign: 'right',
                  color: r.pct >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))',
                }}>
                  {(r.pct >= 0 ? '+' : '') + r.pct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>

          {/* Recent */}
          <div style={{ padding: '20px 20px 6px', fontSize: 11.5, fontWeight: 700,
                          letterSpacing: 0.08, textTransform: 'uppercase',
                          color: 'rgb(var(--text-3) / 0.38)',
                          display: 'flex', justifyContent: 'space-between' }}>
            Recent
            <span style={{ fontSize: 11.5, color: 'rgb(var(--mint))', letterSpacing: 0, textTransform: 'none' }}>
              Clear
            </span>
          </div>
          <div style={{ padding: '4px 20px',
                          display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['NVDA', 'AAPL', 'TSLA earnings', 'CPI report', 'COST'].map((r) => (
              <span key={r} style={{
                padding: '6px 12px',
                background: 'rgb(var(--surface-2))',
                borderRadius: 999,
                fontSize: 12.5, fontWeight: 500,
                color: 'rgb(var(--text-2) / 0.62)',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                <Icon name="search" size={10} color="rgb(var(--text-3) / 0.62)"/>
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS HOME COLLAPSED — large title scrolled away (R-I3)
// ─────────────────────────────────────────────────────────────────
function IOSHomeCollapsed({ tweaks, height = 1080 }) {
  const hide = !!tweaks.privacy;
  const P = PORTFOLIO;
  const up = P.todayPL >= 0;

  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* Compact nav with blurred backdrop (frame 2 of R-I3) */}
          <div style={{
            position: 'sticky', top: 0,
            background: 'rgb(7 7 10 / 0.72)',
            backdropFilter: 'blur(28px) saturate(180%)',
            borderBottom: '.5px solid rgb(var(--separator-strong-alpha))',
            padding: '8px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            zIndex: 5,
          }}>
            <ProfileAvatar profile={profileById('sam')} size={26}/>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 700 }}>
              Home
            </div>
            <span className="iconbtn" style={{ width: 30, height: 30 }}>
              <Icon name="search" size={13}/>
            </span>
            <span className="iconbtn" style={{ width: 30, height: 30, position: 'relative' }}>
              <Icon name="bell" size={13}/>
              <span style={{
                position: 'absolute', top: 6, right: 7,
                width: 6, height: 6, borderRadius: '50%',
                background: 'rgb(var(--down))',
              }}/>
            </span>
          </div>

          {/* Frame-2 indicator */}
          <div style={{ padding: '8px 16px',
                          fontSize: 10.5, color: 'rgb(var(--mint))',
                          fontWeight: 600, letterSpacing: 0.04,
                          textTransform: 'uppercase',
                          display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgb(var(--mint))' }}/>
            Frame 2 · scrollY ≥ 36 · large title hidden
          </div>

          {/* Content begins (would normally be scrolled) */}
          <div style={{ padding: '8px 16px 14px',
                          background: `${up
                            ? 'radial-gradient(140% 90% at 0% 0%, rgb(var(--up) / 0.14) 0%, transparent 55%)'
                            : 'radial-gradient(140% 90% at 0% 0%, rgb(var(--down) / 0.12) 0%, transparent 55%)'}, rgb(var(--surface-1))`,
                          borderRadius: 16, margin: '4px 16px 14px', padding: '14px 18px',
                          boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)' }}>
            <div style={{ fontSize: 11, fontWeight: 700,
                            letterSpacing: 0.08, textTransform: 'uppercase',
                            color: 'rgb(var(--sec-portfolio))' }}>Net Worth</div>
            <PriceText value={P.netWorth} hidden={hide} prefix="$"
                       style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.025em', marginTop: 6 }}/>
            <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 13 }}>
              <span className="tnum" style={{ color: up ? 'rgb(var(--up))' : 'rgb(var(--down))', fontWeight: 700 }}>
                {(up ? '+' : '') + fmtMoney(P.todayPL)}
              </span>
              <span className="tnum" style={{ color: up ? 'rgb(var(--up))' : 'rgb(var(--down))', fontWeight: 600 }}>
                {(up ? '+' : '') + P.todayPct.toFixed(2)}%
              </span>
              <span style={{ color: 'rgb(var(--text-3) / 0.62)' }}>Today</span>
            </div>
          </div>

          {/* Specification call-out */}
          <div style={{ margin: '0 16px 14px', padding: '14px 16px',
                          background: 'rgb(var(--surface-1))', borderRadius: 12,
                          boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              Large-title collapse spec
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 14px',
                            fontSize: 11.5, color: 'rgb(var(--text-2) / 0.62)' }}>
              <span style={{ color: 'rgb(var(--text-3) / 0.38)' }}>Frame 0</span>
              <span>scrollY = 0 · large 34/800 title visible · no nav bar title</span>
              <span style={{ color: 'rgb(var(--text-3) / 0.38)' }}>Frame 1</span>
              <span>scrollY 12–36 · transition zone · title scales 34 → 17 · nav fades 0 → 1</span>
              <span style={{ color: 'rgb(var(--mint))', fontWeight: 700 }}>Frame 2</span>
              <span style={{ color: 'rgb(var(--text))' }}>scrollY ≥ 36 · 17/600 nav · sticky · backdrop blur · hairline-bottom appears</span>
            </div>
          </div>

          {/* Mini holdings */}
          <div style={{ padding: '0 20px' }}>
            {POSITIONS.slice(0, 3).map((p, i, arr) => (
              <UniRow key={p.sym} s={p.symbol} mode="position"
                      position={p} showAccountDot hidden={hide}
                      last={i === arr.length - 1}/>
            ))}
          </div>
        </div>
        <IOSTabBarV2 active="home"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS WATCHLIST SWIPE ACTION (R-I4)
// ─────────────────────────────────────────────────────────────────
function IOSWatchlistSwipeAction({ tweaks, height = 844 }) {
  const wlSlice = WATCHLIST.slice(0, 6);
  const hide = !!tweaks.privacy;
  const SWIPE_PX = 144;     // 96px reveal × 1.5 for visibility
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          <div style={{ padding: '4px 16px 14px',
                          display: 'flex', alignItems: 'center', gap: 12 }}>
            <ProfileAvatar profile={profileById('sam')} size={28}/>
            <div style={{ flex: 1, fontSize: 22, fontWeight: 800,
                            letterSpacing: '-0.02em' }}>
              Watchlist
            </div>
            <span className="iconbtn"><Icon name="search" size={13}/></span>
          </div>

          {/* List with one row mid-swipe */}
          <div style={{ padding: '0 20px' }}>
            {wlSlice.map((s, i) => {
              const isSwipe = i === 2;
              if (!isSwipe) {
                return (
                  <UniRow key={s.symbol} s={s} mode="watch" hidden={hide}
                          last={i === wlSlice.length - 1}/>
                );
              }
              return (
                <div key={s.symbol} style={{
                  position: 'relative',
                  borderBottom: '.5px solid rgb(var(--separator-alpha))',
                  overflow: 'hidden',
                }}>
                  {/* Reveal slots (behind) */}
                  <div style={{
                    position: 'absolute', top: 0, bottom: 0, right: 0,
                    display: 'flex', gap: 0,
                  }}>
                    <div style={{
                      width: SWIPE_PX / 2,
                      background: 'rgb(var(--mint))', color: '#07120D',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 4,
                      fontSize: 11.5, fontWeight: 700,
                    }}>
                      <Icon name="plus" size={16} color="#07120D" strokeWidth={2.5}/>
                      Hold
                    </div>
                    <div style={{
                      width: SWIPE_PX / 2,
                      background: 'rgb(var(--down))', color: '#fff',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 4,
                      fontSize: 11.5, fontWeight: 700,
                    }}>
                      <Icon name="trash" size={15} color="#fff" strokeWidth={2.4}/>
                      Remove
                    </div>
                  </div>
                  {/* The shifted row */}
                  <div style={{
                    transform: `translateX(-${SWIPE_PX}px)`,
                    background: 'rgb(var(--bg))',
                  }}>
                    <UniRow s={s} mode="watch" hidden={hide} last/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gesture spec callout */}
          <div style={{ margin: '20px 16px', padding: '14px 16px',
                          background: 'rgb(var(--surface-1))',
                          borderRadius: 12,
                          boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              Swipe-actions spec
            </div>
            <div style={{ fontSize: 11.5, color: 'rgb(var(--text-2) / 0.62)', lineHeight: 1.5 }}>
              Tracks finger horizontally · max reveal 96px · spring{' '}
              <span style={{ color: 'rgb(var(--mint))', fontWeight: 700 }}>stiffness 350 damping 30</span>{' '}
              · threshold 60% reveals → release commits · else snap back.
            </div>
          </div>
        </div>
        <IOSTabBarV2 active="home"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS LONG-PRESS CONTEXT MENU (R-I4)
// ─────────────────────────────────────────────────────────────────
function IOSWatchlistLongPress({ tweaks, height = 1020 }) {
  const target = SYMBOLS['AAPL'];
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body" style={{ position: 'relative' }}>
          {/* Dimmed/blurred background */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgb(0 0 0 / 0.4)', backdropFilter: 'blur(20px)',
            zIndex: 2,
          }}/>

          {/* Lifted row at top (scaled up) */}
          <div style={{
            position: 'absolute', left: 16, right: 16, top: 60, zIndex: 3,
            background: 'rgb(var(--surface-1))',
            borderRadius: 14,
            padding: '4px 16px',
            transform: 'scale(1.04)',
            boxShadow: '0 24px 60px rgb(0 0 0 / 0.55)',
          }}>
            <UniRow s={target} mode="watch" hidden={false} last/>
          </div>

          {/* Context menu popover */}
          <div style={{
            position: 'absolute', left: 26, right: 26, top: 200, zIndex: 4,
            background: 'rgb(50 50 55 / 0.96)',
            backdropFilter: 'blur(40px) saturate(180%)',
            border: '.5px solid rgb(255 255 255 / 0.10)',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgb(0 0 0 / 0.55)',
          }}>
            {[
              { icon: 'plus',  label: 'Add to Holdings' },
              { icon: 'star',  label: 'Add to another watchlist' },
              { icon: 'bell',  label: 'Set price alert' },
              { icon: 'chart', label: 'View symbol' },
              { sep: true },
              { icon: 'tag',   label: 'Copy ticker' },
              { icon: 'arrow-r', label: 'Share' },
              { sep: true },
              { icon: 'trash', label: 'Remove from list', danger: true },
            ].map((row, i) => {
              if (row.sep) return (
                <div key={'sep-' + i} style={{ height: .5, background: 'rgb(255 255 255 / 0.08)' }}/>
              );
              return (
                <div key={row.label} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 16px',
                  fontSize: 15, fontWeight: 500,
                  color: row.danger ? 'rgb(var(--down))' : 'rgb(var(--text))',
                }}>
                  <span style={{ flex: 1 }}>{row.label}</span>
                  <Icon name={row.icon} size={16}
                        color={row.danger ? 'rgb(var(--down))' : 'rgb(var(--text))'}/>
                </div>
              );
            })}
          </div>

          {/* Gesture spec at bottom */}
          <div style={{
            position: 'absolute', left: 16, right: 16, bottom: 110, zIndex: 4,
            padding: '14px 16px',
            background: 'rgb(var(--surface-1) / 0.96)',
            borderRadius: 12,
            boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              Long-press spec
            </div>
            <div style={{ fontSize: 11.5, color: 'rgb(var(--text-2) / 0.62)', lineHeight: 1.5 }}>
              480ms press · source scales 1.00 → 0.96 → 1.04 ·
              backdrop blur 0 → 24px · menu slides from source rect 320ms ease-out.
            </div>
          </div>

          {/* Faint underlying list (visible through blur) */}
          <div style={{ padding: '8px 16px 16px', opacity: 0.3 }}>
            {WATCHLIST.slice(0, 6).map((s, i, arr) => (
              <UniRow key={s.symbol} s={s} mode="watch" hidden={false}
                      last={i === arr.length - 1}/>
            ))}
          </div>
        </div>
        <IOSTabBarV2 active="home"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS PULL-TO-REFRESH (R-I4)
// ─────────────────────────────────────────────────────────────────
function IOSDashboardPullRefresh({ tweaks, height = 980 }) {
  const hide = !!tweaks.privacy;
  const P = PORTFOLIO;
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* Refresh indicator (peak position) */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '24px 0 16px',
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32"
                 style={{ animation: 'spin 1s linear infinite' }}>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <circle cx="16" cy="16" r="13"
                       fill="none"
                       stroke="rgb(var(--mint))"
                       strokeWidth="2.2"
                       strokeLinecap="round"
                       strokeDasharray="60 30"
                       opacity="0.85"/>
            </svg>
            <div style={{ fontSize: 11, color: 'rgb(var(--mint))', marginTop: 6, fontWeight: 600 }}>
              Refreshing…
            </div>
          </div>

          {/* Pulled-down content (offset visually) */}
          <div style={{ padding: '0 16px 14px',
                          display: 'flex', alignItems: 'center', gap: 12 }}>
            <ProfileAvatar profile={profileById('sam')} size={28}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.62)' }}>Good evening, Sam</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>Home</div>
            </div>
          </div>

          <div style={{ margin: '0 16px 14px', padding: '14px 18px',
                          borderRadius: 16, background: 'rgb(var(--surface-1))',
                          boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)' }}>
            <div style={{ fontSize: 11, fontWeight: 700,
                            letterSpacing: 0.08, textTransform: 'uppercase',
                            color: 'rgb(var(--sec-portfolio))' }}>Net Worth</div>
            <PriceText value={P.netWorth} hidden={hide} prefix="$"
                       style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.025em', marginTop: 6 }}/>
            <div style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.38)', marginTop: 4 }}>
              Quote feed reconnecting · expect fresh data in a moment
            </div>
          </div>

          {/* Spec callout */}
          <div style={{ margin: '20px 16px', padding: '14px 16px',
                          background: 'rgb(var(--surface-1))', borderRadius: 12,
                          boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              Pull-to-refresh spec
            </div>
            <div style={{ fontSize: 11.5, color: 'rgb(var(--text-2) / 0.62)', lineHeight: 1.5 }}>
              Elastic resistance 0.5 above scroll-top · threshold{' '}
              <span style={{ color: 'rgb(var(--mint))', fontWeight: 700 }}>64px</span> ·
              rotating arc spinner (mint) · light haptic at threshold + completion.
            </div>
          </div>
        </div>
        <IOSTabBarV2 active="home"/>
      </div>
    </div>
  );
}

Object.assign(window, {
  WizardSteps, CSVHeader,
  IOSCSVImportPick, IOSCSVImportMap, IOSCSVImportReview, IOSCSVImportDone,
  MacSearchPalette, IOSSearchFullscreen,
  IOSHomeCollapsed,
  IOSWatchlistSwipeAction, IOSWatchlistLongPress, IOSDashboardPullRefresh,
});
