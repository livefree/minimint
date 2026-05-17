// data.jsx — mock portfolio + market data for mini-stock
// Seeded pseudo-random walks so sparklines / charts look plausible
// and stay stable across renders.

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Build N points of a random walk ending at `endPrice`, drifting from
// `startPrice`. Returns Float numbers.
function walk({ n, startPrice, endPrice, seed = 1, vol = 0.012 }) {
  const rnd = mulberry32(seed);
  const pts = [];
  let cur = startPrice;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const target = startPrice + (endPrice - startPrice) * t;
    // Mean-revert toward the trend line + small noise
    const noise = (rnd() - 0.5) * 2 * vol * startPrice;
    cur = cur + (target - cur) * 0.18 + noise;
    pts.push(cur);
  }
  // Anchor last point exactly to endPrice for clean math
  pts[pts.length - 1] = endPrice;
  pts[0] = startPrice;
  return pts;
}

// OHLC candle series — n bars, ending at endPrice.
function candles({ n, startPrice, endPrice, seed = 1, vol = 0.015 }) {
  const closes = walk({ n, startPrice, endPrice, seed, vol });
  const rnd = mulberry32(seed * 7 + 11);
  const out = [];
  for (let i = 0; i < n; i++) {
    const c = closes[i];
    const o = i === 0 ? startPrice : closes[i - 1];
    const range = Math.max(Math.abs(c - o), c * 0.004) * (0.6 + rnd() * 1.8);
    const hi = Math.max(c, o) + rnd() * range * 0.6;
    const lo = Math.min(c, o) - rnd() * range * 0.6;
    out.push({ o, h: hi, l: lo, c });
  }
  return out;
}

// ── Universe of symbols ────────────────────────────────────────────
const SYMBOLS = {
  AAPL: { name: 'Apple Inc.',          exch: 'NASDAQ', sector: 'Tech',         price: 189.43, prevClose: 188.12 },
  MSFT: { name: 'Microsoft Corporation',exch: 'NASDAQ', sector: 'Tech',         price: 421.92, prevClose: 409.43 },
  NVDA: { name: 'NVIDIA Corporation',  exch: 'NASDAQ', sector: 'Semis',        price: 122.18, prevClose: 127.84 },
  GOOG: { name: 'Alphabet Inc.',       exch: 'NASDAQ', sector: 'Tech',         price: 173.32, prevClose: 175.02 },
  TSLA: { name: 'Tesla, Inc.',         exch: 'NASDAQ', sector: 'Auto',         price: 322.24, prevClose: 338.31 },
  AMZN: { name: 'Amazon.com, Inc.',    exch: 'NASDAQ', sector: 'Consumer',     price: 264.14, prevClose: 267.20 },
  META: { name: 'Meta Platforms',      exch: 'NASDAQ', sector: 'Tech',         price: 612.40, prevClose: 605.10 },
  AVGO: { name: 'Broadcom Inc.',       exch: 'NASDAQ', sector: 'Semis',        price: 196.79, prevClose: 197.97 },
  SPY:  { name: 'SPDR S&P 500 ETF',    exch: 'NYSE',   sector: 'ETF',          price: 580.85, prevClose: 588.13 },
  QQQ:  { name: 'Invesco QQQ Trust',   exch: 'NASDAQ', sector: 'ETF',          price: 510.30, prevClose: 518.42 },
  COST: { name: 'Costco Wholesale',    exch: 'NASDAQ', sector: 'Consumer',     price: 933.08, prevClose: 922.95 },
  AMD:  { name: 'Advanced Micro Devices', exch: 'NASDAQ', sector: 'Semis',     price: 144.12, prevClose: 148.30 },
  // R-P0: extra symbols for Mom (dividend-heavy) and Dad (balanced)
  SCHD: { name: 'Schwab US Dividend',  exch: 'NYSE',   sector: 'ETF',          price:  31.72, prevClose:  31.80 },
  VYM:  { name: 'Vanguard High Dividend', exch: 'NYSE', sector: 'ETF',         price: 138.45, prevClose: 137.92 },
  JEPI: { name: 'JPMorgan Equity Premium Income', exch: 'NYSE', sector: 'ETF', price:  59.77, prevClose:  60.01 },
  VTI:  { name: 'Vanguard Total Stock', exch: 'NYSE',  sector: 'ETF',          price: 288.40, prevClose: 291.84 },
  BND:  { name: 'Vanguard Total Bond',  exch: 'NASDAQ', sector: 'Bonds',       price:  72.15, prevClose:  72.04 },
  KO:   { name: 'Coca-Cola',           exch: 'NYSE',   sector: 'Consumer',     price:  68.92, prevClose:  68.31 },
};
Object.entries(SYMBOLS).forEach(([sym, s], i) => {
  s.symbol = sym;
  s.change = +(s.price - s.prevClose).toFixed(2);
  s.pct = +(((s.price - s.prevClose) / s.prevClose) * 100).toFixed(2);
  s.up = s.change >= 0;
  // 48-bar intraday sparkline
  s.spark = walk({
    n: 48,
    startPrice: s.prevClose,
    endPrice: s.price,
    seed: 1000 + i * 13,
    vol: 0.006,
  });
  s.prevCloseLine = s.prevClose;
});

