// screens-v3-misc.jsx — remaining artboards:
//   R-I3  IOS Watchlist/Accounts large-title collapsed (frame 2)
//   R-P1  IOS StatusBar profile chip close-up · Mac profile-switch transition
//   R-P3  IOS Account-switch warning dialog
//   R-N4  IOS Trade Sheet invoked from Symbol detail
//   R-P5  Mac Dashboard / Symbol-detail All-Profiles aggregated views
//   R-P6  IOS Profile PIN setup
//   R-SC5 iPad Dashboard · Mac Watchlist compact (collapsed sidebar)
//   R-A2  Mac Watchlist keyboard focus ring

// ─────────────────────────────────────────────────────────────────
// Reusable collapsed iOS nav bar (frame 2 of R-I3 large-title collapse)
// ─────────────────────────────────────────────────────────────────
function IOSCollapsedNav({ title, profile, leading, trailing, accent }) {
  const c = profile ? profileRgb(profile) : 'rgb(var(--mint))';
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 5,
      padding: '8px 16px 10px',
      background: 'rgb(7 7 10 / 0.72)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      borderBottom: '.5px solid var(--separator-strong)',
      display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 10,
    }}>
      {leading || <ProfileChip color={c} name={profile?.name || 'Sam'}
                                initials={profile?.avatar_value?.[0] || 'S'}/>}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 'var(--t-row-strong-2)', fontWeight: 'var(--weight-bold)', letterSpacing: '-0.005em', color: accent || c }}>
          {title}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {trailing}
      </div>
    </div>
  );
}

