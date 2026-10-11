export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number; // Negative for expense, positive for income
  category: string;
  categoryConfidence?: number;
  notes?: string;
  isCustom?: boolean;
}

export interface Investment {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  buyPrice: number;
  currentPrice: number;
  assetClass: 'Stocks' | 'ETFs' | 'Crypto' | 'Bonds' | 'Cash';
  sector: string;
  costBasis?: number;
  currentValue?: number;
  gainLoss?: number;
  gainLossPct?: number;
  weightPct?: number;
  dayChangePct?: number;
  history?: { date: string; price: number }[];
}

export interface WishlistItem {
  id: string;
  ticker: string;
  name: string;
  currentPrice: number;
  targetBuyPrice: number;
  dayChangePct?: number;
  notes?: string;
  priority: 'High' | 'Medium' | 'Low';
  assetClass: 'Stocks' | 'ETFs' | 'Crypto' | 'Bonds';
  sector: string;
  addedDate: string;
}

export interface SpendingAnomaly {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  severity: 'critical' | 'warning' | 'notice';
  reason: string;
  zScore: number;
  baselineMedian: number;
  baselineMean: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  netSavings: number;
  savingsRate: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

export interface PortfolioSummary {
  totalCostBasis: number;
  totalCurrentValue: number;
  totalUnrealizedGain: number;
  totalReturnPct: number;
  benchmarkReturnPct: number;
  alpha: number;
  outperforming: boolean;
  sharpeRatio: number;
  diversificationScore: string;
  herfindahlIndex: number;
}

export interface CashFlowSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  monthlyTrends: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdown[];
}

export interface BenchmarkItem {
  ticker: string;
  name: string;
  returnPct: number;
  ytd: number;
  price: number;
  changePct: number;
}

export interface ComparisonPoint {
  period: string;
  portfolio: number;
  sp500: number;
  nasdaq: number;
}
