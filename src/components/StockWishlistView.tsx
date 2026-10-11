import React, { useState } from 'react';
import { WishlistItem } from '../types/finance';
import { 
  Search, 
  Plus, 
  Trash2, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingBag,
  ExternalLink,
  Edit2,
  Check
} from 'lucide-react';
import { exportToCSV } from '../utils/csvParser';

import { fetchStockQuote } from '../services/marketData';

interface StockWishlistViewProps {
  wishlist: WishlistItem[];
  onAddWishlistItem: (item: WishlistItem) => void;
  onUpdateWishlistItem: (id: string, updates: Partial<WishlistItem>) => void;
  onDeleteWishlistItem: (id: string) => void;
  onPromoteToPortfolio: (item: WishlistItem, shares: number, buyPrice: number) => void;
  onOpenAddModal: () => void;
}

export const StockWishlistView: React.FC<StockWishlistViewProps> = ({
  wishlist,
  onUpdateWishlistItem,
  onDeleteWishlistItem,
  onPromoteToPortfolio,
  onOpenAddModal
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'buyZone' | 'highPriority'>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  // Promote dialog state
  const [promotingItem, setPromotingItem] = useState<WishlistItem | null>(null);
  const [promoteShares, setPromoteShares] = useState('10');
  const [promotePrice, setPromotePrice] = useState('');

  // Inline editing target price
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTargetPrice, setEditTargetPrice] = useState('');

  // Refresh all quotes via live service
  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      for (const item of wishlist) {
        try {
          const data = await fetchStockQuote(item.ticker);
          onUpdateWishlistItem(item.id, {
            currentPrice: data.price,
            dayChangePct: data.changePct
          });
        } catch (e) {
          console.error(e);
        }
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Metrics
  const inBuyZoneCount = wishlist.filter(item => item.currentPrice <= item.targetBuyPrice).length;
  const highPriorityCount = wishlist.filter(item => item.priority === 'High').length;

  // Filtered items
  const filtered = wishlist.filter(item => {
    const matchesSearch = 
      item.ticker.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.notes || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'buyZone') {
      return item.currentPrice <= item.targetBuyPrice;
    }
    if (filter === 'highPriority') {
      return item.priority === 'High';
    }
    return true;
  });

  const handleStartPromote = (item: WishlistItem) => {
    setPromotingItem(item);
    setPromoteShares('10');
    setPromotePrice(item.currentPrice.toFixed(2));
  };

  const handleConfirmPromote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promotingItem) return;
    const shares = parseFloat(promoteShares);
    const price = parseFloat(promotePrice) || promotingItem.currentPrice;
    if (isNaN(shares) || shares <= 0 || isNaN(price) || price <= 0) return;

    onPromoteToPortfolio(promotingItem, shares, price);
    setPromotingItem(null);
  };

  const handleSaveInlineTarget = (id: string) => {
    const val = parseFloat(editTargetPrice);
    if (!isNaN(val) && val > 0) {
      onUpdateWishlistItem(id, { targetBuyPrice: val });
    }
    setEditingId(null);
  };

  const handleExportWishlist = () => {
    const data = wishlist.map(w => ({
      Ticker: w.ticker,
      Name: w.name,
      CurrentPrice: w.currentPrice,
      TargetBuyPrice: w.targetBuyPrice,
      Status: w.currentPrice <= w.targetBuyPrice ? 'IN BUY ZONE' : 'WAITING FOR DIP',
      Priority: w.priority,
      Sector: w.sector,
      Notes: w.notes || ''
    }));
    exportToCSV(data, `stock_wishlist_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Watchlist Coverage</span>
            <span className="font-mono text-slate-700">{wishlist.length} Assets</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {wishlist.length} Tickers
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Target prices and acquisition theses monitored
          </p>
        </div>

        <div className={`p-5 rounded-xl border shadow-xs transition-colors ${
          inBuyZoneCount > 0 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>In Buy Zone (Target Reached)</span>
            <span className="font-mono text-emerald-700 font-semibold">{inBuyZoneCount} Ready</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800 tracking-tight">
            {inBuyZoneCount}
          </div>
          <p className="text-xs text-emerald-700 mt-2">
            Current price has pulled back to or below target buy price
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>High Priority Catalysts</span>
            <span className="font-mono text-slate-700">{highPriorityCount} High</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {highPriorityCount}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Prime candidates queued for immediate portfolio allocation
          </p>
        </div>

      </div>

      {/* Wishlist Ledger & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search Box */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search wishlist tickers, notes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center p-0.5 bg-slate-200 rounded-lg text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({wishlist.length})
              </button>
              <button
                onClick={() => setFilter('buyZone')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  filter === 'buyZone' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Buy Zone ({inBuyZoneCount})
              </button>
              <button
                onClick={() => setFilter('highPriority')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  filter === 'highPriority' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                High Priority ({highPriorityCount})
              </button>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshAll}
              disabled={refreshing}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              title="Query Live Market API for latest ticker quotes"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Quotes'}</span>
            </button>
            <button
              onClick={handleExportWishlist}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Wishlist</span>
            </button>
          </div>
        </div>

        {/* Table Header Note */}
        <div className="px-4 py-2 bg-slate-50 text-xs text-slate-500 border-b border-slate-200 flex justify-between items-center">
          <span>Tracking {filtered.length} target acquisition candidates</span>
          <span className="font-mono text-slate-700">Click Target Price to edit inline</span>
        </div>

        {/* Wishlist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600 bg-white">
                <th className="py-3 px-4">Asset / Ticker</th>
                <th className="py-3 px-4 text-right">Market Price</th>
                <th className="py-3 px-4 text-right">Target Buy Price</th>
                <th className="py-3 px-4 text-center">Status / Gap</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4">Acquisition Thesis & Notes</th>
                <th className="py-3 px-4 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                    No wishlist stocks match your current filter. Click &quot;Add to Wishlist&quot; to begin tracking.
                  </td>
                </tr>
              ) : (
                filtered.map(item => {
                  const isBuyZone = item.currentPrice <= item.targetBuyPrice;
                  const deltaPct = ((item.currentPrice - item.targetBuyPrice) / item.targetBuyPrice) * 100;
                  const isEditing = editingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isBuyZone ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      {/* Asset / Ticker */}
                      <td className="py-3 px-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {item.ticker}
                          </span>
                          <span className="text-slate-500 text-xs truncate max-w-[150px]">
                            {item.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {item.assetClass} · {item.sector}
                        </div>
                      </td>

                      {/* Current Price */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-slate-900">
                          ${item.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {item.dayChangePct !== undefined && (
                          <div className={`text-[11px] flex items-center justify-end ${
                            item.dayChangePct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {item.dayChangePct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            <span>{item.dayChangePct >= 0 ? '+' : ''}{item.dayChangePct.toFixed(2)}%</span>
                          </div>
                        )}
                      </td>

                      {/* Target Buy Price (Editable) */}
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-slate-400">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editTargetPrice}
                              onChange={e => setEditTargetPrice(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleSaveInlineTarget(item.id)}
                              className="w-20 px-1.5 py-0.5 text-xs border border-slate-300 rounded font-mono text-right"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveInlineTarget(item.id)}
                              className="p-1 text-emerald-600 hover:text-emerald-800"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setEditTargetPrice(item.targetBuyPrice.toString());
                            }}
                            className="font-semibold text-slate-800 hover:text-slate-950 hover:underline flex items-center justify-end gap-1 ml-auto group"
                            title="Click to edit target price"
                          >
                            <span>${item.targetBuyPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )}
                      </td>

                      {/* Status / Gap */}
                      <td className="py-3 px-4 text-center">
                        {isBuyZone ? (
                          <div className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>BUY ZONE ({Math.abs(deltaPct).toFixed(1)}% under)</span>
                          </div>
                        ) : (
                          <div className="font-mono text-[11px] text-slate-500">
                            +{deltaPct.toFixed(1)}% away
                          </div>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 text-center font-sans">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          item.priority === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : item.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.priority}
                        </span>
                      </td>

                      {/* Notes / Thesis */}
                      <td className="py-3 px-4 font-sans text-xs text-slate-600 max-w-xs">
                        <p className="line-clamp-2">{item.notes || 'No thesis notes added.'}</p>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStartPromote(item)}
                            className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded transition-colors"
                            title="Buy & Promote to Portfolio Holding"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteWishlistItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Promote to Portfolio Modal */}
      {promotingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Buy & Allocate into Portfolio
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Transfer <strong className="text-slate-800">{promotingItem.ticker}</strong> ({promotingItem.name}) from wishlist into your active investment portfolio.
            </p>

            <form onSubmit={handleConfirmPromote} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Shares to Purchase</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={promoteShares}
                  onChange={e => setPromoteShares(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Execution Buy Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={promotePrice}
                  onChange={e => setPromotePrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2 text-xs font-mono text-slate-500">
                Total Basis: ${(parseFloat(promoteShares || '0') * parseFloat(promotePrice || '0')).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPromotingItem(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Execute Buy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
