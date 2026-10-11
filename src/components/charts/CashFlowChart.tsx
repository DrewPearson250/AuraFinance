import React, { useState } from 'react';
import { MonthlyTrend } from '../../types/finance';

interface CashFlowChartProps {
  data: MonthlyTrend[];
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-sm text-slate-400">No monthly cash flow data available.</div>;
  }

  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expenses))) * 1.15 || 5000;
  
  // Chart dimensions
  const height = 240;
  const paddingBottom = 32;
  const paddingTop = 20;
  const chartHeight = height - paddingBottom - paddingTop;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Cash Flow & Monthly Savings</h3>
          <p className="text-xs text-slate-500">Monthly income vs expenses and net savings trend</p>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
            <span className="text-slate-600">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-400"></span>
            <span className="text-slate-600">Expenses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-blue-600"></span>
            <span className="text-slate-600">Net Savings</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${data.length * 100} ${height}`}
          className="w-full h-56 overflow-visible"
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = paddingTop + chartHeight * (1 - pct);
            const val = maxVal * pct;
            return (
              <g key={i}>
                <line
                  x1="0"
                  y1={y}
                  x2={data.length * 100}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y={y - 4}
                  fill="#94a3b8"
                  fontSize="9"
                  className="font-mono"
                >
                  ${Math.round(val).toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Bars & Lines */}
          {data.map((d, idx) => {
            const groupX = idx * 100;
            const incH = (d.income / maxVal) * chartHeight;
            const expH = (d.expenses / maxVal) * chartHeight;
            const incY = paddingTop + (chartHeight - incH);
            const expY = paddingTop + (chartHeight - expH);
            const isHovered = hoverIndex === idx;

            return (
              <g
                key={d.month}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer"
              >
                {/* Background hover column */}
                <rect
                  x={groupX + 5}
                  y={paddingTop}
                  width="90"
                  height={chartHeight}
                  fill={isHovered ? 'rgba(241, 245, 249, 0.6)' : 'transparent'}
                  rx="4"
                />

                {/* Income Bar */}
                <rect
                  x={groupX + 22}
                  y={incY}
                  width="24"
                  height={Math.max(incH, 2)}
                  fill="#059669"
                  rx="2"
                  className="transition-all duration-200"
                />

                {/* Expenses Bar */}
                <rect
                  x={groupX + 52}
                  y={expY}
                  width="24"
                  height={Math.max(expH, 2)}
                  fill="#94a3b8"
                  rx="2"
                  className="transition-all duration-200"
                />

                {/* Month label */}
                <text
                  x={groupX + 49}
                  y={height - 8}
                  textAnchor="middle"
                  fill={isHovered ? '#0f172a' : '#64748b'}
                  fontSize="11"
                  fontWeight={isHovered ? '600' : '400'}
                  className="font-mono transition-colors"
                >
                  {d.month}
                </text>
              </g>
            );
          })}

          {/* Net Savings Trend Line */}
          {data.length > 1 && (
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={data
                .map((d, i) => {
                  const x = i * 100 + 49;
                  const netH = (Math.max(d.netSavings, 0) / maxVal) * chartHeight;
                  const y = paddingTop + (chartHeight - netH);
                  return `${x},${y}`;
                })
                .join(' ')}
            />
          )}

          {/* Dots on Net Savings Line */}
          {data.map((d, i) => {
            const x = i * 100 + 49;
            const netH = (Math.max(d.netSavings, 0) / maxVal) * chartHeight;
            const y = paddingTop + (chartHeight - netH);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={hoverIndex === i ? '5' : '3.5'}
                fill="#ffffff"
                stroke="#2563eb"
                strokeWidth="2.5"
              />
            );
          })}
        </svg>

        {/* Hover Detail Tooltip */}
        {hoverIndex !== null && data[hoverIndex] && (
          <div
            className="absolute -top-3 transform -translate-y-full bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs z-20 pointer-events-none transition-all duration-150"
            style={{
              left: `${((hoverIndex * 100 + 50) / (data.length * 100)) * 100}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-1.5 flex justify-between gap-4">
              <span>{data[hoverIndex].month}</span>
              <span className="font-mono text-emerald-400">Rate: {data[hoverIndex].savingsRate}%</span>
            </div>
            <div className="space-y-1 font-mono">
              <div className="flex justify-between gap-4 text-slate-300">
                <span>Inflow (Income):</span>
                <span className="text-emerald-400 font-semibold">+${data[hoverIndex].income.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-300">
                <span>Outflow (Expenses):</span>
                <span className="text-slate-300">-${data[hoverIndex].expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-100 font-bold pt-1 border-t border-slate-800">
                <span>Net Savings:</span>
                <span className="text-blue-400">+${data[hoverIndex].netSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
