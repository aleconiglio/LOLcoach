import React, { useEffect, useState } from 'react';
import { Sparkles, Download, RefreshCw, ArrowUpCircle, X } from 'lucide-react';

interface UpdaterData {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  version?: string;
  percent?: number;
  error?: string;
}

export const UpdateModal: React.FC = () => {
  const [updaterData, setUpdaterData] = useState<UpdaterData | null>(null);
  const [isClosedManually, setIsClosedManually] = useState(false);

  useEffect(() => {
    if (!window.electronAPI?.onUpdaterStatus) return;

    const cleanup = window.electronAPI.onUpdaterStatus((data: UpdaterData) => {
      console.log('Updater status payload:', data);
      setUpdaterData(data);
      if (data.status === 'available' || data.status === 'downloaded') {
        setIsClosedManually(false);
      }
    });

    return () => cleanup();
  }, []);

  if (!updaterData || isClosedManually) return null;
  if (updaterData.status === 'not-available' || updaterData.status === 'checking') return null;

  const handleUpdateClick = () => {
    if (window.electronAPI?.quitAndInstall) {
      window.electronAPI.quitAndInstall();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-hextech-card border-2 border-gold-500/40 rounded-xl p-6 shadow-2xl shadow-gold-500/20 text-center">
        {/* Dismiss Button */}
        {updaterData.status !== 'downloaded' && (
          <button
            onClick={() => setIsClosedManually(true)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mb-4 shadow-inner">
          {updaterData.status === 'downloaded' ? (
            <Sparkles className="w-8 h-8 text-gold-400 animate-pulse" />
          ) : updaterData.status === 'downloading' ? (
            <Download className="w-8 h-8 text-blue-400 animate-bounce" />
          ) : (
            <ArrowUpCircle className="w-8 h-8 text-gold-400" />
          )}
        </div>

        {/* Title */}
        <h3 className="font-cinzel text-xl font-bold text-gold-300 tracking-wide mb-2">
          {updaterData.status === 'downloaded'
            ? '¡Nueva Actualización Lista!'
            : updaterData.status === 'downloading'
            ? 'Descargando Actualización...'
            : 'Nueva Versión Encontrada'}
        </h3>

        {/* Subtitle / Version */}
        <p className="text-sm text-gray-300 mb-4">
          {updaterData.version ? `Versión ${updaterData.version}` : 'Una nueva versión de la app está disponible.'}
        </p>

        {/* Progress Bar during download */}
        {updaterData.status === 'downloading' && (
          <div className="w-full mb-6">
            <div className="w-full bg-hextech-dark h-3 rounded-full overflow-hidden border border-blue-500/30 p-0.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-teal-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${updaterData.percent || 0}%` }}
              />
            </div>
            <p className="text-xs text-blue-300 mt-2 font-mono">{updaterData.percent || 0}% completado</p>
          </div>
        )}

        {/* Error message if any */}
        {updaterData.status === 'error' && (
          <p className="text-xs text-red-400 bg-red-950/40 p-2 rounded border border-red-500/30 mb-4">
            {updaterData.error}
          </p>
        )}

        {/* Action Button: ACTUALIZAR */}
        {updaterData.status === 'downloaded' ? (
          <button
            onClick={handleUpdateClick}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-gold-500 via-gold-400 to-amber-600 hover:from-gold-400 hover:to-gold-500 text-hextech-dark font-cinzel font-bold text-base tracking-wider rounded-lg shadow-lg hover:shadow-gold-500/50 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
            ACTUALIZAR
          </button>
        ) : updaterData.status === 'downloading' ? (
          <p className="text-xs text-gray-400 italic">La app se actualizará en breve...</p>
        ) : (
          <button
            onClick={() => setIsClosedManually(true)}
            className="w-full py-2.5 px-4 bg-hextech-dark border border-gray-600 hover:border-gray-400 text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            Entendido
          </button>
        )}
      </div>
    </div>
  );
};
