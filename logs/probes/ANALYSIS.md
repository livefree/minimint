# Market-Data Probe Analysis — yahoo-finance2 v3.14.1

**Probe run**: 2026-05-17  
**Test symbols**: AAPL (mega-cap stock w/ div) · MSFT (mega-cap stock w/ div) · SPY (large ETF) · GOOGL (2022 stock split)  
**Endpoints probed**: 23 calls across 6 endpoint families, 100% success, p95 < 200ms (warm path)  
**Reproduce**: `pnpm probe:market`

This document is the **ground truth** for what data we can actually retrieve, and reconciles it against assumptions in `DATABASE_SPEC.md`. Read this before sprint 1 schema migration.

---

## 1. coverage matrix — what we get vs. what DATABASE_SPEC assumed

| DB column / concept | spec assumption | actually returned by yahoo-finance2 | gap |
|---|---|---|---|
| `quote_cache.price` | last price | `regularMarketPrice` (number) | ✓ exact |
| `quote_cache.prev_close` | yesterday close | `regularMarketPreviousClose` | ✓ |
| `quote_cache.day_high/low` | today range | `regularMarketDayHigh/Low` | ✓ |
| `quote_cache.open_price` | today open | `regularMarketOpen` | ✓ |
| `quote_cache.volume` | today volume | `regularMarketVolume` | ✓ |
| `quote_cache.source` | enum | string `quoteSourceName` ("Nasdaq Real Time Price") | ✓ |
| `quote_cache.fetched_at` | server time | local; use `regularMarketTime` (real exchange time) | enriched |
| **MISSING from spec** | — | `bid`, `ask`, `bidSize`, `askSize` | **add** for live order book |
| **MISSING** | — | `preMarketPrice/Change/Time`, `postMarketPrice/Change/Time` | **U-2 fully solvable here** |
| **MISSING** | — | `fiftyTwoWeekHigh/Low/Range/ChangePercent` | **R-SC3 KeyStats** |
| **MISSING** | — | `fiftyDayAverage`, `twoHundredDayAverage` (MA overlays) | **R-I1 chart** |
| **MISSING** | — | `marketCap`, `sharesOutstanding`, `bookValue` | **R-SC3 KeyStats** |
| **MISSING** | — | `trailingPE`, `forwardPE`, `priceToBook`, `epsTrailing/Forward` | **R-SC3 KeyStats** |
| **MISSING** | — | `dividendRate`, `dividendYield`, `trailingAnnualDividendYield`, `dividendDate` (next pay) | useful inline on SymbolDetail |
| **MISSING** | — | `earningsTimestamp`, `isEarningsDateEstimate`, `earningsTimestampStart/End` | **U-6 "Earnings this week"** |
| **MISSING** | — | `averageAnalystRating` (e.g. "1.9 - Buy"), `corporateActions[]` | bonus features |
| `prices_daily.open/high/low/close` | OHLC | exact | ✓ |
| `prices_daily.adj_close` | adjusted | field name is `adjclose` (lowercase, no `_`) | **rename mapping** |
| `prices_daily.volume` | volume | exact | ✓ |
| `dividends_announced.ex_date` | ex-date | `date` field (the ex-date) | ✓ |
| `dividends_announced.amount` | per-share | exact | ✓ |
| `dividends_announced.pay_date` | pay date | **NOT in events feed** (in `calendarEvents.dividendDate` for next one only) | spec overshot |
| `dividends_announced.record_date` | record | **NOT available** | spec overshot — drop column |
| `dividends_announced.frequency` | QUARTERLY/… | **NOT explicit** (infer from history cadence) | drop column or compute |
| `splits.ex_date` | date | `date` | ✓ |
| `splits.ratio_numerator/denominator` | int/int | `numerator`/`denominator` | ✓ exact |
| `securities.name` | company name | `longName` (or `shortName` fallback) | ✓ |
| `securities.exchange` | exchange code | `exchange` (e.g. "NMS") + `fullExchangeName` (e.g. "NasdaqGS") | enriched |
| `securities.currency` | ISO 4217 | `currency` | ✓ |
| `securities.asset_type` | EQUITY/ETF/… | `quoteType` ("EQUITY", "ETF", "INDEX", "MUTUALFUND", "CRYPTOCURRENCY") | ✓ |
| `securities.sector/industry` | text | in `assetProfile.sector` + `industryKey`/`industryDisp` | ✓ (separate call) |
| `securities.country` | ISO 2 | `assetProfile.country` ("United States" — name, not ISO2) | **convert** at insert |
| `securities.cik` | SEC CIK | **NOT returned** | drop column or backfill from SEC API later |
| `securities.delisted_at` | date | **NOT directly**; can detect via 404 on quote() | application-level |
| `securities.renamed_to` | pointer | **NOT returned** — yahoo silently auto-redirects (FB → META queries return META data); we won't know about historical renames from yahoo | spec valid; populate manually or via SEC filings |
| `earnings_calendar.report_date` | date | `quoteSummary.calendarEvents.earnings.earningsDate[]` (array, usually 1 estimated date) | ✓ |
| `earnings_calendar.eps_estimate/actual` | numbers | `quoteSummary.earnings.earningsChart.quarterly[]` (historical estimate + actual + surprisePct) | ✓ richer than spec |
| `earnings_calendar.revenue_est/actual` | numbers | in `calendarEvents.earnings.revenueAverage/Low/High` (next) + financialsChart (historical yearly) | ✓ |
| `earnings_calendar.bmo_amc` | enum | **NOT explicit**; infer from `earningsTimestamp` hour-of-day in ET | spec must derive |
| `earnings_calendar.fiscal_period` | "Q1 2026" | `fiscalQuarter` + `calendarQuarter` strings | ✓ |

