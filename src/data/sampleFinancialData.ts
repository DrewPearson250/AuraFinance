import { Transaction, Investment, BenchmarkItem } from '../types/finance';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // 2026-10 (Current Month)
  { id: 'tx-001', date: '2026-10-01', description: 'Tech Corp Direct Deposit Payroll', amount: 4850.00, category: 'Income & Salary', categoryConfidence: 0.98 },
  { id: 'tx-002', date: '2026-10-02', description: 'Apex Residential Rent Payment', amount: -1950.00, category: 'Housing & Utilities', categoryConfidence: 0.95 },
  { id: 'tx-003', date: '2026-10-03', description: 'Whole Foods Market Organic Groceries', amount: -142.30, category: 'Food & Dining', categoryConfidence: 0.92 },
  { id: 'tx-004', date: '2026-10-04', description: 'Uber Ride to Downtown Client Site', amount: -38.45, category: 'Transportation', categoryConfidence: 0.94 },
  { id: 'tx-005', date: '2026-10-05', description: 'Coursera ML & Quantitative Finance Spec', amount: -399.00, category: 'Education', categoryConfidence: 0.96 },
  { id: 'tx-006', date: '2026-10-06', description: 'Starbucks Reserve Cold Brew', amount: -6.75, category: 'Food & Dining', categoryConfidence: 0.95 },
  { id: 'tx-007', date: '2026-10-07', description: 'Chevron Station Fuel Fillup', amount: -54.20, category: 'Transportation', categoryConfidence: 0.92 },
  { id: 'tx-008', date: '2026-10-08', description: 'Precision Auto Transmission & Brake Repair', amount: -845.00, category: 'Transportation', categoryConfidence: 0.88 }, // Anomaly!
  { id: 'tx-009', date: '2026-10-08', description: 'Blue Bottle Coffee Roasters', amount: -42.50, category: 'Food & Dining', categoryConfidence: 0.90 },
  { id: 'tx-010', date: '2026-10-08', description: 'Blue Bottle Coffee Roasters', amount: -42.50, category: 'Food & Dining', categoryConfidence: 0.90 }, // Duplicate charge anomaly!
  { id: 'tx-011', date: '2026-10-09', description: 'Netflix Premium 4K UHD Subscription', amount: -22.99, category: 'Entertainment & Subs', categoryConfidence: 0.97 },
  { id: 'tx-012', date: '2026-10-10', description: 'Trader Joe Grocery Haul', amount: -86.15, category: 'Food & Dining', categoryConfidence: 0.93 },

  // 2026-09
  { id: 'tx-013', date: '2026-09-01', description: 'Tech Corp Direct Deposit Payroll', amount: 4850.00, category: 'Income & Salary', categoryConfidence: 0.98 },
  { id: 'tx-014', date: '2026-09-02', description: 'Apex Residential Rent Payment', amount: -1950.00, category: 'Housing & Utilities', categoryConfidence: 0.95 },
  { id: 'tx-015', date: '2026-09-03', description: 'Consolidated Edison Power & Gas', amount: -128.40, category: 'Housing & Utilities', categoryConfidence: 0.94 },
  { id: 'tx-016', date: '2026-09-05', description: 'Trader Joe Weekly Groceries', amount: -115.80, category: 'Food & Dining', categoryConfidence: 0.93 },
  { id: 'tx-017', date: '2026-09-07', description: 'United Airlines Roundtrip UA812 Denver', amount: -680.00, category: 'Travel', categoryConfidence: 0.92 }, // Travel spike anomaly!
  { id: 'tx-018', date: '2026-09-10', description: 'Target Home Supplies & Essentials', amount: -94.20, category: 'Shopping & Retail', categoryConfidence: 0.90 },
  { id: 'tx-019', date: '2026-09-12', description: 'Barnes & Noble Quantitative Investing Books', amount: -68.50, category: 'Education', categoryConfidence: 0.91 },
  { id: 'tx-020', date: '2026-09-15', description: 'Freelance Software Architectural Advisory', amount: 1600.00, category: 'Income & Salary', categoryConfidence: 0.90 },
  { id: 'tx-021', date: '2026-09-16', description: 'Spotify Family Plan Monthly', amount: -19.99, category: 'Entertainment & Subs', categoryConfidence: 0.98 },
  { id: 'tx-022', date: '2026-09-18', description: 'Sweetgreen Harvest Bowl Lunch', amount: -17.40, category: 'Food & Dining', categoryConfidence: 0.92 },
  { id: 'tx-023', date: '2026-09-21', description: 'MTA MetroCard 30-Day Transit Pass', amount: -132.00, category: 'Transportation', categoryConfidence: 0.95 },
  { id: 'tx-024', date: '2026-09-24', description: 'Equinox Fitness Club Membership', amount: -220.00, category: 'Health & Wellness', categoryConfidence: 0.94 },
  { id: 'tx-025', date: '2026-09-27', description: 'Amazon Prime Web Order Hardware Tools', amount: -76.85, category: 'Shopping & Retail', categoryConfidence: 0.93 },
  { id: 'tx-026', date: '2026-09-30', description: 'Dividend Payment Vanguard S&P 500 ETF', amount: 114.50, category: 'Income & Salary', categoryConfidence: 0.92 },

  // 2026-08
  { id: 'tx-027', date: '2026-08-01', description: 'Tech Corp Direct Deposit Payroll', amount: 4850.00, category: 'Income & Salary', categoryConfidence: 0.98 },
  { id: 'tx-028', date: '2026-08-02', description: 'Apex Residential Rent Payment', amount: -1950.00, category: 'Housing & Utilities', categoryConfidence: 0.95 },
  { id: 'tx-029', date: '2026-08-04', description: 'Whole Foods Market Groceries', amount: -156.40, category: 'Food & Dining', categoryConfidence: 0.92 },
  { id: 'tx-030', date: '2026-08-07', description: 'Shell Oil Co Station Gas', amount: -48.90, category: 'Transportation', categoryConfidence: 0.93 },
  { id: 'tx-031', date: '2026-08-11', description: 'Executive Data Science Bootcamp Deposit', amount: -540.00, category: 'Education', categoryConfidence: 0.95 }, // Anomaly
  { id: 'tx-032', date: '2026-08-14', description: 'Apple.com iCloud Storage & Music', amount: -14.99, category: 'Entertainment & Subs', categoryConfidence: 0.96 },
  { id: 'tx-033', date: '2026-08-16', description: 'Chipotle Mexican Grill Dinner', amount: -16.80, category: 'Food & Dining', categoryConfidence: 0.94 },
  { id: 'tx-034', date: '2026-08-18', description: 'Xfinity High Speed Broadband Internet', amount: -85.00, category: 'Housing & Utilities', categoryConfidence: 0.95 },
  { id: 'tx-035', date: '2026-08-22', description: 'CVS Pharmacy Prescription & Care', amount: -38.60, category: 'Health & Wellness', categoryConfidence: 0.91 },
  { id: 'tx-036', date: '2026-08-26', description: 'Lyft Premier Airport Ride', amount: -62.10, category: 'Transportation', categoryConfidence: 0.95 },
  { id: 'tx-037', date: '2026-08-29', description: 'Best Buy Wireless Noise Cancelling Tech', amount: -249.99, category: 'Shopping & Retail', categoryConfidence: 0.92 },

  // 2026-07
  { id: 'tx-038', date: '2026-07-01', description: 'Tech Corp Direct Deposit Payroll', amount: 4850.00, category: 'Income & Salary', categoryConfidence: 0.98 },
  { id: 'tx-039', date: '2026-07-02', description: 'Apex Residential Rent Payment', amount: -1950.00, category: 'Housing & Utilities', categoryConfidence: 0.95 },
  { id: 'tx-040', date: '2026-07-05', description: 'Costco Wholesale Club Food Supplies', amount: -284.10, category: 'Food & Dining', categoryConfidence: 0.91 },
  { id: 'tx-041', date: '2026-07-09', description: 'BP Fuel Station Highway', amount: -51.30, category: 'Transportation', categoryConfidence: 0.93 },
  { id: 'tx-042', date: '2026-07-14', description: 'Udemy Algorithmic Trading Bootcamp Course', amount: -49.99, category: 'Education', categoryConfidence: 0.97 },
  { id: 'tx-043', date: '2026-07-20', description: 'AMC Cinema IMAX Movie Tickets', amount: -36.50, category: 'Entertainment & Subs', categoryConfidence: 0.92 },
  { id: 'tx-044', date: '2026-07-25', description: 'Trader Joe Organic Produce', amount: -108.40, category: 'Food & Dining', categoryConfidence: 0.93 },
  { id: 'tx-045', date: '2026-07-28', description: 'Equinox Gym Health Club', amount: -220.00, category: 'Health & Wellness', categoryConfidence: 0.94 }
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
2026-10-03,Whole Foods Market Organic Groceries,-142.30,Food & Dining
2026-10-04,Uber Ride to Downtown Client Site,-38.45,Transportation
2026-10-05,Coursera ML & Quantitative Finance Spec,-399.00,Education
2026-10-06,Starbucks Reserve Cold Brew,-6.75,Food & Dining
2026-10-07,Chevron Station Fuel Fillup,-54.20,Transportation
2026-10-08,Precision Auto Transmission & Brake Repair,-845.00,Transportation
2026-10-08,Blue Bottle Coffee Roasters,-42.50,Food & Dining
2026-10-08,Blue Bottle Coffee Roasters,-42.50,Food & Dining
2026-10-09,Netflix Premium 4K UHD Subscription,-22.99,Entertainment & Subs
2026-10-10,Trader Joe Grocery Haul,-86.15,Food & Dining
2026-09-01,Tech Corp Direct Deposit Payroll,4850.00,Income & Salary
2026-09-02,Apex Residential Rent Payment,-1950.00,Housing & Utilities
2026-09-07,United Airlines Roundtrip Denver,-680.00,Travel
2026-09-12,Barnes & Noble Quantitative Investing Books,-68.50,Education
2026-09-15,Freelance Software Advisory,1600.00,Income & Salary
2026-09-24,Equinox Fitness Club Membership,-220.00,Health & Wellness`;

export const SAMPLE_INVESTMENTS_CSV = `Ticker,Name,Shares,BuyPrice,CurrentPrice,AssetClass,Sector
VOO,Vanguard S&P 500 ETF,45,440.00,524.80,ETFs,Broad Market
QQQ,Invesco QQQ Trust,32,395.00,492.10,ETFs,Technology
AAPL,Apple Inc.,40,185.00,232.50,Stocks,Consumer Tech
NVDA,NVIDIA Corporation,65,88.50,138.25,Stocks,Semiconductors
MSFT,Microsoft Corporation,25,375.00,428.15,Stocks,Software & Cloud
GOOGL,Alphabet Inc.,35,155.00,182.40,Stocks,Internet Services
BND,Vanguard Total Bond Market ETF,80,74.20,73.15,Bonds,Fixed Income
BTC,Bitcoin (USD),0.25,52000.00,67450.00,Crypto,Digital Assets`;
