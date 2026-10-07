import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { FilterPanel } from './components/FilterPanel';
import { BenchmarkCard } from './components/BenchmarkCard';
import { MatchHistory } from './components/MatchHistory';
import { AnalysisReport } from './components/AnalysisReport';
import { LoadingOverlay } from './components/LoadingOverlay';
import { BuildAdvisor } from './components/BuildAdvisor';

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
import { AlertCircle, Sparkles, RefreshCw, CheckCircle2, Shield, BarChart3 } from 'lucide-react';

export const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'build-advisor' | 'history'>('build-advisor');

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

        setLoadingStatus('Generando análisis táctico con Groq AI...');
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockReport = getMockAIReport(formData);
        const enrichedMockMatches = mockMatchesData.map((m, idx) => ({
          ...m,
          aiBreakdown: mockReport.matchBreakdowns?.[idx],
        }));
        setMatches(enrichedMockMatches);
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
          settings.riotApiKey,
          formData.targetRank,
          (current, target) => {
            setLoadingStatus(`Recuperando partidas válidas (${current}/${target})...`);
          }
        );

        setLoadingStatus('Generando análisis táctico de coaching con Groq AI...');
        const realReport = await generateGroqCoachAnalysis(
          fetchedMatches,
          formData.targetRank,
          settings.groqApiKey
        );

        // Vincular el desglose de IA hiper-específico a cada partida individual
        const enrichedMatches = fetchedMatches.map((m, idx) => {
          const breakdown =
            realReport.matchBreakdowns?.find(
              (b) => b.game === idx + 1 || (b.matchId && b.matchId === m.matchId)
            ) || realReport.matchBreakdowns?.[idx];
          return {
            ...m,
            aiBreakdown: breakdown,
          };
        });

        setMatches(enrichedMatches);
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
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Navigation Tabs (Top Mobile & Desktop) */}
        <div className="flex items-center gap-2 border-b border-hextech-gold/20 pb-3 flex-wrap">
          <button
            onClick={() => setActiveTab('build-advisor')}
            className={`px-4 py-2 rounded text-xs font-bold font-cinzel transition-all flex items-center gap-2 ${
              activeTab === 'build-advisor'
                ? 'bg-hextech-gold text-black shadow-lg shadow-hextech-gold/20'
                : 'bg-hextech-navy/60 border border-hextech-gold/20 text-gray-300 hover:text-hextech-gold hover:border-hextech-gold/40'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>BUILD ADVISOR (PARTIDA ACTIVA)</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-black ${
              activeTab === 'build-advisor' ? 'bg-black text-hextech-gold' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
            }`}>
              NUEVO
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded text-xs font-bold font-cinzel transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-hextech-gold text-black shadow-lg shadow-hextech-gold/20'
                : 'bg-hextech-navy/60 border border-hextech-gold/20 text-gray-300 hover:text-hextech-gold hover:border-hextech-gold/40'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>COACH IA & HISTORIAL DE PARTIDAS</span>
          </button>
        </div>

        {/* Tab 1: Build Advisor */}
        {activeTab === 'build-advisor' && (
          <BuildAdvisor
            settings={settings}
            defaultGameName={formData.gameName}
            defaultTagLine={formData.tagLine}
            defaultPlatform={formData.platform}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* Tab 2: Match History & Coaching Audit */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fade-in">
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
                <MatchHistory matches={matches} requestedCount={formData.matchCount} />
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-hextech-gold/20 bg-hextech-dark/80 py-4 px-6 text-center text-xs text-gray-500 font-cinzel">
        © {new Date().getFullYear()} LOL AI Coach. All rights reserved. Developed by Alec.
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
