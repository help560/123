export type TimeRangeOption = '7d' | '30d' | 'month' | 'all';

export interface MonthOption {
  value: string; // e.g. "2026-07"
  label: string; // e.g. "Julio 2026"
  count: number;
}

export interface PilatesBooking {
  id: string;
  reservationId: string;
  submited: string;
  nombre: string;
  apellido: string;
  correo: string;
  disciplina: string;
  fecha: string;
  hora: string;
  coach: string;
  clase: string;
  recordatorio: boolean; // true = enviado/confirmado, false = pendiente
  telefono: string;
  estatus: string; // "CANCELADO", "", etc.
  cancelada: boolean;
}

export interface FilterState {
  search: string;
  disciplina: string;
  coach: string;
  recordatorio: 'all' | 'enviado' | 'pendiente';
  estatus: 'all' | 'activas' | 'canceladas';
  fechaInicio: string;
  fechaFin: string;
  timeRange?: TimeRangeOption;
  selectedMonth?: string;
}

export interface MonthlyTrendItem {
  monthKey: string; // "2026-07"
  label: string;    // "Jul 2026"
  fullLabel: string;// "Julio 2026"
  total: number;
  activas: number;
  canceladas: number;
  tasaCancelacion: number;
  growthRate?: number; // % vs previous month
}

export interface MetricSummary {
  totalReservas: number;
  activas: number;
  canceladas: number;
  tasaCancelacion: number;
  recordatoriosEnviados: number;
  recordatoriosPendientes: number;
  porcentajeRecordatorios: number;
  monthlyTrend: MonthlyTrendItem[];
  disciplinas: { name: string; count: number; percentage: number; activas: number; canceladas: number }[];
  coaches: { name: string; total: number; confirmados: number; pendientes: number; canceladas: number; percentage: number }[];
  clasesPopular: { name: string; count: number }[];
  horariosPico: { hora: string; count: number }[];
}
