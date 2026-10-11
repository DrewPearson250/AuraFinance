import React from 'react';

interface AllocationItem {
  name: string;
  value: number;
  percentage: number;
}

interface AllocationChartProps {
  assetAllocation: AllocationItem[];
  sectorAllocation: AllocationItem[];
  totalValue: number;
}

const COLOR_PALETTE = [
  '#0f766e', // Teal
  '#2563eb', // Blue
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#dc2626', // Red
  '#475569', // Slate
  '#059669', // Emerald
  '#ea580c'  // Orange
];

export const AllocationChart: React.FC<AllocationChartProps> = ({
  assetAllocation,
  sectorAllocation,
  totalValue
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Asset Class Allocation */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Asset Class Allocation</h4>
            <p className="text-xs text-slate-500">Distribution across instrument categories</p>
          </div>
          <span className="font-mono text-xs font-semibold text-slate-700">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* Stacked Segmented Progress Bar */}
        <div className="h-4 w-full bg-slate-100 rounded-md overflow-hidden flex mb-4">
          {assetAllocation.map((item, idx) => (
            <div
              key={item.name}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: COLOR_PALETTE[idx % COLOR_PALETTE.length]
              }}
              title={`${item.name}: ${item.percentage}% ($${item.value.toLocaleString()})`}
              className="h-full transition-all duration-300 relative group cursor-pointer"
            />
          ))}
        </div>

        {/* Breakdown List */}
        <div className="space-y-2">
          {assetAllocation.map((item, idx) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: COLOR_PALETTE[idx % COLOR_PALETTE.length] }}
                />
                <span className="text-slate-700 font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-slate-900 font-semibold">${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-slate-600 w-12 text-right">{item.percentage.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sector Allocation */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Sector Exposure</h4>
            <p className="text-xs text-slate-500">Concentration across economic sectors</p>
          </div>
          <span className="font-mono text-xs text-slate-700">{sectorAllocation.length} Sectors</span>
        </div>

        {/* Stacked Segmented Progress Bar */}
        <div className="h-4 w-full bg-slate-100 rounded-md overflow-hidden flex mb-4">
          {sectorAllocation.map((item, idx) => (
            <div
              key={item.name}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: COLOR_PALETTE[(idx + 2) % COLOR_PALETTE.length]
              }}
              title={`${item.name}: ${item.percentage}% ($${item.value.toLocaleString()})`}
              className="h-full transition-all duration-300 relative group cursor-pointer"
            />
          ))}
        </div>

        {/* Breakdown List */}
        <div className="space-y-2">
          {sectorAllocation.slice(0, 6).map((item, idx) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: COLOR_PALETTE[(idx + 2) % COLOR_PALETTE.length] }}
                />
                <span className="text-slate-700 font-medium truncate max-w-[140px] sm:max-w-[180px]">{item.name}</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-slate-900 font-semibold">${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-slate-600 w-12 text-right">{item.percentage.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
