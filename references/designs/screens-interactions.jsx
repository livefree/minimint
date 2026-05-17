// screens-interactions.jsx — R-I1 (chart crosshair) + R-I2 (Trade field
// states + numpad) + remaining R-S1 state overlays.

// ─────────────────────────────────────────────────────────────────
// CROSSHAIR overlay (R-I1) — static representation of the live scrub.
// Renders on top of an SVG chart inside a relatively-positioned wrapper.
// ─────────────────────────────────────────────────────────────────
function ChartCrosshair({ x, y, width, price, changePct, timestamp, up }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
    }}>
      {/* Vertical guide */}
      <span style={{
        position: 'absolute', left: x, top: 0, bottom: 0,
        width: 1, background: 'rgb(255 255 255 / 0.22)',
      }}/>
      {/* Snap dot */}
      <span style={{
        position: 'absolute',
        left: x - 5, top: y - 5,
        width: 10, height: 10, borderRadius: '50%',
        background: up ? 'rgb(var(--up))' : 'rgb(var(--down))',
        boxShadow: '0 0 0 3px rgb(var(--surface-1))',
      }}/>
      {/* Top floating timestamp pill */}
      <span style={{
        position: 'absolute',
        left: x,
        top: -6,
        transform: 'translateX(-50%) translateY(-100%)',
        padding: '4px 9px',
        background: 'rgb(var(--surface-2))',
        borderRadius: 6,
        fontSize: 10.5,
        fontWeight: 600,
        color: 'rgb(var(--text))',
        whiteSpace: 'nowrap',
        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.06), 0 4px 12px rgb(0 0 0 / 0.4)',
      }}>{timestamp}</span>
      {/* Right floating price pill */}
      <span style={{
        position: 'absolute',
        right: -6,
        top: y - 14,
        padding: '5px 9px',
        background: 'rgb(var(--surface-2))',
        borderRadius: 6,
        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.06), 0 4px 12px rgb(0 0 0 / 0.4)',
        fontSize: 11, fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        color: up ? 'rgb(var(--up))' : 'rgb(var(--down))',
      }}>${price.toFixed(2)} · {(up ? '+' : '') + changePct.toFixed(2)}%</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS SYMBOL SCRUB — crosshair active at 60% chart width (R-I1)
