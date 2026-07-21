import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { PilatesBooking, MetricSummary } from '../types';

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
