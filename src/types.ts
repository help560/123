export interface PilatesBooking {
  id: string;
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
}

export interface FilterState {
  search: string;
  disciplina: string;
  coach: string;
  recordatorio: 'all' | 'enviado' | 'pendiente';
  fechaInicio: string;
  fechaFin: string;
}

export interface MetricSummary {
  totalReservas: number;
  recordatoriosEnviados: number;
  recordatoriosPendientes: number;
  porcentajeRecordatorios: number;
  disciplinas: { name: string; count: number; percentage: number }[];
  coaches: { name: string; total: number; confirmados: number; pendientes: number; percentage: number }[];
  clasesPopular: { name: string; count: number }[];
  horariosPico: { hora: string; count: number }[];
}
