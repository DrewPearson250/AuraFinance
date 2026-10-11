import React, { useState } from 'react';
import { Transaction } from '../../types/finance';
import { categorizeClientSide } from '../../utils/clientAnalytics';
import { X, Check } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Transaction) => void;
}

const CATEGORIES = [
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

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [isExpense, setIsExpense] = useState(true);
  const [category, setCategory] = useState('Food & Dining');

  if (!isOpen) return null;

  // Auto-predict category as user types description
  const handleDescChange = (val: string) => {
    setDescription(val);
    const amt = parseFloat(amountStr) || (isExpense ? -10 : 10);
    const predicted = categorizeClientSide(val, isExpense ? -Math.abs(amt) : Math.abs(amt));
    if (predicted.confidence > 0.8) {
      setCategory(predicted.category);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmt = parseFloat(amountStr);
    if (!description.trim() || isNaN(rawAmt) || rawAmt <= 0) return;

    const finalAmount = isExpense ? -Math.abs(rawAmt) : Math.abs(rawAmt);
    const auto = categorizeClientSide(description, finalAmount);

    onAddTransaction({
      id: `tx-user-${Date.now()}`,
      date,
      description: description.trim(),
      amount: finalAmount,
      category,
      categoryConfidence: auto.category === category ? auto.confidence : 1.0,
      isCustom: true
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-base font-bold text-slate-900">Add New Transaction</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Type Toggle: Expense vs Income */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => {
                setIsExpense(true);
                if (category === 'Income & Salary') setCategory('Food & Dining');
              }}
              className={`flex-1 py-1.5 font-semibold rounded-md transition-colors ${
                isExpense ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsExpense(false);
                setCategory('Income & Salary');
              }}
              className={`flex-1 py-1.5 font-semibold rounded-md transition-colors ${
                !isExpense ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Income (+)
            </button>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description / Merchant</label>
            <input
              type="text"
              required
              placeholder="e.g. Whole Foods Market, Uber, Coursera"
              value={description}
              onChange={e => handleDescChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Amount ($ USD)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amountStr}
              onChange={e => setAmountStr(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Category (Rule Auto-Detected)
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-slate-900"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Save Transaction</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
