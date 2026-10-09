import { LOL_RUNES, RuneInfo } from './runeData';
import { getCurrentPatchSync } from './patchVerificationService';

export interface ValidatedRune {
  id: number;
  key: string;
  name: string;
  tree: 'Precisión' | 'Dominación' | 'Brujería' | 'Valor' | 'Inspiración';
  slot: 'KEYSTONE' | 'MINOR_1' | 'MINOR_2' | 'MINOR_3';
  description: string;
  iconPath: string;
  isCurrentPatch: boolean;
  patch: string;
}

/**
 * Registry of removed or retired runes in recent League of Legends seasons
 */
export const REMOVED_RUNES: Record<string, { id?: number; reason: string }> = {
  '8124': { reason: 'Depredador (Predator) fue eliminada permanentemente del árbol de Dominación.' },
  '8358': { reason: 'Prototipo: Omnipiedra (Omnistone) fue retirado del juego.' },
  '8134': { reason: 'Cazador Ingenioso (Ingenious Hunter) fue retirado en las actualizaciones de temporada.' },
  'depredador': { reason: 'Depredador (Predator) fue eliminada.' },
  'predator': { reason: 'Predator fue eliminada permanentemente.' },
  'omnipiedra': { reason: 'Prototipo: Omnipiedra fue retirado.' },
  'omnistone': { reason: 'Omnistone fue retirado.' },
  'cazador ingenioso': { reason: 'Cazador Ingenioso fue retirado.' },
  'ingenious hunter': { reason: 'Ingenious Hunter fue retirado.' },
};

/**
 * Tree name translation and normalization
 */
export const TREE_NAMES: Record<string, 'Precisión' | 'Dominación' | 'Brujería' | 'Valor' | 'Inspiración'> = {
  'precision': 'Precisión',
  'precisión': 'Precisión',
  'domination': 'Dominación',
  'dominación': 'Dominación',
  'sorcery': 'Brujería',
  'brujeria': 'Brujería',
  'brujería': 'Brujería',
  'resolve': 'Valor',
  'valor': 'Valor',
  'inspiration': 'Inspiración',
  'inspiracion': 'Inspiración',
  'inspiración': 'Inspiración',
};

const activeRuneCatalog = new Map<number, ValidatedRune>();
let activeRuneCatalogPatch = '';

const initBaselineRunes = (patch: string) => {
  activeRuneCatalog.clear();
  Object.values(LOL_RUNES).forEach((r) => {
    activeRuneCatalog.set(r.id, {
      id: r.id,
      key: r.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      name: r.name,
      tree: r.tree,
      slot: r.slot,
      description: r.description,
      iconPath: r.iconPath || '',
      isCurrentPatch: true,
      patch,
    });
  });
  activeRuneCatalogPatch = patch;
};

/**
 * Loads official runes from Data Dragon runesReforged.json
 */
export const syncOfficialRuneCatalog = async (patch?: string): Promise<number> => {
  const targetPatch = patch || getCurrentPatchSync();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${targetPatch}/data/es_ES/runesReforged.json`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const trees = await res.json();
      if (Array.isArray(trees) && trees.length > 0) {
        activeRuneCatalog.clear();

        trees.forEach((tree: any) => {
          const rawTreeKey = String(tree.key || tree.name).toLowerCase();
          const treeName = TREE_NAMES[rawTreeKey] || 'Precisión';

          if (Array.isArray(tree.slots)) {
            tree.slots.forEach((slotData: any, slotIdx: number) => {
              const slotType: ValidatedRune['slot'] =
                slotIdx === 0 ? 'KEYSTONE' :
                slotIdx === 1 ? 'MINOR_1' :
                slotIdx === 2 ? 'MINOR_2' : 'MINOR_3';

              if (Array.isArray(slotData.runes)) {
                slotData.runes.forEach((r: any) => {
                  const numId = Number(r.id);
                  if (numId > 0) {
                    activeRuneCatalog.set(numId, {
                      id: numId,
                      key: r.key || String(r.id),
                      name: r.name || `Runa #${numId}`,
                      tree: treeName,
                      slot: slotType,
                      description: r.shortDesc || r.longDesc || '',
                      iconPath: r.icon || '',
                      isCurrentPatch: true,
                      patch: targetPatch,
                    });
                  }
                });
              }
            });
          }
        });

        activeRuneCatalogPatch = targetPatch;
        return activeRuneCatalog.size;
      }
    }
  } catch (err) {
    console.warn(`RuneValidationService: Failed to fetch official runes for patch ${targetPatch}, using local database.`, err);
  }

  initBaselineRunes(targetPatch);
  return activeRuneCatalog.size;
};

