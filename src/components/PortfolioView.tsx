import React, { useState } from 'react';
import { Investment, PortfolioSummary, BenchmarkItem, ComparisonPoint } from '../types/finance';
import { BenchmarkChart } from './charts/BenchmarkChart';
import { AllocationChart } from './charts/AllocationChart';
import { Search, RefreshCw, Plus, Trash2, ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import { exportToCSV } from '../utils/csvParser';
import { fetchStockQuote, StockQuote } from '../services/marketData';

interface PortfolioViewProps {
  investments: Investment[];
  summary: PortfolioSummary;
  benchmarks: BenchmarkItem[];
  selectedBenchmark: BenchmarkItem;
  setSelectedBenchmark: (b: BenchmarkItem) => void;
  comparisonSeries: ComparisonPoint[];
  assetAllocation: { name: string; value: number; percentage: number }[];
  sectorAllocation: { name: string; value: number; percentage: number }[];
  onOpenAddModal: () => void;
  onDeletePosition: (id: string) => void;
  onUpdatePositionPrice: (ticker: string, newPrice: number) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  investments,
  summary,
  benchmarks,
  selectedBenchmark,
  setSelectedBenchmark,
  comparisonSeries,
  assetAllocation,
  sectorAllocation,
  onOpenAddModal,
  onDeletePosition,
  onUpdatePositionPrice
}) => {
  const [lookupTicker, setLookupTicker] = useState('NVDA');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteResult, setQuoteResult] = useState<StockQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Live Quote lookup using resilient service
  const handleFetchQuote = async (symbolToFetch?: string) => {
    const symbol = (symbolToFetch || lookupTicker).toUpperCase().trim();
    if (!symbol) return;
    setQuoteLoading(true);
    setQuoteError(null);

    try {
      const data = await fetchStockQuote(symbol);
      setQuoteResult(data);
    } catch (err: any) {
      setQuoteError(`Failed to fetch quote for ${symbol}: ${err.message}`);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleApplyLivePrice = () => {
    if (!quoteResult) return;
    onUpdatePositionPrice(quoteResult.ticker, quoteResult.price);
  };

  const handleExportInvestments = () => {
    const data = investments.map(inv => ({
      Ticker: inv.ticker,
      Name: inv.name,
      AssetClass: inv.assetClass,
      Sector: inv.sector,
      Shares: inv.shares,
      BuyPrice: inv.buyPrice,
      CurrentPrice: inv.currentPrice,
      CostBasis: inv.costBasis,
      CurrentValue: inv.currentValue,
      GainLoss: inv.gainLoss,
      GainLossPct: `${inv.gainLossPct}%`,
      WeightPct: `${inv.weightPct}%`
    }));
    exportToCSV(data, `portfolio_holdings_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      
      {/* Benchmark Selector & Performance Summary */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Benchmark Performance Comparison</h3>
            <p className="text-xs text-slate-500">
              Evaluates excess return (Alpha) against primary index funds over your holding periods
            </p>
          </div>

          {/* Benchmark selector buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {benchmarks.map(b => (
              <button
                key={b.ticker}
                onClick={() => setSelectedBenchmark(b)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  selectedBenchmark.ticker === b.ticker
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{b.ticker}</span>
                <span className="font-mono text-emerald-600 text-[11px]">+{b.returnPct}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Benchmark Trajectory Chart */}
        <div className="pt-4">
          <BenchmarkChart
            data={comparisonSeries}
            portfolioReturnPct={summary.totalReturnPct}
            benchmarkReturnPct={selectedBenchmark.returnPct}
            alpha={summary.totalReturnPct - selectedBenchmark.returnPct}
          />
        </div>
      </div>

      {/* External Financial API Quote Lookup Tool */}
      <div className="bg-slate-900 text-white p-5 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-100">Live Financial Market API</h4>
              <span className="text-[10px] font-mono text-slate-300">
                Real-Time Quotes
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Query historical prices, day changes, and update holdings with real stock market data
            </p>
          </div>

          {/* Lookup Input form */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Ticker (e.g. NVDA, AAPL)"
                value={lookupTicker}
                onChange={e => setLookupTicker(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleFetchQuote()}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36 uppercase"
              />
            </div>
            <button
              onClick={() => handleFetchQuote()}
              disabled={quoteLoading}
              className="px-3 py-1.5 text-xs font-medium text-slate-900 bg-emerald-400 rounded-lg hover:bg-emerald-300 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${quoteLoading ? 'animate-spin' : ''}`} />
              <span>{quoteLoading ? 'Fetching...' : 'Get Quote'}</span>
            </button>
          </div>
        </div>

        {/* Quick Ticker Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
          <span className="text-slate-400 text-[11px]">Popular:</span>
          {['VOO', 'SPY', 'QQQ', 'NVDA', 'AAPL', 'MSFT', 'BTC', 'BND'].map(sym => (
            <button
              key={sym}
              onClick={() => {
                setLookupTicker(sym);
                handleFetchQuote(sym);
              }}
              className="px-2 py-0.5 text-[11px] font-mono bg-slate-800 text-slate-300 rounded hover:bg-slate-700 hover:text-white transition-colors"
            >
              {sym}
            </button>
          ))}
        </div>

        {/* Quote Result Banner */}
        {quoteError && (
          <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-lg">
            {quoteError}
          </div>
        )}

        {quoteResult && (
          <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold font-mono text-white">{quoteResult.ticker}</span>
                <span className="text-xs text-slate-400">{quoteResult.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {quoteResult.source === 'live_api' ? 'Live API Feed' : 'Market Data Reference'}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 font-mono">
                <span className="text-xl font-bold text-white">
                  ${quoteResult.price.toFixed(2)}
                </span>
                <span className={`text-xs font-semibold flex items-center ${quoteResult.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {quoteResult.change >= 0 ? '+' : ''}${quoteResult.change.toFixed(2)} ({quoteResult.changePct >= 0 ? '+' : ''}{quoteResult.changePct.toFixed(2)}%)
                </span>
                <span className="text-slate-500 text-xs">· {quoteResult.assetClass} / {quoteResult.sector}</span>
              </div>
            </div>

            {/* Actions for fetched quote */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleApplyLivePrice}
                className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                title="Update matching portfolio holding with latest price"
              >
                Sync with Holdings
              </button>
              <button
                onClick={onOpenAddModal}
                className="px-3 py-1.5 text-xs font-medium text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-colors"
              >
                + Add Position
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Allocation Charts */}
      <AllocationChart
        assetAllocation={assetAllocation}
        sectorAllocation={sectorAllocation}
        totalValue={summary.totalCurrentValue}
      />

      {/* Positions Holdings Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Portfolio Holdings & Performance</h4>
            <p className="text-xs text-slate-500">
              {investments.length} active positions · Herfindahl Diversification: {summary.diversificationScore}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportInvestments}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Export Holdings CSV
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Position</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600 bg-white">
                <th className="py-3 px-4">Asset / Ticker</th>
                <th className="py-3 px-4">Class & Sector</th>
                <th className="py-3 px-4 text-right">Shares</th>
                <th className="py-3 px-4 text-right">Avg Cost</th>
                <th className="py-3 px-4 text-right">Market Price</th>
                <th className="py-3 px-4 text-right">Total Value</th>
                <th className="py-3 px-4 text-right">Return ($ / %)</th>
                <th className="py-3 px-4 text-right">Weight</th>
                <th className="py-3 px-4 text-right w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-mono">
              {investments.map(inv => {
                const isGain = (inv.gainLoss || 0) >= 0;

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Ticker & Name */}
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{inv.ticker}</span>
                        <span className="text-slate-500 text-xs truncate max-w-[140px] hidden sm:inline">
                          {inv.name}
                        </span>
                      </div>
                    </td>

                    {/* Class & Sector */}
                    <td className="py-3 px-4 font-sans text-slate-500 text-xs">
                      <span>{inv.assetClass}</span>
                      <span className="text-slate-300 mx-1">·</span>
                      <span className="truncate max-w-[100px] inline-block align-bottom">{inv.sector}</span>
                    </td>

                    {/* Shares */}
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
                      {inv.shares.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                    </td>

                    {/* Avg Buy Price */}
                    <td className="py-3 px-4 text-right text-slate-600">
                      ${inv.buyPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Current Market Price */}
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      <div className="flex items-center justify-end gap-1.5">
                        <span>${inv.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <button
                          onClick={() => {
                            setLookupTicker(inv.ticker);
                            handleFetchQuote(inv.ticker);
                          }}
                          className="text-slate-400 hover:text-slate-700 transition-colors"
                          title="Fetch fresh quote from market API"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Current Value */}
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ${(inv.currentValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Gain / Loss */}
                    <td className="py-3 px-4 text-right font-semibold">
                      <div className={isGain ? 'text-emerald-600' : 'text-rose-600'}>
                        <span>{isGain ? '+' : ''}${(inv.gainLoss || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-[11px] block font-normal">
                          ({isGain ? '+' : ''}{(inv.gainLossPct || 0).toFixed(1)}%)
                        </span>
                      </div>
                    </td>

                    {/* Weight % */}
                    <td className="py-3 px-4 text-right text-slate-700 font-medium">
                      {(inv.weightPct || 0).toFixed(1)}%
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeletePosition(inv.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete position"
                        aria-label="Delete position"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