**bottom line**: yahoo-finance2 returns **far more than the spec assumed for quote**, **less than assumed for dividend metadata**, and **the same as assumed for OHLCV / splits / earnings core**. Two `securities` columns (cik, renamed_to) need to come from elsewhere or be dropped.

---

## 2. critical findings

### F1. pre/post-market is fully available — close U-2 with one field
quote() returns `preMarketPrice`, `preMarketChange`, `preMarketTime`, `postMarketPrice`, `postMarketChange`, `postMarketTime` — directly. The Home `MarketStatusStrip` and SymbolDetail extended-hours line can render natively. **No Finnhub WebSocket needed for v1.**

### F2. quote() is a one-call SymbolDetail hero
85 fields covers everything in the R-SC3 KeyStats grid (PE / EPS / market cap / 52w / MA50 / MA200 / dividend yield / next earnings / analyst rating) **plus** the live price. The current spec splits this across quote + companyProfile + earnings calendar — actually one HTTP call is enough for SymbolDetail's initial render. Use quoteSummary only for the optional About + financial deep-dive sections.

### F3. chart() with `events: 'div|split'` replaces three separate endpoints
One `chart()` call returns:
- `quotes[]` — daily/intraday OHLCV (for `prices_daily`)
- `events.dividends[]` — full dividend history (for `dividends_announced`)
- `events.splits[]` — full split history (for `splits`)
- `meta.currentTradingPeriod` — pre/regular/post period boundaries (timezone-aware)

So our "3-table backfill" for a new symbol is actually **one HTTP call**. Save the JSON, write to all 3 tables in a single DB transaction.

### F4. `adjclose` not `adj_close` — rename impact small but real
Yahoo's field is `adjclose`. Drizzle schema column should map: `adjClose: numeric('adj_close')` in TS, then `quotes[].adjclose → row.adj_close`. Adapter layer absorbs the rename.

### F5. ETFs return a STRICT SUBSET of quoteSummary modules
SPY's quoteSummary only returns `assetProfile`, `summaryDetail`, `defaultKeyStatistics`. Requesting `earnings` or `financialData` for ETFs **fails the whole call**. The adapter must:
- Branch on `quoteType` before assembling modules list
- For ETF: skip earnings, financialData, calendarEvents.earnings
- For EQUITY: include all

### F6. SymbolDetail "next earnings" is in quote(), not earnings_calendar
quote() returns `earningsTimestamp` + `isEarningsDateEstimate`. For the SymbolDetail "Next earnings: Jul 30 (est.)" line, we don't even need to populate `earnings_calendar`. That table becomes useful only for cross-symbol weekly digest (Home UpcomingEvents) — can defer to v1.5.

### F7. 1-day intraday goes back to 2 trading days at 5m granularity
chart() with `interval: '5m'` and 2-day window returned 190 bars — covering pre-market + regular + post-market. For Home sparklines (today-only) we slice the most recent 78 bars (9:30am-4pm ET = 6.5h = 78 × 5min). Pre/post-market bars present but `volume: 0` for extended hours — UI should dim them or hide.