// ── Profiles (R-P0) ───────────────────────────────────────────────
// Operator (the human running the app) is ONE; profiles are workspaces
// inside the operator's account. 3-tier hierarchy: operator → profile →
// account → holdings/transactions. Each profile owns its accounts.
const PROFILES = [
  {
    id: 'sam',
    name: 'Sam',
    display_name: 'Sam Chen',
    avatar_kind: 'initials', avatar_value: 'SC',
    color: 1,                 // 1..8 → --p-N triple
    relation: 'self',
    birth_year: 1994,
    pinned: true, sort_order: 0,
    pin_hash: null,
  },
  {
    id: 'mom',
    name: 'Mom',
    display_name: 'Li Mei · 妈妈',
    avatar_kind: 'emoji', avatar_value: '👩',
    color: 5,                 // pink
    relation: 'parent',
    birth_year: 1965,
    pinned: true, sort_order: 1,
    pin_hash: '·····',        // PIN enabled (R-P6)
  },
  {
    id: 'dad',
    name: 'Dad',
    display_name: 'Chen Wei · 父亲',
    avatar_kind: 'emoji', avatar_value: '👨',
    color: 2,                 // sky
    relation: 'parent',
    birth_year: 1962,
    pinned: true, sort_order: 2,
    pin_hash: null,
  },
];

// ── Accounts (now profile-scoped) ────────────────────────────────
const ACCOUNTS = [
  {
    id: 'fid-ind',
    profile_id: 'sam',
    broker: 'Fidelity',
    name: 'Individual',
    last4: '2645',
    holdings: [
      { sym: 'AAPL', qty: 80,  avgCost: 142.10 },
      { sym: 'MSFT', qty: 45,  avgCost: 312.40 },
      { sym: 'NVDA', qty: 60,  avgCost: 84.20  },
      { sym: 'GOOG', qty: 50,  avgCost: 132.05 },
      { sym: 'TSLA', qty: 30,  avgCost: 215.40 },
      { sym: 'AMZN', qty: 35,  avgCost: 168.00 },
      { sym: 'SPY',  qty: 40,  avgCost: 462.10 },
    ],
  },
  {
    id: 'fid-roth',
    profile_id: 'sam',
    broker: 'Fidelity',
    name: 'Roth IRA',
    last4: '1542',
    holdings: [
      { sym: 'QQQ',  qty: 32,  avgCost: 401.20 },
      { sym: 'META', qty: 18,  avgCost: 412.00 },
      { sym: 'AVGO', qty: 22,  avgCost: 155.40 },
      { sym: 'COST', qty: 8,   avgCost: 712.50 },
    ],
  },
  // Mom's account — dividend / income-focused
  {
    id: 'sch-mom',
    profile_id: 'mom',
    broker: 'Schwab',
    name: 'Individual',
    last4: '8721',
    holdings: [
      { sym: 'SCHD', qty: 320, avgCost:  28.10 },
      { sym: 'VYM',  qty: 110, avgCost: 122.50 },
      { sym: 'JEPI', qty: 240, avgCost:  55.40 },
      { sym: 'KO',   qty: 180, avgCost:  61.20 },
      { sym: 'AAPL', qty:  40, avgCost: 145.80 },
    ],
  },
  // Dad's account — balanced ETF + a couple tech anchors
  {
    id: 'vng-dad',
    profile_id: 'dad',
    broker: 'Vanguard',
    name: 'Brokerage',
    last4: '4093',
    holdings: [
      { sym: 'VTI',  qty: 220, avgCost: 248.30 },
      { sym: 'BND',  qty: 380, avgCost:  74.10 },
      { sym: 'SPY',  qty:  35, avgCost: 478.20 },
      { sym: 'MSFT', qty:  25, avgCost: 305.40 },
      { sym: 'AAPL', qty:  60, avgCost: 158.40 },
    ],
  },
];

