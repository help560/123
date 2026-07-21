/**
 * Studio 8 Pilates — Executive Analytics Visualizer
 * @license Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PilatesBooking, FilterState } from './types';
import { SAMPLE_BOOKINGS } from './data/sampleData';
import { parseUploadedFile, calculateMetrics, exportToCSV } from './utils/parser';

import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { BentoGrid } from './components/BentoGrid';
import { FilterBar } from './components/FilterBar';
import { DataTable } from './components/DataTable';
import { BookingDetailModal } from './components/BookingDetailModal';

import { CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function App() {
  // Estado Cero: Starts on Dropzone screen (isDropzoneVisible = true)
  const [bookings, setBookings] = useState<PilatesBooking[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDropzoneVisible, setIsDropzoneVisible] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  // Available unique lists
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

  // Filtered dataset
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
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
  }, [bookings, filters]);

  // Summary metrics
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

