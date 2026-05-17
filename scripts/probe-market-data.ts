#!/usr/bin/env tsx
/**
 * Market-data probe — calls yahoo-finance2 (and optionally Finnhub) against
 * real US symbols and dumps full JSON shapes to logs/probes/.
 *
 * Run: pnpm probe:market
 *
 * Purpose: validate that the data we'd cache in `quote_cache`,
 * `prices_daily`, `dividends_announced`, `splits`, `earnings_calendar`,
 * `securities` (per DATABASE_SPEC) is actually retrievable and the shape
 * matches our schema assumptions. Discrepancies are reported at the end
 * and warrant spec updates.
 */

import YahooFinance from 'yahoo-finance2';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const yahooFinance = new YahooFinance();

const OUT_DIR = resolve('logs/probes');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const TS = new Date().toISOString().replace(/[:.]/g, '-');
const SYMBOLS = ['AAPL', 'MSFT', 'SPY', 'GOOGL'] as const;

type Result = { ok: boolean; bytes?: number; sample?: unknown; error?: string; ms: number };
const results: Record<string, Record<string, Result>> = {};

async function probe<T>(
  symbol: string,
  endpoint: string,
  fn: () => Promise<T>
): Promise<T | undefined> {
  const t0 = Date.now();
  results[symbol] ??= {};
  try {
    const data = await fn();
    const ms = Date.now() - t0;
    const json = JSON.stringify(data, null, 2);
    writeFileSync(resolve(OUT_DIR, `${TS}-${symbol}-${endpoint}.json`), json);
    results[symbol][endpoint] = { ok: true, bytes: json.length, sample: data, ms };
    console.log(`  ✓ ${symbol.padEnd(6)} ${endpoint.padEnd(20)} ${ms}ms ${json.length}B`);
    return data;
  } catch (e) {
    const ms = Date.now() - t0;
    const msg = e instanceof Error ? e.message : String(e);
    results[symbol][endpoint] = { ok: false, error: msg, ms };
    console.log(`  ✗ ${symbol.padEnd(6)} ${endpoint.padEnd(20)} ${ms}ms FAILED: ${msg.slice(0, 80)}`);
    return undefined;
  }
}

async function main() {
  console.log(`probe target dir: ${OUT_DIR}`);
  console.log('');

  for (const symbol of SYMBOLS) {
    console.log(`── ${symbol} ──`);

    // 1. quote() — for quote_cache
    await probe(symbol, 'quote', () => yahooFinance.quote(symbol));

    // 2. chart() 1Y daily — for prices_daily backfill
    await probe(symbol, 'chart-1y-1d', () =>
      yahooFinance.chart(symbol, {
        period1: new Date(Date.now() - 365 * 24 * 3600 * 1000),
        period2: new Date(),
        interval: '1d',
      })
    );

    // 3. chart() 1D intraday 5m — for Home sparkline
    await probe(symbol, 'chart-1d-5m', () =>
      yahooFinance.chart(symbol, {
        period1: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        period2: new Date(),
        interval: '5m',
      })
    );

    // 4. chart() with dividends + splits events — historical corporate actions
    await probe(symbol, 'chart-5y-events', () =>
      yahooFinance.chart(symbol, {
        period1: new Date(Date.now() - 5 * 365 * 24 * 3600 * 1000),
        period2: new Date(),
        interval: '1d',
        events: 'div|split',
      })
    );

    // 5. quoteSummary — for securities, earnings, fundamentals
    await probe(symbol, 'quoteSummary', () =>
      yahooFinance.quoteSummary(symbol, {
        modules: [
          'assetProfile',
          'summaryDetail',
          'defaultKeyStatistics',
          'financialData',
          'calendarEvents',
          'earnings',
        ],
      })
    );
  }

  console.log('');
  console.log('── search() — symbol catalog ──');
  for (const q of ['apple', 'nvidia', 'vanguard']) {
    await probe('SEARCH', `search-${q}`, () => yahooFinance.search(q));
  }

  // Write summary
  const summary = {
    ts: TS,
    symbols: SYMBOLS,
    results,
  };
  const summaryPath = resolve(OUT_DIR, `${TS}-_summary.json`);
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log('');
  console.log(`summary: ${summaryPath}`);

  const total = Object.values(results).flatMap((r) => Object.values(r));
  const passed = total.filter((r) => r.ok).length;
  console.log(`\nresult: ${passed}/${total.length} probes ok`);
  process.exit(passed === total.length ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
