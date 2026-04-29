import {
  CurrencyRate,
  ValueCard,
  AnalyticsSummary,
} from '../models/finance.model';

// Seeds 60 historical points so the '1Y' chart view is populated on load.
const seedHistory = (base: number, volatility: number): number[] =>
  Array.from({ length: 60 }, (_, i) => {
    const drift = Math.sin(i / 4) * volatility;
    const noise = (Math.random() - 0.5) * volatility * 0.6;
    return Math.round((base + drift + noise) * 10000) / 10000;
  });

export const INITIAL_CURRENCIES: CurrencyRate[] = [
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

export const INITIAL_CARDS: ValueCard[] = [
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

export const INITIAL_ANALYTICS: AnalyticsSummary = {
  totalIncome: 5400,
  totalExpense: 1700,
  netBalance: 3075,
  categories: [
    { name: 'Housing', amount: 539, color: '#1a73e8', percentage: 49 },
    { name: 'Food', amount: 367, color: '#a8c8f0', percentage: 34 },
    { name: 'Other', amount: 187, color: '#ffffff', percentage: 17 },
  ],
};
