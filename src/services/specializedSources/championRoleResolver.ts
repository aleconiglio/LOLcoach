import { RoleFilter } from '../../types';
import { resolveChampionInfo, ChampionMetadata } from '../championData';

export interface ResolvedChampionRole {
  championName: string;
  role: RoleFilter;
  isRoleExplicit: boolean;
  normalizedKey: string;
  championMetadata: ChampionMetadata;
}

/**
 * Normalizes role inputs (handling ADC / BOT equivalence, lowercase, etc.)
 */
export const normalizeRole = (role?: string): RoleFilter | undefined => {
  if (!role) return undefined;
  const upper = role.trim().toUpperCase();
  if (upper === 'ADC' || upper === 'BOT' || upper === 'BOTTOM') return 'BOT';
  if (upper === 'TOP') return 'TOP';
  if (upper === 'JUNGLE' || upper === 'JGL') return 'JUNGLE';
  if (upper === 'MID' || upper === 'MIDDLE') return 'MID';
  if (upper === 'SUPPORT' || upper === 'SUP' || upper === 'SUPP') return 'SUPPORT';
  return undefined;
};

/**
 * Resolves exact champion identity and appropriate role.
 * Never guesses an experimental off-role if the role is not explicitly verified.
 */
export const resolveChampionAndRole = (
  championName: string,
  explicitRole?: RoleFilter | string
): ResolvedChampionRole => {
  const meta = resolveChampionInfo(championName);
  const normalizedExplicit = normalizeRole(explicitRole);

  const effectiveRole: RoleFilter = normalizedExplicit || meta.role || 'MID';
  const isRoleExplicit = Boolean(normalizedExplicit);

  // Normalized key format: champion_role (e.g. "darius_top")
  const normalizedKey = `${meta.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${effectiveRole.toLowerCase()}`;

  return {
    championName: meta.name,
    role: effectiveRole,
    isRoleExplicit,
    normalizedKey,
    championMetadata: meta,
  };
};