// Helpers — profile-scoped queries
function accountsForProfile(profileId) {
  return ACCOUNTS.filter((a) => a.profile_id === profileId);
}
function profileById(id) {
  return PROFILES.find((p) => p.id === id);
}
// Aggregate metrics for one profile
function profileMetrics(profileId) {
  const accs = accountsForProfile(profileId);
  let mv = 0, today = 0, cost = 0;
  for (const a of accs) {
    for (const h of a.holdings) {
      const s = SYMBOLS[h.sym];
      mv    += h.qty * s.price;
      today += h.qty * s.change;
      cost  += h.qty * h.avgCost;
    }
  }
  return {
    netWorth: mv,
    todayPL:  today,
    todayPct: (today / (mv - today)) * 100,
    totalPL:  mv - cost,
    totalPct: ((mv - cost) / cost) * 100,
    accountCount: accs.length,
    positionCount: accs.reduce((s, a) => s + a.holdings.length, 0),
  };
}

// flat list of positions across accounts; optional profileId filter.
// Default: only the active profile (Sam). This keeps existing v1/v2
// screens reading PORTFOLIO scoped to one profile (R-P0 invariant).
function allPositions(profileId = 'sam') {
  const out = [];
  const accs = profileId === '__all__' ? ACCOUNTS : accountsForProfile(profileId);
  accs.forEach((a) => {
    a.holdings.forEach((h) => {
      const s = SYMBOLS[h.sym];
      const mv = h.qty * s.price;
      const cost = h.qty * h.avgCost;
      out.push({
        ...h,
        account: a,
        sym: h.sym,
        symbol: s,
        marketValue: mv,
        cost: cost,
        unrealized: mv - cost,
        unrealizedPct: ((mv - cost) / cost) * 100,
        todayPL: h.qty * s.change,
      });
    });
  });
  return out;
}

const POSITIONS = allPositions('sam');     // active profile = Sam
const TOTAL_MV  = POSITIONS.reduce((s, p) => s + p.marketValue, 0);
const TOTAL_COST = POSITIONS.reduce((s, p) => s + p.cost, 0);
const TODAY_PL  = POSITIONS.reduce((s, p) => s + p.todayPL, 0);
const TOTAL_PL  = TOTAL_MV - TOTAL_COST;

const PORTFOLIO = {
  netWorth: TOTAL_MV,
  todayPL: TODAY_PL,
  todayPct: (TODAY_PL / (TOTAL_MV - TODAY_PL)) * 100,
  totalPL: TOTAL_PL,
  totalPct: (TOTAL_PL / TOTAL_COST) * 100,
  positions: POSITIONS,
  ytdPL: 49567.42,
  ytdPct: 16.75,
  realizedYTD: 4220.10,
  divYTD: 1284.50,
};

// 6-month equity curve (180 points)
PORTFOLIO.history6M = walk({
  n: 180,
  startPrice: TOTAL_MV * 0.84,
  endPrice: TOTAL_MV,
  seed: 9001,
  vol: 0.006,
});
PORTFOLIO.history1Y = walk({
  n: 250,
  startPrice: TOTAL_MV * 0.74,
  endPrice: TOTAL_MV,
  seed: 7001,
  vol: 0.008,
});

// allocation by sector
const ALLOC = {};
POSITIONS.forEach((p) => {
  const sec = p.symbol.sector;
  ALLOC[sec] = (ALLOC[sec] || 0) + p.marketValue;
});
PORTFOLIO.allocation = Object.entries(ALLOC)
  .map(([sector, value]) => ({ sector, value, pct: (value / TOTAL_MV) * 100 }))
  .sort((a, b) => b.value - a.value);

// Movers — own positions sorted by abs % change
PORTFOLIO.movers = POSITIONS
  .map((p) => ({ ...p, pct: p.symbol.pct }))
  .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
  .slice(0, 6);

// Watchlist (= a curated list, mix of own + non-own)
const WATCHLIST = ['AAPL', 'MSFT', 'NVDA', 'GOOG', 'TSLA', 'AMZN', 'META', 'AVGO', 'SPY', 'QQQ', 'AMD', 'COST']
  .map((sym) => SYMBOLS[sym]);

