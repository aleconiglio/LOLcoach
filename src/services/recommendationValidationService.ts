import { BuildRecommendation, BuildRecommendationTraceability, WebResearchSource, ConfidenceLevel } from '../types';
import { isValidItemInCurrentPatch, resolveValidatedItem, checkRemovedItem } from './itemValidationService';
import { isValidRuneInCurrentPatch, getValidatedRune, checkRemovedRune, validateRuneConfiguration } from './runeValidationService';
import { getChampionProfile, ITEM_PROFILES, filterC_ChampionCompatibility } from './championCompatibilityService';

export interface ValidationSummary {
  isValid: boolean;
  checkedItemsCount: number;
  checkedRunesCount: number;
  replacedItems: string[];
  replacedRunes: string[];
  errors: string[];
}

/**
 * Fallback verified items for automatic substitution if an invalid item is passed
 */
const CLASS_FALLBACK_ITEMS: Record<string, number> = {
  AP: 3089,      // Rabadon
  AD: 3031,      // Infinity Edge
  BRUISER: 3071, // Black Cleaver
  TANK: 3068,    // Sunfire
  BOOTS: 3158,   // Ionian Boots
  STARTER: 1056, // Doran's Ring
};

/**
 * Validates and sanitizes a complete BuildRecommendation object
 * Ensures NO removed, unverified, or champion-incompatible item/rune reaches the user interface
 */
