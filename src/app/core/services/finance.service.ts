import { Injectable, signal, computed } from '@angular/core';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyRate, ValueCard, AnalyticsSummary } from '../models/finance.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private _currencies = signal<CurrencyRate[]>(INITIAL_CURRENCIES);
  private _cards = signal<ValueCard[]>(INITIAL_CARDS);
  private _analytics = signal<AnalyticsSummary>(INITIAL_ANALYTICS);
  private _sliderValue = signal<number>(65);
  private _inputAmount = signal<number>(1200);

  readonly currencies = this._currencies.asReadonly();
  readonly cards = this._cards.asReadonly();
  readonly analytics = this._analytics.asReadonly();
  readonly sliderValue = this._sliderValue.asReadonly();
  readonly inputAmount = this._inputAmount.asReadonly();

  readonly totalBalance = computed(() =>
    this._cards().reduce((sum, c) => sum + c.amount, 0)
  );

  constructor() {
    // Simulate real-time currency updates every 3s
    interval(3000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateCurrencyRates());
  }

  setSliderValue(v: number) {
    this._sliderValue.set(v);
  }

  setInputAmount(v: number) {
    this._inputAmount.set(v);
  }

  private updateCurrencyRates() {
    this._currencies.update((rates) =>
      rates.map((r) => {
        const delta = (Math.random() - 0.48) * 0.5;
        const newRate = Math.max(0.01, r.rate + delta);
        const change = newRate - r.rate;
        const newChartData = [...r.chartData.slice(1), Math.round(newRate * 100) / 100];
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

const INITIAL_CURRENCIES: CurrencyRate[] = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    rate: 1.0,
    change: 0.0023,
    changePercent: 0.23,
    chartData: [1.0, 1.001, 0.999, 1.002, 1.001, 1.003, 1.002, 1.004, 1.003, 1.005],
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    rate: 0.9215,
    change: -0.0012,
    changePercent: -0.13,
    chartData: [0.92, 0.921, 0.919, 0.922, 0.92, 0.921, 0.922, 0.921, 0.923, 0.9215],
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    rate: 0.7891,
    change: 0.0031,
    changePercent: 0.39,
    chartData: [0.785, 0.786, 0.787, 0.786, 0.788, 0.787, 0.789, 0.788, 0.79, 0.7891],
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
    amount: 2100,
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