/**
 * Checks if a rune was removed from the game
 */
export const checkRemovedRune = (idOrName: number | string): { isRemoved: boolean; reason?: string } => {
  const strId = String(idOrName).toLowerCase().trim();
  if (REMOVED_RUNES[strId]) {
    return { isRemoved: true, reason: REMOVED_RUNES[strId].reason };
  }
  const clean = strId.replace(/[^a-z0-9]/g, '');
  for (const [key, val] of Object.entries(REMOVED_RUNES)) {
    if (key.replace(/[^a-z0-9]/g, '') === clean) {
      return { isRemoved: true, reason: val.reason };
    }
  }
  return { isRemoved: false };
};

/**
 * Validates if a single rune exists and is active in the current patch
 */
export const isValidRuneInCurrentPatch = (runeId: number): boolean => {
  if (typeof runeId !== 'number' || isNaN(runeId) || runeId <= 0) return false;
  if (checkRemovedRune(runeId).isRemoved) return false;

  if (activeRuneCatalog.size === 0) {
    initBaselineRunes(getCurrentPatchSync());
  }

  return activeRuneCatalog.has(runeId) || !!LOL_RUNES[runeId];
};

/**
 * Gets validated rune info
 */
export const getValidatedRune = (idOrName: number | string): ValidatedRune | undefined => {
  if (activeRuneCatalog.size === 0) {
    initBaselineRunes(getCurrentPatchSync());
  }

  if (typeof idOrName === 'number') {
    if (!isValidRuneInCurrentPatch(idOrName)) return undefined;
    const fromCat = activeRuneCatalog.get(idOrName);
    if (fromCat) return fromCat;

    const fromLocal = LOL_RUNES[idOrName];
    if (fromLocal) {
      return {
        id: idOrName,
        key: fromLocal.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        name: fromLocal.name,
        tree: fromLocal.tree,
        slot: fromLocal.slot,
        description: fromLocal.description,
        iconPath: fromLocal.iconPath || '',
        isCurrentPatch: true,
        patch: activeRuneCatalogPatch || getCurrentPatchSync(),
      };
    }
    return undefined;
  }

  const str = String(idOrName).toLowerCase().trim();
  const clean = str.replace(/[^a-z0-9]/g, '');

  if (checkRemovedRune(str).isRemoved) return undefined;

  for (const r of activeRuneCatalog.values()) {
    if (r.name.toLowerCase() === str || r.name.toLowerCase().replace(/[^a-z0-9]/g, '') === clean) {
      return r;
    }
  }

  for (const r of Object.values(LOL_RUNES)) {
    if (r.name.toLowerCase() === str || r.name.toLowerCase().replace(/[^a-z0-9]/g, '') === clean) {
      return getValidatedRune(r.id);
    }
  }

  return undefined;
};

export interface ValidatedRuneSetup {
  primaryTree: string;
  keystone: { id: number; name: string };
  primaryMinors: Array<{ id: number; name: string }>;
  secondaryTree: string;
  secondaryMinors: Array<{ id: number; name: string }>;
  shards: { offense: string; flex: string; defense: string };
}

/**
 * Validates and sanitizes a complete rune configuration
 */
