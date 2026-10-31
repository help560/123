import React from 'react';
import { MonthlyTrendItem } from '../types';
import { TrendingUp, TrendingDown, Calendar, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';

interface MonthlyComparisonChartProps {
  data: MonthlyTrendItem[];
  selectedMonth?: string;
  onSelectMonth?: (monthKey: string) => void;
}

export const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({
  data,
  selectedMonth,
  onSelectMonth,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="min-h-[220px] flex items-center justify-center text-xs text-[#8C7A6B]">
        Sin datos históricos suficientes para comparar meses
      </div>
    );
  }

  // Find max monthly total to scale the bars nicely
  const maxTotal = Math.max(...data.map(d => d.total), 1);

  // Peak month
  const peakMonth = [...data].sort((a, b) => b.total - a.total)[0];
  const totalActivas = data.reduce((acc, d) => acc + d.activas, 0);
  const totalCanceladas = data.reduce((acc, d) => acc + d.canceladas, 0);
  const overallRetentionRate = data.reduce((acc, d) => acc + d.total, 0) > 0
    ? Math.round((totalActivas / (totalActivas + totalCanceladas)) * 100)
    : 100;

  return (
    <div className="w-full bg-[#FFFFFF] rounded-2xl p-5 sm:p-6 border border-[#E8E4DD] shadow-xs flex flex-col justify-between min-h-[320px]">
      {/* Header & Meta Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0ECE1]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#F5F1E8] text-[#1A1A1A]">
              <BarChart3 className="w-4 h-4 text-[#8C7A6B]" />
            </span>
            <h3 className="font-serif-luxury text-lg font-bold text-[#1A1A1A] tracking-tight">
              Evolución Mensual & Comparativa de Reservas
            </h3>
          </div>
          <p className="text-xs text-[#7A6E5D] mt-0.5">
            Volumen de clases activas vs. cancelaciones y tasa de variación intermensual
          </p>
        </div>

        {/* Executive Highlights Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-[#FDFBF7] border border-[#E8E4DD] flex items-center gap-1.5">
            <span className="text-[#8C7A6B] text-[11px]">Mes Pico:</span>
            <strong className="text-[#1A1A1A] font-semibold">{peakMonth?.label || 'N/A'}</strong>
            <span className="text-[11px] text-[#2E7D32] font-mono-numbers">({peakMonth?.total} res.)</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#FDFBF7] border border-[#E8E4DD] flex items-center gap-1.5">
            <span className="text-[#8C7A6B] text-[11px]">Tasa de Asistencia:</span>
            <strong className="text-[#2E7D32] font-mono-numbers font-bold">{overallRetentionRate}%</strong>
          </div>
        </div>
      </div>

      {/* Visual Bar Comparison Chart */}
      <div className="py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end min-h-[170px]">
          {data.map((item) => {
            const isSelected = selectedMonth === item.monthKey;
            const barHeightPct = Math.max(Math.round((item.total / maxTotal) * 100), 12);
            const activePct = item.total > 0 ? (item.activas / item.total) * 100 : 100;
            const cancelPct = item.total > 0 ? (item.canceladas / item.total) * 100 : 0;

            return (
              <div
                key={item.monthKey}
                onClick={() => onSelectMonth && onSelectMonth(item.monthKey)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectMonth && onSelectMonth(item.monthKey);
                  }
                }}
                className={`group flex flex-col items-center justify-end p-3 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#F5F1E8]/70 border-[#1A1A1A] shadow-xs'
                    : 'bg-[#FDFBF7] hover:bg-[#F5F1E8]/40 border-[#E8E4DD]'
                }`}
              >
                {/* Growth Badge on Top */}
                <div className="mb-2 h-6 flex items-center justify-center">
                  {item.growthRate !== undefined ? (
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.growthRate >= 0
                          ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                          : 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]'
                      }`}
                      title={`Variación respecto al mes anterior: ${item.growthRate}%`}
                    >
                      {item.growthRate >= 0 ? (
                        <TrendingUp className="w-2.5 h-2.5" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5" />
                      )}
                      <span>{item.growthRate >= 0 ? `+${item.growthRate}%` : `${item.growthRate}%`}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#A8A092] font-medium">Inicio</span>
                  )}
                </div>

                {/* Total Counter */}
                <div className="text-center mb-1.5">
                  <span className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#1A1A1A] leading-none">
                    {item.total}
                  </span>
                  <span className="block text-[10px] text-[#8C7A6B] font-medium">reservas</span>
                </div>

                {/* Vertical Segmented Bar */}
                <div 
                  className="w-12 sm:w-16 bg-[#EAE5D9]/50 rounded-lg overflow-hidden flex flex-col justify-end transition-all duration-300 relative group-hover:opacity-95"
                  style={{ height: `${barHeightPct * 1.1}px`, minHeight: '36px' }}
                >
                  {/* Cancelled Top Segment */}
                  {item.canceladas > 0 && (
                    <div
                      style={{ height: `${cancelPct}%` }}
                      className="w-full bg-[#E57373] hover:bg-[#D32F2F] transition-all relative flex items-center justify-center"
                      title={`${item.canceladas} canceladas (${item.tasaCancelacion}%)`}
                    >
                      {cancelPct > 18 && (
                        <span className="text-[9px] text-white font-mono-numbers font-bold">
                          {item.canceladas}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Active Bottom Segment */}
                  <div
                    style={{ height: `${activePct}%` }}
                    className={`w-full transition-all flex items-center justify-center ${
                      isSelected ? 'bg-[#1A1A1A]' : 'bg-[#38332B]'
                    }`}
                    title={`${item.activas} reservas activas`}
                  >
                    {activePct > 20 && (
                      <span className="text-[10px] text-[#FDFBF7] font-mono-numbers font-semibold">
                        {item.activas}
                      </span>
                    )}
                  </div>
                </div>

                {/* Month Label */}
                <span className="mt-3 text-xs font-semibold text-[#1A1A1A] text-center">
                  {item.label}
                </span>

                {/* Mini Cancellation Rate Indicator */}
                <span className={`text-[10px] mt-0.5 font-mono-numbers ${
                  item.canceladas > 0 ? 'text-[#C62828] font-semibold' : 'text-[#8C7A6B]'
                }`}>
                  {item.canceladas > 0 ? `${item.canceladas} canc. (${item.tasaCancelacion}%)` : '0 canc.'}
                </span>

                {isSelected && (
                  <span className="absolute -bottom-2 px-2 py-0.5 bg-[#1A1A1A] text-white text-[9px] font-bold rounded-full">
                    Activo
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Explanatory Footer */}
      <div className="pt-3 border-t border-[#F0ECE1] flex flex-wrap items-center justify-between gap-3 text-xs text-[#7A6E5D]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#38332B]" />
            <span className="font-medium text-[#4A453B]">Reservas Activas ({totalActivas})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#E57373]" />
            <span className="font-medium text-[#C62828]">Canceladas ({totalCanceladas})</span>
          </div>
        </div>

        <p className="text-[11px] text-[#8C7A6B] italic">
          Haz clic en cualquier mes para filtrar automáticamente el tablero
        </p>
      </div>
    </div>
  );
};
