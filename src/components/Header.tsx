import React, { useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  fileName: string | null;
  totalCount: number;
  onFileUpload: (file: File) => void;
  onLoadSampleData: () => void;
  onExport: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  fileName,
  totalCount,
  onFileUpload,
  onLoadSampleData,
  onExport,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8E4DD] px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand & Studio 8 Logo Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 flex items-center shrink-0">
              <img
                src="https://s8pilates.com/wp-content/uploads/2026/04/Logo_Studio8.png"
                alt="Studio 8 Pilates Logo"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const fallback = (e.target as HTMLElement).nextElementSibling;
                  if (fallback) (fallback as HTMLElement).style.display = 'flex';
                }}
              />
              <div className="hidden h-9 px-3 bg-[#1A1A1A] text-[#FDFBF7] rounded-xl items-center justify-center font-serif-luxury tracking-widest font-bold text-base shadow-2xs">
                S8
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury text-xl md:text-2xl font-bold tracking-tight text-[#1A1A1A]">
                  STUDIO 8
                </span>
              </div>
            </div>
          </div>

          {/* Mobile status indicator */}
          {totalCount > 0 && (
            <div className="md:hidden flex items-center gap-1.5 text-xs text-[#4A453B] font-medium bg-[#F5F1E8] px-2.5 py-1 rounded-lg border border-[#E8E4DD]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>{totalCount} reservas</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv, .xlsx, .xls"
            className="hidden"
            id="header-file-upload"
          />

          {/* Current File status tag */}
          {fileName && (
            <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-[#4A453B] bg-[#F5F1E8] px-3 py-2 rounded-xl border border-[#E8E4DD]">
              <FileSpreadsheet className="w-4 h-4 text-[#7A6E5D]" />
              <span className="truncate max-w-[160px]">{fileName}</span>
              <span className="bg-[#1A1A1A] text-[#FDFBF7] text-[10px] px-1.5 py-0.5 rounded-md font-mono-numbers">
                {totalCount}
              </span>
            </div>
          )}

          {/* Upload File Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            type="button"
            className="text-xs sm:text-sm font-semibold text-[#FDFBF7] bg-[#1A1A1A] hover:bg-[#333333] px-4 py-2 rounded-xl border border-[#1A1A1A] transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Upload className="w-4 h-4 text-[#EAE5D9]" />
            <span>Cargar Excel / CSV</span>
          </button>



          {totalCount > 0 && (
            <button
              onClick={onResetData}
              type="button"
              className="text-xs font-semibold text-[#8C7A6B] hover:text-[#C62828] bg-[#F5F1E8] hover:bg-[#FFEBEE] px-2.5 py-2 rounded-xl border border-[#E8E4DD] transition-all cursor-pointer"
              title="Reiniciar a Estado Cero"
            >
              Reiniciar
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

