import { Injectable, signal, computed, effect } from '@angular/core';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CurrencyRate,
  ValueCard,
  AnalyticsSummary,
  Period,
} from '../models/finance.model';

const SLIDER_STATE_KEY = 'af_slider_state';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private _currencies = signal<CurrencyRate[]>(INITIAL_CURRENCIES);
  private _cards = signal<ValueCard[]>(INITIAL_CARDS);
  private _analytics = signal<AnalyticsSummary>(INITIAL_ANALYTICS);
  private _inputAmount = signal<number>(1200);
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
    interval(3000)
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
        Object.entries(parsed).map(([k, v]) => [k, Math.max(0, Math.min(2000, v))])
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

// Seed with 60 historical points so '1Y' view is populated from the start.
const seedHistory = (base: number, volatility: number): number[] =>
  Array.from({ length: 60 }, (_, i) => {
    const drift = Math.sin(i / 4) * volatility;
    const noise = (Math.random() - 0.5) * volatility * 0.6;
    return Math.round((base + drift + noise) * 10000) / 10000;
  });

const INITIAL_CURRENCIES: CurrencyRate[] = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    rate: 1.0,
    change: 0.0023,
    changePercent: 0.23,
    chartData: seedHistory(1.0, 0.02),
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    rate: 0.9215,
    change: -0.0012,
    changePercent: -0.13,
    chartData: seedHistory(0.92, 0.015),
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    rate: 0.7891,
    change: 0.0031,
    changePercent: 0.39,
    chartData: seedHistory(0.79, 0.02),
  },
];

const INITIAL_CARDS: ValueCard[] = [
  {
    id: 'card-1',
    label: 'Total Balance',
    amount: 1600,
    currency: 'USD',
    trend: 'up',
    trendPercent: 4.2,
  },
  {
    id: 'card-2',
    label: 'Savings',
    amount: 1800,
    currency: 'USD',
    trend: 'up',
    trendPercent: 2.8,
  },
];

const INITIAL_ANALYTICS: AnalyticsSummary = {
  totalIncome: 5400,
  totalExpense: 1700,
  netBalance: 3700,
  categories: [
    { name: 'Housing', amount: 800, color: '#6c63ff', percentage: 47 },
    { name: 'Food', amount: 350, color: '#ff6584', percentage: 21 },
    { name: 'Transport', amount: 280, color: '#43e97b', percentage: 16 },
    { name: 'Other', amount: 270, color: '#f9a825', percentage: 16 },
  ],
};
