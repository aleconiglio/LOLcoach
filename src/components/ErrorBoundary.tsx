import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary atrapó un error no controlado:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearAndReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Error clearing storage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-hextech-black text-gray-100 flex items-center justify-center p-4">
          <div className="max-w-lg w-full hextech-card border border-rose-500/50 rounded-lg p-6 shadow-2xl text-center space-y-5 bg-hextech-dark/95">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-cinzel text-hextech-gold-light tracking-wide">
                Error Inesperado de Renderizado
              </h2>
              <p className="text-xs text-gray-300">
                Ocurrió un inconveniente al cargar la interfaz de League of Legends Coach. Puedes recargar o limpiar los datos almacenados en caché.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-hextech-black/80 rounded border border-rose-500/20 text-left text-xs font-mono text-rose-300 overflow-x-auto max-h-36">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="hextech-button w-full sm:w-auto px-5 py-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-hextech-black" />
                <span>RECARGAR PÁGINA</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearAndReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded text-xs font-medium border border-hextech-gold/30 hover:border-hextech-gold text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                title="Borrar memoria caché de datos locales y recargar"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>LIMPIAR DATOS Y REINICIAR</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
