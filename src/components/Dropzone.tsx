import React, { useState, useRef } from 'react';
import { Upload, ArrowRight } from 'lucide-react';

interface DropzoneProps {
  onFileUpload: (file: File) => void;
  onLoadSampleData: () => void;
  isLoading?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileUpload,
  onLoadSampleData,
  isLoading = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 sm:py-12 px-4">
      {/* Brand Badge Hero */}
      <div className="text-center mb-10">
        {/* Studio 8 Official Logo Header in Original Colors */}
        <div className="inline-flex items-center justify-center mb-6">
          <img
            src="https://s8pilates.com/wp-content/uploads/2026/04/Logo_Studio8.png"
            alt="Studio 8 Pilates Logo"
            className="h-14 sm:h-20 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
              const fallback = (e.target as HTMLElement).nextElementSibling;
              if (fallback) (fallback as HTMLElement).style.display = 'flex';
            }}
          />
          <div className="hidden h-12 px-4 bg-[#1A1A1A] text-[#FDFBF7] rounded-xl items-center justify-center font-serif-luxury tracking-widest font-bold text-xl shadow-xs">
            STUDIO 8
          </div>
        </div>

        <h1 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-[#1A1A1A] tracking-tight mb-3">
          Carga tus Reservas
        </h1>
        <p className="text-sm sm:text-base text-[#6B655B] max-w-xl mx-auto leading-relaxed font-medium">
          Arrastra tu archivo Excel o CSV de Studio 8 Pilates para encender el motor de analíticas, desplegar el Bento Grid y explorar la tabla de reservas.
        </p>
      </div>

      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Zona para arrastrar o seleccionar archivo Excel o CSV de reservas"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`group relative w-full border-2 border-dashed rounded-[24px] p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2 ${
          isDragOver
            ? 'border-[#1A1A1A] bg-[#F5F1E8] scale-[1.01] shadow-lg'
            : 'border-[#D9D2C5] hover:border-[#1A1A1A] bg-white hover:bg-[#FDFBF7] shadow-xs hover:shadow-md'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv, .xlsx, .xls"
          className="hidden"
          id="main-dropzone-input"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Animated Magnetic Icon Box */}
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-transform duration-300 ${
            isDragOver ? 'bg-[#1A1A1A] text-[#FDFBF7] scale-110 rotate-3' : 'bg-[#F5F1E8] text-[#1A1A1A] group-hover:scale-105 group-hover:bg-[#EAE5D9]'
          }`}>
            {isLoading ? (
              <div className="w-8 h-8 border-3 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:-translate-y-1" />
            )}
          </div>

          <div>
            <p className="text-lg sm:text-xl font-semibold text-[#1A1A1A] mb-1">
              {isDragOver ? '¡Suelta el archivo aquí!' : 'Haz clic o arrastra tu archivo aquí'}
            </p>
            <p className="text-xs sm:text-sm text-[#7A6E5D] font-medium">
              Soporta archivos <span className="font-semibold text-[#1A1A1A]">.xlsx</span>, <span className="font-semibold text-[#1A1A1A]">.xls</span> o <span className="font-semibold text-[#1A1A1A]">.csv</span>
            </p>
          </div>

          {/* Supported Format Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {['SUBMITED', 'NOMBRE', 'APELLIDO', 'CORREO', 'DISCIPLINA', 'FECHA', 'HORA', 'COACH', 'CLASE', 'REDORDATORIO', 'TELEFONO'].slice(0, 6).map((col) => (
              <span key={col} className="text-[11px] font-mono-numbers px-2.5 py-1 rounded-md bg-[#F5F1E8] text-[#5A5245] border border-[#E8E4DD]">
                {col}
              </span>
            ))}
            <span className="text-[11px] font-medium text-[#8C7A6B]">+5 columnas</span>
          </div>

          {/* Call to action button inside dropzone */}
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1A1A] text-[#FDFBF7] text-xs sm:text-sm font-semibold shadow-sm group-hover:bg-[#333333] transition-all">
              <span>Seleccionar desde el dispositivo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
