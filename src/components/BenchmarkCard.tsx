import React from 'react';
import { TargetRank, MatchDetail } from '../types';
import { getBenchmarkForRank } from '../services/benchmarks';
import { Target, TrendingUp, TrendingDown, Swords, Eye, Skull, DollarSign } from 'lucide-react';

interface BenchmarkCardProps {
  matches: MatchDetail[];
  targetRank: TargetRank;
}

export const BenchmarkCard: React.FC<BenchmarkCardProps> = ({ matches, targetRank }) => {
  const benchmark = getBenchmarkForRank(targetRank);
  const total = Math.max(1, matches.length);

  const avgKDA = Number(
    (matches.reduce((acc, m) => acc + m.targetSummoner.kda, 0) / total).toFixed(2)
  );

  const avgCSPerMin = Number(
    (matches.reduce((acc, m) => acc + m.targetSummoner.csPerMin, 0) / total).toFixed(1)
  );

  const avgVisionPerMin = Number(
    (
      matches.reduce(
        (acc, m) => acc + m.targetSummoner.visionScore / Math.max(1, m.gameDuration / 60),
        0
      ) / total
    ).toFixed(2)
  );

  const avgEarlyDeaths = Number(
    (
      matches.reduce(
        (acc, m) => acc + (m.timelineHighlights?.deathsBefore15 || 0),
        0
      ) / total
    ).toFixed(1)
  );

  const metrics = [
    {
      title: 'CS / minuto',
      icon: Swords,
      actual: avgCSPerMin,
      target: benchmark.csPerMin,
      unit: '/min',
      isBetter: avgCSPerMin >= benchmark.csPerMin,
    },
    {
      title: 'KDA Promedio',
      icon: Target,
      actual: avgKDA,
      target: benchmark.kda,
      unit: ' ratio',
      isBetter: avgKDA >= benchmark.kda,
    },
    {
      title: 'Visión / minuto',
      icon: Eye,
      actual: avgVisionPerMin,
      target: benchmark.visionScorePerMin,
      unit: '/min',
      isBetter: avgVisionPerMin >= benchmark.visionScorePerMin,
    },
    {
      title: 'Muertes < 15m',
      icon: Skull,
      actual: avgEarlyDeaths,
      target: benchmark.deathsBefore15,
      unit: ' muertes',
      isBetter: avgEarlyDeaths <= benchmark.deathsBefore15, // lower early deaths is better
    },
  ];

  return (
    <div className="hextech-card rounded-lg p-5 border border-hextech-gold/30 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-hextech-gold/20">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          <h3 className="font-cinzel font-bold text-hextech-gold text-md tracking-wider">
            COMPARATIVA VS BENCHMARK META ({targetRank.toUpperCase()})
          </h3>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded bg-hextech-gold/10 text-hextech-gold-light border border-hextech-gold/30 font-mono">
          {matches.length} Partidas Evaluadas
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          const diff = Number((m.actual - m.target).toFixed(2));
          const pct = Math.round((m.actual / Math.max(0.1, m.target)) * 100);

          return (
            <div
              key={idx}
              className="bg-hextech-navy/70 p-3.5 rounded border border-hextech-gold/20 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-hextech-cyan" />
                  {m.title}
                </span>
                {m.isBetter ? (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    <TrendingUp className="w-3 h-3" />
                    +{pct}%
                  </span>
                ) : (
                  <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-0.5 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-500/30">
                    <TrendingDown className="w-3 h-3" />
                    {pct}%
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-bold text-gray-100 font-mono">
                    {m.actual}
                  </span>
                  <span className="text-xs text-gray-400 font-sans">{m.unit}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block uppercase font-cinzel">Meta</span>
                  <span className="text-xs font-semibold text-hextech-gold font-mono">
                    {m.target} {m.unit}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-hextech-black rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    m.isBetter ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, pct))}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
