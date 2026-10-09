import { 
  ActiveGameChampion, 
  CompositionAnalysis, 
  BuildRecommendation, 
  RoleFilter 
} from '../types';
import { getCurrentPatchSync } from './patchVerificationService';
import { validateBuildRecommendation } from './recommendationValidationService';
import { 
  selectBestPublishedBuild, 
  selectBestPublishedBuildSync 
} from './specializedSources/buildSelectionService';

export interface BuildRecommendationInput {
  patch: string;
  playerChampion: string;
  playerRole?: RoleFilter;
  allies: ActiveGameChampion[];
  enemies: ActiveGameChampion[];
  compositionAnalysis: CompositionAnalysis;
  searchApiKey?: string;
  region?: string;
  bypassCache?: boolean;
}

/**
 * Generates a build recommendation based EXCLUSIVELY on published data from permitted specialized sources:
 * (OP.GG, U.GG, Mobalytics, League of Graphs, MOBAFire).
 * Procedural generation and unverified item fabrication have been completely removed.
 */
export const generateBuildRecommendation = (
  input: BuildRecommendationInput
): BuildRecommendation => {
  const targetPatch = input.patch || getCurrentPatchSync();

  // Route directly and exclusively through specialized sources build selection service
  const publishedRec = selectBestPublishedBuildSync({
    championName: input.playerChampion,
    role: input.playerRole,
    patch: targetPatch,
    region: input.region || 'global',
    compositionAnalysis: input.compositionAnalysis,
    allies: input.allies,
    enemies: input.enemies,
    bypassCache: input.bypassCache,
  });

  // Riot Official Data Dragon is used strictly as a validation layer
  const validated = validateBuildRecommendation(
    publishedRec,
    publishedRec.traceability?.sources,
    publishedRec.traceability?.sampleSize,
    publishedRec.confidenceLevel,
    publishedRec.traceability?.evidenceQualityText
  );

  return validated.recommendation;
};

/**
 * Async deep research build recommendation engine.
 * Queries permitted specialized sources, checks patch freshness, respects consensus,
 * preserves purchase order, and restricts situational options to those backed by the sources.
 */
export const generateDeepResearchBuildRecommendation = async (
  input: BuildRecommendationInput & { searchApiKey?: string }
): Promise<BuildRecommendation> => {
  const targetPatch = input.patch || getCurrentPatchSync();

  // Route directly and exclusively through specialized sources build selection service
  const publishedRec = await selectBestPublishedBuild({
    championName: input.playerChampion,
    role: input.playerRole,
    patch: targetPatch,
    region: input.region || 'global',
    compositionAnalysis: input.compositionAnalysis,
    allies: input.allies,
    enemies: input.enemies,
    bypassCache: input.bypassCache,
  });

  // Riot Official Data Dragon is used strictly as a validation layer
  const validated = validateBuildRecommendation(
    publishedRec,
    publishedRec.traceability?.sources,
    publishedRec.traceability?.sampleSize,
    publishedRec.confidenceLevel,
    publishedRec.traceability?.evidenceQualityText
  );

  return validated.recommendation;
};
