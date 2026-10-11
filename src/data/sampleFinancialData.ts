import { Transaction, Investment, BenchmarkItem } from '../types/finance';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tx-001', date: '2026-10-01', description: 'Tech Corp Direct Deposit Payroll', amount: 4850.00, category: 'Income & Salary', categoryConfidence: 0.98 },
  { id: 'tx-002', date: '2026-10-02', description: 'Apex Residential Rent Payment', amount: -1950.00, category: 'Housing & Utilities', categoryConfidence: 0.95 },
  { id: 'tx-003', date: '2026-10-03', description: 'Metro Transit Subway Pass', amount: -32.50, category: 'Transportation', categoryConfidence: 0.95 },
  { id: 'tx-004', date: '2026-10-04', description: 'Chevron Station Fuel Fillup', amount: -48.20, category: 'Transportation', categoryConfidence: 0.92 },
  { id: 'tx-005', date: '2026-10-05', description: 'Precision Auto Transmission & Brake Repair', amount: -845.00, category: 'Transportation', categoryConfidence: 0.88 }, // Anomaly: 17.5x Transportation median ($48.20)
  { id: 'tx-006', date: '2026-10-06', description: 'Sweetgreen Organic Lunch', amount: -18.75, category: 'Food & Dining', categoryConfidence: 0.94 },
  { id: 'tx-007', date: '2026-10-07', description: 'Chipotle Mexican Grill', amount: -19.50, category: 'Food & Dining', categoryConfidence: 0.93 },
  { id: 'tx-008', date: '2026-10-08', description: 'Blue Bottle Coffee Roasters', amount: -42.50, category: 'Food & Dining', categoryConfidence: 0.90 },
  { id: 'tx-009', date: '2026-10-08', description: 'Blue Bottle Coffee Roasters', amount: -42.50, category: 'Food & Dining', categoryConfidence: 0.90 },  // Anomaly: Velocity duplicate charge on same date
  { id: 'tx-010', date: '2026-10-09', description: 'Nobu Restaurant & Omakase Dinner', amount: -540.00, category: 'Food & Dining', categoryConfidence: 0.96 }  // Anomaly: 12.7x Food & Dining median ($42.50)
];

export const INITIAL_INVESTMENTS: Investment[] = [
  {
    id: 'inv-001',
    ticker: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    shares: 45,
    buyPrice: 440.00,
    currentPrice: 524.80,
    assetClass: 'ETFs',
    sector: 'Broad Market',
    dayChangePct: 0.65
  },
  {
    id: 'inv-002',
    ticker: 'QQQ',
    name: 'Invesco QQQ Trust (Nasdaq 100)',
    shares: 32,
    buyPrice: 395.00,
    currentPrice: 492.10,
    assetClass: 'ETFs',
    sector: 'Technology',
    dayChangePct: 0.84
  },
  {
    id: 'inv-003',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    shares: 40,
    buyPrice: 185.00,
    currentPrice: 232.50,
    assetClass: 'Stocks',
    sector: 'Consumer Tech',
    dayChangePct: 0.78
  },
  {
    id: 'inv-004',
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    shares: 65,
    buyPrice: 88.50,
    currentPrice: 138.25,
    assetClass: 'Stocks',
    sector: 'Semiconductors',
    dayChangePct: 2.14
  },
  {
    id: 'inv-005',
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    shares: 25,
    buyPrice: 375.00,
    currentPrice: 428.15,
    assetClass: 'Stocks',
    sector: 'Software & Cloud',
    dayChangePct: -0.28
  },
  {
    id: 'inv-006',
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    shares: 35,
    buyPrice: 155.00,
    currentPrice: 182.40,
    assetClass: 'Stocks',
    sector: 'Internet Services',
    dayChangePct: 0.52
  },
  {
    id: 'inv-007',
    ticker: 'BND',
    name: 'Vanguard Total Bond Market ETF',
    shares: 80,
    buyPrice: 74.20,
    currentPrice: 73.15,
    assetClass: 'Bonds',
    sector: 'Fixed Income',
    dayChangePct: 0.11
  },
  {
    id: 'inv-008',
    ticker: 'BTC',
    name: 'Bitcoin (USD)',
    shares: 0.25,
    buyPrice: 52000.00,
    currentPrice: 67450.00,
    assetClass: 'Crypto',
    sector: 'Digital Assets',
    dayChangePct: 1.87
  }
];

