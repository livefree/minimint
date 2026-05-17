// screens-v4-feedback.jsx — closes FEEDBACK-v3.md items
//
// P0-3 IOSAccountColorPicker  (R-N2.b assignment rule + 8-swatch grid)
// P1-4 MarketStatusStrip variants (Pre / Open / After / Closed)
// P1-5 IOSProfilePINEntry  (full-screen numpad + shake + forgot escape)
// P1-6 IOSDashboardCollapsed  (R-I3 third frame)
// P1-7 IOSPortfolioOverflowMenu_v2  (reconciled with REVISIONS R-N4)
// P1-8 IOSTradeSheetError      (hard validation semantic + error banner)
// P2-9 MacMarket{Overview,Stocks,ETF,News}
// P2-10 IOSSymbolCostMarkers   (cost line + buy/sell markers on price chart)
// P2-11 IOSTradeSheetDuplicate, IOSTradeSheetBatchEntry  (R-U4 polish)
// P2-12 IOSUpcomingEventDetail (R-U6)
// P2-13 Onboarding 5 frames    (R-U7)
// P2-14 IOSPrivacyL2           (profile name → P1/P2/P3 mask)

// ─────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────
function FBNavHeader({ title, leading, trailing, eyebrow, accent }) {
  return (
    <div style={{
      padding: '6px 16px 12px',
      display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 10,
    }}>
      <div>{leading}</div>
      <div style={{ textAlign: 'center' }}>
        {eyebrow && (
          <div className="t-meta" style={{ color: accent || 'rgb(var(--text-3) / 0.62)' }}>
            {eyebrow}
          </div>
        )}
        <div style={{ fontSize: 'var(--t-row-strong-2)', fontWeight: 'var(--weight-bold)' }}>
          {title}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>{trailing}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// P0-3 — Account color picker (8-swatch grid)
// ─────────────────────────────────────────────────────────────────
function IOSAccountColorPicker({ tweaks, height = 980 }) {
  const profile = profileById('sam');
  const c = profileRgb(profile);

  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          <FBNavHeader
            title="Edit Account"
            leading={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                                      color: c, fontSize: 'var(--t-base)',
                                      fontWeight: 'var(--weight-semi)' }}>
              <Icon name="chevron-l" size={14} color={c}/> Portfolio
            </span>}
            trailing={<span style={{ fontSize: 'var(--t-base)',
                                      fontWeight: 'var(--weight-bold)', color: c }}>Save</span>}
          />

          {/* Profile-attributed header */}
          <div style={{
            margin: '8px 16px 14px', padding: '14px 16px',
            background: profileRgb(profile, 0.10),
            border: `.5px solid ${profileRgb(profile, 0.32)}`,
            borderRadius: 16,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <ProfileAvatar profile={profile} size={36}/>
            <div style={{ flex: 1 }}>
              <div className="t-eyebrow" style={{ color: c }}>EDITING FOR</div>
              <div style={{ fontSize: 'var(--t-row-strong-2)',
                              fontWeight: 'var(--weight-black)', marginTop: 3 }}>
                {profile.name}
              </div>
            </div>
          </div>

          {/* Account preview card */}
          <div className="t-meta" style={{ padding: '8px 20px 6px' }}>ACCOUNT</div>
          <div style={{ margin: '0 16px 14px' }}>
            <div style={{
              position: 'relative', overflow: 'hidden',
              background: 'rgb(var(--surface-1))', borderRadius: 16,
              boxShadow: 'var(--hairline-top)',
              padding: '14px 16px 14px 22px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{
                position: 'absolute', top: 0, bottom: 0, left: 0, width: 4,
                background: 'rgb(var(--acct-plum))',
              }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--t-base)', fontWeight: 'var(--weight-bold)' }}>
                  Fidelity · Individual
                </div>
                <div className="t-aux" style={{ marginTop: 3 }}>•••• 2645 · 7 positions</div>
              </div>
            </div>
          </div>

          {/* Form: Name / Broker / Last 4 */}
          <div style={{ margin: '0 16px 14px',
                          background: 'rgb(var(--surface-1))',
                          borderRadius: 16, boxShadow: 'var(--hairline-top)',
                          overflow: 'hidden' }}>
            {[
              { lbl: 'Name', value: 'Individual' },
              { lbl: 'Broker', value: 'Fidelity' },
              { lbl: 'Account •••• 4', value: '2645' },
            ].map((f, i, arr) => (
              <div key={f.lbl} style={{
                padding: '12px 16px',
                borderBottom: i === arr.length - 1 ? 'none' : '.5px solid var(--separator)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{ flex: 1, fontSize: 'var(--t-base)',
                                fontWeight: 'var(--weight-medium)' }}>{f.lbl}</span>
                <span className="tnum" style={{ fontSize: 'var(--t-base)',
                                                  fontWeight: 'var(--weight-semi)',
                                                  color: 'rgb(var(--text-2) / 0.62)' }}>{f.value}</span>
              </div>
            ))}
          </div>

          {/* Color section */}
          <div className="t-meta" style={{ padding: '8px 20px 8px' }}>COLOR</div>
          <div style={{
            margin: '0 16px 14px',
            background: 'rgb(var(--surface-1))', borderRadius: 16,
            boxShadow: 'var(--hairline-top)',
            padding: '14px 14px 8px',
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
            }}>
              {ACCT_PALETTE.map((sw, i) => {
                const active = sw.id === 'plum';
                return (
                  <div key={sw.id} style={{
                    position: 'relative',
                    height: 64, borderRadius: 12,
                    background: sw.rgb,
                    boxShadow: active ? '0 0 0 3px rgb(var(--surface-1)), 0 0 0 5px rgb(var(--text))'
                                        : 'inset 0 1px 0 rgb(255 255 255 / 0.16)',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                    padding: '0 8px 6px',
                  }}>
                    {active && (
                      <span style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 18, height: 18, borderRadius: '50%',
                        background: 'rgb(var(--text))', color: 'rgb(var(--surface-1))',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon name="check" size={11}/>
                      </span>
                    )}
                    <span style={{
                      fontSize: 'var(--t-meta)', fontWeight: 'var(--weight-bold)',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: 'rgb(var(--on-warm))',
                    }}>{sw.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Helper rule */}
            <div style={{
              marginTop: 14, padding: '12px 12px',
              borderTop: '.5px solid var(--separator)',
              fontSize: 'var(--t-aux)',
              color: 'rgb(var(--text-2) / 0.62)', lineHeight: 1.45,
            }}>
              <b style={{ color: 'rgb(var(--text))' }}>Assignment rule:</b> New accounts pick
              the next unused color in this order (Ocean → Bronze → Plum → Olive → Slate
              → Steel → Rust → Sand). Cycles after 8. You can change it any time;
              other accounts' colors are preserved.
            </div>
          </div>

          {/* Where this color shows */}
          <div className="t-meta" style={{ padding: '8px 20px 6px' }}>WHERE IT SHOWS</div>
          <div style={{
            margin: '0 16px 24px',
            padding: '12px 14px',
            background: 'rgb(var(--surface-1))', borderRadius: 14,
            boxShadow: 'var(--hairline-top)',
            display: 'flex', flexDirection: 'column', gap: 8,
            fontSize: 'var(--t-body)', color: 'rgb(var(--text-2) / 0.62)',
          }}>
            {[
              { ico: 'briefcase', t: 'Home · Accounts ribbon top stripe' },
              { ico: 'grid',      t: 'Portfolio · Positions row left edge (All accounts mode)' },
              { ico: 'chart',     t: 'Symbol detail · My Position per-account row' },
              { ico: 'tag',       t: 'Trade Sheet · account dropdown swatch' },
            ].map((r) => (
              <div key={r.t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name={r.ico} size={14} color="rgb(var(--text-3) / 0.62)"/>
                {r.t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// P1-4 — Market status strip 4 variants
// ─────────────────────────────────────────────────────────────────
function MarketStatusVariant({ kind }) {
  // kind: 'pre' | 'open' | 'after' | 'closed'
  const cfg = {
    pre: {
      dot: 'rgb(var(--sec-activity))',
      label: 'Pre-market',
      time: 'Opens in 1h 14m · 09:30 ET',
      pct:  '+0.42%',
      pctUp: true,
    },
    open: {
      dot: 'rgb(var(--up))',
      label: 'Markets Open',
      time: 'Closes in 2h 14m · 16:00 ET',
      pct:  '−1.24%',
      pctUp: false,
    },
    after: {
      dot: 'rgb(var(--sec-symbol))',
      label: 'After-hours',
      time: 'Closes 20:00 ET · Re-opens 09:30',
      pct:  '+0.18%',
      pctUp: true,
    },
    closed: {
      dot: 'rgb(var(--text-3) / 0.42)',
      label: 'Markets Closed',
      time: 'Weekend · Opens Mon 09:30 ET',
      pct:  'Fri close',
      pctUp: false,
      muted: true,
    },
  }[kind];

  return (
    <div style={{
      height: 32, padding: '0 18px',
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'rgb(var(--bg-elev) / 0.6)',
      backdropFilter: 'blur(18px) saturate(160%)',
      WebkitBackdropFilter: 'blur(18px) saturate(160%)',
      borderTop:    '.5px solid var(--separator)',
      borderBottom: '.5px solid var(--separator)',
      fontSize: 'var(--t-aux)',
      fontWeight: 'var(--weight-semi)',
      color: 'rgb(var(--text-2) / 0.62)',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: cfg.dot,
        boxShadow: kind === 'open' ? `0 0 0 3px ${cfg.dot.replace(')', ' / 0.22)')}` : 'none',
      }}/>
      <span style={{
        color: cfg.muted ? 'rgb(var(--text-3) / 0.62)' : 'rgb(var(--text))',
        fontWeight: 'var(--weight-bold)',
      }}>{cfg.label}</span>
      <span style={{ flex: 1 }}>· {cfg.time}</span>
      <span className="tnum" style={{
        padding: '2px 7px', borderRadius: 5,
        fontSize: 'var(--t-caption)',
        fontWeight: 'var(--weight-bold)',
        background: cfg.muted ? 'rgb(var(--surface-2))'
                  : cfg.pctUp ? 'rgb(var(--up) / 0.18)' : 'rgb(var(--down) / 0.18)',
        color: cfg.muted ? 'rgb(var(--text-2) / 0.62)'
                : cfg.pctUp ? 'rgb(var(--up))' : 'rgb(var(--down))',
      }}>
        S&P {cfg.pct}
      </span>
    </div>
  );
}

function MarketStatusStripVariants({ tweaks, height = 844 }) {
  const variants = [
    { kind: 'pre',    label: 'Pre-market (06:00–09:30 ET)',
      use: 'Sec-activity amber dot · countdown to open · pre-market %' },
    { kind: 'open',   label: 'Regular hours (09:30–16:00)',
      use: 'Live mint dot with pulse halo · countdown to close · live %' },
    { kind: 'after',  label: 'After-hours (16:00–20:00)',
      use: 'Lavender dot · close + reopen times · after-hours %' },
    { kind: 'closed', label: 'Weekend / Holiday',
      use: 'Dim dot · next-open countdown · last close % (muted)' },
  ];
  return (
    <div className="ios" style={{ height, background: 'rgb(var(--bg-elev))' }}>
      <div style={{ padding: '40px 24px 8px' }}>
        <div className="t-eyebrow" style={{ color: 'rgb(var(--mint))' }}>R-N1 · MarketStatusStrip</div>
        <div className="t-h" style={{ marginTop: 6 }}>4 session states</div>
        <div className="t-aux" style={{ marginTop: 4, lineHeight: 1.4 }}>
          Sits directly under the NavHeader on Home. Same height (32pt) regardless
          of state — content swap only, no layout shift.
        </div>
      </div>

      {variants.map((v) => (
        <div key={v.kind} style={{ padding: '18px 24px 4px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
          }}>
            <span style={{ fontSize: 'var(--t-meta)', fontWeight: 'var(--weight-bold)',
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: 'rgb(var(--text-2) / 0.62)' }}>
              {v.label}
            </span>
          </div>
          <div style={{
            margin: '0 -24px',
            borderRadius: 0,
            boxShadow: 'var(--hairline-top)',
            background: 'rgb(var(--bg))',
          }}>
            <MarketStatusVariant kind={v.kind}/>
          </div>
          <div className="t-aux" style={{ padding: '8px 4px 0', lineHeight: 1.4 }}>
            {v.use}
          </div>
        </div>
      ))}

      <div style={{ padding: '16px 24px',
                      fontSize: 'var(--t-aux)', color: 'rgb(var(--text-3) / 0.62)',
                      lineHeight: 1.45 }}>
        <b>Logic:</b> session is detected from the current ET time vs market
        calendar; pct values come from Yahoo/Finnhub's pre/regular/post fields.
        Holidays follow NYSE calendar API.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// P1-5 — IOSProfilePINEntry (full-screen numpad + shake + forgot)
// ─────────────────────────────────────────────────────────────────
function IOSProfilePINEntryV2({ tweaks, height = 980, state = 'idle' }) {
  // state: 'idle' | 'wrong' | 'cooldown'
  const profile = profileById('mom');
  const c = profileRgb(profile);
  const filled = state === 'wrong' ? 4 : 3;

  return (
    <div className="ios" style={{ height, background: 'rgb(var(--bg))' }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body" style={{
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Nav */}
          <div style={{ padding: '4px 16px 0',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                            color: 'rgb(var(--mint))', fontSize: 'var(--t-base)',
                            fontWeight: 'var(--weight-semi)' }}>
              <Icon name="x" size={14} color="rgb(var(--mint))"/> Cancel
            </span>
            <span style={{ fontSize: 'var(--t-base)',
                            color: 'rgb(var(--text-2) / 0.62)' }}>3 of 3 attempts</span>
          </div>

          {/* Profile chip + title */}
          <div style={{
            marginTop: 30, padding: '0 24px', textAlign: 'center',
            transform: state === 'wrong' ? 'translateX(0)' : 'none',
          }}>
            <ProfileAvatar profile={profile} size={84}
                            style={{ margin: '0 auto' }}/>
            <div className="t-meta" style={{ marginTop: 16, color: c }}>SWITCHING TO</div>
            <div style={{ fontSize: 'var(--t-h-3)', fontWeight: 'var(--weight-black)',
                            letterSpacing: '-0.02em', marginTop: 6, color: c }}>
              {profile.name}
            </div>
            <div className="t-aux" style={{ marginTop: 6, lineHeight: 1.4 }}>
              {profile.display_name} · enter PIN to continue
            </div>
          </div>

          {/* PIN dots — wrapped in shake container if wrong */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 22, padding: '32px 0 6px',
            animation: state === 'wrong' ? 'shake 0.4s' : 'none',
          }}>
            {[0, 1, 2, 3].map((i) => {
              const on = i < filled;
              const isWrong = state === 'wrong';
              return (
                <span key={i} style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: on
                    ? (isWrong ? 'rgb(var(--down))' : c)
                    : 'transparent',
                  border: on ? 'none' : `2px solid ${isWrong ? 'rgb(var(--down) / 0.6)' : profileRgb(profile, 0.42)}`,
                  boxShadow: on && !isWrong ? `0 0 12px ${profileRgb(profile, 0.7)}` : 'none',
                }}/>
              );
            })}
          </div>

          {/* Error message (only when wrong) */}
          <div style={{ height: 28, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', padding: '4px 24px' }}>
            {state === 'wrong' && (
              <span style={{ fontSize: 'var(--t-aux)',
                              fontWeight: 'var(--weight-semi)',
                              color: 'rgb(var(--down))' }}>
                Incorrect PIN · 1 attempt remaining
              </span>
            )}
            {state === 'cooldown' && (
              <span style={{ fontSize: 'var(--t-aux)',
                              fontWeight: 'var(--weight-semi)',
                              color: 'rgb(var(--down))' }}>
                Try again in 0:27
              </span>
            )}
          </div>

          <div style={{ flex: 1 }}/>

          {/* Numpad — iOS-passcode style: large circular buttons */}
          <div style={{ padding: '0 48px 8px' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20, justifyItems: 'center',
            }}>
              {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
                <button key={i} style={{
                  appearance: 'none', border: 0,
                  width: 76, height: 76, borderRadius: '50%',
                  background: k === '' ? 'transparent'
                            : k === '⌫' ? 'transparent'
                            : 'rgb(var(--surface-2))',
                  color: 'rgb(var(--text))',
                  fontSize: 'var(--t-display)',
                  fontWeight: 'var(--weight-regular)',
                  fontVariantNumeric: 'tabular-nums',
                }}>{k}</button>
              ))}
            </div>
          </div>

          {/* Bottom row — Forgot escape + disclaimer */}
          <div style={{ padding: '14px 24px 30px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--t-aux)',
                            fontWeight: 'var(--weight-semi)',
                            color: 'rgb(var(--mint))' }}>
              Forgot PIN? Use app password →
            </span>
            <span style={{ fontSize: 'var(--t-meta)',
                            color: 'rgb(var(--text-3) / 0.42)' }}>
              Not a security boundary · R-P6
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// P1-6 — IOSDashboardCollapsed (R-I3 third frame, Home tab)
// ─────────────────────────────────────────────────────────────────
function IOSDashboardCollapsed({ tweaks, height = 1080 }) {
  const P = PORTFOLIO;
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body" style={{ overflow: 'auto' }}>
          {/* Collapsed nav with profile name in profile color */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 5,
            padding: '8px 16px 10px',
            background: 'rgb(7 7 10 / 0.72)',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            borderBottom: '.5px solid var(--separator-strong)',
            display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 10,
          }}>
            <ProfileChip size={28}/>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 'var(--t-row-strong-2)',
                fontWeight: 'var(--weight-bold)',
                color: 'rgb(var(--p-1))',
              }}>Sam · Home</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="iconbtn"><Icon name="search" size={13}/></span>
              <span className="iconbtn"><Icon name="bell" size={13}/></span>
            </div>
          </div>

          <SpecChip at="scrollY ≥ 36" label="profile name in profile color (R-P2)"/>

          <MarketStatusVariant kind="open"/>

          {/* Compact hero — smaller because we're scrolled */}
          <div style={{ padding: '14px 16px 8px' }}>
            <div style={{
              background: 'rgb(var(--surface-1))',
              borderRadius: 18,
              boxShadow: 'var(--hairline-top)',
              backgroundImage: 'var(--hero-grad-up)',
              padding: '16px 18px',
            }}>
              <div className="t-meta">NET WORTH</div>
              <div className="tnum" style={{
                fontSize: 'var(--t-display)',
                fontWeight: 'var(--weight-black)',
                letterSpacing: '-0.025em', marginTop: 4,
              }}>
                {fmtMoney(P.netWorth, { cents: false })}
              </div>
              <div className="tnum" style={{ marginTop: 4,
                                                fontSize: 'var(--t-body)',
                                                fontWeight: 'var(--weight-bold)',
                                                color: P.todayPL >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                {(P.todayPL >= 0 ? '+' : '') + fmtMoney(P.todayPL)} ({fmtPct(P.todayPct)}) today
              </div>
            </div>
          </div>

          {/* AccountsRibbon */}
          <div style={{ padding: '6px 20px 8px',
                          display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 18, height: 2, background: SEC.portfolio,
                            borderRadius: 2, opacity: 0.65 }}/>
            <span className="t-eyebrow" style={{ color: SEC.portfolio }}>Accounts</span>
          </div>
          <div style={{ padding: '0 16px', display: 'flex', gap: 10, overflow: 'hidden' }}>
            {accountsForProfile('sam').map((a) => {
              const mv = a.holdings.reduce((s, h) => s + h.qty * SYMBOLS[h.sym].price, 0);
              const today = a.holdings.reduce((s, h) => s + h.qty * SYMBOLS[h.sym].change, 0);
              return (
                <div key={a.id} style={{
                  flex: '1 1 0', minWidth: 0,
                  position: 'relative', overflow: 'hidden',
                  background: 'rgb(var(--surface-1))',
                  borderRadius: 14, boxShadow: 'var(--hairline-top)',
                  padding: '10px 12px 12px',
                }}>
                  <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                                  background: ACCT_COLORS[a.id] }}/>
                  <div className="t-meta" style={{ marginTop: 4 }}>
                    {a.broker.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 'var(--t-base)', fontWeight: 'var(--weight-bold)',
                                  marginTop: 3 }}>{a.name}</div>
                  <div className="tnum" style={{ fontSize: 'var(--t-row-strong)',
                                                    fontWeight: 'var(--weight-black)', marginTop: 8 }}>
                    {fmtMoney(mv, { cents: false })}
                  </div>
                  <div className="tnum" style={{ fontSize: 'var(--t-meta)',
                                                    fontWeight: 'var(--weight-bold)', marginTop: 4,
                                                    color: today >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                    {(today >= 0 ? '+' : '') + fmtMoney(Math.abs(today))} today
                  </div>
                </div>
              );
            })}
          </div>

          {/* Watchlist mini */}
          <div style={{ padding: '14px 20px 6px',
                          display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 18, height: 2, background: SEC.watchlist,
                            borderRadius: 2, opacity: 0.65 }}/>
            <span className="t-eyebrow" style={{ color: SEC.watchlist }}>Watchlist</span>
          </div>
          <div style={{ margin: '0 16px',
                          background: 'rgb(var(--surface-1))', borderRadius: 14,
                          boxShadow: 'var(--hairline-top)', overflow: 'hidden' }}>
            {WATCHLIST.slice(0, 5).map((s, i) => (
              <StockRow key={s.symbol} s={s} layout="apple" last={i === 4}/>
            ))}
          </div>
        </div>
        <IOSTabBarV2 active="home"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// P1-7 — IOSPortfolioOverflowMenu_v2 — reconciled to R-N4 + new spec
// ─────────────────────────────────────────────────────────────────
//
// REVISIONS R-N4 source-of-truth menu items (after this pass):
//   • Record trade
//   • Refresh quotes        (now restored)
//   • Import CSV…           (R-SC2 entry)
//   • Export CSV
//   • Sort by…              (sub-menu)
//   • Edit columns…
//   • Hide closed positions
//   • Set alert…            (R-U6)
//   • Privacy mode toggle
//
function IOSPortfolioOverflowMenuV2({ tweaks, height = 980 }) {
  return (
    <div className="ios" style={{ height, position: 'relative' }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body" style={{ opacity: 0.45 }}>
          {/* dimmed background */}
          <div style={{ padding: '4px 16px 12px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <ProfileChip/>
            <div style={{ fontSize: 'var(--t-h-sub)', fontWeight: 'var(--weight-bold)' }}>Portfolio</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="iconbtn" style={{ outline: '2px solid rgb(var(--mint))', outlineOffset: 2 }}>
                <Icon name="more" size={15}/>
              </span>
              <span className="iconbtn"><Icon name="search" size={14}/></span>
            </div>
          </div>
        </div>
      </div>

      {/* Popover */}
      <div style={{
        position: 'absolute', top: 86, right: 14, width: 280,
        background: 'rgb(50 50 55 / 0.94)',
        border: '.5px solid rgb(255 255 255 / 0.10)', borderRadius: 14,
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        boxShadow: '0 16px 40px rgb(0 0 0 / 0.45)',
        overflow: 'hidden',
        color: 'rgb(var(--text))',
      }}>
        {[
          { lbl: 'Record trade',         icon: 'plus',     sub: 'For Sam · Fidelity Individual' },
          { lbl: 'Refresh quotes',       icon: 'refresh',  trail: '15:35:42' },
          { div: true },
          { lbl: 'Import CSV…',          icon: 'arrow-u' },
          { lbl: 'Export CSV',           icon: 'arrow-r' },
          { div: true },
          { lbl: 'Sort by…',             icon: 'arrow-ud', trail: 'Mkt Value ↓' },
          { lbl: 'Edit columns…',        icon: 'grid' },
          { lbl: 'Hide closed positions',icon: 'eye-off' },
          { lbl: 'Set alert…',           icon: 'bell' },
          { div: true },
          { lbl: 'Privacy mode',         icon: 'eye-off',  toggle: false },
        ].map((m, i) => (
          m.div
            ? <div key={'d' + i} style={{
                height: '.5px', background: 'rgb(255 255 255 / 0.08)', margin: '4px 0',
              }}/>
            : (
              <div key={m.lbl} style={{
                padding: '11px 16px',
                display: 'grid', gridTemplateColumns: '22px 1fr auto', gap: 12, alignItems: 'center',
                fontSize: 'var(--t-base)', fontWeight: 'var(--weight-medium)',
              }}>
                <Icon name={m.icon} size={15} color="rgb(var(--text))"/>
                <span>
                  {m.lbl}
                  {m.sub && <div className="t-aux" style={{ marginTop: 2 }}>{m.sub}</div>}
                </span>
                {m.trail !== undefined && (
                  <span className="t-aux tnum" style={{ textAlign: 'right' }}>{m.trail}</span>
                )}
                {m.toggle !== undefined && (
                  <span className={'ios-switch' + (m.toggle ? ' on' : '')}
                        style={{ transform: 'scale(0.7)' }}/>
                )}
              </div>
            )
        ))}
      </div>

      {/* Spec footnote */}
      <div style={{
        position: 'absolute', left: 16, bottom: 24, right: 16,
        padding: '10px 12px', borderRadius: 10,
        background: 'rgb(var(--sec-activity) / 0.10)',
        border: '.5px solid rgb(var(--sec-activity) / 0.30)',
        color: 'rgb(var(--sec-activity))',
        fontSize: 'var(--t-meta)', fontWeight: 'var(--weight-bold)',
        letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.4,
      }}>
        R-N4 reconciled · adds Refresh + Set alert · same list lands on Home overflow + Symbol "…"
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// P1-8 — IOSTradeSheetError (hard validation semantic)
// ─────────────────────────────────────────────────────────────────
function IOSTradeSheetError({ tweaks, height = 980, sym = 'NVDA' }) {
  const s = SYMBOLS[sym];
  const profile = profileById('sam');
  const c = profileRgb(profile);
  return (
    <div className="ios" style={{ height, position: 'relative' }}>
      <div className="ios-screen" style={{ opacity: 0.35 }}>
        <IOSStatusBar/>
        <div className="ios-body" style={{ padding: '14px 16px' }}>
          <div style={{ height: 60, background: 'rgb(var(--surface-1))', borderRadius: 12 }}/>
          <div style={{ height: 280, marginTop: 14,
                          background: 'rgb(var(--surface-1))', borderRadius: 16 }}/>
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgb(7 7 10 / 0.65)' }}/>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'rgb(28 28 36)',
        borderRadius: '22px 22px 0 0',
        boxShadow: '0 -10px 40px rgb(0 0 0 / 0.5)',
        paddingBottom: 32,
      }}>
        <div style={{ height: 4, background: c, borderRadius: '22px 22px 0 0' }}/>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 2px' }}>
          <span style={{ width: 36, height: 5, borderRadius: 4, background: 'rgb(255 255 255 / 0.22)' }}/>
        </div>

        {/* Profile attribution */}
        <div style={{ padding: '6px 18px 12px',
                        display: 'flex', alignItems: 'center', gap: 12 }}>
          <ProfileAvatar profile={profile} size={36}/>
          <div style={{ flex: 1 }}>
            <div className="t-eyebrow" style={{ color: c }}>RECORDING FOR</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 3 }}>
              <span style={{ fontSize: 'var(--t-row-strong-2)',
                              fontWeight: 'var(--weight-black)' }}>{profile.name}</span>
              <span className="t-aux">selling NVDA</span>
            </div>
          </div>
          <span className="iconbtn"><Icon name="x" size={14}/></span>
        </div>

        {/* Error banner — hard-fail */}
        <div style={{
          margin: '0 14px 12px', padding: '12px 14px',
          background: 'rgb(var(--down) / 0.14)',
          border: '1px solid rgb(var(--down) / 0.42)',
          borderRadius: 12,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: 6, marginTop: 1,
            background: 'rgb(var(--down) / 0.22)', color: 'rgb(var(--down))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="x" size={13} color="rgb(var(--down))"/>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 'var(--t-base)', fontWeight: 'var(--weight-bold)',
                            color: 'rgb(var(--down))' }}>
              Insufficient quantity
            </div>
            <div style={{ fontSize: 'var(--t-aux)', marginTop: 3,
                            color: 'rgb(var(--text-2) / 0.62)', lineHeight: 1.4 }}>
              You hold <b>60 sh</b> of NVDA in Fidelity · Individual. Selling 80 would
              create a short position — not supported in v1.
            </div>
            <div style={{ marginTop: 6, fontSize: 'var(--t-aux)',
                            fontWeight: 'var(--weight-semi)', color: 'rgb(var(--mint))' }}>
              Cap at 60 →
            </div>
          </div>
        </div>

        {/* Side segmented (SELL is selected) */}
        <div style={{ padding: '0 14px 14px' }}>
          <div style={{
            background: 'rgb(var(--surface-1))', borderRadius: 11, padding: 3,
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2,
            boxShadow: 'var(--hairline-top)',
          }}>
            <span style={{
              textAlign: 'center', padding: '10px 0',
              borderRadius: 9, fontSize: 'var(--t-row)', fontWeight: 'var(--weight-semi)',
              color: 'rgb(var(--text-2) / 0.62)',
              letterSpacing: '0.04em',
            }}>BUY</span>
            <span style={{
              textAlign: 'center', padding: '10px 0',
              borderRadius: 9, fontSize: 'var(--t-row)', fontWeight: 'var(--weight-black)',
              background: 'rgb(var(--down))', color: 'rgb(var(--on-warm))',
              letterSpacing: '0.04em',
            }}>SELL</span>
          </div>
        </div>

        {/* Form fields with error-state Quantity */}
        <div style={{ padding: '0 14px',
                        display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { lbl: 'Account', value: 'Fidelity · Individual', hint: '60 sh NVDA available',
              swatch: 'rgb(var(--acct-ocean))' },
            { lbl: 'Quantity', value: '80',
              hint: 'Exceeds available · max 60 sh',
              error: true },
            { lbl: 'Price', value: '$' + s.price.toFixed(2), hint: 'Live' },
            { lbl: 'Date', value: 'May 17, 2026 · 15:35 ET' },
          ].map((f) => (
            <div key={f.lbl} style={{
              padding: '12px 14px 10px', borderRadius: 14,
              background: 'rgb(var(--surface-1))',
              boxShadow: f.error
                ? '0 0 0 2px rgb(var(--down)), var(--hairline-top)'
                : 'var(--hairline-top)',
            }}>
              <div className="t-meta" style={{
                color: f.error ? 'rgb(var(--down))' : 'rgb(var(--text-3) / 0.42)',
              }}>{f.lbl}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                {f.swatch && (
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: f.swatch }}/>
                )}
                <span style={{ flex: 1, fontSize: 'var(--t-row-strong)',
                                fontWeight: 'var(--weight-bold)',
                                color: f.error ? 'rgb(var(--down))' : 'rgb(var(--text))' }}
                      className={(f.lbl === 'Quantity' || f.lbl === 'Price') ? 'tnum' : ''}>
                  {f.value}
                </span>
              </div>
              {f.hint && (
                <div style={{
                  marginTop: 5, fontSize: 'var(--t-aux)',
                  color: f.error ? 'rgb(var(--down))' : 'rgb(var(--text-2) / 0.62)',
                  fontWeight: f.error ? 'var(--weight-semi)' : 'var(--weight-medium)',
                }}>
                  {f.hint}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Disabled CTA */}
        <div style={{ padding: '16px 14px 0' }}>
          <div style={{
            padding: '15px 0', borderRadius: 14, textAlign: 'center',
            background: 'rgb(var(--surface-2))',
            color: 'rgb(var(--text-3) / 0.42)',
            fontSize: 'var(--t-row-strong)', fontWeight: 'var(--weight-black)',
            letterSpacing: '0.01em',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%',
          }}>
            <Icon name="x" size={14} color="rgb(var(--text-3) / 0.42)"/>
            Save disabled — fix errors first
          </div>
        </div>

        {/* Semantic note */}
        <div style={{ padding: '12px 16px 0',
                        fontSize: 'var(--t-meta)', color: 'rgb(var(--text-3) / 0.62)',
                        letterSpacing: '0.04em', textTransform: 'uppercase',
                        fontWeight: 'var(--weight-bold)' }}>
          R-I2 · hard validation · save blocked while ANY field is in error
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// P2-9 — Mac Market sub-pages (Overview / Stocks / ETF / News)
// ─────────────────────────────────────────────────────────────────
function MacMarketChrome({ active, children }) {
  return (
    <div className="mac">
      <MacSidebar active="market"/>
      <MacTitleBar/>
      <div className="mac-main" style={{ padding: '40px 0 0' }}>
        {/* Top bar */}
        <div style={{ padding: '8px 24px 0',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <ProfileChip size={28}/>
            <div className="t-h" style={{ fontSize: 'var(--t-h)' }}>Market</div>
            <div style={{
              padding: '6px 14px', borderRadius: 999,
              background: 'rgb(var(--surface-1))', boxShadow: 'var(--hairline-top)',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-semi)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgb(var(--up))' }}/>
              Markets Open · closes 16:00 ET
            </div>
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
            const a = t === active;
            return (
              <div key={t} style={{
                position: 'relative', padding: '10px 0 14px',
                fontSize: 'var(--t-row)', fontWeight: a ? 'var(--weight-bold)' : 'var(--weight-medium)',
                color: a ? 'rgb(var(--text))' : 'rgb(var(--text-2) / 0.62)',
              }}>
                {t}
                {a && <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0,
                                      height: 2, borderRadius: 2,
                                      background: 'rgb(var(--mint))' }}/>}
              </div>
            );
          })}
        </div>

        {children}
      </div>
    </div>
  );
}

function MacMarketOverview({ tweaks }) {
  const idxData = [
    { sym: 'S&P 500',    last: 5803.40,  pct: -1.24, color: 'rgb(var(--gics-tech))',
      data: walk({ n: 60, startPrice: 5874,  endPrice: 5803.40, seed: 101, vol: 0.005 }) },
    { sym: 'DOW',        last: 42120.30, pct: -1.07, color: 'rgb(var(--gics-financials))',
      data: walk({ n: 60, startPrice: 42575, endPrice: 42120.30, seed: 102, vol: 0.005 }) },
    { sym: 'NASDAQ',     last: 18672.10, pct: -1.54, color: 'rgb(var(--gics-semis))',
      data: walk({ n: 60, startPrice: 18965, endPrice: 18672.10, seed: 103, vol: 0.006 }) },
    { sym: 'Russell 2K', last: 2193.30,  pct: -2.44, color: 'rgb(var(--gics-auto))',
      data: walk({ n: 60, startPrice: 2248,  endPrice: 2193.30, seed: 104, vol: 0.007 }) },
  ];
  const trending = ['NVDA','META','AMZN','AVGO','TSLA','AMD'].map((s) => SYMBOLS[s]);
  const mostActive = ['SPY','QQQ','AAPL','AMD','GOOG','META'].map((s) => SYMBOLS[s]);

  return (
    <MacMarketChrome active="Overview">
      <div style={{ padding: '20px 24px',
                      display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        {/* Left: chart + index list */}
        <div style={{
          background: 'rgb(var(--surface-1))', borderRadius: 16,
          boxShadow: 'var(--hairline-top)',
          padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="t-eyebrow" style={{ color: 'rgb(var(--mint))' }}>US Markets · Normalized</div>
              <div className="t-aux" style={{ marginTop: 3 }}>Last 5 trading days · % change vs start</div>
            </div>
            <RangeChips active="5D" sizes={['1D','5D','1M','6M','YTD','1Y','5Y','ALL']} compact/>
          </div>
          <div style={{ paddingTop: 10 }}>
            <MultiLineChart series={idxData} w={700} h={300}
                              pad={{ l: 0, r: 60, t: 14, b: 24 }}/>
          </div>
          {/* Index list under chart */}
          <div style={{ marginTop: 8,
                          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {idxData.map((ix) => (
              <div key={ix.sym} style={{
                padding: '10px 12px', borderRadius: 10,
                background: 'rgb(var(--surface-2))',
                boxShadow: 'var(--hairline-top)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: ix.color }}/>
                  <span style={{ fontSize: 'var(--t-aux)',
                                  fontWeight: 'var(--weight-bold)' }}>{ix.sym}</span>
                </div>
                <div className="tnum" style={{
                  fontSize: 'var(--t-row-strong)', fontWeight: 'var(--weight-black)',
                  marginTop: 6, letterSpacing: '-0.01em',
                }}>
                  {ix.last.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="tnum" style={{
                  fontSize: 'var(--t-meta)', fontWeight: 'var(--weight-bold)', marginTop: 3,
                  color: ix.pct >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))',
                }}>
                  {(ix.pct >= 0 ? '+' : '') + ix.pct.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Trending + Most Active */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: 'rgb(var(--surface-1))', borderRadius: 16,
            boxShadow: 'var(--hairline-top)', padding: '14px 4px 8px',
          }}>
            <div style={{
              padding: '0 16px 8px', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Icon name="chart" size={12} color="rgb(var(--mint))"/>
                <span className="t-eyebrow" style={{ color: 'rgb(var(--mint))' }}>Trending Now</span>
              </span>
              <span className="t-aux">View all →</span>
            </div>
            {trending.map((s, i) => (
              <div key={s.symbol} style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 70px 70px 64px',
                alignItems: 'center', gap: 10,
                padding: '8px 14px',
                borderBottom: i === trending.length - 1 ? 'none' : '.5px solid var(--separator)',
                fontSize: 'var(--t-stat)',
              }}>
                <span style={{ fontWeight: 'var(--weight-black)' }}>{s.symbol}</span>
                <span className="t-aux">{s.name}</span>
                <span className="tnum" style={{ textAlign: 'right',
                                                  fontWeight: 'var(--weight-bold)' }}>
                  ${s.price.toFixed(2)}
                </span>
                <Sparkline data={s.spark} up={s.up} w={66} h={22}/>
                <span className={'pill-soft ' + (s.up ? 'up' : 'down')}
                      style={{ marginLeft: 'auto', fontSize: 'var(--t-caption)' }}>
                  {(s.pct >= 0 ? '+' : '') + s.pct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>

          <div style={{
            background: 'rgb(var(--surface-1))', borderRadius: 16,
            boxShadow: 'var(--hairline-top)', padding: '14px 4px 8px',
          }}>
            <div className="t-eyebrow" style={{
              padding: '0 16px 6px', color: 'rgb(var(--text-2) / 0.62)',
            }}>Most active</div>
            {mostActive.map((s, i) => (
              <div key={s.symbol} style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 80px 64px',
                alignItems: 'center', gap: 10,
                padding: '8px 14px',
                borderBottom: i === mostActive.length - 1 ? 'none' : '.5px solid var(--separator)',
                fontSize: 'var(--t-stat)',
              }}>
                <span style={{ fontWeight: 'var(--weight-black)' }}>{s.symbol}</span>
                <span className="tnum t-aux" style={{ fontWeight: 'var(--weight-semi)' }}>
                  Vol {(20 + i * 4).toFixed(1)}M
                </span>
                <span className="tnum" style={{ textAlign: 'right',
                                                  fontWeight: 'var(--weight-bold)' }}>
                  ${s.price.toFixed(2)}
                </span>
                <span className={'pill-soft ' + (s.up ? 'up' : 'down')}
                      style={{ marginLeft: 'auto', fontSize: 'var(--t-caption)' }}>
                  {(s.pct >= 0 ? '+' : '') + s.pct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MacMarketChrome>
  );
}

function MacMarketStocks({ tweaks }) {
  const sections = [
    { title: 'Trending stocks', items: ['NVDA','META','AMZN','AVGO','TSLA','AMD','GOOG','SPY'] },
    { title: 'Day gainers',     items: ['MSFT','AAPL','META','COST','SCHD','VTI','BND','VYM'] },
    { title: 'Day losers',      items: ['NVDA','TSLA','AMD','GOOG','AMZN','AVGO','META','QQQ'] },
  ];
  return (
    <MacMarketChrome active="Stocks">
      {/* Chip row */}
      <div style={{ padding: '16px 24px 8px', display: 'flex', gap: 8 }}>
        {['Trending stocks','Most actives','Day gainers','Day losers','Undervalued growth','High dividend'].map((c, i) => (
          <span key={c} style={{
            padding: '6px 14px', borderRadius: 999,
            fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-semi)',
            background: i === 0 ? 'rgb(var(--mint))' : 'rgb(var(--surface-1))',
            color:      i === 0 ? 'rgb(var(--on-mint))' : 'rgb(var(--text-2) / 0.62)',
            boxShadow:  i === 0 ? 'none'                : 'var(--hairline-top)',
          }}>{c}</span>
        ))}
      </div>

      <div style={{ padding: '4px 24px 24px',
                      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {sections.map((sec, i) => (
          <div key={sec.title} style={{
            background: 'rgb(var(--surface-1))', borderRadius: 14,
            boxShadow: 'var(--hairline-top)', padding: '12px 4px 8px',
          }}>
            <div className="t-eyebrow" style={{
              padding: '0 14px 8px',
              color: i === 0 ? 'rgb(var(--mint))'
                   : i === 1 ? 'rgb(var(--up))' : 'rgb(var(--down))',
            }}>{sec.title}</div>
            {sec.items.map((symId, j) => {
              const s = SYMBOLS[symId];
              if (!s) return null;
              const pct = i === 1 ? Math.abs(s.pct) + j * 0.4
                       : i === 2 ? -(Math.abs(s.pct) + j * 0.4)
                       : s.pct;
              return (
                <div key={symId} style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 60px 60px',
                  alignItems: 'center', gap: 8,
                  padding: '7px 14px',
                  borderBottom: j === sec.items.length - 1 ? 'none' : '.5px solid var(--separator)',
                  fontSize: 'var(--t-stat)',
                }}>
                  <span style={{ fontWeight: 'var(--weight-black)' }}>{symId}</span>
                  <span className="t-aux"
                        style={{ overflow: 'hidden', textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap' }}>{s.name}</span>
                  <Sparkline data={s.spark} up={pct >= 0} w={56} h={20}/>
                  <span className={'pill-soft ' + (pct >= 0 ? 'up' : 'down')}
                        style={{ marginLeft: 'auto', fontSize: 'var(--t-caption)' }}>
                    {(pct >= 0 ? '+' : '') + pct.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </MacMarketChrome>
  );
}

function MacMarketETF({ tweaks }) {
  const trending = [
    { sym: 'SPY',  name: 'SPDR S&P 500',              aum: '579B', pct:  1.24, vol: '54.2M' },
    { sym: 'QQQ',  name: 'Invesco QQQ',                aum: '301B', pct:  0.85, vol: '38.7M' },
    { sym: 'VTI',  name: 'Vanguard Total Stock',       aum: '462B', pct:  0.51, vol: '12.4M' },
    { sym: 'VOO',  name: 'Vanguard S&P 500',           aum: '518B', pct:  1.20, vol:  '8.3M' },
    { sym: 'IVV',  name: 'iShares Core S&P 500',       aum: '492B', pct:  1.22, vol:  '6.1M' },
    { sym: 'SCHD', name: 'Schwab US Dividend',         aum:  '71B', pct:  0.42, vol:  '4.2M' },
    { sym: 'ARKK', name: 'ARK Innovation',             aum:  '11B', pct:  4.62, vol: '22.8M' },
    { sym: 'XLE',  name: 'Energy Select Sector',       aum:  '36B', pct: -3.81, vol: '18.6M' },
  ];
  return (
    <MacMarketChrome active="ETF">
      <div style={{ padding: '16px 24px 8px', display: 'flex', gap: 8 }}>
        {['Trending ETFs','Most actives','Day gainers','Day losers'].map((c, i) => (
          <span key={c} style={{
            padding: '6px 14px', borderRadius: 999,
            fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-semi)',
            background: i === 0 ? 'rgb(var(--mint))' : 'rgb(var(--surface-1))',
            color:      i === 0 ? 'rgb(var(--on-mint))' : 'rgb(var(--text-2) / 0.62)',
            boxShadow:  i === 0 ? 'none' : 'var(--hairline-top)',
          }}>{c}</span>
        ))}
      </div>

      <div style={{ padding: '4px 24px 24px' }}>
        <div style={{
          background: 'rgb(var(--surface-1))', borderRadius: 14,
          boxShadow: 'var(--hairline-top)', overflow: 'hidden',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 90px 90px 100px 110px 110px',
            padding: '10px 16px',
            fontSize: 'var(--t-caption)', fontWeight: 'var(--weight-bold)',
            letterSpacing: '0.04em', textTransform: 'uppercase',
            color: 'rgb(var(--text-3) / 0.42)',
            borderBottom: '.5px solid var(--separator-strong)',
          }}>
            <span>Symbol</span><span>Fund</span>
            <span style={{ textAlign: 'right' }}>AUM</span>
            <span style={{ textAlign: 'right' }}>Vol</span>
            <span style={{ textAlign: 'right' }}>Spark</span>
            <span style={{ textAlign: 'right' }}>Last</span>
            <span style={{ textAlign: 'right' }}>% Chg</span>
          </div>
          {trending.map((e, i) => {
            const data = walk({ n: 32, startPrice: 100, endPrice: 100 + e.pct * 4, seed: 200 + i });
            return (
              <div key={e.sym} style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 90px 90px 100px 110px 110px',
                padding: '10px 16px', alignItems: 'center',
                borderBottom: i === trending.length - 1 ? 'none' : '.5px solid var(--separator)',
                fontSize: 'var(--t-stat)',
              }}>
                <span style={{ fontWeight: 'var(--weight-black)' }}>{e.sym}</span>
                <span className="t-aux">{e.name}</span>
                <span className="tnum t-aux" style={{ textAlign: 'right' }}>${e.aum}</span>
                <span className="tnum t-aux" style={{ textAlign: 'right' }}>{e.vol}</span>
                <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Sparkline data={data} up={e.pct >= 0} w={88} h={22}/>
                </span>
                <span className="tnum" style={{ textAlign: 'right',
                                                  fontWeight: 'var(--weight-bold)' }}>
                  ${(100 + e.pct).toFixed(2)}
                </span>
                <span style={{ textAlign: 'right' }}>
                  <span className={'pill ' + (e.pct >= 0 ? 'up' : 'down')}
                        style={{ minWidth: 70, fontSize: 'var(--t-stat)' }}>
                    {(e.pct >= 0 ? '+' : '') + e.pct.toFixed(2)}%
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </MacMarketChrome>
  );
}

function MacMarketNews({ tweaks }) {
  const featured = {
    head: 'Nvidia jumps 4% ahead of earnings call as analysts revise targets higher',
    pub: 'Bloomberg', ago: '14m', tickers: ['NVDA','AMD','AVGO'],
  };
  const stories = [
    { tag: 'Top',       head: 'Fed minutes show split on rate path; Treasury yields snap higher across curve',
      pub: 'Reuters', ago: '38m', tickers: ['SPY','QQQ','BND'] },
    { tag: 'You hold',  head: 'Microsoft expands Azure AI capacity in Asia, signs $4B Indonesia deal',
      pub: 'WSJ', ago: '1h', tickers: ['MSFT'] },
    { tag: 'Earnings',  head: 'Costco beats Q3 estimates; same-store sales up 7.8% as member renewals near record',
      pub: 'CNBC', ago: '2h', tickers: ['COST'] },
    { tag: 'You hold',  head: 'Tesla deliveries miss forecast; Musk hints at robotaxi launch this quarter',
      pub: 'The Verge', ago: '3h', tickers: ['TSLA'] },
    { tag: 'Macro',     head: 'Crude oil climbs 2% as OPEC+ signals tighter output through year-end',
      pub: 'FT', ago: '4h', tickers: [] },
    { tag: 'Earnings',  head: 'Apple Q3 services revenue up 16%, beats Street by $400M',
      pub: 'Bloomberg', ago: '5h', tickers: ['AAPL'] },
  ];
  return (
    <MacMarketChrome active="News">
      <div style={{ padding: '16px 24px 8px', display: 'flex', gap: 8 }}>
        {['For you','Top stories','Your holdings','Watchlist','Earnings','Macro','Crypto'].map((c, i) => (
          <span key={c} style={{
            padding: '6px 14px', borderRadius: 999,
            fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-semi)',
            background: i === 0 ? 'rgb(var(--mint))' : 'rgb(var(--surface-1))',
            color:      i === 0 ? 'rgb(var(--on-mint))' : 'rgb(var(--text-2) / 0.62)',
            boxShadow:  i === 0 ? 'none' : 'var(--hairline-top)',
          }}>{c}</span>
        ))}
      </div>

      <div style={{ padding: '4px 24px 24px',
                      display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        {/* Featured */}
        <div style={{
          borderRadius: 18, overflow: 'hidden',
          background: 'rgb(var(--surface-1))', boxShadow: 'var(--hairline-top)',
        }}>
          <div style={{
            height: 280,
            background: 'linear-gradient(135deg, rgb(var(--gics-tech) / 0.5), rgb(var(--gics-semis) / 0.3) 60%, rgb(var(--sec-activity) / 0.35)), rgb(var(--surface-2))',
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute', top: 14, left: 14,
              padding: '5px 12px', borderRadius: 999,
              background: 'rgb(0 0 0 / 0.55)',
              fontSize: 'var(--t-meta)', fontWeight: 'var(--weight-bold)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'rgb(var(--mint))',
              backdropFilter: 'blur(8px)',
            }}>For you · Hot</span>
            <div style={{
              position: 'absolute', bottom: 18, left: 18, right: 18,
              fontSize: 'var(--t-h-2)', fontWeight: 'var(--weight-black)',
              lineHeight: 1.22, letterSpacing: '-0.02em',
            }}>{featured.head}</div>
          </div>
          <div style={{ padding: '14px 18px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="t-aux">{featured.pub} · {featured.ago} ago</span>
            <span style={{ display: 'inline-flex', gap: 6 }}>
              {featured.tickers.map((t) => (
                <span key={t} style={{
                  padding: '3px 8px', borderRadius: 5,
                  fontSize: 'var(--t-caption)', fontWeight: 'var(--weight-bold)',
                  background: 'rgb(var(--mint) / 0.16)', color: 'rgb(var(--mint))',
                }}>{t}</span>
              ))}
            </span>
          </div>
        </div>

        {/* Story list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stories.map((st, i) => (
            <div key={i} style={{
              padding: '12px 14px',
              background: 'rgb(var(--surface-1))', borderRadius: 12,
              boxShadow: 'var(--hairline-top)',
              display: 'grid', gridTemplateColumns: '56px 1fr', gap: 12,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 10,
                background: st.tag === 'Earnings' ? 'linear-gradient(135deg, rgb(var(--sec-activity)), rgb(var(--gics-financials)))'
                          : st.tag === 'You hold' ? 'linear-gradient(135deg, rgb(var(--mint)), rgb(var(--up)))'
                          : st.tag === 'Macro'    ? 'linear-gradient(135deg, rgb(var(--gics-tech)), rgb(var(--gics-comm)))'
                          : 'linear-gradient(135deg, rgb(var(--gics-semis)), rgb(var(--gics-realestate)))',
              }}/>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span className="t-meta" style={{
                    color: st.tag === 'You hold' ? 'rgb(var(--mint))' :
                           st.tag === 'Earnings' ? 'rgb(var(--sec-activity))' :
                           'rgb(var(--text-3) / 0.42)',
                  }}>{st.tag}</span>
                  {st.tickers.map((t) => (
                    <span key={t} style={{
                      padding: '1px 6px', borderRadius: 4, fontSize: 'var(--t-meta)',
                      fontWeight: 'var(--weight-bold)',
                      background: 'rgb(var(--surface-2))', color: 'rgb(var(--text-2) / 0.62)',
                    }}>{t}</span>
                  ))}
                </div>
                <div style={{ fontSize: 'var(--t-row)', fontWeight: 'var(--weight-bold)',
                                lineHeight: 1.3, letterSpacing: '-0.005em' }}>{st.head}</div>
                <div className="t-aux" style={{ marginTop: 4 }}>{st.pub} · {st.ago} ago</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MacMarketChrome>
  );
}

// ─────────────────────────────────────────────────────────────────
// P2-10 — Symbol cost line + buy/sell markers (R-U3)
// ─────────────────────────────────────────────────────────────────
function IOSSymbolCostMarkers({ tweaks, height = 1480, sym = 'MSFT' }) {
  const s = SYMBOLS[sym];
  const hist = symbolHistory(sym);
  const avgCost = 312.40;   // matches data.jsx Sam's MSFT lot

  // Synthesize 5 buy/sell points on the time series
  const tradeMarkers = [
    { ix:  20, kind: 'BUY',  px: 280.10, qty: 15 },
    { ix:  60, kind: 'BUY',  px: 295.50, qty: 10 },
    { ix:  90, kind: 'SELL', px: 348.20, qty:  5 },
    { ix: 150, kind: 'BUY',  px: 332.80, qty: 25 },
    { ix: 210, kind: 'BUY',  px: 405.00, qty:  5 },
  ];

  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body" style={{ overflow: 'auto' }}>
          {/* Nav */}
          <div style={{
            padding: '4px 16px 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                            color: 'rgb(var(--mint))', fontSize: 'var(--t-base)',
                            fontWeight: 'var(--weight-semi)' }}>
              <Icon name="chevron-l" size={14} color="rgb(var(--mint))"/> Watchlist
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="iconbtn"><Icon name="search" size={13}/></span>
              <span className="iconbtn"><Icon name="more" size={13}/></span>
            </div>
          </div>

          {/* Hero */}
          <div style={{ padding: '0 20px 16px' }}>
            <div className="t-meta">{s.exch} · {s.sector}</div>
            <div className="t-h-2" style={{ fontSize: 'var(--t-h-2)',
                                              fontWeight: 'var(--weight-black)', marginTop: 6 }}>
              {sym}
            </div>
            <div className="tnum" style={{ fontSize: 'var(--t-display-3)',
                                            fontWeight: 'var(--weight-black)',
                                            letterSpacing: '-0.025em', marginTop: 6 }}>
              ${s.price.toFixed(2)}
            </div>
            <div className="tnum" style={{
              fontSize: 'var(--t-row)', fontWeight: 'var(--weight-bold)', marginTop: 4,
              color: s.up ? 'rgb(var(--up))' : 'rgb(var(--down))',
            }}>
              {(s.change >= 0 ? '+' : '') + s.change.toFixed(2)} ({(s.pct >= 0 ? '+' : '') + s.pct.toFixed(2)}%) today
            </div>
          </div>

          {/* Range chips */}
          <div style={{ padding: '0 8px' }}>
            <RangeChips active="1Y"/>
          </div>

          {/* Chart with cost-basis overlay */}
          <div style={{ position: 'relative', margin: '4px 12px 8px',
                          padding: '10px 0 0',
                          background: 'rgb(var(--surface-1))', borderRadius: 16,
                          boxShadow: 'var(--hairline-top)' }}>
            <div style={{ position: 'relative' }}>
              <PriceChart data={hist} mode="area" up={s.up}
                            w={358} h={240}
                            padInner={{ l: 0, r: 0, t: 18, b: 24 }}/>

              {/* Cost basis line (dashed mint) — positioned at avg-cost level */}
              {(() => {
                const min = Math.min(...hist);
                const max = Math.max(...hist);
                const range = max - min || 1;
                const yPad = 18;
                const usableH = 240 - yPad - 24;
                const y = yPad + ((max - avgCost) / range) * usableH;
                return (
                  <>
                    <div style={{
                      position: 'absolute', left: 0, right: 56, top: y,
                      height: 0,
                      borderTop: '1.5px dashed rgb(var(--mint))',
                      pointerEvents: 'none',
                    }}/>
                    {/* Label pill */}
                    <div style={{
                      position: 'absolute', right: 6, top: y - 11,
                      padding: '3px 8px', borderRadius: 4,
                      background: 'rgb(var(--mint) / 0.18)',
                      border: '1px solid rgb(var(--mint) / 0.5)',
                      color: 'rgb(var(--mint))',
                      fontSize: 'var(--t-meta)', fontWeight: 'var(--weight-bold)',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                    }}>
                      AVG ${avgCost.toFixed(2)}
                    </div>
                  </>
                );
              })()}

              {/* Buy/Sell markers */}
              {tradeMarkers.map((tm, i) => {
                const min = Math.min(...hist);
                const max = Math.max(...hist);
                const range = max - min || 1;
                const x = (tm.ix / (hist.length - 1)) * 358;
                const yPad = 18;
                const usableH = 240 - yPad - 24;
                const y = yPad + ((max - tm.px) / range) * usableH;
                const isBuy = tm.kind === 'BUY';
                return (
                  <div key={i} style={{
                    position: 'absolute', left: x - 7, top: y - 7,
                    width: 14, height: 14, borderRadius: '50%',
                    background: isBuy ? 'rgb(var(--up))' : 'rgb(var(--down))',
                    border: '2px solid rgb(var(--surface-1))',
                    color: isBuy ? 'rgb(var(--on-up))' : 'rgb(var(--on-warm))',
                    fontSize: 'var(--t-meta)', fontWeight: 'var(--weight-black)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 0 4px ' + (isBuy ? 'rgb(var(--up) / 0.16)' : 'rgb(var(--down) / 0.16)'),
                  }}>
                    {isBuy ? 'B' : 'S'}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{
              padding: '12px 16px 14px',
              display: 'flex', alignItems: 'center', gap: 16,
              fontSize: 'var(--t-meta)', fontWeight: 'var(--weight-semi)',
              color: 'rgb(var(--text-2) / 0.62)',
              borderTop: '.5px solid var(--separator)',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 14, height: 0,
                  borderTop: '1.5px dashed rgb(var(--mint))',
                }}/>
                Cost basis
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: 'rgb(var(--up))',
                  boxShadow: '0 0 0 2px rgb(var(--up) / 0.18)',
                }}/>
                Buy
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: 'rgb(var(--down))',
                  boxShadow: '0 0 0 2px rgb(var(--down) / 0.18)',
                }}/>
                Sell
              </span>
              <span style={{ marginLeft: 'auto' }}>5 lots</span>
            </div>
          </div>

          {/* My Position card */}
          <div style={{ padding: '0 16px 8px' }}>
            <div style={{
              background: 'rgb(var(--surface-1))', borderRadius: 16,
              boxShadow: 'var(--hairline-top)',
              padding: '14px 16px',
            }}>
              <div className="t-eyebrow" style={{ color: 'rgb(var(--text-2) / 0.62)' }}>
                MY POSITION · FIDELITY · INDIVIDUAL
              </div>
              <div style={{
                marginTop: 10,
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
                paddingBottom: 12, borderBottom: '.5px solid var(--separator-strong)',
              }}>
                <div>
                  <div className="t-meta">Shares</div>
                  <div className="tnum" style={{ fontSize: 'var(--t-h-2)',
                                                    fontWeight: 'var(--weight-black)', marginTop: 4 }}>
                    45
                  </div>
                  <div className="t-aux" style={{ marginTop: 3 }}>
                    Avg cost ${avgCost.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="t-meta">Market value</div>
                  <div className="tnum" style={{ fontSize: 'var(--t-h-2)',
                                                    fontWeight: 'var(--weight-black)',
                                                    letterSpacing: '-0.02em', marginTop: 4 }}>
                    {fmtMoney(45 * s.price, { cents: false })}
                  </div>
                  <div className="tnum" style={{ marginTop: 3, fontSize: 'var(--t-aux)',
                                                    fontWeight: 'var(--weight-bold)',
                                                    color: 'rgb(var(--up))' }}>
                    +{fmtMoney(45 * (s.price - avgCost), { cents: false })} ({((s.price - avgCost) / avgCost * 100).toFixed(1)}%)
                  </div>
                </div>
              </div>
              {/* Lot breakdown */}
              <div className="t-meta" style={{ marginTop: 12 }}>LOTS (5)</div>
              <div style={{ marginTop: 6 }}>
                {tradeMarkers.map((tm, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '24px 70px 1fr 80px',
                    alignItems: 'center', gap: 10,
                    padding: '8px 0',
                    borderBottom: i === tradeMarkers.length - 1 ? 'none' : '.5px solid var(--separator)',
                  }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: tm.kind === 'BUY' ? 'rgb(var(--up))' : 'rgb(var(--down))',
                      color: tm.kind === 'BUY' ? 'rgb(var(--on-up))' : 'rgb(var(--on-warm))',
                      fontSize: 'var(--t-meta)', fontWeight: 'var(--weight-black)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>{tm.kind[0]}</span>
                    <span className="tnum t-aux">
                      {['Apr', 'Jun', 'Aug', 'Oct', 'Mar'][i]}
                      {' '}'{['24','24','24','24','25'][i]}
                    </span>
                    <span className="tnum" style={{ fontSize: 'var(--t-stat)',
                                                      fontWeight: 'var(--weight-semi)' }}>
                      {tm.qty} sh @ ${tm.px.toFixed(2)}
                    </span>
                    <span className="tnum" style={{
                      textAlign: 'right',
                      fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-bold)',
                      color: tm.kind === 'SELL' ? 'rgb(var(--up))' : 'rgb(var(--text))',
                    }}>
                      {tm.kind === 'BUY' ? '−' : '+'}{fmtMoney(tm.qty * tm.px)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Trade CTA */}
          <div style={{
            position: 'sticky', bottom: 0,
            margin: '16px 16px 24px',
            padding: '14px 16px', borderRadius: 14,
            background: 'rgb(var(--mint))',
            color: 'rgb(var(--on-mint))',
            fontSize: 'var(--t-row-strong)', fontWeight: 'var(--weight-black)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>Trade MSFT</span>
            <span style={{
              padding: '3px 8px', borderRadius: 6,
              background: 'rgb(var(--on-mint) / 0.16)',
              fontSize: 'var(--t-meta)', letterSpacing: '0.04em',
            }}>FIDELITY · INDIVIDUAL ▾</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// P2-11 — Trade UX polish: duplicate detect + batch entry
// ─────────────────────────────────────────────────────────────────
function IOSTradeSheetDuplicate({ tweaks, height = 980 }) {
  const profile = profileById('sam');
  const c = profileRgb(profile);
  return (
    <div className="ios" style={{ height, position: 'relative' }}>
      <div className="ios-screen" style={{ opacity: 0.35 }}>
        <IOSStatusBar/>
        <div className="ios-body" style={{ padding: '14px 16px' }}>
          <div style={{ height: 60, background: 'rgb(var(--surface-1))', borderRadius: 12 }}/>
          <div style={{ marginTop: 14, height: 200, background: 'rgb(var(--surface-1))', borderRadius: 16 }}/>
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgb(7 7 10 / 0.65)' }}/>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'rgb(28 28 36)', borderRadius: '22px 22px 0 0',
        boxShadow: '0 -10px 40px rgb(0 0 0 / 0.5)', paddingBottom: 32,
      }}>
        <div style={{ height: 4, background: c, borderRadius: '22px 22px 0 0' }}/>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 2px' }}>
          <span style={{ width: 36, height: 5, borderRadius: 4, background: 'rgb(255 255 255 / 0.22)' }}/>
        </div>

        <div style={{ padding: '6px 18px 12px',
                        display: 'flex', alignItems: 'center', gap: 12 }}>
          <ProfileAvatar profile={profile} size={36}/>
          <div style={{ flex: 1 }}>
            <div className="t-eyebrow" style={{ color: c }}>RECORDING FOR</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 3 }}>
              <span style={{ fontSize: 'var(--t-row-strong-2)',
                              fontWeight: 'var(--weight-black)' }}>{profile.name}</span>
              <span className="t-aux">buying NVDA</span>
            </div>
          </div>
          <span className="iconbtn"><Icon name="x" size={14}/></span>
        </div>

        {/* Duplicate warning banner — soft (allow continue) */}
        <div style={{
          margin: '0 14px 12px', padding: '12px 14px',
          background: 'rgb(var(--sec-activity) / 0.12)',
          border: '1px solid rgb(var(--sec-activity) / 0.42)',
          borderRadius: 12,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: 6, marginTop: 1,
            background: 'rgb(var(--sec-activity) / 0.22)',
            color: 'rgb(var(--sec-activity))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="refresh" size={13} color="rgb(var(--sec-activity))"/>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 'var(--t-base)', fontWeight: 'var(--weight-bold)',
                            color: 'rgb(var(--sec-activity))' }}>
              Looks like a duplicate
            </div>
            <div style={{ fontSize: 'var(--t-aux)', marginTop: 4,
                            color: 'rgb(var(--text-2) / 0.62)', lineHeight: 1.4 }}>
              You already recorded <b>BUY 10 NVDA @ $118.40</b> in Fidelity · Individual
              on <b>May 14 · 09:42 ET</b>. Save anyway, or open the existing entry?
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 14, alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--t-aux)',
                              fontWeight: 'var(--weight-semi)', color: 'rgb(var(--mint))' }}>
                View existing trade →
              </span>
              <span style={{ fontSize: 'var(--t-aux)',
                              fontWeight: 'var(--weight-semi)',
                              color: 'rgb(var(--text-3) / 0.62)' }}>
                Dismiss
              </span>
            </div>
          </div>
        </div>

        {/* Fields condensed */}
        <div style={{ padding: '0 14px',
                        display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { lbl: 'Symbol',   value: 'NVDA · NVIDIA' },
            { lbl: 'Quantity', value: '10' },
            { lbl: 'Price',    value: '$118.40' },
            { lbl: 'Date',     value: 'May 14, 2026 · 09:42 ET' },
            { lbl: 'Account',  value: 'Fidelity · Individual', swatch: 'rgb(var(--acct-ocean))' },
          ].map((f) => (
            <div key={f.lbl} style={{
              padding: '10px 14px', borderRadius: 12,
              background: 'rgb(var(--surface-1))',
              boxShadow: 'var(--hairline-top)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              {f.swatch && (
                <span style={{ width: 8, height: 8, borderRadius: 2, background: f.swatch }}/>
              )}
              <span className="t-meta" style={{ width: 76 }}>{f.lbl}</span>
              <span style={{ flex: 1, fontSize: 'var(--t-base)',
                              fontWeight: 'var(--weight-bold)' }}>{f.value}</span>
            </div>
          ))}
        </div>

        {/* Primary action — soft duplicate, save still enabled */}
        <div style={{ padding: '16px 14px 0' }}>
          <div style={{
            padding: '15px 0', borderRadius: 14, textAlign: 'center',
            background: c, color: 'rgb(var(--on-mint))',
            fontSize: 'var(--t-row-strong)', fontWeight: 'var(--weight-black)',
          }}>
            Save anyway · 1 duplicate flagged
          </div>
        </div>

        <div style={{ padding: '12px 16px 0',
                        fontSize: 'var(--t-meta)', color: 'rgb(var(--text-3) / 0.62)',
                        letterSpacing: '0.04em', textTransform: 'uppercase',
                        fontWeight: 'var(--weight-bold)' }}>
          R-I2 · soft warning · save allowed
        </div>
      </div>
    </div>
  );
}

function IOSTradeSheetBatchEntry({ tweaks, height = 1280 }) {
  const profile = profileById('sam');
  const c = profileRgb(profile);
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          <FBNavHeader
            title="Add Trades"
            eyebrow="BATCH ENTRY · 3 PENDING"
            accent={c}
            leading={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                                      color: c, fontSize: 'var(--t-base)',
                                      fontWeight: 'var(--weight-semi)' }}>
              <Icon name="x" size={14} color={c}/> Cancel
            </span>}
            trailing={<span style={{ fontSize: 'var(--t-base)',
                                      fontWeight: 'var(--weight-bold)', color: c }}>Save 3</span>}
          />

          {/* Profile attribution */}
          <div style={{
            margin: '4px 16px 12px', padding: '10px 14px',
            background: profileRgb(profile, 0.10),
            border: `.5px solid ${profileRgb(profile, 0.32)}`,
            borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <ProfileAvatar profile={profile} size={26}/>
            <span style={{ fontSize: 'var(--t-stat)',
                            fontWeight: 'var(--weight-bold)' }}>{profile.name}</span>
            <span className="t-aux">· Fidelity · Individual</span>
          </div>

          {/* Entries */}
          {[
            { idx: 1, sym: 'NVDA', kind: 'BUY',  qty: 10, px: 118.40, date: 'May 14', done: true },
            { idx: 2, sym: 'AAPL', kind: 'BUY',  qty:  5, px: 189.20, date: 'May 14', done: true },
            { idx: 3, sym: 'TSLA', kind: 'SELL', qty:  3, px: 332.00, date: 'May 14', done: false, focused: true },
          ].map((e) => (
            <div key={e.idx} style={{
              margin: '0 16px 10px',
              padding: '12px 14px', borderRadius: 14,
              background: 'rgb(var(--surface-1))',
              boxShadow: e.focused ? `0 0 0 2px ${c}, var(--hairline-top)` : 'var(--hairline-top)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: e.done ? 'rgb(var(--up))' : 'rgb(var(--surface-2))',
                  color: e.done ? 'rgb(var(--on-up))' : 'rgb(var(--text-2) / 0.62)',
                  fontSize: 'var(--t-meta)', fontWeight: 'var(--weight-black)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>{e.done ? '✓' : e.idx}</span>
                <span style={{ flex: 1, fontSize: 'var(--t-stat)',
                                fontWeight: 'var(--weight-bold)',
                                color: e.focused ? c : 'rgb(var(--text))' }}>
                  Trade {e.idx}{e.focused && ' · entering…'}
                </span>
                {!e.focused && <Icon name="edit" size={13} color="rgb(var(--text-2) / 0.62)"/>}
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
              }}>
                {[
                  { lbl: 'Symbol', v: e.sym },
                  { lbl: 'Side',   v: e.kind },
                  { lbl: 'Qty',    v: String(e.qty) },
                  { lbl: 'Price',  v: '$' + e.px.toFixed(2) },
                ].map((f) => (
                  <div key={f.lbl}>
                    <div className="t-meta">{f.lbl}</div>
                    <div className="tnum" style={{
                      fontSize: 'var(--t-row), 14px', fontWeight: 'var(--weight-bold)',
                      marginTop: 3,
                      color: f.lbl === 'Side'
                        ? (e.kind === 'BUY' ? 'rgb(var(--up))' : 'rgb(var(--down))')
                        : 'rgb(var(--text))',
                    }}>{f.v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* + Add another */}
          <div style={{
            margin: '4px 16px 14px',
            padding: '13px 14px', borderRadius: 14,
            background: 'rgb(var(--surface-1) / 0.5)',
            border: '.5px dashed rgb(255 255 255 / 0.16)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, color: 'rgb(var(--mint))',
            fontSize: 'var(--t-base)', fontWeight: 'var(--weight-bold)',
          }}>
            <Icon name="plus" size={14} color="rgb(var(--mint))"/>
            Add another trade
          </div>

          {/* Total summary */}
          <div style={{
            margin: '0 16px 14px',
            padding: '14px 16px', borderRadius: 14,
            background: 'rgb(var(--surface-1))',
            boxShadow: 'var(--hairline-top)',
            backgroundImage: 'var(--hero-grad-neutral)',
          }}>
            <div className="t-eyebrow" style={{ color: 'rgb(var(--text-2) / 0.62)' }}>
              ESTIMATED NET CASH
            </div>
            <div className="tnum" style={{ fontSize: 'var(--t-display)',
                                              fontWeight: 'var(--weight-black)',
                                              letterSpacing: '-0.025em', marginTop: 6 }}>
              −$1,201.40
            </div>
            <div className="t-aux" style={{ marginTop: 4 }}>
              2 buys · 1 sell · all on May 14, 2026
            </div>
          </div>

          {/* Defaults inheritance note */}
          <div style={{
            margin: '0 16px 24px', padding: '10px 14px',
            background: 'rgb(var(--mint) / 0.08)',
            border: '.5px solid rgb(var(--mint) / 0.22)',
            borderRadius: 10,
            fontSize: 'var(--t-aux)', color: 'rgb(var(--mint))',
            fontWeight: 'var(--weight-semi)', lineHeight: 1.4,
          }}>
            R-U4 · date defaults to last trading day (Fri if weekend);
            account inherits between rows.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// P2-12 — Upcoming event detail (R-U6)
// ─────────────────────────────────────────────────────────────────
function IOSUpcomingEventDetail({ tweaks, height = 1280, kind = 'earnings' }) {
  // kind: 'earnings' | 'exdiv'
  const sym = kind === 'earnings' ? 'NVDA' : 'MSFT';
  const s = SYMBOLS[sym];
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          <FBNavHeader
            title={kind === 'earnings' ? 'Earnings · NVDA' : 'Ex-Dividend · MSFT'}
            leading={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                                      color: 'rgb(var(--mint))', fontSize: 'var(--t-base)',
                                      fontWeight: 'var(--weight-semi)' }}>
              <Icon name="chevron-l" size={14} color="rgb(var(--mint))"/> Events
            </span>}
            trailing={<span className="iconbtn"><Icon name="bell" size={13}/></span>}
          />

          {/* Hero */}
          <div style={{ padding: '8px 20px 16px' }}>
            <div className="t-eyebrow" style={{
              color: kind === 'earnings' ? 'rgb(var(--sec-activity))' : 'rgb(var(--mint))',
            }}>
              {kind === 'earnings' ? 'EARNINGS RELEASE · Q3 2026' : 'EX-DIVIDEND DATE'}
            </div>
            <div style={{ fontSize: 'var(--t-h-2)', fontWeight: 'var(--weight-black)',
                            letterSpacing: '-0.025em', marginTop: 6 }}>
              {kind === 'earnings' ? 'Wednesday, May 21' : 'Wednesday, May 21'}
            </div>
            <div className="t-aux" style={{ marginTop: 4 }}>
              {kind === 'earnings' ? 'After market close · ~16:30 ET' : 'Open of trading · Pay date Jun 12'}
            </div>
          </div>

          {/* Symbol summary card */}
          <div style={{ margin: '0 16px 14px',
                          padding: '14px 16px',
                          background: 'rgb(var(--surface-1))', borderRadius: 16,
                          boxShadow: 'var(--hairline-top)',
                          display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--symbol-tile-grad)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-black)',
              color: 'rgb(var(--on-warm))',
            }}>{sym}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--t-row-strong)', fontWeight: 'var(--weight-bold)' }}>
                {s.name}
              </div>
              <div className="t-aux" style={{ marginTop: 3 }}>{s.exch} · {s.sector}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="tnum" style={{ fontSize: 'var(--t-row-strong-2)',
                                                fontWeight: 'var(--weight-black)' }}>
                ${s.price.toFixed(2)}
              </div>
              <div className="tnum" style={{ marginTop: 3,
                                                fontSize: 'var(--t-caption)',
                                                fontWeight: 'var(--weight-bold)',
                                                color: s.up ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                {(s.pct >= 0 ? '+' : '') + s.pct.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Conditional body */}
          {kind === 'earnings' ? (
            <>
              {/* Estimates */}
              <div style={{ margin: '0 16px 12px',
                              background: 'rgb(var(--surface-1))', borderRadius: 16,
                              boxShadow: 'var(--hairline-top)',
                              padding: '14px 16px' }}>
                <div className="t-eyebrow" style={{ color: 'rgb(var(--text-2) / 0.62)' }}>
                  CONSENSUS · 38 ANALYSTS
                </div>
                <div style={{ marginTop: 12,
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <div className="t-meta">EPS estimate</div>
                    <div className="tnum" style={{ fontSize: 'var(--t-h-2)',
                                                      fontWeight: 'var(--weight-black)',
                                                      letterSpacing: '-0.02em', marginTop: 4 }}>
                      $0.85
                    </div>
                    <div className="t-aux" style={{ marginTop: 3 }}>vs $0.78 last Q</div>
                  </div>
                  <div>
                    <div className="t-meta">Revenue estimate</div>
                    <div className="tnum" style={{ fontSize: 'var(--t-h-2)',
                                                      fontWeight: 'var(--weight-black)',
                                                      letterSpacing: '-0.02em', marginTop: 4 }}>
                      $32.4B
                    </div>
                    <div className="t-aux" style={{ marginTop: 3 }}>+87% YoY</div>
                  </div>
                </div>
              </div>

              {/* Past 4 surprises */}
              <div style={{ padding: '4px 20px 6px',
                              display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 18, height: 2,
                                background: 'rgb(var(--sec-activity))',
                                opacity: 0.65, borderRadius: 2 }}/>
                <span className="t-eyebrow" style={{ color: 'rgb(var(--sec-activity))' }}>
                  Last 4 surprises
                </span>
              </div>
              <div style={{
                margin: '0 16px 14px',
                background: 'rgb(var(--surface-1))', borderRadius: 14,
                boxShadow: 'var(--hairline-top)', overflow: 'hidden',
              }}>
                {[
                  { q: 'Q2 26', est: 0.71, act: 0.78, surp: 9.9 },
                  { q: 'Q1 26', est: 0.62, act: 0.68, surp: 9.7 },
                  { q: 'Q4 25', est: 0.55, act: 0.59, surp: 7.3 },
                  { q: 'Q3 25', est: 0.49, act: 0.51, surp: 4.1 },
                ].map((r, i, arr) => (
                  <div key={r.q} style={{
                    display: 'grid',
                    gridTemplateColumns: '70px 80px 80px 1fr',
                    alignItems: 'center', gap: 10,
                    padding: '11px 16px',
                    borderBottom: i === arr.length - 1 ? 'none' : '.5px solid var(--separator)',
                  }}>
                    <span style={{ fontSize: 'var(--t-stat)',
                                    fontWeight: 'var(--weight-bold)' }}>{r.q}</span>
                    <span className="tnum t-aux">Est ${r.est.toFixed(2)}</span>
                    <span className="tnum" style={{ fontSize: 'var(--t-stat)',
                                                      fontWeight: 'var(--weight-bold)' }}>
                      ${r.act.toFixed(2)}
                    </span>
                    <span className={'pill-soft up'}
                          style={{ marginLeft: 'auto', fontSize: 'var(--t-caption)' }}>
                      Beat +{r.surp.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Dividend payout */}
              <div style={{ margin: '0 16px 12px',
                              background: 'rgb(var(--surface-1))', borderRadius: 16,
                              boxShadow: 'var(--hairline-top)',
                              padding: '14px 16px' }}>
                <div className="t-eyebrow" style={{ color: 'rgb(var(--text-2) / 0.62)' }}>
                  YOUR PAYOUT · 45 SH
                </div>
                <div className="tnum" style={{ fontSize: 'var(--t-display)',
                                                  fontWeight: 'var(--weight-black)',
                                                  letterSpacing: '-0.025em',
                                                  marginTop: 6, color: 'rgb(var(--mint))' }}>
                  $37.35
                </div>
                <div className="t-aux" style={{ marginTop: 4 }}>
                  $0.83 / sh · 0.79% annual yield
                </div>
              </div>
              <div style={{
                margin: '0 16px 14px', padding: '14px 16px',
                background: 'rgb(var(--surface-1))', borderRadius: 16,
                boxShadow: 'var(--hairline-top)',
              }}>
                <div className="t-eyebrow" style={{ color: 'rgb(var(--text-2) / 0.62)' }}>
                  KEY DATES
                </div>
                {[
                  { l: 'Declared',      d: 'Apr 24, 2026' },
                  { l: 'Ex-dividend',   d: 'May 21, 2026', emp: true },
                  { l: 'Record',        d: 'May 21, 2026' },
                  { l: 'Pay',           d: 'Jun 12, 2026' },
                ].map((r, i, a) => (
                  <div key={r.l} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '11px 0',
                    borderBottom: i === a.length - 1 ? 'none' : '.5px solid var(--separator)',
                  }}>
                    <span style={{ fontSize: 'var(--t-body)',
                                    fontWeight: 'var(--weight-semi)',
                                    color: r.emp ? 'rgb(var(--mint))' : 'rgb(var(--text))' }}>{r.l}</span>
                    <span className="tnum" style={{ fontSize: 'var(--t-stat)',
                                                      fontWeight: 'var(--weight-bold)',
                                                      color: r.emp ? 'rgb(var(--mint))' : 'rgb(var(--text))' }}>{r.d}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Actions */}
          <div style={{ padding: '4px 16px 16px',
                          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{
              padding: '13px 0', borderRadius: 12, textAlign: 'center',
              background: 'rgb(var(--surface-1))', boxShadow: 'var(--hairline-top)',
              fontSize: 'var(--t-base)', fontWeight: 'var(--weight-bold)',
              color: 'rgb(var(--mint))',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Icon name="bell" size={13} color="rgb(var(--mint))"/> Set alert
            </div>
            <div style={{
              padding: '13px 0', borderRadius: 12, textAlign: 'center',
              background: 'rgb(var(--mint))', color: 'rgb(var(--on-mint))',
              fontSize: 'var(--t-base)', fontWeight: 'var(--weight-black)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              Open {sym} <Icon name="chevron-r" size={12} color="rgb(var(--on-mint))"/>
            </div>
          </div>

          {/* Routing note */}
          <div style={{ padding: '0 16px 24px',
                          fontSize: 'var(--t-meta)', color: 'rgb(var(--text-3) / 0.62)',
                          letterSpacing: '0.04em', textTransform: 'uppercase',
                          fontWeight: 'var(--weight-bold)' }}>
            R-U6 · linked from Home UpcomingEventsCard · routes to Symbol detail anchor
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// P2-13 — Onboarding 5 screens (R-U7)
// ─────────────────────────────────────────────────────────────────
function OnbStep({ stepIdx, total = 5, title, sub, children, primary, secondary }) {
  return (
    <div className="ios-screen">
      <IOSStatusBar/>
      <div className="ios-body" style={{
        display: 'flex', flexDirection: 'column',
        background: 'rgb(var(--bg))',
      }}>
        {/* Step indicator */}
        <div style={{
          padding: '6px 24px 0',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= stepIdx ? 'rgb(var(--mint))' : 'rgb(255 255 255 / 0.12)',
            }}/>
          ))}
        </div>

        <div style={{ padding: '30px 28px 6px' }}>
          <div className="t-meta" style={{ color: 'rgb(var(--mint))' }}>
            STEP {stepIdx + 1} OF {total}
          </div>
          <div style={{ fontSize: 'var(--t-display)', fontWeight: 'var(--weight-black)',
                          letterSpacing: '-0.025em', marginTop: 8, lineHeight: 1.1 }}>
            {title}
          </div>
          {sub && (
            <div className="t-aux" style={{ marginTop: 10, lineHeight: 1.45,
                                              fontSize: 'var(--t-base)' }}>
              {sub}
            </div>
          )}
        </div>

        <div style={{ flex: 1, padding: '20px 24px 0', overflow: 'hidden' }}>
          {children}
        </div>

        <div style={{ padding: '14px 24px 30px' }}>
          {primary}
          {secondary && (
            <div style={{
              marginTop: 12, textAlign: 'center',
              fontSize: 'var(--t-base)', fontWeight: 'var(--weight-semi)',
              color: 'rgb(var(--text-2) / 0.62)',
            }}>
              {secondary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CTAButton({ label, kind = 'primary' }) {
  if (kind === 'primary') {
    return (
      <div style={{
        padding: '15px 0', borderRadius: 14, textAlign: 'center',
        background: 'rgb(var(--mint))', color: 'rgb(var(--on-mint))',
        fontSize: 'var(--t-row-strong)', fontWeight: 'var(--weight-black)',
      }}>{label}</div>
    );
  }
  return (
    <div style={{
      padding: '14px 0', borderRadius: 14, textAlign: 'center',
      background: 'rgb(var(--surface-1))', boxShadow: 'var(--hairline-top)',
      fontSize: 'var(--t-row-strong)', fontWeight: 'var(--weight-bold)',
      color: 'rgb(var(--text))',
    }}>{label}</div>
  );
}

function IOSOnboardingWelcome({ tweaks, height = 844 }) {
  return (
    <div className="ios" style={{ height }}>
      <OnbStep
        stepIdx={0}
        title="A quiet portfolio tracker for the whole family"
        sub="One device, multiple profiles. Track your own holdings, your parents', your kids' — without commingling lots, dividends, or taxes."
        primary={<CTAButton label="Get started"/>}
        secondary="Already have an account? Sign in"
      >
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
          paddingTop: 40,
        }}>
          {/* Visual: 3 stacked profile circles */}
          <div style={{ position: 'relative', width: 200, height: 120 }}>
            {[
              { col: 'rgb(var(--p-1))', t: -40, l: 70, l2: 'SC', sz: 88 },
              { col: 'rgb(var(--p-5))', t:  10, l:  0, l2: '👩', sz: 72 },
              { col: 'rgb(var(--p-2))', t:  20, l: 130, l2: '👨', sz: 72 },
            ].map((p, i) => (
              <div key={i} style={{
                position: 'absolute', top: p.t, left: p.l,
                width: p.sz, height: p.sz, borderRadius: '50%',
                background: p.col, color: 'rgb(var(--on-warm))',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--t-h-2)', fontWeight: 'var(--weight-black)',
                border: '4px solid rgb(var(--bg))',
                boxShadow: '0 8px 24px rgb(0 0 0 / 0.4)',
              }}>{p.l2}</div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { ico: 'eye-off', t: 'No login required for daily use after first setup' },
              { ico: 'chart',   t: 'Real-time quotes · cost basis · tax lots · dividends' },
              { ico: 'wallet',  t: 'Import from Fidelity, Schwab, Vanguard, IBKR' },
            ].map((r) => (
              <div key={r.t} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgb(var(--surface-1))',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgb(var(--mint))',
                  boxShadow: 'var(--hairline-top)',
                }}>
                  <Icon name={r.ico} size={14} color="rgb(var(--mint))"/>
                </span>
                <span style={{ fontSize: 'var(--t-body)',
                                fontWeight: 'var(--weight-semi)' }}>{r.t}</span>
              </div>
            ))}
          </div>
        </div>
      </OnbStep>
    </div>
  );
}

function IOSOnboardingPassword({ tweaks, height = 844 }) {
  return (
    <div className="ios" style={{ height }}>
      <OnbStep
        stepIdx={1}
        title="Set an app password"
        sub="One password protects the whole app. Per-profile PINs are optional and added later."
        primary={<CTAButton label="Continue"/>}
        secondary="Use Face ID instead"
      >
        <div style={{ paddingTop: 6 }}>
          {/* password field */}
          <div style={{
            padding: '14px 16px',
            background: 'rgb(var(--surface-1))', borderRadius: 14,
            boxShadow: '0 0 0 2px rgb(var(--mint)), var(--hairline-top)',
          }}>
            <div className="t-meta" style={{ color: 'rgb(var(--mint))' }}>PASSWORD · 12 CHARS</div>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4,
                            fontSize: 'var(--t-h-2)', fontWeight: 'var(--weight-bold)',
                            letterSpacing: '0.1em' }}>
              {Array.from({length: 8}).map((_, i) => '•').join(' ')}
              <span style={{ width: 2, height: 22, marginLeft: 4,
                              background: 'rgb(var(--mint))', verticalAlign: 'middle' }}/>
            </div>
          </div>

          {/* Strength meter */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1,1,1,1,0].map((on, i) => (
                <span key={i} style={{
                  flex: 1, height: 5, borderRadius: 3,
                  background: on ? 'rgb(var(--up))' : 'rgb(255 255 255 / 0.10)',
                }}/>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 'var(--t-aux)',
                            fontWeight: 'var(--weight-semi)', color: 'rgb(var(--up))' }}>
              Strong password
            </div>
          </div>

          {/* Confirm field */}
          <div style={{
            marginTop: 14,
            padding: '14px 16px',
            background: 'rgb(var(--surface-1))', borderRadius: 14,
            boxShadow: 'var(--hairline-top)',
          }}>
            <div className="t-meta">CONFIRM</div>
            <div style={{ marginTop: 8, fontSize: 'var(--t-h-2)',
                            fontWeight: 'var(--weight-bold)',
                            color: 'rgb(var(--text-3) / 0.42)',
                            letterSpacing: '0.1em' }}>
              · · · · · · · ·
            </div>
          </div>

          {/* Help row */}
          <div style={{
            marginTop: 16,
            padding: '12px 14px',
            background: 'rgb(var(--surface-1) / 0.6)',
            border: '.5px solid rgb(255 255 255 / 0.10)',
            borderRadius: 12,
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <Icon name="eye-off" size={14} color="rgb(var(--mint))"/>
            <div style={{ flex: 1, fontSize: 'var(--t-aux)',
                            color: 'rgb(var(--text-2) / 0.62)', lineHeight: 1.45 }}>
              Stored encrypted on device. We can't recover it — write it down.
              Losing it means re-importing all data.
            </div>
          </div>
        </div>
      </OnbStep>
    </div>
  );
}

function IOSOnboardingImport({ tweaks, height = 844 }) {
  return (
    <div className="ios" style={{ height }}>
      <OnbStep
        stepIdx={2}
        title="How would you like to start?"
        sub="Each option ends in the same place — your portfolio, ready to view."
        primary={<CTAButton label="Import CSV from broker"/>}
        secondary="Skip · I'll add accounts manually"
      >
        <div style={{ paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { ico: 'arrow-u', t: 'Import from CSV',
              sub: 'Fidelity · Schwab · Vanguard · IBKR · 30s setup',
              tag: 'Recommended', active: true },
            { ico: 'edit', t: 'Manual entry',
              sub: 'Add accounts and positions one by one', tag: '' },
            { ico: 'grid', t: 'Demo mode',
              sub: 'Explore with synthetic data first', tag: '' },
          ].map((opt) => (
            <div key={opt.t} style={{
              padding: '14px 14px', borderRadius: 14,
              background: 'rgb(var(--surface-1))',
              boxShadow: opt.active ? '0 0 0 2px rgb(var(--mint)), var(--hairline-top)' : 'var(--hairline-top)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{
                width: 40, height: 40, borderRadius: 10,
                background: opt.active ? 'rgb(var(--mint) / 0.18)' : 'rgb(var(--surface-2))',
                color: opt.active ? 'rgb(var(--mint))' : 'rgb(var(--text-2) / 0.62)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={opt.ico} size={16}
                      color={opt.active ? 'rgb(var(--mint))' : 'rgb(var(--text-2) / 0.62)'}/>
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 'var(--t-row-strong)',
                                  fontWeight: 'var(--weight-bold)' }}>{opt.t}</span>
                  {opt.tag && (
                    <span style={{
                      padding: '2px 7px', borderRadius: 999,
                      background: 'rgb(var(--mint) / 0.18)', color: 'rgb(var(--mint))',
                      fontSize: 'var(--t-meta)', fontWeight: 'var(--weight-bold)',
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                    }}>{opt.tag}</span>
                  )}
                </div>
                <div className="t-aux" style={{ marginTop: 3 }}>{opt.sub}</div>
              </div>
              {opt.active && <Icon name="check" size={16} color="rgb(var(--mint))"/>}
            </div>
          ))}
        </div>
      </OnbStep>
    </div>
  );
}

function IOSOnboardingFirstProfile({ tweaks, height = 844 }) {
  return (
    <div className="ios" style={{ height }}>
      <OnbStep
        stepIdx={3}
        title="Who are you setting up first?"
        sub="Create the first profile. You can add more for family later."
        primary={<CTAButton label="Create profile"/>}
        secondary="What's a profile?"
      >
        <div style={{ paddingTop: 4 }}>
          {/* Profile preview */}
          <div style={{
            margin: '0 0 14px',
            padding: '18px 18px',
            background: 'rgb(var(--p-1) / 0.10)',
            border: '.5px solid rgb(var(--p-1) / 0.40)',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <span style={{
              width: 68, height: 68, borderRadius: '50%',
              background: 'rgb(var(--p-1))', color: 'rgb(var(--on-mint))',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'var(--t-h), 22px', fontWeight: 'var(--weight-black)',
            }}>SC</span>
            <div style={{ flex: 1 }}>
              <div className="t-meta" style={{ color: 'rgb(var(--p-1))' }}>PREVIEW</div>
              <div style={{ marginTop: 4, fontSize: 'var(--t-h-2)',
                              fontWeight: 'var(--weight-black)',
                              letterSpacing: '-0.02em', color: 'rgb(var(--p-1))' }}>
                Sam
              </div>
              <div className="t-aux" style={{ marginTop: 3 }}>Self · color: Mint</div>
            </div>
          </div>

          {/* Name field */}
          <div style={{
            padding: '12px 14px', borderRadius: 14,
            background: 'rgb(var(--surface-1))',
            boxShadow: '0 0 0 2px rgb(var(--p-1)), var(--hairline-top)',
          }}>
            <div className="t-meta" style={{ color: 'rgb(var(--p-1))' }}>NAME</div>
            <div style={{ marginTop: 5, fontSize: 'var(--t-h-sub)',
                            fontWeight: 'var(--weight-bold)' }}>
              Sam<span style={{
                display: 'inline-block', width: 2, height: 18, marginLeft: 3,
                background: 'rgb(var(--p-1))', verticalAlign: 'middle',
              }}/>
            </div>
          </div>

          {/* Relation chips */}
          <div className="t-meta" style={{ marginTop: 14 }}>RELATION</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Self','Partner','Parent','Child','Sibling','Other'].map((r, i) => (
              <span key={r} style={{
                padding: '8px 14px', borderRadius: 999,
                background: i === 0 ? 'rgb(var(--p-1))' : 'rgb(var(--surface-1))',
                color:      i === 0 ? 'rgb(var(--on-mint))' : 'rgb(var(--text-2) / 0.62)',
                boxShadow:  i === 0 ? 'none' : 'var(--hairline-top)',
                fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-semi)',
              }}>{r}</span>
            ))}
          </div>

          {/* Color swatches preview */}
          <div className="t-meta" style={{ marginTop: 14 }}>COLOR</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            {[1,2,3,4,5,6,7,8].map((i) => (
              <span key={i} style={{
                width: 30, height: 30, borderRadius: '50%',
                background: `rgb(var(--p-${i}))`,
                boxShadow: i === 1 ? '0 0 0 3px rgb(var(--bg)), 0 0 0 5px rgb(var(--text))' : 'none',
              }}/>
            ))}
          </div>
        </div>
      </OnbStep>
    </div>
  );
}

function IOSOnboardingDone({ tweaks, height = 844 }) {
  return (
    <div className="ios" style={{ height }}>
      <OnbStep
        stepIdx={4}
        title="You're all set"
        sub="Imported 11 positions across 2 accounts · $245,318 starting net worth"
        primary={<CTAButton label="Open Sam's Home"/>}
        secondary="Add another profile for a family member"
      >
        <div style={{ paddingTop: 30,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 16 }}>
          {/* big check */}
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'rgb(var(--mint))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 6px rgb(var(--mint) / 0.18), 0 16px 40px rgb(0 0 0 / 0.3)',
          }}>
            <Icon name="check" size={40} color="rgb(var(--on-mint))"/>
          </div>

          {/* Summary cards */}
          <div style={{ marginTop: 6, width: '100%',
                          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { lbl: 'Profiles',  v: '1',         sub: 'Sam' },
              { lbl: 'Accounts',  v: '2',         sub: 'Fidelity' },
              { lbl: 'Positions', v: '11',        sub: 'Across both' },
              { lbl: 'Net Worth', v: '$245,318',  sub: 'As of close' },
            ].map((k) => (
              <div key={k.lbl} style={{
                padding: '12px 14px', borderRadius: 12,
                background: 'rgb(var(--surface-1))',
                boxShadow: 'var(--hairline-top)',
              }}>
                <div className="t-meta">{k.lbl}</div>
                <div className="tnum" style={{ fontSize: 'var(--t-h-sub)',
                                                  fontWeight: 'var(--weight-black)',
                                                  marginTop: 4, letterSpacing: '-0.015em' }}>
                  {k.v}
                </div>
                <div className="t-aux" style={{ marginTop: 3 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div style={{
            marginTop: 4, width: '100%',
            padding: '12px 14px', borderRadius: 12,
            background: 'rgb(var(--mint) / 0.10)',
            border: '.5px solid rgb(var(--mint) / 0.22)',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <Icon name="user" size={14} color="rgb(var(--mint))"/>
            <div style={{ flex: 1, fontSize: 'var(--t-aux)',
                            color: 'rgb(var(--mint))', lineHeight: 1.45,
                            fontWeight: 'var(--weight-semi)' }}>
              Tip: tap your profile avatar (top-left) any time to switch
              between people in your household.
            </div>
          </div>
        </div>
      </OnbStep>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// P2-14 — Privacy mode L2 (mask profile name to P1/P2/P3)
// ─────────────────────────────────────────────────────────────────
function IOSPrivacyL2({ tweaks, height = 1480 }) {
  const P = PORTFOLIO;
  // Wrap whole screen w/ a Privacy banner that explains L2 active
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* L2 banner */}
          <div style={{
            margin: '0 16px 12px',
            marginTop: 6,
            padding: '10px 12px', borderRadius: 10,
            background: 'rgb(var(--sec-symbol) / 0.10)',
            border: '.5px solid rgb(var(--sec-symbol) / 0.30)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Icon name="eye-off" size={14} color="rgb(var(--sec-symbol))"/>
            <div style={{ flex: 1, fontSize: 'var(--t-aux)',
                            fontWeight: 'var(--weight-semi)', color: 'rgb(var(--sec-symbol))' }}>
              Privacy · Public mode · names + amounts hidden
            </div>
            <span style={{
              padding: '4px 10px', borderRadius: 999,
              background: 'rgb(var(--sec-symbol))', color: 'rgb(var(--on-warm))',
              fontSize: 'var(--t-meta)', fontWeight: 'var(--weight-bold)',
              letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>L2</span>
          </div>

          {/* Nav with masked profile chip */}
          <div style={{ padding: '4px 16px 12px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Masked profile chip — color only, no name/initials */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'rgb(var(--p-1))',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="eye-off" size={13} color="rgb(var(--on-mint))"/>
              </span>
              <span style={{ fontSize: 'var(--t-base)',
                              fontWeight: 'var(--weight-bold)',
                              color: 'rgb(var(--p-1))', letterSpacing: '0.04em' }}>
                P1
              </span>
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="iconbtn"><Icon name="search" size={14}/></span>
              <span className="iconbtn"><Icon name="bell" size={14}/></span>
            </div>
          </div>

          {/* Hero — amount masked */}
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{
              background: 'rgb(var(--surface-1))', borderRadius: 18,
              boxShadow: 'var(--hairline-top)',
              backgroundImage: 'var(--hero-grad-neutral)',
              padding: '20px 22px',
            }}>
              <div className="t-meta">NET WORTH · P1</div>
              <div style={{ marginTop: 8, fontSize: 'var(--t-display-2)',
                              fontWeight: 'var(--weight-black)',
                              letterSpacing: '-0.025em',
                              color: 'rgb(var(--text-3) / 0.4)' }}>
                •• ••• •••
              </div>
              <div style={{ marginTop: 6, fontSize: 'var(--t-body)',
                              fontWeight: 'var(--weight-bold)',
                              color: 'rgb(var(--text-3) / 0.4)' }}>
                Today •• ••• (•• %)
              </div>
            </div>
          </div>

          {/* Section eyebrow */}
          <div style={{ padding: '4px 20px 8px',
                          display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 18, height: 2, background: SEC.portfolio,
                            borderRadius: 2, opacity: 0.65 }}/>
            <span className="t-eyebrow" style={{ color: SEC.portfolio }}>Accounts</span>
          </div>
          <div style={{ padding: '0 16px',
                          display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2].map((i) => (
              <div key={i} style={{
                position: 'relative', overflow: 'hidden',
                padding: '14px 14px 14px 22px',
                background: 'rgb(var(--surface-1))', borderRadius: 14,
                boxShadow: 'var(--hairline-top)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 4,
                                background: i === 1 ? 'rgb(var(--acct-ocean))' : 'rgb(var(--acct-bronze))' }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--t-base)',
                                  fontWeight: 'var(--weight-bold)',
                                  color: 'rgb(var(--text))', letterSpacing: '0.04em' }}>
                    A{i}
                  </div>
                  <div className="t-aux" style={{ marginTop: 3, color: 'rgb(var(--text-3) / 0.5)' }}>
                    ••••• · •• positions
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--t-row-strong)',
                                  fontWeight: 'var(--weight-black)',
                                  color: 'rgb(var(--text-3) / 0.4)' }}>•• •••</div>
                  <div style={{ marginTop: 3, fontSize: 'var(--t-meta)',
                                  fontWeight: 'var(--weight-bold)',
                                  color: 'rgb(var(--text-3) / 0.4)' }}>•• ••• today</div>
                </div>
              </div>
            ))}
          </div>

          {/* Watchlist — symbols visible, values masked */}
          <div style={{ padding: '14px 20px 6px',
                          display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 18, height: 2, background: SEC.watchlist,
                            borderRadius: 2, opacity: 0.65 }}/>
            <span className="t-eyebrow" style={{ color: SEC.watchlist }}>Watchlist</span>
          </div>
          <div style={{ margin: '0 16px',
                          background: 'rgb(var(--surface-1))', borderRadius: 14,
                          boxShadow: 'var(--hairline-top)' }}>
            {WATCHLIST.slice(0, 5).map((s, i, arr) => (
              <div key={s.symbol} style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 80px 80px',
                padding: '11px 14px', alignItems: 'center', gap: 10,
                borderBottom: i === arr.length - 1 ? 'none' : '.5px solid var(--separator)',
              }}>
                <span style={{ fontSize: 'var(--t-base)',
                                fontWeight: 'var(--weight-black)' }}>{s.symbol}</span>
                <Sparkline data={s.spark} up={s.up} w={88} h={24}/>
                <span className="tnum" style={{
                  textAlign: 'right',
                  fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-bold)',
                  color: 'rgb(var(--text-3) / 0.4)',
                }}>•••.••</span>
                <span style={{
                  marginLeft: 'auto', padding: '3px 8px', borderRadius: 5,
                  background: 'rgb(var(--surface-2))', color: 'rgb(var(--text-3) / 0.5)',
                  fontSize: 'var(--t-caption)', fontWeight: 'var(--weight-bold)',
                }}>••%</span>
              </div>
            ))}
          </div>

          {/* Levels reference card */}
          <div style={{
            margin: '16px 16px 24px',
            padding: '14px 16px',
            background: 'rgb(var(--surface-1))', borderRadius: 14,
            boxShadow: 'var(--hairline-top)',
          }}>
            <div className="t-eyebrow" style={{ color: 'rgb(var(--text-2) / 0.62)' }}>
              PRIVACY LEVELS · R-U8
            </div>
            <div style={{ marginTop: 12,
                            display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { lvl: 'L0', name: 'Open',         desc: 'Everything visible (default)', on: false },
                { lvl: 'L1', name: 'Amounts hidden', desc: 'Numbers masked, names visible', on: false },
                { lvl: 'L2', name: 'Public mode',    desc: 'Amounts + account names + profile name masked', on: true },
              ].map((r) => (
                <div key={r.lvl} style={{
                  padding: '11px 12px', borderRadius: 10,
                  background: r.on ? 'rgb(var(--sec-symbol) / 0.10)' : 'rgb(var(--surface-2))',
                  border: r.on ? '.5px solid rgb(var(--sec-symbol) / 0.32)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{
                    padding: '2px 7px', borderRadius: 4,
                    background: r.on ? 'rgb(var(--sec-symbol))' : 'rgb(var(--surface-1))',
                    color: r.on ? 'rgb(var(--on-warm))' : 'rgb(var(--text-2) / 0.62)',
                    fontSize: 'var(--t-meta)', fontWeight: 'var(--weight-black)',
                    letterSpacing: '0.04em',
                  }}>{r.lvl}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--t-stat)',
                                    fontWeight: 'var(--weight-bold)' }}>{r.name}</div>
                    <div className="t-aux" style={{ marginTop: 2 }}>{r.desc}</div>
                  </div>
                  {r.on && <Icon name="check" size={14} color="rgb(var(--sec-symbol))"/>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tiny shake keyframes injected once
if (typeof document !== 'undefined' && !document.getElementById('__fb_kf')) {
  const st = document.createElement('style');
  st.id = '__fb_kf';
  st.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-10px); }
      40% { transform: translateX(10px); }
      60% { transform: translateX(-8px); }
      80% { transform: translateX(8px); }
    }
  `;
  document.head.appendChild(st);
}

// ─────────────────────────────────────────────────────────────────
// Globals
// ─────────────────────────────────────────────────────────────────
Object.assign(window, {
  FBNavHeader, MarketStatusVariant,
  IOSAccountColorPicker,
  MarketStatusStripVariants,
  IOSProfilePINEntryV2,
  IOSDashboardCollapsed,
  IOSPortfolioOverflowMenuV2,
  IOSTradeSheetError,
  MacMarketOverview, MacMarketStocks, MacMarketETF, MacMarketNews,
  IOSSymbolCostMarkers,
  IOSTradeSheetDuplicate, IOSTradeSheetBatchEntry,
  IOSUpcomingEventDetail,
  IOSOnboardingWelcome, IOSOnboardingPassword,
  IOSOnboardingImport, IOSOnboardingFirstProfile, IOSOnboardingDone,
  IOSPrivacyL2,
});
