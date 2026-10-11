/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Investment, WishlistItem, BenchmarkItem } from './types/finance';
import { INITIAL_TRANSACTIONS, INITIAL_INVESTMENTS, INITIAL_BENCHMARKS, INITIAL_WISHLIST } from './data/sampleFinancialData';
import { computeCashFlow, computePortfolio, detectAnomaliesClient } from './utils/clientAnalytics';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { CashFlowChart } from './components/charts/CashFlowChart';
import { BenchmarkChart } from './components/charts/BenchmarkChart';
import { AllocationChart } from './components/charts/AllocationChart';
import { TransactionsTable } from './components/TransactionsTable';
import { PortfolioView } from './components/PortfolioView';
import { StockWishlistView } from './components/StockWishlistView';
import { AnomaliesView } from './components/AnomaliesView';
import { ImportModal } from './components/modals/ImportModal';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { AddInvestmentModal } from './components/modals/AddInvestmentModal';
import { AddWishlistModal } from './components/modals/AddWishlistModal';
import { exportToCSV } from './utils/csvParser';
import { ArrowRight, Bookmark, AlertTriangle } from 'lucide-react';

export default function App() {
  // Site Name customization (default: AuraFinance)
  const [siteName, setSiteName] = useState(() => {
    const saved = localStorage.getItem('aurafinance_sitename_v1');
    if (!saved || saved.toLowerCase().includes('aurawish')) {
      return 'AuraFinance';
    }
    return saved;
  });

  // Tab state (Python Lab tab removed per user request)
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'portfolio' | 'wishlist' | 'anomalies'>('overview');

  // Core financial state with localStorage persistence (v3 calibrated 10-transaction view)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const savedV3 = localStorage.getItem('aurafinance_tx_v3');
      if (savedV3) return JSON.parse(savedV3);
      localStorage.removeItem('aurafinance_tx_v2');
      localStorage.removeItem('aurafinance_tx_v1');
      return INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [investments, setInvestments] = useState<Investment[]>(() => {
    try {
      const saved = localStorage.getItem('aurafinance_inv_v1');
      return saved ? JSON.parse(saved) : INITIAL_INVESTMENTS;
    } catch {
      return INITIAL_INVESTMENTS;
    }
  });

  // Stock Wishlist state
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('aurafinance_wish_v1');
      return saved ? JSON.parse(saved) : INITIAL_WISHLIST;
    } catch {
      return INITIAL_WISHLIST;
    }
  });

  // Dismissed Anomaly IDs state with localStorage persistence
  const [dismissedAnomalyIds, setDismissedAnomalyIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aurafinance_dismissed_anomalies_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [benchmarks] = useState<BenchmarkItem[]>(INITIAL_BENCHMARKS);
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkItem>(INITIAL_BENCHMARKS[0]);

  // Modals state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddInvOpen, setIsAddInvOpen] = useState(false);
  const [isAddWishlistOpen, setIsAddWishlistOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aurafinance_sitename_v1', siteName);
    } catch (e) {
      console.error(e);
    }
  }, [siteName]);

  useEffect(() => {
    try {
      localStorage.setItem('aurafinance_tx_v3', JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('aurafinance_inv_v1', JSON.stringify(investments));
    } catch (e) {
      console.error(e);
    }
  }, [investments]);

  useEffect(() => {
    try {
      localStorage.setItem('aurafinance_wish_v1', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('aurafinance_dismissed_anomalies_v1', JSON.stringify(dismissedAnomalyIds));
    } catch (e) {
      console.error(e);
    }
  }, [dismissedAnomalyIds]);

  // Compute analytics
  const cashFlow = useMemo(() => computeCashFlow(transactions), [transactions]);
  const portfolioData = useMemo(
    () => computePortfolio(investments, selectedBenchmark.returnPct),
    [investments, selectedBenchmark.returnPct]
  );

  // Filter out any dismissed anomalies so the dismiss action works immediately
  const anomalies = useMemo(() => {
    const rawAnomalies = detectAnomaliesClient(transactions);
    return rawAnomalies.filter(a => !dismissedAnomalyIds.includes(a.id));
  }, [transactions, dismissedAnomalyIds]);

  // Buy Zone count
  const buyZoneCount = useMemo(() => {
    return wishlist.filter(w => w.currentPrice <= w.targetBuyPrice).length;
  }, [wishlist]);

  // Handlers for transactions
  const handleCategoryChange = (id: string, newCategory: string) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, category: newCategory, categoryConfidence: 1.0 } : t))
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleImportTransactions = (imported: Transaction[], replace: boolean) => {
    setTransactions(prev => (replace ? imported : [...imported, ...prev]));
  };

  // Handlers for investments
  const handleDeletePosition = (id: string) => {
    setInvestments(prev => prev.filter(i => i.id !== id));
  };

  const handleAddInvestment = (newInv: Investment) => {
    setInvestments(prev => [newInv, ...prev]);
  };

  const handleImportInvestments = (imported: Investment[], replace: boolean) => {
    setInvestments(prev => (replace ? imported : [...imported, ...prev]));
  };

  const handleUpdatePositionPrice = (ticker: string, newPrice: number) => {
    setInvestments(prev =>
      prev.map(inv =>
        inv.ticker.toUpperCase() === ticker.toUpperCase()
          ? { ...inv, currentPrice: newPrice }
          : inv
      )
    );
  };

  // Handlers for wishlist
  const handleAddWishlistItem = (item: WishlistItem) => {
    setWishlist(prev => [item, ...prev]);
  };

  const handleUpdateWishlistItem = (id: string, updates: Partial<WishlistItem>) => {
    setWishlist(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleDeleteWishlistItem = (id: string) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  // Promote from wishlist into portfolio
  const handlePromoteToPortfolio = (item: WishlistItem, shares: number, buyPrice: number) => {
    const existingIdx = investments.findIndex(inv => inv.ticker.toUpperCase() === item.ticker.toUpperCase());
    if (existingIdx !== -1) {
      setInvestments(prev =>
        prev.map((inv, idx) => {
          if (idx === existingIdx) {
            const newTotalShares = inv.shares + shares;
            const newTotalCost = (inv.shares * inv.buyPrice) + (shares * buyPrice);
            const newAvgPrice = newTotalCost / newTotalShares;
            return {
              ...inv,
              shares: newTotalShares,
              buyPrice: Number(newAvgPrice.toFixed(2)),
              currentPrice: item.currentPrice
            };
          }
          return inv;
        })
      );
    } else {
      const newHolding: Investment = {
        id: `inv-${Date.now()}`,
        ticker: item.ticker,
        name: item.name,
        shares,
        buyPrice,
        currentPrice: item.currentPrice,
        assetClass: item.assetClass,
        sector: item.sector
      };
      setInvestments(prev => [newHolding, ...prev]);
    }
    setActiveTab('portfolio');
  };

  // Working Dismiss Flag handler: removes anomaly from active view and stores in localStorage
  const handleDismissAnomaly = (id: string) => {
    setDismissedAnomalyIds(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  // Restore all dismissed anomaly flags
  const handleRestoreDismissedAnomalies = () => {
    setDismissedAnomalyIds([]);
    localStorage.removeItem('aurafinance_dismissed_anomalies_v1');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all transactions, portfolio holdings, and wishlist to default sample data?')) {
      setTransactions(INITIAL_TRANSACTIONS);
      setInvestments(INITIAL_INVESTMENTS);
      setWishlist(INITIAL_WISHLIST);
      setDismissedAnomalyIds([]);
      setSiteName('AuraFinance');
      localStorage.removeItem('aurafinance_tx_v3');
      localStorage.removeItem('aurafinance_tx_v2');
      localStorage.removeItem('aurafinance_tx_v1');
      localStorage.removeItem('aurafinance_inv_v1');
      localStorage.removeItem('aurafinance_wish_v1');
      localStorage.removeItem('aurafinance_sitename_v1');
      localStorage.removeItem('aurafinance_dismissed_anomalies_v1');
    }
  };

  const handleExportAllData = () => {
    const txData = transactions.map(t => ({
      Date: t.date,
      Description: t.description,
      Amount: t.amount,
      Category: t.category
    }));
    exportToCSV(txData, `${siteName.toLowerCase().replace(/\s+/g, '_')}_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-200">
      
      {/* Executive Header */}
      <Header
        siteName={siteName}
        setSiteName={setSiteName}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        anomalyCount={anomalies.length}
        buyZoneCount={buyZoneCount}
        wishlistCount={wishlist.length}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenAddTx={() => setIsAddTxOpen(true)}
        onOpenAddInv={() => setIsAddInvOpen(true)}
        onOpenAddWishlist={() => setIsAddWishlistOpen(true)}
        onResetData={handleResetData}
        onExportData={handleExportAllData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Metric Cards (visible across primary dashboards) */}
        <MetricCards
          portfolio={portfolioData.summary}
          cashFlow={cashFlow}
          anomalyCount={anomalies.length}
          onViewAnomalies={() => setActiveTab('anomalies')}
          onViewPortfolio={() => setActiveTab('portfolio')}
        />

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Stock Wishlist Buy Zone Highlights Bar */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-semibold text-slate-900">Stock Wishlist Targets</h4>
                  {buyZoneCount > 0 ? (
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {buyZoneCount} In Buy Zone
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-slate-500">
                      {wishlist.length} Tickers Tracked
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Stocks on your acquisition watchlist that have dipped to or below your target entry price
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center -space-x-1 overflow-hidden">
                  {wishlist.slice(0, 4).map(w => (
                    <span
                      key={w.id}
                      className={`inline-block font-mono text-[11px] font-bold px-2 py-1 rounded border shadow-2xs ${
                        w.currentPrice <= w.targetBuyPrice
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                      title={`${w.ticker} ($${w.currentPrice}) vs target ($${w.targetBuyPrice})`}
                    >
                      {w.ticker}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Manage Wishlist ({wishlist.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Charts Row: Cash Flow + Benchmark Trajectory */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <CashFlowChart data={cashFlow.monthlyTrends} />
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <BenchmarkChart
                  data={portfolioData.comparisonSeries}
                  portfolioReturnPct={portfolioData.summary.totalReturnPct}
                  benchmarkReturnPct={selectedBenchmark.returnPct}
                  alpha={portfolioData.summary.alpha}
                />
              </div>
            </div>

            {/* Allocation Meter */}
            <AllocationChart
              assetAllocation={portfolioData.assetAllocation}
              sectorAllocation={portfolioData.sectorAllocation}
              totalValue={portfolioData.summary.totalCurrentValue}
            />

            {/* Split Row: Category Breakdown + Flagged Spikes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Category Breakdown Table */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Expense Breakdown by Category</h4>
                    <p className="text-xs text-slate-500">Auto-categorized spending distribution</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('expenses')}
                    className="text-xs text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all expenses</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {cashFlow.categoryBreakdown.slice(0, 6).map((item) => (
                    <div key={item.category} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-800">{item.category}</span>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-slate-900 font-semibold">
                            ${item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-slate-500 w-12 text-right">{item.percentage}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-800 rounded-full"
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anomaly Callout Box */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">Flagged Spending Anomalies</h4>
                      <span className="font-mono text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {anomalies.length} Flagged
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('anomalies')}
                      className="text-xs text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Full review</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {anomalies.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      {dismissedAnomalyIds.length > 0
                        ? `All flagged anomalies have been acknowledged (${dismissedAnomalyIds.length} dismissed).`
                        : 'No statistical outliers detected in current period.'}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {anomalies.slice(0, 3).map(a => (
                        <div
                          key={a.id}
                          className="p-3 bg-amber-50/40 border border-amber-200/80 rounded-lg text-xs"
                        >
                          <div className="flex items-center justify-between font-mono mb-1">
                            <span className="font-bold text-slate-900">${a.amount.toFixed(2)}</span>
                            <span className="text-slate-500">{a.date}</span>
                          </div>
                          <div className="font-medium text-slate-800 truncate">{a.description}</div>
                          <div className="text-[11px] text-amber-800 mt-1 flex items-center justify-between">
                            <span className="truncate">{a.reason}</span>
                            <button
                              onClick={() => handleDismissAnomaly(a.id)}
                              className="text-slate-600 hover:text-slate-900 text-[11px] underline ml-2 shrink-0 cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono">Category baseline Z-scores</span>
                  <button
                    onClick={() => setActiveTab('anomalies')}
                    className="text-slate-800 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect All Flags ({anomalies.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: EXPENSES & CATEGORIZATION */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <CashFlowChart data={cashFlow.monthlyTrends} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {cashFlow.categoryBreakdown.slice(0, 6).map(c => (
                <div key={c.category} className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500 truncate">{c.category}</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    ${c.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono mt-1">
                    {c.percentage}% ({c.count} txs)
                  </div>
                </div>
              ))}
            </div>

            <TransactionsTable
              transactions={transactions}
              anomalies={anomalies}
              onCategoryChange={handleCategoryChange}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenAddModal={() => setIsAddTxOpen(true)}
            />
          </div>
        )}

        {/* TAB 3: PORTFOLIO & BENCHMARKS */}
        {activeTab === 'portfolio' && (
          <PortfolioView
            investments={portfolioData.positions}
            summary={portfolioData.summary}
            benchmarks={benchmarks}
            selectedBenchmark={selectedBenchmark}
            setSelectedBenchmark={setSelectedBenchmark}
            comparisonSeries={portfolioData.comparisonSeries}
            assetAllocation={portfolioData.assetAllocation}
            sectorAllocation={portfolioData.sectorAllocation}
            onOpenAddModal={() => setIsAddInvOpen(true)}
            onDeletePosition={handleDeletePosition}
            onUpdatePositionPrice={handleUpdatePositionPrice}
          />
        )}

        {/* TAB 4: STOCK WISHLIST */}
        {activeTab === 'wishlist' && (
          <StockWishlistView
            wishlist={wishlist}
            onAddWishlistItem={handleAddWishlistItem}
            onUpdateWishlistItem={handleUpdateWishlistItem}
            onDeleteWishlistItem={handleDeleteWishlistItem}
            onPromoteToPortfolio={handlePromoteToPortfolio}
            onOpenAddModal={() => setIsAddWishlistOpen(true)}
          />
        )}

        {/* TAB 5: ANOMALIES & ALERTS */}
        {activeTab === 'anomalies' && (
          <AnomaliesView
            anomalies={anomalies}
            dismissedCount={dismissedAnomalyIds.length}
            onAcknowledge={handleDismissAnomaly}
            onRestoreAll={handleRestoreDismissedAnomalies}
            onNavigateToExpenses={() => setActiveTab('expenses')}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{siteName}</span>
            <span>·</span>
            <span>Stock Wishlist & Portfolio Analytics</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('wishlist')}
              className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Stock Wishlist
            </button>
            <button
              onClick={() => setActiveTab('anomalies')}
              className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Spending Anomalies
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              CSV Data Import
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportTransactions={handleImportTransactions}
        onImportInvestments={handleImportInvestments}
      />

      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      <AddInvestmentModal
        isOpen={isAddInvOpen}
        onClose={() => setIsAddInvOpen(false)}
        onAddInvestment={handleAddInvestment}
      />

      <AddWishlistModal
        isOpen={isAddWishlistOpen}
        onClose={() => setIsAddWishlistOpen(false)}
        onAddWishlistItem={handleAddWishlistItem}
      />

    </div>
  );
}