export const validateRuneConfiguration = (
  runes: {
    primaryTree: string;
    keystone: { id: number; name?: string };
    primaryMinors: Array<{ id: number; name?: string }>;
    secondaryTree: string;
    secondaryMinors: Array<{ id: number; name?: string }>;
    shards?: { offense?: string; flex?: string; defense?: string };
  }
): {
  isValid: boolean;
  errors: string[];
  sanitized: ValidatedRuneSetup;
} => {
  const errors: string[] = [];


  // Check Keystone
  let validKeystone = getValidatedRune(runes.keystone.id);
  if (!validKeystone || validKeystone.slot !== 'KEYSTONE') {
    errors.push(`Keystone inválida o no reconocida (#${runes.keystone.id}). Reemplazada por Conquistador.`);
    validKeystone = getValidatedRune(8010)!; // Conquistador default
  }

  const primaryTreeName = validKeystone.tree;

  // Validate Primary Minors
  const validPrimaryMinors: Array<{ id: number; name: string }> = [];
  runes.primaryMinors.forEach((m) => {
    const vr = getValidatedRune(m.id);
    if (vr && vr.tree === primaryTreeName && vr.slot !== 'KEYSTONE') {
      validPrimaryMinors.push({ id: vr.id, name: vr.name });
    } else {
      errors.push(`Runa menor primaria inválida (#${m.id}).`);
    }
  });

  // Ensure 3 primary minors
  if (validPrimaryMinors.length < 3) {
    const fallbackTreeRunes = Object.values(LOL_RUNES).filter((r) => r.tree === primaryTreeName && r.slot !== 'KEYSTONE');
    fallbackTreeRunes.forEach((fb) => {
      if (validPrimaryMinors.length < 3 && !validPrimaryMinors.some((p) => p.id === fb.id)) {
        validPrimaryMinors.push({ id: fb.id, name: fb.name });
      }
    });
  }

  // Validate Secondary Tree (cannot be same as primary)
  let secondaryTree = TREE_NAMES[runes.secondaryTree?.toLowerCase()] || 'Inspiración';
  if (secondaryTree === primaryTreeName) {
    secondaryTree = primaryTreeName === 'Inspiración' ? 'Valor' : 'Inspiración';
    errors.push('La rama secundaria no puede ser igual a la primaria; reasignada.');
  }

  // Validate Secondary Minors
  const validSecondaryMinors: Array<{ id: number; name: string }> = [];
  runes.secondaryMinors.forEach((m) => {
    const vr = getValidatedRune(m.id);
    if (vr && vr.tree === secondaryTree && vr.slot !== 'KEYSTONE') {
      validSecondaryMinors.push({ id: vr.id, name: vr.name });
    } else {
      errors.push(`Runa menor secundaria inválida (#${m.id}).`);
    }
  });

  if (validSecondaryMinors.length < 2) {
    const fallbackSecRunes = Object.values(LOL_RUNES).filter((r) => r.tree === secondaryTree && r.slot !== 'KEYSTONE');
    fallbackSecRunes.forEach((fb) => {
      if (validSecondaryMinors.length < 2 && !validSecondaryMinors.some((p) => p.id === fb.id)) {
        validSecondaryMinors.push({ id: fb.id, name: fb.name });
      }
    });
  }

  const validShards = {
    offense: runes.shards?.offense || '+9 Fuerza Adaptativa',
    flex: runes.shards?.flex || '+9 Fuerza Adaptativa',
    defense: runes.shards?.defense || '+65 Vida Plana',
  };

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      primaryTree: primaryTreeName,
      keystone: {
        id: validKeystone.id,
        name: validKeystone.name,
      },
      primaryMinors: validPrimaryMinors.slice(0, 3),
      secondaryTree,
      secondaryMinors: validSecondaryMinors.slice(0, 2),
      shards: validShards,
    },
  };
};

/**
 * Returns count of validated runes in active memory
 */
export const getActiveRuneCatalogCount = (): number => {
  if (activeRuneCatalog.size === 0) {
    initBaselineRunes(getCurrentPatchSync());
  }
  return activeRuneCatalog.size;
};

/**
 * Clears active rune catalog
 */
export const clearRuneCatalog = (): void => {
  activeRuneCatalog.clear();
  activeRuneCatalogPatch = '';
};
