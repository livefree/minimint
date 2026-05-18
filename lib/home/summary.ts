/**
 * Home tab summary — aggregates positions by symbol, fetches live
 * quotes in parallel, returns hero stats + per-symbol rows.
 *
 * Skips `get_net_worth` SQL (DATABASE_SPEC §6.3) for M2 because that
 * function depends on a fresh `quote_cache` and we don't yet run any
 * cache-keeper schedule. Direct upstream fetch keeps Home numbers
 * accurate without a hidden staleness window. M3 can re-evaluate
 * once TanStack QueryClient + a per-batch quote endpoint land.
 *
 * Cash balance is intentionally omitted. The TradeSheet currently
 * only writes BUY/SELL — CASH_IN/OUT/DIV/FEE entry UI lands later;
 * surfacing a "$0" cash row before then is misleading.
 *
 * Quote failures are isolated per symbol via Promise.allSettled — a
 * single 429 / 5xx doesn't blank the whole table. Failed rows render
 * a "—" placeholder downstream.
 */

import Decimal from 'decimal.js';
import { getQuote, type Quote } from '@/lib/market';
import { getPositions, type Position } from '@/lib/portfolio/positions';
import { db as defaultDb, type DB } from '@/db/client';

export interface SymbolSummary {
  symbol: string;
  /** total quantity held across all accounts of the profile */
  totalQty: Decimal;
  /** weighted avg cost across accounts */
  avgCost: Decimal;
  /** Σ qty × avg cost (exact) */
  totalCost: Decimal;
  /** null when quote fetch failed for this symbol */
  currentPrice: Decimal | null;
  marketValue: Decimal | null;
  todayPl: Decimal | null;
  todayPct: Decimal | null;
  unrealizedPl: Decimal | null;
  /** null when quote prevClose missing (extended-hours quotes can omit) */
  prevClose: Decimal | null;
  /** Resolved upstream display name when the quote came back; else null. */
  name: string | null;
}

export interface HomeSummary {
  totalMarketValue: Decimal;
  totalCost: Decimal;
  totalUnrealizedPl: Decimal;
  todayPl: Decimal;
  /** Σ todayPl / (totalMarketValue − todayPl). null when denominator is 0. */
  todayPct: Decimal | null;
  /** Per-symbol row, sorted by marketValue DESC then symbol ASC. Failed-
   *  quote rows are kept (with null fields) and sorted last. */
  bySymbol: SymbolSummary[];
  /** Symbols whose live quote fetch failed; surface as a banner if any. */
  failedSymbols: string[];
}

interface SymbolAccumulator {
  symbol: string;
  totalQty: Decimal;
  totalCost: Decimal;
}

export interface GetHomeSummaryOptions {
  /** Inject a quote fetcher for tests; defaults to the live yahoo adapter. */
  fetchQuote?: (symbol: string) => Promise<Quote>;
}

