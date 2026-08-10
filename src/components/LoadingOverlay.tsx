import React from 'react';
import { Loader2, Sparkles, Shield, Cpu } from 'lucide-react';

interface LoadingOverlayProps {
  statusText: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ statusText }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-hextech-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-hextech-dark border-2 border-hextech-gold/50 rounded-lg p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Glowing backdrop circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-hextech-gold/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Animated Hextech Ring */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-t-hextech-gold border-r-hextech-cyan border-b-hextech-gold-dark border-l-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-2 border-t-transparent border-r-hextech-gold border-b-transparent border-l-hextech-cyan animate-ping opacity-25"></div>
          <Sparkles className="w-10 h-10 text-hextech-gold animate-pulse" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-hextech-gold-light font-cinzel tracking-wider">
            ANALIZANDO RENDIMIENTO DE INVOCADOR
          </h3>
          <p className="text-xs text-hextech-cyan font-mono animate-pulse">
            {statusText || 'Procesando datos con Riot API & Groq LLM...'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 text-gray-400 text-xs border-t border-hextech-gold/20 pt-4 font-cinzel">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-amber-400" /> Riot Match-V5
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Groq Llama-3.3-70b
          </span>
        </div>

      </div>
    </div>
  );
};
