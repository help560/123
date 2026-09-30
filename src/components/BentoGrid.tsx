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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      
      {/* 1. HERO KPI CARD (Span 2 Columns) */}
      <div className="md:col-span-2 bg-gradient-to-br from-[#1A1A1A] to-[#2B2823] text-[#FDFBF7] rounded-2xl p-6 sm:p-8 border border-[#2B2823] shadow-md flex flex-col justify-between relative overflow-hidden group min-h-[260px]">
        {/* Subtle Decorative Background Pattern */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-[#EAE5D9]/5 blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38332B] text-[#EAE5D9] text-xs font-semibold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-[#C8BFA8]" />
              Resumen General S8
            </span>
            <span className="text-xs text-[#A8A092] font-mono-numbers">
              Studio 8 Pilates Analytics
            </span>
          </div>

          <div className="mt-2 mb-6">
            <p className="text-xs uppercase tracking-widest text-[#A8A092] font-semibold mb-1">
              Total de Reservas en este Período
            </p>
            <div className="flex items-baseline gap-4">
              <span className="font-serif-luxury text-5xl sm:text-7xl font-bold tracking-tight text-[#FDFBF7]">
                {metrics.totalReservas}
              </span>
              <div className="flex flex-col">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#81C784]">
                  <TrendingUp className="w-3.5 h-3.5" /> 100% Read-Only
                </span>
                <span className="text-[11px] text-[#A8A092]">Datos del Excel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Highlights Sub-Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#38332B]/80 text-xs">
          <div className="bg-[#26221D] p-3 rounded-xl border border-[#38332B]">
            <p className="text-[#A8A092] text-[11px] mb-0.5">Recordatorios</p>
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
      </div>

      {/* 2. STATUS DE RECORDATORIOS CARD */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E4DD] shadow-xs flex flex-col justify-between min-h-[260px]">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#8C7A6B]" />
              Status de Recordatorios
            </h3>
            <span className="text-[11px] font-mono-numbers font-bold px-2.5 py-0.5 rounded-full bg-[#F5F1E8] text-[#5A5245]">
              {metrics.recordatoriosEnviados} / {metrics.totalReservas}
            </span>
          </div>

          <p className="text-xs text-[#7A6E5D] mb-4">
            Columna <code className="bg-[#F5F1E8] px-1.5 py-0.5 rounded text-[11px]">REDORDATORIO</code>
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-[#2E7D32] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enviados ({metrics.recordatoriosEnviados})
              </span>
              <span className="text-[#C62828] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Pendientes ({metrics.recordatoriosPendientes})
              </span>
            </div>
            <div className="w-full h-3 bg-[#F5F1E8] rounded-full overflow-hidden flex p-0.5 border border-[#E8E4DD]">
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
        <div className="flex gap-2 pt-2 border-t border-[#E8E4DD]">
          <button
            onClick={() => onSelectRecordatorio('enviado')}
            type="button"
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedRecordatorio === 'enviado'
                ? 'bg-[#2E7D32] text-white shadow-xs'
                : 'bg-[#F5F1E8] text-[#4A453B] hover:bg-[#EAE5D9]'
            }`}
          >
            Enviados
          </button>
          <button
            onClick={() => onSelectRecordatorio('pendiente')}
            type="button"
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedRecordatorio === 'pendiente'
                ? 'bg-[#C62828] text-white shadow-xs'
                : 'bg-[#F5F1E8] text-[#4A453B] hover:bg-[#EAE5D9]'
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
      </div>

      {/* 3. DISTRIBUCIÓN POR DISCIPLINA CARD (DONUT CHART) */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E4DD] shadow-xs flex flex-col justify-between min-h-[260px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#8C7A6B]" />
              Gráfico Dona de Disciplinas
            </h3>
            <span className="text-[11px] font-medium text-[#7A6E5D]">
              {metrics.disciplinas.length} Tipos
            </span>
          </div>

          <p className="text-xs text-[#7A6E5D] mb-2">
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
            className="mt-2 text-xs font-semibold text-[#8C7A6B] hover:text-[#1A1A1A] underline cursor-pointer text-left"
          >
            ← Mostrar todas las disciplinas
          </button>
        )}
      </div>

      {/* 4. CARGA DE COACHES CARD */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E4DD] shadow-xs flex flex-col justify-between min-h-[260px]">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#8C7A6B]" />
              Carga de Coaches
            </h3>
            <span className="text-[11px] font-medium text-[#7A6E5D]">
              {metrics.coaches.length} Instructoras
            </span>
          </div>

          <p className="text-xs text-[#7A6E5D] mb-4">
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
                  <div
                    key={coach.name}
                    onClick={() => onSelectCoach(isSelected ? '' : coach.name)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onSelectCoach(isSelected ? '' : coach.name);
                      }
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected 
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' 
                        : 'bg-[#FDFBF7] hover:bg-[#F5F1E8] border-[#E8E4DD]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                        isSelected ? 'bg-white text-[#1A1A1A]' : 'bg-[#EAE5D9] text-[#4A453B]'
                      }`}>
                        {coach.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold leading-tight">{coach.name}</p>
                        <p className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-[#7A6E5D]'}`}>
                          {coach.confirmados} env. / {coach.pendientes} pend.
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono-numbers font-bold">{coach.total}</span>
                      <span className={`text-[10px] block ${isSelected ? 'text-white/70' : 'text-[#7A6E5D]'}`}>
                        {coach.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedCoach && (
          <button
            onClick={() => onSelectCoach('')}
            type="button"
            className="mt-3 text-xs font-semibold text-[#8C7A6B] hover:text-[#1A1A1A] underline cursor-pointer text-left"
          >
            ← Mostrar todas las coaches
          </button>
        )}
      </div>

      {/* 5. TOP CLASES POPULARES CARD */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E4DD] shadow-xs min-h-[160px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#8C7A6B]" />
            Clases Más Solicitadas
          </h3>
          <span className="text-[11px] text-[#7A6E5D] font-medium">Categorías</span>
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
                className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F1E8] rounded-xl text-xs font-semibold text-[#4A453B] border border-[#E8E4DD]"
              >
                <span>{clase.name}</span>
                <span className="px-1.5 py-0.5 bg-[#EAE5D9] text-[#1A1A1A] rounded-md font-mono-numbers text-[10px]">
                  {clase.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. HORARIOS DE MAYOR AFLUENCIA CARD */}
      <div className="md:col-span-3 bg-white rounded-2xl p-6 border border-[#E8E4DD] shadow-xs min-h-[160px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8C7A6B]" />
            Horarios Pico de Clase (Afluencia)
          </h3>
          <span className="text-[11px] text-[#7A6E5D] font-medium">Turnos Top</span>
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
                className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E8E4DD] text-center flex flex-col justify-between items-center min-h-[76px] shadow-2xs hover:border-[#D9D2C5] transition-all"
              >
                <span className="font-mono-numbers text-sm font-bold text-[#1A1A1A] block tracking-tight">
                  {hp.hora} hs
                </span>
                <span className="text-[11px] font-semibold text-[#5A5245] bg-[#F5F1E8] px-2.5 py-1 rounded-md mt-1.5 border border-[#E8E4DD] whitespace-nowrap">
                  {hp.count} {hp.count === 1 ? 'reserva' : 'reservas'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

