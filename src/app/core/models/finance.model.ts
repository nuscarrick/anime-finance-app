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
