import React, { useState, useRef, useEffect } from 'react';
import { LOL_CHAMPIONS, getChampionIconUrl, handleChampionImageError } from '../services/championData';
import { Sword, X, ChevronDown, Check } from 'lucide-react';

interface ChampionSelectProps {
  value: string;
  onChange: (val: string) => void;
}

export const ChampionSelect: React.FC<ChampionSelectProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize internal search query when external value changes
  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter champions based on query
  const filteredChampions = LOL_CHAMPIONS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    c.normalizedName.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  // Find exact matched champion for selected value
  const matchedChampion = LOL_CHAMPIONS.find(
    (c) =>
      c.name.toLowerCase() === value.trim().toLowerCase() ||
      c.id.toLowerCase() === value.trim().toLowerCase()
  );

  // Show preview ONLY when a valid champion is selected AND search query matches champion name
  const showPreview = !!matchedChampion && searchQuery.trim().toLowerCase() === matchedChampion.name.toLowerCase();

  const handleSelect = (champName: string) => {
    onChange(champName);
    setSearchQuery(champName);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setIsOpen(true);

    const match = LOL_CHAMPIONS.find(
      (c) => c.name.toLowerCase() === val.trim().toLowerCase() || c.id.toLowerCase() === val.trim().toLowerCase()
    );
    if (match) {
      onChange(match.name);
    } else {
      onChange('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-hextech-gold mb-1.5 font-cinzel flex items-center gap-1.5">
        <Sword className="w-3.5 h-3.5 text-hextech-cyan" />
        Filtro por Campeón (Opcional)
      </label>

      <div className="relative">
        {/* Selected Champion Icon Preview if confirmed */}
        {showPreview && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded overflow-hidden border border-hextech-gold/40 z-10">
            <img
              key={matchedChampion.id}
              src={getChampionIconUrl(matchedChampion.name)}
              alt={matchedChampion.name}
              className="w-full h-full object-cover"
              onError={(e) => handleChampionImageError(e, matchedChampion.name)}
            />
          </div>
        )}

        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar campeón (ej: Malzahar, Ahri...)"
          className={`hextech-input w-full py-2 text-sm rounded font-sans pr-8 transition-all ${
            showPreview ? 'pl-10' : 'pl-3.5'
          }`}
        />

        {searchQuery ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-hextech-gold transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <ChevronDown
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hextech-gold/70 pointer-events-none transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto bg-hextech-dark/95 border-2 border-hextech-gold/60 rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 divide-y divide-hextech-gold/10 backdrop-blur-lg">
          {filteredChampions.length > 0 ? (
            filteredChampions.map((c) => {
              const isSelected = value.toLowerCase() === c.name.toLowerCase();
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelect(c.name)}
                  className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer hover:bg-hextech-navy transition-colors ${
                    isSelected ? 'bg-hextech-navy text-hextech-gold font-bold' : 'text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={getChampionIconUrl(c.name)}
                      alt={c.name}
                      className="w-7 h-7 rounded border border-hextech-gold/30 object-cover"
                      onError={(e) => handleChampionImageError(e, c.name)}
                    />
                    <span className="font-cinzel text-sm">{c.name}</span>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-hextech-gold" />}
                </div>
              );
            })
          ) : (
            <div className="p-3 text-xs text-gray-400 text-center font-sans">
              No se encontraron campeones para "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
