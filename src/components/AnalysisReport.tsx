import React from 'react';
import { AIAnalysisReport, TargetRank } from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  Award, 
  ArrowRight, 
  Zap, 
  ShieldAlert 
} from 'lucide-react';

interface AnalysisReportProps {
  report: AIAnalysisReport;
  targetRank: TargetRank;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({ report, targetRank }) => {
  if (!report) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner: Executive Summary & Coaching Grade */}
      <div className="hextech-card rounded-lg p-6 border-2 border-hextech-gold/40 relative overflow-hidden bg-gradient-to-r from-hextech-dark via-hextech-navy to-hextech-blue shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-hextech-gold/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-hextech-gold" />
              <span className="text-xs font-bold uppercase tracking-widest text-hextech-gold font-cinzel">
                DIAGNÓSTICO DE COACHING ELITE (GROQ AI LLAMA-3.3-70B)
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-hextech-gold-light font-cinzel">
              INFORME DE RENDIMIENTO & ASCENSO A {targetRank.toUpperCase()}
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed font-sans">
              {report.summaryText}
            </p>
          </div>

          {/* Coaching Grade Badge */}
          {report.coachingGrade && (
            <div className="flex flex-col items-center justify-center p-4 bg-hextech-black/60 border border-hextech-gold/40 rounded-lg min-w-[120px] shadow-hextech-gold shrink-0">
              <span className="text-[10px] font-bold text-gray-400 font-cinzel uppercase">Nota de Coaching</span>
              <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-amber-300 via-hextech-gold to-yellow-100 font-cinzel">
                {report.coachingGrade}
              </span>
              <span className="text-[10px] text-hextech-gold font-semibold uppercase mt-1">
                Meta: {targetRank}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3 Main Visual Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: Puntos Fuertes (Fortalezas) */}
        <div className="hextech-card rounded-lg p-5 border border-emerald-500/30 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-emerald-500/60 transition-all">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-emerald-500/20">
              <div className="p-2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel font-bold text-emerald-300 text-base">
                  1. PUNTOS FUERTES
                </h3>
                <span className="text-[11px] text-gray-400">Fortalezas detectadas en tu juego</span>
              </div>
            </div>

            <div className="space-y-3.5">
              {report.strengths.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-emerald-950/20 rounded border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-emerald-200 font-cinzel">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-2 font-sans">
                    {item.description}
                  </p>
                  {item.metric && (
                    <span className="inline-block text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                      {item.metric}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 2: Diagnóstico de Errores Críticos (Puntos de Dolor) */}
        <div className="hextech-card rounded-lg p-5 border border-rose-500/30 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-rose-500/60 transition-all">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-rose-500/20">
              <div className="p-2 rounded bg-rose-950/60 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel font-bold text-rose-300 text-base">
                  2. ERRORES CRÍTICOS
                </h3>
                <span className="text-[11px] text-gray-400">Puntos de dolor que frenan tu ascenso</span>
              </div>
            </div>

            <div className="space-y-3.5">
              {report.criticalErrors.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-rose-950/20 rounded border border-rose-500/20 hover:border-rose-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-rose-200 font-cinzel">
                      {item.title}
                    </h4>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      item.impact === 'CRÍTICO' 
                        ? 'bg-rose-600 text-white' 
                        : item.impact === 'ALTO' 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-yellow-600 text-white'
                    }`}>
                      {item.impact}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-2 font-sans">
                    {item.description}
                  </p>
                  <div className="p-2 bg-hextech-black/60 rounded border border-rose-500/30 text-[11px] text-rose-200">
                    <strong className="text-rose-400 font-cinzel">Solución: </strong>
                    {item.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 3: Plan de Acción Inmediato (3 Objetivos Próxima Partida) */}
        <div className="hextech-card rounded-lg p-5 border border-hextech-gold/40 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-hextech-gold transition-all">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-hextech-gold/20">
              <div className="p-2 rounded bg-hextech-navy text-hextech-gold border border-hextech-gold/40">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel font-bold text-hextech-gold text-base">
                  3. PLAN DE ACCIÓN INMEDIATO
                </h3>
                <span className="text-[11px] text-gray-400">3 Objetivos concretos para la próxima partida</span>
              </div>
            </div>

            <div className="space-y-3.5">
              {report.actionPlan.map((item) => (
                <div
                  key={item.step}
                  className="p-3.5 bg-hextech-navy/80 rounded border border-hextech-gold/30 hover:border-hextech-gold transition-all relative"
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-hextech-gold-dark to-hextech-gold text-hextech-black font-extrabold text-xs flex items-center justify-center font-cinzel shrink-0">
                      {item.step}
                    </span>
                    <h4 className="text-xs font-bold text-hextech-gold-light font-cinzel">
                      {item.objective}
                    </h4>
                  </div>
                  
                  <p className="text-xs text-gray-300 leading-relaxed mb-2 pl-8 font-sans">
                    {item.howToExecute}
                  </p>
                  
                  <div className="pl-8">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-hextech-cyan bg-hextech-black/60 px-2 py-0.5 rounded border border-hextech-cyan/30 font-mono">
                      <Zap className="w-3 h-3 text-hextech-cyan" />
                      Meta: {item.targetMetric}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
