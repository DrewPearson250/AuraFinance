import React, { useState } from 'react';
import { Transaction, Investment } from '../types/finance';
import { Play, Download, Terminal, Code2, Check, RefreshCw, Copy } from 'lucide-react';
import { downloadFile } from '../utils/csvParser';

interface PythonRunnerProps {
  transactions: Transaction[];
  investments: Investment[];
}

const PRESET_SCRIPTS = [
  {
    id: 'outliers',
    name: '1. Z-Score Outlier & Anomaly Detection',
    description: 'Computes category mean, standard deviation, and flags transactions with Z >= 2.0',
    code: `# Z-Score Outlier Detection in Python
import statistics
from collections import defaultdict

print("=== PYTHON STATISTICAL ANOMALY DETECTOR ===")
cat_expenses = defaultdict(list)

for t in transactions:
    amt = abs(float(t.get("amount", 0)))
    cat = t.get("category", "")
    if cat not in ["Income & Salary", "Financial & Transfers"] and amt > 0:
        cat_expenses[cat].append((amt, t.get("description", "")))

for cat, items in sorted(cat_expenses.items()):
    if len(items) < 2:
        continue
    amounts = [x[0] for x in items]
    mean_val = statistics.mean(amounts)
    stdev_val = statistics.stdev(amounts) if len(amounts) > 2 else mean_val * 0.4
    median_val = statistics.median(amounts)
    
    print(f"\\nCategory: {cat} (n={len(items)})")
    print(f"  Mean: \${mean_val:,.2f} | Median: \${median_val:,.2f} | StdDev: \${stdev_val:,.2f}")
    
    for amt, desc in items:
        z = (amt - mean_val) / (stdev_val if stdev_val > 0 else 1)
        if z >= 2.0 or (amt / median_val >= 3.0 and amt > 150):
            print(f"  --> [ANOMALY FLAG] \${amt:,.2f} - '{desc}' (Z-score: +{z:.2f}, {amt/median_val:.1f}x median)")
`
  },
  {
    id: 'pareto',
    name: '2. Pareto 80/20 Expense Breakdown',
    description: 'Ranks expense categories by total spending and computes cumulative percentage',
    code: `# Pareto 80/20 Expense Distribution
from collections import defaultdict

totals = defaultdict(float)
total_spend = 0.0

for t in transactions:
    amt = float(t.get("amount", 0))
    cat = t.get("category", "Other")
    if cat != "Income & Salary" and amt < 0:
        spend = abs(amt)
        totals[cat] += spend
        total_spend += spend

sorted_cats = sorted(totals.items(), key=lambda x: x[1], reverse=True)

print("=== PARETO 80/20 EXPENSE DISTRIBUTION ===")
print(f"Total Period Spending: \${total_spend:,.2f}\\n")
print(f"{'Category':<24} | {'Total ($)':<12} | {'% Share':<8} | {'Cumulative %'}")
print("-" * 62)

cumulative = 0.0
for cat, amount in sorted_cats:
    share = (amount / total_spend * 100) if total_spend > 0 else 0
    cumulative += share
    print(f"{cat:<24} | \${amount:>10,.2f} | {share:>6.1f}% | {cumulative:>6.1f}%")
`
  },
  {
    id: 'portfolio_alpha',
    name: '3. Portfolio Return, Alpha & Allocation',
    description: 'Calculates market value, unrealized returns, asset weights, and benchmark alpha',
    code: `# Portfolio Performance & Benchmark Comparison
total_cost = sum(float(i.get("shares", 0)) * float(i.get("buyPrice", 0)) for i in investments)
total_value = sum(float(i.get("shares", 0)) * float(i.get("currentPrice", 0)) for i in investments)
unrealized_gain = total_value - total_cost
total_return_pct = (unrealized_gain / total_cost * 100) if total_cost > 0 else 0

# Benchmark comparison (S&P 500 = 14.8%)
benchmark_return = 14.8
alpha = total_return_pct - benchmark_return

print("=== PORTFOLIO PERFORMANCE SUMMARY ===")
print(f"Total Invested Basis: \${total_cost:,.2f}")
print(f"Current Market Value: \${total_value:,.2f}")
print(f"Total Unrealized Gain: \${unrealized_gain:,.2f} ({total_return_pct:+.2f}%)")
print(f"Benchmark (S&P 500):  +{benchmark_return:.2f}%")
print(f"Portfolio Alpha:      {alpha:+.2f}% ({'OUTPERFORMING' if alpha >= 0 else 'LAGGING'})\\n")

print(f"{'Ticker':<8} | {'Shares':<8} | {'Price':<10} | {'Value':<12} | {'Gain/Loss %':<12} | {'Weight %'}")
print("-" * 72)
for i in investments:
    sh = float(i.get("shares", 0))
    cp = float(i.get("currentPrice", 0))
    bp = float(i.get("buyPrice", 0))
    val = sh * cp
    ret = ((cp - bp) / bp * 100) if bp > 0 else 0
    weight = (val / total_value * 100) if total_value > 0 else 0
    print(f"{i.get('ticker',''):<8} | {sh:>8.2f} | \${cp:>8.2f} | \${val:>10,.2f} | {ret:>+10.1f}% | {weight:>6.1f}%")
`
  },
  {
    id: 'rebalance',
    name: '4. Target Rebalancing Allocation',
    description: 'Analyzes deviation from a 60/30/10 target portfolio (Equities / Tech / Bonds)',
    code: `# Portfolio Target Rebalancing Simulator
from collections import defaultdict

total_value = sum(float(i.get("shares", 0)) * float(i.get("currentPrice", 0)) for i in investments)
class_totals = defaultdict(float)

for i in investments:
    val = float(i.get("shares", 0)) * float(i.get("currentPrice", 0))
    class_totals[i.get("assetClass", "Stocks")] += val

# Target distribution
targets = {
    "ETFs": 0.40,
    "Stocks": 0.35,
    "Bonds": 0.15,
    "Crypto": 0.10
}

print("=== PORTFOLIO REBALANCING ADVISORY ===")
print(f"Total Portfolio Value: \${total_value:,.2f}\\n")
print(f"{'Asset Class':<12} | {'Current ($)':<12} | {'Current %':<10} | {'Target %':<10} | {'Action Needed'}")
print("-" * 65)

for ac, target_weight in targets.items():
    current_val = class_totals.get(ac, 0.0)
    current_pct = (current_val / total_value * 100) if total_value > 0 else 0
    target_val = total_value * target_weight
    target_pct = target_weight * 100
    delta = target_val - current_val
    action = f"BUY +\${delta:,.2f}" if delta > 50 else (f"TRIM -\${abs(delta):,.2f}" if delta < -50 else "Balanced")
    print(f"{ac:<12} | \${current_val:>10,.2f} | {current_pct:>8.1f}% | {target_pct:>8.1f}% | {action}")
`
  }
];

