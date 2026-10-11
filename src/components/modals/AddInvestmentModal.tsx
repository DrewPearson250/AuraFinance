import React, { useState } from 'react';
import { Investment } from '../../types/finance';
import { X, Check, RefreshCw } from 'lucide-react';

import { fetchStockQuote } from '../../services/marketData';

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddInvestment: (investment: Investment) => void;
}

export const AddInvestmentModal: React.FC<AddInvestmentModalProps> = ({
  isOpen,
  onClose,
  onAddInvestment
}) => {
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [sharesStr, setSharesStr] = useState('');
  const [buyPriceStr, setBuyPriceStr] = useState('');
  const [currentPriceStr, setCurrentPriceStr] = useState('');
  const [assetClass, setAssetClass] = useState<Investment['assetClass']>('Stocks');
  const [sector, setSector] = useState('Technology');
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
      if (!buyPriceStr) setBuyPriceStr((data.price * 0.95).toFixed(2));
    } catch (e) {
      console.error('Failed to lookup price', e);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const shares = parseFloat(sharesStr);
    const buyPrice = parseFloat(buyPriceStr);
    const currentPrice = parseFloat(currentPriceStr) || buyPrice;

    if (!ticker.trim() || isNaN(shares) || shares <= 0 || isNaN(buyPrice)) return;

    onAddInvestment({
      id: `inv-${Date.now()}`,
      ticker: ticker.toUpperCase().trim(),
      name: name.trim() || `${ticker.toUpperCase().trim()} Holding`,
      shares,
      buyPrice,
      currentPrice,
      assetClass,
      sector
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-base font-bold text-slate-900">Add Investment Position</h3>
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
                placeholder="e.g. VOO, AAPL, NVDA, BTC"
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
              placeholder="e.g. Vanguard S&P 500 ETF, Apple Inc."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Shares & Buy Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Shares / Units</label>
              <input
                type="number"
                step="any"
                required
                placeholder="10"
                value={sharesStr}
                onChange={e => setSharesStr(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Avg Buy Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="150.00"
                value={buyPriceStr}
                onChange={e => setBuyPriceStr(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Current Market Price */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Current Market Price ($ USD)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="175.50"
              value={currentPriceStr}
              onChange={e => setCurrentPriceStr(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Asset Class & Sector */}
          <div className="grid grid-cols-2 gap-3">
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
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Sector</label>
              <input
                type="text"
                placeholder="e.g. Technology, Broad Market"
                value={sector}
                onChange={e => setSector(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900"
              />
            </div>
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
              <span>Save Holding</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