// ─────────────────────────────────────────────────────────────────
function IOSSymbolScrub({ tweaks, sym = 'MSFT', height = 1080 }) {
  const s = SYMBOLS[sym];
  const hist = symbolHistory(sym);
  const hide = !!tweaks.privacy;

  // crosshair point: 60% along the chart
  const chartW = 358, chartH = 188;
  const crossX = chartW * 0.62;
  // compute the y for the data point at this x
  const dataIdx = Math.floor((crossX / chartW) * (hist.length - 1));
  const priceAtX = hist[dataIdx];
  const min = Math.min(...hist), max = Math.max(...hist);
  const crossY = 12 + (1 - (priceAtX - min) / (max - min)) * (chartH - 30);
  const changePct = ((priceAtX - hist[0]) / hist[0]) * 100;

  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* Top bar */}
          <div style={{ padding: '4px 16px 8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="iconbtn"><Icon name="x" size={14}/></span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{sym}</div>
              <div className="tnum" style={{ fontSize: 11.5, color: 'rgb(var(--text-2) / 0.62)' }}>
                Scrubbing · tap to lock
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="iconbtn"><Icon name="star" size={14}/></span>
              <span className="iconbtn"><Icon name="more" size={14}/></span>
            </div>
          </div>

          {/* Hero — price shown at crosshair position */}
          <div style={{ padding: '12px 20px 4px',
                        display: 'flex', alignItems: 'center', gap: 14 }}>
            <SymbolLogo sym={sym} size={44}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.62)' }}>
                Mar 14 · 11:42 AM ET
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 2 }}>
                <PriceText value={priceAtX} hidden={hide}
                           style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.024em' }}/>
                <PercentPill pct={changePct} size="sm"/>
              </div>
            </div>
          </div>

          {/* Range chips */}
          <div style={{ padding: '8px 12px 4px' }}>
            <RangeChips active="3M" sizes={['1D','1W','1M','3M','6M','YTD','1Y','5Y']} compact/>
          </div>

          {/* Chart + crosshair overlay */}
          <div style={{ padding: '6px 16px 6px', position: 'relative' }}>
            <div style={{ position: 'relative', width: chartW, height: chartH,
                          margin: '0 auto' }}>
              <AreaChart data={hist} up={s.up} w={chartW} h={chartH} gridY={4}
                         mode="area" showPriceTicks={false}
                         pad={{ l: 0, r: 32, t: 12, b: 18 }}/>
              {/* Dimmed Y-axis ticks (showPriceTicks already off; the
                  R-I1 spec says dim to 50% while scrubbing — for the static
                  artboard, simply leave them off). */}
              <ChartCrosshair
                x={crossX} y={crossY} width={chartW}
                price={priceAtX} changePct={changePct}
                timestamp="Mar 14 · 11:42 AM"
                up={changePct >= 0}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          fontSize: 10.5, color: 'rgb(var(--text-3) / 0.38)',
                          padding: '4px 4px 0' }}>
              <span>Feb</span><span>Mar</span><span>Apr</span><span>May</span>
            </div>
          </div>

          {/* "Tap to lock" hint */}
          <div style={{ padding: '14px 16px 8px',
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'rgb(var(--surface-1))',
                        margin: '12px 16px 16px',
                        borderRadius: 12,
                        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)' }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgb(var(--mint) / 0.16)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="chart" size={13} color="rgb(var(--mint))"/>
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                Live scrub
              </div>
              <div style={{ fontSize: 11.5, color: 'rgb(var(--text-2) / 0.62)', marginTop: 1 }}>
                Drag horizontally · 8px gate · haptic on data-point snap
              </div>
            </div>
          </div>

          {/* Stat grid (preserved while scrubbing) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                        padding: '0 16px 12px', gap: 6 }}>
            {[
              ['At point', '$' + priceAtX.toFixed(2)],
              ['Open',     fmtNum(s.prevClose)],
              ['Volume',   '38.4M'],
              ['Range',    `${(min).toFixed(0)}–${(max).toFixed(0)}`],
            ].map(([k,v]) => (
              <div key={k} style={{
                background: 'rgb(var(--surface-1))', borderRadius: 10,
                padding: '8px 10px',
                boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
              }}>
                <div style={{ fontSize: 10, color: 'rgb(var(--text-3) / 0.38)',
                              fontWeight: 600, letterSpacing: 0.04, textTransform: 'uppercase' }}>{k}</div>
                <div className="tnum" style={{ fontSize: 13, fontWeight: 700, marginTop: 1 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAC SYMBOL HOVER — same idea, mac scale (R-I1)
// ─────────────────────────────────────────────────────────────────
function MacSymbolHover({ tweaks, sym = 'MSFT' }) {
  const s = SYMBOLS[sym];
  const hist = symbolHistory(sym);
  const hide = !!tweaks.privacy;
  const chartW = 920, chartH = 360;
  const crossX = chartW * 0.58;
  const dataIdx = Math.floor((crossX / chartW) * (hist.length - 1));
  const priceAtX = hist[dataIdx];
  const min = Math.min(...hist), max = Math.max(...hist);
  const crossY = 16 + (1 - (priceAtX - min) / (max - min)) * (chartH - 36);
  const changePct = ((priceAtX - hist[0]) / hist[0]) * 100;

  return (
    <div className="mac">
      <MacTitleBar/>
      <MacSidebarV2 active="port"/>
      <main className="mac-main">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <SymbolLogo sym={sym} size={48}/>
            <div>
              <div className="h-eyebrow" style={{ marginBottom: 4 }}>
                {s.name} · {s.exch}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <PriceText value={priceAtX} hidden={hide}
                           style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.024em' }}/>
                <PercentPill pct={changePct} size="sm"/>
                <span style={{ fontSize: 12.5, color: 'rgb(var(--text-3) / 0.62)' }}>
                  Hovered · Mar 14, 2026 · 11:42 AM ET
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="iconbtn"><Icon name="star" size={14}/></span>
            <span style={{
              padding: '8px 16px', background: 'rgb(var(--mint))',
              color: '#07120D', borderRadius: 8,
              fontSize: 13.5, fontWeight: 700,
            }}>Trade</span>
          </div>
        </div>

        {/* Chart with crosshair */}
        <div style={{
          background: 'rgb(var(--surface-1))',
          borderRadius: 16,
          padding: 24,
          boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <RangeChips active="3M" sizes={['1D','1W','1M','3M','6M','YTD','1Y','5Y','ALL']} compact/>
            <div style={{ fontSize: 11.5, color: 'rgb(var(--text-3) / 0.62)',
                            display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Icon name="mic" size={11} color="rgb(var(--text-3) / 0.62)"/>
              Cursor pin · ESC to release
            </div>
          </div>
          <div style={{ position: 'relative', width: chartW, height: chartH, margin: '0 auto' }}>
            <AreaChart data={hist} up={s.up} w={chartW} h={chartH} gridY={4}
                       mode="area" showPriceTicks={true}
                       pad={{ l: 0, r: 60, t: 16, b: 22 }}/>
            <ChartCrosshair
              x={crossX} y={crossY} width={chartW}
              price={priceAtX} changePct={changePct}
              timestamp="Mar 14, 2026 · 11:42 AM"
              up={changePct >= 0}/>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TRADE FIELD with explicit visual states (R-I2)
// ─────────────────────────────────────────────────────────────────
function FieldV2({ label, value, big = false, state = 'default', error, help }) {
  const isFocus = state === 'focus';
  const isError = state === 'error';
  const isReadonly = state === 'readonly';
  const ring = isError
    ? '1.5px solid rgb(var(--down))'
    : isFocus
    ? '1.5px solid rgb(var(--mint))'
    : 'none';
  const labelColor = isError
    ? 'rgb(var(--down))'
    : isFocus
    ? 'rgb(var(--mint))'
    : 'rgb(var(--text-3) / 0.62)';
  return (
    <div style={{ opacity: isReadonly ? 0.7 : 1 }}>
      <div style={{
        background: 'rgb(var(--surface-1))',
        borderRadius: 12,
        padding: big ? '10px 14px 12px' : '8px 14px',
        outline: ring, outlineOffset: -1.5,
        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: 0.06,
            color: labelColor,
          }}>{label}</div>
          {isFocus && (
            <Icon name="edit" size={11} color="rgb(var(--mint))"/>
          )}
          {isError && (
            <span style={{
              fontSize: 9.5, fontWeight: 700,
              padding: '1px 5px', borderRadius: 3,
              background: 'rgb(var(--down) / 0.2)',
              color: 'rgb(var(--down))',
              letterSpacing: 0.04,
              textTransform: 'uppercase',
            }}>Error</span>
          )}
        </div>
        <div className={big ? 'tnum' : ''} style={{
          fontSize: big ? 22 : 15,
          fontWeight: big ? 700 : 500,
          marginTop: big ? 2 : 1,
          color: isReadonly ? 'rgb(var(--text-2) / 0.62)' : 'rgb(var(--text))',
        }}>{value || <span style={{ color: 'rgb(var(--text-3) / 0.38)' }}>—</span>}</div>
      </div>
      {error && (
        <div style={{
          padding: '6px 14px 0',
          fontSize: 11.5, fontWeight: 500,
          color: 'rgb(var(--down))',
        }}>{error}</div>
      )}
      {help && !error && (
        <div style={{
          padding: '6px 14px 0',
          fontSize: 11.5, color: 'rgb(var(--text-3) / 0.62)',
        }}>{help}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS TRADE NUMPAD — Quantity focused + numeric keypad (R-I2)
// ─────────────────────────────────────────────────────────────────
function IOSTradeNumpad({ tweaks, height = 940 }) {
  const hide = !!tweaks.privacy;
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* Top sheet header (trade) */}
          <div style={{ padding: '8px 16px 6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, color: 'rgb(var(--mint))', fontWeight: 600 }}>Cancel</span>
            <span style={{ fontSize: 17, fontWeight: 700 }}>New Trade · NVDA</span>
            <span style={{ fontSize: 15, color: 'rgb(var(--mint))', fontWeight: 600 }}>Save</span>
          </div>

          {/* Symbol micro */}
          <div style={{ padding: '6px 18px 12px',
                        display: 'flex', alignItems: 'center', gap: 10 }}>
            <SymbolLogo sym="NVDA" size={34}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>NVDA</div>
              <div style={{ fontSize: 11, color: 'rgb(var(--text-2) / 0.62)' }}>
                $122.18 · NVIDIA Corporation
              </div>
            </div>
            <PercentPill pct={-4.42} size="sm"/>
          </div>

          {/* Fields */}
          <div style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <FieldV2 label="Account" value="Fidelity · Individual" state="default"/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FieldV2 label="Quantity" value="25" big state="focus"/>
              <FieldV2 label="Price" value="$120.50" big state="default"/>
            </div>
            <FieldV2 label="Date" value="May 15, 2026" state="readonly" help="As of last trading day"/>
          </div>

          {/* Estimated total */}
          <div style={{ margin: '0 16px 14px', padding: '12px 16px',
                        borderRadius: 14, background: 'rgb(var(--surface-2))',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'rgb(var(--text-2) / 0.62)' }}>Estimated total</span>
            <PriceText value={25 * 120.50} prefix="$" decimals={2} hidden={hide}
                       style={{ fontSize: 20, fontWeight: 800 }}/>
          </div>

          {/* Numpad bar */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            background: 'rgb(28 28 32 / 0.96)',
            backdropFilter: 'blur(28px) saturate(180%)',
            padding: '8px 6px 28px',
            borderTop: '.5px solid rgb(255 255 255 / 0.08)',
          }}>
            {/* "Done" bar above numpad */}
            <div style={{
              padding: '6px 14px 8px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 12, color: 'rgb(var(--text-3) / 0.62)',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'rgb(var(--mint))',
                }}/>
                Quantity · max 8 sh available
              </span>
              <span style={{
                padding: '4px 12px',
                background: 'rgb(var(--mint) / 0.18)',
                color: 'rgb(var(--mint))',
                borderRadius: 7,
                fontSize: 12, fontWeight: 700,
              }}>Done</span>
            </div>
            {/* Numeric keypad */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6,
              padding: '0 6px',
            }}>
              {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map((k) => (
                <div key={k} style={{
                  background: 'rgb(255 255 255 / 0.08)',
                  borderRadius: 5,
                  fontSize: 24, fontWeight: 500,
                  height: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontVariantNumeric: 'tabular-nums',
                  color: 'rgb(var(--text))',
                }}>{k}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// IOS TRADE ERROR — fields with validation errors (R-I2)
// ─────────────────────────────────────────────────────────────────
function IOSTradeError({ tweaks, height = 844 }) {
  const hide = !!tweaks.privacy;
  return (
    <div className="ios" style={{ height }}>
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          <div style={{ padding: '8px 16px 6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, color: 'rgb(var(--mint))', fontWeight: 600 }}>Cancel</span>
            <span style={{ fontSize: 17, fontWeight: 700 }}>New Trade · NVDA</span>
            <span style={{ fontSize: 15, color: 'rgb(var(--text-3) / 0.38)', fontWeight: 600 }}>Save</span>
          </div>

          {/* Banner */}
          <div style={{
            margin: '10px 16px 14px', padding: '10px 14px',
            background: 'rgb(var(--down) / 0.10)',
            border: '1px solid rgb(var(--down) / 0.3)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 12, color: 'rgb(var(--down))',
          }}>
            <Icon name="bell" size={13} color="rgb(var(--down))"/>
            <span style={{ flex: 1, fontWeight: 600 }}>
              2 fields need attention before this trade can be saved.
            </span>
          </div>

          <div style={{ padding: '0 18px 12px',
                        display: 'flex', alignItems: 'center', gap: 10 }}>
            <SymbolLogo sym="NVDA" size={36}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>NVDA</div>
              <div style={{ fontSize: 11.5, color: 'rgb(var(--text-2) / 0.62)' }}>
                $122.18 · NVIDIA Corporation
              </div>
            </div>
            <PercentPill pct={-4.42} size="sm"/>
          </div>

          {/* Segmented */}
          <div style={{ padding: '0 16px 12px' }}>
            <div style={{
              display: 'flex', background: 'rgb(var(--surface-2))',
              borderRadius: 10, padding: 2,
            }}>
              {['Buy','Sell','Dividend','Split'].map((k, i) => (
                <span key={k} style={{
                  flex: 1, textAlign: 'center', padding: '7px 0',
                  borderRadius: 8,
                  fontSize: 13, fontWeight: 600,
                  background: i === 1 ? 'rgb(var(--mint))' : 'transparent',
                  color: i === 1 ? '#07120D' : 'rgb(var(--text-2) / 0.62)',
                }}>{k}</span>
              ))}
            </div>
          </div>

          {/* Field stack with errors */}
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FieldV2 label="Account" value="Fidelity · Individual" state="default"/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FieldV2 label="Quantity" value="25" big state="error"
                       error="Exceeds available 8 sh in Fidelity · Individual"/>
              <FieldV2 label="Price" value="$0.00" big state="error"
                       error="Price must be > 0"/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FieldV2 label="Date" value="May 15, 2026" state="default"/>
              <FieldV2 label="Fees" value="$0.00" state="default" help="Optional"/>
            </div>
          </div>

          {/* Disabled CTA */}
          <div style={{ position: 'absolute', left: 16, right: 16, bottom: 24 }}>
            <div style={{
              background: 'rgb(var(--surface-2))',
              color: 'rgb(var(--text-3) / 0.62)',
              textAlign: 'center', padding: '14px 0',
              borderRadius: 14, fontSize: 15, fontWeight: 700,
              border: '1px dashed rgb(var(--down) / 0.4)',
            }}>
              Fix 2 errors to save
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// REMAINING R-S1 STATE OVERLAYS
// ─────────────────────────────────────────────────────────────────

function StateScaffold({ icon, iconColor, title, body, cta, accent, ctaIcon }) {
  return (
    <div className="ios">
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* NavHeader */}
          <div style={{ padding: '4px 16px 12px', display: 'flex',
                        alignItems: 'center', gap: 12 }}>
            <ProfileAvatar profile={profileById('sam')} size={28}/>
            <div style={{ flex: 1, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {title}
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
              background: `rgb(${iconColor} / 0.08)`,
              border: `1px solid rgb(${iconColor} / 0.18)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={icon} size={36} color={`rgb(${iconColor})`}/>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{body.title}</div>
              <div style={{ fontSize: 13, color: 'rgb(var(--text-2) / 0.62)',
                            marginTop: 6, lineHeight: 1.5 }}>
                {body.copy}
              </div>
            </div>
            <div style={{
              padding: '12px 22px',
              background: `rgb(${accent || 'var(--mint)'})`, color: '#07120D',
              borderRadius: 999,
              fontSize: 14, fontWeight: 800, letterSpacing: 0.01,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: `0 6px 18px rgb(${accent || 'var(--mint)'} / 0.32)`,
            }}>
              <Icon name={ctaIcon || 'plus'} size={14} color="#07120D" strokeWidth={2.5}/>
              {cta}
            </div>
          </div>
        </div>
        <IOSTabBarV2 active="home"/>
      </div>
    </div>
  );
}

function IOSStateEmptyAccounts() {
  return (
    <StateScaffold
      icon="wallet"
      iconColor="var(--sec-portfolio)"
      title="Portfolio"
      body={{
        title: 'Add your first account',
        copy: 'Link a brokerage by CSV import, or enter a trade manually to start building your portfolio.',
      }}
      cta="Add account"/>
  );
}

function IOSStateEmptyTrades() {
  return (
    <StateScaffold
      icon="calendar"
      iconColor="var(--sec-activity)"
      title="Activity"
      body={{
        title: 'No transactions recorded',
        copy: 'Every buy, sell, dividend & split lands here. Record one now or import from a CSV.',
      }}
      cta="Record trade"
      accent="var(--sec-activity)"
      ctaIcon="plus"/>
  );
}

function IOSStateLoadingChart({ sym = 'MSFT' }) {
  const s = SYMBOLS[sym];
  return (
    <div className="ios">
      <div className="ios-screen">
        <IOSStatusBar/>
        <style>{`
          @keyframes shimmer2 { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
          .shimmer-bg {
            background: linear-gradient(110deg, rgb(var(--surface-1)) 30%, rgb(var(--surface-2)) 50%, rgb(var(--surface-1)) 70%);
            background-size: 200% 100%;
            animation: shimmer2 1.4s linear infinite;
          }
        `}</style>
        <div className="ios-body">
          {/* Top bar */}
          <div style={{ padding: '4px 16px 8px',
                        display: 'flex', justifyContent: 'space-between' }}>
            <span className="iconbtn"><Icon name="chevron-l" size={14}/></span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="iconbtn"><Icon name="star" size={14}/></span>
              <span className="iconbtn"><Icon name="more" size={14}/></span>
            </div>
          </div>

          {/* Static price (still cached) */}
          <div style={{ padding: '4px 20px 4px',
                        display: 'flex', alignItems: 'center', gap: 14 }}>
            <SymbolLogo sym={sym} size={44}/>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{sym}</div>
              <div style={{ fontSize: 12.5, color: 'rgb(var(--text-2) / 0.62)' }}>{s.name}</div>
            </div>
          </div>
          <div style={{ padding: '8px 20px 4px' }}>
            <PriceText value={s.price} style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.025em' }}/>
            <span style={{ marginLeft: 10, fontSize: 13, color: 'rgb(var(--text-3) / 0.62)' }}>
              Last close
            </span>
          </div>

          {/* 2px progress strip above chart (R-S1 stale background) */}
          <div style={{ margin: '20px 16px 0', position: 'relative',
                        height: 4, borderRadius: 2, overflow: 'hidden',
                        background: 'rgb(var(--mint) / 0.10)' }}>
            <div className="shimmer-bg" style={{ width: '60%', height: '100%',
                                                   borderRadius: 2 }}/>
          </div>
          <div style={{ padding: '6px 20px 0', fontSize: 11.5,
                        color: 'rgb(var(--mint))', fontWeight: 600 }}>
            Fetching 3M history…
          </div>

          {/* Chart skeleton */}
          <div style={{ padding: '14px 16px 8px' }}>
            <div className="shimmer-bg" style={{
              width: '100%', height: 188, borderRadius: 12,
            }}/>
          </div>

          {/* Stat grid — real data, fades through */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                        padding: '6px 16px 8px', gap: 6, opacity: 0.85 }}>
            {[['Open',fmtNum(s.prevClose)],['High',fmtNum(s.price*1.01)],
              ['Low',fmtNum(s.price*0.98)],['Vol','50M']].map(([k,v]) => (
              <div key={k} style={{
                background: 'rgb(var(--surface-1))', borderRadius: 10,
                padding: '8px 9px',
                boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
              }}>
                <div style={{ fontSize: 10, color: 'rgb(var(--text-3) / 0.38)',
                              fontWeight: 600, letterSpacing: 0.04, textTransform: 'uppercase' }}>{k}</div>
                <div className="tnum" style={{ fontSize: 13, fontWeight: 700, marginTop: 1 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IOSStateOffline() {
  return (
    <div className="ios">
      <div className="ios-screen">
        <IOSStatusBar/>
        <div className="ios-body">
          {/* Offline banner */}
          <div style={{
            padding: '10px 18px',
            background: 'rgb(255 193 118 / 0.14)',
            borderBottom: '1px solid rgb(255 193 118 / 0.3)',
            color: '#FFC176',
            fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{
              width: 14, height: 14, borderRadius: '50%',
              background: 'rgb(255 193 118 / 0.22)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFC176' }}/>
            </span>
            <span style={{ flex: 1 }}>
              You're offline · showing cached data
            </span>
            <span style={{ textDecoration: 'underline' }}>Retry</span>
          </div>

          {/* NavHeader */}
          <div style={{ padding: '12px 16px 12px',
                        display: 'flex', alignItems: 'center', gap: 12 }}>
            <ProfileAvatar profile={profileById('sam')} size={28}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'rgb(var(--text-3) / 0.62)' }}>Good evening, Sam</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>Home</div>
            </div>
          </div>

          {/* Hero — dimmed */}
          <div style={{ margin: '0 16px 14px', padding: '16px 18px',
                        borderRadius: 20, background: 'rgb(var(--surface-1))',
                        boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.045)',
                        opacity: 0.7 }}>
            <div style={{ fontSize: 11, fontWeight: 700,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          color: 'rgb(var(--text-3) / 0.38)' }}>
              Net Worth · cached
            </div>
            <div className="tnum" style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>
              ${fmtNum(PORTFOLIO.netWorth, 2)}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: 'rgb(var(--text-3) / 0.62)' }}>
              As of Tue, May 14 · 16:00 ET · 2 days old
            </div>
          </div>

          {/* Position list — cached, no live quotes */}
          <div style={{ padding: '6px 20px 0', fontSize: 11.5,
                        color: 'rgb(var(--text-3) / 0.62)', fontWeight: 600,
                        letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Cached positions · Sam
          </div>
          <div style={{ padding: '4px 20px' }}>
            {POSITIONS.slice(0, 4).map((p, i, arr) => (
              <UniRow key={p.sym} s={p.symbol} mode="position"
                      position={p} hidden={false} showAccountDot
                      last={i === arr.length - 1}/>
            ))}
          </div>

          {/* Tip */}
          <div style={{ margin: '24px 16px', padding: '14px 16px',
                        background: 'rgb(255 193 118 / 0.06)',
                        border: '1px solid rgb(255 193 118 / 0.22)',
                        borderRadius: 12, fontSize: 12.5,
                        color: 'rgb(var(--text-2) / 0.62)', lineHeight: 1.4 }}>
            <div style={{ fontWeight: 700, color: '#FFC176', marginBottom: 4 }}>
              No network
            </div>
            We'll keep retrying every 30s. All local data is intact — only
            live quotes &amp; news are paused.
          </div>
        </div>
        <IOSTabBarV2 active="home"/>
      </div>
    </div>
  );
}

Object.assign(window, {
  ChartCrosshair, FieldV2, StateScaffold,
  IOSSymbolScrub, MacSymbolHover,
  IOSTradeNumpad, IOSTradeError,
  IOSStateEmptyAccounts, IOSStateEmptyTrades,
  IOSStateLoadingChart, IOSStateOffline,
});
