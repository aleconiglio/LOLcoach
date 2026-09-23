import { AppSettings, PlatformRegion } from '../types';

const STORAGE_KEYS = {
  RIOT_API_KEY: 'lol_coach_riot_api_key',
  GROQ_API_KEY: 'lol_coach_groq_api_key',
  DEMO_MODE: 'lol_coach_demo_mode',
  RECENT_SUMMONERS: 'lol_coach_recent_summoners',
};

export interface SavedSummoner {
  gameName: string;
  tagLine: string;
  platform: PlatformRegion;
  lastUsed: number;
}

export const getStoredSettings = (): AppSettings => {
  const riotKey = localStorage.getItem(STORAGE_KEYS.RIOT_API_KEY) || 
    (import.meta.env.VITE_RIOT_API_KEY as string) || '';
    
  const groqKey = localStorage.getItem(STORAGE_KEYS.GROQ_API_KEY) || 
    (import.meta.env.VITE_GROQ_API_KEY as string) || '';

  const isDemo = localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === 'true' || false;

  return {
    riotApiKey: riotKey,
    groqApiKey: groqKey,
    isDemoMode: isDemo,
  };
};

export const saveStoredSettings = (settings: Partial<AppSettings>): AppSettings => {
  if (settings.riotApiKey !== undefined) {
    localStorage.setItem(STORAGE_KEYS.RIOT_API_KEY, settings.riotApiKey.trim());
  }
  if (settings.groqApiKey !== undefined) {
    localStorage.setItem(STORAGE_KEYS.GROQ_API_KEY, settings.groqApiKey.trim());
  }
  if (settings.isDemoMode !== undefined) {
    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, settings.isDemoMode ? 'true' : 'false');
  }

  return getStoredSettings();
};

/**
 * Obtiene la lista de invocadores guardados en el navegador (localStorage)
 */
export const getSavedSummoners = (): SavedSummoner[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_SUMMONERS);
    if (!raw) return [];
    const list: SavedSummoner[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.warn('Error reading saved summoners from localStorage:', err);
    return [];
  }
};

/**
 * Guarda o actualiza un invocador en la lista reciente del navegador
 */
export const saveRecentSummoner = (
  gameName: string,
  tagLine: string,
  platform: PlatformRegion
): SavedSummoner[] => {
  if (!gameName.trim()) return getSavedSummoners();
  try {
    const current = getSavedSummoners();
    const cleanName = gameName.trim();
    const cleanTag = (tagLine || 'LAS').trim().toUpperCase();

    // Eliminar si ya existía para ponerlo al principio como el más reciente
    const filtered = current.filter(
      (s) =>
        !(
          s.gameName.toLowerCase() === cleanName.toLowerCase() &&
          s.tagLine.toUpperCase() === cleanTag &&
          s.platform === platform
        )
    );

    const updated: SavedSummoner[] = [
      {
        gameName: cleanName,
        tagLine: cleanTag,
        platform,
        lastUsed: Date.now(),
      },
      ...filtered,
    ].slice(0, 10); // Conservar hasta 10 invocadores recientes

    localStorage.setItem(STORAGE_KEYS.RECENT_SUMMONERS, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Error saving recent summoner:', err);
    return getSavedSummoners();
  }
};

/**
 * Elimina un invocador de la lista guardada en el navegador
 */
export const removeRecentSummoner = (
  gameName: string,
  tagLine: string,
  platform: PlatformRegion
): SavedSummoner[] => {
  try {
    const current = getSavedSummoners();
    const cleanName = gameName.trim().toLowerCase();
    const cleanTag = tagLine.trim().toUpperCase();

    const updated = current.filter(
      (s) =>
        !(
          s.gameName.toLowerCase() === cleanName &&
          s.tagLine.toUpperCase() === cleanTag &&
          s.platform === platform
        )
    );

    localStorage.setItem(STORAGE_KEYS.RECENT_SUMMONERS, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Error removing saved summoner:', err);
    return getSavedSummoners();
  }
};
