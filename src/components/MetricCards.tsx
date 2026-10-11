import React from 'react';
import { PortfolioSummary, CashFlowSummary } from '../types/finance';
import { TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardsProps {
  portfolio: PortfolioSummary;
  cashFlow: CashFlowSummary;
  anomalyCount: number;
  onViewAnomalies: () => void;
  onViewPortfolio: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  portfolio,
  cashFlow,
  anomalyCount,
  onViewAnomalies,
  onViewPortfolio
}) => {
  const isGain = portfolio.totalUnrealizedGain >= 0;
  const isOutperforming = portfolio.alpha >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Card 1: Investment Portfolio Value */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Portfolio Market Value</span>
            <span className="font-mono text-slate-700">Cost: ${portfolio.totalCostBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            ${portfolio.totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className={`flex items-center font-mono font-medium ${isGain ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isGain ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            <span>{isGain ? '+' : ''}${Math.abs(portfolio.totalUnrealizedGain).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="ml-1">({isGain ? '+' : ''}{portfolio.totalReturnPct.toFixed(1)}%)</span>
          </div>
          <button
            onClick={onViewPortfolio}
            className="text-slate-500 hover:text-slate-800 transition-colors"
          >
            Holdings →
          </button>
        </div>
      </div>

      {/* Card 2: Benchmark Comparison (Alpha) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Benchmark Comparison</span>
            <span className="font-mono text-slate-700">S&P 500: +{portfolio.benchmarkReturnPct}%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono tracking-tight ${isOutperforming ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isOutperforming ? '+' : ''}{portfolio.alpha.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 font-medium">Alpha (Excess Return)</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="text-slate-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            <span>Sharpe Ratio: <strong className="font-mono font-semibold text-slate-900">{portfolio.sharpeRatio}</strong></span>
          </div>
          <span className="text-slate-500 text-[11px] font-mono">
            {portfolio.diversificationScore}
          </span>
        </div>
      </div>

      {/* Card 3: Monthly Net Savings & Savings Rate */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Total Net Savings</span>
            <span className="font-mono text-slate-700">Rate: {cashFlow.savingsRate.toFixed(1)}%</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            ${cashFlow.netSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 font-mono">
            <span className="text-emerald-600">+${cashFlow.totalIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })} in</span>
            <span className="text-slate-300">/</span>
            <span className="text-rose-600">-${cashFlow.totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })} out</span>
          </div>
          <span className="text-slate-700 font-medium">4-Mo Window</span>
        </div>
      </div>

      {/* Card 4: Unusual Spending Flags */}
      <div className={`p-5 rounded-xl border shadow-xs flex flex-col justify-between transition-colors ${
        anomalyCount > 0 ? 'bg-amber-50/40 border-amber-200' : 'bg-white border-slate-200'
      }`}>
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Spending Anomalies</span>
            {anomalyCount > 0 ? (
              <span className="font-mono text-amber-800 font-medium text-[11px]">Attention Required</span>
            ) : (
              <span className="font-mono text-emerald-600 text-[11px]">Baseline Normal</span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono tracking-tight ${anomalyCount > 0 ? 'text-amber-900' : 'text-slate-900'}`}>
              {anomalyCount}
            </span>
            <span className="text-xs text-slate-500">
              {anomalyCount === 1 ? 'transaction flagged' : 'transactions flagged'}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-amber-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-600">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Z-Score & Velocity Filter</span>
          </div>
          {anomalyCount > 0 && (
            <button
              onClick={onViewAnomalies}
              className="text-amber-800 hover:text-amber-900 font-medium transition-colors"
            >
              Review Flags →
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
