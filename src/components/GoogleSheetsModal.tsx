import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  googleSignIn, 
  googleSignOut, 
  getAccessToken 
} from '../services/googleAuth';
import { 
  listUserSpreadsheets, 
  fetchSpreadsheetMetadata, 
  fetchSpreadsheetValues, 
  convertSheetDataToBookings, 
  extractSpreadsheetId,
  GoogleDriveSheetFile, 
  SheetTabInfo 
} from '../services/googleSheets';
import { PilatesBooking } from '../types';
import { 
  X, 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Link as LinkIcon, 
  LogOut, 
  Layers, 
  Search,
  Sparkles
} from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSheetDataLoaded: (bookings: PilatesBooking[], sheetName: string) => void;
  currentUser: User | null;
  onUserChanged: (user: User | null) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  onSheetDataLoaded,
  currentUser,
  onUserChanged,
}) => {
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isLoadingSync, setIsLoadingSync] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drive files & selection
  const [spreadsheets, setSpreadsheets] = useState<GoogleDriveSheetFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [customUrlOrId, setCustomUrlOrId] = useState<string>('');
  const [activeTabMode, setActiveTabMode] = useState<'drive' | 'custom'>('drive');

  // Metadata of selected sheet
  const [metadata, setMetadata] = useState<{ title: string; sheets: SheetTabInfo[] } | null>(null);
  const [selectedTabName, setSelectedTabName] = useState<string>('');

  if (!isOpen) return null;

  // Handle Google Sign In
  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        onUserChanged(result.user);
        await loadSpreadsheets(result.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al conectar con tu cuenta de Google');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await googleSignOut();
      onUserChanged(null);
      setSpreadsheets([]);
      setMetadata(null);
      setSelectedFileId('');
    } catch (err: any) {
      console.error(err);
    }
  };

  // Fetch list of spreadsheets from Drive
  const loadSpreadsheets = async (token?: string) => {
    const accessToken = token || (await getAccessToken());
    if (!accessToken) return;

    setIsLoadingFiles(true);
    setError(null);
    try {
      const files = await listUserSpreadsheets(accessToken);
      setSpreadsheets(files);
      if (files.length > 0 && !selectedFileId) {
        // Look for automatic S8 file first
        const s8File = files.find(f => f.name.toLowerCase().includes('s8') || f.name.toLowerCase().includes('pilates') || f.name.toLowerCase().includes('automatizacion'));
        const defaultFile = s8File || files[0];
        setSelectedFileId(defaultFile.id);
        await handleFileSelected(defaultFile.id, accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setError('No se pudieron listar las hojas de Google Drive. Puedes pegar el enlace de tu hoja directamente.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // When a file is picked, inspect its tabs
  const handleFileSelected = async (fileId: string, tokenOverride?: string) => {
    setSelectedFileId(fileId);
    setMetadata(null);
    setSelectedTabName('');
    setError(null);

    const accessToken = tokenOverride || (await getAccessToken());
    if (!accessToken) return;

    try {
      const meta = await fetchSpreadsheetMetadata(accessToken, fileId);
      setMetadata(meta);
      if (meta.sheets.length > 0) {
        setSelectedTabName(meta.sheets[0].title);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al inspeccionar la estructura de la hoja seleccionada');
    }
  };

  // Inspect custom URL or ID
  const handleInspectCustomUrl = async () => {
    const rawId = extractSpreadsheetId(customUrlOrId);
    if (!rawId) {
      setError('Por favor ingresa una URL válida de Google Sheets o el ID del documento');
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      setError('Debes iniciar sesión con Google para acceder a la hoja');
      return;
    }

    setError(null);
    setIsLoadingFiles(true);
    try {
      const meta = await fetchSpreadsheetMetadata(accessToken, rawId);
      setMetadata(meta);
      setSelectedFileId(rawId);
      if (meta.sheets.length > 0) {
        setSelectedTabName(meta.sheets[0].title);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'No se pudo acceder a la hoja. Asegúrate de tener permisos en tu cuenta de Google.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Perform full sync
  const handleSyncData = async () => {
    const targetFileId = selectedFileId || extractSpreadsheetId(customUrlOrId);
    if (!targetFileId) {
      setError('Selecciona o ingresa una hoja de Google Sheets');
      return;
    }

    if (!selectedTabName) {
      setError('Selecciona la pestaña/hoja que contiene las reservas');
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      setError('Sesión expirada. Vuelve a iniciar sesión con Google');
      return;
    }

    setIsLoadingSync(true);
    setError(null);
    try {
      const values = await fetchSpreadsheetValues(accessToken, targetFileId, selectedTabName);
      if (!values || values.length < 2) {
        throw new Error('La pestaña seleccionada está vacía o no contiene filas de datos');
      }

      const bookings = convertSheetDataToBookings(values);
      if (bookings.length === 0) {
        throw new Error('No se reconocieron columnas de reservas en la hoja de cálculo');
      }

      const sheetTitle = metadata?.title ? `${metadata.title} (${selectedTabName})` : `Google Sheets (${selectedTabName})`;
      onSheetDataLoaded(bookings, sheetTitle);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al sincronizar datos de Google Sheets');
    } finally {
      setIsLoadingSync(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-[#FDFBF7] rounded-2xl border border-[#E8E4DD] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1A1A1A] text-[#FDFBF7] p-5 sm:p-6 flex items-center justify-between border-b border-[#2B2823]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F9D58]/20 border border-[#0F9D58]/40 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-[#81C784]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold">
                  Conexión con Google Sheets
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F9D58] text-white">
                  En Vivo
                </span>
              </div>
              <p className="text-xs text-[#A8A092] mt-0.5">
                Sincroniza en tiempo real tu base de datos de Studio 8 Pilates directamente desde la nube
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-xl bg-[#2B2823] text-[#EAE5D9] hover:bg-[#38332B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-[#1A1A1A]">
          
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
              </div>
            </div>
          )}

          {/* User Auth Card */}
          <div className="bg-white p-4 rounded-xl border border-[#E8E4DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || 'Usuario'} 
                    className="w-10 h-10 rounded-full border border-[#D9D2C5]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-sm">
                    {currentUser.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-[#1A1A1A]">
                      {currentUser.displayName || 'Cuenta Google'}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-full font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Conectado
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A6E5D] font-mono-numbers">
                    {currentUser.email}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-sm text-[#1A1A1A] mb-0.5">
                  Conecta tu cuenta de Google
                </p>
                <p className="text-[#7A6E5D] text-[11px]">
                  Permite leer tus hojas de cálculo de Drive de forma segura sin salir de la app
                </p>
              </div>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadSpreadsheets()}
                  disabled={isLoadingFiles}
                  type="button"
                  className="px-3 py-1.5 rounded-lg border border-[#E8E4DD] bg-[#FDFBF7] hover:bg-[#F5F1E8] text-[#4A453B] font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Refrescar lista de Drive"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  <span>Refrescar</span>
                </button>
                <button
                  onClick={handleSignOut}
                  type="button"
                  className="px-3 py-1.5 rounded-lg border border-[#FFCDD2] bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desconectar</span>
                </button>
              </div>
            ) : (
              /* Official Google Sign-In Styled Button */
              <button
                onClick={handleSignIn}
                disabled={isLoadingAuth}
                type="button"
                className="px-4 py-2.5 bg-white hover:bg-[#F5F1E8] text-[#3c4043] font-semibold text-xs rounded-xl border border-[#dadce0] shadow-2xs hover:shadow-sm transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isLoadingAuth ? 'Conectando...' : 'Iniciar sesión con Google'}</span>
              </button>
            )}
          </div>

          {/* Mode Switcher */}
          {currentUser && (
            <div className="space-y-4">
              <div className="flex border-b border-[#E8E4DD]">
                <button
                  type="button"
                  onClick={() => setActiveTabMode('drive')}
                  className={`pb-2.5 px-4 font-semibold text-xs transition-all border-b-2 cursor-pointer ${
                    activeTabMode === 'drive'
                      ? 'border-[#1A1A1A] text-[#1A1A1A]'
                      : 'border-transparent text-[#7A6E5D] hover:text-[#1A1A1A]'
                  }`}
                >
                  Seleccionar de Google Drive ({spreadsheets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabMode('custom')}
                  className={`pb-2.5 px-4 font-semibold text-xs transition-all border-b-2 cursor-pointer ${
                    activeTabMode === 'custom'
                      ? 'border-[#1A1A1A] text-[#1A1A1A]'
                      : 'border-transparent text-[#7A6E5D] hover:text-[#1A1A1A]'
                  }`}
                >
                  Pegar Enlace o ID de Hoja
                </button>
              </div>

              {/* Mode 1: Drive Spreadsheets List */}
              {activeTabMode === 'drive' && (
                <div className="space-y-2">
                  <label className="font-semibold text-xs text-[#1A1A1A] flex items-center justify-between">
                    <span>Hojas de cálculo encontradas en tu Drive:</span>
                    {isLoadingFiles && <span className="text-[#8C7A6B]">Cargando...</span>}
                  </label>

                  {spreadsheets.length === 0 ? (
                    <div className="p-6 bg-white rounded-xl border border-[#E8E4DD] text-center text-[#7A6E5D]">
                      {isLoadingFiles ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-[#8C7A6B]" />
                          <span>Buscando hojas de cálculo en tu Drive...</span>
                        </div>
                      ) : (
                        <p>No se encontraron hojas de cálculo. Puedes cambiar a "Pegar Enlace o ID de Hoja".</p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[190px] overflow-y-auto pr-1">
                      {spreadsheets.map((file) => {
                        const isSelected = selectedFileId === file.id;
                        return (
                          <div
                            key={file.id}
                            onClick={() => handleFileSelected(file.id)}
                            role="button"
                            tabIndex={0}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                              isSelected
                                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                                : 'bg-white hover:bg-[#F5F1E8] border-[#E8E4DD] text-[#1A1A1A]'
                            }`}
                          >
                            <FileSpreadsheet className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-[#81C784]' : 'text-[#0F9D58]'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs truncate leading-snug">
                                {file.name}
                              </p>
                              {file.modifiedTime && (
                                <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-[#8C7A6B]'}`}>
                                  Modificado: {new Date(file.modifiedTime).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: Custom URL or Spreadsheet ID */}
              {activeTabMode === 'custom' && (
                <div className="bg-white p-4 rounded-xl border border-[#E8E4DD] space-y-3">
                  <label className="font-semibold text-xs text-[#1A1A1A] block">
                    URL completa de Google Sheets o ID del documento:
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                      <input
                        type="text"
                        value={customUrlOrId}
                        onChange={(e) => setCustomUrlOrId(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5n.../edit"
                        className="w-full pl-9 pr-3 py-2 bg-[#FDFBF7] border border-[#E8E4DD] rounded-xl text-xs text-[#1A1A1A] placeholder-[#9A9080] focus:outline-none focus:border-[#1A1A1A]"
                      />
                    </div>
                    <button
                      onClick={handleInspectCustomUrl}
                      disabled={isLoadingFiles || !customUrlOrId.trim()}
                      type="button"
                      className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#333333] text-white font-semibold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLoadingFiles ? 'Verificando...' : 'Inspeccionar'}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#7A6E5D]">
                    Asegúrate de que la hoja esté compartida con la cuenta con la que iniciaste sesión.
                  </p>
                </div>
              )}

              {/* Sheet Metadata & Tab Selector (if loaded) */}
              {metadata && (
                <div className="p-4 bg-[#F5F1E8] rounded-xl border border-[#E8E4DD] space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#8C7A6B] block">
                        Hoja Identificada
                      </span>
                      <p className="font-serif-luxury text-base font-bold text-[#1A1A1A]">
                        {metadata.title}
                      </p>
                    </div>

                    <a
                      href={`https://docs.google.com/spreadsheets/d/${selectedFileId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#1A1A1A] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <span>Abrir en Google Sheets</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Tab Selector */}
                  <div>
                    <label className="text-xs font-semibold text-[#4A453B] block mb-1.5">
                      Pestaña de datos a sincronizar:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {metadata.sheets.map((s) => {
                        const isTabSelected = selectedTabName === s.title;
                        return (
                          <button
                            key={s.sheetId}
                            type="button"
                            onClick={() => setSelectedTabName(s.title)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                              isTabSelected
                                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                                : 'bg-white text-[#4A453B] hover:bg-[#EAE5D9] border-[#E8E4DD]'
                            }`}
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>{s.title}</span>
                            {s.rowCount && (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono-numbers ${isTabSelected ? 'bg-white/20' : 'bg-[#F5F1E8]'}`}>
                                {s.rowCount} filas
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#F5F1E8] p-4 sm:p-5 border-t border-[#E8E4DD] flex items-center justify-between gap-3">
          <p className="text-[11px] text-[#7A6E5D] font-medium hidden sm:block">
            * Lee directamente columnas: SUBMITED, FECHA, COACH, REDORDATORIO, ESTATUS, etc.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 bg-white hover:bg-[#EAE5D9] text-[#1A1A1A] font-semibold text-xs rounded-xl border border-[#E8E4DD] transition-all cursor-pointer"
            >
              Cancelar
            </button>

            {currentUser && (
              <button
                onClick={handleSyncData}
                disabled={isLoadingSync || !selectedFileId || !selectedTabName}
                type="button"
                className="px-5 py-2.5 bg-[#0F9D58] hover:bg-[#0B8043] text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isLoadingSync ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sincronizando reservas...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Sincronizar con Dashboard</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