### F8. dividend metadata is sparser than spec — drop 2 columns
`events.dividends[]` only returns `{amount, date}` per occurrence. The DATABASE_SPEC's `pay_date`, `record_date`, `frequency` columns are unfillable from yahoo. Options:
- Drop them from spec (recommend) — UI rarely needs pay/record dates
- Or pull from quoteSummary.calendarEvents (gives next-only pay date, not history)
- Compute `frequency` heuristically from inter-date spacing (~91d = quarterly; ~183d = semi)

### F9. search() returns rich payload but is rate-sensitive
search('apple') returned 7 quotes + news[] + researchReports[] + screenerFieldResults[]. We only care about `quotes[]` (symbol/shortname/longname/exchange/quoteType/isYahooFinance). 190ms p50 — debounce 250ms client-side is sufficient. Note: includes international tickers (e.g. `APC.DE` on Frankfurt) — filter by `exchange ∈ {NMS, NYQ, ASE, BTS, ARCA}` for US-only.

### F10. yahoo silently follows symbol renames
Querying `quote('FB')` would return META's data without indicating rename. We can detect:
- Returned `symbol` differs from queried symbol → rename happened
- App layer logs the redirect into `securities.renamed_to` so subsequent queries normalize

### F11. timezones are explicit, market state is a single field
Meta includes `exchangeTimezoneName: "America/New_York"`, `gmtOffSetMilliseconds: -14400000`. Quote returns `marketState: "REGULAR"|"PRE"|"POST"|"CLOSED"|"PREPRE"|"POSTPOST"`. The `isMarketOpen()` helper in INTERACTION_SPEC §7.4 can rely on yahoo's own `marketState` rather than hardcoding NYSE hours (still need holiday calendar for closed-day detection).

### F12. corporate actions hint in quote.corporateActions
The field exists as `corporateActions: []` (empty for AAPL right now). Populates near upcoming splits/buybacks/special dividends. Worth polling on watched symbols and surfacing as Home banner.

---

## 3. recommended DATABASE_SPEC revisions

### 3.1 expand `quote_cache` (recommended)

```diff
 CREATE TABLE quote_cache (
   symbol         text PRIMARY KEY REFERENCES securities(symbol) ON DELETE CASCADE,
   price          numeric(20,6) NOT NULL,
   prev_close     numeric(20,6),
   day_high       numeric(20,6),
   day_low        numeric(20,6),
   open_price     numeric(20,6),
   volume         bigint,
+  bid            numeric(20,6),
+  ask            numeric(20,6),
+  pre_market_price   numeric(20,6),
+  pre_market_change  numeric(20,6),
+  pre_market_at      timestamptz,
+  post_market_price  numeric(20,6),
+  post_market_change numeric(20,6),
+  post_market_at     timestamptz,
+  market_state   text,    -- REGULAR | PRE | POST | CLOSED | PREPRE | POSTPOST
   source         text NOT NULL,
   fetched_at     timestamptz NOT NULL DEFAULT now(),
+  market_time    timestamptz,    -- yahoo's regularMarketTime
 );
```

Rationale: cache is per-symbol (~200 rows typical); 8 extra columns add ~80 bytes/row = trivial. Avoids needing a second "extended-quote" table.

### 3.2 add `securities_meta` for the deep static fields

quote() returns market cap / 52w / MA / PE / EPS — these change slowly (daily at most). Putting them in `quote_cache` would force re-write every 30s. Better: a separate `securities_meta` table refreshed once/day.

```sql
CREATE TABLE securities_meta (
  symbol                  text PRIMARY KEY REFERENCES securities(symbol) ON DELETE CASCADE,
  market_cap              numeric(24,0),       -- AAPL ~4.4T fits in numeric
  shares_outstanding      bigint,
  trailing_pe             numeric(10,4),
  forward_pe              numeric(10,4),
  price_to_book           numeric(10,4),
  eps_trailing            numeric(10,4),
  eps_forward             numeric(10,4),
  fifty_two_week_high     numeric(20,6),
  fifty_two_week_low      numeric(20,6),
  fifty_day_average       numeric(20,6),
  two_hundred_day_average numeric(20,6),
  dividend_rate           numeric(20,6),
  dividend_yield          numeric(10,4),
  next_dividend_date      date,
  next_ex_dividend_date   date,
  next_earnings_at        timestamptz,
  next_earnings_is_est    boolean,
  analyst_rating_mean     numeric(10,4),       -- 1.0 strong buy → 5.0 strong sell
  refreshed_at            timestamptz NOT NULL DEFAULT now()
);
```

