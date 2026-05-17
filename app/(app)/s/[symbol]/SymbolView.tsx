'use client';

/**
 * Client-side chart shell for /s/[symbol].
 *   - Renders TradingView lightweight-charts (area mode)
 *   - Range chips switch ?range=, fetch /api/history, update series
 *   - Initial 1Y bars come pre-loaded from the server component
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import { ALL_RANGES, type Range } from '@/lib/market/types';

interface Bar {
  date: string; // ISO
  close: number;
}

interface Props {
  symbol: string;
  initialBars: Bar[]; // 1Y daily by default
}

const VISIBLE_RANGES: Range[] = ['1D', '1M', '3M', '1Y', '5Y', 'ALL'];

export function SymbolView({ symbol, initialBars }: Props): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  const [range, setRange] = useState<Range>('1Y');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apply bars to the chart series (idempotent).
  const applyBars = useCallback((bars: Bar[]) => {
    const series = seriesRef.current;
    if (!series) return;
    const data = bars
      .map((b) => ({
        time: Math.floor(new Date(b.date).getTime() / 1000) as UTCTimestamp,
        value: b.close,
      }))
      .filter((d) => Number.isFinite(d.value));
    series.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, []);

  // Init the chart once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      height: 320,
      layout: {
        background: { color: 'rgb(27, 27, 35)' /* --surface-1 */ },
        textColor: 'rgba(235, 235, 245, 0.62)',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter Variable", system-ui, sans-serif',
      },
      grid: {
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: { mode: 1 }, // magnet
      autoSize: true,
    });
    const series = chart.addAreaSeries({
      lineColor: 'rgb(107, 232, 184)' /* --mint */,
      topColor: 'rgba(107, 232, 184, 0.42)',
      bottomColor: 'rgba(107, 232, 184, 0)',
      priceLineVisible: false,
      lastValueVisible: true,
    });
    chartRef.current = chart;
    seriesRef.current = series;
    applyBars(initialBars);

    const resizeObs = new ResizeObserver(() => chart.timeScale().fitContent());
    resizeObs.observe(container);

    return () => {
      resizeObs.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // initialBars only used on first mount; range changes refetch in the
    // sibling effect. eslint-plugin-react-hooks isn't installed in our flat
    // config yet (planned for M3 when we ship watchlist UX).
  }, [applyBars, initialBars]);

  // Fetch + apply on range change (skip initial 1Y; we have it)
  useEffect(() => {
    if (range === '1Y') {
      applyBars(initialBars);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/history/${encodeURIComponent(symbol)}?range=${range}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((body: { data?: { bars?: { date: string; close: number }[] } }) => {
        if (cancelled) return;
        const bars = body.data?.bars ?? [];
        applyBars(bars.map((b) => ({ date: b.date, close: b.close })));
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load history');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range, symbol, applyBars, initialBars]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="t-meta text-text-3">Price history</div>
        <div className="flex gap-1">
          {VISIBLE_RANGES.filter((r) =>
            (ALL_RANGES as readonly string[]).includes(r)
          ).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`t-meta rounded-md px-2.5 py-1 transition ${
                range === r
                  ? 'bg-mint text-bg'
                  : 'bg-surface-2 text-text-2 hover:text-text'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="relative rounded-lg bg-surface-1 hairline-top">
        <div ref={containerRef} className="h-80 w-full" />
        {loading && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="t-meta text-text-3">Loading…</div>
          </div>
        )}
        {error && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="t-aux text-down">{error}</div>
          </div>
        )}
      </div>
    </section>
  );
}
