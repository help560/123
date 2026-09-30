import React, { useState, useEffect } from 'react';
import { PilatesBooking } from '../types';
import { 
  Check, 
  X, 
  ArrowUpDown, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Eye,
  Calendar,
  Clock,
  User,
  PhoneCall,
  HeartHandshake,
  BellRing
} from 'lucide-react';

interface DataTableProps {
  bookings: PilatesBooking[];
  onSelectBooking: (booking: PilatesBooking) => void;
}

type SortField = 'fecha' | 'hora' | 'nombre' | 'coach' | 'disciplina' | 'recordatorio';
type SortOrder = 'asc' | 'desc';

const WhatsAppIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.87 11.87 0 005.71 1.454h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export const DataTable: React.FC<DataTableProps> = ({
  bookings,
  onSelectBooking,
}) => {
  const [sortField, setSortField] = useState<SortField>('fecha');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // FIX RENDERIZADO FANTASMA: Reset page to 1 whenever bookings change
  useEffect(() => {
    setCurrentPage(1);
  }, [bookings.length]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Sort logic
  const sortedBookings = [...bookings].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === 'recordatorio') {
      aVal = a.recordatorio ? 1 : 0;
      bVal = b.recordatorio ? 1 : 0;
    }

    if (typeof aVal === 'string') {
      const cmp = aVal.localeCompare(bVal);
      return sortOrder === 'asc' ? cmp : -cmp;
    }

    return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  // Safe pagination logic
  const totalPages = Math.max(Math.ceil(sortedBookings.length / itemsPerPage), 1);
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedBookings = sortedBookings.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  // MOTOR DE MENSAJERÍA AUTOMÁTICA WHATSAPP (S8)
  const openWhatsApp = (booking: PilatesBooking, e: React.MouseEvent) => {
    e.stopPropagation();
    const rawPhone = booking.telefono ? booking.telefono.replace(/[^0-9]/g, '') : '';
    if (!rawPhone) {
      alert(`No hay número de teléfono registrado en el Excel para ${booking.nombre} ${booking.apellido}`);
      return;
    }

    let textMessage = '';
    if (booking.recordatorio) {
      // Mensaje de agradecimiento sin información de clase
      textMessage = `Hola ${booking.nombre}, ¡muchas gracias por elegirnos en Studio 8 Pilates! Es un gusto tenerte con nosotros, ¡te esperamos siempre! ✨`;
    } else {
      // Mensaje corto y puntual de recordatorio
      textMessage = `Hola ${booking.nombre}, te recordamos tu clase de ${booking.disciplina} en Studio 8 Pilates el ${booking.fecha} a las ${booking.hora} hs. ¡Te esperamos!`;
    }

    const encoded = encodeURIComponent(textMessage);
    window.open(`https://wa.me/${rawPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DD] shadow-xs overflow-hidden mb-12">
      
      {/* Table Header Bar */}
      <div className="px-6 py-4 border-b border-[#E8E4DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FDFBF7]">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold text-[#1A1A1A] tracking-tight flex items-center gap-2">
            <span>Tabla Semántica de Reservas</span>
            <span className="text-[10px] uppercase font-sans-ui font-semibold bg-[#EAE5D9] text-[#4A453B] px-2 py-0.5 rounded-md">
              Fuente: Excel Inmutable
            </span>
          </h2>
          <p className="text-xs text-[#7A6E5D] mt-0.5">
            Vista analítica de citas, coaches, disciplinas y motor de mensajería segmentada
          </p>
        </div>

        <div className="text-xs text-[#6B655B] font-medium font-mono-numbers bg-[#F5F1E8] px-3 py-1.5 rounded-xl border border-[#E8E4DD]">
          Página <strong className="text-[#1A1A1A]">{safeCurrentPage}</strong> de <strong className="text-[#1A1A1A]">{totalPages}</strong> ({bookings.length} reservas filtradas)
        </div>
      </div>

      {/* Semantic Scrollable Table */}
      <div className="overflow-x-auto min-h-[300px] max-h-[650px] overflow-y-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead className="sticky top-0 bg-[#F5F1E8] z-10 border-b border-[#E8E4DD] text-[11px] font-bold text-[#4A453B] uppercase tracking-wider">
            <tr>
              <th scope="col" className="py-3.5 px-4 text-center w-12">
                N°
              </th>
              <th 
                scope="col" 
                onClick={() => handleSort('recordatorio')}
                className="py-3.5 px-4 cursor-pointer hover:text-[#1A1A1A] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>RECORDATORIO</span>
                  <ArrowUpDown className="w-3 h-3 text-[#8C7A6B]" />
                </div>
              </th>
              <th 
                scope="col" 
                onClick={() => handleSort('nombre')}
                className="py-3.5 px-4 cursor-pointer hover:text-[#1A1A1A] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Cliente</span>
                  <ArrowUpDown className="w-3 h-3 text-[#8C7A6B]" />
                </div>
              </th>
              <th 
                scope="col" 
                onClick={() => handleSort('disciplina')}
                className="py-3.5 px-4 cursor-pointer hover:text-[#1A1A1A] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Disciplina & Clase</span>
                  <ArrowUpDown className="w-3 h-3 text-[#8C7A6B]" />
                </div>
              </th>
              <th 
                scope="col" 
                onClick={() => handleSort('fecha')}
                className="py-3.5 px-4 cursor-pointer hover:text-[#1A1A1A] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Fecha & Hora</span>
                  <ArrowUpDown className="w-3 h-3 text-[#8C7A6B]" />
                </div>
              </th>
              <th 
                scope="col" 
                onClick={() => handleSort('coach')}
                className="py-3.5 px-4 cursor-pointer hover:text-[#1A1A1A] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Coach</span>
                  <ArrowUpDown className="w-3 h-3 text-[#8C7A6B]" />
                </div>
              </th>
              <th scope="col" className="py-3.5 px-4">
                Contacto
              </th>
              <th scope="col" className="py-3.5 px-4 text-right">
                Mensajería WhatsApp
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#F0ECE1] text-xs text-[#1A1A1A]">
            {paginatedBookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-[#7A6E5D] bg-[#FDFBF7]/50">
                  <p className="text-base font-serif-luxury font-bold text-[#1A1A1A]">No se encontraron reservas con estos filtros</p>
                  <p className="text-xs text-[#8C7A6B] mt-1">Ajusta los criterios de búsqueda en la barra superior o limpia los filtros de disciplina/coach</p>
                </td>
              </tr>
            ) : (
              paginatedBookings.map((booking, index) => {
                const globalIndex = (safeCurrentPage - 1) * itemsPerPage + index + 1;
                return (
                  <tr 
                    key={booking.id}
                    onClick={() => onSelectBooking(booking)}
                    className="hover:bg-[#FDFBF7] transition-colors group cursor-pointer"
                  >
                    {/* Index */}
                    <td className="py-3.5 px-4 text-center text-[#8C7A6B] font-mono-numbers text-[11px] font-semibold">
                      {globalIndex}
                    </td>

                    {/* Recordatorio Status Badge (Read-Only) */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        booking.recordatorio
                          ? 'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/30'
                          : 'bg-[#FFF8E1] text-[#B78103] border-[#FFE082]'
                      }`}>
                        {booking.recordatorio ? (
                          <>
                            <Check className="w-3 h-3 text-[#2E7D32]" />
                            <span>Enviado / Confirmado</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-[#B78103]" />
                            <span>Pendiente</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Cliente Name & Email */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-[#1A1A1A] group-hover:text-[#8C7A6B] transition-colors">
                          {booking.nombre} {booking.apellido}
                        </p>
                        <p className="text-[11px] text-[#7A6E5D] truncate max-w-[180px]">
                          {booking.correo || 'Sin correo registrado'}
                        </p>
                      </div>
                    </td>

                    {/* Disciplina & Clase */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="inline-block font-semibold px-2.5 py-0.5 rounded-md bg-[#F5F1E8] text-[#4A453B] text-[11px] border border-[#E8E4DD]">
                          {booking.disciplina}
                        </span>
                        {booking.clase && (
                          <p className="text-[11px] text-[#7A6E5D] font-medium mt-0.5">
                            {booking.clase}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Fecha & Hora */}
                    <td className="py-3.5 px-4 font-mono-numbers">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#1A1A1A] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#8C7A6B]" />
                          {booking.fecha}
                        </span>
                        <span className="text-[11px] text-[#7A6E5D] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#8C7A6B]" />
                          {booking.hora} hs
                        </span>
                      </div>
                    </td>

                    {/* Coach */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-[#EAE5D9] text-[#1A1A1A] font-bold text-[10px] flex items-center justify-center uppercase shrink-0">
                          {booking.coach ? booking.coach.charAt(0) : 'A'}
                        </div>
                        <span className="font-semibold text-[#1A1A1A]">
                          {booking.coach}
                        </span>
                      </div>
                    </td>

                    {/* Contacto Phone */}
                    <td className="py-3.5 px-4 font-mono-numbers">
                      {booking.telefono ? (
                        <span className="text-[#4A453B] bg-[#FDFBF7] px-2 py-1 rounded border border-[#E8E4DD] text-[11px] inline-flex items-center gap-1">
                          <PhoneCall className="w-3 h-3 text-[#8C7A6B]" />
                          {booking.telefono}
                        </span>
                      ) : (
                        <span className="text-[#A8A092] italic text-[11px]">Sin teléfono</span>
                      )}
                    </td>

                    {/* Motor Segmentado WhatsApp Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => openWhatsApp(booking, e)}
                          type="button"
                          className="px-3 py-1.5 rounded-xl font-semibold text-xs bg-[#25D366] hover:bg-[#128C7E] text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
                          title="Enviar mensaje por WhatsApp"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => onSelectBooking(booking)}
                          type="button"
                          className="p-1.5 rounded-xl bg-[#F5F1E8] text-[#4A453B] hover:bg-[#EAE5D9] transition-all cursor-pointer border border-[#E8E4DD]"
                          title="Ver Ficha Completa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Bar */}
      {totalPages > 1 && (
        <div className="px-6 py-3.5 border-t border-[#E8E4DD] bg-[#FDFBF7] flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={safeCurrentPage === 1}
            type="button"
            className="px-3.5 py-1.5 rounded-xl border border-[#E8E4DD] text-xs font-semibold text-[#4A453B] hover:bg-[#F5F1E8] disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center gap-1 overflow-x-auto max-w-[280px] sm:max-w-none">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                type="button"
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  safeCurrentPage === page
                    ? 'bg-[#1A1A1A] text-[#FDFBF7] shadow-xs'
                    : 'text-[#4A453B] hover:bg-[#F5F1E8]'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={safeCurrentPage === totalPages}
            type="button"
            className="px-3.5 py-1.5 rounded-xl border border-[#E8E4DD] text-xs font-semibold text-[#4A453B] hover:bg-[#F5F1E8] disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};