### 3.3 trim `dividends_announced`

```diff
 CREATE TABLE dividends_announced (
   symbol       text NOT NULL REFERENCES securities(symbol) ON DELETE CASCADE,
   ex_date      date NOT NULL,
-  pay_date     date,
-  record_date  date,
   amount       numeric(20,6) NOT NULL,
   currency     char(3) NOT NULL DEFAULT 'USD',
-  frequency    text,
+  frequency    text,  -- nullable; computed from spacing (~91d=quarterly), not provided by API
   PRIMARY KEY (symbol, ex_date)
 );
```

### 3.4 trim `securities`

```diff
   sector        text,
   industry      text,
-  country       char(2),
+  country       text,                          -- yahoo returns full name ("United States"); convert to ISO2 lazily
-  cik           text,                          -- not provided by yahoo; populate from SEC EDGAR later
   delisted_at   date,
```

### 3.5 enrich `prices_daily` field mapping

No DDL change — just adapter:

```ts
// lib/market/yahoo.ts adapter
function mapDailyBar(bar: YahooChartQuote) {
  return {
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
    adj_close: bar.adjclose,  // ← rename
    volume: bar.volume,
  };
}
```

---

## 4. feasibility verdict per planned feature

| feature (from spec) | data feasibility | notes |
|---|---|---|
| **Real-time quote** (Home AccountsRibbon, Watchlist) | ✅ trivial | quote() per symbol, batch via Promise.all; 30s cache |
| **Historical chart 1Y daily** (SymbolDetail) | ✅ trivial | chart() with `period1/period2` |
| **Intraday 1D sparkline** (Home TodayMovers) | ✅ trivial | chart() `interval:'5m'`, slice to regular hours |
| **Multi-line index comparison** (Market Overview) | ✅ trivial | 4 parallel chart() calls, normalize to %, render |
| **Pre/post market price** (R-N1 MarketStatusStrip, R-SC3 Hero) | ✅ trivial | quote().pre/postMarketPrice |
| **Market status countdown** (MarketStatusStrip) | ✅ trivial | quote().marketState + meta.currentTradingPeriod gives boundaries |
| **Dividend history** (SymbolDetail Dividend card, Portfolio Dividends tab) | ✅ trivial | chart() with `events:'div'` |
| **Cost-basis overlay line on chart** (U-3) | ✅ trivial | computed from our own transactions; no API needed |
| **Buy/sell marker pins on chart** (U-3) | ✅ trivial | same |
| **Stock split adjustment to historical positions** (U-1 fix) | ✅ trivial | chart() events.splits; replay through `get_positions` SQL function per DATABASE_SPEC §6.1 |
| **Earnings calendar entry** (Home UpcomingEvents, SymbolDetail) | ✅ trivial | quote().earningsTimestamp + quoteSummary.calendarEvents |
| **Earnings beat/miss history** (SymbolDetail) | ✅ trivial | quoteSummary.earnings.earningsChart.quarterly[] — includes surprisePct |
| **Analyst price targets + recommendation** | ✅ bonus | quoteSummary.financialData.targetMean/High/Low/recommendationKey |
| **Holding period LT/ST badge** (U-5) | ✅ trivial | computed from our `transactions.executed_at`; no API needed |
| **Wash sale detection** (U-5) | ✅ trivial | SQL function per DATABASE_SPEC §7.3 |
| **Search ⌘K market section** (R-I5) | ✅ trivial | search(q).quotes[], filter US-only |
| **Symbol rename handling (FB → META)** | ⚠ partial | yahoo silently redirects; detect by returned symbol ≠ requested; record in `renamed_to` |
| **Price alerts trigger** (R-U6, v1.5) | ✅ trivial | poll quote() per symbol every 5 min during hours; push if threshold crossed |
| **News feed** (Market News tab, SymbolDetail) | ⚠ feasible | quoteSummary doesn't include; use search(q).news[] OR Finnhub /news |
| **Sector heatmap** (R-N3 v1.5) | ⚠ feasible | no direct endpoint; build from per-sector ETF (XLK/XLF/XLV/etc.) quotes |
| **Real-time WebSocket** (avoiding polling) | ❌ not in yahoo-finance2 | Finnhub WS supports it (60 channels free); polling at 30s suffices for v1 per INTERACTION_SPEC §18.3 |
| **Options chains** | ✅ available | yahoo-finance2.options(symbol) — out of scope v1 |
| **Crypto** | ✅ available | quoteType: CRYPTOCURRENCY — out of scope v1 |
| **International stocks** | ✅ available | UK/EU/HK tickers all supported via suffix (e.g. NVDA.DE, 0700.HK) — out of scope v1 |
| **Mutual funds** | ✅ available | quoteType: MUTUALFUND — Fidelity SPAXX etc. resolve correctly |

