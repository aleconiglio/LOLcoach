import React from 'react';
import { Settings, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { AppSettings } from '../types';

interface HeaderProps {
  settings: AppSettings;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ settings, onOpenSettings }) => {
  const hasRiotKey = !!settings.riotApiKey;
  const hasGroqKey = !!settings.groqApiKey;

  return (
    <header className="border-b border-hextech-gold/30 bg-hextech-dark/95 backdrop-blur-md px-6 py-4 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-hextech-gold-dark via-hextech-gold to-hextech-gold-light p-[2px] shadow-hextech-gold">
            <div className="w-full h-full bg-hextech-black rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-hextech-gold" />
            </div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-hextech-gold-light via-hextech-gold to-hextech-gold-dark font-cinzel">
              LEAGUE OF LEGENDS AI COACH
            </h1>
            <p className="text-xs text-gray-400 font-sans tracking-wide">
              Análisis Avanzado de Partidas con Riot API & Groq LLM ({settings.groqModel || 'llama-3.3-70b-versatile'})
            </p>
          </div>
        </div>

        {/* Status Indicators & Settings Button */}
        <div className="flex items-center gap-3">
          {/* Demo Mode Badge */}
          {settings.isDemoMode && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Modo Demo Activo
            </span>
          )}

          {/* Riot API Badge */}
          <div className={`px-2.5 py-1 text-xs font-medium rounded border flex items-center gap-1.5 ${
            hasRiotKey 
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40' 
              : 'bg-rose-950/40 text-rose-300 border-rose-500/40'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Riot API: {hasRiotKey ? 'Configurado' : 'Pendiente'}</span>
          </div>

          {/* Groq API Badge */}
          <div className={`px-2.5 py-1 text-xs font-medium rounded border flex items-center gap-1.5 ${
            hasGroqKey 
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40' 
              : 'bg-rose-950/40 text-rose-300 border-rose-500/40'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Groq AI: {hasGroqKey ? 'Configurado' : 'Pendiente'}</span>
          </div>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-md bg-hextech-navy hover:bg-hextech-blue border border-hextech-gold/30 hover:border-hextech-gold text-hextech-gold hover:text-hextech-gold-light transition-all flex items-center gap-1.5 text-xs font-semibold font-cinzel"
            title="Configuración de API Keys"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Configuración</span>
          </button>
        </div>

      </div>
    </header>
  );
};
