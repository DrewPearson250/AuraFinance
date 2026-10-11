import { Transaction, Investment, SpendingAnomaly, CashFlowSummary, PortfolioSummary, MonthlyTrend, CategoryBreakdown, ComparisonPoint } from '../types/finance';

const CATEGORY_RULES: Record<string, string[]> = {
  'Food & Dining': [
    'starbucks', 'whole foods', 'trader joe', 'kroger', 'safeway', 'aldi', 'mcdonald',
    'chipotle', 'uber eats', 'doordash', 'grubhub', 'restaurant', 'cafe', 'diner', 'coffee',
    'bakery', 'bistro', 'pizza', 'taco', 'sweetgreen', 'shake shack', 'grocery', 'supermarket',
    'wendy', 'panera', 'dunkin', 'blue bottle'
  ],
  'Transportation': [
    'uber', 'lyft', 'shell', 'chevron', 'bp gas', 'exxon', 'mobil', 'subway', 'mta', 'bart',
    'transit', 'caltrain', 'metro', 'parking', 'toll', 'gas station', 'auto repair', 'oil change',
    'transmission', 'brake repair', 'hertz', 'amtrak'
  ],
  'Housing & Utilities': [
    'rent', 'lease', 'mortgage', 'electric', 'coned', 'pge', 'water bill', 'sewer', 'gas company',
    'internet', 'comcast', 'verizon', 'at&t', 'xfinity', 'spectrum', 'trash', 'hoa', 'home depot'
  ],
  'Education': [
    'coursera', 'udemy', 'edx', 'university', 'college', 'tuition', 'textbook', 'chegg',
    'datacamp', 'codecademy', 'masterclass', 'books', 'barnes & noble', 'audible', 'bootcamp', 'academy'
  ],
  'Entertainment & Subs': [
    'netflix', 'spotify', 'hulu', 'disney', 'apple.com/bill', 'playstation', 'xbox', 'steam',
    'nintendo', 'cinema', 'amc', 'regal', 'ticketmaster', 'concert', 'youtube', 'prime video'
  ],
  'Shopping & Retail': [
    'amazon', 'target', 'walmart', 'costco', 'best buy', 'apple store', 'zara', 'nike',
    'nordstrom', 'ikea', 'ebay', 'etsy', 'clothing', 'lululemon'
  ],
  'Health & Wellness': [
    'pharmacy', 'cvs', 'walgreens', 'doctor', 'dental', 'dentist', 'clinic', 'hospital',
    'gym', 'fitness', 'equinox', 'peloton', 'optometry', 'health'
  ],
  'Travel': [
    'delta', 'united airlines', 'american airlines', 'southwest', 'airbnb', 'hotel', 'marriott',
    'hilton', 'hyatt', 'expedia', 'flight'
  ],
  'Income & Salary': [
    'payroll', 'direct dep', 'salary', 'dividend', 'interest paid', 'bonus', 'paycheck', 'advisory'
  ]
};

export function categorizeClientSide(description: string, amount: number): { category: string; confidence: number } {
  const desc = description.toLowerCase();

  if (amount > 0) {
    for (const kw of CATEGORY_RULES['Income & Salary']) {
      if (desc.includes(kw)) return { category: 'Income & Salary', confidence: 0.98 };
    }
    return { category: 'Income & Salary', confidence: 0.85 };
  }

  for (const [cat, keywords] of Object.entries(CATEGORY_RULES)) {
    if (cat === 'Income & Salary') continue;
    for (const kw of keywords) {
      if (desc.includes(kw)) {
        return { category: cat, confidence: 0.92 };
      }
    }
  }

  return { category: 'Other / Miscellaneous', confidence: 0.45 };
}

