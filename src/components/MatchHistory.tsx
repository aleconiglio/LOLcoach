import React, { useState } from 'react';
import { MatchDetail } from '../types';
import { getChampionIconUrl, getItemIconUrl, handleChampionImageError } from '../services/championData';
import { 
  Swords, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  ShieldAlert, 
  Award, 
  Coins, 
  Target, 
  Sparkles,
  Eye
} from 'lucide-react';

interface MatchHistoryProps {
  matches: MatchDetail[];
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({ matches }) => {
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(
    matches && matches.length > 0 ? matches[0].matchId : null
  );

  if (!matches || matches.length === 0) return null;

  const toggleExpand = (matchId: string) => {
    setExpandedMatchId((prev) => (prev === matchId ? null : matchId));
  };

  return (
    <div className="hextech-card rounded-lg p-5 border border-hextech-gold/30 shadow-xl space-y-4">
      
      {/* Title Header */}
      <div className="flex items-center justify-between pb-3 border-b border-hextech-gold/20">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-hextech-gold" />
          <h3 className="font-cinzel font-bold text-hextech-gold text-base tracking-wider">
            HISTORIAL DE PARTIDAS ANALIZADAS ({matches.length})
          </h3>
        </div>
        <span className="text-xs text-hextech-cyan font-sans flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Haz clic en cualquier partida para desplegar consejos tácticos
        </span>
      </div>

      {/* Match Cards List */}
      <div className="space-y-3">
        {matches.map((m, idx) => {
          const matchId = m.matchId || `match_${idx}`;
          const isExpanded = expandedMatchId === matchId;

          const durationMin = Math.floor(m.gameDuration / 60);
          const durationSec = Math.floor(m.gameDuration % 60);
          const isWin = m.targetSummoner.win;
          const p = m.targetSummoner;
          const opp = m.laneOpponent;
          const champIcon = getChampionIconUrl(p.championName);
          const oppIcon = opp ? getChampionIconUrl(opp.championName) : '';

          const items = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5].filter((id) => id > 0);

          return (
            <div
              key={matchId}
              className={`rounded border transition-all overflow-hidden ${
                isWin
                  ? 'bg-gradient-to-r from-emerald-950/30 via-hextech-navy/80 to-hextech-dark border-emerald-500/40 hover:border-emerald-500/70'
                  : 'bg-gradient-to-r from-rose-950/30 via-hextech-navy/80 to-hextech-dark border-rose-500/40 hover:border-rose-500/70'
              }`}
            >
              {/* Clickable Header Row */}
              <div
                onClick={() => toggleExpand(matchId)}
                className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
              >
                {/* Left: Real Champion Icon & Match Meta */}
                <div className="flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    <div
                      className={`w-14 h-14 rounded-md border-2 overflow-hidden bg-hextech-black relative shadow-lg ${
                        isWin ? 'border-emerald-400' : 'border-rose-500'
                      }`}
                    >
                      <img
                        src={champIcon}
                        alt={p.championName}
                        className="w-full h-full object-cover"
                        onError={(e) => handleChampionImageError(e, p.championName)}
                      />
                    </div>
                    {/* VIC / DER Badge */}
                    <span
                      className={`absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.2 font-extrabold uppercase rounded shadow font-cinzel ${
                        isWin ? 'bg-emerald-500 text-black' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {isWin ? 'VIC' : 'DER'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-gray-100 font-cinzel tracking-wide">
                        {p.championName}
                      </h4>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-hextech-navy border border-hextech-gold/30 text-hextech-gold font-mono">
                        {p.teamPosition}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1 font-mono text-gray-300">
                        <Clock className="w-3.5 h-3.5 text-hextech-cyan" />
                        {durationMin}m {durationSec}s
                      </span>
                      {m.timelineHighlights?.csAt10 !== undefined && (
                        <span className="text-xs text-amber-300">
                          CS@10m: <strong className="text-amber-100 font-mono">{m.timelineHighlights.csAt10}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center: Main Stats Breakdown */}
                <div className="grid grid-cols-3 gap-3 md:gap-6 text-center border-t md:border-t-0 md:border-l border-hextech-gold/15 pt-2 md:pt-0 md:pl-4">
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-cinzel block">K / D / A</span>
                    <span className="text-xs md:text-sm font-bold text-gray-100 font-mono">
                      {p.kills} / <span className="text-rose-400">{p.deaths}</span> / {p.assists}
                    </span>
                    <span className="text-[10px] text-hextech-gold font-semibold block mt-0.5">
                      {p.kda} KDA
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-cinzel block">CS / MIN</span>
                    <span className="text-xs md:text-sm font-bold text-gray-100 font-mono">
                      {p.totalMinionsKilled + p.neutralMinionsKilled}
                    </span>
                    <span className="text-[10px] text-hextech-cyan font-semibold block mt-0.5">
                      ({p.csPerMin}/m)
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-cinzel block">Daño Total</span>
                    <span className="text-xs md:text-sm font-bold text-amber-300 font-mono">
                      {(p.totalDamageDealtToChampions / 1000).toFixed(1)}k
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      Visión: {p.visionScore}
                    </span>
                  </div>
                </div>

                {/* Right: Direct Matchup Rival & Toggle Chevron */}
                <div className="flex items-center gap-3 border-t md:border-t-0 border-hextech-gold/15 pt-2 md:pt-0 justify-between md:justify-end">
                  {opp && (
                    <div className="flex items-center gap-2 text-right">
                      <div>
                        <span className="text-[10px] uppercase text-gray-400 font-cinzel block">Rival Directo</span>
                        <span className="text-xs font-bold text-gray-200 font-cinzel">
                          vs {opp.championName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono block">
                          {opp.kills}/{opp.deaths}/{opp.assists} ({opp.csPerMin} CS/m)
                        </span>
                      </div>
                      <div className="w-9 h-9 rounded border border-hextech-gold/30 overflow-hidden bg-hextech-black shrink-0 hidden sm:block">
                        <img
                          src={oppIcon}
                          alt={opp.championName}
                          className="w-full h-full object-cover"
                          onError={(e) => handleChampionImageError(e, opp.championName)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="p-1.5 rounded bg-hextech-navy border border-hextech-gold/30 text-hextech-gold shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* EXPANDABLE ACCORDION CONTENT: Game-Specific AI Tips & Timeline */}
              {isExpanded && (
                <div className="p-4 bg-hextech-black/80 border-t border-hextech-gold/20 space-y-4 animate-fade-in">
                  
                  {/* Game Specific Tactical Tips Header */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-hextech-gold font-cinzel text-xs font-bold uppercase tracking-wider">
                      <Zap className="w-4 h-4 text-hextech-gold" />
                      <span>CONSEJOS TÁCTICOS ESPECÍFICOS DE ESTA PARTIDA</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {m.specificAdvice && m.specificAdvice.length > 0 ? (
                        m.specificAdvice.map((tip, tIdx) => (
                          <div
                            key={tIdx}
                            className="p-3 bg-hextech-navy/90 rounded border border-hextech-gold/25 text-xs text-gray-200 leading-relaxed font-sans flex items-start gap-2"
                          >
                            <span className="w-5 h-5 rounded-full bg-hextech-gold/20 text-hextech-gold font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {tIdx + 1}
                            </span>
                            <span>{tip}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-hextech-navy/90 rounded text-xs text-gray-300">
                          Conserva el farm en min 15+ y mantén el control de wards defensivos.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Advanced Timeline & Direct Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-hextech-gold/15">
                    
                    {/* Lane Phase Timeline Stats */}
                    <div className="p-3 bg-hextech-navy/60 rounded border border-hextech-gold/20 space-y-2">
                      <span className="text-xs font-bold text-hextech-gold-light font-cinzel block flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-hextech-cyan" />
                        Métricas de Fase de Carril & Timeline
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 font-mono">
                        <div>CS al min 10: <strong className="text-amber-300">{m.timelineHighlights?.csAt10 || 'N/A'}</strong></div>
                        <div>CS al min 15: <strong className="text-amber-300">{m.timelineHighlights?.csAt15 || 'N/A'}</strong></div>
                        <div>Muertes &lt; 15m: <strong className={m.timelineHighlights?.deathsBefore15 && m.timelineHighlights.deathsBefore15 > 1 ? 'text-rose-400' : 'text-emerald-400'}>{m.timelineHighlights?.deathsBefore15 ?? 0}</strong></div>
                        <div>1ª Muerte: <strong className="text-gray-300">{m.timelineHighlights?.firstDeathTimeMin ? `${m.timelineHighlights.firstDeathTimeMin}m` : 'Ninguna'}</strong></div>
                      </div>
                    </div>

                    {/* Build Items */}
                    <div className="p-3 bg-hextech-navy/60 rounded border border-hextech-gold/20 space-y-2">
                      <span className="text-xs font-bold text-hextech-gold-light font-cinzel block flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-hextech-gold" />
                        Build de Ítems Finales
                      </span>
                      <div className="flex items-center gap-1.5">
                        {items.length > 0 ? (
                          items.map((itemId, iIdx) => (
                            <div
                              key={iIdx}
                              className="w-8 h-8 rounded border border-hextech-gold/40 overflow-hidden bg-hextech-black shadow"
                              title={`Item ID: ${itemId}`}
                            >
                              <img
                                src={getItemIconUrl(itemId)}
                                alt={`Item ${itemId}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">Sin datos de ítems</span>
                        )}
                        {p.item6 > 0 && (
                          <div className="w-8 h-8 rounded-full border border-amber-400/50 overflow-hidden bg-hextech-black shadow ml-1" title="Trinket / Ward">
                            <img
                              src={getItemIconUrl(p.item6)}
                              alt="Trinket"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
