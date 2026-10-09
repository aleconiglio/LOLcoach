import { LOL_ITEMS, ItemInfo } from './itemData';
import { getCurrentPatchSync } from './patchVerificationService';

export interface ValidatedItem {
  id: number;
  name: string;
  category: 'AP' | 'AD' | 'TANK' | 'SUPPORT' | 'BOOTS' | 'STARTER' | 'COMPONENT' | 'WARD';
  tags: string[];
  gold: {
    total: number;
    base: number;
    sell: number;
    purchasable: boolean;
  };
  stats?: Record<string, number>;
  description?: string;
  from?: string[];
  into?: string[];
  maps: Record<string, boolean>;
  isCurrentPatch: boolean;
  patch: string;
}

/**
 * Registry of famous removed or deprecated League of Legends items
 * Prevents AI from hallucinating items that no longer exist
 */
export const REMOVED_OR_LEGACY_ITEMS: Record<string, { id?: number; reason: string }> = {
  '3128': { reason: 'Tenaza del Muerte Ígnea (Deathfire Grasp) fue eliminada permanentemente del juego.' },
  '6671': { reason: 'Viento Huracanado (Galeforce) fue eliminado con la retirada del sistema mítico.' },
  '6691': { reason: 'Hoja Crepuscular de Draktharr fue eliminada en los cambios de temporada.' },
  '6632': { reason: 'Guadaña Sagrada (Divine Sunderer) fue eliminada en la actualización de luchadores.' },
  '6693': { reason: 'Garra del Merodeador fue eliminada del catálogo de asesinos.' },
  '6664': { reason: 'Quimiotanque Turbo fue retirado de la tienda de la Grieta del Invocador.' },
  '3005': { reason: 'Espada de los Dioses fue retirada del modo clásico.' },
  '3144': { reason: 'Sable Pistola Hextech fue retirado del juego regular.' },
  '3052': { reason: 'Baluarte de la Montaña clásico fue reemplazado por la línea de Atlas Mundial.' },
  'tenaza del muerte ignea': { reason: 'Deathfire Grasp fue retirado hace varias temporadas.' },
  'viento huracanado': { reason: 'Galeforce fue eliminado de la tienda de Grieta del Invocador.' },
  'hoja crepuscular de draktharr': { reason: 'Duskblade of Draktharr fue eliminado en el fin de la era mítica.' },
  'duskblade': { reason: 'Duskblade fue eliminado en la temporada 14.' },
  'guadaña sagrada': { reason: 'Divine Sunderer fue eliminado.' },
  'divine sunderer': { reason: 'Divine Sunderer fue eliminado.' },
  'garra del merodeador': { reason: 'Prowler\'s Claw fue retirado del juego.' },
  'prowler': { reason: 'Prowler\'s Claw fue retirado del juego.' },
  'galeforce': { reason: 'Galeforce fue eliminado.' },
  'deathfire grasp': { reason: 'Deathfire Grasp eliminado.' },
};

/**
 * Common colloquially used aliases mapped to valid modern Item IDs
 */
