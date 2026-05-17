// screens-profiles.jsx — multi-profile system (R-P0..P7)
//
// Provides: ProfileAvatar / ProfileBadge / HouseholdHero components,
// plus the full artboard set for R-P1 (switcher), R-P2 (chrome), R-P3
// (mutation safety), R-P4 (management), R-P5 (all-profiles aggregate),
// R-P6 (PIN entry).

// ─────────────────────────────────────────────────────────────────
// Color helpers
// ─────────────────────────────────────────────────────────────────
function profileRgb(profile, a) {
  if (!profile) return 'rgb(var(--mint))';
  return a == null
    ? `rgb(var(--p-${profile.color}))`
    : `rgb(var(--p-${profile.color}) / ${a})`;
}

// ─────────────────────────────────────────────────────────────────
// ProfileAvatar — supports initials | emoji | photo
// ─────────────────────────────────────────────────────────────────
function ProfileAvatar({ profile, size = 32, ring = true, dim = false }) {
  if (!profile) return null;
  const c = profileRgb(profile);
  const bg = profileRgb(profile, 0.18);
  const border = profileRgb(profile, 0.55);
  const isEmoji = profile.avatar_kind === 'emoji';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg,
      color: c,
      border: ring ? `1px solid ${border}` : 'none',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: isEmoji ? size * 0.56 : size * 0.42,
      fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1,
      flex: '0 0 auto',
      opacity: dim ? 0.55 : 1,
    }}>
      {profile.avatar_value}
    </div>
  );
}

// Small chip showing avatar + name + relation
function ProfileTag({ profile, size = 30 }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
    }}>
      <ProfileAvatar profile={profile} size={size}/>
      <div style={{ lineHeight: 1.15 }}>
        <div style={{
          fontSize: 14, fontWeight: 800,
          color: profileRgb(profile),
        }}>{profile.name}</div>
        <div style={{
          fontSize: 11, fontWeight: 500,
          color: 'rgb(var(--text-3) / 0.62)',
        }}>{profile.relation === 'self' ? 'you' : profile.relation}</div>
      </div>
    </div>
  );
}