// Spec card — visual ruler that documents the keyframe
function SpecChip({ at, label }) {
  return (
    <div style={{
      margin: '12px 16px', padding: '10px 12px',
      borderRadius: 10, background: 'rgb(255 193 118 / 0.10)',
      border: '.5px solid rgb(255 193 118 / 0.30)',
      color: 'rgb(var(--sec-activity))',
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 'var(--t-eyebrow)', fontWeight: 'var(--weight-bold)', letterSpacing: '0.04em', textTransform: 'uppercase',
    }}>
      <Icon name="chart" size={12} color="rgb(var(--sec-activity))"/>
      {at} · {label}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS WATCHLIST COLLAPSED — frame 2 of R-I3
// ─────────────────────────────────────────────────────────────────
function IOSWatchlistCollapsed({ tweaks, height = 1080 }) {
  const wlSlice = WATCHLIST.slice(0, 10);
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body" style={{ overflow: 'auto' }}>
          <IOSCollapsedNav
            title="Watchlist"
            accent={SEC.watchlist}
            trailing={
              <>
                <span className="iconbtn"><Icon name="arrow-ud" size={13}/></span>
                <span className="iconbtn"><Icon name="plus" size={13}/></span>
              </>
            }
          />
          <SpecChip at="scrollY ≥ 36" label="title 17 / 600 · backdrop blur 28 · hairline-strong"/>

          {/* Tab chip row */}
          <div style={{ padding: '0 16px',
                        display: 'flex', gap: 16, borderBottom: '.5px solid var(--separator)' }}>
            {['My Symbols', 'Mega Cap', 'ETFs', 'Watching'].map((l, i) => (
              <div key={l} style={{
                position: 'relative',
                padding: '10px 0 12px',
                fontSize: 'var(--t-body)', fontWeight: i === 0 ? 700 : 500,
                color: i === 0 ? 'rgb(var(--text))' : 'rgb(var(--text-3) / 0.38)',
              }}>
                {l}
                {i === 0 && (
                  <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0,
                                  height: 2, borderRadius: 2, background: SEC.watchlist }}/>
                )}
              </div>
            ))}
          </div>

          {/* List */}
          <div style={{ padding: '4px 0' }}>
            {wlSlice.map((s, i) => (
              <StockRow key={s.symbol} s={s} layout="apple" last={i === wlSlice.length - 1}/>
            ))}
          </div>
        </div>
        <IOSTabBarV2 active="home"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS ACCOUNTS COLLAPSED — frame 2 (Portfolio · Positions)
// ─────────────────────────────────────────────────────────────────
function IOSAccountsCollapsed({ tweaks, height = 1080 }) {
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body" style={{ overflow: 'auto' }}>
          <IOSCollapsedNav
            title="Portfolio"
            accent={SEC.portfolio}
            trailing={
              <>
                <span className="iconbtn"><Icon name="search" size={13}/></span>
                <span className="iconbtn"><Icon name="more" size={13}/></span>
              </>
            }
          />
          <SpecChip at="scrollY ≥ 36" label="hairline-strong · profile color name swapped to compact title"/>

          {/* compact account selector pill */}
          <div style={{
            margin: '10px 16px',
            padding: '8px 14px',
            background: 'rgb(var(--surface-1))', borderRadius: 999,
            boxShadow: 'var(--hairline-top)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 'var(--t-body)', fontWeight: 'var(--weight-bold)',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Icon name="briefcase" size={12} color="rgb(var(--text-2) / 0.62)"/>
              All accounts
              <span style={{ fontSize: 'var(--t-meta)', padding: '1px 6px', borderRadius: 999,
                              background: 'rgb(var(--surface-2))', color: 'rgb(var(--text-3) / 0.38)' }}>2</span>
            </span>
            <Icon name="chevron-d" size={11} color="rgb(var(--text-2) / 0.62)"/>
          </div>

          <SubTabs tabs={['Summary','Positions','Activity','Balances']} active="Positions"/>
          <SegmentedPill items={['Open','Closed','Options']} active="Open"/>

          {/* Compact list — borrow IOSPortfolio rows by mocking */}
          <div style={{
            padding: '6px 16px 14px',
            display: 'flex', flexDirection: 'column', gap: 0,
          }}>
            {POSITIONS.slice(0, 8).map((p, i) => (
              <div key={p.sym} style={{
                display: 'grid',
                gridTemplateColumns: '64px 1fr 80px 80px',
                alignItems: 'center', gap: 10,
                padding: '11px 4px',
                borderBottom: i === 7 ? 'none' : '.5px solid var(--separator)',
              }}>
                <div>
                  <div style={{ fontSize: 'var(--t-base)', fontWeight: 'var(--weight-black)' }}>{p.sym}</div>
                  <div className="t-meta" style={{ marginTop: 2 }}>{p.qty} sh</div>
                </div>
                <div className="tnum t-aux">{fmtMoney(p.marketValue, { cents: false })}</div>
                <div className="tnum" style={{
                  textAlign: 'right', fontWeight: 'var(--weight-bold)',
                  color: p.symbol.up ? 'rgb(var(--up))' : 'rgb(var(--down))',
                }}>
                  {(p.todayPL >= 0 ? '+' : '') + fmtMoney(Math.abs(p.todayPL))}
                </div>
                <span className={'pill-soft ' + (p.symbol.up ? 'up' : 'down')}
                      style={{ marginLeft: 'auto' }}>
                  {(p.symbol.pct >= 0 ? '+' : '') + p.symbol.pct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
        <IOSTabBarV2 active="portfolio"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS STATUS BAR PROFILE CHIP — close-up, 3 profiles, 3 states (R-P1)
// ─────────────────────────────────────────────────────────────────
function IOSStatusBarProfileChip({ tweaks, height = 844 }) {
  const samples = [
    { profile: profileById('sam'), today:  '+$1,420.30', up: true },
    { profile: profileById('mom'), today:  '−$320.10',   up: false },
    { profile: profileById('dad'), today:  '+$842.55',   up: true },
  ];
  return (
    <div className="ios" style={{ height, background: 'rgb(var(--bg-elev))', padding: '40px 24px' }}>
      <div style={{ marginBottom: 24, paddingTop: 8 }}>
        <div className="t-eyebrow" style={{ color: 'rgb(var(--mint))' }}>R-P1 · iOS status bar chip</div>
        <div className="t-h" style={{ marginTop: 6 }}>3 profiles → 3 chip states</div>
        <div className="t-aux" style={{ marginTop: 4, lineHeight: 1.4 }}>
          Top-left of NavHeader. Tap → switcher sheet. Long-press → quick-switch to MRU.
        </div>
      </div>

      {samples.map((s, i) => {
        const c = profileRgb(s.profile);
        return (
          <div key={s.profile.id} style={{
            marginBottom: 18,
            padding: '0 0',
          }}>
            {/* fake status bar slice */}
            <div style={{
              borderRadius: 22, overflow: 'hidden',
              background: 'rgb(var(--bg))', boxShadow: 'var(--hairline-top)',
              padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <ProfileChip
                name={s.profile.name}
                initials={s.profile.avatar_value?.[0] || 'M'}
                color={c}
                size={36}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--t-eyebrow)', fontWeight: 'var(--weight-bold)', letterSpacing: '0.08em',
                                textTransform: 'uppercase', color: c, opacity: 0.85 }}>
                  Viewing
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 3 }}>
                  <span style={{ fontSize: 'var(--t-row-strong-2)', fontWeight: 'var(--weight-black)', color: c, letterSpacing: '-0.01em' }}>
                    {s.profile.name}
                  </span>
                  <span className="t-aux">{s.profile.display_name}</span>
                </div>
                <div className="tnum t-aux" style={{ marginTop: 4 }}>
                  Today{' '}
                  <span style={{ color: s.up ? 'rgb(var(--up))' : 'rgb(var(--down))', fontWeight: 'var(--weight-bold)' }}>
                    {s.today}
                  </span>
                </div>
              </div>
              <Icon name="chevron-d" size={14} color="rgb(var(--text-2) / 0.62)"/>
            </div>

            {/* under-row caption */}
            <div className="t-aux" style={{ padding: '8px 6px 0', display: 'flex', gap: 14 }}>
              <span><b style={{ color: c }}>State {i + 1}</b> · {
                i === 0 ? 'Default (active profile)'
                : i === 1 ? 'PIN-protected · tap → PIN sheet'
                : 'Switch target · cross-fade to color'
              }</span>
              <span>{i === 1 && <Icon name="eye-off" size={11}/>}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS PROFILE PIN SETUP — inside Profile Editor (R-P6)
// ─────────────────────────────────────────────────────────────────
function IOSProfilePINSetup({ tweaks, height = 980 }) {
  const profile = profileById('mom');
  const c = profileRgb(profile);
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* Nav */}
          <div style={{ padding: '8px 16px 12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                            color: c, fontSize: 'var(--t-base)', fontWeight: 'var(--weight-semi)' }}>
              <Icon name="chevron-l" size={14} color={c}/> Profile
            </span>
            <div style={{ fontSize: 'var(--t-row-strong-2)', fontWeight: 'var(--weight-bold)' }}>Set PIN</div>
            <span style={{ fontSize: 'var(--t-base)', fontWeight: 'var(--weight-bold)', color: c, opacity: 0.42 }}>Save</span>
          </div>

          {/* Header attribution */}
          <div style={{
            margin: '8px 16px 16px', padding: '14px 16px',
            background: profileRgb(profile, 0.10),
            border: `.5px solid ${profileRgb(profile, 0.32)}`,
            borderRadius: 16,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <ProfileAvatar profile={profile} size={44}/>
            <div style={{ flex: 1 }}>
              <div className="t-eyebrow" style={{ color: c }}>SETTING PIN FOR</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 'var(--t-h-sub)', fontWeight: 'var(--weight-black)', letterSpacing: '-0.01em' }}>
                  {profile.name}
                </span>
                <span className="t-aux">{profile.display_name}</span>
              </div>
            </div>
          </div>

          {/* Title + helper */}
          <div style={{ padding: '8px 28px 18px', textAlign: 'center' }}>
            <div className="t-h" style={{ fontSize: 'var(--t-h)' }}>Enter a 4-digit PIN</div>
            <div className="t-aux" style={{ marginTop: 6, lineHeight: 1.4 }}>
              You'll be asked for this PIN when switching to {profile.name}'s profile.
              Operator password overrides PIN.
            </div>
          </div>

          {/* PIN dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 22, padding: '14px 0 18px' }}>
            {[1, 1, 0, 0].map((on, i) => (
              <span key={i} style={{
                width: 16, height: 16, borderRadius: '50%',
                background: on ? c : 'transparent',
                border: on ? 'none' : `2px solid ${profileRgb(profile, 0.42)}`,
              }}/>
            ))}
          </div>

          {/* Helper row */}
          <div style={{
            padding: '4px 28px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span className="t-aux">Step 1 of 2 · Set</span>
            <span className="t-aux" style={{ color: c, fontWeight: 'var(--weight-bold)' }}>Skip · don't set PIN</span>
          </div>

          {/* Numpad */}
          <div style={{ padding: '0 32px 24px' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 14,
            }}>
              {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
                <button key={i} style={{
                  appearance: 'none', border: 0,
                  height: 64, borderRadius: 16,
                  background: k === '' ? 'transparent' : 'rgb(var(--surface-1))',
                  boxShadow: k === '' ? 'none' : 'var(--hairline-top)',
                  color: 'rgb(var(--text))',
                  fontSize: 'var(--t-h-3)', fontWeight: 'var(--weight-medium)', fontVariantNumeric: 'tabular-nums',
                }}>{k}</button>
              ))}
            </div>
          </div>

          {/* Footer security note */}
          <div style={{ padding: '0 28px 18px' }}>
            <div style={{
              padding: '12px 14px',
              background: 'rgb(var(--surface-1))',
              borderRadius: 12, boxShadow: 'var(--hairline-top)',
              display: 'flex', gap: 10,
            }}>
              <span style={{ width: 32, height: 32, borderRadius: 8,
                              background: 'rgb(var(--mint) / 0.14)', color: 'rgb(var(--mint))',
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="eye-off" size={15}/>
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-bold)' }}>Not a security boundary</div>
                <div className="t-aux" style={{ marginTop: 2, lineHeight: 1.4 }}>
                  PIN is for casual snooping protection only. Operator (you) can reset any PIN from Settings.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS ACCOUNT SWITCH WARNING — R-P3
// ─────────────────────────────────────────────────────────────────
function IOSAccountSwitchWarning({ tweaks, height = 844 }) {
  const from = profileById('mom');
  const to   = profileById('dad');
  return (
    <div className="ios" style={{ height, position: 'relative' }}>
      {/* dim background snapshot */}
      <div className="ios-screen" style={{ opacity: 0.4 }}>
        <IOSStatusBar/>
        <div className="ios-body" style={{ padding: '20px 16px' }}>
          <div style={{ height: 60, background: 'rgb(var(--surface-1))', borderRadius: 12 }}/>
          <div style={{ height: 280, marginTop: 14, background: 'rgb(var(--surface-1))', borderRadius: 22 }}/>
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgb(7 7 10 / 0.62)' }}/>

      {/* alert */}
      <div style={{
        position: 'absolute', top: '38%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 310,
        background: 'rgb(48 48 56 / 0.96)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '.5px solid rgb(255 255 255 / 0.10)',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgb(0 0 0 / 0.55)',
        color: 'rgb(var(--text))',
      }}>
        {/* Header strip in target profile color */}
        <div style={{
          height: 4, background: profileRgb(to),
        }}/>

        <div style={{ padding: '18px 18px 6px' }}>
          {/* From → To diagram */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: 12, paddingBottom: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <ProfileAvatar profile={from} size={40}/>
              <div className="t-meta" style={{ marginTop: 6 }}>FROM</div>
              <div style={{ fontSize: 'var(--t-aux)', fontWeight: 'var(--weight-bold)', color: profileRgb(from), marginTop: 2 }}>
                {from.name}
              </div>
            </div>
            <Icon name="arrow-r" size={16} color="rgb(var(--text-2) / 0.62)"/>
            <div style={{ textAlign: 'center' }}>
              <ProfileAvatar profile={to} size={40}/>
              <div className="t-meta" style={{ marginTop: 6 }}>TO</div>
              <div style={{ fontSize: 'var(--t-aux)', fontWeight: 'var(--weight-bold)', color: profileRgb(to), marginTop: 2 }}>
                {to.name}
              </div>
            </div>
          </div>

          <div style={{
            fontSize: 'var(--t-row-strong-2)', fontWeight: 'var(--weight-bold)', textAlign: 'center', letterSpacing: '-0.01em',
            padding: '6px 0 4px',
          }}>
            Switch to {to.name}'s accounts?
          </div>
          <div style={{ fontSize: 'var(--t-stat)', color: 'rgb(var(--text-2) / 0.62)', textAlign: 'center',
                          lineHeight: 1.4, padding: '4px 6px 12px' }}>
            You're recording a trade for <b style={{ color: profileRgb(from) }}>{from.name}</b>.
            Switching will discard <b>2 unsaved entries</b> (BUY · 50 NVDA, qty pending).
          </div>
        </div>

        {/* Stacked actions (iOS-alert style) */}
        <div style={{ borderTop: '.5px solid rgb(255 255 255 / 0.10)' }}>
          <div style={{
            padding: '13px 0', textAlign: 'center',
            fontSize: 'var(--t-row-strong)', fontWeight: 'var(--weight-bold)', color: profileRgb(to),
            borderBottom: '.5px solid rgb(255 255 255 / 0.10)',
          }}>
            Discard & switch
          </div>
          <div style={{
            padding: '13px 0', textAlign: 'center',
            fontSize: 'var(--t-row-strong)', fontWeight: 'var(--weight-medium)', color: 'rgb(var(--mint))',
          }}>
            Cancel
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS TRADE SHEET FROM SYMBOL — R-N4 invocation path
// ─────────────────────────────────────────────────────────────────
function IOSTradeSheetFromSymbol({ tweaks, height = 980, sym = 'MSFT' }) {
  const s = SYMBOLS[sym];
  const profile = profileById('sam');
  const c = profileRgb(profile);
  return (
    <div className="ios" style={{ height, position: 'relative' }}>
      {/* Background: dimmed symbol screen */}
      <div className="ios-screen" style={{ opacity: 0.35 }}>
        <IOSStatusBar/>
        <div className="ios-body" style={{ padding: '14px 16px' }}>
          <div style={{ height: 50, background: 'rgb(var(--surface-1))', borderRadius: 12 }}/>
          <div style={{ marginTop: 14, height: 80,
                        background: 'rgb(var(--surface-1))', borderRadius: 16 }}/>
          <div style={{ marginTop: 14, height: 200,
                        background: 'rgb(var(--surface-1))', borderRadius: 16 }}/>
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgb(7 7 10 / 0.65)' }}/>

      {/* Sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'rgb(28 28 36)',
        borderRadius: '22px 22px 0 0',
        boxShadow: '0 -10px 40px rgb(0 0 0 / 0.5)',
        paddingBottom: 32,
      }}>
        {/* Profile-color top strip (R-P3) */}
        <div style={{ height: 4, background: c, borderRadius: '22px 22px 0 0' }}/>

        {/* Grabber */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 2px' }}>
          <span style={{ width: 36, height: 5, borderRadius: 4, background: 'rgb(255 255 255 / 0.22)' }}/>
        </div>

        {/* 3-line profile-attributed header (R-P3) */}
        <div style={{ padding: '6px 18px 12px',
                        display: 'flex', alignItems: 'center', gap: 12 }}>
          <ProfileAvatar profile={profile} size={36}/>
          <div style={{ flex: 1 }}>
            <div className="t-eyebrow" style={{ color: c }}>RECORDING FOR</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 3 }}>
              <span style={{ fontSize: 'var(--t-row-strong-2)', fontWeight: 'var(--weight-black)' }}>{profile.name}</span>
              <span className="t-aux">{profile.display_name} · self</span>
            </div>
          </div>
          <span className="iconbtn"><Icon name="x" size={14}/></span>
        </div>

        {/* Pre-filled symbol header (R-N4 — invoked from MSFT) */}
        <div style={{
          margin: '0 14px 12px', padding: '14px',
          background: 'rgb(var(--surface-2))', borderRadius: 14,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'var(--symbol-tile-grad)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'var(--t-row)', fontWeight: 'var(--weight-black)', color: 'rgb(var(--on-warm))',
          }}>{sym}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 'var(--t-row-strong)', fontWeight: 'var(--weight-black)' }}>{s.name}</div>
            <div className="t-aux" style={{ marginTop: 2 }}>{s.exch} · {s.sector}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="tnum" style={{ fontSize: 'var(--t-row-strong-2)', fontWeight: 'var(--weight-black)' }}>
              ${s.price.toFixed(2)}
            </div>
            <div className="tnum" style={{ fontSize: 'var(--t-eyebrow)', fontWeight: 'var(--weight-bold)',
                                              color: s.up ? 'rgb(var(--up))' : 'rgb(var(--down))', marginTop: 2 }}>
              {(s.pct >= 0 ? '+' : '') + s.pct.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Side segmented */}
        <div style={{ padding: '0 14px 14px' }}>
          <div style={{
            background: 'rgb(var(--surface-1))',
            borderRadius: 11, padding: 3,
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2,
            boxShadow: 'var(--hairline-top)',
          }}>
            <span style={{
              textAlign: 'center', padding: '10px 0',
              borderRadius: 9, fontSize: 'var(--t-row)', fontWeight: 'var(--weight-black)',
              background: 'rgb(var(--up))', color: 'rgb(var(--on-up))',
              letterSpacing: '0.04em',
            }}>BUY</span>
            <span style={{
              textAlign: 'center', padding: '10px 0',
              borderRadius: 9, fontSize: 'var(--t-row)', fontWeight: 'var(--weight-semi)',
              color: 'rgb(var(--text-2) / 0.62)',
              letterSpacing: '0.04em',
            }}>SELL</span>
          </div>
        </div>

        {/* Form fields — read-only style with pre-filled values */}
        <div style={{ padding: '0 14px',
                        display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { lbl: 'Account', value: 'Fidelity · Individual',  hint: 'Last-used for MSFT',
              swatch: ACCT_COLORS['fid-ind'] },
            { lbl: 'Quantity', value: '10', hint: 'Available cash: $8,420 → buys 19 sh',
              focused: true },
            { lbl: 'Price', value: '$' + s.price.toFixed(2), hint: 'Live · 15-min delayed' },
            { lbl: 'Date', value: 'May 17, 2026 · 15:35 ET', hint: '' },
            { lbl: 'Fees', value: '$0.00', hint: 'No commissions' },
          ].map((f) => (
            <div key={f.lbl} style={{
              position: 'relative',
              padding: '12px 14px 10px',
              borderRadius: 14,
              background: 'rgb(var(--surface-1))',
              boxShadow: f.focused ? `0 0 0 2px ${c}, var(--hairline-top)` : 'var(--hairline-top)',
            }}>
              <div style={{
                fontSize: 'var(--t-caption)', fontWeight: 'var(--weight-bold)', letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: f.focused ? c : 'rgb(var(--text-3) / 0.38)',
              }}>{f.lbl}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                {f.swatch && (
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: f.swatch }}/>
                )}
                <span style={{ flex: 1, fontSize: 'var(--t-row-strong)', fontWeight: 'var(--weight-bold)' }}
                      className={f.lbl === 'Quantity' || f.lbl === 'Price' ? 'tnum' : ''}>
                  {f.value}
                  {f.focused && <span style={{
                    display: 'inline-block', width: 2, height: 18, marginLeft: 3,
                    background: c, verticalAlign: 'middle',
                    animation: 'none',
                  }}/>}
                </span>
                {(f.lbl === 'Account' || f.lbl === 'Date') && (
                  <Icon name="chevron-d" size={13} color="rgb(var(--text-2) / 0.62)"/>
                )}
              </div>
              {f.hint && (
                <div className="t-aux" style={{ marginTop: 4 }}>{f.hint}</div>
              )}
            </div>
          ))}
        </div>

        {/* Estimated total */}
        <div style={{
          margin: '14px 14px 12px', padding: '14px 16px',
          borderRadius: 14, background: 'rgb(var(--surface-1))',
          boxShadow: 'var(--hairline-top)',
          backgroundImage: 'var(--hero-grad-neutral)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="t-eyebrow" style={{ color: 'rgb(var(--text-2) / 0.62)' }}>
              Estimated Total
            </div>
            <div className="t-aux">10 sh × ${s.price.toFixed(2)}</div>
          </div>
          <div className="tnum" style={{ fontSize: 'var(--t-h-3)', fontWeight: 'var(--weight-black)', letterSpacing: '-0.02em',
                                            marginTop: 6 }}>
            {fmtMoney(s.price * 10)}
          </div>
        </div>

        {/* Primary action */}
        <div style={{ padding: '0 14px' }}>
          <div style={{
            padding: '15px 0', borderRadius: 14, textAlign: 'center',
            background: c, color: 'rgb(var(--on-mint))',
            fontSize: 'var(--t-row-strong)', fontWeight: 'var(--weight-black)', letterSpacing: '0.01em',
          }}>
            Record BUY for {profile.name}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAC PROFILE SWITCH TRANSITION — accent-color cross-fade frame
// ─────────────────────────────────────────────────────────────────
function MacProfileSwitchTransition({ tweaks }) {
  const from = profileById('sam');
  const to   = profileById('mom');
  return (
    <div className="mac" style={{ position: 'relative' }}>
      <MacSidebar active="home"/>
      <MacTitleBar/>
      <div className="mac-main" style={{ padding: '40px 28px 0' }}>
        {/* dimmed prior content */}
        <div style={{ opacity: 0.25 }}>
          <div className="t-h-sub">{from.name}'s home</div>
          <div style={{ height: 220, marginTop: 16, borderRadius: 16,
                          background: 'rgb(var(--surface-1))' }}/>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: 14, marginTop: 14 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 160, borderRadius: 14,
                                      background: 'rgb(var(--surface-1))' }}/>
            ))}
          </div>
        </div>
      </div>

      {/* Cross-fade flash overlay — picks target profile's color */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(60% 60% at 50% 50%, ${profileRgb(to, 0.55)} 0%, ${profileRgb(to, 0.16)} 60%, transparent 100%)`,
      }}/>

      {/* Centered switch capsule */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '20px 28px',
        background: 'rgb(28 28 36 / 0.92)',
        backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: `1px solid ${profileRgb(to, 0.42)}`,
        borderRadius: 24,
        boxShadow: '0 24px 80px rgb(0 0 0 / 0.6)',
        display: 'flex', alignItems: 'center', gap: 22,
        minWidth: 480,
      }}>
        <ProfileAvatar profile={from} size={56}/>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Icon name="arrow-r" size={20} color={profileRgb(to)}/>
          <span className="t-eyebrow" style={{ color: profileRgb(to) }}>switching · 220ms</span>
        </div>
        <ProfileAvatar profile={to} size={72}/>
        <div style={{ flex: 1, paddingLeft: 6 }}>
          <div className="t-meta">NOW VIEWING</div>
          <div style={{ fontSize: 'var(--t-h-2)', fontWeight: 'var(--weight-black)', letterSpacing: '-0.02em',
                          color: profileRgb(to), marginTop: 4 }}>
            {to.name}
          </div>
          <div className="t-aux" style={{ marginTop: 2 }}>{to.display_name}</div>
        </div>
      </div>

      {/* Spec strip bottom-left */}
      <div style={{
        position: 'absolute', bottom: 18, left: 244,
        padding: '8px 12px', borderRadius: 10,
        background: 'rgb(255 193 118 / 0.10)',
        border: '.5px solid rgb(255 193 118 / 0.30)',
        color: 'rgb(var(--sec-activity))',
        fontSize: 'var(--t-caption)', fontWeight: 'var(--weight-bold)', letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        Mid-transition · accent-color radial flash · sidebar stripe will swap to {to.name}'s color
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAC DASHBOARD ALL PROFILES — household read-only (R-P5)
// ─────────────────────────────────────────────────────────────────
function MacDashboardAllProfiles({ tweaks }) {
  const hide = !!tweaks.privacy;
  const H = HOUSEHOLD;
  const sliceTotal = H.netWorth;

  return (
    <div className="mac">
      {/* sidebar — show "All profiles" as active chip */}
      <div className="mac-sidebar">
        <div style={{
          margin: '4px 4px 16px', padding: '10px 12px',
          borderRadius: 12,
          background: 'rgb(var(--surface-2))',
          boxShadow: 'var(--hairline-top)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ width: 32, height: 32, borderRadius: 10,
                          background: 'linear-gradient(135deg, rgb(var(--p-1) / 0.6), rgb(var(--p-5) / 0.5), rgb(var(--p-2) / 0.6))',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="grid" size={14} color="rgb(var(--on-warm))"/>
          </span>
          <div style={{ flex: 1 }}>
            <div className="t-eyebrow" style={{ color: 'rgb(var(--text-2) / 0.62)' }}>VIEWING</div>
            <div style={{ fontSize: 'var(--t-row)', fontWeight: 'var(--weight-black)', letterSpacing: '-0.01em' }}>All profiles</div>
            <div className="tnum t-aux" style={{ marginTop: 2 }}>
              {hide ? '••••' : fmtMoney(H.netWorth, { cents: false })} ·{' '}
              <span style={{ color: H.todayPL >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))', fontWeight: 'var(--weight-bold)' }}>
                {(H.todayPL >= 0 ? '+' : '−') + fmtPct(Math.abs(H.todayPct), false)}
              </span>
            </div>
          </div>
          <Icon name="chevron-d" size={12} color="rgb(var(--text-2) / 0.62)"/>
        </div>

        <div className="navitem active"><Icon name="chart"/> Home</div>
        <div className="navitem"><Icon name="briefcase"/> Portfolio</div>
        <div className="navitem"><Icon name="grid"/> Market</div>
        <div className="navitem"><Icon name="user"/> Me</div>

        <div className="group-label">Profiles</div>
        {PROFILES.map((p) => (
          <div key={p.id} className="navitem" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ProfileAvatar profile={p} size={18}/>
            <span style={{ flex: 1 }}>{p.name}</span>
            <span className="tnum" style={{ fontSize: 'var(--t-meta)', fontWeight: 'var(--weight-semi)',
                                              color: 'rgb(var(--text-3) / 0.38)' }}>
              ${fmtCompact(profileMetrics(p.id).netWorth)}
            </span>
          </div>
        ))}
      </div>

      <MacTitleBar/>

      <div className="mac-main" style={{ padding: '40px 24px 24px' }}>
        {/* read-only banner */}
        <div style={{
          margin: '6px 0 14px', padding: '8px 14px',
          background: 'rgb(255 193 118 / 0.10)',
          border: '.5px solid rgb(255 193 118 / 0.30)',
          borderRadius: 10,
          fontSize: 'var(--t-aux)', color: 'rgb(var(--sec-activity))',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Icon name="eye" size={12} color="rgb(var(--sec-activity))"/>
          Read-only · switch to a profile to record trades or modify lists
        </div>

        {/* Household hero — stacked bar of profiles */}
        <div style={{
          padding: '20px 24px',
          background: 'rgb(var(--surface-1))', borderRadius: 18,
          boxShadow: 'var(--hairline-top)',
          backgroundImage: 'var(--hero-grad-neutral)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div className="t-meta">HOUSEHOLD NET WORTH</div>
              <div className="tnum" style={{
                fontSize: 'var(--t-display-5)', fontWeight: 'var(--weight-black)', letterSpacing: '-0.025em', marginTop: 6,
              }}>
                {hide ? '••••' : fmtMoney(H.netWorth, { cents: false })}
              </div>
              <div className="tnum" style={{ marginTop: 6, fontSize: 'var(--t-row)', fontWeight: 'var(--weight-bold)',
                                                color: H.todayPL >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                Today {(H.todayPL >= 0 ? '+' : '−') + fmtMoney(Math.abs(H.todayPL))} ·{' '}
                {(H.todayPct >= 0 ? '+' : '−') + Math.abs(H.todayPct).toFixed(2)}%
              </div>
            </div>
            <div style={{ width: 320 }}>
              <PriceChart data={H.history6M} mode="area" up={H.todayPL >= 0}
                            w={320} h={120}
                            padInner={{ l: 0, r: 0, t: 8, b: 14 }}
                            showPriceTicks={false}/>
            </div>
          </div>

          {/* Stacked share bar */}
          <div style={{
            marginTop: 16, height: 12, borderRadius: 999, overflow: 'hidden',
            display: 'flex', boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.08)',
          }}>
            {H.sliceByProfile.map((sl) => (
              <span key={sl.profile.id} style={{
                width: ((sl.metrics.netWorth / sliceTotal) * 100) + '%',
                background: profileRgb(sl.profile),
              }}/>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10,
                          gap: 12 }}>
            {H.sliceByProfile.map((sl) => (
              <div key={sl.profile.id} style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 10,
                background: profileRgb(sl.profile, 0.10),
              }}>
                <ProfileAvatar profile={sl.profile} size={24}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--t-aux)', fontWeight: 'var(--weight-bold)', color: profileRgb(sl.profile) }}>
                    {sl.profile.name}
                  </div>
                  <div className="tnum t-aux">
                    {fmtMoney(sl.metrics.netWorth, { cents: false })} ·{' '}
                    {((sl.metrics.netWorth / sliceTotal) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="tnum" style={{ fontSize: 'var(--t-aux)', fontWeight: 'var(--weight-bold)',
                                                  color: sl.metrics.todayPL >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                  {(sl.metrics.todayPL >= 0 ? '+' : '−') + fmtMoney(Math.abs(sl.metrics.todayPL))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom 2-col: Movers + Allocation toggle */}
        <div style={{ marginTop: 16,
                        display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          {/* Movers with profile attribution */}
          <div style={{
            background: 'rgb(var(--surface-1))', borderRadius: 16,
            boxShadow: 'var(--hairline-top)',
            padding: '14px 4px 6px',
          }}>
            <div className="t-eyebrow"
                  style={{ color: SEC.activity, opacity: 0.85, padding: '0 18px 8px' }}>
              Top movers · household
            </div>
            {(() => {
              const movers = [];
              for (const acc of ACCOUNTS) {
                for (const h of acc.holdings.slice(0, 3)) {
                  const s = SYMBOLS[h.sym];
                  movers.push({ sym: h.sym, account: acc, s, pct: s.pct,
                                  profile: profileById(acc.profile_id) });
                }
              }
              movers.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
              return movers.slice(0, 6).map((m, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 64px 1fr 100px 80px 84px',
                  alignItems: 'center', gap: 10,
                  padding: '9px 18px',
                  borderBottom: i === 5 ? 'none' : '.5px solid var(--separator)',
                }}>
                  <ProfileAvatar profile={m.profile} size={22}/>
                  <div style={{ fontSize: 'var(--t-body)', fontWeight: 'var(--weight-black)' }}>{m.sym}</div>
                  <div className="t-aux">{m.s.name}</div>
                  <span style={{
                    fontSize: 'var(--t-meta)', fontWeight: 'var(--weight-bold)', letterSpacing: '0.04em',
                    padding: '2px 6px', borderRadius: 4,
                    background: profileRgb(m.profile, 0.18),
                    color: profileRgb(m.profile),
                    textTransform: 'uppercase', textAlign: 'center',
                  }}>{m.profile.name}</span>
                  <Sparkline data={m.s.spark} up={m.s.up} w={72} h={22}/>
                  <span className={'pill-soft ' + (m.s.up ? 'up' : 'down')}
                        style={{ marginLeft: 'auto' }}>
                    {(m.pct >= 0 ? '+' : '') + m.pct.toFixed(2)}%
                  </span>
                </div>
              ));
            })()}
          </div>

          {/* Allocation toggle: by profile */}
          <div style={{
            background: 'rgb(var(--surface-1))', borderRadius: 16,
            boxShadow: 'var(--hairline-top)',
            padding: '14px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="t-eyebrow" style={{ color: SEC.symbol, opacity: 0.85 }}>Allocation</div>
              <div style={{
                background: 'rgb(var(--surface-2))', borderRadius: 999,
                padding: 3, display: 'inline-flex', fontSize: 'var(--t-eyebrow)', fontWeight: 'var(--weight-bold)',
              }}>
                <span style={{ padding: '4px 10px', borderRadius: 999,
                                  background: 'rgb(var(--surface-1))', boxShadow: 'var(--hairline-top)' }}>
                  By profile
                </span>
                <span style={{ padding: '4px 10px', color: 'rgb(var(--text-3) / 0.38)' }}>By sector</span>
              </div>
            </div>
            <div style={{
              marginTop: 14,
              display: 'grid', gridTemplateColumns: '140px 1fr', gap: 14, alignItems: 'center',
            }}>
              <AllocationDonut
                data={H.sliceByProfile.map((sl, i) => ({
                  sector: sl.profile.name, value: sl.metrics.netWorth,
                  color: profileRgb(sl.profile),
                }))}
                size={130} thickness={18}
                center={<div style={{ textAlign: 'center' }}>
                  <div className="t-meta">HOUSEHOLD</div>
                  <div className="tnum" style={{ fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-black)', marginTop: 2 }}>
                    ${fmtCompact(H.netWorth)}
                  </div>
                </div>}/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {H.sliceByProfile.map((sl) => (
                  <div key={sl.profile.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%',
                                    background: profileRgb(sl.profile) }}/>
                    <span style={{ flex: 1, fontSize: 'var(--t-chip)', fontWeight: 'var(--weight-bold)',
                                    color: profileRgb(sl.profile) }}>{sl.profile.name}</span>
                    <span className="tnum t-aux">
                      {((sl.metrics.netWorth / H.netWorth) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAC SYMBOL DETAIL ALL PROFILES — per-profile MyPosition breakdown
// ─────────────────────────────────────────────────────────────────
function MacSymbolDetailAllProfiles({ tweaks, sym = 'AAPL' }) {
  const hide = !!tweaks.privacy;
  const s = SYMBOLS[sym];

  // Find positions across ALL profiles for this symbol
  const slices = ACCOUNTS
    .map((a) => {
      const h = a.holdings.find((x) => x.sym === sym);
      if (!h) return null;
      const profile = profileById(a.profile_id);
      const mv = h.qty * s.price;
      const cost = h.qty * h.avgCost;
      return { account: a, h, profile, mv, cost, unrealized: mv - cost, pct: ((mv - cost) / cost) * 100 };
    })
    .filter(Boolean);

  const totalMV = slices.reduce((s2, x) => s2 + x.mv, 0);
  const totalQty = slices.reduce((s2, x) => s2 + x.h.qty, 0);
  const totalCost = slices.reduce((s2, x) => s2 + x.cost, 0);
  const totalUnreal = totalMV - totalCost;

  return (
    <div className="mac">
      <MacSidebar active="home"/>
      <MacTitleBar/>
      <div className="mac-main" style={{ padding: '40px 24px 24px' }}>
        {/* Top header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'var(--symbol-tile-grad)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'var(--t-row-strong)', fontWeight: 'var(--weight-black)', color: 'rgb(var(--on-warm))',
          }}>{sym}</div>
          <div style={{ flex: 1 }}>
            <div className="t-h" style={{ fontSize: 'var(--t-h-3)', letterSpacing: '-0.025em' }}>{s.name}</div>
            <div className="t-aux">{s.exch} · {s.sector} · viewing across household</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="tnum" style={{ fontSize: 'var(--t-display-6)', fontWeight: 'var(--weight-black)', letterSpacing: '-0.025em' }}>
              ${s.price.toFixed(2)}
            </div>
            <div className="tnum" style={{ fontSize: 'var(--t-row)', fontWeight: 'var(--weight-bold)',
                                              color: s.up ? 'rgb(var(--up))' : 'rgb(var(--down))', marginTop: 3 }}>
              {(s.change >= 0 ? '+' : '') + s.change.toFixed(2)} ({(s.pct >= 0 ? '+' : '') + s.pct.toFixed(2)}%) today
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginTop: 16 }}>
          {/* Left: chart */}
          <div style={{
            background: 'rgb(var(--surface-1))', borderRadius: 16,
            boxShadow: 'var(--hairline-top)', padding: '16px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <RangeChips active="6M" compact/>
              <span className="t-aux">Showing across household holdings</span>
            </div>
            <PriceChart data={symbolHistory(sym)} mode="area" up={s.up}
                          w={700} h={300}
                          padInner={{ l: 0, r: 0, t: 18, b: 22 }}/>
          </div>

          {/* Right: aggregate MyPosition */}
          <div style={{
            background: 'rgb(var(--surface-1))', borderRadius: 16,
            boxShadow: 'var(--hairline-top)',
            padding: '14px 18px',
          }}>
            <div className="t-eyebrow" style={{ color: 'rgb(var(--text-2) / 0.62)' }}>
              MY POSITION · HOUSEHOLD
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12,
              paddingBottom: 14, borderBottom: '.5px solid var(--separator-strong)',
            }}>
              <div>
                <div className="t-meta">Total shares</div>
                <div className="tnum" style={{ fontSize: 'var(--t-h-pad)', fontWeight: 'var(--weight-black)', marginTop: 4 }}>
                  {totalQty}
                </div>
                <div className="tnum t-aux" style={{ marginTop: 3 }}>
                  across {slices.length} accounts · {new Set(slices.map(x => x.profile.id)).size} profiles
                </div>
              </div>
              <div>
                <div className="t-meta">Market value</div>
                <div className="tnum" style={{ fontSize: 'var(--t-h-pad)', fontWeight: 'var(--weight-black)', marginTop: 4,
                                                  letterSpacing: '-0.02em' }}>
                  {hide ? '••••' : fmtMoney(totalMV, { cents: false })}
                </div>
                <div className="tnum t-aux" style={{ marginTop: 3,
                                                          color: totalUnreal >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))', fontWeight: 'var(--weight-bold)' }}>
                  {(totalUnreal >= 0 ? '+' : '') + fmtMoney(Math.abs(totalUnreal), { cents: false })} unrealized
                </div>
              </div>
            </div>

            <div className="t-meta" style={{ marginTop: 14 }}>BREAKDOWN BY PROFILE</div>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {slices.map((sl, i) => (
                <div key={i} style={{
                  position: 'relative',
                  padding: '12px 10px 12px 16px',
                  borderBottom: i === slices.length - 1 ? 'none' : '.5px solid var(--separator)',
                }}>
                  <span style={{ position: 'absolute', top: 8, bottom: 8, left: 0, width: 3,
                                  background: profileRgb(sl.profile), borderRadius: 2 }}/>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ProfileAvatar profile={sl.profile} size={22}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 'var(--t-body)', fontWeight: 'var(--weight-black)',
                                          color: profileRgb(sl.profile) }}>{sl.profile.name}</span>
                        <span className="t-aux">{sl.account.broker} · {sl.account.name}</span>
                      </div>
                      <div className="tnum t-aux" style={{ marginTop: 2 }}>
                        {sl.h.qty} sh @ ${sl.h.avgCost.toFixed(2)} avg
                      </div>
                    </div>
                    <div className="tnum" style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 'var(--t-row)', fontWeight: 'var(--weight-black)' }}>
                        {hide ? '••••' : fmtMoney(sl.mv, { cents: false })}
                      </div>
                      <div style={{ fontSize: 'var(--t-eyebrow)', fontWeight: 'var(--weight-bold)',
                                      color: sl.unrealized >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))', marginTop: 2 }}>
                        {(sl.unrealized >= 0 ? '+' : '') + fmtPct(sl.pct, false)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disabled trade CTA */}
        <div style={{
          marginTop: 16, padding: '14px 18px',
          background: 'rgb(var(--surface-1) / 0.6)',
          border: '.5px dashed rgb(255 255 255 / 0.10)',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 'var(--t-row)', fontWeight: 'var(--weight-bold)', color: 'rgb(var(--text-3) / 0.62)' }}>
              Trade disabled in household view
            </div>
            <div className="t-aux" style={{ marginTop: 3 }}>
              Switch to a specific profile to record buys or sells
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {PROFILES.map((p) => (
              <span key={p.id} style={{
                padding: '8px 14px', borderRadius: 999,
                background: profileRgb(p, 0.18),
                border: `1px solid ${profileRgb(p, 0.42)}`,
                color: profileRgb(p),
                fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-bold)',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                <ProfileAvatar profile={p} size={16}/>
                Trade as {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IPAD DASHBOARD — mid-tier (R-SC5)
// ─────────────────────────────────────────────────────────────────
function IPadDashboard({ tweaks, height = 1366 }) {
  const hide = !!tweaks.privacy;
  const P = PORTFOLIO;
  return (
    <div style={{
      width: 1024, height,
      background: 'rgb(var(--bg))',
      color: 'rgb(var(--text))',
      fontFamily: 'var(--font-ui)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* iOS-style status bar but wider */}
      <div style={{
        height: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 36px', fontSize: 'var(--t-base)', fontWeight: 'var(--weight-semi)',
      }}>
        <span>9:41</span>
        <span style={{ display: 'inline-flex', gap: 6 }}>
          <span style={{ width: 18, height: 12, borderRadius: 2,
                          background: 'rgb(255 255 255 / 0.6)' }}/>
          <span style={{ width: 26, height: 12, borderRadius: 2,
                          border: '1px solid rgb(255 255 255 / 0.6)' }}/>
        </span>
      </div>

      {/* NavHeader */}
      <div style={{ padding: '6px 32px 14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ProfileChip size={36}/>
          <div>
            <div className="t-meta">GOOD EVENING, SAM</div>
            <div style={{ fontSize: 'var(--t-h-mac)', fontWeight: 'var(--weight-black)', letterSpacing: '-0.025em', marginTop: 4 }}>
              Home
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="iconbtn" style={{ width: 38, height: 38 }}><Icon name="search" size={16}/></span>
          <span className="iconbtn" style={{ width: 38, height: 38 }}><Icon name="bell" size={16}/></span>
        </div>
      </div>

      {/* 2-col body */}
      <div style={{
        flex: 1,
        display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18,
        padding: '0 28px 24px',
        overflow: 'hidden',
      }}>
        {/* Left col: Hero + Movers + Watchlist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
          {/* Hero */}
          <div style={{
            background: 'rgb(var(--surface-1))', borderRadius: 22,
            boxShadow: 'var(--hairline-top)', padding: '22px 24px',
            backgroundImage: 'var(--hero-grad-up)',
          }}>
            <div className="t-meta">NET WORTH</div>
            <div className="tnum" style={{ fontSize: 'var(--t-display-7)', fontWeight: 'var(--weight-black)',
                                              letterSpacing: '-0.025em', marginTop: 8 }}>
              {hide ? '••••' : fmtMoney(P.netWorth, { cents: false })}
            </div>
            <div className="tnum" style={{ fontSize: 'var(--t-row-strong)', fontWeight: 'var(--weight-bold)', marginTop: 6,
                                              color: P.todayPL >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
              {(P.todayPL >= 0 ? '+' : '') + fmtMoney(P.todayPL)} ({fmtPct(P.todayPct)}) today
            </div>
            <div style={{ marginTop: 14 }}>
              <PriceChart data={P.history6M} mode="area" up={P.todayPL >= 0}
                            w={530} h={150} padInner={{ l: 0, r: 0, t: 8, b: 18 }}/>
            </div>
            <div style={{ paddingTop: 8 }}>
              <RangeChips active="6M"/>
            </div>
          </div>

          {/* Today's movers */}
          <div>
            <SectionTitle title="Today's movers" right="In portfolio" accent={SEC.activity}/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {P.movers.slice(0, 3).map((m) => (
                <div key={m.sym + m.account.id} style={{
                  padding: '14px 14px 12px',
                  background: 'rgb(var(--surface-1))', borderRadius: 14,
                  boxShadow: 'var(--hairline-top)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 'var(--t-row)', fontWeight: 'var(--weight-black)' }}>{m.sym}</span>
                    <span className={'pill-soft ' + (m.symbol.up ? 'up' : 'down')}>
                      {(m.symbol.pct >= 0 ? '+' : '') + m.symbol.pct.toFixed(2)}%
                    </span>
                  </div>
                  <MiniSpark data={m.symbol.spark} up={m.symbol.up} w={170} h={36} stroke={1.6}/>
                  <div className="tnum" style={{ fontSize: 'var(--t-row)', fontWeight: 'var(--weight-bold)', marginTop: 4 }}>
                    ${m.symbol.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right col: Accounts + Watchlist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
          <div style={{
            background: 'rgb(var(--surface-1))', borderRadius: 18,
            boxShadow: 'var(--hairline-top)', padding: '14px 16px',
          }}>
            <div className="t-eyebrow" style={{ color: SEC.portfolio, opacity: 0.85 }}>Accounts</div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {accountsForProfile('sam').map((a) => {
                const mv = a.holdings.reduce((s2, h) => s2 + h.qty * SYMBOLS[h.sym].price, 0);
                const today = a.holdings.reduce((s2, h) => s2 + h.qty * SYMBOLS[h.sym].change, 0);
                return (
                  <div key={a.id} style={{
                    position: 'relative', overflow: 'hidden',
                    background: 'rgb(var(--surface-2))', borderRadius: 12,
                    padding: '11px 14px 11px 18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 3,
                                    background: ACCT_COLORS[a.id] }}/>
                    <div>
                      <div style={{ fontSize: 'var(--t-row)', fontWeight: 'var(--weight-bold)' }}>{a.broker} · {a.name}</div>
                      <div className="t-aux" style={{ marginTop: 2 }}>{a.holdings.length} positions</div>
                    </div>
                    <div className="tnum" style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 'var(--t-row)', fontWeight: 'var(--weight-black)' }}>
                        {hide ? '••••' : fmtMoney(mv, { cents: false })}
                      </div>
                      <div style={{ fontSize: 'var(--t-eyebrow)', fontWeight: 'var(--weight-bold)',
                                      color: today >= 0 ? 'rgb(var(--up))' : 'rgb(var(--down))', marginTop: 2 }}>
                        {(today >= 0 ? '+' : '') + fmtMoney(Math.abs(today))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{
            background: 'rgb(var(--surface-1))', borderRadius: 18,
            boxShadow: 'var(--hairline-top)', padding: '14px 4px 4px',
            flex: 1, overflow: 'hidden',
          }}>
            <div className="t-eyebrow"
                  style={{ color: SEC.watchlist, opacity: 0.85, padding: '0 16px 8px' }}>
              Watchlist · My Symbols
            </div>
            {WATCHLIST.slice(0, 6).map((s, i) => (
              <StockRow key={s.symbol} s={s} layout="apple" last={i === 5}/>
            ))}
          </div>
        </div>
      </div>

      {/* iPad tab bar — same 4 tabs */}
      <div style={{
        flex: '0 0 auto', height: 70,
        background: 'rgb(7 7 10 / 0.72)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderTop: '.5px solid var(--separator)',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '8px 80px 16px',
      }}>
        {[
          { l: 'Home',      i: 'chart',     a: true },
          { l: 'Portfolio', i: 'briefcase', a: false },
          { l: 'Market',    i: 'grid',      a: false },
          { l: 'Me',        i: 'user',      a: false },
        ].map((t) => (
          <div key={t.l} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: t.a ? 'rgb(var(--mint))' : 'rgb(var(--text-2) / 0.62)',
            fontSize: 'var(--t-caption)', fontWeight: 'var(--weight-semi)', gap: 3,
          }}>
            <Icon name={t.i} size={22}/> {t.l}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAC WATCHLIST COMPACT — sidebar collapsed to 64px rail (R-SC5)
// ─────────────────────────────────────────────────────────────────
function MacWatchlistCompact({ tweaks }) {
  return (
    <div style={{
      width: 900, height: 700,
      background: 'rgb(var(--bg))',
      color: 'rgb(var(--text))',
      fontFamily: 'var(--font-ui)',
      position: 'relative', overflow: 'hidden',
      display: 'grid', gridTemplateColumns: '64px 1fr',
    }}>
      {/* Collapsed rail */}
      <div style={{
        background: 'rgb(var(--bg-elev))',
        borderRight: '.5px solid var(--separator)',
        padding: '48px 0 14px',
        display: 'flex', flexDirection: 'column', gap: 6,
        alignItems: 'center',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg, rgb(var(--mint)), rgb(var(--mint-2)))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'var(--t-stat)', fontWeight: 'var(--weight-black)', color: 'rgb(var(--on-warm))',
          marginBottom: 16,
        }}>m</div>
        {[
          { i: 'chart',     a: false },
          { i: 'briefcase', a: false },
          { i: 'eye',       a: true },
          { i: 'grid',      a: false },
          { i: 'user',      a: false },
        ].map((t, i) => (
          <div key={i} style={{
            width: 40, height: 40, borderRadius: 10,
            background: t.a ? 'rgb(var(--surface-2))' : 'transparent',
            color: t.a ? 'rgb(var(--mint))' : 'rgb(var(--text-3) / 0.38)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: t.a ? 'var(--hairline-top)' : 'none',
          }}>
            <Icon name={t.i} size={17}/>
          </div>
        ))}
        <div style={{ flex: 1 }}/>
        <ProfileChip size={36} color="rgb(var(--mint))" name="" initials="S"/>
      </div>

      <MacTitleBar/>

      <div style={{ padding: '40px 24px 0', overflow: 'hidden' }}>
        {/* Compact header */}
        <div style={{ display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div className="t-eyebrow" style={{ color: SEC.watchlist, opacity: 0.85 }}>
              Watchlist
            </div>
            <div className="t-h" style={{ fontSize: 'var(--t-h)', marginTop: 4 }}>My Symbols</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ padding: '6px 10px', borderRadius: 8,
                            background: 'rgb(var(--surface-1))', boxShadow: 'var(--hairline-top)',
                            fontSize: 'var(--t-aux)', fontWeight: 'var(--weight-semi)',
                            display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="arrow-ud" size={11}/> Manual
            </span>
            <span style={{ padding: '6px 10px', borderRadius: 8,
                            background: 'rgb(var(--mint))', color: 'rgb(var(--on-mint))',
                            fontSize: 'var(--t-aux)', fontWeight: 'var(--weight-bold)',
                            display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="plus" size={11} color="rgb(var(--on-mint))"/> Add
            </span>
          </div>
        </div>

        {/* Single-col list */}
        <div style={{
          background: 'rgb(var(--surface-1))', borderRadius: 14,
          boxShadow: 'var(--hairline-top)',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '90px 1fr 100px 100px 100px',
            padding: '10px 14px',
            fontSize: 'var(--t-caption)', fontWeight: 'var(--weight-bold)', letterSpacing: '0.04em',
            textTransform: 'uppercase', color: 'rgb(var(--text-3) / 0.38)',
            borderBottom: '.5px solid var(--separator-strong)',
          }}>
            <span>Symbol</span><span>Name</span>
            <span style={{ textAlign: 'right' }}>Last</span>
            <span style={{ textAlign: 'right' }}>Chg</span>
            <span style={{ textAlign: 'right' }}>% Chg</span>
          </div>
          {WATCHLIST.slice(0, 9).map((s, i) => (
            <div key={s.symbol} style={{
              display: 'grid',
              gridTemplateColumns: '90px 1fr 100px 100px 100px',
              padding: '10px 14px', alignItems: 'center',
              borderBottom: i === 8 ? 'none' : '.5px solid var(--separator)',
              fontSize: 'var(--t-body)',
            }}>
              <span style={{ fontWeight: 'var(--weight-black)' }}>{s.symbol}</span>
              <span className="t-aux">{s.name}</span>
              <span className="tnum" style={{ textAlign: 'right', fontWeight: 'var(--weight-bold)' }}>
                ${s.price.toFixed(2)}
              </span>
              <span className="tnum" style={{ textAlign: 'right', fontWeight: 'var(--weight-semi)',
                                                color: s.up ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                {(s.change >= 0 ? '+' : '') + s.change.toFixed(2)}
              </span>
              <span className="tnum" style={{ textAlign: 'right' }}>
                <span className={'pill-soft ' + (s.up ? 'up' : 'down')}>
                  {(s.pct >= 0 ? '+' : '') + s.pct.toFixed(2)}%
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <div className="t-aux" style={{ marginTop: 12 }}>
          ↳ Below 1024px: sidebar collapses to 64px rail · sparkline column hidden ·
          tooltip on hover shows full row
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAC WATCHLIST KEYBOARD FOCUS — R-A2
// ─────────────────────────────────────────────────────────────────
function MacWatchlistKeyboardFocus({ tweaks }) {
  return (
    <div className="mac">
      <MacSidebar active="watchlist"/>
      <MacTitleBar/>
      <div className="mac-main" style={{ padding: '40px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div className="t-eyebrow" style={{ color: SEC.watchlist, opacity: 0.85 }}>Watchlist</div>
            <div className="t-h" style={{ fontSize: 'var(--t-h-2)', marginTop: 4 }}>My Symbols</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ padding: '6px 10px', borderRadius: 8,
                            background: 'rgb(var(--surface-1))', boxShadow: 'var(--hairline-top)',
                            fontSize: 'var(--t-chip)', fontWeight: 'var(--weight-semi)',
                            display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="arrow-ud" size={11}/> Manual
            </span>
          </div>
        </div>

        {/* Keyboard hints strip */}
        <div style={{
          padding: '8px 14px', marginBottom: 12, borderRadius: 10,
          background: 'rgb(var(--mint) / 0.12)',
          border: '.5px solid rgb(var(--mint) / 0.32)',
          display: 'flex', alignItems: 'center', gap: 14,
          fontSize: 'var(--t-aux)', fontWeight: 'var(--weight-semi)', color: 'rgb(var(--mint))',
        }}>
          <Icon name="check" size={12} color="rgb(var(--mint))"/>
          Keyboard navigation
          <span style={{ display: 'inline-flex', gap: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span className="kbd" style={{ color: 'rgb(var(--mint))' }}>↑↓</span> select row
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span className="kbd" style={{ color: 'rgb(var(--mint))' }}>↵</span> open detail
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span className="kbd" style={{ color: 'rgb(var(--mint))' }}>delete</span> remove
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span className="kbd" style={{ color: 'rgb(var(--mint))' }}>⌘F</span> filter
            </span>
          </span>
        </div>

        {/* Table */}
        <div style={{
          background: 'rgb(var(--surface-1))', borderRadius: 14,
          boxShadow: 'var(--hairline-top)',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '90px 1fr 110px 100px 120px 120px',
            padding: '10px 16px',
            fontSize: 'var(--t-caption)', fontWeight: 'var(--weight-bold)', letterSpacing: '0.04em',
            textTransform: 'uppercase', color: 'rgb(var(--text-3) / 0.38)',
            borderBottom: '.5px solid var(--separator-strong)',
          }}>
            <span>Symbol</span><span>Name</span>
            <span style={{ textAlign: 'right' }}>Last</span>
            <span style={{ textAlign: 'right' }}>Chg</span>
            <span style={{ textAlign: 'right' }}>% Chg</span>
            <span style={{ textAlign: 'right' }}>Sparkline</span>
          </div>
          {WATCHLIST.slice(0, 10).map((s, i) => {
            const focused = i === 1;
            return (
              <div key={s.symbol} style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '90px 1fr 110px 100px 120px 120px',
                padding: '10px 16px', alignItems: 'center',
                borderBottom: i === 9 ? 'none' : '.5px solid var(--separator)',
                fontSize: 'var(--t-body)',
                background: focused ? 'rgb(var(--mint) / 0.08)' : 'transparent',
                outline: focused ? '2px solid rgb(var(--mint))' : 'none',
                outlineOffset: focused ? '-2px' : 0,
                borderRadius: focused ? 4 : 0,
              }}>
                <span style={{ fontWeight: 'var(--weight-black)' }}>{s.symbol}</span>
                <span className="t-aux">{s.name}</span>
                <span className="tnum" style={{ textAlign: 'right', fontWeight: 'var(--weight-bold)' }}>
                  ${s.price.toFixed(2)}
                </span>
                <span className="tnum" style={{ textAlign: 'right', fontWeight: 'var(--weight-semi)',
                                                  color: s.up ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                  {(s.change >= 0 ? '+' : '') + s.change.toFixed(2)}
                </span>
                <span style={{ textAlign: 'right' }}>
                  <span className={'pill-soft ' + (s.up ? 'up' : 'down')}>
                    {(s.pct >= 0 ? '+' : '') + s.pct.toFixed(2)}%
                  </span>
                </span>
                <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Sparkline data={s.spark} up={s.up} w={100} h={26}/>
                </span>
              </div>
            );
          })}
        </div>

        {/* Spec footnote */}
        <div className="t-aux" style={{ marginTop: 12, lineHeight: 1.5 }}>
          Row 2 (<b style={{ color: 'rgb(var(--mint))' }}>MSFT</b>) shows focus state:
          <code style={{ marginLeft: 8, padding: '1px 6px', borderRadius: 4,
                          background: 'rgb(var(--surface-2))', fontSize: 'var(--t-caption)' }}>
            :focus-visible &#123; outline: 2px solid rgb(var(--mint)); outline-offset: 2px; &#125;
          </code>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Globals
// ─────────────────────────────────────────────────────────────────
Object.assign(window, {
  IOSCollapsedNav, SpecChip,
  IOSWatchlistCollapsed, IOSAccountsCollapsed,
  IOSStatusBarProfileChip,
  IOSProfilePINSetup, IOSAccountSwitchWarning, IOSTradeSheetFromSymbol,
  MacProfileSwitchTransition,
  MacDashboardAllProfiles, MacSymbolDetailAllProfiles,
  IPadDashboard, MacWatchlistCompact, MacWatchlistKeyboardFocus,
});
