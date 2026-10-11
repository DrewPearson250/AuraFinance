import React, { useState } from 'react';
import { Transaction, Investment } from '../../types/finance';
import { parseTransactionsCSV, parseInvestmentsCSV } from '../../utils/csvParser';
import { SAMPLE_TRANSACTIONS_CSV, SAMPLE_INVESTMENTS_CSV } from '../../data/sampleFinancialData';
import { categorizeClientSide } from '../../utils/clientAnalytics';
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTransactions: (transactions: Transaction[], replace: boolean) => void;
  onImportInvestments: (investments: Investment[], replace: boolean) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportTransactions,
  onImportInvestments
}) => {
  const [importType, setImportType] = useState<'transactions' | 'investments'>('transactions');
  const [csvContent, setCsvContent] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text || '');
      setPreviewError(null);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    if (importType === 'transactions') {
      setCsvContent(SAMPLE_TRANSACTIONS_CSV);
    } else {
      setCsvContent(SAMPLE_INVESTMENTS_CSV);
    }
    setPreviewError(null);
  };

  const handleConfirmImport = () => {
    if (!csvContent.trim()) {
      setPreviewError('Please paste or upload CSV data first.');
      return;
    }

    if (importType === 'transactions') {
      const { transactions, errors } = parseTransactionsCSV(csvContent);
      if (errors.length > 0) {
        setPreviewError(errors.join(' '));
        return;
      }
      // Apply automatic categorization for unassigned categories
      const categorized = transactions.map(t => {
        if (!t.category || t.category === 'Uncategorized') {
          const auto = categorizeClientSide(t.description, t.amount);
          return { ...t, category: auto.category, categoryConfidence: auto.confidence };
        }
        return t;
      });
      onImportTransactions(categorized, replaceExisting);
      onClose();
    } else {
      const { investments, errors } = parseInvestmentsCSV(csvContent);
      if (errors.length > 0) {
        setPreviewError(errors.join(' '));
        return;
      }
      onImportInvestments(investments, replaceExisting);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Import Financial Data from CSV</h3>
            <p className="text-xs text-slate-500">
              Upload bank exports or investment spreadsheets with automatic column mapping
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Import Target Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => {
                setImportType('transactions');
                setPreviewError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                importType === 'transactions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Transactions CSV (Expenses & Income)
            </button>
            <button
              onClick={() => {
                setImportType('investments');
                setPreviewError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                importType === 'investments'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Investments CSV (Holdings & Shares)
            </button>
          </div>

          {/* File Upload & Load Sample Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <label className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Choose CSV File from Device</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handleLoadSample}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Insert Sample CSV Template</span>
            </button>
          </div>

          {/* Paste Raw CSV Area */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Paste or Edit Raw CSV Text:
            </label>
            <textarea
              value={csvContent}
              onChange={e => {
                setCsvContent(e.target.value);
                setPreviewError(null);
              }}
              rows={8}
              placeholder={
                importType === 'transactions'
                  ? 'Date,Description,Amount,Category\n2026-10-01,Tech Corp Payroll,4850.00,Income & Salary\n2026-10-02,Rent Payment,-1950.00,Housing'
                  : 'Ticker,Name,Shares,BuyPrice,CurrentPrice,AssetClass,Sector\nVOO,Vanguard S&P 500,45,440.00,524.80,ETFs,Broad Market'
              }
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800"
            />
          </div>

          {/* Error Banner */}
          {previewError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{previewError}</span>
            </div>
          )}

          {/* Merge vs Replace Checkbox */}
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <input
              type="checkbox"
              id="replaceData"
              checked={replaceExisting}
              onChange={e => setReplaceExisting(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="replaceData" className="cursor-pointer">
              Replace existing {importType} instead of appending to them
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Process & Import</span>
          </button>
        </div>

      </div>
    </div>
  );
};
