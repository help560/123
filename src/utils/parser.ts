import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { PilatesBooking, MetricSummary, TimeRangeOption, MonthOption } from '../types';

export const SPANISH_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const SPANISH_MONTHS_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

/**
 * Robust date parser supporting Excel serial numbers, ISO strings,
 * Latin DD/MM/YYYY formats, timestamps and Date objects.
 */
export function parseRecordDate(dateVal: any): Date | null {
  if (dateVal === null || dateVal === undefined || dateVal === '') return null;
  
  if (dateVal instanceof Date) {
    return isNaN(dateVal.getTime()) ? null : dateVal;
  }

  // Handle number or numeric string representing Excel serial or Unix timestamp
  if (typeof dateVal === 'number' || (!isNaN(Number(dateVal)) && String(dateVal).trim() !== '')) {
    const num = Number(dateVal);
    // Excel serial dates: ~20000 to ~90000
    if (num > 20000 && num < 90000) {
      try {
        const dateObj = XLSX.SSF.parse_date_code(num);
        if (dateObj && dateObj.y && dateObj.m && dateObj.d) {
          return new Date(dateObj.y, dateObj.m - 1, dateObj.d, dateObj.H || 0, dateObj.M || 0, dateObj.S || 0);
        }
      } catch {
        // continue
      }
    }
    // Unix epoch timestamp in ms (> year 2000)
    if (num > 946684800000 && num < 3000000000000) {
      const d = new Date(num);
      if (!isNaN(d.getTime())) return d;
    }
    // Unix epoch in seconds
    if (num > 946684800 && num < 3000000000) {
      const d = new Date(num * 1000);
      if (!isNaN(d.getTime())) return d;
    }
  }

  const str = String(dateVal).trim();
  if (!str) return null;

  // Pattern 1: ISO YYYY-MM-DD or YYYY/MM/DD with optional time
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const hour = isoMatch[4] ? parseInt(isoMatch[4], 10) : 0;
    const min = isoMatch[5] ? parseInt(isoMatch[5], 10) : 0;
    const sec = isoMatch[6] ? parseInt(isoMatch[6], 10) : 0;
    const d = new Date(year, month, day, hour, min, sec);
    if (!isNaN(d.getTime())) return d;
  }

  // Pattern 2: DD/MM/YYYY or DD-MM-YYYY with optional time
  const latinMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (latinMatch) {
    const day = parseInt(latinMatch[1], 10);
    const month = parseInt(latinMatch[2], 10) - 1;
    const year = parseInt(latinMatch[3], 10);
    const hour = latinMatch[4] ? parseInt(latinMatch[4], 10) : 0;
    const min = latinMatch[5] ? parseInt(latinMatch[5], 10) : 0;
    const sec = latinMatch[6] ? parseInt(latinMatch[6], 10) : 0;
    const d = new Date(year, month, day, hour, min, sec);
    if (!isNaN(d.getTime())) return d;
  }

  // Fallback to native Date parser
  const fallback = new Date(str);
  if (!isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
}

/**
 * Normalizes column header strings to a clean key
 */
function normalizeHeaderKey(header: string): string {
  const clean = header.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.includes('SUBMIT') || clean.includes('ENVIADO')) return 'submited';
  if (clean === 'NOMBRE' || clean === 'NAME' || clean === 'FIRSTNAME') return 'nombre';
  if (clean === 'APELLIDO' || clean === 'LASTNAME') return 'apellido';
  if (clean.includes('CORREO') || clean.includes('EMAIL') || clean.includes('MAIL')) return 'correo';
  if (clean.includes('DISCIPLI')) return 'disciplina';
  if (clean.includes('FECHA') || clean.includes('DATE')) return 'fecha';
  if (clean.includes('HORA') || clean.includes('TIME')) return 'hora';
  if (clean.includes('COACH') || clean.includes('INSTRUCTOR') || clean.includes('PROFESOR')) return 'coach';
  if (clean.includes('CLASE') || clean.includes('CLASS') || clean.includes('TIPO')) return 'clase';
  if (clean.includes('REDOR') || clean.includes('RECOR') || clean.includes('REMIND') || clean.includes('NOTIF')) return 'recordatorio';
  if (clean.includes('TELEF') || clean.includes('PHONE') || clean.includes('CEL')) return 'telefono';
  return clean.toLowerCase();
}

/**
 * Checks if a value represents a checked/true reminder status
 */
