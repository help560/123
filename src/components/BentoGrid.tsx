import React from 'react';
import { MetricSummary } from '../types';
import { DonutChart } from './DonutChart';
import { 
  Users, 
  Bell, 
  Activity, 
  Clock, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  PieChart
} from 'lucide-react';

interface BentoGridProps {
  metrics: MetricSummary;
  selectedCoach: string;
  selectedDisciplina: string;
  selectedRecordatorio: 'all' | 'enviado' | 'pendiente';
  onSelectCoach: (coach: string) => void;
  onSelectDisciplina: (disc: string) => void;
  onSelectRecordatorio: (status: 'all' | 'enviado' | 'pendiente') => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  metrics,
  selectedCoach,
  selectedDisciplina,
  selectedRecordatorio,
  onSelectCoach,
  onSelectDisciplina,
  onSelectRecordatorio,
}) => {
  return (
    <section aria-label="Cuadro de Métricas y KPIs Bento Grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      
      {/* 1. HERO KPI CARD (Span 2 Columns) */}
      <article className="md:col-span-2 bg-gradient-to-br from-[#1A1A1A] to-[#2B2823] text-[#FDFBF7] rounded-2xl p-6 sm:p-8 border border-[#2B2823] shadow-md flex flex-col justify-between relative overflow-hidden group min-h-[260px]">
        {/* Subtle Decorative Background Pattern */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-[#EAE5D9]/5 blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" aria-hidden="true" />
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38332B] text-[#EAE5D9] text-xs font-semibold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-[#C8BFA8]" aria-hidden="true" />
              Resumen General S8
            </span>
            <span className="text-xs text-[#A8A092] font-mono-numbers">
              Studio 8 Pilates Analytics
            </span>
          </div>

          <div className="mt-2 mb-6">
            <h3 className="text-xs uppercase tracking-widest text-[#A8A092] font-semibold mb-1">
              Total de Reservas en este Período
            </h3>
            <div className="flex items-baseline gap-4">
              <span className="font-serif-luxury text-4xl sm:text-6xl font-bold tracking-tight text-[#FDFBF7]">
                {metrics.totalReservas}
              </span>
              <div className="flex flex-col">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#81C784] bg-[#2E7D32]/20 px-2 py-0.5 rounded-full w-fit">
                  <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" /> 100% Inmutable
                </span>
                <span className="text-[11px] text-[#A8A092] mt-0.5">Base Excel S8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Highlights Sub-Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#38332B]/80 text-xs">
          <div className="bg-[#26221D] p-3 rounded-xl border border-[#38332B]">
            <p className="text-[#A8A092] text-[11px] mb-0.5">Tasa Confirmación</p>
            <p className="font-semibold text-[#FDFBF7] text-sm font-mono-numbers">
              {metrics.porcentajeRecordatorios}% ({metrics.recordatoriosEnviados}/{metrics.totalReservas})
            </p>
          </div>
          <div className="bg-[#26221D] p-3 rounded-xl border border-[#38332B]">
            <p className="text-[#A8A092] text-[11px] mb-0.5">Disciplina Top</p>
            <p className="font-semibold text-[#FDFBF7] text-sm truncate">
              {metrics.disciplinas[0]?.name || 'Sin registros'}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-[#26221D] p-3 rounded-xl border border-[#38332B]">
            <p className="text-[#A8A092] text-[11px] mb-0.5">Coach Principal</p>
            <p className="font-semibold text-[#FDFBF7] text-sm truncate">
              {metrics.coaches[0]?.name || 'Sin registros'}
            </p>
          </div>
        </div>
      </article>

      {/* 2. STATUS DE RECORDATORIOS CARD */}
      <article className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-[#E8E4DD] dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[260px]">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-[#1A1A1A] dark:text-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#8C7A6B] dark:text-slate-400" aria-hidden="true" />
              <span>Status de Recordatorios</span>
            </h3>
            <span className="text-[11px] font-mono-numbers font-bold px-2.5 py-0.5 rounded-full bg-[#F5F1E8] dark:bg-slate-800 text-[#5A5245] dark:text-slate-300">
              {metrics.recordatoriosEnviados} / {metrics.totalReservas}
            </span>
          </div>

          <p className="text-xs text-[#7A6E5D] dark:text-slate-400 mb-4">
            Columna <code className="bg-[#F5F1E8] dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">REDORDATORIO</code>
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-[#2E7D32] dark:text-[#81C784] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Enviados ({metrics.recordatoriosEnviados})
              </span>
              <span className="text-[#C62828] dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" /> Pendientes ({metrics.recordatoriosPendientes})
              </span>
            </div>
            <div className="w-full h-3 bg-[#F5F1E8] dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-[#E8E4DD] dark:border-slate-700">
              <div 
                className="bg-[#2E7D32] h-full rounded-full transition-all duration-500" 
                style={{ width: `${metrics.porcentajeRecordatorios}%` }} 
              />
              <div 
                className="bg-[#E57373] h-full rounded-full transition-all duration-500 ml-0.5" 
                style={{ width: `${metrics.totalReservas === 0 ? 0 : 100 - metrics.porcentajeRecordatorios}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex gap-2 pt-2 border-t border-[#E8E4DD] dark:border-slate-800">
          <button
            onClick={() => onSelectRecordatorio('enviado')}
            type="button"
            aria-pressed={selectedRecordatorio === 'enviado'}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedRecordatorio === 'enviado'
                ? 'bg-[#2E7D32] text-white shadow-xs'
                : 'bg-[#F5F1E8] dark:bg-slate-800 text-[#4A453B] dark:text-slate-300 hover:bg-[#EAE5D9]'
            }`}
          >
            Enviados
          </button>
          <button
            onClick={() => onSelectRecordatorio('pendiente')}
            type="button"
            aria-pressed={selectedRecordatorio === 'pendiente'}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedRecordatorio === 'pendiente'
                ? 'bg-[#C62828] text-white shadow-xs'
                : 'bg-[#F5F1E8] dark:bg-slate-800 text-[#4A453B] dark:text-slate-300 hover:bg-[#EAE5D9]'
            }`}
          >
            Pendientes
          </button>
          {selectedRecordatorio !== 'all' && (
            <button
              onClick={() => onSelectRecordatorio('all')}
              type="button"
              className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-[#1A1A1A] text-white cursor-pointer"
              title="Ver todos"
            >
              Todos
            </button>
          )}
        </div>
      </article>

      {/* 3. DISTRIBUCIÓN POR DISCIPLINA CARD (DONUT CHART) */}
      <article className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-[#E8E4DD] dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[260px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-[#1A1A1A] dark:text-slate-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#8C7A6B] dark:text-slate-400" aria-hidden="true" />
              <span>Distribución de Disciplinas</span>
            </h3>
            <span className="text-[11px] font-medium text-[#7A6E5D] dark:text-slate-400">
              {metrics.disciplinas.length} Tipos
            </span>
          </div>

          <p className="text-xs text-[#7A6E5D] dark:text-slate-400 mb-2">
            Distribución visual de reservas por disciplina.
          </p>

          <DonutChart
            data={metrics.disciplinas}
            selectedDisciplina={selectedDisciplina}
            onSelectDisciplina={onSelectDisciplina}
          />
        </div>

        {selectedDisciplina && (
          <button
            onClick={() => onSelectDisciplina('')}
            type="button"
            className="mt-2 text-xs font-semibold text-[#8C7A6B] hover:text-[#1A1A1A] dark:hover:text-white underline cursor-pointer text-left"
          >
            ← Mostrar todas las disciplinas
          </button>
        )}
      </article>

      {/* 4. CARGA DE COACHES CARD */}
      <article className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-[#E8E4DD] dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[260px]">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-[#1A1A1A] dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#8C7A6B] dark:text-slate-400" aria-hidden="true" />
              <span>Carga de Coaches</span>
            </h3>
            <span className="text-[11px] font-medium text-[#7A6E5D] dark:text-slate-400">
              {metrics.coaches.length} Instructoras
            </span>
          </div>

          <p className="text-xs text-[#7A6E5D] dark:text-slate-400 mb-4">
            Volumen de clases y confirmaciones por coach.
          </p>

          {metrics.coaches.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8C7A6B] italic">
              Sin actividad registrada en este período
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
              {metrics.coaches.map((coach) => {
                const isSelected = selectedCoach === coach.name;
                return (
                  <button
                    key={coach.name}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onSelectCoach(isSelected ? '' : coach.name)}
                    className={`w-full p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-left outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] ${
                      isSelected 
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' 
                        : 'bg-[#FDFBF7] dark:bg-slate-800/80 hover:bg-[#F5F1E8] border-[#E8E4DD] dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                        isSelected ? 'bg-white text-[#1A1A1A]' : 'bg-[#EAE5D9] dark:bg-slate-700 text-[#4A453B] dark:text-slate-200'
                      }`}>
                        {coach.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold leading-tight">{coach.name}</p>
                        <p className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-[#7A6E5D] dark:text-slate-400'}`}>
                          {coach.confirmados} env. / {coach.pendientes} pend.
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono-numbers font-bold">{coach.total}</span>
                      <span className={`text-[10px] block ${isSelected ? 'text-white/70' : 'text-[#7A6E5D] dark:text-slate-400'}`}>
                        {coach.percentage}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedCoach && (
          <button
            onClick={() => onSelectCoach('')}
            type="button"
            className="mt-3 text-xs font-semibold text-[#8C7A6B] hover:text-[#1A1A1A] dark:hover:text-white underline cursor-pointer text-left"
          >
            ← Mostrar todas las coaches
          </button>
        )}
      </article>

      {/* 5. TOP CLASES POPULARES CARD */}
      <article className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-[#E8E4DD] dark:border-slate-800 shadow-xs min-h-[160px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-[#1A1A1A] dark:text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#8C7A6B] dark:text-slate-400" aria-hidden="true" />
            <span>Clases Más Solicitadas</span>
          </h3>
          <span className="text-[11px] text-[#7A6E5D] dark:text-slate-400 font-medium">Categorías</span>
        </div>

        {metrics.clasesPopular.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#8C7A6B] italic">
            Sin clases en este período
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {metrics.clasesPopular.map((clase) => (
              <div
                key={clase.name}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F1E8] dark:bg-slate-800 rounded-xl text-xs font-semibold text-[#4A453B] dark:text-slate-300 border border-[#E8E4DD] dark:border-slate-700"
              >
                <span>{clase.name}</span>
                <span className="px-1.5 py-0.5 bg-[#EAE5D9] dark:bg-slate-700 text-[#1A1A1A] dark:text-slate-200 rounded-md font-mono-numbers text-[10px]">
                  {clase.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>

      {/* 6. HORARIOS DE MAYOR AFLUENCIA CARD */}
      <article className="md:col-span-3 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-[#E8E4DD] dark:border-slate-800 shadow-xs min-h-[160px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-[#1A1A1A] dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8C7A6B] dark:text-slate-400" aria-hidden="true" />
            <span>Horarios Pico de Clase (Afluencia)</span>
          </h3>
          <span className="text-[11px] text-[#7A6E5D] dark:text-slate-400 font-medium">Turnos Top</span>
        </div>

        {metrics.horariosPico.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#8C7A6B] italic">
            Sin turnos en este período
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
            {metrics.horariosPico.map((hp) => (
              <div 
                key={hp.hora} 
                className="p-3 bg-[#FDFBF7] dark:bg-slate-800/80 rounded-xl border border-[#E8E4DD] dark:border-slate-700 text-center flex flex-col justify-between items-center min-h-[76px] shadow-2xs hover:border-[#D9D2C5] transition-all"
              >
                <span className="font-mono-numbers text-sm font-bold text-[#1A1A1A] dark:text-slate-100 block tracking-tight">
                  {hp.hora} hs
                </span>
                <span className="text-[11px] font-semibold text-[#5A5245] dark:text-slate-300 bg-[#F5F1E8] dark:bg-slate-800 px-2.5 py-1 rounded-md mt-1.5 border border-[#E8E4DD] dark:border-slate-700 whitespace-nowrap">
                  {hp.count} {hp.count === 1 ? 'reserva' : 'reservas'}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>

    </section>
  );
};