export const PythonRunner: React.FC<PythonRunnerProps> = ({ transactions, investments }) => {
  const [selectedScriptId, setSelectedScriptId] = useState('outliers');
  const [code, setCode] = useState(PRESET_SCRIPTS[0].code);
  const [stdout, setStdout] = useState<string | null>(null);
  const [stderr, setStderr] = useState<string | null>(null);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelectPreset = (id: string) => {
    setSelectedScriptId(id);
    const found = PRESET_SCRIPTS.find(s => s.id === id);
    if (found) {
      setCode(found.code);
      setStdout(null);
      setStderr(null);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setStdout(null);
    setStderr(null);

    try {
      const res = await fetch('/api/python/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          transactions,
          investments
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setStderr(data.error || 'Execution failed');
      } else {
        setStdout(data.stdout || '(Script executed successfully with no output)');
        setStderr(data.stderr || null);
        setExecTime(data.executionTimeMs || null);
      }
    } catch (err: any) {
      setStderr(`Network error running Python process: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadStandalone = () => {
    window.location.href = '/api/export/python-script';
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">Python Analytics Engine & Lab</h3>
            <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Python 3.10 Subprocess
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Execute real Python code against your loaded financial transactions (<code className="text-slate-800 font-mono">transactions</code>) and investment holdings (<code className="text-slate-800 font-mono">investments</code>).
          </p>
        </div>

        <button
          onClick={handleDownloadStandalone}
          className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 shrink-0 border border-slate-200"
          title="Download the complete standalone Python script to run locally"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Download Python Script (.py)</span>
        </button>
      </div>

      {/* Preset Script Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESET_SCRIPTS.map(preset => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset.id)}
            className={`p-3 text-left rounded-lg border transition-all text-xs ${
              selectedScriptId === preset.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="font-semibold">{preset.name}</div>
            <div className={`text-[11px] mt-1 line-clamp-2 ${selectedScriptId === preset.id ? 'text-slate-300' : 'text-slate-500'}`}>
              {preset.description}
            </div>
          </button>
        ))}
      </div>

      {/* Code Editor & Execution Panel */}
      <div className="bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-lg overflow-hidden">
        {/* Editor Top Bar */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>analytics_script.py</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">{transactions.length} transactions, {investments.length} holdings in scope</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="px-3.5 py-1 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
            >
              {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isRunning ? 'Executing...' : 'Run in Python'}</span>
            </button>
          </div>
        </div>

        {/* Code Textarea */}
        <div className="p-4 bg-slate-950">
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            rows={14}
            className="w-full bg-transparent font-mono text-xs text-slate-200 resize-y focus:outline-none leading-relaxed selection:bg-emerald-800"
            spellCheck={false}
          />
        </div>

        {/* Output Console (Terminal) */}
        <div className="border-t border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              <span>Python Stdout / Terminal Output</span>
            </div>
            {execTime !== null && (
              <span className="text-emerald-400 text-[11px]">
                Executed in {execTime}ms
              </span>
            )}
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-xs min-h-[120px] max-h-[360px] overflow-y-auto whitespace-pre-wrap">
            {isRunning && (
              <span className="text-slate-400 animate-pulse">Running Python script via subprocess...</span>
            )}
            {!isRunning && stdout && (
              <span className="text-emerald-300">{stdout}</span>
            )}
            {!isRunning && stderr && (
              <span className="text-rose-400 block mt-2">{stderr}</span>
            )}
            {!isRunning && !stdout && !stderr && (
              <span className="text-slate-600">Click &quot;Run in Python&quot; to execute the script against your dataset and view stdout.</span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
