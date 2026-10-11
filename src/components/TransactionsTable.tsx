import React, { useState, useMemo } from 'react';
import { Transaction, SpendingAnomaly } from '../types/finance';
import { Search, Filter, Download, Plus, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { exportToCSV } from '../utils/csvParser';

interface TransactionsTableProps {
  transactions: Transaction[];
  anomalies: SpendingAnomaly[];
  onCategoryChange: (id: string, newCategory: string) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
}

const ALL_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing & Utilities',
  'Education',
  'Entertainment & Subs',
  'Shopping & Retail',
  'Health & Wellness',
  'Travel',
  'Income & Salary',
  'Financial & Transfers',
  'Other / Miscellaneous'
];

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  anomalies,
  onCategoryChange,
  onDeleteTransaction,
  onOpenAddModal
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const anomalyMap = useMemo(() => {
    const map = new Map<string, SpendingAnomaly>();
    anomalies.forEach(a => map.set(a.id, a));
    return map;
  }, [anomalies]);

  // Extract distinct months
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => {
      if (t.date && t.date.length >= 7) {
        set.add(t.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch =
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        t.amount.toString().includes(search);

      const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;

      const matchesType =
        typeFilter === 'all' ||
        (typeFilter === 'income' && t.amount > 0) ||
        (typeFilter === 'expense' && t.amount < 0);

      const matchesMonth =
        selectedMonth === 'all' || (t.date && t.date.startsWith(selectedMonth));

      return matchesSearch && matchesCat && matchesType && matchesMonth;
    });
  }, [transactions, search, selectedCategory, typeFilter, selectedMonth]);

  const handleExportCSV = () => {
    const exportData = filtered.map(t => ({
      Date: t.date,
      Description: t.description,
      Amount: t.amount,
      Category: t.category,
      Confidence: t.categoryConfidence ? `${(t.categoryConfidence * 100).toFixed(0)}%` : 'Manual'
    }));
    exportToCSV(exportData, `transactions_filtered_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Controls & Filter Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search description, amount..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">All Categories</option>
            {ALL_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
          >
            <option value="all">All Months</option>
            {availableMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Type Segmented buttons */}
          <div className="flex items-center p-0.5 bg-slate-200 rounded-lg text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                typeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                typeFilter === 'expense' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                typeFilter === 'income' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            title="Export filtered transactions to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Transactions Count & Ledger Header */}
      <div className="px-4 py-2 bg-slate-50 text-xs text-slate-500 border-b border-slate-200 flex justify-between items-center">
        <span>Showing {filtered.length} of {transactions.length} recorded transactions</span>
        <span className="font-mono text-slate-700">Python automated rule categorizer active</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600 bg-white">
              <th className="py-3 px-4 w-28">Date</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 w-48">Category (Auto & Editable)</th>
              <th className="py-3 px-4 text-right w-32">Amount</th>
              <th className="py-3 px-4 text-center w-28">Flag</th>
              <th className="py-3 px-4 text-right w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No transactions match the selected filters.
                </td>
              </tr>
            ) : (
              filtered.map(t => {
                const isIncome = t.amount > 0;
                const anomaly = anomalyMap.get(t.id);

                return (
                  <tr
                    key={t.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      anomaly ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    {/* Date */}
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {t.date}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{t.description}</span>
                        {t.isCustom && (
                          <span className="text-[10px] text-slate-600 font-mono">
                            imported
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category Selector */}
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={t.category}
                          onChange={e => onCategoryChange(t.id, e.target.value)}
                          className="w-full py-1 px-2 text-xs bg-white border border-slate-200 rounded-md text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        >
                          {ALL_CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        {t.categoryConfidence && t.categoryConfidence >= 0.85 && (
                          <span
                            title={`Python rule-matched with ${(t.categoryConfidence * 100).toFixed(0)}% confidence`}
                            className="shrink-0 text-emerald-600 cursor-help"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right font-mono font-semibold whitespace-nowrap">
                      <span className={isIncome ? 'text-emerald-600' : 'text-slate-900'}>
                        {isIncome ? '+' : '-'}${Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Flag / Anomaly */}
                    <td className="py-3 px-4 text-center">
                      {anomaly ? (
                        <div
                          className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-amber-700 cursor-help"
                          title={anomaly.reason}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Spike</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">·</span>
                      )}
                    </td>

                    {/* Delete Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete transaction"
                        aria-label="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
