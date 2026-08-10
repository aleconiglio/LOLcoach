import React from 'react';
import { Search, Globe, Shield, Trophy, User, Hash, Sword, Loader2, Sparkles } from 'lucide-react';
import { 
  SearchFormData, 
  PlatformRegion, 
  RoleFilter, 
  TargetRank 
} from '../types';
import { ChampionSelect } from './ChampionSelect';

interface FilterPanelProps {
  formData: SearchFormData;
  onChange: (updated: Partial<SearchFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const PLATFORMS: { label: string; value: PlatformRegion }[] = [
  { label: 'LAS (LA2 - América del Sur)', value: 'LAS' },
  { label: 'LAN (LA1 - América del Norte)', value: 'LAN' },
  { label: 'NA1 (Norteamérica)', value: 'NA1' },
  { label: 'EUW1 (Europa Oeste)', value: 'EUW1' },
  { label: 'EUN1 (Europa Nordica)', value: 'EUN1' },
  { label: 'KR (Corea del Sur)', value: 'KR' },
  { label: 'BR1 (Brasil)', value: 'BR1' },
];

const MATCH_COUNTS = [5, 10, 15, 20];

const ROLES: { label: string; value: RoleFilter }[] = [
  { label: 'Todas las Líneas (ALL)', value: 'ALL' },
  { label: 'TOP (Carril Superior)', value: 'TOP' },
  { label: 'JUNGLE (Jungla)', value: 'JUNGLE' },
  { label: 'MID (Carril Central)', value: 'MID' },
  { label: 'BOT (Carril Inferior / ADC)', value: 'BOT' },
  { label: 'SUPPORT (Soporte)', value: 'SUPPORT' },
];

const RANKS: TargetRank[] = [
  'Iron',
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Emerald',
  'Diamond',
  'Master+',
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  formData,
  onChange,
  onSubmit,
  isLoading,
}) => {
  return (
    <div className="hextech-card rounded-lg p-6 border border-hextech-gold/30 shadow-2xl relative z-30">
      
      {/* Subtle Hextech Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-hextech-cyan/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-hextech-gold/20">
        <Search className="w-5 h-5 text-hextech-gold" />
        <h2 className="text-lg font-bold text-hextech-gold-light font-cinzel tracking-wider">
          PARÁMETROS DE ANÁLISIS DE INVOCADOR
        </h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        
        {/* Grid 1: Game Name, TagLine, Region */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Input 1: Game Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-hextech-gold mb-1.5 font-cinzel flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-hextech-cyan" />
              Nombre de Invocador (Game Name)
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Faker, Hide on bush"
              value={formData.gameName}
              onChange={(e) => onChange({ gameName: e.target.value })}
              className="hextech-input w-full px-3.5 py-2 text-sm rounded font-sans"
            />
          </div>

          {/* Input 2: TagLine */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-hextech-gold mb-1.5 font-cinzel flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-hextech-cyan" />
              TagLine (#)
            </label>
            <input
              type="text"
              required
              placeholder="Ej: KR1, LAS, LAN, 1234"
              value={formData.tagLine}
              onChange={(e) => onChange({ tagLine: e.target.value })}
              className="hextech-input w-full px-3.5 py-2 text-sm rounded font-sans uppercase"
            />
          </div>

          {/* Dropdown 1: Región / Plataforma */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-hextech-gold mb-1.5 font-cinzel flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-hextech-cyan" />
              Región / Plataforma
            </label>
            <select
              value={formData.platform}
              onChange={(e) => onChange({ platform: e.target.value as PlatformRegion })}
              className="hextech-input w-full px-3.5 py-2 text-sm rounded font-sans cursor-pointer bg-hextech-dark"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value} className="bg-hextech-dark text-gray-200">
                  {p.label}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Grid 2: Match Count, Champion Filter, Role Filter, Target Rank */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Dropdown 2: Cantidad de Partidas */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-hextech-gold mb-1.5 font-cinzel flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-hextech-cyan" />
              Cantidad de Partidas
            </label>
            <select
              value={formData.matchCount}
              onChange={(e) => onChange({ matchCount: Number(e.target.value) })}
              className="hextech-input w-full px-3.5 py-2 text-sm rounded font-sans cursor-pointer bg-hextech-dark"
            >
              {MATCH_COUNTS.map((cnt) => (
                <option key={cnt} value={cnt} className="bg-hextech-dark text-gray-200">
                  {cnt} Partidas Recientes (Solo/Duo)
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 3: Filtro por Campeón */}
          <ChampionSelect
            value={formData.championFilter}
            onChange={(val) => onChange({ championFilter: val })}
          />

          {/* Dropdown 4: Filtro por Línea/Rol */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-hextech-gold mb-1.5 font-cinzel flex items-center gap-1.5">
              <Sword className="w-3.5 h-3.5 text-hextech-cyan" />
              Rol / Línea
            </label>
            <select
              value={formData.roleFilter}
              onChange={(e) => onChange({ roleFilter: e.target.value as RoleFilter })}
              className="hextech-input w-full px-3.5 py-2 text-sm rounded font-sans cursor-pointer bg-hextech-dark"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value} className="bg-hextech-dark text-gray-200">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 5: Rango Objetivo / Benchmark */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-hextech-gold mb-1.5 font-cinzel flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Rango Objetivo (Meta)
            </label>
            <select
              value={formData.targetRank}
              onChange={(e) => onChange({ targetRank: e.target.value as TargetRank })}
              className="hextech-input w-full px-3.5 py-2 text-sm rounded font-sans cursor-pointer bg-hextech-dark text-amber-300 font-semibold"
            >
              {RANKS.map((rk) => (
                <option key={rk} value={rk} className="bg-hextech-dark text-amber-300">
                  Rango {rk}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="hextech-button w-full sm:w-auto px-8 py-3 rounded text-sm tracking-widest flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-hextech-black" />
                <span>PROCESANDO ANÁLISIS RIOT & GROQ...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-hextech-black" />
                <span>ANALIZAR PARTIDAS</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