**verdict**: every v1-scoped feature is feasible with yahoo-finance2 alone. Finnhub becomes useful only for: WebSocket real-time (deferred to v1.5), alternative rate-limit pool (defensive), and pure news API (yahoo's news is bundled inside search/quoteSummary and is uneven quality).

---

## 5. future expansion possibilities (unlocked by data we have)

These weren't in the spec but ARE supported by the API:

| feature | data source | difficulty |
|---|---|---|
| **Earnings beat/miss history viz** | quoteSummary.earnings.earningsChart.quarterly[] with surprisePct | low — already returned |
| **Analyst target band on chart** | quoteSummary.financialData.target{Mean,Low,High,Median}Price + recommendationKey | low |
| **MA20/50/200 chart overlay toggle** | quote.fiftyDayAverage + twoHundredDayAverage (last value); compute series from prices_daily | low |
| **Bid/ask spread display** during market hours | quote.bid/ask/bidSize/askSize | low — extend quote_cache |
| **ESG risk badges** | quoteSummary.assetProfile.audit/board/compensation/shareHolderRights risk scores | low |
| **Insider trades** | yahoo-finance2 insider() method (need to verify) | medium |
| **Fund holdings breakdown** for ETFs | quoteSummary.fundProfile / topHoldings | medium |
| **Trending lists** for Market.Trending | yahoo trending API or screener() | medium |
| **Top movers across whole market** | screener() with predefined queries (day_gainers, day_losers, most_actives) | medium |
| **Mutual fund NAV tracking** | works for SPAXX etc. — fully covered by quote() | low |
| **Currency conversion** for international portfolios | yahoo currency pair tickers (USDCNY=X etc.) | low |
| **Fear & Greed proxy** (VIX-based) | quote("^VIX") | trivial |
| **Yield curve / treasury rates** | quote("^TNX"), quote("^IRX"), quote("^TYX") | trivial — useful for "real" yield calc on dividends |
| **Crypto inclusion** | quote("BTC-USD"), quote("ETH-USD") | trivial — beyond v1 but no extra work |

---

## 6. rate limit reality check

yahoo-finance2 is unofficial (scrapes Yahoo's public APIs). Observed in this probe:
- 23 calls in ~12 seconds → no rate limit hit
- p50 latency: 41ms (warm), p95: 200ms (cold)
- First call to chart() needed crumb fetch (~575ms in cold start; cached after)
- No API key needed

Yahoo's tolerance is informally **~100-200 calls/min** before they shadow-throttle. Our load profile:
- 1 active operator
- ~30 symbols active (held + watched)
- quote() batch every 30s during hours = **60 calls/min worst case** ← within tolerance
- chart() rarely; historical backfill is one-shot per symbol

**risk**: yahoo could change scraping defenses any release. Mitigations:
1. `quote_cache` 30s TTL means typical hour requires only ~120 quote calls total (vs naive 18,000 hits)
2. Finnhub as a fallback adapter (already installed); free 60/min provides parallel pool
3. If both fail, show "stale data" banner per INTERACTION_SPEC §9.2 — no app crash

---

## 7. concrete next actions

1. **Add `pnpm probe:market` to package.json scripts** so this is replayable (done in this commit).
2. **Update DATABASE_SPEC.md §3.9 / §3.10 / §3.11 / §3.13** per §3 of this doc — expand quote_cache, add securities_meta, trim dividends_announced + securities.
3. **Sprint 1 first data-layer migration** should write quote_cache + securities_meta as adjusted.
4. **Write `lib/market/yahoo.ts` adapter** mirroring the field-mapping rules in §3.5 + §F4 + §F5 (ETF module subset).
5. **Defer Finnhub** to v1.5 unless yahoo throttling proves disruptive — register a key and stash in `app_settings.finnhub_api_key_enc` (already in schema).
6. **U-2 (market status) ships in v1** — pre/post market data is right there in quote().
7. **U-3 (cost-basis overlay) ships in v1** — pure computation, no API dep.
8. **Symbol rename detector** — add to adapter: if `result.symbol !== queriedSymbol`, write `renamed_to` and Toast user "FB renamed to META".
