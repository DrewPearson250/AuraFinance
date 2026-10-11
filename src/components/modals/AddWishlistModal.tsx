import React, { useState } from 'react';
import { WishlistItem } from '../../types/finance';
import { X, Check, RefreshCw } from 'lucide-react';

import { fetchStockQuote } from '../../services/marketData';

interface AddWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWishlistItem: (item: WishlistItem) => void;
}

export const AddWishlistModal: React.FC<AddWishlistModalProps> = ({
  isOpen,
  onClose,
  onAddWishlistItem
}) => {
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [currentPriceStr, setCurrentPriceStr] = useState('');
  const [targetBuyPriceStr, setTargetBuyPriceStr] = useState('');
  const [priority, setPriority] = useState<WishlistItem['priority']>('High');
  const [assetClass, setAssetClass] = useState<WishlistItem['assetClass']>('Stocks');
  const [sector, setSector] = useState('Technology');
  const [notes, setNotes] = useState('');
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);

  if (!isOpen) return null;

  const handleLookupPrice = async () => {
    if (!ticker.trim()) return;
    setIsFetchingPrice(true);
    try {
      const data = await fetchStockQuote(ticker.toUpperCase().trim());
      setCurrentPriceStr(data.price.toFixed(2));
      if (!name) setName(data.name);
      if (data.assetClass) setAssetClass(data.assetClass);
      if (data.sector) setSector(data.sector);
      if (!targetBuyPriceStr) {
        setTargetBuyPriceStr((data.price * 0.90).toFixed(2));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currPrice = parseFloat(currentPriceStr);
    const targetPrice = parseFloat(targetBuyPriceStr);

    if (!ticker.trim() || isNaN(currPrice) || currPrice <= 0 || isNaN(targetPrice) || targetPrice <= 0) return;

    onAddWishlistItem({
      id: `wish-${Date.now()}`,
      ticker: ticker.toUpperCase().trim(),
      name: name.trim() || `${ticker.toUpperCase().trim()} Asset`,
      currentPrice: currPrice,
      targetBuyPrice: targetPrice,
      priority,
      assetClass,
      sector,
      notes: notes.trim(),
      addedDate: new Date().toISOString().split('T')[0]
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-base font-bold text-slate-900">Add Stock to Wishlist</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Ticker & Live Fetch */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Symbol / Ticker
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. TSLA, NVDA, AMZN, PLTR"
                value={ticker}
                onChange={e => setTicker(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg uppercase font-mono focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={handleLookupPrice}
                disabled={isFetchingPrice || !ticker}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingPrice ? 'animate-spin' : ''}`} />
                <span>Fetch Price</span>
              </button>
            </div>
          </div>

          {/* Asset Name */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Asset Name</label>
            <input
              type="text"
              placeholder="e.g. Tesla Inc., Amazon.com"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Current Price & Target Buy Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Market Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="250.00"
                value={currentPriceStr}
                onChange={e => setCurrentPriceStr(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target Buy Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="220.00"
                value={targetBuyPriceStr}
                onChange={e => setTargetBuyPriceStr(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Priority & Class */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-slate-900"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Asset Class</label>
              <select
                value={assetClass}
                onChange={e => setAssetClass(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-slate-900"
              >
                <option value="Stocks">Stocks</option>
                <option value="ETFs">ETFs</option>
                <option value="Crypto">Crypto</option>
                <option value="Bonds">Bonds</option>
              </select>
            </div>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Sector</label>
            <input
              type="text"
              placeholder="e.g. Automotive & Clean Tech, E-commerce & Cloud"
              value={sector}
              onChange={e => setSector(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Notes / Thesis */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Acquisition Thesis & Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Wait for pullback to $220 support level before next earnings catalyst"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900"
            />
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
              <span>Add to Wishlist</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
