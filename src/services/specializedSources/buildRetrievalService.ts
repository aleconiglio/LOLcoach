import { RoleFilter } from '../../types';
import { PublishedBuild } from './sourceTypes';
import { resolveChampionAndRole } from './championRoleResolver';
import { querySpecializedSources } from './sourceResearchService';
import { validatePublishedBuild } from './patchAndItemValidator';
import { getCachedBuilds, setCachedBuilds } from './sourceCache';
import { getCurrentPatchSync } from '../patchVerificationService';
import { findCatalogBuilds } from './specializedSourcesCatalog';

export interface RetrievedBuildsPackage {
  champion: string;
  role: RoleFilter;
  patch: string;
  isCached: boolean;
  validBuilds: PublishedBuild[];
  provisionalBuilds: PublishedBuild[];
  rejectedBuilds: Array<{ build: PublishedBuild; reasons: string[] }>;
  sourcesConsulted: string[];
}

/**
 * Retrieves and validates builds for a champion and role from specialized sources
 */
export const retrievePublishedBuilds = async (
  championName: string,
  role?: RoleFilter | string,
  patch?: string,
  region = 'global',
  bypassCache = false
): Promise<RetrievedBuildsPackage> => {
  const currentPatch = patch || getCurrentPatchSync();
  const { championName: resolvedChampion, role: resolvedRole } = resolveChampionAndRole(
    championName,
    role
  );

  // 1. Check cache
  if (!bypassCache) {
    const cached = getCachedBuilds(resolvedChampion, resolvedRole, currentPatch, region);
    if (cached && cached.length > 0) {
      return {
        champion: resolvedChampion,
        role: resolvedRole,
        patch: currentPatch,
        isCached: true,
        validBuilds: cached.filter((b) => b.validationStatus === 'VERIFIED_CURRENT_PATCH'),
        provisionalBuilds: cached.filter((b) => b.validationStatus === 'PROVISIONAL_PREVIOUS_PATCH'),
        rejectedBuilds: [],
        sourcesConsulted: Array.from(new Set(cached.map((b) => b.sourceUrl))),
      };
    }
  }

  // 2. Query specialized sources
  const research = await querySpecializedSources(resolvedChampion, resolvedRole, currentPatch);

  const validBuilds: PublishedBuild[] = [];
  const provisionalBuilds: PublishedBuild[] = [];
  const rejectedBuilds: Array<{ build: PublishedBuild; reasons: string[] }> = [];

  // 3. Validate every build through official patch & item validator
  research.builds.forEach((build) => {
    const valReport = validatePublishedBuild(build, currentPatch);
    if (valReport.status === 'VERIFIED_CURRENT_PATCH') {
      validBuilds.push(build);
    } else if (valReport.status === 'PROVISIONAL_PREVIOUS_PATCH') {
      provisionalBuilds.push(build);
    } else {
      rejectedBuilds.push({
        build,
        reasons: valReport.errors,
      });
    }
  });

  // 4. Update cache with valid & provisional builds
  const cacheableBuilds = [...validBuilds, ...provisionalBuilds];
  if (cacheableBuilds.length > 0) {
    setCachedBuilds(resolvedChampion, resolvedRole, currentPatch, cacheableBuilds, region);
  }

  return {
    champion: resolvedChampion,
    role: resolvedRole,
    patch: currentPatch,
    isCached: false,
    validBuilds,
    provisionalBuilds,
    rejectedBuilds,
    sourcesConsulted: research.sourcesConsulted,
  };
};

/**
 * Synchronous version for synchronous recommendation engine callers
 */
export const retrievePublishedBuildsSync = (
  championName: string,
  role?: RoleFilter | string,
  patch?: string,
  region = 'global',
  bypassCache = false
): RetrievedBuildsPackage => {
  const currentPatch = patch || getCurrentPatchSync();
  const { championName: resolvedChampion, role: resolvedRole } = resolveChampionAndRole(
    championName,
    role
  );

  // 1. Check cache
  if (!bypassCache) {
    const cached = getCachedBuilds(resolvedChampion, resolvedRole, currentPatch, region);
    if (cached && cached.length > 0) {
      return {
        champion: resolvedChampion,
        role: resolvedRole,
        patch: currentPatch,
        isCached: true,
        validBuilds: cached.filter((b) => b.validationStatus === 'VERIFIED_CURRENT_PATCH'),
        provisionalBuilds: cached.filter((b) => b.validationStatus === 'PROVISIONAL_PREVIOUS_PATCH'),
        rejectedBuilds: [],
        sourcesConsulted: Array.from(new Set(cached.map((b) => b.sourceUrl))),
      };
    }
  }

  // 2. Query verified catalog
  const catalogBuilds = findCatalogBuilds(resolvedChampion, resolvedRole, currentPatch);

  const validBuilds: PublishedBuild[] = [];
  const provisionalBuilds: PublishedBuild[] = [];
  const rejectedBuilds: Array<{ build: PublishedBuild; reasons: string[] }> = [];

  // 3. Validate every build through official patch & item validator
  catalogBuilds.forEach((build: PublishedBuild) => {
    const valReport = validatePublishedBuild(build, currentPatch);
    if (valReport.status === 'VERIFIED_CURRENT_PATCH') {
      validBuilds.push(build);
    } else if (valReport.status === 'PROVISIONAL_PREVIOUS_PATCH') {
      provisionalBuilds.push(build);
    } else {
      rejectedBuilds.push({
        build,
        reasons: valReport.errors,
      });
    }
  });

  // 4. Update cache
  const cacheableBuilds = [...validBuilds, ...provisionalBuilds];
  if (cacheableBuilds.length > 0) {
    setCachedBuilds(resolvedChampion, resolvedRole, currentPatch, cacheableBuilds, region);
  }

  return {
    champion: resolvedChampion,
    role: resolvedRole,
    patch: currentPatch,
    isCached: false,
    validBuilds,
    provisionalBuilds,
    rejectedBuilds,
    sourcesConsulted: catalogBuilds.map((b: PublishedBuild) => b.sourceUrl),
  };
};

