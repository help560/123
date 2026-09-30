import React, { useState, useEffect } from 'react';
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
  // Local state for debounced search input (protects INP < 50ms)
  const [localSearch, setLocalSearch] = useState<string>(filters.search);

  // Sync from props if external reset happens
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  // Debounce user keystrokes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFilterChange({ search: localSearch });
      }
    }, 150);

    return () => clearTimeout(handler);
  }, [localSearch, filters.search, onFilterChange]);

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.disciplina !== '' ||
    filters.coach !== '' ||
    filters.recordatorio !== 'all' ||
    filters.fechaInicio !== '' ||
    filters.fechaFin !== '';

  const handleClearSearch = () => {
    setLocalSearch('');
    onFilterChange({ search: '' });
  };

  return (
    <div 
      role="toolbar" 
      aria-label="Filtros del cuadro de mando"
      className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-[#E8E4DD] dark:border-slate-800 shadow-xs mb-6 space-y-3 transition-all"
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search Bar with Accessible Label */}
        <div className="relative flex-1">
          <label htmlFor="filter-search-input" className="sr-only">
            Buscar por cliente, correo, teléfono o clase
          </label>
          <Search 
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A6B] dark:text-slate-400 pointer-events-none" 
            aria-hidden="true" 
          />
          <input
            id="filter-search-input"
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Buscar por cliente, correo, teléfono o clase..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#FDFBF7] dark:bg-slate-800/80 border border-[#E8E4DD] dark:border-slate-700 rounded-xl text-xs sm:text-sm text-[#1A1A1A] dark:text-slate-100 placeholder-[#9A9080] dark:placeholder-slate-400 focus:outline-none focus:border-[#1A1A1A] dark:focus:border-slate-400 focus:ring-1 focus:ring-[#1A1A1A] transition-all"
          />
          {localSearch && (
            <button
              onClick={handleClearSearch}
              type="button"
              aria-label="Borrar texto de búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#1A1A1A] dark:hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns with Accessible Labels */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* Disciplina Selector */}
          <div className="relative">
            <label htmlFor="filter-disciplina-select" className="sr-only">
              Filtrar por disciplina
            </label>
            <select
              id="filter-disciplina-select"
              value={filters.disciplina}
              onChange={(e) => onFilterChange({ disciplina: e.target.value })}
              className="px-3 py-2 bg-[#FDFBF7] dark:bg-slate-800/80 border border-[#E8E4DD] dark:border-slate-700 rounded-xl text-xs font-semibold text-[#4A453B] dark:text-slate-200 focus:outline-none focus:border-[#1A1A1A] cursor-pointer"
            >
              <option value="">Todas las Disciplinas</option>
              {disciplinas.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Coach Selector */}
          <div className="relative">
            <label htmlFor="filter-coach-select" className="sr-only">
              Filtrar por coach o instructora
            </label>
            <select
              id="filter-coach-select"
              value={filters.coach}
              onChange={(e) => onFilterChange({ coach: e.target.value })}
              className="px-3 py-2 bg-[#FDFBF7] dark:bg-slate-800/80 border border-[#E8E4DD] dark:border-slate-700 rounded-xl text-xs font-semibold text-[#4A453B] dark:text-slate-200 focus:outline-none focus:border-[#1A1A1A] cursor-pointer"
            >
              <option value="">Todas las Coaches</option>
              {coaches.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Recordatorio Status Selector */}
          <div className="relative">
            <label htmlFor="filter-recordatorio-select" className="sr-only">
              Filtrar por estado de recordatorio
            </label>
            <select
              id="filter-recordatorio-select"
              value={filters.recordatorio}
              onChange={(e) => onFilterChange({ recordatorio: e.target.value as any })}
              className="px-3 py-2 bg-[#FDFBF7] dark:bg-slate-800/80 border border-[#E8E4DD] dark:border-slate-700 rounded-xl text-xs font-semibold text-[#4A453B] dark:text-slate-200 focus:outline-none focus:border-[#1A1A1A] cursor-pointer"
            >
              <option value="all">Recordatorios: Todos</option>
              <option value="enviado">Recordatorio: Enviado</option>
              <option value="pendiente">Recordatorio: Pendiente</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setLocalSearch('');
                onResetFilters();
              }}
              type="button"
              className="px-3 py-2 text-xs font-semibold text-[#C62828] hover:text-[#B71C1C] bg-[#FFEBEE] hover:bg-[#FFCDD2] rounded-xl border border-[#FFCDD2] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </button>
          )}

        </div>

      </div>

      {/* Result Counter & Active Tags */}
      <div className="flex items-center justify-between text-xs text-[#7A6E5D] dark:text-slate-400 pt-1.5 border-t border-[#F0ECE1] dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#8C7A6B] dark:text-slate-400" aria-hidden="true" />
          <span>Mostrando <strong className="text-[#1A1A1A] dark:text-slate-100 font-mono-numbers">{totalResults}</strong> reservas</span>
        </div>

        {hasActiveFilters && (
          <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
            <span className="font-medium text-[#8C7A6B] dark:text-slate-400">Filtros secundarios activos</span>
          </div>
        )}
      </div>
    </div>
  );
};

