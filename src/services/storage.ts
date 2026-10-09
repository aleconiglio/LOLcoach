import { AppSettings } from '../types';

const STORAGE_KEYS = {
  RIOT_API_KEY: 'lol_coach_riot_api_key',
  GROQ_API_KEY: 'lol_coach_groq_api_key',
  SEARCH_API_KEY: 'lol_coach_search_api_key',
  DEMO_MODE: 'lol_coach_demo_mode',
};

export const getStoredSettings = (): AppSettings => {
  const riotKey = localStorage.getItem(STORAGE_KEYS.RIOT_API_KEY) || 
    (import.meta.env.VITE_RIOT_API_KEY as string) || '';
    
  const groqKey = localStorage.getItem(STORAGE_KEYS.GROQ_API_KEY) || 
    (import.meta.env.VITE_GROQ_API_KEY as string) || '';

  const searchKey = localStorage.getItem(STORAGE_KEYS.SEARCH_API_KEY) ||
    (import.meta.env.VITE_SEARCH_API_KEY as string) ||
    (import.meta.env.VITE_TAVILY_API_KEY as string) || '';

  const isDemo = localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === 'true' || false;

  return {
    riotApiKey: riotKey,
    groqApiKey: groqKey,
    searchApiKey: searchKey,
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
  if (settings.searchApiKey !== undefined) {
    localStorage.setItem(STORAGE_KEYS.SEARCH_API_KEY, settings.searchApiKey.trim());
  }
  if (settings.isDemoMode !== undefined) {
    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, settings.isDemoMode ? 'true' : 'false');
  }

  return getStoredSettings();
};