export function detectAnomaliesClient(transactions: Transaction[]): SpendingAnomaly[] {
  const anomalies: SpendingAnomaly[] = [];
  const catExpenses: Record<string, { amt: number; tx: Transaction }[]> = {};

  transactions.forEach(t => {
    const amt = Math.abs(t.amount);
    if (t.category !== 'Income & Salary' && t.category !== 'Financial & Transfers' && amt > 0) {
      if (!catExpenses[t.category]) catExpenses[t.category] = [];
      catExpenses[t.category].push({ amt, tx: t });
    }
  });

  Object.entries(catExpenses).forEach(([category, items]) => {
    if (items.length < 2) return;
    const amounts = items.map(i => i.amt).sort((a, b) => a - b);
    const sum = amounts.reduce((acc, v) => acc + v, 0);
    const mean = sum / amounts.length;
    
    // Variance & stdev
    const variance = amounts.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (amounts.length - 1 || 1);
    const stdev = Math.sqrt(variance) || mean * 0.45;
    
    // Median
    const mid = Math.floor(amounts.length / 2);
    const median = amounts.length % 2 === 0 ? (amounts[mid - 1] + amounts[mid]) / 2 : amounts[mid];

    items.forEach(({ amt, tx }) => {
      const zScore = (amt - mean) / (stdev || 1);
      const ratioToMedian = median > 0 ? amt / median : 1;

      if ((zScore >= 2.0 || ratioToMedian >= 2.5) && amt >= 120) {
        const isCritical = zScore >= 3.0 || ratioToMedian >= 4.0 || amt >= 600;
        anomalies.push({
          id: tx.id,
          date: tx.date,
          description: tx.description,
          category,
          amount: amt,
          severity: isCritical ? 'critical' : 'warning',
          reason: `Spending is ${ratioToMedian.toFixed(1)}x higher than ${category} median ($${median.toFixed(2)})`,
          zScore: Number(zScore.toFixed(2)),
          baselineMedian: Number(median.toFixed(2)),
          baselineMean: Number(mean.toFixed(2))
        });
      } else if (amt > 500 && ratioToMedian >= 2.2) {
        anomalies.push({
          id: tx.id,
          date: tx.date,
          description: tx.description,
          category,
          amount: amt,
          severity: 'warning',
          reason: `Unusually large purchase ($${amt.toFixed(2)}) for category baseline`,
          zScore: Number(zScore.toFixed(2)),
          baselineMedian: Number(median.toFixed(2)),
          baselineMean: Number(mean.toFixed(2))
        });
      }
    });
  });

  // Duplicate velocity check
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 0; i < sorted.length - 1; i++) {
    const t1 = sorted[i];
    const t2 = sorted[i + 1];
    const a1 = Math.abs(t1.amount);
    const a2 = Math.abs(t2.amount);
    if (
      t1.date === t2.date &&
      Math.abs(a1 - a2) < 0.01 &&
      t1.description.trim().toLowerCase() === t2.description.trim().toLowerCase() &&
      a1 > 20
    ) {
      anomalies.push({
        id: t2.id,
        date: t2.date,
        description: t2.description,
        category: t2.category,
        amount: a2,
        severity: 'notice',
        reason: 'Possible duplicate charge detected on the same date',
        zScore: 0,
        baselineMedian: a1,
        baselineMean: a1
      });
    }
  }

  // Deduplicate and sort descending by date
  const seen = new Set<string>();
  const unique: SpendingAnomaly[] = [];
  anomalies.sort((a, b) => b.date.localeCompare(a.date));
  for (const a of anomalies) {
    const key = `${a.id}-${a.reason}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(a);
    }
  }

  return unique;
}

export function computeCashFlow(transactions: Transaction[]): CashFlowSummary {
  const monthlyInflow: Record<string, number> = {};
  const monthlyOutflow: Record<string, number> = {};
  const categoryTotals: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(t => {
    const rawAmt = t.amount;
    const cat = t.category;
    const monthKey = t.date.slice(0, 7) || 'Recent';

    if (cat === 'Income & Salary' || rawAmt > 0) {
      const amt = Math.abs(rawAmt);
      monthlyInflow[monthKey] = (monthlyInflow[monthKey] || 0) + amt;
      totalIncome += amt;
    } else {
      const amt = Math.abs(rawAmt);
      monthlyOutflow[monthKey] = (monthlyOutflow[monthKey] || 0) + amt;
      totalExpenses += amt;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  });

  const allMonths = Array.from(new Set([...Object.keys(monthlyInflow), ...Object.keys(monthlyOutflow)])).sort();
  const monthlyTrends: MonthlyTrend[] = allMonths.map(m => {
    const inc = monthlyInflow[m] || 0;
    const exp = monthlyOutflow[m] || 0;
    const net = inc - exp;
    const rate = inc > 0 ? (net / inc) * 100 : 0;
    return {
      month: m,
      income: Number(inc.toFixed(2)),
      expenses: Number(exp.toFixed(2)),
      netSavings: Number(net.toFixed(2)),
      savingsRate: Number(rate.toFixed(1))
    };
  });

  const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, total]) => ({
      category,
      total: Number(total.toFixed(2)),
      percentage: Number(((total / (totalExpenses || 1)) * 100).toFixed(1)),
      count: categoryCounts[category] || 0
    }));

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  return {
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    netSavings: Number(netSavings.toFixed(2)),
    savingsRate: Number(savingsRate.toFixed(1)),
    monthlyTrends,
    categoryBreakdown
  };
}

export function computePortfolio(investments: Investment[], benchmarkReturnPct = 14.8): {
  summary: PortfolioSummary;
  positions: Investment[];
  comparisonSeries: ComparisonPoint[];
  assetAllocation: { name: string; value: number; percentage: number }[];
  sectorAllocation: { name: string; value: number; percentage: number }[];
} {
  let totalCostBasis = 0;
  let totalCurrentValue = 0;
  let totalUnrealizedGain = 0;

  const assetAllocationMap: Record<string, number> = {};
  const sectorAllocationMap: Record<string, number> = {};

  const enrichedPositions = investments.map(inv => {
    const costBasis = inv.shares * inv.buyPrice;
    const currentValue = inv.shares * inv.currentPrice;
    const gainLoss = currentValue - costBasis;
    const gainLossPct = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

    totalCostBasis += costBasis;
    totalCurrentValue += currentValue;
    totalUnrealizedGain += gainLoss;

    assetAllocationMap[inv.assetClass] = (assetAllocationMap[inv.assetClass] || 0) + currentValue;
    sectorAllocationMap[inv.sector] = (sectorAllocationMap[inv.sector] || 0) + currentValue;

    return {
      ...inv,
      costBasis: Number(costBasis.toFixed(2)),
      currentValue: Number(currentValue.toFixed(2)),
      gainLoss: Number(gainLoss.toFixed(2)),
      gainLossPct: Number(gainLossPct.toFixed(2)),
      weightPct: 0
    };
  });

  let hhi = 0;
  enrichedPositions.forEach(p => {
    const weight = totalCurrentValue > 0 ? (p.currentValue! / totalCurrentValue) * 100 : 0;
    p.weightPct = Number(weight.toFixed(2));
    hhi += Math.pow(weight, 2);
  });

  const totalReturnPct = totalCostBasis > 0 ? ((totalCurrentValue - totalCostBasis) / totalCostBasis) * 100 : 0;
  const alpha = totalReturnPct - benchmarkReturnPct;

  const rfRate = 4.5;
  const excessReturn = totalReturnPct - rfRate;
  const estVolatility = 15.8;
  const sharpeRatio = estVolatility > 0 ? excessReturn / estVolatility : 0;

  const summary: PortfolioSummary = {
    totalCostBasis: Number(totalCostBasis.toFixed(2)),
    totalCurrentValue: Number(totalCurrentValue.toFixed(2)),
    totalUnrealizedGain: Number(totalUnrealizedGain.toFixed(2)),
    totalReturnPct: Number(totalReturnPct.toFixed(2)),
    benchmarkReturnPct: Number(benchmarkReturnPct.toFixed(2)),
    alpha: Number(alpha.toFixed(2)),
    outperforming: alpha >= 0,
    sharpeRatio: Number(sharpeRatio.toFixed(2)),
    diversificationScore: hhi < 2500 ? 'Well Diversified' : (hhi < 4000 ? 'Moderate Concentration' : 'High Concentration'),
    herfindahlIndex: Number(hhi.toFixed(1))
  };

  const assetAllocation = Object.entries(assetAllocationMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
      percentage: Number(((value / (totalCurrentValue || 1)) * 100).toFixed(1))
    }));

  const sectorAllocation = Object.entries(sectorAllocationMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
      percentage: Number(((value / (totalCurrentValue || 1)) * 100).toFixed(1))
    }));

  const periods = ['5 Mo Ago', '4 Mo Ago', '3 Mo Ago', '2 Mo Ago', '1 Mo Ago', 'Current'];
  const portFactor = 1.0 + (totalReturnPct / 100);
  const benchFactor = 1.0 + (benchmarkReturnPct / 100);
  const nasdaqFactor = 1.0 + ((benchmarkReturnPct * 1.25) / 100);

  const comparisonSeries: ComparisonPoint[] = periods.map((period, idx) => {
    const progress = idx / (periods.length - 1);
    const pVal = 100 * (1.0 + (portFactor - 1.0) * progress * (0.88 + 0.12 * Math.sin(idx * 0.9)));
    const bVal = 100 * (1.0 + (benchFactor - 1.0) * progress * (0.92 + 0.08 * Math.cos(idx * 0.8)));
    const qVal = 100 * (1.0 + (nasdaqFactor - 1.0) * progress * (0.90 + 0.10 * Math.sin(idx * 1.1)));
    return {
      period,
      portfolio: Number(pVal.toFixed(2)),
      sp500: Number(bVal.toFixed(2)),
      nasdaq: Number(qVal.toFixed(2))
    };
  });

  return {
    summary,
    positions: enrichedPositions,
    comparisonSeries,
    assetAllocation,
    sectorAllocation
  };
}
