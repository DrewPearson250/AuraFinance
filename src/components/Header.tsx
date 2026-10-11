import React, { useState } from 'react';
import { Upload, Plus, Download, Terminal, RefreshCw, Bookmark, Edit2, Check } from 'lucide-react';

interface HeaderProps {
  siteName: string;
  setSiteName: (name: string) => void;
  activeTab: 'overview' | 'expenses' | 'portfolio' | 'wishlist' | 'anomalies';
  setActiveTab: (tab: 'overview' | 'expenses' | 'portfolio' | 'wishlist' | 'anomalies') => void;
  anomalyCount: number;
  buyZoneCount: number;
  wishlistCount: number;
  onOpenImport: () => void;
  onOpenAddTx: () => void;
  onOpenAddInv: () => void;
  onOpenAddWishlist: () => void;
  onResetData: () => void;
  onExportData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  siteName,
  setSiteName,
  activeTab,
  setActiveTab,
  anomalyCount,
  buyZoneCount,
  wishlistCount,
  onOpenImport,
  onOpenAddTx,
  onOpenAddInv,
  onOpenAddWishlist,
  onResetData,
  onExportData
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(siteName);

  const handleSaveTitle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (tempTitle.trim()) {
      setSiteName(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark (with quick rename support) */}
          <div className="flex items-center gap-2 shrink-0">
            {isEditingTitle ? (
              <form onSubmit={handleSaveTitle} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={e => setTempTitle(e.target.value)}
                  onBlur={() => handleSaveTitle()}
                  autoFocus
                  className="px-2 py-1 text-sm font-bold border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  className="p-1 text-emerald-600 hover:text-emerald-800"
                >
                  <Check className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5 group">
                <button
                  onClick={() => setActiveTab('overview')}
                  className="text-left cursor-pointer"
                >
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-slate-800 transition-colors">
                      {siteName}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 font-semibold tracking-tight">
                      + Wishlist
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setTempTitle(siteName);
                    setIsEditingTitle(true);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Rename site"
                  aria-label="Rename site"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Zone 2: Navigation Links / Segmented Tabs */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'expenses'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expenses & Trends
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'portfolio'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Portfolio & Benchmarks
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'wishlist'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Stock Wishlist</span>
              {buyZoneCount > 0 ? (
                <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                  {buyZoneCount} Buy
                </span>
              ) : (
                <span className="font-mono text-[10px] text-slate-500">
                  ({wishlistCount})
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('anomalies')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors relative ${
                activeTab === 'anomalies'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Spending Anomalies</span>
              {anomalyCount > 0 && (
                <span className="ml-1.5 font-mono text-[11px] font-semibold text-rose-600">
                  ({anomalyCount})
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenImport}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              title="Import Transactions or Investments from CSV"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import CSV</span>
            </button>

            {activeTab === 'wishlist' ? (
              <button
                onClick={onOpenAddWishlist}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stock to Wishlist</span>
              </button>
            ) : activeTab === 'portfolio' ? (
              <button
                onClick={onOpenAddInv}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            ) : (
              <button
                onClick={onOpenAddTx}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Transaction</span>
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
              <button
                onClick={onExportData}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                title="Export Data & Python Script"
                aria-label="Export Data & Python Script"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={onResetData}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                title="Reset to Sample Financial Dataset"
                aria-label="Reset to Sample Financial Dataset"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'expenses' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'portfolio' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'wishlist' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            <span>Wishlist</span>
            {buyZoneCount > 0 && <span className="font-mono text-[10px] text-emerald-400 font-bold">({buyZoneCount})</span>}
          </button>
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'anomalies' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Anomalies ({anomalyCount})
          </button>
        </div>
      </div>
    </header>
  );
};