export const ITEM_ALIASES: Record<string, number> = {
  'tabis': 3047,
  'botas blindadas': 3047,
  'ninja tabis': 3047,
  'mercs': 3111,
  'botas de mercurio': 3111,
  'mercuriales': 3111,
  'hechicero': 3020,
  'botas del hechicero': 3020,
  'sorc shoes': 3020,
  'lucidez': 3158,
  'botas ionias': 3158,
  'botas jonias': 3158,
  'liandry': 6653,
  'tormento de liandry': 6653,
  'zhonya': 3157,
  'reloj de arena de zhonya': 3157,
  'rabadon': 3089,
  'deathcap': 3089,
  'sombrero mortal de rabadon': 3089,
  'luden': 6655,
  'companera de luden': 6655,
  'compañera de luden': 6655,
  'bork': 3153,
  'botrk': 3153,
  'espada del rey arruinado': 3153,
  'blade of the ruined king': 3153,
  'ie': 3031,
  'filo del infinito': 3031,
  'infinity edge': 3031,
  'kaenic': 6667,
  'bastion de kaenic': 6667,
  'bastión de kaenic': 6667,
  'morello': 3165,
  'morellonomicon': 3165,
  'morellonomicón': 3165,
  'ldr': 3036,
  'lord dominik': 3036,
  'recuerdos de lord dominik': 3036,
  'chempunk': 6609,
  'chempunk chainsword': 6609,
  'espada-sierra quimopunica': 6609,
  'espada-sierra quimopúnica': 6609,
  'dead man': 3742,
  'dead mans plate': 3742,
  'coraza del muerto': 3742,
  'silvermere': 6035,
  'silvermere dawn': 6035,
  'amanecer de mercurio': 6035,
  'black cleaver': 3071,
  'cuchilla negra': 3071,
  'cleaver': 3071,
  'sterak': 3053,
  'steraks gage': 3053,
  'guantelete de sterak': 3053,
  'death dance': 6333,
  'deaths dance': 6333,
  'danza de la muerte': 6333,
  'thornmail': 3075,
  'cota de espinas': 3075,
  'bramble vest': 3076,
  'chaleco de zarzas': 3076,
  'randuin': 3143,
  'presagio de randuin': 3143,
  'force of nature': 4401,
  'fuerza de la naturaleza': 4401,
  'stridebreaker': 6631,
  'rompeavances': 6631,
  'void staff': 3135,
  'baculo del vacio': 3135,
  'báculo del vacío': 3135,
  'corazon de acero': 3084,
  'corazón de acero': 3084,
  'heartsteel': 3084,
  'cielo desgarrado': 6610,
  'sundered sky': 6610,
  'trinidad': 3078,
  'trinity force': 3078,
  'fuerza de la trinidad': 3078,
  'nashor': 3115,
  'diente de nashor': 3115,
  'eclipse': 6692,
  'coleccionista': 6676,
  'el coleccionista': 6676,
  'the collector': 6676,
};

// In-memory catalog of active validated items
const activeItemCatalog = new Map<number, ValidatedItem>();
let activeCatalogPatch = '';

/**
 * Initializes the baseline catalog from local verified storage or memory
 */
const initBaselineCatalog = (patch: string) => {
  activeItemCatalog.clear();
  Object.values(LOL_ITEMS).forEach((item) => {
    activeItemCatalog.set(item.id, {
      id: item.id,
      name: item.name,
      category: item.category,
      tags: item.tags || [],
      gold: {
        total: 3000,
        base: 1000,
        sell: 2100,
        purchasable: true,
      },
      maps: { '11': true },
      isCurrentPatch: true,
      patch,
    });
  });
  activeCatalogPatch = patch;
};

/**
 * Loads and caches the official Data Dragon item dataset for the target patch
 */
export const syncOfficialItemCatalog = async (patch?: string): Promise<number> => {
  const targetPatch = patch || getCurrentPatchSync();

  // Try fetching official Data Dragon item.json
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${targetPatch}/data/es_ES/item.json`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.data) {
        activeItemCatalog.clear();
        const rawItems = data.data;

        Object.keys(rawItems).forEach((key) => {
          const numId = parseInt(key, 10);
          if (isNaN(numId)) return;

          const itemData = rawItems[key];
          // Check if valid for Summoner's Rift (Map 11) and purchasable in store
          const isPurchasable = itemData.gold ? itemData.gold.purchasable !== false : true;
          const isSRMap = itemData.maps ? itemData.maps['11'] === true : true;
          const inStore = itemData.inStore !== false;

          if (isPurchasable && isSRMap && inStore) {
            // Categorize by tags and stats
            const tags: string[] = Array.isArray(itemData.tags) ? itemData.tags : [];
            let category: ValidatedItem['category'] = 'COMPONENT';
            if (tags.includes('Boots')) category = 'BOOTS';
            else if (tags.includes('SpellDamage') || tags.includes('MagicDamage')) category = 'AP';
            else if (tags.includes('Damage') || tags.includes('CriticalStrike') || tags.includes('AttackSpeed')) category = 'AD';
            else if (tags.includes('Armor') || tags.includes('SpellBlock') || tags.includes('Health')) category = 'TANK';
            else if (tags.includes('GoldPer') || tags.includes('Lane')) category = 'STARTER';

            activeItemCatalog.set(numId, {
              id: numId,
              name: itemData.name || `Objeto #${numId}`,
              category,
              tags,
              gold: {
                total: itemData.gold?.total || 0,
                base: itemData.gold?.base || 0,
                sell: itemData.gold?.sell || 0,
                purchasable: isPurchasable,
              },
              stats: itemData.stats || {},
              description: itemData.plaintext || itemData.description || '',
              from: itemData.from,
              into: itemData.into,
              maps: itemData.maps || { '11': true },
              isCurrentPatch: true,
              patch: targetPatch,
            });
          }
        });

        activeCatalogPatch = targetPatch;
        return activeItemCatalog.size;
      }
    }
  } catch (err) {
    console.warn(`ItemValidationService: Failed to fetch official item.json for patch ${targetPatch}, falling back to local dataset.`, err);
  }

  // Fallback to verified local database
  initBaselineCatalog(targetPatch);
  return activeItemCatalog.size;
};

