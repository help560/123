import React from 'react';
import { PilatesBooking } from '../types';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Award, 
  Activity, 
  Check, 
  BellRing,
  HeartHandshake,
  ShieldCheck
} from 'lucide-react';

interface BookingDetailModalProps {
  booking: PilatesBooking | null;
  onClose: () => void;
}

const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.87 11.87 0 005.71 1.454h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  onClose,
}) => {
  if (!booking) return null;

  const handleWhatsApp = () => {
    const rawPhone = booking.telefono ? booking.telefono.replace(/[^0-9]/g, '') : '';
    if (!rawPhone) {
      alert(`No hay número de teléfono registrado para ${booking.nombre} ${booking.apellido}`);
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
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-[#FDFBF7] rounded-2xl border border-[#E8E4DD] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#1A1A1A] text-[#FDFBF7] p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C8BFA8] px-2.5 py-0.5 rounded bg-[#38332B] inline-block">
                Ficha Analítica Studio 8
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#81C784] px-2 py-0.5 rounded bg-[#38332B] inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Read-Only
              </span>
            </div>
            <h3 className="font-serif-luxury text-2xl font-bold">
              {booking.nombre} {booking.apellido}
            </h3>
            <p className="text-xs text-[#A8A092] mt-0.5 font-mono-numbers">
              ID Registro: {booking.id}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-xl bg-[#38332B] text-[#EAE5D9] hover:bg-[#4A453B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs text-[#1A1A1A]">
          
          {/* Status Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
            booking.recordatorio
              ? 'bg-[#2E7D32]/10 border-[#2E7D32]/30 text-[#2E7D32]'
              : 'bg-[#FFF8E1] border-[#FFE082] text-[#B78103]'
          }`}>
            <div className="flex items-center gap-2 font-semibold text-sm">
              {booking.recordatorio ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Recordatorio: Enviado / Confirmado</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Recordatorio: Pendiente</span>
                </>
              )}
            </div>
          </div>

          {/* Key Grid Information */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-xl border border-[#E8E4DD]">
              <span className="text-[10px] font-semibold text-[#8C7A6B] uppercase block mb-1">
                Disciplina
              </span>
              <p className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#8C7A6B]" />
                {booking.disciplina}
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E8E4DD]">
              <span className="text-[10px] font-semibold text-[#8C7A6B] uppercase block mb-1">
                Tipo de Clase
              </span>
              <p className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#8C7A6B]" />
                {booking.clase || 'General'}
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E8E4DD]">
              <span className="text-[10px] font-semibold text-[#8C7A6B] uppercase block mb-1">
                Fecha
              </span>
              <p className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-1.5 font-mono-numbers">
                <Calendar className="w-4 h-4 text-[#8C7A6B]" />
                {booking.fecha}
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E8E4DD]">
              <span className="text-[10px] font-semibold text-[#8C7A6B] uppercase block mb-1">
                Hora
              </span>
              <p className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-1.5 font-mono-numbers">
                <Clock className="w-4 h-4 text-[#8C7A6B]" />
                {booking.hora} hs
              </p>
            </div>
          </div>

          {/* Coach & Contact Info */}
          <div className="bg-white p-4 rounded-xl border border-[#E8E4DD] space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE1]">
              <span className="text-[#7A6E5D] font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#8C7A6B]" /> Coach Asignada:
              </span>
              <span className="font-semibold text-[#1A1A1A] text-sm">{booking.coach}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE1]">
              <span className="text-[#7A6E5D] font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#8C7A6B]" /> Correo Electrónico:
              </span>
              <span className="font-semibold text-[#1A1A1A] truncate max-w-[200px]">
                {booking.correo || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#7A6E5D] font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#8C7A6B]" /> Teléfono WhatsApp:
              </span>
              <span className="font-semibold text-[#1A1A1A] font-mono-numbers">
                {booking.telefono || '—'}
              </span>
            </div>
          </div>

          {booking.submited && (
            <p className="text-[11px] text-[#A8A092] italic text-right font-mono-numbers">
              Submited: {booking.submited}
            </p>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-[#F5F1E8] p-4 border-t border-[#E8E4DD] flex items-center justify-between gap-3">
          <p className="text-[11px] text-[#7A6E5D] font-medium">
            * Mensajería personalizada según estatus del Excel
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsApp}
              type="button"
              className="px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
              title="Enviar mensaje por WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Enviar por WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#333333] text-[#FDFBF7] font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

