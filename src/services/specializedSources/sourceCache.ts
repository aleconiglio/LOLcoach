import { PublishedBuild } from './sourceTypes';
import { getCurrentPatchSync } from '../patchVerificationService';

export interface CacheEntry {
  key: string;
  patch: string;
  champion: string;
  role: string;
  region: string;
  builds: PublishedBuild[];
  timestamp: number;
  ttlMs: number;
}

const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const cacheStore = new Map<string, CacheEntry>();
let lastKnownPatch = getCurrentPatchSync();

/**
 * Generates a composite cache key by champion, role, patch, and region
 */
export const buildCacheKey = (
  champion: string,
  role: string,
  patch: string,
  region = 'global'
): string => {
  const normChamp = champion.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const normRole = role.trim().toUpperCase();
  const normPatch = patch.trim();
  const normReg = region.trim().toLowerCase();
  return `${normChamp}_${normRole}_${normPatch}_${normReg}`;
};

/**
 * Automatically invalidates all entries if the game patch has changed
 */
export const checkAndInvalidateOnPatchChange = (currentPatch: string): boolean => {
  if (currentPatch && currentPatch !== lastKnownPatch) {
    cacheStore.clear();
    lastKnownPatch = currentPatch;
    return true;
  }
  return false;
};

/**
 * Gets cached builds for a given query if fresh and matching the patch
 */
export const getCachedBuilds = (
  champion: string,
  role: string,
  patch: string,
  region = 'global'
): PublishedBuild[] | null => {
  const currentPatch = patch || getCurrentPatchSync();
  checkAndInvalidateOnPatchChange(currentPatch);

  const key = buildCacheKey(champion, role, currentPatch, region);
  const entry = cacheStore.get(key);

  if (!entry) return null;

  // Enforce patch freshness: never return a build cached for a different patch
  if (entry.patch !== currentPatch) {
    cacheStore.delete(key);
    return null;
  }

  // Check TTL
  const isExpired = Date.now() - entry.timestamp > entry.ttlMs;
  if (isExpired) {
    cacheStore.delete(key);
    return null;
  }

  return entry.builds;
};

/**
 * Stores published builds in the cache
 */
export const setCachedBuilds = (
  champion: string,
  role: string,
  patch: string,
  builds: PublishedBuild[],
  region = 'global',
  ttlMs = DEFAULT_TTL_MS
): void => {
  const currentPatch = patch || getCurrentPatchSync();
  const key = buildCacheKey(champion, role, currentPatch, region);

  cacheStore.set(key, {
    key,
    patch: currentPatch,
    champion,
    role,
    region,
    builds,
    timestamp: Date.now(),
    ttlMs,
  });
};

/**
 * Manually invalidates the entire cache (e.g. on user force-refresh)
 */
export const clearSourceCache = (): void => {
  cacheStore.clear();
};

/**
 * Inspects current cache stats
 */
export const getSourceCacheStats = () => ({
  size: cacheStore.size,
  lastKnownPatch,
  keys: Array.from(cacheStore.keys()),
});