function parseReminderValue(val: any): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val > 0;
  if (!val) return false;
  
  const str = String(val).trim().toLowerCase();
  return (
    str === 'true' ||
    str === '1' ||
    str === 'si' ||
    str === 'sí' ||
    str === 'x' ||
    str === 'v' ||
    str === 'verdadero' ||
    str === 'checked' ||
    str === 'enviado' ||
    str.includes('check') ||
    str.includes('✓') ||
    str.includes('✔')
  );
}

/**
 * Clean & normalize a raw record row into a PilatesBooking
 */
export function normalizeRawRow(row: Record<string, any>, index: number): PilatesBooking {
  const mapped: Record<string, any> = {};
  
  Object.keys(row).forEach((key) => {
    const normalizedKey = normalizeHeaderKey(key);
    mapped[normalizedKey] = row[key];
  });

  const nombre = String(mapped.nombre || '').trim();
  const apellido = String(mapped.apellido || '').trim();
  const disciplinaRaw = String(mapped.disciplina || '').trim();
  let disciplina = disciplinaRaw || 'Reformer';

  // Fix attached class name if stuck in disciplina column (e.g., ReformerUPPER BODY)
  let clase = String(mapped.clase || '').trim();
  if (disciplina.startsWith('Reformer') && disciplina.length > 8) {
    if (!clase) {
      clase = disciplina.substring(8).trim();
    }
    disciplina = 'Reformer';
  }

  // Format date nicely if string or Excel serial
  let fecha = String(mapped.fecha || '').trim();
  if (!isNaN(Number(fecha)) && Number(fecha) > 30000) {
    const dateObj = XLSX.SSF.parse_date_code(Number(fecha));
    if (dateObj) {
      const m = String(dateObj.m).padStart(2, '0');
      const d = String(dateObj.d).padStart(2, '0');
      fecha = `${dateObj.y}-${m}-${d}`;
    }
  }

  let hora = String(mapped.hora || '').trim();
  if (hora && !hora.includes(':') && !isNaN(Number(hora))) {
    // Decimal time fraction from Excel
    const totalMinutes = Math.round(Number(hora) * 24 * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    hora = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  return {
    id: `booking-${Date.now()}-${index}`,
    submited: String(mapped.submited || '').trim(),
    nombre: nombre || 'Cliente',
    apellido: apellido,
    correo: String(mapped.correo || '').trim(),
    disciplina: disciplina,
    fecha: fecha || new Date().toISOString().split('T')[0],
    hora: hora || '09:00',
    coach: String(mapped.coach || 'Agustina').trim(),
    clase: clase || 'General',
    recordatorio: parseReminderValue(mapped.recordatorio),
    telefono: String(mapped.telefono || '').trim()
  };
}

/**
 * Parse uploaded CSV or Excel File
 */
export async function parseUploadedFile(file: File): Promise<PilatesBooking[]> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.csv') || file.type === 'text/csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const bookings = (results.data as Record<string, any>[])
              .filter(row => Object.values(row).some(v => v !== null && v !== ''))
              .map((row, idx) => normalizeRawRow(row, idx));
            resolve(bookings);
          } catch (err) {
            reject(err);
          }
        },
        error: (err) => reject(err)
      });
    });
  } else {
    // Excel file parsing via SheetJS (XLSX)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
          
          const bookings = jsonRows
            .filter(row => Object.values(row).some(v => v !== null && v !== ''))
            .map((row, idx) => normalizeRawRow(row, idx));
          resolve(bookings);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }
}

/**
 * Calculate Dashboard Metrics Summary
 */