/**
 * Checks if an item was removed or is legacy
 */
export const checkRemovedItem = (idOrName: number | string): { isRemoved: boolean; reason?: string } => {
  const strId = String(idOrName).toLowerCase().trim();
  if (REMOVED_OR_LEGACY_ITEMS[strId]) {
    return { isRemoved: true, reason: REMOVED_OR_LEGACY_ITEMS[strId].reason };
  }
  const cleanName = strId.replace(/[^a-z0-9]/g, '');
  for (const [key, val] of Object.entries(REMOVED_OR_LEGACY_ITEMS)) {
    if (key.replace(/[^a-z0-9]/g, '') === cleanName) {
      return { isRemoved: true, reason: val.reason };
    }
  }
  return { isRemoved: false };
};

/**
 * Validates if an item ID exists and is active in the current patch
 */
export const isValidItemInCurrentPatch = (itemId: number): boolean => {
  if (typeof itemId !== 'number' || isNaN(itemId) || itemId <= 0) return false;
  if (checkRemovedItem(itemId).isRemoved) return false;

  if (activeItemCatalog.size === 0) {
    initBaselineCatalog(getCurrentPatchSync());
  }

  return activeItemCatalog.has(itemId) || !!LOL_ITEMS[itemId];
};

/**
 * Resolves an item by numeric ID, name, or colloquial alias
 */
export const resolveValidatedItem = (idOrName: number | string): ValidatedItem | undefined => {
  if (activeItemCatalog.size === 0) {
    initBaselineCatalog(getCurrentPatchSync());
  }

  if (typeof idOrName === 'number') {
    if (!isValidItemInCurrentPatch(idOrName)) return undefined;
    return activeItemCatalog.get(idOrName) || {
      id: idOrName,
      name: LOL_ITEMS[idOrName]?.name || `Objeto #${idOrName}`,
      category: LOL_ITEMS[idOrName]?.category || 'COMPONENT',
      tags: LOL_ITEMS[idOrName]?.tags || [],
      gold: { total: 3000, base: 1000, sell: 2100, purchasable: true },
      maps: { '11': true },
      isCurrentPatch: true,
      patch: activeCatalogPatch || getCurrentPatchSync(),
    };
  }

  const str = String(idOrName).trim().toLowerCase();
  const clean = str.replace(/[^a-z0-9]/g, '');

  // 1. Check removed
  if (checkRemovedItem(str).isRemoved) return undefined;

  // 2. Check direct alias
  if (ITEM_ALIASES[str]) {
    return resolveValidatedItem(ITEM_ALIASES[str]);
  }
  for (const [alias, id] of Object.entries(ITEM_ALIASES)) {
    if (alias.replace(/[^a-z0-9]/g, '') === clean) {
      return resolveValidatedItem(id);
    }
  }

  // 3. Check name in active catalog
  for (const item of activeItemCatalog.values()) {
    if (
      item.name.toLowerCase() === str ||
      item.name.toLowerCase().replace(/[^a-z0-9]/g, '') === clean
    ) {
      return item;
    }
  }

  // 4. Check name in baseline LOL_ITEMS
  for (const item of Object.values(LOL_ITEMS)) {
    if (
      item.name.toLowerCase() === str ||
      item.name.toLowerCase().replace(/[^a-z0-9]/g, '') === clean
    ) {
      return resolveValidatedItem(item.id);
    }
  }

  return undefined;
};

/**
 * Returns count of validated items in active memory
 */
export const getActiveItemCatalogCount = (): number => {
  if (activeItemCatalog.size === 0) {
    initBaselineCatalog(getCurrentPatchSync());
  }
  return activeItemCatalog.size;
};

/**
 * Clears active catalog (for testing or forced refresh)
 */
export const clearItemCatalog = (): void => {
  activeItemCatalog.clear();
  activeCatalogPatch = '';
};