// Recent transactions
const TRANSACTIONS = [
  { id: 1, kind: 'BUY',  sym: 'NVDA', qty: 10, price: 118.40, when: 'May 14, 09:42', account: 'Individual' },
  { id: 2, kind: 'DIV',  sym: 'AAPL', qty: 80, price: 0.25,   when: 'May 13, 16:00', account: 'Individual' },
  { id: 3, kind: 'SELL', sym: 'TSLA', qty: 5,  price: 348.10, when: 'May 12, 14:18', account: 'Individual' },
  { id: 4, kind: 'BUY',  sym: 'QQQ',  qty: 4,  price: 506.70, when: 'May 09, 10:02', account: 'Roth IRA' },
  { id: 5, kind: 'BUY',  sym: 'COST', qty: 2,  price: 911.20, when: 'May 06, 11:41', account: 'Roth IRA' },
];

// ── Household aggregate (R-P5) ──────────────────────────────────
// Cross-profile read-only view. Each profile contributes its net worth
// with attribution preserved (sliceByProfile) for the stacked bar hero.
const HOUSEHOLD = (() => {
  const sliceByProfile = PROFILES.map((p) => ({
    profile: p,
    metrics: profileMetrics(p.id),
  }));
  const netWorth = sliceByProfile.reduce((s, x) => s + x.metrics.netWorth, 0);
  const todayPL  = sliceByProfile.reduce((s, x) => s + x.metrics.todayPL,  0);
  const totalPL  = sliceByProfile.reduce((s, x) => s + x.metrics.totalPL,  0);
  return {
    netWorth,
    todayPL,
    todayPct: (todayPL / (netWorth - todayPL)) * 100,
    totalPL,
    sliceByProfile,
    history6M: walk({ n: 180, startPrice: netWorth * 0.82, endPrice: netWorth, seed: 9101, vol: 0.006 }),
  };
})();

// 1-yr daily history for charting individual symbols
function symbolHistory(sym) {
  const s = SYMBOLS[sym];
  return walk({
    n: 240,
    startPrice: s.price * 0.78,
    endPrice: s.price,
    seed: 555 + sym.charCodeAt(0),
    vol: 0.012,
  });
}
function symbolCandles(sym) {
  const s = SYMBOLS[sym];
  return candles({
    n: 64,
    startPrice: s.price * 0.92,
    endPrice: s.price,
    seed: 333 + sym.charCodeAt(0),
    vol: 0.014,
  });
}

// Dividend history (years)
const DIVIDENDS = {
  AAPL: [0.22, 0.23, 0.24, 0.24, 0.25, 0.25, 0.25, 0.26],
  MSFT: [0.62, 0.68, 0.68, 0.75, 0.75, 0.83, 0.83, 0.83],
  AVGO: [4.10, 4.10, 4.60, 4.60, 5.25, 5.25, 5.25, 5.25],
};

// "Top movers in market" strip for dashboard
const TOP_MOVERS = [
  { sym: 'NVDA', dir: -1, pct: -4.42 },
  { sym: 'TSLA', dir: -1, pct: -4.75 },
  { sym: 'MSFT', dir:  1, pct:  3.05 },
  { sym: 'AAPL', dir:  1, pct:  0.70 },
  { sym: 'META', dir:  1, pct:  1.21 },
  { sym: 'AVGO', dir: -1, pct: -0.60 },
];

// Mini-formatters
function fmtMoney(n, { sign = false, cents = true } = {}) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const s = n < 0 ? '-' : sign ? '+' : '';
  const abs = Math.abs(n);
  const opts = cents
    ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    : { maximumFractionDigits: 0 };
  return s + '$' + abs.toLocaleString('en-US', opts);
}
function fmtNum(n, dec = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtPct(n, sign = true) {
  const s = n < 0 ? '-' : sign ? '+' : '';
  return s + Math.abs(n).toFixed(2) + '%';
}
function fmtCompact(n) {
  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (Math.abs(n) >= 1e9)  return (n / 1e9 ).toFixed(2) + 'B';
  if (Math.abs(n) >= 1e6)  return (n / 1e6 ).toFixed(2) + 'M';
  return n.toFixed(0);
}

// Expose to globals so other Babel scripts can use them.
Object.assign(window, {
  SYMBOLS, ACCOUNTS, PORTFOLIO, WATCHLIST, TRANSACTIONS, DIVIDENDS, TOP_MOVERS,
  PROFILES, HOUSEHOLD, accountsForProfile, profileById, profileMetrics,
  symbolHistory, symbolCandles,
  fmtMoney, fmtNum, fmtPct, fmtCompact,
  walk, candles, mulberry32,
});
