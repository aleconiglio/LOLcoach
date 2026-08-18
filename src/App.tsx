import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { FilterPanel } from './components/FilterPanel';
import { BenchmarkCard } from './components/BenchmarkCard';
import { MatchHistory } from './components/MatchHistory';
import { AnalysisReport } from './components/AnalysisReport';
import { LoadingOverlay } from './components/LoadingOverlay';

import { 
  SearchFormData, 
  AppSettings, 
  MatchDetail, 
  AIAnalysisReport 
} from './types';
import { getStoredSettings, saveStoredSettings } from './services/storage';
import { fetchFullSummonerAnalysis } from './services/riotApi';
import { generateGroqCoachAnalysis } from './services/groqCoach';
import { getMockMatches, getMockAIReport } from './services/mockData';
import { AlertCircle, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [formData, setFormData] = useState<SearchFormData>({
    gameName: '',
    tagLine: 'LAS',
    platform: 'LAS',
    matchCount: 5,
    championFilter: '',
    roleFilter: 'ALL',
    targetRank: 'Gold',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [matches, setMatches] = useState<MatchDetail[] | null>(null);
  const [aiReport, setAiReport] = useState<AIAnalysisReport | null>(null);

  // Synchronize settings changes
  const handleSaveSettings = (newSettings: Partial<AppSettings>) => {
    const updated = saveStoredSettings(newSettings);
    setSettings(updated);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate inputs
    if (!formData.gameName.trim() || !formData.tagLine.trim()) {
      setErrorMessage('Por favor ingresa tanto el Nombre de Invocador como el TagLine.');
      return;
    }

    // Check if we should execute in Demo Mode or Live Mode
    const hasKeys = !!settings.riotApiKey && !!settings.groqApiKey;

    if (!hasKeys && !settings.isDemoMode) {
      // Auto enable demo mode if no keys configured yet so the user can test immediately!
      setIsSettingsOpen(true);
      setErrorMessage('Para realizar consultas en vivo ingresa tus API Keys de Riot y Groq en Configuración, o activa el Modo Demo.');
      return;
    }

    setIsLoading(true);

    try {
      if (settings.isDemoMode || !settings.riotApiKey || !settings.groqApiKey) {
        // DEMO MODE PIPELINE
        setLoadingStatus('Cargando partidas simuladas de Ranked Solo/Duo...');
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockMatchesData = getMockMatches(formData);
        setMatches(mockMatchesData);

        setLoadingStatus(`Generando análisis táctico con Groq AI (${settings.groqModel || 'llama-3.3-70b-specdec'})...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockReport = getMockAIReport(formData);
        setAiReport(mockReport);
      } else {
        // LIVE RIOT API + GROQ PIPELINE
        setLoadingStatus(`Consultando Riot API (${formData.platform}) para ${formData.gameName}#${formData.tagLine}...`);
        
        const { matches: fetchedMatches } = await fetchFullSummonerAnalysis(
          formData.gameName,
          formData.tagLine,
          formData.platform,
          formData.matchCount,
          formData.roleFilter,
          formData.championFilter,
          settings.riotApiKey
        );

        setMatches(fetchedMatches);

        setLoadingStatus(`Analizando Timeline, matchups y comparando contra el Rango Objetivo en Groq AI (${settings.groqModel || 'llama-3.3-70b-specdec'})...`);
        const realReport = await generateGroqCoachAnalysis(
          fetchedMatches,
          formData.targetRank,
          settings.groqApiKey,
          settings.groqModel
        );

        setAiReport(realReport);
      }
    } catch (err: any) {
      console.error('Error durante el análisis:', err);
      setErrorMessage(err.message || 'Ocurrió un error inesperado al procesar el análisis.');
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-hextech-black text-gray-100 flex flex-col font-sans selection:bg-hextech-gold selection:text-black">
      
      {/* Header */}
      <Header
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Filter Panel */}
        <FilterPanel
          formData={formData}
          onChange={(updated) => setFormData((prev) => ({ ...prev, ...updated }))}
          onSubmit={handleSearchSubmit}
          isLoading={isLoading}
        />

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 flex items-start gap-3 shadow-lg animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs md:text-sm">
              <strong className="font-cinzel text-rose-300 block mb-0.5">Error de Procesamiento:</strong>
              {errorMessage}
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-xs underline text-hextech-gold hover:text-white font-cinzel shrink-0"
            >
              Abrir Configuración
            </button>
          </div>
        )}

        {/* Results Container */}
        {matches && matches.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Benchmark Comparison Card */}
            <BenchmarkCard
              matches={matches}
              targetRank={formData.targetRank}
            />

            {/* AI Analysis Report (Visual Cards 1, 2, 3) */}
            {aiReport && (
              <AnalysisReport
                report={aiReport}
                targetRank={formData.targetRank}
              />
            )}

            {/* Match History Breakdown */}
            <MatchHistory matches={matches} />

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-hextech-gold/20 bg-hextech-dark/80 py-4 px-6 text-center text-xs text-gray-500 font-cinzel">
        League of Legends AI Coach • React + Vite + TypeScript + Groq SDK
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay statusText={loadingStatus} />}

    </div>
  );
};
export default App;
