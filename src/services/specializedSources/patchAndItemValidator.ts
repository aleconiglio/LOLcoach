import { PublishedBuild } from './sourceTypes';
import { getCurrentPatchSync } from '../patchVerificationService';
import { isValidItemInCurrentPatch, checkRemovedItem } from '../itemValidationService';
import { getItemById } from '../itemData';
import { validatePublishedRunes } from './runeRetrievalService';

export interface BuildValidationReport {
  isApproved: boolean;
  status: 'VERIFIED_CURRENT_PATCH' | 'PROVISIONAL_PREVIOUS_PATCH' | 'UNVERIFIED';
  isCurrentPatch: boolean;
  patchAgeDescription: string;
  checkedItemsCount: number;
  checkedRunesCount: number;
  invalidItems: Array<{ id: number; name: string; reason: string }>;
  warnings: string[];
  errors: string[];
}

/**
 * Validates build against Riot official data dragon for current patch legality.
 * Official data is strictly used for validation, never to fabricate alternative builds.
 */
export const validatePublishedBuild = (
  build: PublishedBuild,
  targetPatch = getCurrentPatchSync()
): BuildValidationReport => {
  const warnings: string[] = [];
  const errors: string[] = [];
  const invalidItems: Array<{ id: number; name: string; reason: string }> = [];

  let checkedItemsCount = 0;
  let checkedRunesCount = 0;

  // 1. PATCH & FRESHNESS CHECK
  const [targetMajor, targetMinor] = targetPatch.split('.').map(Number);
  const [buildMajor, buildMinor] = build.patch.split('.').map(Number);

  const isExactCurrentPatch = build.patch === targetPatch || 
    (targetMajor === buildMajor && targetMinor === buildMinor);

  let status: 'VERIFIED_CURRENT_PATCH' | 'PROVISIONAL_PREVIOUS_PATCH' | 'UNVERIFIED' = 'UNVERIFIED';
  let patchAgeDescription = '';

  if (isExactCurrentPatch) {
    status = 'VERIFIED_CURRENT_PATCH';
    patchAgeDescription = `Build verificada y actualizada para el parche oficial en curso (${targetPatch}).`;
  } else if (Math.abs(targetMajor - buildMajor) <= 1 && Math.abs(targetMinor - buildMinor) <= 20) {
    status = 'PROVISIONAL_PREVIOUS_PATCH';
    patchAgeDescription = `Aviso: Guía/Estadística provisional del parche ${build.patch}. Se presenta como referencia provisional.`;
    warnings.push(`La fuente corresponde al parche ${build.patch}, mientras el parche activo es ${targetPatch}.`);
  } else {
    status = 'UNVERIFIED';
    patchAgeDescription = `ADVERTENCIA: Guía antigua o desactualizada del parche ${build.patch}. No recomendada para juego competitivo actual.`;
    errors.push(`Guía obsoleta del parche ${build.patch} (antigüedad superior a 1 temporada).`);
  }

  // 2. CHECK STARTING ITEMS
  if (build.startingItems.primary) {
    checkedItemsCount++;
    const pId = build.startingItems.primary.id;
    if (!isValidItemInCurrentPatch(pId)) {
      const removedCheck = checkRemovedItem(build.startingItems.primary.name);
      invalidItems.push({
        id: pId,
        name: build.startingItems.primary.name,
        reason: removedCheck.isRemoved ? removedCheck.reason! : 'Objeto inicial no encontrado en el parche actual',
      });
      errors.push(`Objeto inicial primario '${build.startingItems.primary.name}' inválido.`);
    }
  }

  // 3. CHECK BOOTS
  if (build.boots && build.boots.id !== 0) { // ID 0 is Cassiopeia passive
    checkedItemsCount++;
    if (!isValidItemInCurrentPatch(build.boots.id)) {
      invalidItems.push({
        id: build.boots.id,
        name: build.boots.name,
        reason: 'Botas no existentes o retiradas en este parche',
      });
      errors.push(`Botas recomendadas '${build.boots.name}' no existen en el parche actual.`);
    }
  }

  // 4. CHECK PURCHASE ORDER ITEMS
  if (!Array.isArray(build.purchaseOrder) || build.purchaseOrder.length === 0) {
    errors.push('La build no contiene una secuencia de orden de compra verificada');
  } else {
    build.purchaseOrder.forEach((item) => {
      checkedItemsCount++;
      if (!isValidItemInCurrentPatch(item.id)) {
        const removed = checkRemovedItem(item.name);
        invalidItems.push({
          id: item.id,
          name: item.name,
          reason: removed.isRemoved ? removed.reason! : 'Objeto no válido en el parche actual',
        });
        errors.push(`Objeto de compra '${item.name}' (${item.id}) no existe en el juego activo.`);
      }

      // Check that it's a completed full item, not a basic component mistaken for completed item
      const itemInfo = getItemById(item.id);
      if (itemInfo && itemInfo.category === 'COMPONENT' && item.isCore) {
        warnings.push(`El objeto '${item.name}' parece un componente básico de receta y no un objeto legendario completo.`);
      }
    });
  }

  // 5. CHECK SITUATIONAL ITEMS
  if (Array.isArray(build.situationalOptions)) {
    build.situationalOptions.forEach((sit) => {
      checkedItemsCount++;
      if (!isValidItemInCurrentPatch(sit.id)) {
        invalidItems.push({
          id: sit.id,
          name: sit.name,
          reason: 'Objeto situacional no existe en el parche actual',
        });
        errors.push(`Objeto situacional '${sit.name}' no existe en el parche.`);
      }
    });
  }

  // 6. CHECK RUNES
  const runeResult = validatePublishedRunes(build.runes);
  checkedRunesCount += 6; // Keystone + 3 primary + 2 secondary
  if (!runeResult.isValid) {
    errors.push(...runeResult.errors);
  }

  // Final decision: if ancient guide, or has invalid items, do NOT approve as verified current patch
  const isApproved = errors.length === 0 && (status === 'VERIFIED_CURRENT_PATCH' || status === 'PROVISIONAL_PREVIOUS_PATCH');

  return {
    isApproved,
    status,
    isCurrentPatch: status === 'VERIFIED_CURRENT_PATCH',
    patchAgeDescription,
    checkedItemsCount,
    checkedRunesCount,
    invalidItems,
    warnings,
    errors,
  };
};
