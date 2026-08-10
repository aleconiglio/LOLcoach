import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Sparkles, X, CheckCircle2, AlertTriangle, ArrowUpCircle } from 'lucide-react';

interface UpdaterStatusData {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  version?: string;
  percent?: number;
  bytesPerSecond?: number;
  transferred?: number;
  total?: number;
  error?: string;
}

export const UpdateNotifier: React.FC = () => {
  const [updaterData, setUpdaterData] = useState<UpdaterStatusData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!window.electronAPI?.onUpdaterStatus) return;

    const cleanup = window.electronAPI.onUpdaterStatus((data: UpdaterStatusData) => {
      setUpdaterData(data);

      if (data.status === 'available' || data.status === 'downloading' || data.status === 'downloaded' || data.status === 'error') {
        setIsVisible(true);
      } else if (data.status === 'not-available') {
        // Show brief notification then auto-hide
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 4000);
      }
    });

    return () => cleanup();
  }, []);

  if (!isVisible || !updaterData) return null;

  const handleQuitAndInstall = () => {
    if (window.electronAPI?.quitAndInstall) {
      window.electronAPI.quitAndInstall();
    }
  };

  const formatSpeed = (bytesPerSec?: number) => {
    if (!bytesPerSec) return '';
    const mb = bytesPerSec / (1024 * 1024);
    return `${mb.toFixed(1)} MB/s`;
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-bounce-in">
      <div className="hextech-card rounded-lg p-4 border-2 border-hextech-gold/60 shadow-[0_10px_35px_rgba(0,0,0,0.9)] backdrop-blur-xl relative overflow-hidden">
        
        {/* Glow accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-hextech-cyan via-hextech-gold to-amber-400"></div>

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2.5 right-2.5 text-gray-400 hover:text-hextech-gold transition-colors"
          title="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content depending on status */}
        <div className="flex items-start gap-3 pt-1">
          {/* Icon */}
          <div className="p-2.5 rounded-lg bg-hextech-navy border border-hextech-gold/30 text-hextech-gold shrink-0 mt-0.5">
            {updaterData.status === 'downloading' ? (
              <Download className="w-5 h-5 animate-bounce text-hextech-cyan" />
            ) : updaterData.status === 'downloaded' ? (
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            ) : updaterData.status === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            ) : updaterData.status === 'not-available' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <ArrowUpCircle className="w-5 h-5 text-hextech-gold animate-spin" />
            )}
          </div>

          {/* Text & Action Details */}
          <div className="flex-1 text-xs">
            
            {updaterData.status === 'checking' && (
              <div>
                <h4 className="font-cinzel font-bold text-hextech-gold text-sm tracking-wide">
                  BUSCANDO ACTUALIZACIONES...
                </h4>
                <p className="text-gray-300 mt-1">Conectando con el repositorio de GitHub (aleconiglio/LOLcoach)...</p>
              </div>
            )}

            {updaterData.status === 'available' && (
              <div>
                <h4 className="font-cinzel font-bold text-hextech-gold-light text-sm tracking-wide flex items-center gap-1.5">
                  ¡NUEVA VERSIÓN DETECTADA! <span className="text-hextech-cyan font-mono">v{updaterData.version}</span>
                </h4>
                <p className="text-gray-300 mt-1">Iniciando descarga automática de la actualización...</p>
              </div>
            )}

            {updaterData.status === 'downloading' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-cinzel font-bold text-hextech-gold text-sm tracking-wide">
                    DESCARGANDO ACTUALIZACIÓN v{updaterData.version}...
                  </h4>
                  <span className="font-mono text-hextech-cyan font-bold text-xs">
                    {updaterData.percent || 0}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-hextech-dark/90 h-2.5 rounded-full border border-hextech-gold/30 overflow-hidden relative">
                  <div
                    className="bg-gradient-to-r from-hextech-cyan via-hextech-gold to-amber-300 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${updaterData.percent || 0}%` }}
                  ></div>
                </div>

                {updaterData.bytesPerSecond && (
                  <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                    <span>Velocidad: {formatSpeed(updaterData.bytesPerSecond)}</span>
                  </div>
                )}
              </div>
            )}

            {updaterData.status === 'downloaded' && (
              <div className="space-y-2.5">
                <div>
                  <h4 className="font-cinzel font-bold text-emerald-300 text-sm tracking-wide">
                    ¡ACTUALIZACIÓN LISTA PARA INSTALAR! (v{updaterData.version})
                  </h4>
                  <p className="text-gray-200 mt-0.5">
                    La versión se descargó correctamente. Reinicia para aplicar los últimos cambios.
                  </p>
                </div>

                <button
                  onClick={handleQuitAndInstall}
                  className="hextech-button w-full py-2 px-4 rounded text-xs tracking-wider flex items-center justify-center gap-2 font-bold cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-black animate-spin" />
                  <span>REINICIAR Y ACTUALIZAR AHORA</span>
                </button>
              </div>
            )}

            {updaterData.status === 'not-available' && (
              <div>
                <h4 className="font-cinzel font-bold text-emerald-400 text-sm tracking-wide">
                  APLICACIÓN ACTUALIZADA
                </h4>
                <p className="text-gray-300 mt-1">Ya estás utilizando la versión más reciente del Coach.</p>
              </div>
            )}

            {updaterData.status === 'error' && (
              <div>
                <h4 className="font-cinzel font-bold text-rose-400 text-sm tracking-wide">
                  ERROR DE AUTO-ACTUALIZADOR
                </h4>
                <p className="text-rose-200 mt-1 truncate" title={updaterData.error}>
                  {updaterData.error || 'No se pudo comprobar la versión en GitHub.'}
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
