import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Swords, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  HelpCircle, 
  Flame, 
  Layers, 
  Zap, 
  Eye, 
  Activity, 
  Cpu, 
  ArrowRight,
  Sliders,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Database,
  Globe,
  Info
} from 'lucide-react';
import { 
  PlatformRegion, 
  AppSettings, 
  ActiveGameData, 
  CompositionAnalysis, 
  BuildRecommendation,
  KnowledgeBaseStatus
} from '../types';
import { getActiveGameData, getMockActiveGame, clearActiveGameCache } from '../services/activeGameService';
import { analyzeComposition } from '../services/compositionAnalyzer';
import { generateDeepResearchBuildRecommendation, generateBuildRecommendation } from '../services/buildRecommendationEngine';
import { validateBuildRecommendation } from '../services/recommendationValidationService';
import { 
  checkAndAutoUpdateKnowledgeBase, 
  forceUpdateKnowledgeBase, 
  getKnowledgeBaseStatus 
} from '../services/knowledgeBaseManager';
import { generateAIExplanation } from '../services/aiExplanationService';
import { getChampionIconUrl, getItemIconUrl, handleChampionImageError, resolveChampionInfo } from '../services/championData';
import { getRuneIconUrl } from '../services/runeData';

interface BuildAdvisorProps {
  settings: AppSettings;
  defaultGameName: string;
  defaultTagLine: string;
  defaultPlatform: PlatformRegion;
  onOpenSettings: () => void;
}

type LoadingStep = 'idle' | 'searching' | 'analyzing' | 'generating';