export async function getHomeSummary(
  profileId: string,
  opts: GetHomeSummaryOptions = {},
  database: DB = defaultDb,
): Promise<HomeSummary> {
  const positions = await getPositions(profileId, { status: 'open' }, database);

  // Roll up by symbol (collapsing per-account rows).
  const bySymbolMap = new Map<string, SymbolAccumulator>();
  for (const p of positions) {
    const acc = bySymbolMap.get(p.symbol) ?? {
      symbol: p.symbol,
      totalQty: new Decimal(0),
      totalCost: new Decimal(0),
    };
    acc.totalQty = acc.totalQty.plus(p.quantity);
    acc.totalCost = acc.totalCost.plus(positionCost(p));
    bySymbolMap.set(p.symbol, acc);
  }

  const fetchQuote = opts.fetchQuote ?? getQuote;
  const symbols = Array.from(bySymbolMap.keys());

  // Parallel quote fetch — Promise.allSettled so one failure doesn't
  // poison the whole table.
  const settled = await Promise.allSettled(symbols.map((s) => fetchQuote(s)));
  const quoteBySymbol = new Map<string, Quote>();
  const failedSymbols: string[] = [];
  settled.forEach((r, i) => {
    const sym = symbols[i]!;
    if (r.status === 'fulfilled') quoteBySymbol.set(sym, r.value);
    else failedSymbols.push(sym);
  });

  // Compose per-symbol rows + roll totals.
  let totalMarketValue = new Decimal(0);
  let totalCost = new Decimal(0);
  let todayPl = new Decimal(0);
  let priorMarketValue = new Decimal(0);

  const bySymbol: SymbolSummary[] = [];
  for (const acc of bySymbolMap.values()) {
    const quote = quoteBySymbol.get(acc.symbol);
    const avgCost = acc.totalQty.isZero() ? new Decimal(0) : acc.totalCost.dividedBy(acc.totalQty);

    if (!quote) {
      bySymbol.push({
        symbol: acc.symbol,
        totalQty: acc.totalQty,
        avgCost,
        totalCost: acc.totalCost,
        currentPrice: null,
        marketValue: null,
        todayPl: null,
        todayPct: null,
        unrealizedPl: null,
        prevClose: null,
        name: null,
      });
      totalCost = totalCost.plus(acc.totalCost);
      continue;
    }

    const price = new Decimal(quote.price);
    const prev = quote.prevClose === null ? null : new Decimal(quote.prevClose);
    const mv = acc.totalQty.times(price);
    const rowUnrealized = mv.minus(acc.totalCost);
    const rowTodayPl = prev !== null ? acc.totalQty.times(price.minus(prev)) : null;
    const rowTodayPct = prev !== null && !prev.isZero() ? price.minus(prev).dividedBy(prev) : null;

    totalMarketValue = totalMarketValue.plus(mv);
    totalCost = totalCost.plus(acc.totalCost);
    if (rowTodayPl) {
      todayPl = todayPl.plus(rowTodayPl);
      // priorMarketValue = Σ qty × prev_close for portfolio-wide today %.
      priorMarketValue = priorMarketValue.plus(acc.totalQty.times(prev!));
    }

    bySymbol.push({
      symbol: acc.symbol,
      totalQty: acc.totalQty,
      avgCost,
      totalCost: acc.totalCost,
      currentPrice: price,
      marketValue: mv,
      todayPl: rowTodayPl,
      todayPct: rowTodayPct,
      unrealizedPl: rowUnrealized,
      prevClose: prev,
      name: quote.name ?? null,
    });
  }

  // Sort: rows with marketValue (descending), then alphabetical for
  // failed-quote rows. `.toNumber()` here is comparator-only — not
  // arithmetic — so contract #6 is not violated. JS sort is stable
  // so ties keep insertion order.
  bySymbol.sort((a, b) => {
    if (a.marketValue && b.marketValue) return b.marketValue.minus(a.marketValue).toNumber();
    if (a.marketValue && !b.marketValue) return -1;
    if (!a.marketValue && b.marketValue) return 1;
    return a.symbol.localeCompare(b.symbol);
  });

  const totalUnrealizedPl = totalMarketValue.minus(totalCost);
  // todayPct denominator is Σ qty × prev only over symbols whose quote
  // succeeded — failed rows are silently excluded from both numerator
  // (no todayPl) and denominator (no priorMarketValue contribution).
  // The percent therefore stays correct over the *known* portion; the
  // banner above the table tells the operator which symbols are missing.
  // BACKLOG ❓ tracks the M3 fix (banner copy + total-% caveat string).
  const todayPct = priorMarketValue.isZero() ? null : todayPl.dividedBy(priorMarketValue);

  return {
    totalMarketValue,
    totalCost,
    totalUnrealizedPl,
    todayPl,
    todayPct,
    bySymbol,
    failedSymbols,
  };
}

function positionCost(p: Position): Decimal {
  // Prefer the SQL-computed totalCost (already rounded to scale 4);
  // fall back to qty × avgCost if it ever returns 0 due to a SPLIT
  // sequence.
  return p.totalCost.isZero() ? p.quantity.times(p.avgCost) : p.totalCost;
}
