import React, { useState } from 'react';
import { ComparisonPoint } from '../../types/finance';

interface BenchmarkChartProps {
  data: ComparisonPoint[];
  portfolioReturnPct: number;
  benchmarkReturnPct: number;
  alpha: number;
}

export const BenchmarkChart: React.FC<BenchmarkChartProps> = ({
  data,
  portfolioReturnPct,
  benchmarkReturnPct,
  alpha
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-sm text-slate-400">No benchmark trajectory data available.</div>;
  }

  // Find min and max normalized values (e.g. 95 to 135)
  const allValues = data.flatMap(d => [d.portfolio, d.sp500, d.nasdaq]);
  const minVal = Math.floor(Math.min(...allValues) * 0.96);
  const maxVal = Math.ceil(Math.max(...allValues) * 1.04);
  const range = maxVal - minVal || 20;

  const width = 600;
  const height = 240;
  const paddingTop = 20;
  const paddingBottom = 32;
  const paddingLeft = 40;
  const paddingRight = 20;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const getX = (idx: number) => paddingLeft + (idx / (data.length - 1)) * plotWidth;
  const getY = (val: number) => paddingTop + (1 - (val - minVal) / range) * plotHeight;

  const portfolioPoints = data.map((d, i) => `${getX(i)},${getY(d.portfolio)}`).join(' ');
  const sp500Points = data.map((d, i) => `${getX(i)},${getY(d.sp500)}`).join(' ');
  const nasdaqPoints = data.map((d, i) => `${getX(i)},${getY(d.nasdaq)}`).join(' ');

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">Benchmark Outperformance Trajectory</h3>
            <span className={`text-xs font-mono font-medium ${alpha >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {alpha >= 0 ? `+${alpha.toFixed(1)}% Alpha` : `${alpha.toFixed(1)}% Alpha`}
            </span>
          </div>
          <p className="text-xs text-slate-500">Indexed return growth ($100 baseline) vs S&P 500 (SPY) and Nasdaq (QQQ)</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-emerald-600 rounded-full"></span>
            <span className="font-medium text-slate-900">Portfolio (+{portfolioReturnPct.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-blue-500 rounded-full"></span>
            <span className="text-slate-600">S&P 500 (+{benchmarkReturnPct.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-slate-400 rounded-full"></span>
            <span className="text-slate-500">Nasdaq 100</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 overflow-visible"
        >
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = paddingTop + plotHeight * (1 - pct);
            const val = minVal + range * pct;
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="9"
                  className="font-mono"
                >
                  ${Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* S&P 500 Line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="4 3"
            points={sp500Points}
          />

          {/* Nasdaq Line */}
          <polyline
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            points={nasdaqPoints}
          />

          {/* User Portfolio Line (bold highlight) */}
          <polyline
            fill="none"
            stroke="#059669"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={portfolioPoints}
          />

          {/* Vertical trigger bars & points */}
          {data.map((d, i) => {
            const x = getX(i);
            const yPort = getY(d.portfolio);
            const isHovered = hoverIndex === i;

            return (
              <g
                key={d.period}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer"
              >
                {/* Trigger column */}
                <rect
                  x={x - 18}
                  y={paddingTop}
                  width="36"
                  height={plotHeight}
                  fill="transparent"
                />

                {/* Vertical guide line on hover */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + plotHeight}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Portfolio dot */}
                <circle
                  cx={x}
                  cy={yPort}
                  r={isHovered ? '6' : '3.5'}
                  fill="#ffffff"
                  stroke="#059669"
                  strokeWidth="2.5"
                />

                {/* X axis labels */}
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  fill={isHovered ? '#0f172a' : '#64748b'}
                  fontSize="10"
                  fontWeight={isHovered ? '600' : '400'}
                  className="font-mono transition-colors"
                >
                  {d.period}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoverIndex !== null && data[hoverIndex] && (
          <div
            className="absolute -top-3 transform -translate-y-full bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs z-20 pointer-events-none transition-all duration-150"
            style={{
              left: `${(getX(hoverIndex) / width) * 100}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-1.5 flex justify-between gap-4">
              <span>{data[hoverIndex].period}</span>
              <span className="font-mono text-emerald-400">
                Index: ${data[hoverIndex].portfolio.toFixed(2)}
              </span>
            </div>
            <div className="space-y-1 font-mono">
              <div className="flex justify-between gap-4 text-emerald-400 font-semibold">
                <span>Your Portfolio:</span>
                <span>${data[hoverIndex].portfolio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4 text-blue-300">
                <span>S&P 500 (SPY):</span>
                <span>${data[hoverIndex].sp500.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-400">
                <span>Nasdaq 100 (QQQ):</span>
                <span>${data[hoverIndex].nasdaq.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
