import { GameVersionInfo } from '../types';

/**
 * Fallback baseline patch in case external network is completely disconnected
 */
export const FALLBACK_PATCH = '15.3.1';

let cachedVersionInfo: GameVersionInfo | null = null;
let lastVersionFetchTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Normalizes patch strings like "16.20.1", "16.20", "patch-26-3" to standard format
 */
export const normalizePatchString = (rawPatch: string): string => {
  if (!rawPatch) return FALLBACK_PATCH;
  const cleaned = rawPatch.trim();
  const match = cleaned.match(/(\d+)\.(\d+)(\.\d+)?/);
  if (match) {
    return match[0];
  }
  const newsMatch = cleaned.match(/patch-(\d+)-(\d+)/i);
  if (newsMatch) {
    return `${newsMatch[1]}.${newsMatch[2]}.1`;
  }
  return cleaned;
};

/**
 * Compares two semantic version strings (e.g. "16.20.1" vs "15.3.1")
 * Returns > 0 if v1 > v2, 0 if v1 === v2, < 0 if v1 < v2
 */
export const comparePatches = (v1: string, v2: string): number => {
  const p1 = normalizePatchString(v1).split('.').map((n) => parseInt(n, 10) || 0);
  const p2 = normalizePatchString(v2).split('.').map((n) => parseInt(n, 10) || 0);
  const maxLen = Math.max(p1.length, p2.length);

  for (let i = 0; i < maxLen; i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
};

/**
 * Checks if two patches belong to the same major.minor cycle
 */
export const isPatchCompatible = (targetPatch: string, sourcePatch: string): boolean => {
  const normTarget = normalizePatchString(targetPatch).split('.');
  const normSource = normalizePatchString(sourcePatch).split('.');
  return normTarget[0] === normSource[0] && normTarget[1] === normSource[1];
};

let storedLastPatchMemory: string | null = null;

export const setLastSeenPatch = (patch: string | null) => {
  storedLastPatchMemory = patch;
  try {
    if (typeof localStorage !== 'undefined') {
      if (patch) localStorage.setItem('lol_coach_last_seen_patch', patch);
      else localStorage.removeItem('lol_coach_last_seen_patch');
    }
  } catch {}
};

export const getLastSeenPatch = (): string | null => {
  try {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem('lol_coach_last_seen_patch');
      if (val) return val;
    }
  } catch {}
  return storedLastPatchMemory;
};

/**
 * Fetches the verified current game version directly from Riot Data Dragon versions API
 */
export const fetchCurrentGameVersion = async (forceRefresh = false): Promise<GameVersionInfo> => {
  const now = Date.now();
  if (!forceRefresh && cachedVersionInfo && now - lastVersionFetchTime < CACHE_TTL_MS) {
    return cachedVersionInfo;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (res && res.ok) {
      const versions = await res.json();
      if (Array.isArray(versions) && versions.length > 0 && typeof versions[0] === 'string') {
        const livePatch = versions[0];
        const previousPatch = versions[1] || livePatch;
        const season = parseInt(livePatch.split('.')[0], 10) || 16;

        const storedLastPatch = getLastSeenPatch();
        const isNewPatch = storedLastPatch ? storedLastPatch !== livePatch : false;

        setLastSeenPatch(livePatch);

        cachedVersionInfo = {
          patch: livePatch,
          season,
          isNewPatch,
          lastCheckedTimestamp: now,
          isFallback: false,
        };
        lastVersionFetchTime = now;
        return cachedVersionInfo;
      }
    }
  } catch (err) {
    console.warn('PatchVerificationService: Data Dragon unreachable, applying verified fallback.', err);
  }


  // Graceful fallback to verified baseline
  const fallbackInfo: GameVersionInfo = {
    patch: cachedVersionInfo?.patch || FALLBACK_PATCH,
    season: 15,
    isNewPatch: false,
    lastCheckedTimestamp: now,
    isFallback: true,
  };
  return fallbackInfo;
};

/**
 * Synchronous getter for current verified patch
 */
export const getCurrentPatchSync = (): string => {
  return cachedVersionInfo?.patch || FALLBACK_PATCH;
};

/**
 * Resets memory cache (useful for testing and admin sync)
 */
export const resetPatchCache = (): void => {
  cachedVersionInfo = null;
  lastVersionFetchTime = 0;
  storedLastPatchMemory = null;
};

