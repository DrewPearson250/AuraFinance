import React from 'react';
import { SpendingAnomaly } from '../types/finance';
import { AlertTriangle, ShieldAlert, Check, ArrowRight, Activity, RotateCcw } from 'lucide-react';

interface AnomaliesViewProps {
  anomalies: SpendingAnomaly[];
  dismissedCount?: number;
  onAcknowledge: (id: string) => void;
  onRestoreAll?: () => void;
  onNavigateToExpenses: () => void;
}

export const AnomaliesView: React.FC<AnomaliesViewProps> = ({
  anomalies,
  dismissedCount = 0,
  onAcknowledge,
  onRestoreAll,
  onNavigateToExpenses
}) => {
  const totalAnomalousSpend = anomalies.reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">Spending Anomaly Detection</h3>
            <span className="font-mono text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {anomalies.length} Flagged Events
            </span>
            {dismissedCount > 0 && onRestoreAll && (
              <button
                onClick={onRestoreAll}
                className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer font-medium ml-2"
                title="Restore all previously dismissed anomaly flags"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>Restore Dismissed ({dismissedCount})</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Statistical deviation engine evaluates category rolling baselines, medians, and Z-scores ($Z \ge 2.0$) to flag uncharacteristic spending spikes and duplicate charges.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-400 block text-[10px]">TOTAL FLAGGED SPEND</span>
            <span className="text-base font-bold text-slate-900">
              ${totalAnomalousSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 block text-[10px]">ALGORITHM ENGINE</span>
            <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Statistical Z-Score</span>
            </span>
          </div>
        </div>
      </div>

      {/* Anomalies List */}
      {anomalies.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-slate-900">
            {dismissedCount > 0 ? 'All Anomalies Dismissed' : 'All Spending Within Expected Range'}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {dismissedCount > 0
              ? `You have acknowledged and dismissed ${dismissedCount} flagged transaction${dismissedCount > 1 ? 's' : ''}.`
              : 'No transactions exceed statistical deviation limits. Category expenses conform to rolling baseline medians.'}
          </p>
          {dismissedCount > 0 && onRestoreAll && (
            <button
              onClick={onRestoreAll}
              className="mt-4 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restore {dismissedCount} Dismissed Flag{dismissedCount > 1 ? 's' : ''}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {anomalies.map(anomaly => {
            const isCrit = anomaly.severity === 'critical';
            const isNotice = anomaly.severity === 'notice';

            return (
              <div
                key={anomaly.id}
                className={`p-5 rounded-xl border transition-all ${
                  isCrit
                    ? 'bg-rose-50/30 border-rose-200'
                    : isNotice
                    ? 'bg-blue-50/20 border-blue-200'
                    : 'bg-amber-50/30 border-amber-200'
                }`}
              >
                {/* Top header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {isCrit ? (
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : isNotice ? (
                      <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">
                      {isCrit ? 'Critical Spike' : isNotice ? 'Velocity Duplicate' : 'Outlier Warning'}
                    </span>
                  </div>

                  <span className="font-mono text-xs text-slate-500">
                    {anomaly.date}
                  </span>
                </div>

                {/* Amount & Description */}
                <div className="mb-3">
                  <div className="text-xl font-bold font-mono text-slate-900">
                    ${anomaly.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm font-medium text-slate-800 mt-0.5">
                    {anomaly.description}
                  </div>
                  <div className="text-xs text-slate-500">
                    Category: <strong className="text-slate-700">{anomaly.category}</strong>
                  </div>
                </div>

                {/* Algorithmic Reason Box */}
                <div className="p-3 bg-white/80 rounded-lg border border-slate-200/80 text-xs text-slate-700 mb-4">
                  <p className="font-medium text-slate-900">{anomaly.reason}</p>
                  
                  {anomaly.baselineMedian > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100 font-mono text-[11px] text-slate-500">
                      <div>
                        <span>Median:</span>
                        <strong className="block text-slate-800">${anomaly.baselineMedian.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span>Mean:</span>
                        <strong className="block text-slate-800">${anomaly.baselineMean.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span>Z-Score:</span>
                        <strong className="block text-slate-800">{anomaly.zScore > 0 ? `+${anomaly.zScore}` : anomaly.zScore}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={onNavigateToExpenses}
                    className="text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View in Ledger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onAcknowledge(anomaly.id)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 hover:text-slate-900 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title="Dismiss this flag and mark as acknowledged"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dismiss Flag</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
