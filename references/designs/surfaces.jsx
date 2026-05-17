// surfaces.jsx — unified interaction surfaces for mini-stock
// Popovers (context menus), sheets, settings — designed once so every
// screen shares the same buttons / dividers / chevrons / destructive
// styling. Plus the iOS surface artboards.

// ─────────────────────────────────────────────────────────────────
// Icons that didn't fit in components.jsx
// ─────────────────────────────────────────────────────────────────
function SunriseIcon({ size = 12, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 11h12" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M4.5 11A3.5 3.5 0 018 7.5a3.5 3.5 0 013.5 3.5" stroke={color} strokeWidth="1.4" fill={color} fillOpacity="0.55"/>
      <path d="M8 3v1.6M3.6 5l1 1M12.4 5l-1 1" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function Overnight({ pct }) {
  const up = pct >= 0;
  return (
    <span className={'overnight ' + (up ? 'up' : 'down')}>
      <span className="sun">
        <SunriseIcon size={10} color="#F2B45C"/>
      </span>
      {(up ? '+' : '') + pct.toFixed(2) + '%'}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Popover — context menu primitive
// ─────────────────────────────────────────────────────────────────
function Popover({ children, width = 264, style = {} }) {
  return (
    <div className="menu-pop" style={{ width, ...style }}>
      {children}
    </div>
  );
}

function MenuRow({ icon, label, sub, trail, destructive, checked, submenu }) {
  const cls = 'menu-row' + (destructive ? ' destructive' : '') + (checked ? ' checked' : '');
  return (
    <div className={cls}>
      {checked ? (
        <span className="lead-icon check"><Icon name="check" size={16}/></span>
      ) : icon ? (
        <span className="lead-icon"><Icon name={icon} size={16}/></span>
      ) : <span className="lead-icon"/>}
      <div className="label" style={{ display: 'flex', flexDirection: 'column' }}>
        <span>{label}</span>
        {sub && <span className="sub">{sub}</span>}
      </div>
      {submenu && <span className="trail-icon"><Icon name="chevron-r" size={13}/></span>}
      {trail && !submenu && <span className="trail-icon">{trail}</span>}
    </div>
  );
}

function MenuSeparator() { return <div className="menu-sep"/>; }

// ─────────────────────────────────────────────────────────────────
// Surface artboard chrome — phone-shaped, dim'd backdrop, popover overlay
// ─────────────────────────────────────────────────────────────────
function PhoneCanvas({ children, dim = true }) {
  return (
    <div className="ios" style={{ position: 'relative' }}>
      {children}
      {dim && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.32)',
          pointerEvents: 'none',
        }}/>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// iOS — Apple-style Watchlist (`···`) context menu
// ─────────────────────────────────────────────────────────────────
function IOSContextMenu({ tweaks }) {
  return (
    <div className="ios" style={{ position: 'relative' }}>
      {/* Backdrop = Watchlist screen, dim'd */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <IOSWatchlist tweaks={tweaks}/>
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(2px)',
        pointerEvents: 'none',
      }}/>

      {/* The `···` button highlighted on top right */}
      <div style={{
        position: 'absolute', top: 70, right: 19,
        width: 34, height: 34, borderRadius: 17,
        background: 'rgba(255,255,255,0.18)',
        boxShadow: '0 0 0 2px rgba(255,255,255,0.06)',
      }}/>

      {/* Popover dropped from top-right */}
      <div style={{ position: 'absolute', top: 110, right: 16 }}>
        <Popover width={272}>
          <MenuRow icon="edit"  label="Edit Watchlist"/>
          <MenuRow icon="plus"  label="New Watchlist"/>
          <MenuSeparator/>
          <MenuRow icon="arrow-ud" label="Sort Watchlist By" sub="Manual" submenu/>
          <MenuRow icon="chart"    label="Watchlist Shows"   sub="Percentage Change" submenu/>
          <MenuSeparator/>
          <MenuRow icon="bell"  label="Notification Settings"/>
          <MenuRow icon="tag"   label="Provide Stocks Feedback"/>
          <MenuSeparator/>
          <MenuRow icon="trash" label="Clear Recommendations Data" destructive/>
        </Popover>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// iOS — Yahoo-style portfolio menu (the "·" inside a broker card)
// ─────────────────────────────────────────────────────────────────
function IOSPortfolioMenu({ tweaks }) {
  return (
    <div className="ios" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <IOSAccount tweaks={tweaks}/>
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(2px)',
        pointerEvents: 'none',
      }}/>

      <div style={{ position: 'absolute', top: 180, left: '50%', transform: 'translateX(-50%)' }}>
        <Popover width={310}>
          <MenuRow icon="arrow-ud" label="Sort list by"
                   sub="Ticker"
                   trail={<Icon name="arrow-ud" size={14}/>}
                   submenu/>
          <MenuSeparator/>
          <MenuRow icon="x" label="Unlink broker" destructive/>
          <MenuSeparator/>
          <MenuRow icon="chart" label="Display data" sub="Price change" submenu/>
          <MenuSeparator/>
          <MenuRow icon="edit" label="Manage portfolios & watchlists"/>
          <MenuRow icon="plus" label="Create new"/>
          <MenuSeparator/>
          <MenuRow icon="briefcase" label="Link broker"/>
        </Popover>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// iOS — Sort sheet (Apple-style submenu with checkmarks)
// ─────────────────────────────────────────────────────────────────
function IOSSortSheet({ tweaks }) {
  const options = ['Manual','Price Change','Percentage Change','Market Cap','Symbol','Name'];
  return (
    <div className="ios" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <IOSWatchlist tweaks={tweaks}/>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }}/>

      {/* The parent popover is faded behind */}
      <div style={{ position: 'absolute', top: 110, right: 16, opacity: 0.42 }}>
        <Popover width={272}>
          <MenuRow icon="edit" label="Edit Watchlist"/>
          <MenuRow icon="plus" label="New Watchlist"/>
        </Popover>
      </div>

      {/* The active submenu */}
      <div style={{ position: 'absolute', top: 196, left: 20, right: 20 }}>
        <Popover width={undefined} style={{ width: 'auto' }}>
          <MenuRow icon="arrow-ud" label="Sort Watchlist By" sub="Manual"
                   trail={<Icon name="chevron-d" size={13}/>}/>
          <MenuSeparator/>
          {options.map((o) => (
            <MenuRow key={o} label={o} checked={(tweaks.sortMode || 'Manual') === o}/>
          ))}
        </Popover>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// iOS — Settings sheet
// ─────────────────────────────────────────────────────────────────
function IOSSettings({ tweaks }) {
  return (
    <div className="ios">
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body" style={{ overflow: 'hidden' }}>
          {/* Sheet header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '4px 16px 14px',
          }}>
            <span className="iconbtn"><Icon name="chevron-l" size={16}/></span>
            <span style={{ fontSize: 17, fontWeight: 700 }}>Settings</span>
            <span style={{ fontSize: 15, color: 'rgb(var(--mint))', fontWeight: 600 }}>Done</span>
          </div>

          {/* Profile card */}
          <div style={{ padding: '4px 16px 14px' }}>
            <div style={{
              background: 'rgb(var(--surface-1))',
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 26,
                background: 'linear-gradient(135deg, rgb(var(--mint)), rgb(var(--mint-2)))',
                color: '#07120D',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800,
              }}>S</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Sam Chen</div>
                <div style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.38)' }}>sam@example.com · Free plan</div>
              </div>
              <Icon name="chevron-r" size={14} color="rgb(var(--text-3) / 0.38)"/>
            </div>
          </div>

          <SectionLabel>Appearance</SectionLabel>
          <div style={{ padding: '0 16px 18px' }}>
            <div className="form-card">
              <div className="form-row">
                <span className="form-label">Theme</span>
                <span className="form-value">System</span>
                <Icon name="chevron-r" size={13} color="rgb(var(--text-3) / 0.38)"/>
              </div>
              <div className="form-row">
                <span className="form-label">Accent</span>
                <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ width: 18, height: 18, borderRadius: 9, background: 'rgb(var(--mint))', boxShadow: '0 0 0 2px rgb(var(--bg)), 0 0 0 3.5px rgb(var(--mint))' }}/>
                  <span style={{ width: 18, height: 18, borderRadius: 9, background: '#5AA9FF' }}/>
                  <span style={{ width: 18, height: 18, borderRadius: 9, background: '#F2B45C' }}/>
                  <span style={{ width: 18, height: 18, borderRadius: 9, background: '#B98CFF' }}/>
                </span>
              </div>
              <div className="form-row">
                <span className="form-label">Compact rows</span>
                <span className="ios-switch"/>
              </div>
            </div>
          </div>

          <SectionLabel>Privacy</SectionLabel>
          <div style={{ padding: '0 16px 18px' }}>
            <div className="form-card">
              <div className="form-row">
                <span className="form-label">Privacy mode by default</span>
                <span className={'ios-switch ' + (tweaks.privacy ? 'on' : '')}/>
              </div>
              <div className="form-row">
                <span className="form-label">Require Face ID</span>
                <span className="ios-switch on"/>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: 'rgb(var(--text-3) / 0.38)', padding: '8px 4px 0', lineHeight: 1.4 }}>
              When on, amounts are masked with •••• until you tap to reveal. Face ID is required to view trades and edit positions.
            </div>
          </div>

          <SectionLabel>Data</SectionLabel>
          <div style={{ padding: '0 16px 18px' }}>
            <div className="form-card">
              <div className="form-row">
                <span className="form-label">Quote refresh</span>
                <span className="form-value">30s</span>
                <Icon name="chevron-r" size={13} color="rgb(var(--text-3) / 0.38)"/>
              </div>
              <div className="form-row">
                <span className="form-label">Export transactions</span>
                <Icon name="chevron-r" size={13} color="rgb(var(--text-3) / 0.38)"/>
              </div>
              <div className="form-row" style={{ color: 'rgb(var(--down))' }}>
                <span className="form-label" style={{ color: 'rgb(var(--down))' }}>Clear all local data</span>
              </div>
            </div>
          </div>
        </div>
        <IOSTabBar active="me"/>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      padding: '4px 24px 6px',
      fontSize: 11, fontWeight: 600,
      letterSpacing: 0.08, textTransform: 'uppercase',
      color: 'rgb(var(--text-3) / 0.38)',
    }}>{children}</div>
  );
}

Object.assign(window, {
  Popover, MenuRow, MenuSeparator,
  SunriseIcon, Overnight,
  IOSContextMenu, IOSPortfolioMenu, IOSSortSheet, IOSSettings,
  SectionLabel,
});
