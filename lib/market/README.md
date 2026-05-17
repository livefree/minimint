# lib/market/

Market-data adapters. Single boundary between the app and external quote providers.

## modules (sprint 2)

- `finnhub.ts` — real-time `quote(symbol)`, `searchSymbols(q)`, `companyProfile(symbol)`
- `yahoo.ts` — historical `priceHistory(symbol, range)`, `priceCandles(symbol, range)`, `dividends(symbol)`, `splits(symbol)`, `earnings(symbol)`
- `index.ts` — unified `getQuote`, `getHistory`, `getDividends` with built-in `quote_cache` + `prices_daily` read-through against Postgres

## rules

- These modules ONLY run on the server (Next.js Route Handlers or Server Components). Never imported into client components — the Finnhub key must never reach the browser.
- Each adapter returns the canonical `Quote` / `Price` / `Dividend` types from `DATABASE_SPEC.md §17`.
- On upstream failure: log + fall back to the next provider in order; if all fail, return cached row with `stale: true` flag.
- Rate-limit accounting lives in `lib/market/rate-limit.ts` (sprint 2); never call upstream without checking remaining quota first.