export function calculateMetrics(bookings: PilatesBooking[]): MetricSummary {
  const totalReservas = bookings.length;
  if (totalReservas === 0) {
    return {
      totalReservas: 0,
      recordatoriosEnviados: 0,
      recordatoriosPendientes: 0,
      porcentajeRecordatorios: 0,
      disciplinas: [],
      coaches: [],
      clasesPopular: [],
      horariosPico: []
    };
  }

  const recordatoriosEnviados = bookings.filter(b => b.recordatorio).length;
  const recordatoriosPendientes = totalReservas - recordatoriosEnviados;
  const porcentajeRecordatorios = Math.round((recordatoriosEnviados / totalReservas) * 100);

  // Disciplines breakdown
  const discMap: Record<string, number> = {};
  bookings.forEach(b => {
    const d = b.disciplina || 'Otro';
    discMap[d] = (discMap[d] || 0) + 1;
  });

  const disciplinas = Object.entries(discMap).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / totalReservas) * 100)
  })).sort((a, b) => b.count - a.count);

  // Coach workload breakdown
  const coachMap: Record<string, { total: number; confirmados: number; pendientes: number }> = {};
  bookings.forEach(b => {
    const c = b.coach || 'Sin Asignar';
    if (!coachMap[c]) {
      coachMap[c] = { total: 0, confirmados: 0, pendientes: 0 };
    }
    coachMap[c].total += 1;
    if (b.recordatorio) {
      coachMap[c].confirmados += 1;
    } else {
      coachMap[c].pendientes += 1;
    }
  });

  const coaches = Object.entries(coachMap).map(([name, stat]) => ({
    name,
    total: stat.total,
    confirmados: stat.confirmados,
    pendientes: stat.pendientes,
    percentage: Math.round((stat.total / totalReservas) * 100)
  })).sort((a, b) => b.total - a.total);

  // Top classes breakdown
  const claseMap: Record<string, number> = {};
  bookings.forEach(b => {
    const c = b.clase || 'General';
    claseMap[c] = (claseMap[c] || 0) + 1;
  });

  const clasesPopular = Object.entries(claseMap).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count).slice(0, 6);

  // Peak times breakdown
  const horaMap: Record<string, number> = {};
  bookings.forEach(b => {
    const h = b.hora ? b.hora.substring(0, 5) : '09:00';
    horaMap[h] = (horaMap[h] || 0) + 1;
  });

  const horariosPico = Object.entries(horaMap).map(([hora, count]) => ({
    hora,
    count
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  return {
    totalReservas,
    recordatoriosEnviados,
    recordatoriosPendientes,
    porcentajeRecordatorios,
    disciplinas,
    coaches,
    clasesPopular,
    horariosPico
  };
}

/**
 * Export current list to CSV
 */
export function exportToCSV(bookings: PilatesBooking[], filename = 'S8_Pilates_Reservas.csv') {
  const exportData = bookings.map(b => ({
    SUBMITED: b.submited,
    NOMBRE: b.nombre,
    APELLIDO: b.apellido,
    CORREO: b.correo,
    DISCIPLINA: b.disciplina,
    FECHA: b.fecha,
    HORA: b.hora,
    COACH: b.coach,
    CLASE: b.clase,
    TELEFONO: b.telefono,
    REDORDATORIO: b.recordatorio ? 'ENVIADO' : 'PENDIENTE'
  }));

  const csv = Papa.unparse(exportData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Extracts unique available months from the bookings dataset, sorted from newest to oldest
 */
export function getAvailableMonths(bookings: PilatesBooking[]): MonthOption[] {
  const map = new Map<string, { label: string; count: number }>();

  for (let i = 0; i < bookings.length; i++) {
    const b = bookings[i];
    const date = parseRecordDate(b.fecha) || parseRecordDate(b.submited);
    if (date) {
      const year = date.getFullYear();
      const monthNum = date.getMonth() + 1;
      const key = `${year}-${String(monthNum).padStart(2, '0')}`;
      const existing = map.get(key);
      const label = `${SPANISH_MONTHS[monthNum - 1]} ${year}`;
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { label, count: 1 });
      }
    }
  }

  return Array.from(map.entries())
    .map(([value, { label, count }]) => ({ value, label, count }))
    .sort((a, b) => b.value.localeCompare(a.value));
}

/**
 * Pure and synchronous (<16ms) reactive filtering function by time window
 * - '7d': Records within the last 7 calendar days from dataset max date (or current date)
 * - '30d': Records within the last 30 calendar days from dataset max date
 * - 'month': Records matching the selected month ('YYYY-MM')
 * - 'all': All records (complete historical dataset)
 */
export function getFilteredData(
  data: PilatesBooking[],
  range: TimeRangeOption,
  selectedMonth?: string
): PilatesBooking[] {
  if (!data || data.length === 0 || range === 'all') {
    return data;
  }

  // Pre-parse dates once for performance (<16ms INP)
  const parsedItems: { booking: PilatesBooking; date: Date | null }[] = new Array(data.length);
  let maxTime = -Infinity;

  for (let i = 0; i < data.length; i++) {
    const b = data[i];
    const d = parseRecordDate(b.fecha) || parseRecordDate(b.submited);
    parsedItems[i] = { booking: b, date: d };
    if (d) {
      const t = d.getTime();
      if (t > maxTime) {
        maxTime = t;
      }
    }
  }

  if (maxTime === -Infinity) {
    return data;
  }

  const maxDate = new Date(maxTime);
  const endOfMaxDay = new Date(
    maxDate.getFullYear(),
    maxDate.getMonth(),
    maxDate.getDate(),
    23,
    59,
    59,
    999
  );

  if (range === '7d') {
    const startOfRange = new Date(
      maxDate.getFullYear(),
      maxDate.getMonth(),
      maxDate.getDate() - 6,
      0,
      0,
      0,
      0
    );
    const startMs = startOfRange.getTime();
    const endMs = endOfMaxDay.getTime();

    const result: PilatesBooking[] = [];
    for (let i = 0; i < parsedItems.length; i++) {
      const item = parsedItems[i];
      if (item.date) {
        const t = item.date.getTime();
        if (t >= startMs && t <= endMs) {
          result.push(item.booking);
        }
      }
    }
    return result;
  }

  if (range === '30d') {
    const startOfRange = new Date(
      maxDate.getFullYear(),
      maxDate.getMonth(),
      maxDate.getDate() - 29,
      0,
      0,
      0,
      0
    );
    const startMs = startOfRange.getTime();
    const endMs = endOfMaxDay.getTime();

    const result: PilatesBooking[] = [];
    for (let i = 0; i < parsedItems.length; i++) {
      const item = parsedItems[i];
      if (item.date) {
        const t = item.date.getTime();
        if (t >= startMs && t <= endMs) {
          result.push(item.booking);
        }
      }
    }
    return result;
  }

  if (range === 'month') {
    let targetKey = selectedMonth;
    if (!targetKey) {
      const y = maxDate.getFullYear();
      const m = String(maxDate.getMonth() + 1).padStart(2, '0');
      targetKey = `${y}-${m}`;
    }

    const [targetYearStr, targetMonthStr] = targetKey.split('-');
    const targetYear = parseInt(targetYearStr, 10);
    const targetMonth = parseInt(targetMonthStr, 10);

    const result: PilatesBooking[] = [];
    for (let i = 0; i < parsedItems.length; i++) {
      const item = parsedItems[i];
      if (item.date) {
        if (
          item.date.getFullYear() === targetYear &&
          item.date.getMonth() + 1 === targetMonth
        ) {
          result.push(item.booking);
        }
      }
    }
    return result;
  }

  return data;
}

/**
 * Generates an informative human-readable label for the current time range
 */
export function getDateRangeLabel(
  data: PilatesBooking[],
  range: TimeRangeOption,
  selectedMonth?: string
): string {
  if (range === 'all') {
    return 'Histórico Completo';
  }

  let maxTime = -Infinity;
  for (let i = 0; i < data.length; i++) {
    const d = parseRecordDate(data[i].fecha) || parseRecordDate(data[i].submited);
    if (d && d.getTime() > maxTime) {
      maxTime = d.getTime();
    }
  }

  if (maxTime === -Infinity) {
    return 'Período seleccionado';
  }

  const maxDate = new Date(maxTime);

  if (range === '7d') {
    const startDate = new Date(
      maxDate.getFullYear(),
      maxDate.getMonth(),
      maxDate.getDate() - 6
    );
    const startStr = `${startDate.getDate()} ${SPANISH_MONTHS_SHORT[startDate.getMonth()]}`;
    const endStr = `${maxDate.getDate()} ${SPANISH_MONTHS_SHORT[maxDate.getMonth()]} ${maxDate.getFullYear()}`;
    return `Últimos 7 días (${startStr} - ${endStr})`;
  }

  if (range === '30d') {
    const startDate = new Date(
      maxDate.getFullYear(),
      maxDate.getMonth(),
      maxDate.getDate() - 29
    );
    const startStr = `${startDate.getDate()} ${SPANISH_MONTHS_SHORT[startDate.getMonth()]}`;
    const endStr = `${maxDate.getDate()} ${SPANISH_MONTHS_SHORT[maxDate.getMonth()]} ${maxDate.getFullYear()}`;
    return `Últimos 30 días (${startStr} - ${endStr})`;
  }

  if (range === 'month') {
    if (selectedMonth) {
      const [yearStr, monthStr] = selectedMonth.split('-');
      const mIdx = parseInt(monthStr, 10) - 1;
      return `${SPANISH_MONTHS[mIdx] || ''} ${yearStr}`;
    }
    return `${SPANISH_MONTHS[maxDate.getMonth()]} ${maxDate.getFullYear()}`;
  }

  return 'Histórico Completo';
}

