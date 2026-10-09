import { KnowledgeBaseStatus } from '../types';
import { fetchCurrentGameVersion, getCurrentPatchSync } from './patchVerificationService';
import { syncOfficialItemCatalog, getActiveItemCatalogCount, clearItemCatalog } from './itemValidationService';
import { syncOfficialRuneCatalog, getActiveRuneCatalogCount, clearRuneCatalog } from './runeValidationService';
import { clearWebResearchCache } from './webResearchService';

const KB_STORAGE_KEYS = {
  PATCH: 'lol_coach_kb_patch',
  TIMESTAMP: 'lol_coach_kb_timestamp',
  HISTORY: 'lol_coach_kb_history',
};

/**
 * Checks current status of knowledge base in memory and persistent storage
 */
export const getKnowledgeBaseStatus = (): KnowledgeBaseStatus => {
  const currentPatch = getCurrentPatchSync();
  let lastUpdated = Date.now();

  if (typeof localStorage !== 'undefined') {
    const storedTime = localStorage.getItem(KB_STORAGE_KEYS.TIMESTAMP);
    if (storedTime) {
      lastUpdated = parseInt(storedTime, 10) || Date.now();
    }
  }

  return {
    patch: currentPatch,
    lastUpdatedTimestamp: lastUpdated,
    itemCount: getActiveItemCatalogCount(),
    runeCount: getActiveRuneCatalogCount(),
    isSynchronized: true,
    sourcesAvailable: [
      'Riot Games Data Dragon (item.json)',
      'Riot Games Data Dragon (runesReforged.json)',
      'League of Legends Official Patch Notes',
      'Lolalytics Metagame Statistics',
      'U.GG High-Elo Builds',
    ],
  };
};

/**
 * Invalidates outdated cache entries when a new patch is detected
 */
export const invalidateOutdatedCache = (newPatch: string): void => {
  clearItemCatalog();
  clearRuneCatalog();
  clearWebResearchCache();

  if (typeof localStorage !== 'undefined') {
    // Record in history log
    try {
      const historyRaw = localStorage.getItem(KB_STORAGE_KEYS.HISTORY);
      const history: Array<{ patch: string; timestamp: number }> = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift({ patch: newPatch, timestamp: Date.now() });
      localStorage.setItem(KB_STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 10)));
    } catch {
      // Ignore storage errors
    }
  }
};

/**
 * Automatically checks if a new patch has dropped and synchronizes official data
 */
export const checkAndAutoUpdateKnowledgeBase = async (): Promise<{
  updated: boolean;
  patch: string;
  itemCount: number;
  runeCount: number;
}> => {
  const versionInfo = await fetchCurrentGameVersion();
  const currentPatch = versionInfo.patch;

  let storedPatch = '';
  if (typeof localStorage !== 'undefined') {
    storedPatch = localStorage.getItem(KB_STORAGE_KEYS.PATCH) || '';
  }

  // If patch is new or not loaded yet
  const needsUpdate = !storedPatch || storedPatch !== currentPatch || getActiveItemCatalogCount() === 0;

  if (needsUpdate) {
    invalidateOutdatedCache(currentPatch);
    const [itemCount, runeCount] = await Promise.all([
      syncOfficialItemCatalog(currentPatch),
      syncOfficialRuneCatalog(currentPatch),
    ]);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(KB_STORAGE_KEYS.PATCH, currentPatch);
      localStorage.setItem(KB_STORAGE_KEYS.TIMESTAMP, String(Date.now()));
    }

    return {
      updated: true,
      patch: currentPatch,
      itemCount,
      runeCount,
    };
  }

  return {
    updated: false,
    patch: currentPatch,
    itemCount: getActiveItemCatalogCount(),
    runeCount: getActiveRuneCatalogCount(),
  };
};

/**
 * Administrative action to force update the knowledge base immediately
 */
export const forceUpdateKnowledgeBase = async (
  targetPatch?: string
): Promise<{
  success: boolean;
  patch: string;
  itemCount: number;
  runeCount: number;
  timestamp: number;
}> => {
  const versionInfo = await fetchCurrentGameVersion(true);
  const patchToUse = targetPatch || versionInfo.patch;

  invalidateOutdatedCache(patchToUse);

  const [itemCount, runeCount] = await Promise.all([
    syncOfficialItemCatalog(patchToUse),
    syncOfficialRuneCatalog(patchToUse),
  ]);

  const timestamp = Date.now();
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(KB_STORAGE_KEYS.PATCH, patchToUse);
    localStorage.setItem(KB_STORAGE_KEYS.TIMESTAMP, String(timestamp));
  }

  return {
    success: true,
    patch: patchToUse,
    itemCount,
    runeCount,
    timestamp,
  };
};
