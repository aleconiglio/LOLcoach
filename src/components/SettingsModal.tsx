import React, { useState } from 'react';
import { X, Key, Shield, Sparkles, Check, Info } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [riotKey, setRiotKey] = useState(settings.riotApiKey);
  const [groqKey, setGroqKey] = useState(settings.groqApiKey);
  const [groqModel, setGroqModel] = useState(settings.groqModel || 'llama-3.3-70b-versatile');
  const [isDemoMode, setIsDemoMode] = useState(settings.isDemoMode);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      riotApiKey: riotKey,
      groqApiKey: groqKey,
      groqModel: groqModel.trim() || 'llama-3.3-70b-versatile',
      isDemoMode,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const MODEL_OPTIONS = [
    { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile (Recomendado)' },
    { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant (Rápido / Ligero)' },
    { id: 'llama3-70b-8192', label: 'Llama 3 70B 8192' },
    { id: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill Llama 70B (Razonamiento)' },
    { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (32k Context)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-hextech-dark border border-hextech-gold/50 rounded-lg max-w-md w-full shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-hextech-navy/90 border-b border-hextech-gold/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-hextech-gold font-cinzel font-bold text-lg">
            <Key className="w-5 h-5" />
            <span>CONFIGURACIÓN DE API KEYS</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-hextech-gold transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="p-3 bg-hextech-blue/30 border border-hextech-accent/30 rounded text-xs text-gray-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-hextech-cyan shrink-0 mt-0.5" />
            <p>
              Tus claves de API se guardan de forma segura localmente en tu aplicación. NUNCA se hardcodean ni se comparten externamente.
            </p>
          </div>

          {/* Riot API Key Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-hextech-gold flex items-center gap-1.5 font-cinzel">
              <Shield className="w-4 h-4 text-amber-400" />
              Riot Games API Key
            </label>
            <input
              type="password"
              value={riotKey}
              onChange={(e) => setRiotKey(e.target.value)}
              placeholder="RGAPI-xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="w-full px-3 py-2 text-sm bg-hextech-black/80 border border-hextech-gold/30 rounded focus:border-hextech-gold text-gray-100 placeholder-gray-600 focus:outline-none transition-all font-mono"
            />
            <p className="text-[11px] text-gray-400">
              Obtén tu Developer Key gratuita en{' '}
              <a
                href="https://developer.riotgames.com/"
                target="_blank"
                rel="noreferrer"
                className="text-hextech-cyan underline hover:text-hextech-gold-light"
              >
                developer.riotgames.com
              </a>
            </p>
          </div>

          {/* Groq API Key Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-hextech-gold flex items-center gap-1.5 font-cinzel">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Groq Cloud API Key
            </label>
            <input
              type="password"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 text-sm bg-hextech-black/80 border border-hextech-gold/30 rounded focus:border-hextech-gold text-gray-100 placeholder-gray-600 focus:outline-none transition-all font-mono"
            />
            <p className="text-[11px] text-gray-400">
              Obtén tu API Key gratuita para Groq LLM en{' '}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-hextech-cyan underline hover:text-hextech-gold-light"
              >
                console.groq.com
              </a>
            </p>
          </div>

          {/* Groq LLM Model Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-hextech-gold flex items-center gap-1.5 font-cinzel">
              <Sparkles className="w-4 h-4 text-hextech-cyan" />
              Modelo LLM de Groq
            </label>
            <select
              value={MODEL_OPTIONS.some((m) => m.id === groqModel) ? groqModel : 'custom'}
              onChange={(e) => {
                if (e.target.value !== 'custom') {
                  setGroqModel(e.target.value);
                }
              }}
              className="w-full px-3 py-2 text-sm bg-hextech-black/80 border border-hextech-gold/30 rounded focus:border-hextech-gold text-gray-100 focus:outline-none transition-all font-sans cursor-pointer"
            >
              {MODEL_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} ({opt.id})
                </option>
              ))}
              <option value="custom">Otro modelo personalizado...</option>
            </select>

            {(!MODEL_OPTIONS.some((m) => m.id === groqModel) || groqModel === 'custom') && (
              <input
                type="text"
                value={groqModel === 'custom' ? '' : groqModel}
                onChange={(e) => setGroqModel(e.target.value)}
                placeholder="Ej: llama-3.3-70b-versatile"
                className="w-full mt-1.5 px-3 py-2 text-sm bg-hextech-black/80 border border-hextech-gold/30 rounded focus:border-hextech-gold text-gray-100 placeholder-gray-600 focus:outline-none transition-all font-mono"
              />
            )}
            <p className="text-[11px] text-gray-400">
              Modelos soportados en la API de Groq Cloud (ej: <code className="text-hextech-gold-light">llama-3.3-70b-versatile</code>).
            </p>
          </div>

          {/* Demo Mode Checkbox */}
          <div className="pt-2 border-t border-hextech-gold/20 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-200 block font-cinzel">Modo Demo / Prueba Rápidas</span>
              <span className="text-[11px] text-gray-400 block">Usar datos simulados para probar la UI e IA de coaching sin consumos de API.</span>
            </div>
            <input
              type="checkbox"
              checked={isDemoMode}
              onChange={(e) => setIsDemoMode(e.target.checked)}
              className="w-4 h-4 rounded border-hextech-gold text-hextech-gold focus:ring-hextech-gold bg-hextech-black cursor-pointer"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="hextech-button px-5 py-2 rounded text-xs flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950" />
                  <span>¡GUARDADO!</span>
                </>
              ) : (
                <span>GUARDAR CAMBIOS</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