// Tiny 14px circular badge — used on movers/positions to attribute holding
function ProfileBadge({ profile, size = 14 }) {
  const isEmoji = profile.avatar_kind === 'emoji';
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      background: profileRgb(profile, 0.22),
      border: `1px solid ${profileRgb(profile, 0.55)}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: isEmoji ? size * 0.7 : size * 0.58,
      fontWeight: 800, color: profileRgb(profile),
      flex: '0 0 auto', lineHeight: 1,
    }}>{profile.avatar_value}</span>
  );
}

// ─────────────────────────────────────────────────────────────────
// ProfileChip card — top of mac sidebar, also iOS NavHeader leading
// Shows avatar + name + today P/L + chevron
// ─────────────────────────────────────────────────────────────────
function ProfileChipCard({ profile, compact = false }) {
  const m = profileMetrics(profile.id);
  const up = m.todayPL >= 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: compact ? '6px 10px' : '8px 10px',
      background: profileRgb(profile, 0.08),
      border: `1px solid ${profileRgb(profile, 0.18)}`,
      borderRadius: 10,
    }}>
      <ProfileAvatar profile={profile} size={compact ? 22 : 26}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: 800, lineHeight: 1.15,
          color: profileRgb(profile),
        }}>{profile.display_name}</div>
        <div className="tnum" style={{ fontSize: 10.5, color: 'rgb(var(--text-3) / 0.38)' }}>
          ${fmtCompact(m.netWorth)} ·{' '}
          <span style={{ color: up ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
            {(up ? '+' : '') + m.todayPct.toFixed(2)}%
          </span>
        </div>
      </div>
      <Icon name="chevron-d" size={12} color="rgb(var(--text-3) / 0.62)"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS PROFILE SWITCHER — full-screen sheet (R-P1)
// ─────────────────────────────────────────────────────────────────
function IOSProfileSwitcherSheet({ tweaks, height = 980 }) {
  const activeId = 'sam';
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        {/* Backdrop dimmed dashboard underneath */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgb(0 0 0 / 0.55)',
          backdropFilter: 'blur(20px)',
        }}/>

        {/* Sheet */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 60, bottom: 0,
          background: 'rgb(var(--bg))',
          borderTopLeftRadius: 22, borderTopRightRadius: 22,
          padding: '8px 0 28px',
          boxShadow: '0 -2px 30px rgb(0 0 0 / 0.5)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Grabber */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 14px' }}>
            <span style={{
              width: 38, height: 5, borderRadius: 3,
              background: 'rgb(255 255 255 / 0.22)',
            }}/>
          </div>

          {/* Header */}
          <div style={{ padding: '0 20px 14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: 'rgb(var(--mint))', fontWeight: 600 }}>
              Cancel
            </span>
            <span style={{ fontSize: 17, fontWeight: 700 }}>Switch profile</span>
            <span style={{ width: 50 }}/>
          </div>

          {/* Eyebrow */}
          <div style={{
            padding: '8px 20px 8px',
            fontSize: 11.5, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'rgb(var(--text-3) / 0.38)',
          }}>Pinned</div>

          {/* Profile list */}
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PROFILES.map((p) => {
              const m = profileMetrics(p.id);
              const up = m.todayPL >= 0;
              const isActive = p.id === activeId;
              return (
                <div key={p.id} style={{
                  padding: '14px 16px',
                  background: isActive
                    ? profileRgb(p, 0.08)
                    : 'rgb(var(--surface-1))',
                  border: isActive
                    ? `1px solid ${profileRgb(p, 0.3)}`
                    : '1px solid transparent',
                  borderRadius: 14,
                  boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <ProfileAvatar profile={p} size={44}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 16, fontWeight: 800,
                        color: profileRgb(p),
                      }}>{p.display_name}</span>
                      {p.pin_hash && (
                        <span style={{
                          fontSize: 9.5, fontWeight: 700, letterSpacing: '0.04em',
                          padding: '2px 5px', borderRadius: 4,
                          background: 'rgb(255 193 118 / 0.18)',
                          color: '#FFC176',
                        }}>PIN</span>
                      )}
                    </div>
                    <div className="tnum" style={{
                      fontSize: 12, marginTop: 2,
                      color: 'rgb(var(--text-3) / 0.62)',
                    }}>
                      ${fmtCompact(m.netWorth)} · {m.accountCount}{' '}accts ·{' '}
                      <span style={{ color: up ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                        {(up ? '+' : '') + fmtMoney(m.todayPL)}
                      </span>
                    </div>
                  </div>
                  {isActive && (
                    <Icon name="check" size={18} color={profileRgb(p)} strokeWidth={2.5}/>
                  )}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgb(255 255 255 / 0.06)',
                        margin: '22px 20px 8px' }}/>

          {/* Footer actions */}
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { icon: 'grid', label: 'All profiles', sub: 'Read-only household view' },
              { icon: 'edit', label: 'Manage profiles' },
              { icon: 'plus', label: 'Add profile', accent: true },
            ].map((row) => (
              <div key={row.label} style={{
                padding: '14px 14px',
                background: 'rgb(var(--surface-1))',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: row.accent ? 'rgb(var(--mint) / 0.18)' : 'rgb(255 255 255 / 0.05)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={row.icon} size={14} color={row.accent ? 'rgb(var(--mint))' : 'rgb(var(--text-2) / 0.62)'}/>
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600,
                                  color: row.accent ? 'rgb(var(--mint))' : 'rgb(var(--text))' }}>
                    {row.label}
                  </div>
                  {row.sub && (
                    <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)', marginTop: 1 }}>
                      {row.sub}
                    </div>
                  )}
                </div>
                <Icon name="chevron-r" size={12} color="rgb(var(--text-3) / 0.62)"/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAC PROFILE SWITCHER — sidebar w/ profile chip + popover open
// ─────────────────────────────────────────────────────────────────
function MacProfileSwitcher({ tweaks }) {
  return (
    <div className="mac">
      <MacTitleBar/>
      <MacSidebarV2 active="home"/>
      <main className="mac-main" style={{ paddingTop: 32 }}>
        <div style={{ position: 'relative', height: '100%' }}>
          {/* Dim'd background hint */}
          <div style={{ position: 'absolute', inset: 0,
                        background: 'rgb(0 0 0 / 0.35)', backdropFilter: 'blur(4px)' }}/>

          {/* Popover anchored near sidebar */}
          <div style={{
            position: 'absolute', top: 18, left: 18,
            width: 320,
            background: 'rgb(50 50 55 / 0.96)',
            backdropFilter: 'blur(40px) saturate(180%)',
            border: '.5px solid rgb(255 255 255 / 0.10)',
            borderRadius: 14,
            boxShadow: '0 16px 40px rgb(0 0 0 / 0.45)',
            overflow: 'hidden',
            padding: '8px 0',
          }}>
            <div style={{
              padding: '8px 16px 4px',
              fontSize: 11.5, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'rgb(var(--text-3) / 0.62)',
            }}>Switch profile</div>
            {PROFILES.map((p) => {
              const m = profileMetrics(p.id);
              const up = m.todayPL >= 0;
              const isActive = p.id === 'sam';
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 16px',
                  background: isActive ? profileRgb(p, 0.08) : 'transparent',
                }}>
                  <ProfileAvatar profile={p} size={28}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: profileRgb(p) }}>
                      {p.name}
                    </div>
                    <div className="tnum" style={{ fontSize: 10.5, color: 'rgb(var(--text-3) / 0.38)' }}>
                      ${fmtCompact(m.netWorth)} ·{' '}
                      <span style={{ color: up ? 'rgb(var(--up))' : 'rgb(var(--down))' }}>
                        {(up ? '+' : '') + m.todayPct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  {isActive && <Icon name="check" size={13} color={profileRgb(p)} strokeWidth={2.5}/>}
                  <span className="kbd" style={{ fontSize: 10, padding: '1px 4px' }}>⌘{PROFILES.indexOf(p) + 1}</span>
                </div>
              );
            })}
            <div style={{ height: .5, background: 'rgb(255 255 255 / 0.08)', margin: '4px 0' }}/>
            <div style={{ padding: '8px 16px',
                          display: 'flex', alignItems: 'center', gap: 10,
                          fontSize: 13, color: 'rgb(var(--text-2) / 0.62)' }}>
              <Icon name="grid" size={13}/> All profiles
              <span style={{ flex: 1 }}/>
              <span className="kbd" style={{ fontSize: 10, padding: '1px 4px' }}>⌘0</span>
            </div>
            <div style={{ padding: '8px 16px',
                          display: 'flex', alignItems: 'center', gap: 10,
                          fontSize: 13, color: 'rgb(var(--text-2) / 0.62)' }}>
              <Icon name="edit" size={13}/> Manage profiles…
            </div>
            <div style={{ padding: '8px 16px',
                          display: 'flex', alignItems: 'center', gap: 10,
                          fontSize: 13, color: 'rgb(var(--mint))', fontWeight: 600 }}>
              <Icon name="plus" size={13} color="rgb(var(--mint))"/> Add profile
              <span style={{ flex: 1 }}/>
              <span className="kbd" style={{ fontSize: 10, padding: '1px 4px' }}>⌘⇧P</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAC DASHBOARD PROFILE CHROME — 3 mini dashes side-by-side
// Demonstrates pre-attentive differentiation per R-P2.
// ─────────────────────────────────────────────────────────────────
function MacDashboardProfileChrome({ tweaks, height = 820 }) {
  return (
    <div className="mac" style={{
      gridTemplateColumns: '1fr', height,
      background: 'rgb(var(--bg))',
    }}>
      <MacTitleBar/>
      <main style={{
        padding: '54px 28px 28px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
        overflow: 'hidden',
      }}>
        {PROFILES.map((p) => {
          const c = profileRgb(p);
          const m = profileMetrics(p.id);
          const up = m.todayPL >= 0;
          const grad = up
            ? `radial-gradient(140% 90% at 0% 0%, rgb(var(--up) / 0.14) 0%, transparent 55%)`
            : `radial-gradient(140% 90% at 0% 0%, rgb(var(--down) / 0.12) 0%, transparent 55%)`;
          return (
            <div key={p.id} style={{
              position: 'relative',
              background: 'rgb(var(--bg-elev))',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Profile stripe (R-P2 sidebar 3px stripe) */}
              <span style={{
                position: 'absolute', top: 0, bottom: 0, left: 0, width: 3,
                background: c,
              }}/>

              {/* Mini nav header */}
              <div style={{ padding: '14px 18px 10px 22px',
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: profileRgb(p, 0.04),
                            borderBottom: `.5px solid ${profileRgb(p, 0.15)}` }}>
                <ProfileAvatar profile={p} size={26}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: c, lineHeight: 1.1 }}>
                    {p.display_name}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'rgb(var(--text-3) / 0.38)' }}>
                    Home · {m.accountCount} accts
                  </div>
                </div>
                <span style={{
                  fontSize: 9.5, fontWeight: 700, letterSpacing: '0.04em',
                  padding: '2px 6px', borderRadius: 4,
                  background: profileRgb(p, 0.18),
                  color: c,
                  textTransform: 'uppercase',
                }}>{p.relation}</span>
              </div>

              {/* Hero */}
              <div style={{
                padding: '18px 22px 12px 24px',
                background: `${grad}, transparent`,
              }}>
                <div style={{ fontSize: 10.5, fontWeight: 700,
                              letterSpacing: '0.08em', textTransform: 'uppercase',
                              color: c }}>
                  Net Worth
                </div>
                <div className="tnum" style={{
                  fontSize: 30, fontWeight: 800,
                  letterSpacing: '-0.025em', marginTop: 6,
                }}>
                  ${fmtNum(m.netWorth, 0)}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginTop: 4, fontSize: 12.5 }}>
                  <span className="tnum" style={{ color: up ? 'rgb(var(--up))' : 'rgb(var(--down))', fontWeight: 700 }}>
                    {(up ? '+' : '') + fmtMoney(m.todayPL)}
                  </span>
                  <span className="tnum" style={{ color: up ? 'rgb(var(--up))' : 'rgb(var(--down))', fontWeight: 600 }}>
                    {(up ? '+' : '') + m.todayPct.toFixed(2)}%
                  </span>
                  <span style={{ color: 'rgb(var(--text-3) / 0.38)', fontSize: 11 }}>Today</span>
                </div>
              </div>

              {/* Top holdings preview */}
              <div style={{ padding: '6px 16px 12px', flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700,
                              letterSpacing: '0.08em', textTransform: 'uppercase',
                              color: 'rgb(var(--text-3) / 0.38)', margin: '6px 8px 8px' }}>
                  Top holdings
                </div>
                {accountsForProfile(p.id)
                  .flatMap((a) => a.holdings.map((h) => ({ ...h, sym: h.sym, account: a })))
                  .sort((a, b) => b.qty * SYMBOLS[b.sym].price - a.qty * SYMBOLS[a.sym].price)
                  .slice(0, 4)
                  .map((h, i, arr) => {
                    const s = SYMBOLS[h.sym];
                    return (
                      <div key={h.sym + h.account.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 8px',
                        borderBottom: i === arr.length - 1 ? 'none' : '.5px solid rgb(var(--separator-alpha))',
                      }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, minWidth: 44 }}>{h.sym}</span>
                        <span style={{ flex: 1 }}>
                          <Sparkline data={s.spark} up={s.up} w={64} h={20}/>
                        </span>
                        <span className="tnum" style={{
                          fontSize: 11, fontWeight: 700,
                          minWidth: 50, textAlign: 'right',
                          color: s.up ? 'rgb(var(--up))' : 'rgb(var(--down))',
                        }}>
                          {(s.up ? '+' : '') + s.pct.toFixed(2)}%
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Primary CTA tinted in profile color */}
              <div style={{ padding: '8px 16px 14px' }}>
                <div style={{
                  padding: '10px 0',
                  background: c, color: '#07120D',
                  textAlign: 'center',
                  borderRadius: 10,
                  fontSize: 12.5, fontWeight: 800, letterSpacing: 0.01,
                  boxShadow: `0 4px 12px ${profileRgb(p, 0.32)}`,
                }}>
                  Record trade for {p.name}
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS TRADE SHEET — Profile-attributed header (R-P3)
// ─────────────────────────────────────────────────────────────────
function IOSTradeSheetProfileHeader({ tweaks, height = 900 }) {
  const profile = profileById('mom');     // operator recording for Mom
  const c = profileRgb(profile);
  const hide = !!tweaks.privacy;
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgb(0 0 0 / 0.45)', backdropFilter: 'blur(4px)',
        }}/>

        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: 'rgb(var(--bg-elev))',
          borderTopLeftRadius: 22, borderTopRightRadius: 22,
          padding: 0,
          boxShadow: '0 -2px 30px rgb(0 0 0 / 0.5)',
          overflow: 'hidden',
        }}>
          {/* 4px top strip in profile color (R-P3) */}
          <span style={{
            display: 'block', height: 4, width: '100%', background: c,
          }}/>

          {/* Grabber */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 6px' }}>
            <span style={{
              width: 38, height: 5, borderRadius: 3,
              background: 'rgb(255 255 255 / 0.22)',
            }}/>
          </div>

          {/* 3-line profile-attributed header */}
          <div style={{ padding: '6px 20px 16px',
                        background: profileRgb(profile, 0.05),
                        borderBottom: `.5px solid ${profileRgb(profile, 0.18)}` }}>
            <div style={{
              fontSize: 11, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: c, marginBottom: 8,
            }}>Recording for</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ProfileAvatar profile={profile} size={36}/>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 17, fontWeight: 800,
                  color: c, lineHeight: 1.15,
                }}>{profile.display_name}</div>
                <div style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.62)' }}>
                  {profile.name} · {profile.relation}
                </div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontSize: 12, fontWeight: 600,
                              color: 'rgb(var(--text-2) / 0.62)' }}>
                Switch <Icon name="chevron-d" size={11} color="rgb(var(--text-2) / 0.62)"/>
              </span>
            </div>
          </div>

          {/* Sheet body — abbreviated */}
          <div style={{ padding: '14px 16px 0',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, color: 'rgb(var(--mint))', fontWeight: 600 }}>Cancel</span>
            <span style={{ fontSize: 17, fontWeight: 700 }}>New Trade</span>
            <span style={{ fontSize: 15, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 600 }}>Save</span>
          </div>

          {/* Segmented */}
          <div style={{ padding: '12px 16px 14px' }}>
            <div style={{
              display: 'flex', background: 'rgb(var(--surface-2))',
              borderRadius: 10, padding: 2,
            }}>
              {['Buy','Sell','Dividend','Split'].map((k, i) => (
                <span key={k} style={{
                  flex: 1, textAlign: 'center', padding: '7px 0',
                  borderRadius: 8,
                  fontSize: 13, fontWeight: 600,
                  background: i === 0 ? c : 'transparent',
                  color: i === 0 ? '#07120D' : 'rgb(var(--text-2) / 0.62)',
                }}>{k}</span>
              ))}
            </div>
          </div>

          {/* Symbol hero */}
          <div style={{ padding: '4px 18px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <SymbolLogo sym="SCHD" size={42}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>SCHD</div>
              <div style={{ fontSize: 12, color: 'rgb(var(--text-2) / 0.62)' }}>
                Schwab US Dividend · $31.72
              </div>
            </div>
            <PercentPill pct={-0.25} size="sm"/>
          </div>

          {/* Account dropdown — Mom's only */}
          <div style={{ padding: '0 18px 12px' }}>
            <div style={{
              background: 'rgb(var(--surface-1))',
              borderRadius: 12, padding: '12px 14px',
              boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: c, boxShadow: `0 0 0 2px ${profileRgb(profile, 0.22)}`,
              }}/>
              <div style={{ flex: 1, lineHeight: 1.1 }}>
                <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)' }}>Account</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Schwab · Individual ••8721</div>
              </div>
              <Icon name="chevron-d" size={12} color="rgb(var(--text-3) / 0.62)"/>
            </div>
          </div>

          {/* Mini quantity / price fields */}
          <div style={{ padding: '0 18px 12px', display: 'grid',
                        gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Quantity" value="40" big/>
            <Field label="Price" value="$31.72" big/>
          </div>

          {/* Total */}
          <div style={{ margin: '8px 16px 12px', padding: '14px 16px',
                        borderRadius: 14, background: profileRgb(profile, 0.08),
                        border: `1px solid ${profileRgb(profile, 0.2)}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: c, fontWeight: 700 }}>Estimated total</span>
            <PriceText value={40 * 31.72} prefix="$" decimals={2} hidden={hide}
                       style={{ fontSize: 22, fontWeight: 800 }}/>
          </div>

          {/* Profile-tinted CTA */}
          <div style={{ padding: '0 16px 28px' }}>
            <div style={{
              background: c, color: '#07120D',
              textAlign: 'center', padding: '14px 0',
              borderRadius: 14, fontSize: 16, fontWeight: 800,
              boxShadow: `0 6px 18px ${profileRgb(profile, 0.32)}`,
            }}>
              Record Buy · 40 SCHD for {profile.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS DELETE TRANSACTION CONFIRM (R-P3)
// ─────────────────────────────────────────────────────────────────
function IOSDeleteTransactionConfirm({ tweaks, height = 844 }) {
  const profile = profileById('mom');
  const c = profileRgb(profile);
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgb(0 0 0 / 0.6)', backdropFilter: 'blur(10px)',
        }}/>
        {/* Confirmation dialog — iOS alert style */}
        <div style={{
          position: 'absolute', left: 36, right: 36,
          top: '50%', transform: 'translateY(-50%)',
          background: 'rgb(50 50 55 / 0.96)',
          backdropFilter: 'blur(40px) saturate(180%)',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgb(0 0 0 / 0.6)',
        }}>
          {/* Profile attribution band */}
          <div style={{
            padding: '14px 18px',
            background: profileRgb(profile, 0.12),
            borderBottom: `.5px solid ${profileRgb(profile, 0.25)}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <ProfileAvatar profile={profile} size={28}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.62)' }}>From</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c }}>
                {profile.name}'s Schwab · Individual
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 22px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
              Delete transaction?
            </div>
            <div style={{ fontSize: 13, color: 'rgb(var(--text-2) / 0.62)', lineHeight: 1.4 }}>
              Buy <b style={{ color: 'rgb(var(--text))' }}>50 NVDA</b> on May 10 at $118.40 will be
              permanently removed from {profile.name}'s account. Cost basis &amp; holdings will recompute.
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
                        borderTop: '.5px solid rgb(255 255 255 / 0.1)',
                        marginTop: 18 }}>
            <div style={{
              padding: '14px 0', textAlign: 'center',
              fontSize: 16, fontWeight: 500,
              color: 'rgb(var(--mint))',
              borderRight: '.5px solid rgb(255 255 255 / 0.1)',
            }}>Cancel</div>
            <div style={{
              padding: '14px 0', textAlign: 'center',
              fontSize: 16, fontWeight: 700,
              color: 'rgb(var(--down))',
            }}>Delete</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS PROFILE EDITOR (R-P4) — name, avatar, color, relation, PIN
// ─────────────────────────────────────────────────────────────────
function IOSProfileEditor({ tweaks, height = 1320 }) {
  const profile = profileById('mom');
  const c = profileRgb(profile);

  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* Nav header */}
          <div style={{ padding: '4px 16px 12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, color: 'rgb(var(--mint))', fontWeight: 600 }}>Cancel</span>
            <span style={{ fontSize: 17, fontWeight: 700 }}>Edit profile</span>
            <span style={{ fontSize: 15, color: c, fontWeight: 700 }}>Save</span>
          </div>

          {/* Avatar preview */}
          <div style={{ padding: '14px 0 22px', textAlign: 'center' }}>
            <ProfileAvatar profile={profile} size={80}/>
            <div style={{ marginTop: 10, fontSize: 13, color: c, fontWeight: 600 }}>
              Change photo
            </div>
          </div>

          {/* Name fields */}
          <div style={{ margin: '0 16px 18px',
                        background: 'rgb(var(--surface-1))',
                        borderRadius: 14,
                        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
                        overflow: 'hidden' }}>
            {[
              ['Short name',   profile.name],
              ['Display name', profile.display_name],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 16px',
                borderBottom: i === arr.length - 1 ? 'none' : '.5px solid rgb(255 255 255 / 0.06)',
              }}>
                <span style={{ flex: '0 0 auto', minWidth: 100,
                                fontSize: 13, color: 'rgb(var(--text-3) / 0.62)' }}>{k}</span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Color picker — 8 swatches */}
          <div style={{ margin: '0 16px 22px' }}>
            <div style={{
              fontSize: 11, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'rgb(var(--text-3) / 0.38)', marginBottom: 10, padding: '0 4px',
            }}>Profile color</div>
            <div style={{
              background: 'rgb(var(--surface-1))',
              borderRadius: 14, padding: '18px 16px',
              boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 10 }}>
                {[1,2,3,4,5,6,7,8].map((n) => {
                  const color = `rgb(var(--p-${n}))`;
                  const sel = n === profile.color;
                  return (
                    <div key={n} style={{
                      aspectRatio: '1',
                      borderRadius: '50%',
                      background: `rgb(var(--p-${n}) / 0.22)`,
                      border: sel ? `2px solid ${color}` : `1px solid rgb(var(--p-${n}) / 0.4)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                    }}>
                      <span style={{
                        width: '52%', height: '52%', borderRadius: '50%',
                        background: color,
                      }}/>
                      {sel && (
                        <span style={{
                          position: 'absolute',
                          inset: -5,
                          borderRadius: '50%',
                          border: `1.5px solid ${color}`,
                          opacity: 0.55,
                        }}/>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Relation chips */}
          <div style={{ margin: '0 16px 22px' }}>
            <div style={{
              fontSize: 11, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'rgb(var(--text-3) / 0.38)', marginBottom: 10, padding: '0 4px',
            }}>Relation</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['self', 'partner', 'parent', 'child', 'sibling', 'other'].map((r) => {
                const sel = r === profile.relation;
                return (
                  <span key={r} style={{
                    padding: '7px 14px',
                    borderRadius: 999,
                    fontSize: 13, fontWeight: 600,
                    background: sel ? c : 'rgb(var(--surface-1))',
                    color: sel ? '#07120D' : 'rgb(var(--text-2) / 0.62)',
                    border: sel ? '0' : '1px solid rgb(255 255 255 / 0.06)',
                    textTransform: 'capitalize',
                  }}>{r}</span>
                );
              })}
            </div>
          </div>

          {/* PIN (R-P6) */}
          <div style={{ margin: '0 16px 22px',
                        background: 'rgb(var(--surface-1))',
                        borderRadius: 14, overflow: 'hidden',
                        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12,
                          padding: '14px 16px',
                          borderBottom: '.5px solid rgb(255 255 255 / 0.06)' }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgb(255 193 118 / 0.18)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="bell" size={14} color="#FFC176"/>
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>4-digit PIN</div>
                <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.62)', marginTop: 1 }}>
                  Optional · prevents casual snooping when handing device over
                </div>
              </div>
              <span className="ios-switch on"/>
            </div>
            <div style={{ padding: '12px 16px',
                          fontSize: 13, color: c, fontWeight: 600 }}>
              Change PIN…
            </div>
          </div>

          {/* Delete profile (destructive) */}
          <div style={{ margin: '0 16px 24px',
                        background: 'rgb(var(--surface-1))',
                        borderRadius: 14, padding: '14px 16px',
                        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
                        fontSize: 14, color: 'rgb(var(--down))', fontWeight: 600 }}>
            Delete profile
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS PROFILES LIST (R-P4) — Settings → Profiles
// ─────────────────────────────────────────────────────────────────
function IOSSettingsProfilesList({ tweaks, height = 980 }) {
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          <div style={{ padding: '4px 16px 12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 15, color: 'rgb(var(--mint))', fontWeight: 500 }}>
              <Icon name="chevron-l" size={14} color="rgb(var(--mint))"/> Me
            </span>
            <span style={{ fontSize: 17, fontWeight: 700 }}>Profiles</span>
            <span style={{ fontSize: 15, color: 'rgb(var(--mint))', fontWeight: 600 }}>Edit</span>
          </div>

          {/* Eyebrow */}
          <div style={{
            padding: '10px 20px 8px',
            fontSize: 11.5, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'rgb(var(--sec-portfolio))',
          }}>
            Profiles · {PROFILES.length}
          </div>

          {/* Profile list */}
          <div style={{ margin: '0 16px',
                        background: 'rgb(var(--surface-1))',
                        borderRadius: 14, overflow: 'hidden',
                        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)' }}>
            {PROFILES.map((p, i, arr) => {
              const m = profileMetrics(p.id);
              const c = profileRgb(p);
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  borderBottom: i === arr.length - 1 ? 'none' : '.5px solid rgb(255 255 255 / 0.06)',
                }}>
                  <Icon name="more" size={14} color="rgb(var(--text-3) / 0.38)"/>
                  <ProfileAvatar profile={p} size={36}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14.5, fontWeight: 700, color: c }}>{p.name}</span>
                      {p.id === 'sam' && (
                        <span style={{
                          fontSize: 9, fontWeight: 800, letterSpacing: '0.04em',
                          padding: '1px 5px', borderRadius: 3,
                          background: 'rgb(var(--mint) / 0.18)',
                          color: 'rgb(var(--mint))',
                        }}>YOU</span>
                      )}
                      {p.pin_hash && (
                        <Icon name="bell" size={11} color="#FFC176"/>
                      )}
                    </div>
                    <div className="tnum" style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.62)', marginTop: 2 }}>
                      ${fmtCompact(m.netWorth)} · {m.accountCount} accounts · {p.relation}
                    </div>
                  </div>
                  <Icon name="chevron-r" size={12} color="rgb(var(--text-3) / 0.62)"/>
                </div>
              );
            })}
          </div>

          {/* Add profile CTA */}
          <div style={{ padding: '20px 16px 0' }}>
            <div style={{
              padding: '14px 16px',
              background: 'rgb(var(--mint) / 0.10)',
              border: '1px dashed rgb(var(--mint) / 0.3)',
              borderRadius: 14,
              display: 'flex', alignItems: 'center', gap: 12,
              color: 'rgb(var(--mint))', fontWeight: 700, fontSize: 14,
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgb(var(--mint) / 0.18)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="plus" size={14} color="rgb(var(--mint))" strokeWidth={2.5}/>
              </span>
              Add profile
              <span style={{ flex: 1 }}/>
              <span style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.62)', fontWeight: 500 }}>
                For a family member
              </span>
            </div>
          </div>

          {/* App-level (operator) settings — visually separated */}
          <div style={{
            padding: '32px 20px 8px',
            fontSize: 11.5, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'rgb(var(--text-3) / 0.38)',
          }}>
            App settings · operator-level
          </div>
          <div style={{ margin: '0 16px',
                        background: 'rgb(var(--surface-1))',
                        borderRadius: 14, overflow: 'hidden',
                        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)' }}>
            {[
              ['App password', 'Enabled'],
              ['Finnhub API key', '••••••••cf3a'],
              ['Quote refresh', 'Every 60s'],
              ['Backup &amp; restore', null],
            ].map(([label, val], i, arr) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 16px',
                borderBottom: i === arr.length - 1 ? 'none' : '.5px solid rgb(255 255 255 / 0.06)',
                fontSize: 14.5,
              }}>
                <span style={{ flex: 1 }} dangerouslySetInnerHTML={{ __html: label }}/>
                {val && <span style={{ fontSize: 13, color: 'rgb(var(--text-3) / 0.62)' }}>{val}</span>}
                <Icon name="chevron-r" size={12} color="rgb(var(--text-3) / 0.62)"/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS ADD PROFILE SHEET (R-P4)
// ─────────────────────────────────────────────────────────────────
function IOSAddProfileSheet({ tweaks, height = 1080 }) {
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgb(0 0 0 / 0.5)', backdropFilter: 'blur(10px)',
        }}/>

        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: 'rgb(var(--bg-elev))',
          borderTopLeftRadius: 22, borderTopRightRadius: 22,
          padding: '8px 0 28px',
          maxHeight: '92%',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 14px' }}>
            <span style={{ width: 38, height: 5, borderRadius: 3, background: 'rgb(255 255 255 / 0.22)' }}/>
          </div>
          <div style={{ padding: '0 20px 18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, color: 'rgb(var(--mint))', fontWeight: 600 }}>Cancel</span>
            <span style={{ fontSize: 17, fontWeight: 700 }}>New profile</span>
            <span style={{ fontSize: 15, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 600 }}>Create</span>
          </div>

          {/* Big avatar preview */}
          <div style={{ padding: '14px 0 24px', textAlign: 'center' }}>
            <div style={{
              width: 92, height: 92, borderRadius: '50%',
              background: 'rgb(var(--surface-1))',
              border: '2px dashed rgb(255 255 255 / 0.18)',
              margin: '0 auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, color: 'rgb(var(--text-3) / 0.62)',
            }}>
              <Icon name="user" size={36} color="rgb(var(--text-3) / 0.62)"/>
            </div>
            <div style={{ marginTop: 10,
                            display: 'flex', gap: 18, justifyContent: 'center',
                            fontSize: 12, color: 'rgb(var(--text-2) / 0.62)' }}>
              <span style={{ color: 'rgb(var(--mint))', fontWeight: 600 }}>Initials</span>
              <span>Emoji</span>
              <span>Photo</span>
            </div>
          </div>

          {/* Helpful prompt */}
          <div style={{ padding: '0 20px 18px',
                        fontSize: 12.5, color: 'rgb(var(--text-2) / 0.62)',
                        textAlign: 'center', lineHeight: 1.5 }}>
            Each profile owns its own accounts, watchlists, &amp; trades.
            Switch anytime; data stays separate.
          </div>

          {/* Form */}
          <div style={{ margin: '0 16px',
                        background: 'rgb(var(--surface-1))',
                        borderRadius: 14, overflow: 'hidden',
                        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)' }}>
            {[
              ['Short name',   'Sister'],
              ['Display name', 'Chen Yifei · 妹妹'],
              ['Relation',     'sibling'],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 16px',
                borderBottom: i === arr.length - 1 ? 'none' : '.5px solid rgb(255 255 255 / 0.06)',
              }}>
                <span style={{ flex: '0 0 auto', minWidth: 100,
                                fontSize: 13, color: 'rgb(var(--text-3) / 0.62)' }}>{k}</span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Color preview */}
          <div style={{ padding: '18px 16px 0' }}>
            <div style={{
              fontSize: 11, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'rgb(var(--text-3) / 0.38)', marginBottom: 10, padding: '0 4px',
            }}>Profile color</div>
            <div style={{
              background: 'rgb(var(--surface-1))',
              borderRadius: 14, padding: '14px 16px',
              boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
              display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8,
            }}>
              {[1,2,3,4,5,6,7,8].map((n) => {
                const color = `rgb(var(--p-${n}))`;
                const sel = n === 4;
                return (
                  <div key={n} style={{
                    aspectRatio: '1', borderRadius: '50%',
                    background: `rgb(var(--p-${n}) / 0.22)`,
                    border: sel ? `2px solid ${color}` : `1px solid rgb(var(--p-${n}) / 0.4)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      width: '52%', height: '52%', borderRadius: '50%', background: color,
                    }}/>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS PROFILE PIN ENTRY (R-P6)
// ─────────────────────────────────────────────────────────────────
function IOSProfilePINEntry({ tweaks, height = 844 }) {
  const profile = profileById('mom');
  const c = profileRgb(profile);
  const entered = 3;          // 3 of 4 dots filled
  return (
    <div className="ios" style={{ height,
                                    background: `radial-gradient(80% 60% at 50% 30%, ${profileRgb(profile, 0.16)} 0%, transparent 60%), rgb(var(--bg))` }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '4px 16px 8px', display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 15, color: 'rgb(var(--mint))', fontWeight: 600 }}>Cancel</span>
          </div>

          {/* Profile context */}
          <div style={{ padding: '40px 20px 0', textAlign: 'center' }}>
            <ProfileAvatar profile={profile} size={68}/>
            <div style={{ marginTop: 14, fontSize: 17, fontWeight: 700,
                            color: c }}>
              Switch to {profile.display_name}
            </div>
            <div style={{ marginTop: 4, fontSize: 13, color: 'rgb(var(--text-2) / 0.62)' }}>
              Enter PIN to continue
            </div>
          </div>

          {/* PIN dots */}
          <div style={{ padding: '32px 20px 14px',
                          display: 'flex', justifyContent: 'center', gap: 20 }}>
            {[0,1,2,3].map((i) => {
              const filled = i < entered;
              return (
                <span key={i} style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: filled ? c : 'rgb(255 255 255 / 0.12)',
                  border: filled ? 'none' : '1.5px solid rgb(255 255 255 / 0.18)',
                  transition: 'background 120ms ease',
                }}/>
              );
            })}
          </div>

          <div style={{ padding: '0 20px 18px', textAlign: 'center',
                          fontSize: 12, color: 'rgb(var(--text-3) / 0.62)' }}>
            3 attempts remaining
          </div>

          {/* Numpad */}
          <div style={{ padding: '14px 38px 28px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {[1,2,3,4,5,6,7,8,9,null,0,'⌫'].map((k, i) => {
                if (k === null) return <span key={i}/>;
                return (
                  <div key={i} style={{
                    height: 64, borderRadius: '50%',
                    background: 'rgb(255 255 255 / 0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, fontWeight: 500,
                    color: 'rgb(var(--text))',
                  }}>
                    {k}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// HOUSEHOLD HERO + IOS DASHBOARD ALL PROFILES (R-P5)
// ─────────────────────────────────────────────────────────────────
function HouseholdHero({ hide }) {
  const H = HOUSEHOLD;
  const up = H.todayPL >= 0;
  return (
    <div style={{
      margin: '0 16px 14px',
      padding: '16px 18px 14px',
      borderRadius: 20,
      background: `linear-gradient(135deg, rgb(255 255 255 / 0.02), transparent), rgb(var(--surface-1))`,
      boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'rgb(var(--sec-portfolio))',
        }}>Household · all profiles</div>
        <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.38)' }}>
          {PROFILES.length} people · read-only
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <PriceText value={H.netWorth} hidden={hide} prefix="$" decimals={2}
                   style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.026em' }}/>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginTop: 4, fontSize: 13.5 }}>
        <span className="tnum" style={{ color: up ? 'rgb(var(--up))' : 'rgb(var(--down))', fontWeight: 700 }}>
          {(up ? '+' : '') + fmtMoney(H.todayPL)}
        </span>
        <span className="tnum" style={{ color: up ? 'rgb(var(--up))' : 'rgb(var(--down))', fontWeight: 600 }}>
          {(up ? '+' : '') + H.todayPct.toFixed(2)}%
        </span>
        <span style={{ color: 'rgb(var(--text-3) / 0.38)', fontWeight: 500 }}>Today</span>
      </div>

      {/* Stacked bar — one segment per profile, width = share of total */}
      <div style={{
        marginTop: 16, height: 14, borderRadius: 999,
        background: 'rgb(255 255 255 / 0.04)',
        overflow: 'hidden',
        display: 'flex',
      }}>
        {H.sliceByProfile.map((s) => (
          <span key={s.profile.id} style={{
            flex: s.metrics.netWorth,
            background: profileRgb(s.profile),
          }}/>
        ))}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {H.sliceByProfile.map((s) => {
          const pUp = s.metrics.todayPL >= 0;
          return (
            <div key={s.profile.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <ProfileAvatar profile={s.profile} size={26}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700,
                                color: profileRgb(s.profile), lineHeight: 1.1 }}>
                  {s.profile.name}
                </div>
                <div style={{ fontSize: 10.5, color: 'rgb(var(--text-3) / 0.38)' }}>
                  {((s.metrics.netWorth / H.netWorth) * 100).toFixed(1)}% of household
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="tnum" style={{ fontSize: 13, fontWeight: 700 }}>
                  ${fmtCompact(s.metrics.netWorth)}
                </div>
                <div className="tnum" style={{
                  fontSize: 11, fontWeight: 600, marginTop: 1,
                  color: pUp ? 'rgb(var(--up))' : 'rgb(var(--down))',
                }}>
                  {(pUp ? '+' : '') + s.metrics.todayPct.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IOSDashboardAllProfiles({ tweaks, height = 1700 }) {
  const hide = !!tweaks.privacy;

  // Cross-profile movers — collect biggest abs%
  const movers = [];
  for (const acc of ACCOUNTS) {
    for (const h of acc.holdings) {
      const s = SYMBOLS[h.sym];
      movers.push({ sym: h.sym, account: acc, symbol: s, pct: s.pct,
                     profile: profileById(acc.profile_id) });
    }
  }
  movers.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
  const topMovers = movers.slice(0, 5);

  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* NavHeader — household indicator */}
          <div style={{ padding: '4px 16px 12px',
                        display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgb(255 255 255 / 0.06)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="grid" size={14} color="rgb(var(--text-2) / 0.62)"/>
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.62)' }}>Viewing</div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
                All profiles
              </div>
            </div>
            <span className="iconbtn"><Icon name="bell" size={14}/></span>
          </div>

          {/* Read-only banner */}
          <div style={{
            margin: '0 16px 14px', padding: '8px 12px',
            background: 'rgb(255 193 118 / 0.10)',
            border: '1px solid rgb(255 193 118 / 0.22)',
            borderRadius: 10,
            fontSize: 12, color: '#FFC176',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Icon name="eye" size={12} color="#FFC176"/>
            Read-only · switch to a profile to record trades
          </div>

          <HouseholdHero hide={hide}/>

          {/* Movers with profile attribution */}
          <div style={{ padding: '6px 20px 8px',
                        fontSize: 11.5, fontWeight: 700,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: 'rgb(var(--sec-activity))' }}>
            Top movers · across household
          </div>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topMovers.map((m) => (
              <div key={m.sym + m.account.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px',
                background: 'rgb(var(--surface-1))',
                borderRadius: 12,
                boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
              }}>
                <ProfileBadge profile={m.profile} size={20}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800 }}>{m.sym}</span>
                    <span style={{
                      fontSize: 9.5, fontWeight: 700, letterSpacing: '0.04em',
                      padding: '1px 5px', borderRadius: 3,
                      background: profileRgb(m.profile, 0.18),
                      color: profileRgb(m.profile),
                      textTransform: 'uppercase',
                    }}>{m.profile.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.62)', marginTop: 1 }}>
                    {m.symbol.name}
                  </div>
                </div>
                <Sparkline data={m.symbol.spark} up={m.symbol.up} w={72} h={24}/>
                <PercentPill pct={m.pct} size="sm"/>
              </div>
            ))}
          </div>

          {/* Accounts grouped by profile */}
          <div style={{ padding: '20px 20px 8px',
                        fontSize: 11.5, fontWeight: 700,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: 'rgb(var(--sec-portfolio))' }}>
            Accounts · by profile
          </div>
          {PROFILES.map((p) => {
            const accs = accountsForProfile(p.id);
            const c = profileRgb(p);
            return (
              <div key={p.id} style={{
                margin: '0 16px 12px',
                background: 'rgb(var(--surface-1))',
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
              }}>
                {/* Profile header */}
                <div style={{
                  padding: '12px 14px',
                  background: profileRgb(p, 0.08),
                  borderBottom: `.5px solid ${profileRgb(p, 0.18)}`,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <ProfileAvatar profile={p} size={26}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: c, lineHeight: 1.1 }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'rgb(var(--text-3) / 0.62)' }}>
                      {accs.length} {accs.length === 1 ? 'account' : 'accounts'}
                    </div>
                  </div>
                  <span className="tnum" style={{ fontSize: 14, fontWeight: 800 }}>
                    ${fmtCompact(profileMetrics(p.id).netWorth)}
                  </span>
                </div>
                {/* Accounts */}
                {accs.map((a, i) => {
                  const val = a.holdings.reduce((s, h) => s + h.qty * SYMBOLS[h.sym].price, 0);
                  return (
                    <div key={a.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '11px 14px',
                      borderBottom: i === accs.length - 1 ? 'none' : '.5px solid rgb(var(--separator-alpha))',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{a.name}</div>
                        <div style={{ fontSize: 11, color: 'rgb(var(--text-3) / 0.62)', marginTop: 1 }}>
                          {a.broker} · ••{a.last4} · {a.holdings.length} positions
                        </div>
                      </div>
                      <span className="tnum" style={{ fontSize: 13, fontWeight: 700 }}>
                        ${fmtNum(val, 0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Expose globals
// ─────────────────────────────────────────────────────────────────
Object.assign(window, {
  profileRgb,
  ProfileAvatar, ProfileTag, ProfileBadge, ProfileChipCard, HouseholdHero,
  IOSProfileSwitcherSheet, MacProfileSwitcher, MacDashboardProfileChrome,
  IOSTradeSheetProfileHeader, IOSDeleteTransactionConfirm,
  IOSSettingsProfilesList, IOSProfileEditor, IOSAddProfileSheet,
  IOSProfilePINEntry, IOSDashboardAllProfiles,
});
