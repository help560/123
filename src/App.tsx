/**
 * Studio 8 Pilates — Executive Analytics Visualizer
 * @license Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { PilatesBooking, FilterState, TimeRangeOption } from './types';
import { SAMPLE_BOOKINGS } from './data/sampleData';
import { 
  parseUploadedFile, 
  calculateMetrics, 
  exportToCSV,
  getFilteredData,
  getAvailableMonths,
  getDateRangeLabel
} from './utils/parser';

import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { TimeRangeSelector } from './components/TimeRangeSelector';
import { BentoGrid } from './components/BentoGrid';
import { FilterBar } from './components/FilterBar';
import { DataTable } from './components/DataTable';
import { BookingDetailModal } from './components/BookingDetailModal';

import { CheckCircle2, AlertCircle, ShieldCheck, CalendarX, RotateCcw } from 'lucide-react';

export default function App() {
  // Estado Cero: Starts on Dropzone screen (isDropzoneVisible = true)
  const [bookings, setBookings] = useState<PilatesBooking[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDropzoneVisible, setIsDropzoneVisible] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Time Range Selection State
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // Selected Detail Modal
  const [selectedBooking, setSelectedBooking] = useState<PilatesBooking | null>(null);

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    disciplina: '',
    coach: '',
    recordatorio: 'all',
    fechaInicio: '',
    fechaFin: ''
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Available unique months extracted dynamically from dataset
  const availableMonths = useMemo(() => getAvailableMonths(bookings), [bookings]);

  // Keep selectedMonth updated to latest month when dataset changes
  useEffect(() => {
    if (availableMonths.length > 0) {
      if (!selectedMonth || !availableMonths.some(m => m.value === selectedMonth)) {
        setSelectedMonth(availableMonths[0].value);
      }
    } else {
      setSelectedMonth('');
    }
  }, [availableMonths, selectedMonth]);

  // Handle File Upload from Dropzone or Header
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const parsedBookings = await parseUploadedFile(file);
      if (parsedBookings.length === 0) {
        showToast('El archivo no contiene filas o no pudo reconocerse el formato.', 'error');
      } else {
        setBookings(parsedBookings);
        setFileName(file.name);
        setIsDropzoneVisible(false);
        setTimeRange('all');
        showToast(`¡Encendido Exitoso! Se procesaron ${parsedBookings.length} reservas de ${file.name}.`);
      }
    } catch (err) {
      console.error('Error parsing file:', err);
      showToast('Error al procesar el archivo. Asegúrate de subirse en .xlsx o .csv', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load sample S8 data
  const handleLoadSampleData = () => {
    setBookings(SAMPLE_BOOKINGS);
    setFileName('S8_Pilates_Julio_2026.xlsx');
    setIsDropzoneVisible(false);
    setTimeRange('all');
    showToast(`Cargadas ${SAMPLE_BOOKINGS.length} reservas de muestra de Studio 8 Pilates.`);
  };

  // Filter updates
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      disciplina: '',
      coach: '',
      recordatorio: 'all',
      fechaInicio: '',
      fechaFin: ''
    });
  };

  // 1. Pure Reactive Time-Filtered Sub-Dataset (synchronous, <16ms)
  const timeFilteredBookings = useMemo(() => {
    return getFilteredData(bookings, timeRange, selectedMonth);
  }, [bookings, timeRange, selectedMonth]);

  // Available unique coaches & disciplinas
  const uniqueCoaches = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach(b => { if (b.coach) set.add(b.coach); });
    return Array.from(set).sort();
  }, [bookings]);

  const uniqueDisciplinas = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach(b => { if (b.disciplina) set.add(b.disciplina); });
    return Array.from(set).sort();
  }, [bookings]);

  // 2. Secondary Filter Layer (search query, coach, discipline, reminder status)
  const filteredBookings = useMemo(() => {
    return timeFilteredBookings.filter(b => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const fullText = `${b.nombre} ${b.apellido} ${b.correo} ${b.telefono} ${b.clase} ${b.disciplina} ${b.coach}`.toLowerCase();
        if (!fullText.includes(q)) return false;
      }
      // Disciplina
      if (filters.disciplina && b.disciplina !== filters.disciplina) {
        return false;
      }
      // Coach
      if (filters.coach && b.coach !== filters.coach) {
        return false;
      }
      // Recordatorio
      if (filters.recordatorio === 'enviado' && !b.recordatorio) {
        return false;
      }
      if (filters.recordatorio === 'pendiente' && b.recordatorio) {
        return false;
      }
      return true;
    });
  }, [timeFilteredBookings, filters]);

  // Informative human-readable date window label
  const dateRangeLabel = useMemo(() => {
    return getDateRangeLabel(bookings, timeRange, selectedMonth);
  }, [bookings, timeRange, selectedMonth]);

  // Summary metrics calculated strictly over the filtered dataset
  const metrics = useMemo(() => calculateMetrics(filteredBookings), [filteredBookings]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans-ui flex flex-col">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 ${
          notification.type === 'success'
            ? 'bg-[#1A1A1A] text-[#FDFBF7] border-[#38332B]'
            : 'bg-[#C62828] text-white border-[#B71C1C]'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#81C784]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        fileName={fileName}
        totalCount={bookings.length}
        onFileUpload={handleFileUpload}
        onLoadSampleData={handleLoadSampleData}
        onExport={() => exportToCSV(filteredBookings)}
        onResetData={() => {
          setBookings([]);
          setFileName(null);
          setIsDropzoneVisible(true);
          setTimeRange('all');
          setSelectedMonth('');
        }}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Dynamic Dropzone Mode vs Dashboard Bento Grid */}
        {isDropzoneVisible || bookings.length === 0 ? (
          <Dropzone
            onFileUpload={handleFileUpload}
            onLoadSampleData={handleLoadSampleData}
            isLoading={isLoading}
          />
        ) : (
          <div>
            {/* Dynamic Time Range Filter Control (Positioned in Bento Grid Sub-Header) */}
            <TimeRangeSelector
              timeRange={timeRange}
              selectedMonth={selectedMonth}
              availableMonths={availableMonths}
              totalBookingsCount={bookings.length}
              filteredBookingsCount={timeFilteredBookings.length}
              dateRangeLabel={dateRangeLabel}
              onRangeChange={(newRange) => setTimeRange(newRange)}
              onMonthChange={(newMonth) => setSelectedMonth(newMonth)}
            />

            {/* Empty State for zero matches in selected time range */}
            {timeFilteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-[#E8E4DD] shadow-xs text-center my-6 flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-14 h-14 rounded-full bg-[#F5F1E8] flex items-center justify-center text-[#8C7A6B] mb-4 border border-[#E8E4DD]">
                  <CalendarX className="w-7 h-7" />
                </div>
                <h3 className="font-serif-luxury text-2xl font-bold text-[#1A1A1A] mb-1">
                  Sin Reservas en este Período
                </h3>
                <p className="text-xs sm:text-sm text-[#7A6E5D] max-w-md mb-5 leading-relaxed">
                  No se encontraron reservas registradas para <strong className="text-[#1A1A1A] font-semibold">{dateRangeLabel}</strong>. Puedes seleccionar otro mes o regresar a la vista completa de reservas.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setTimeRange('all')}
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1A1A] text-[#FDFBF7] text-xs font-semibold hover:bg-[#2B2823] transition-all cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-4 h-4 text-[#C8BFA8]" />
                    <span>Ver Todo el Histórico ({bookings.length} reservas)</span>
                  </button>
                  {availableMonths.length > 0 && (
                    <button
                      onClick={() => {
                        setTimeRange('month');
                        setSelectedMonth(availableMonths[0]?.value || '');
                      }}
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F5F1E8] text-[#4A453B] text-xs font-semibold hover:bg-[#EAE5D9] transition-all cursor-pointer border border-[#E8E4DD]"
                    >
                      <span>Ir al Mes Más Reciente ({availableMonths[0]?.label})</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Bento Grid Analytics */}
                <BentoGrid
                  metrics={metrics}
                  selectedCoach={filters.coach}
                  selectedDisciplina={filters.disciplina}
                  selectedRecordatorio={filters.recordatorio}
                  onSelectCoach={(coach) => handleFilterChange({ coach })}
                  onSelectDisciplina={(disciplina) => handleFilterChange({ disciplina })}
                  onSelectRecordatorio={(recordatorio) => handleFilterChange({ recordatorio })}
                />

                {/* Filter Bar */}
                <FilterBar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                  coaches={uniqueCoaches}
                  disciplinas={uniqueDisciplinas}
                  totalResults={filteredBookings.length}
                />

                {/* Data Table */}
                <DataTable
                  bookings={filteredBookings}
                  onSelectBooking={(booking) => setSelectedBooking(booking)}
                />
              </>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E4DD] bg-[#FDFBF7] py-6 px-4 text-center text-xs text-[#7A6E5D] mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-serif-luxury text-sm font-semibold text-[#1A1A1A]">
            Studio 8 Pilates — Premium Fitness Visualizer
          </p>
          <p className="text-[11px] text-[#8C7A6B] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Arquitectura Inmutable Read-Only • Fuente de Verdad Excel</span>
          </p>
        </div>
      </footer>

      {/* Modals */}
      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />

    </div>
  );
}

