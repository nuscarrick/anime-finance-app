export type Period = '1D' | '1W' | '1M' | '3M' | '1Y';

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  change: number;
  changePercent: number;
  chartData: number[];
}

export interface ValueCard {
  id: string;
  label: string;
  amount: number;
  currency: string;
  trend: 'up' | 'down';
  trendPercent: number;
}

export interface AnalyticsSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  categories: AnalyticsCategory[];
}

export interface AnalyticsCategory {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}
