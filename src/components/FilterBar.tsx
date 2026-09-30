import React from 'react';
import { FilterState } from '../types';
import { Search, X, Filter, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  coaches: string[];
  disciplinas: string[];
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  coaches,
  disciplinas,
  totalResults,
}) => {
  const hasActiveFilters = 
    filters.search !== '' ||
    filters.disciplina !== '' ||
    filters.coach !== '' ||
    filters.recordatorio !== 'all' ||
    filters.fechaInicio !== '' ||
    filters.fechaFin !== '';

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E4DD] shadow-xs mb-6 space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Buscar por cliente, correo, teléfono o clase..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#FDFBF7] border border-[#E8E4DD] rounded-xl text-xs sm:text-sm text-[#1A1A1A] placeholder-[#9A9080] focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#1A1A1A]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* Disciplina Selector */}
          <select
            value={filters.disciplina}
            onChange={(e) => onFilterChange({ disciplina: e.target.value })}
            className="px-3 py-2 bg-[#FDFBF7] border border-[#E8E4DD] rounded-xl text-xs font-semibold text-[#4A453B] focus:outline-none focus:border-[#1A1A1A]"
          >
            <option value="">Todas las Disciplinas</option>
            {disciplinas.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Coach Selector */}
          <select
            value={filters.coach}
            onChange={(e) => onFilterChange({ coach: e.target.value })}
            className="px-3 py-2 bg-[#FDFBF7] border border-[#E8E4DD] rounded-xl text-xs font-semibold text-[#4A453B] focus:outline-none focus:border-[#1A1A1A]"
          >
            <option value="">Todas las Coaches</option>
            {coaches.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Recordatorio Status Selector */}
          <select
            value={filters.recordatorio}
            onChange={(e) => onFilterChange({ recordatorio: e.target.value as any })}
            className="px-3 py-2 bg-[#FDFBF7] border border-[#E8E4DD] rounded-xl text-xs font-semibold text-[#4A453B] focus:outline-none focus:border-[#1A1A1A]"
          >
            <option value="all">Recordatorios: Todos</option>
            <option value="enviado">Recordatorio: Enviado</option>
            <option value="pendiente">Recordatorio: Pendiente</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              type="button"
              className="px-3 py-2 text-xs font-semibold text-[#C62828] hover:text-[#B71C1C] bg-[#FFEBEE] hover:bg-[#FFCDD2] rounded-xl border border-[#FFCDD2] transition-all flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </button>
          )}

        </div>

      </div>

      {/* Result Counter & Active Tags */}
      <div className="flex items-center justify-between text-xs text-[#7A6E5D] pt-1 border-t border-[#F0ECE1]">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#8C7A6B]" />
          <span>Mostrando <strong className="text-[#1A1A1A] font-mono-numbers">{totalResults}</strong> reservas</span>
        </div>

        {hasActiveFilters && (
          <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
            <span className="font-medium text-[#8C7A6B]">Filtros activos</span>
          </div>
        )}
      </div>
    </div>
  );
};