export const validateBuildRecommendation = (
  recommendation: BuildRecommendation,
  sources: WebResearchSource[] = [],
  sampleSize = 4200,
  confidenceLevel: ConfidenceLevel = 'HIGH',
  evidenceQualityText = 'Recomendación validada contra datos oficiales de Riot Games.'
): {
  recommendation: BuildRecommendation;
  validationSummary: ValidationSummary;
} => {
  const errors: string[] = [];
  const replacedItems: string[] = [];
  const replacedRunes: string[] = [];
  let checkedItemsCount = 0;
  let checkedRunesCount = 0;

  const rec = { ...recommendation };
  const championProfile = getChampionProfile(rec.playerChampion);

  // 1. VALIDATE STARTING ITEM
  checkedItemsCount++;
  if (!isValidItemInCurrentPatch(rec.startingItem.primary.id)) {
    const removal = checkRemovedItem(rec.startingItem.primary.id);
    errors.push(`Objeto inicial primario #${rec.startingItem.primary.id} no es válido en el parche actual (${removal.reason || 'No existe'}). Sustituido.`);
    replacedItems.push(`Inicio: ${rec.startingItem.primary.name} -> Anillo de Doran`);
    rec.startingItem.primary = {
      id: 1056,
      name: 'Anillo de Doran',
      reason: 'Objeto inicial sustituto oficial verificado para el parche actual.',
    };
  }

  if (rec.startingItem.alternative) {
    checkedItemsCount++;
    if (!isValidItemInCurrentPatch(rec.startingItem.alternative.id)) {
      errors.push(`Objeto inicial alternativo #${rec.startingItem.alternative.id} inválido. Eliminado.`);
      replacedItems.push(`Alternativa inicio: ${rec.startingItem.alternative.name} removida`);
      rec.startingItem.alternative = undefined;
    }
  }

  // 2. VALIDATE BOOTS
  checkedItemsCount++;
  if (rec.playerChampion === 'Cassiopeia' || rec.boots.id === 0) {
    rec.boots = {
      id: 0,
      name: 'Gracia Serpentina (Pasiva)',
      reason: 'Cassiopeia no puede comprar botas en la tienda; obtiene velocidad de movimiento por nivel.',
    };
  } else if (!isValidItemInCurrentPatch(rec.boots.id)) {
    errors.push(`Botas recomendadas #${rec.boots.id} inválidas en el parche actual. Sustituidas por Botas Jonias.`);
    replacedItems.push(`Botas: ${rec.boots.name} -> Botas Jonias`);
    rec.boots = {
      id: 3158,
      name: 'Botas Jonias de la Lucidez',
      reason: 'Botas sustitutas oficiales verificadas.',
    };
  }

  // 3. VALIDATE CORE BUILD
  const validatedCore: typeof rec.coreBuild = [];
  rec.coreBuild.forEach((item, index) => {
    checkedItemsCount++;
    const isValid = isValidItemInCurrentPatch(item.id);
    const itemProfile = ITEM_PROFILES[item.id];
    const isCompatible = itemProfile
      ? filterC_ChampionCompatibility(championProfile, itemProfile).allowed
      : true;

    if (isValid && isCompatible && !validatedCore.some((c) => c.id === item.id)) {
      validatedCore.push({
        ...item,
        order: validatedCore.length + 1,
      });
    } else {
      const removal = checkRemovedItem(item.id);
      const reasonDetail = !isValid
        ? (removal.reason || 'No existe en el parche')
        : `Incompatible con ${championProfile.name}`;
      errors.push(`Objeto del core #${item.id} (${item.name}) rechazado (${reasonDetail}).`);
      
      // Provide valid, archetype-appropriate alternative
      let fallbackId = CLASS_FALLBACK_ITEMS.BRUISER;
      if (championProfile.primaryDamageType === 'MAGIC' || championProfile.scalesWithAP) {
        fallbackId = CLASS_FALLBACK_ITEMS.AP;
      } else if (championProfile.combatClass === 'MARKSMAN') {
        fallbackId = CLASS_FALLBACK_ITEMS.AD;
      } else if (championProfile.combatClass === 'TANK' || championProfile.combatClass === 'SUPPORT_TANK') {
        fallbackId = CLASS_FALLBACK_ITEMS.TANK;
      }

      if (!validatedCore.some((c) => c.id === fallbackId)) {
        const fbItem = resolveValidatedItem(fallbackId);
        if (fbItem) {
          replacedItems.push(`Core #${item.id}: ${item.name} -> ${fbItem.name}`);
          validatedCore.push({
            order: validatedCore.length + 1,
            id: fbItem.id,
            name: fbItem.name,
            reason: `Objeto sustituto verificado para ${championProfile.name} en parche ${rec.patch}.`,
            isCore: index < 3,
          });
        }
      }
    }
  });
  rec.coreBuild = validatedCore;

  // 4. VALIDATE SITUATIONAL ITEMS (Existence + Champion Compatibility)
  const validatedSituational: typeof rec.situationalItems = [];
  rec.situationalItems.forEach((sit) => {
    checkedItemsCount++;
    const isValid = isValidItemInCurrentPatch(sit.id);
    if (!isValid) {
      errors.push(`Objeto situacional #${sit.id} (${sit.name}) inválido en el parche actual. Descartado.`);
      replacedItems.push(`Situacional descartado: ${sit.name}`);
      return;
    }

    const itemProfile = ITEM_PROFILES[sit.id];
    if (itemProfile) {
      const compat = filterC_ChampionCompatibility(championProfile, itemProfile);
      if (!compat.allowed) {
        errors.push(`Objeto situacional #${sit.id} (${sit.name}) descartado: incompatible con ${championProfile.name} (${compat.reason}).`);
        replacedItems.push(`Situacional incompatible descartado: ${sit.name}`);
        return;
      }
    }

    validatedSituational.push(sit);
  });
  rec.situationalItems = validatedSituational;

  // 5. VALIDATE RUNES
  checkedRunesCount += 6; // Keystone + 3 minors + 2 secondary minors
  const runeValidation = validateRuneConfiguration({
    primaryTree: rec.runes.primaryTree,
    keystone: rec.runes.keystone,
    primaryMinors: rec.runes.primaryMinors,
    secondaryTree: rec.runes.secondaryTree,
    secondaryMinors: rec.runes.secondaryMinors,
    shards: rec.runes.shards,
  });

  if (!runeValidation.isValid) {
    errors.push(...runeValidation.errors);
    replacedRunes.push(...runeValidation.errors);
  }

  rec.runes = {
    primaryTree: runeValidation.sanitized.primaryTree,
    keystone: {
      id: runeValidation.sanitized.keystone.id,
      name: runeValidation.sanitized.keystone.name || 'Keystone',
      description: rec.runes.keystone.description || '',
    },
    primaryMinors: runeValidation.sanitized.primaryMinors,
    secondaryTree: runeValidation.sanitized.secondaryTree,
    secondaryMinors: runeValidation.sanitized.secondaryMinors,
    shards: runeValidation.sanitized.shards,
  };

  // 6. SANITIZE EXPLANATION TEXT AGAINST HALLUCINATED REMOVED ITEMS
  if (rec.explanation && Array.isArray(rec.explanation.reasons)) {
    rec.explanation.reasons = rec.explanation.reasons.map((reasonText) => {
      let sanitized = reasonText;
      const bannedKeywords = ['Viento Huracanado', 'Galeforce', 'Tenaza del Muerte Ígnea', 'Deathfire Grasp', 'Duskblade', 'Draktharr'];
      bannedKeywords.forEach((banned) => {
        if (sanitized.includes(banned)) {
          sanitized = sanitized.replace(new RegExp(banned, 'gi'), '[Objeto de Parche Anterior Sustituido]');
          errors.push(`Mención de objeto eliminado (${banned}) sanitizada en explicación táctica.`);
        }
      });
      return sanitized;
    });
  }

  // 7. BUILD COMPLETE TRACEABILITY METADATA
  const isSampleInsufficient = sampleSize < 500;
  const isNewPatchWarning = confidenceLevel === 'LOW' || isSampleInsufficient;

  const traceability: BuildRecommendationTraceability = {
    patch: rec.patch,
    generatedAt: Date.now(),
    researchAt: Date.now(),
    sources,
    confidenceLevel,
    evidenceQualityText,
    isNewPatchWarning,
    isSampleInsufficient,
    sampleSize,
    engineVersion: '2.0.0-deep-research',
    validationResult: {
      isValid: errors.length === 0,
      checkedItemsCount,
      checkedRunesCount,
      replacedItems,
      replacedRunes,
      errors,
    },
  };

  rec.traceability = traceability;
  rec.confidenceLevel = confidenceLevel;

  return {
    recommendation: rec,
    validationSummary: {
      isValid: errors.length === 0,
      checkedItemsCount,
      checkedRunesCount,
      replacedItems,
      replacedRunes,
      errors,
    },
  };
};