export const INITIAL_BENCHMARKS: BenchmarkItem[] = [
  { ticker: 'SPY', name: 'S&P 500 Index (SPY)', returnPct: 14.8, ytd: 15.2, price: 576.20, changePct: 0.67 },
  { ticker: 'QQQ', name: 'Nasdaq 100 Index (QQQ)', returnPct: 18.5, ytd: 19.1, price: 492.10, changePct: 0.84 },
  { ticker: 'DIA', name: 'Dow Jones Industrial (DIA)', returnPct: 10.4, ytd: 11.0, price: 421.30, changePct: 0.32 },
  { ticker: 'VT', name: 'Vanguard Total World Stock (VT)', returnPct: 13.1, ytd: 13.5, price: 118.40, changePct: 0.45 }
];

export const INITIAL_WISHLIST = [
  {
    id: 'wish-001',
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    currentPrice: 248.60,
    targetBuyPrice: 220.00,
    dayChangePct: -1.35,
    notes: 'Wait for pullback below $220 support level before robotaxi deployment',
    priority: 'High' as const,
    assetClass: 'Stocks' as const,
    sector: 'Automotive & Clean Tech',
    addedDate: '2026-09-15'
  },
  {
    id: 'wish-002',
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    currentPrice: 194.80,
    targetBuyPrice: 195.00,
    dayChangePct: 0.78,
    notes: 'AWS cloud margin acceleration and retail free cash flow',
    priority: 'High' as const,
    assetClass: 'Stocks' as const,
    sector: 'E-commerce & Cloud',
    addedDate: '2026-09-20'
  },
  {
    id: 'wish-003',
    ticker: 'PLTR',
    name: 'Palantir Technologies',
    currentPrice: 42.80,
    targetBuyPrice: 43.50,
    dayChangePct: 3.12,
    notes: 'Target reached! AIP commercial adoption expanding rapidly',
    priority: 'High' as const,
    assetClass: 'Stocks' as const,
    sector: 'Enterprise AI & Defense',
    addedDate: '2026-10-01'
  },
  {
    id: 'wish-004',
    ticker: 'AMD',
    name: 'Advanced Micro Devices',
    currentPrice: 156.40,
    targetBuyPrice: 145.00,
    dayChangePct: 1.25,
    notes: 'MI300 GPU datacenter market share gains vs Nvidia',
    priority: 'Medium' as const,
    assetClass: 'Stocks' as const,
    sector: 'Semiconductors',
    addedDate: '2026-09-28'
  },
  {
    id: 'wish-005',
    ticker: 'ETH',
    name: 'Ethereum (USD)',
    currentPrice: 2620.00,
    targetBuyPrice: 2400.00,
    dayChangePct: 1.87,
    notes: 'Layer-2 staking yield accumulation on key support bounce',
    priority: 'Low' as const,
    assetClass: 'Crypto' as const,
    sector: 'Digital Assets',
    addedDate: '2026-09-10'
  }
];

export const SAMPLE_TRANSACTIONS_CSV = `Date,Description,Amount,Category
2026-10-01,Tech Corp Direct Deposit Payroll,4850.00,Income & Salary
2026-10-02,Apex Residential Rent Payment,-1950.00,Housing & Utilities
2026-10-03,Metro Transit Subway Pass,-32.50,Transportation
2026-10-04,Chevron Station Fuel Fillup,-48.20,Transportation
2026-10-05,Precision Auto Transmission & Brake Repair,-845.00,Transportation
2026-10-06,Sweetgreen Organic Lunch,-18.75,Food & Dining
2026-10-07,Chipotle Mexican Grill,-19.50,Food & Dining
2026-10-08,Blue Bottle Coffee Roasters,-42.50,Food & Dining
2026-10-08,Blue Bottle Coffee Roasters,-42.50,Food & Dining
2026-10-09,Nobu Restaurant & Omakase Dinner,-540.00,Food & Dining`;

export const SAMPLE_INVESTMENTS_CSV = `Ticker,Name,Shares,BuyPrice,CurrentPrice,AssetClass,Sector
VOO,Vanguard S&P 500 ETF,45,440.00,524.80,ETFs,Broad Market
QQQ,Invesco QQQ Trust,32,395.00,492.10,ETFs,Technology
AAPL,Apple Inc.,40,185.00,232.50,Stocks,Consumer Tech
NVDA,NVIDIA Corporation,65,88.50,138.25,Stocks,Semiconductors
MSFT,Microsoft Corporation,25,375.00,428.15,Stocks,Software & Cloud
GOOGL,Alphabet Inc.,35,155.00,182.40,Stocks,Internet Services
BND,Vanguard Total Bond Market ETF,80,74.20,73.15,Bonds,Fixed Income
BTC,Bitcoin (USD),0.25,52000.00,67450.00,Crypto,Digital Assets`;
