import { AppSettings } from '../types';

const STORAGE_KEYS = {
  RIOT_API_KEY: 'lol_coach_riot_api_key',
  GROQ_API_KEY: 'lol_coach_groq_api_key',
  DEMO_MODE: 'lol_coach_demo_mode',
};

declare global {
  interface Window {
    electronAPI?: {
      getAppVersion: () => Promise<string>;
      getSettings: () => Promise<Partial<AppSettings> | null>;
      saveSettings: (settings: Partial<AppSettings>) => Promise<Partial<AppSettings> | null>;
      checkForUpdates: () => Promise<void>;
      quitAndInstall: () => Promise<void>;
      onUpdaterStatus: (callback: (data: any) => void) => () => void;
    };
  }
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

export const loadPersistentSettings = async (): Promise<AppSettings> => {
  let settings = getStoredSettings();

  if (window.electronAPI?.getSettings) {
    try {
      const fileSettings = await window.electronAPI.getSettings();
      if (fileSettings) {
        if (fileSettings.riotApiKey) {
          localStorage.setItem(STORAGE_KEYS.RIOT_API_KEY, fileSettings.riotApiKey);
          settings.riotApiKey = fileSettings.riotApiKey;
        }
        if (fileSettings.groqApiKey) {
          localStorage.setItem(STORAGE_KEYS.GROQ_API_KEY, fileSettings.groqApiKey);
          settings.groqApiKey = fileSettings.groqApiKey;
        }
        if (fileSettings.isDemoMode !== undefined) {
          localStorage.setItem(STORAGE_KEYS.DEMO_MODE, fileSettings.isDemoMode ? 'true' : 'false');
          settings.isDemoMode = fileSettings.isDemoMode;
        }
      }
    } catch (e) {
      console.error('Error loading electron persistent settings:', e);
    }
  }

  return settings;
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

  if (window.electronAPI?.saveSettings) {
    window.electronAPI.saveSettings(settings);
  }

  return getStoredSettings();
};
