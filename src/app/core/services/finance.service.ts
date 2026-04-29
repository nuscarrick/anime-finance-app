import { Injectable, signal, computed, effect } from '@angular/core';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CurrencyRate,
  ValueCard,
  AnalyticsSummary,
  Period,
} from '../models/finance.model';
import {
  INITIAL_CURRENCIES,
  INITIAL_CARDS,
  INITIAL_ANALYTICS,
} from '../mocks/finance.mocks';
import { TIMING } from '../constants/ui.constants';

const SLIDER_STATE_KEY = 'af_slider_state';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private _currencies = signal<CurrencyRate[]>(INITIAL_CURRENCIES);
  private _cards = signal<ValueCard[]>(INITIAL_CARDS);
  private _analytics = signal<AnalyticsSummary>(INITIAL_ANALYTICS);
  private _inputAmount = signal<number>(0);
  private _period = signal<Period>('1W');

  // Per-card slider overrides (keyed by card id). Persisted via effect().
  private _sliderValues = signal<Record<string, number>>(
    this.loadSliderState()
  );

  readonly currencies = this._currencies.asReadonly();
  readonly inputAmount = this._inputAmount.asReadonly();
  readonly period = this._period.asReadonly();
  readonly sliderValues = this._sliderValues.asReadonly();

  // Cards reflect slider overrides so sliders actually drive card amounts.
  readonly cards = computed<ValueCard[]>(() => {
    const overrides = this._sliderValues();
    return this._cards().map((c) => ({
      ...c,
      amount: overrides[c.id] ?? c.amount,
    }));
  });

  readonly totalBalance = computed(() =>
    this.cards().reduce((sum, c) => sum + c.amount, 0)
  );

  readonly portfolioTrendPct = computed(() => {
    const cards = this.cards();
    if (!cards.length) return 0;
    const avg = cards.reduce(
      (s, c) => s + (c.trend === 'up' ? c.trendPercent : -c.trendPercent),
      0
    ) / cards.length;
    return Math.round(avg * 10) / 10;
  });

  readonly analytics = this._analytics.asReadonly();

  // Period-filtered chart data (slice the history by period size).
  readonly periodChartData = computed<Record<string, number[]>>(() => {
    const p = this._period();
    const size = PERIOD_POINTS[p];
    const map: Record<string, number[]> = {};
    for (const c of this._currencies()) {
      map[c.code] = c.chartData.slice(-size);
    }
    return map;
  });

  constructor() {
    // Persist slider state whenever it changes.
    effect(() => {
      const state = this._sliderValues();
      try {
        localStorage.setItem(SLIDER_STATE_KEY, JSON.stringify(state));
      } catch {
        // ignore quota errors
      }
    });

    // Simulate real-time currency updates every 3s.
    interval(TIMING.currencyRefreshIntervalMs)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateCurrencyRates());
  }

  setInputAmount(v: number) {
    this._inputAmount.set(v);
  }

  setPeriod(p: Period) {
    this._period.set(p);
  }

  setSliderValue(cardId: string, value: number) {
    this._sliderValues.update((s) => ({ ...s, [cardId]: value }));
  }

  resetSliders() {
    this._sliderValues.set({});
  }

  private loadSliderState(): Record<string, number> {
    try {
      const raw = localStorage.getItem(SLIDER_STATE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Record<string, number>;
      // Clamp persisted values to current slider range (max was recently lowered).
      return Object.fromEntries(
        Object.entries(parsed).map(([k, v]) => [k, Math.max(100, Math.min(2000, v))])
      );
    } catch {
      return {};
    }
  }

  private updateCurrencyRates() {
    this._currencies.update((rates) =>
      rates.map((r) => {
        const delta = (Math.random() - 0.48) * 0.5;
        const newRate = Math.max(0.01, r.rate + delta);
        const change = newRate - r.rate;
        // Keep long history so period filter has enough points.
        const newChartData = [
          ...r.chartData.slice(-59),
          Math.round(newRate * 100) / 100,
        ];
        return {
          ...r,
          rate: Math.round(newRate * 10000) / 10000,
          change: Math.round(change * 10000) / 10000,
          changePercent: Math.round((change / r.rate) * 10000) / 100,
          chartData: newChartData,
        };
      })
    );
  }
}

const PERIOD_POINTS: Record<Period, number> = {
  '1D': 6,
  '1W': 10,
  '1M': 20,
  '3M': 40,
  '1Y': 60,
};