export const BuildAdvisor: React.FC<BuildAdvisorProps> = ({
  settings,
  defaultGameName,
  defaultTagLine,
  defaultPlatform,
  onOpenSettings,
}) => {
  const [gameName, setGameName] = useState(defaultGameName);
  const [tagLine, setTagLine] = useState(defaultTagLine);
  const [platform, setPlatform] = useState<PlatformRegion>(defaultPlatform);

  const [loadingStep, setLoadingStep] = useState<LoadingStep>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noGameFound, setNoGameFound] = useState(false);

  const [activeGame, setActiveGame] = useState<ActiveGameData | null>(null);
  const [composition, setComposition] = useState<CompositionAnalysis | null>(null);
  const [recommendation, setRecommendation] = useState<BuildRecommendation | null>(null);
  const [isCachedResult, setIsCachedResult] = useState(false);

  // Deep research & knowledge base state
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [kbStatus, setKbStatus] = useState<KnowledgeBaseStatus>(getKnowledgeBaseStatus());
  const [isSyncingKb, setIsSyncingKb] = useState(false);
  const [kbSyncMessage, setKbSyncMessage] = useState<string | null>(null);

  // Quick preset tester for simulation
  const [simulationMode, setSimulationMode] = useState(false);
  const [selectedSimPreset, setSelectedSimPreset] = useState<'standard' | 'heavy_ad' | 'heavy_ap' | 'heavy_tanks' | 'heavy_healers'>('standard');

  // Auto-detect new patches and synchronize official dataset on load
  useEffect(() => {
    checkAndAutoUpdateKnowledgeBase().then(() => {
      setKbStatus(getKnowledgeBaseStatus());
    });
  }, []);

  const handleForceSyncKb = async () => {
    setIsSyncingKb(true);
    setKbSyncMessage(null);
    try {
      const res = await forceUpdateKnowledgeBase();
      setKbStatus(getKnowledgeBaseStatus());
      setKbSyncMessage(`¡Base de Conocimiento Actualizada! Parche oficial ${res.patch} (${res.itemCount} objetos, ${res.runeCount} runas).`);
      setTimeout(() => setKbSyncMessage(null), 5000);
    } catch {
      setKbSyncMessage('Error al sincronizar datos oficiales con Riot Data Dragon.');
    } finally {
      setIsSyncingKb(false);
    }
  };

  const handleAnalyzeMatch = async (forceBypassCache = false) => {
    setErrorMessage(null);
    setNoGameFound(false);

    if (!simulationMode && (!gameName.trim() || !tagLine.trim())) {
      setErrorMessage('Por favor ingresa tu Nombre de Invocador y TagLine para buscar tu partida activa.');
      return;
    }

    try {
      // Step 1: Searching for active match
      setLoadingStep('searching');
      await new Promise((r) => setTimeout(r, 400));

      let gameData: ActiveGameData | null = null;

      if (simulationMode) {
        // Simulation mode with custom archetypes
        let simEnemies = ['Darius', 'Viego', 'Syndra', 'Kai\'Sa', 'Nautilus'];
        if (selectedSimPreset === 'heavy_ad') {
          simEnemies = ['Darius', 'Zed', 'Kha\'Zix', 'Jinx', 'Sett'];
        } else if (selectedSimPreset === 'heavy_ap') {
          simEnemies = ['Mordekaiser', 'Elise', 'Syndra', 'Brand', 'Fizz'];
        } else if (selectedSimPreset === 'heavy_tanks') {
          simEnemies = ['Cho\'Gath', 'Sion', 'Amumu', 'Jinx', 'Alistar'];
        } else if (selectedSimPreset === 'heavy_healers') {
          simEnemies = ['Aatrox', 'Warwick', 'Vladimir', 'Jinx', 'Soraka'];
        }
        gameData = getMockActiveGame(gameName || 'Invocador', 'Ahri', simEnemies);
      } else {
        // Query official Riot API Spectator-v5
        gameData = await getActiveGameData(
          gameName,
          tagLine,
          platform,
          settings.riotApiKey,
          settings.isDemoMode,
          forceBypassCache
        );
      }

      if (!gameData) {
        setNoGameFound(true);
        setLoadingStep('idle');
        return;
      }

      // Step 2: Analyzing composition
      setLoadingStep('analyzing');
      await new Promise((r) => setTimeout(r, 450));
      const compAnalysis = analyzeComposition(gameData.enemies, gameData.allies, gameData.playerChampion);

      // Step 3: Deep Web Research & Structured Validation
      setLoadingStep('generating');
      await new Promise((r) => setTimeout(r, 450));
      
      const deepRec = await generateDeepResearchBuildRecommendation({
        patch: gameData.patch,
        playerChampion: gameData.playerChampion.championName,
        playerRole: gameData.playerChampion.role,
        allies: gameData.allies,
        enemies: gameData.enemies,
        compositionAnalysis: compAnalysis,
        searchApiKey: settings.searchApiKey,
      });

      // Optional: AI natural language enrichment if Groq is available
      if (settings.groqApiKey && !settings.isDemoMode) {
        try {
          const aiExp = await generateAIExplanation(deepRec, compAnalysis, settings.groqApiKey);
          deepRec.explanation.reasons = aiExp.reasons;
          deepRec.explanation.tacticalSummary = aiExp.tacticalSummary;

          // Re-validate to guard against LLM hallucinating removed items
          const validated = validateBuildRecommendation(
            deepRec,
            deepRec.traceability?.sources,
            deepRec.traceability?.sampleSize,
            deepRec.confidenceLevel,
            deepRec.traceability?.evidenceQualityText
          );
          deepRec.explanation.reasons = validated.recommendation.explanation.reasons;
        } catch {
          // Keep deterministic verified explanation
        }
      }

      setActiveGame(gameData);
      setComposition(compAnalysis);
      setRecommendation(deepRec);
      setIsCachedResult(!forceBypassCache && !simulationMode);
    } catch (err: any) {
      console.error('Error al analizar partida activa:', err);
      // Clean, sanitized friendly message (NEVER expose keys or stack traces)
      const sanitized = err.message || 'Ocurrió un error al contactar la Riot API de partidas activas.';
      setErrorMessage(sanitized.replace(/RGAPI-[A-Za-z0-9-]+/g, '[REDACTED]'));
    } finally {
      setLoadingStep('idle');
    }
  };

  const handleForceRefresh = () => {
    clearActiveGameCache();
    handleAnalyzeMatch(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">

      
      {/* Top Banner / Control Panel */}
      <div className="hextech-card rounded-lg p-6 border-2 border-hextech-gold/40 relative overflow-hidden bg-gradient-to-r from-hextech-dark via-hextech-navy to-hextech-blue shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-hextech-gold/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-5 border-b border-hextech-gold/20">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-hextech-gold/20 border border-hextech-gold/40 text-hextech-gold">
                <Shield className="w-5 h-5 text-hextech-gold" />
              </span>
              <h2 className="text-xl md:text-2xl font-black text-hextech-gold-light font-cinzel tracking-wider">
                BUILD ADVISOR
              </h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono">
                Riot Spectator-v5
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-300 max-w-2xl font-sans">
              Detección de partida en curso y recomendación estática adaptada contra la composición enemiga.
              Cumple al 100% las normativas de Riot Games (sin polling, sin lectura de memoria, una sola consulta bajo demanda).
            </p>
          </div>

          {/* Mode Switcher: Live Game vs Simulator */}
          <div className="flex items-center gap-2 bg-hextech-black/60 p-1.5 rounded-lg border border-hextech-gold/30 shrink-0">
            <button
              onClick={() => { setSimulationMode(false); }}
              className={`px-3 py-1.5 rounded text-xs font-semibold font-cinzel transition-all ${
                !simulationMode
                  ? 'bg-hextech-gold text-black shadow-md'
                  : 'text-gray-400 hover:text-hextech-gold'
              }`}
            >
              Partida en Vivo
            </button>
            <button
              onClick={() => { setSimulationMode(true); }}
              className={`px-3 py-1.5 rounded text-xs font-semibold font-cinzel transition-all flex items-center gap-1.5 ${
                simulationMode
                  ? 'bg-hextech-cyan/20 text-hextech-cyan border border-hextech-cyan/50 shadow-md'
                  : 'text-gray-400 hover:text-hextech-cyan'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Simulador
            </button>
          </div>
        </div>

        {/* Inputs & Trigger Row */}
        <div className="pt-5 flex flex-col md:flex-row items-end gap-4">
          {!simulationMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
              <div>
                <label className="block text-[11px] font-bold text-hextech-gold font-cinzel mb-1 uppercase">
                  Nombre de Invocador
                </label>
                <input
                  type="text"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="Ej: Faker"
                  className="hextech-input w-full px-3 py-2 text-xs rounded"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-hextech-gold font-cinzel mb-1 uppercase">
                  TagLine (#)
                </label>
                <input
                  type="text"
                  value={tagLine}
                  onChange={(e) => setTagLine(e.target.value)}
                  placeholder="Ej: KR1, LAS"
                  className="hextech-input w-full px-3 py-2 text-xs rounded uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-hextech-gold font-cinzel mb-1 uppercase">
                  Región / Servidor
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as PlatformRegion)}
                  className="hextech-input w-full px-3 py-2 text-xs rounded bg-hextech-dark cursor-pointer"
                >
                  <option value="LAS">LAS (América del Sur)</option>
                  <option value="LAN">LAN (América del Norte)</option>
                  <option value="NA1">NA1 (Norteamérica)</option>
                  <option value="EUW1">EUW1 (Europa Oeste)</option>
                  <option value="EUN1">EUN1 (Europa Nórdica)</option>
                  <option value="KR">KR (Corea del Sur)</option>
                  <option value="BR1">BR1 (Brasil)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="flex-1 w-full space-y-2">
              <label className="block text-[11px] font-bold text-hextech-cyan font-cinzel uppercase flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Arquetipo Enemigo a Simular:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'standard', label: 'Equilibrada' },
                  { id: 'heavy_ad', label: 'Full AD / Burst' },
                  { id: 'heavy_ap', label: 'Full AP / Burst' },
                  { id: 'heavy_tanks', label: 'Varios Tanques' },
                  { id: 'heavy_healers', label: 'Mucha Curación' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedSimPreset(preset.id as any)}
                    className={`px-3 py-2 text-xs rounded border transition-all text-center font-medium ${
                      selectedSimPreset === preset.id
                        ? 'bg-hextech-cyan/20 border-hextech-cyan text-hextech-cyan font-bold shadow'
                        : 'bg-hextech-navy/70 border-hextech-gold/20 text-gray-300 hover:border-hextech-gold/40'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="w-full md:w-auto shrink-0 flex items-center gap-2">
            <button
              onClick={() => handleAnalyzeMatch(false)}
              disabled={loadingStep !== 'idle'}
              className="hextech-button w-full md:w-auto px-7 py-2.5 rounded text-xs tracking-wider flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50"
            >
              {loadingStep !== 'idle' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>
                    {loadingStep === 'searching' && 'Buscando partida...'}
                    {loadingStep === 'analyzing' && 'Analizando composición...'}
                    {loadingStep === 'generating' && 'Generando recomendación...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>ANALIZAR PARTIDA</span>
                </>
              )}
            </button>

            {activeGame && (
              <button
                onClick={handleForceRefresh}
                title="Actualizar análisis de partida"
                disabled={loadingStep !== 'idle'}
                className="p-2.5 rounded bg-hextech-navy hover:bg-hextech-blue border border-hextech-gold/30 text-hextech-gold transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Knowledge Base Live Status & Force Sync Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-hextech-dark/95 rounded-lg border border-hextech-gold/30 text-xs shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-hextech-gold/15 text-hextech-gold border border-hextech-gold/30">
            <Database className="w-4 h-4 text-hextech-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-hextech-gold font-bold">Base de Conocimiento LoL:</span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 text-[10px]">
                Parche {kbStatus.patch}
              </span>
            </div>
            <span className="text-[11px] text-gray-400">
              {kbStatus.itemCount} objetos y {kbStatus.runeCount} runas verificadas en Riot Data Dragon
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {kbSyncMessage && (
            <span className="text-[11px] text-emerald-300 font-mono animate-fade-in">{kbSyncMessage}</span>
          )}
          <button
            onClick={handleForceSyncKb}
            disabled={isSyncingKb}
            title="Forzar comprobación y sincronización de nuevos parches de Riot Data Dragon"
            className="px-3.5 py-1.5 rounded bg-hextech-navy hover:bg-hextech-blue border border-hextech-gold/40 text-hextech-gold hover:text-white font-cinzel text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingKb ? 'animate-spin' : ''}`} />
            <span>{isSyncingKb ? 'Sincronizando...' : 'Sincronizar Parche'}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 flex items-start gap-3 shadow-lg animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs md:text-sm">
            <strong className="font-cinzel text-rose-300 block mb-0.5">Consulta de Partida Activa:</strong>
            {errorMessage}
          </div>
          <button
            onClick={onOpenSettings}
            className="text-xs underline text-hextech-gold hover:text-white font-cinzel shrink-0"
          >
            Configuración
          </button>
        </div>
      )}

      {/* No Game Found Notification */}
      {noGameFound && (
        <div className="hextech-card p-6 rounded-lg border border-amber-500/40 text-center space-y-3 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-amber-300 font-cinzel">
            No se encontró ninguna partida activa
          </h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
            Entrá en una partida de League of Legends (Grieta del Invocador) y volvé a pulsar "Analizar partida".
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSimulationMode(true);
                handleAnalyzeMatch();
              }}
              className="text-xs px-4 py-2 rounded bg-hextech-navy hover:bg-hextech-blue border border-hextech-cyan/50 text-hextech-cyan font-cinzel font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5" />
              Probar ahora con el Simulador de Composiciones
            </button>
          </div>
        </div>
      )}

      {/* Initial Empty State */}
      {!activeGame && !noGameFound && loadingStep === 'idle' && (
        <div className="hextech-card p-12 rounded-lg border border-hextech-gold/20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-hextech-navy border border-hextech-gold/40 flex items-center justify-center mx-auto shadow-hextech-gold">
            <Shield className="w-8 h-8 text-hextech-gold" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-hextech-gold-light font-cinzel">
              No hay ninguna partida analizada
            </h3>
            <p className="text-xs text-gray-400 max-w-lg mx-auto mt-1 leading-relaxed">
              Pulsa <strong className="text-hextech-gold">"Analizar partida"</strong> cuando estés en pantalla de carga o al inicio de tu partida para detectar automáticamente los 10 campeones y recibir tu build adaptada.
            </p>
          </div>
        </div>
      )}

      {/* RESULTS SECTION */}
      {activeGame && composition && recommendation && (
        <div className="space-y-6 animate-fade-in">

          {/* 1. MATCH HERO & TEAMS GRID */}
          <div className="hextech-card rounded-lg p-5 border border-hextech-gold/30 shadow-xl space-y-5">
            
            {/* Header: User Champion & Cache Notice */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-hextech-gold/20 gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-lg border-2 border-hextech-gold overflow-hidden bg-hextech-black shadow-lg shrink-0">
                  <img
                    src={getChampionIconUrl(activeGame.playerChampion.championName)}
                    alt={activeGame.playerChampion.championName}
                    className="w-full h-full object-cover"
                    onError={(e) => handleChampionImageError(e, activeGame.playerChampion.championName)}
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 font-cinzel block">Tu Campeón</span>
                  <h3 className="text-xl font-black text-hextech-gold font-cinzel">
                    {activeGame.playerChampion.championName}
                  </h3>
                  <span className="text-[11px] text-hextech-cyan font-mono">
                    Rol: {activeGame.playerChampion.role || 'Línea Asignada'} • Parche {recommendation.patch}
                  </span>
                </div>
              </div>

              {/* Compliance & Cache Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {isCachedResult && (
                  <span className="text-[10px] text-gray-300 bg-hextech-navy px-2 py-1 rounded border border-hextech-gold/20 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-hextech-gold" />
                    Caché Activa (3 min)
                  </span>
                )}
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/30 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Riot Third-Party Compliant
                </span>
              </div>
            </div>

            {/* Teams Grid: Mi Equipo vs Equipo Enemigo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Ally Team (Blue) */}
              <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-500/30 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-blue-300 font-cinzel">
                  <span>TU EQUIPO (ALIADOS)</span>
                  <span className="text-[10px] text-blue-400 font-mono">5 Campeones</span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[activeGame.playerChampion, ...activeGame.allies].slice(0, 5).map((champ, idx) => {
                    const resolvedName = resolveChampionInfo(champ.championName).name;
                    return (
                      <div key={idx} className="flex flex-col items-center text-center group">
                        <div className={`w-11 h-11 rounded border-2 overflow-hidden bg-hextech-black relative shadow ${
                          champ.isPlayer ? 'border-hextech-gold shadow-hextech-gold' : 'border-blue-400/50'
                        }`}>
                          <img
                            src={getChampionIconUrl(champ.championName)}
                            alt={resolvedName}
                            className="w-full h-full object-cover"
                            onError={(e) => handleChampionImageError(e, champ.championName)}
                          />
                          {champ.isPlayer && (
                            <span className="absolute bottom-0 inset-x-0 bg-hextech-gold text-[8px] font-bold text-black font-cinzel uppercase text-center">
                              TÚ
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-300 truncate w-full mt-1 font-sans">
                          {resolvedName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Enemy Team (Red) */}
              <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-rose-300 font-cinzel">
                  <span>EQUIPO ENEMIGO (AMENAZAS)</span>
                  <span className="text-[10px] text-rose-400 font-mono">
                    {composition.damageBreakdown.adPercent}% AD / {composition.damageBreakdown.apPercent}% AP
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {activeGame.enemies.map((champ, idx) => {
                    const resolvedName = resolveChampionInfo(champ.championName).name;
                    return (
                      <div key={idx} className="flex flex-col items-center text-center group">
                        <div className="w-11 h-11 rounded border-2 border-rose-500/50 overflow-hidden bg-hextech-black relative shadow">
                          <img
                            src={getChampionIconUrl(champ.championName)}
                            alt={resolvedName}
                            className="w-full h-full object-cover"
                            onError={(e) => handleChampionImageError(e, champ.championName)}
                          />
                        </div>
                        <span className="text-[10px] text-rose-200 truncate w-full mt-1 font-sans">
                          {resolvedName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Quick Threat Diagnosis Badges */}
            <div className="p-3 bg-hextech-black/60 rounded border border-hextech-gold/20 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 font-cinzel">Diagnóstico Clave:</span>
              
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                composition.damageBreakdown.predominance === 'PREDOMINANTLY_AD'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : composition.damageBreakdown.predominance === 'PREDOMINANTLY_AP'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              }`}>
                {composition.damageBreakdown.predominance === 'PREDOMINANTLY_AD' && '⚔️ Predominancia AD Física'}
                {composition.damageBreakdown.predominance === 'PREDOMINANTLY_AP' && '🔮 Predominancia AP Mágica'}
                {composition.damageBreakdown.predominance === 'MIXED_DAMAGE' && '⚖️ Daño Mixto Equilibrado'}
              </span>

              {composition.resistanceBreakdown.tankCount >= 2 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  🛡️ {composition.resistanceBreakdown.tankCount} Tanques (Requiere Penetración)
                </span>
              )}

              {composition.healingBreakdown.needGrievousWounds === 'URGENT' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
                  🩸 Anti-Curación Urgente ({composition.healingBreakdown.heavyHealers.join(', ')})
                </span>
              )}

              {composition.burstThreatBreakdown.overallBurstThreat === 'HIGH_BURST' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900/60 text-white border border-rose-500/50">
                  ⚡ Amenaza de Alto Burst Asesino
                </span>
              )}

              {composition.crowdControlBreakdown.threatLevel === 'HEAVY_CC' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  🌀 CC Pesado (Tenacidad Prioritaria)
                </span>
              )}
            </div>

          </div>

          {/* EVIDENCE QUALITY & CONSULTED SOURCES CARD */}
          <div className="p-4 rounded-lg bg-hextech-dark/95 border border-hextech-gold/35 shadow-xl space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] uppercase font-bold text-gray-400 font-cinzel">Calidad de Evidencia:</span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono border flex items-center gap-1.5 ${
                  recommendation.confidenceLevel === 'HIGH'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                    : recommendation.confidenceLevel === 'MEDIUM'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                    : 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    recommendation.confidenceLevel === 'HIGH' ? 'bg-emerald-400' :
                    recommendation.confidenceLevel === 'MEDIUM' ? 'bg-amber-400' : 'bg-rose-400'
                  }`} />
                  {recommendation.confidenceLevel === 'HIGH' && 'ALTA CONFIANZA (Riot Data Dragon + Metajuego Consolidado)'}
                  {recommendation.confidenceLevel === 'MEDIUM' && 'CONFIANZA MEDIA (Búsqueda Web + Muestra Parcial)'}
                  {recommendation.confidenceLevel === 'LOW' && 'CONFIANZA LIMITADA (Parche Reciente o Muestra Reducida)'}
                </span>

                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-hextech-navy text-hextech-gold border border-hextech-gold/30">
                  Parche Verificado: {recommendation.patch}
                </span>
              </div>

              {/* Toggle Sources Drawer */}
              {recommendation.traceability?.sources && recommendation.traceability.sources.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsSourcesOpen(!isSourcesOpen)}
                  className="text-xs text-hextech-cyan hover:text-hextech-gold font-cinzel flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Fuentes Consultadas ({recommendation.traceability.sources.length})</span>
                  {isSourcesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              {recommendation.traceability?.evidenceQualityText || 'Recomendación adaptada verificada contra catálogo estructurado oficial de Riot Games.'}
            </p>

            {/* Warning if new patch or insufficient sample */}
            {(recommendation.traceability?.isNewPatchWarning || recommendation.traceability?.isSampleInsufficient) && (
              <div className="p-3 rounded bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-cinzel text-amber-300 block mb-0.5">Aviso de Parche Reciente o Muestra Reducida:</strong>
                  {recommendation.traceability?.sampleSize && recommendation.traceability.sampleSize < 500
                    ? `Muestra analizada de ${recommendation.traceability.sampleSize} partidas. Al tratarse de un volumen reducido, el motor prioriza recetas y especificaciones oficiales para evitar builds anómalas.`
                    : 'El metajuego para este parche se encuentra en evolución temprana. Se han contrastado los objetos directamente contra Riot Data Dragon para garantizar que ninguno haya sido eliminado.'}
                </div>
              </div>
            )}

            {/* Expandable Sources Drawer */}
            {isSourcesOpen && recommendation.traceability?.sources && (
              <div className="pt-3 border-t border-hextech-gold/20 space-y-2.5 animate-fade-in">
                <span className="text-[11px] uppercase font-bold text-hextech-gold font-cinzel block">
                  Páginas y Referencias Analizadas para esta Recomendación:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recommendation.traceability.sources.map((src, sIdx) => (
                    <div key={src.id || sIdx} className="p-2.5 rounded bg-hextech-navy/70 border border-hextech-gold/20 space-y-1">
                      <div className="flex items-center justify-between">
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-hextech-cyan hover:text-hextech-gold underline flex items-center gap-1 truncate max-w-[240px]"
                        >
                          <span>{src.name}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          src.reliability === 'HIGH' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-gray-800 text-gray-300'
                        }`}>
                          {src.reliability === 'HIGH' ? 'Oficial / Alta' : 'Media'}
                        </span>
                      </div>
                      {src.excerpt && (
                        <p className="text-[11px] text-gray-400 line-clamp-2 italic font-sans">
                          "{src.excerpt}"
                        </p>
                      )}
                      <div className="text-[10px] text-gray-500 font-mono">
                        Parche: {src.patch} • Consulta: {new Date(src.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. RECOMMENDED BUILD SECTION */}
          <div className="hextech-card rounded-lg p-5 border border-hextech-gold/30 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hextech-gold/20">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-hextech-gold" />
                <h3 className="font-cinzel font-bold text-hextech-gold text-base tracking-wider">
                  BUILD RECOMENDADA
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  Build Estándar
                </span>
              </div>

              {/* Specialized Source Attributions & Verification Link */}
              {recommendation.sourceName && recommendation.sourceUrl && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-gray-400 font-cinzel">Fuente Especializada:</span>
                  <a
                    href={recommendation.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-hextech-navy border border-hextech-gold/40 text-xs font-bold text-hextech-cyan hover:text-hextech-gold hover:border-hextech-gold transition-colors"
                  >
                    <span>{recommendation.sourceName}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-hextech-gold" />
                  </a>
                  {recommendation.lastUpdatedDate && (
                    <span className="text-[10px] text-gray-400 font-mono">
                      (Act: {recommendation.lastUpdatedDate} • Parche {recommendation.patch})
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Left Column: Inicio & Botas */}
              <div className="md:col-span-4 space-y-4">
                
                {/* Objeto Inicial */}
                <div className="p-4 rounded-lg bg-hextech-navy/70 border border-hextech-gold/20 space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 font-cinzel uppercase block">
                    OBJETO INICIAL
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded border border-hextech-gold/50 overflow-hidden bg-hextech-black shrink-0">
                      <img
                        src={getItemIconUrl(recommendation.startingItem.primary.id)}
                        alt={recommendation.startingItem.primary.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-hextech-gold font-cinzel">
                        {recommendation.startingItem.primary.name}
                      </h4>
                      <p className="text-[11px] text-gray-300 leading-tight mt-0.5">
                        {recommendation.startingItem.primary.reason}
                      </p>
                    </div>
                  </div>

                  {recommendation.startingItem.alternative && (
                    <div className="pt-2 border-t border-hextech-gold/10 flex items-center gap-2 text-[11px] text-gray-400">
                      <span className="text-[10px] font-semibold text-hextech-cyan font-cinzel shrink-0">Alternativa:</span>
                      <span className="text-gray-300 font-medium">{recommendation.startingItem.alternative.name}</span>
                    </div>
                  )}
                </div>

                {/* Botas */}
                <div className="p-4 rounded-lg bg-hextech-navy/70 border border-hextech-gold/20 space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 font-cinzel uppercase block">
                    BOTAS RECOMENDADAS
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded border border-hextech-gold/50 overflow-hidden bg-hextech-black shrink-0">
                      <img
                        src={getItemIconUrl(recommendation.boots.id)}
                        alt={recommendation.boots.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-hextech-gold font-cinzel">
                        {recommendation.boots.name}
                      </h4>
                      <p className="text-[11px] text-gray-300 leading-tight mt-0.5">
                        {recommendation.boots.reason}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Core Build 1-2-3 and Later 4-5-6 */}
              <div className="md:col-span-8 space-y-4">
                
                {/* Core 1 -> 2 -> 3 */}
                <div className="p-4 rounded-lg bg-hextech-navy/80 border border-hextech-gold/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-hextech-gold-light font-cinzel uppercase flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-hextech-gold" />
                      CORE BUILD (ORDEN TEMPRANO 1 → 2 → 3)
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">Picos de poder decisivos</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {recommendation.coreBuild.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded bg-hextech-black/60 border border-hextech-gold/30 space-y-2 relative"
                      >
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-hextech-gold text-black font-bold font-mono text-[10px] flex items-center justify-center shadow">
                          #{item.order}
                        </span>
                        <div className="w-12 h-12 rounded border border-hextech-gold/40 overflow-hidden bg-hextech-black">
                          <img
                            src={getItemIconUrl(item.id)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-gray-100 font-cinzel truncate pr-5">
                            {item.name}
                          </h5>
                          <p className="text-[10px] text-gray-300 leading-tight mt-1">
                            {item.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Later 4 -> 5 -> 6 */}
                <div className="p-4 rounded-lg bg-hextech-navy/50 border border-hextech-gold/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-300 font-cinzel uppercase flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-hextech-cyan" />
                      DESPUÉS (ORDEN TARDÍO 4 → 5 → 6)
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">Mid / Late Game</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {recommendation.coreBuild.slice(3, 6).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded bg-hextech-black/40 border border-hextech-gold/20 space-y-2 relative"
                      >
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-hextech-navy text-hextech-gold border border-hextech-gold/30 font-bold font-mono text-[10px] flex items-center justify-center">
                          #{item.order}
                        </span>
                        <div className="w-12 h-12 rounded border border-hextech-gold/30 overflow-hidden bg-hextech-black">
                          <img
                            src={getItemIconUrl(item.id)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-gray-200 font-cinzel truncate pr-5">
                            {item.name}
                          </h5>
                          <p className="text-[10px] text-gray-400 leading-tight mt-1">
                            {item.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* 3. SITUATIONAL ITEMS */}
          <div className="hextech-card rounded-lg p-5 border border-hextech-gold/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-hextech-gold/20">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-hextech-cyan" />
                <h3 className="font-cinzel font-bold text-hextech-gold text-base tracking-wider">
                  ALTERNATIVAS SITUACIONALES RESPALDADAS
                </h3>
              </div>
              <span className="text-[11px] text-gray-400 font-sans">
                {recommendation.sourceName ? `Respaldadas por ${recommendation.sourceName}` : 'Evidencia verificada'}
              </span>
            </div>

            {recommendation.situationalItems.length === 0 ? (
              <div className="p-4 rounded-lg bg-hextech-navy/40 border border-hextech-gold/15 text-center space-y-1">
                <p className="text-xs text-gray-300 font-sans">
                  No se identificaron alternativas situacionales con respaldo estadístico suficiente para esta composición enemiga.
                </p>
                <p className="text-[11px] text-gray-400 font-mono">
                  Se recomienda mantener la secuencia de la Build Estándar sin desvíos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {recommendation.situationalItems.map((sit, idx) => {
                  const isTriggered = sit.triggerMatched;

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-lg border transition-all space-y-2.5 ${
                        isTriggered
                          ? 'bg-hextech-navy/90 border-hextech-gold/60 shadow-md ring-1 ring-hextech-gold/30'
                          : 'bg-hextech-dark/70 border-cyan-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold font-cinzel uppercase px-2 py-0.5 rounded ${
                          isTriggered
                            ? 'bg-hextech-gold text-black shadow-sm font-black'
                            : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {isTriggered
                            ? 'Alternativa situacional (Respaldada)'
                            : 'Variante de metajuego'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded border border-hextech-gold/40 overflow-hidden bg-hextech-black shrink-0">
                          <img
                            src={getItemIconUrl(sit.id)}
                            alt={sit.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-hextech-cyan block truncate">
                            {sit.condition}
                          </span>
                          <h4 className="text-xs font-bold text-gray-100 font-cinzel truncate">
                            {sit.name}
                          </h4>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-300 leading-snug">
                        {sit.reason}
                      </p>

                      {sit.evidenceText && (
                        <div className="pt-2 border-t border-hextech-gold/15">
                          <p className="text-[10px] text-hextech-gold/90 leading-tight">
                            <span className="font-bold text-hextech-cyan">Respaldo:</span> {sit.evidenceText}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. RUNAS & HABILIDADES */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Runas (7 Cols) */}
            <div className="lg:col-span-7 hextech-card rounded-lg p-5 border border-hextech-gold/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-hextech-gold/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-hextech-gold" />
                  <h3 className="font-cinzel font-bold text-hextech-gold text-base tracking-wider">
                    RUNAS RECOMENDADAS (PARCHE {recommendation.patch})
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Primary Tree */}
                <div className="p-3.5 bg-hextech-navy/70 rounded border border-hextech-gold/20 space-y-3">
                  <div className="flex items-center justify-between border-b border-hextech-gold/15 pb-2">
                    <span className="text-xs font-bold text-hextech-gold font-cinzel">
                      Rama Primaria: {recommendation.runes.primaryTree}
                    </span>
                  </div>

                  {/* Keystone */}
                  <div className="flex items-center gap-3 p-2 bg-hextech-black/60 rounded border border-hextech-gold/40">
                    <div className="w-10 h-10 rounded-full border border-hextech-gold overflow-hidden bg-hextech-black shrink-0 p-0.5">
                      <img
                        src={getRuneIconUrl(recommendation.runes.keystone.id)}
                        alt={recommendation.runes.keystone.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-hextech-gold font-cinzel block">Keystone</span>
                      <h5 className="text-xs font-bold text-gray-100 font-cinzel">
                        {recommendation.runes.keystone.name}
                      </h5>
                    </div>
                  </div>

                  {/* Minor Runes */}
                  <div className="space-y-1.5 pt-1">
                    {recommendation.runes.primaryMinors.map((minor) => (
                      <div key={minor.id} className="text-xs text-gray-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-hextech-gold shrink-0"></span>
                        <span>{minor.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secondary Tree & Shards */}
                <div className="space-y-3">
                  
                  {/* Secondary Tree */}
                  <div className="p-3.5 bg-hextech-navy/70 rounded border border-hextech-gold/20 space-y-2">
                    <span className="text-xs font-bold text-hextech-cyan font-cinzel block border-b border-hextech-gold/15 pb-2">
                      Rama Secundaria: {recommendation.runes.secondaryTree}
                    </span>
                    <div className="space-y-1.5 pt-1">
                      {recommendation.runes.secondaryMinors.map((minor) => (
                        <div key={minor.id} className="text-xs text-gray-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-hextech-cyan shrink-0"></span>
                          <span>{minor.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stat Shards */}
                  <div className="p-3 bg-hextech-black/70 rounded border border-hextech-gold/20 space-y-1 text-[11px] font-mono text-gray-300">
                    <span className="text-[10px] font-bold text-gray-400 font-cinzel uppercase block">
                      Fragmentos Adaptativos:
                    </span>
                    <div>• Ofensivo: <span className="text-hextech-gold">{recommendation.runes.shards.offense}</span></div>
                    <div>• Flexible: <span className="text-hextech-cyan">{recommendation.runes.shards.flex}</span></div>
                    <div>• Defensivo: <span className="text-emerald-300">{recommendation.runes.shards.defense}</span></div>
                  </div>

                </div>

              </div>
            </div>

            {/* Skill Order (5 Cols) */}
            <div className="lg:col-span-5 hextech-card rounded-lg p-5 border border-hextech-gold/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-hextech-gold/20">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-hextech-gold" />
                  <h3 className="font-cinzel font-bold text-hextech-gold text-base tracking-wider">
                    ORDEN DE HABILIDADES
                  </h3>
                </div>
              </div>

              {recommendation.skillOrder ? (
                <div className="space-y-3">
                  <div className="p-3 bg-hextech-navy/70 rounded border border-hextech-gold/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 font-cinzel uppercase block">Prioridad de Maxeo</span>
                      <span className="text-base font-black text-hextech-gold-light font-cinzel">
                        {recommendation.skillOrder.maxOrder}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-cinzel uppercase block">Niveles 1 a 3</span>
                      <span className="text-xs font-bold text-hextech-cyan font-mono">
                        {recommendation.skillOrder.first3Levels}
                      </span>
                    </div>
                  </div>

                  {/* Level Progression Grid (1-18) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 font-cinzel uppercase block">
                      Secuencia Nivel por Nivel:
                    </span>
                    <div className="grid grid-cols-6 sm:grid-cols-9 gap-1 text-center font-mono text-xs">
                      {recommendation.skillOrder.levels.map((lvl) => (
                        <div
                          key={lvl.level}
                          className={`p-1.5 rounded border ${
                            lvl.skill === 'R'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                              : lvl.skill === 'Q'
                              ? 'bg-hextech-blue/40 text-blue-200 border-blue-500/30'
                              : lvl.skill === 'W'
                              ? 'bg-emerald-950/40 text-emerald-200 border-emerald-500/30'
                              : 'bg-purple-950/40 text-purple-200 border-purple-500/30'
                          }`}
                        >
                          <span className="text-[9px] text-gray-500 block">L{lvl.level}</span>
                          <span className="text-xs font-bold">{lvl.skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded bg-hextech-navy/40 text-xs text-gray-400 text-center">
                  Sin datos fiables de habilidades para este campeón en este rol.
                </div>
              )}
            </div>

          </div>

          {/* 5. ¿POR QUÉ ESTA BUILD? */}
          <div className="hextech-card rounded-lg p-5 border-2 border-hextech-gold/40 bg-gradient-to-r from-hextech-navy via-hextech-dark to-hextech-navy shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-hextech-gold/20">
              <HelpCircle className="w-5 h-5 text-hextech-gold" />
              <h3 className="font-cinzel font-bold text-hextech-gold text-base tracking-wider">
                ¿POR QUÉ ESTA BUILD? (EXPLICACIÓN TÁCTICA)
              </h3>
            </div>

            <div className="space-y-2.5 pt-1">
              {recommendation.explanation.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-hextech-black/60 rounded border border-hextech-gold/20">
                  <span className="w-5 h-5 rounded-full bg-hextech-gold/20 text-hextech-gold font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-hextech-gold/30 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs md:text-sm text-gray-200 leading-relaxed font-sans">
                    {reason}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-gray-400 italic pt-1 font-sans">
              {recommendation.explanation.tacticalSummary}
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
