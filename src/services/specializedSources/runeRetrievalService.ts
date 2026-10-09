import { PublishedRunePage } from './sourceTypes';
import { getRuneById, isValidRune } from '../runeData';
import { validateRuneConfiguration } from '../runeValidationService';

export interface ValidatedRuneResult {
  isValid: boolean;
  runes: PublishedRunePage;
  errors: string[];
}

/**
 * Validates and preserves the rune configuration published by a specialized source.
 * Enforces tree structure, keystone validity, and legality in current patch without LLM invention.
 */
export const validatePublishedRunes = (
  runes: PublishedRunePage
): ValidatedRuneResult => {
  const errors: string[] = [];

  if (!runes.primaryTree) {
    errors.push('Rama primaria ausente');
  }

  if (!runes.secondaryTree) {
    errors.push('Rama secundaria ausente');
  }

  if (runes.primaryTree && runes.secondaryTree && runes.primaryTree === runes.secondaryTree) {
    errors.push('La rama primaria y secundaria no pueden ser idénticas');
  }

  // Validate keystone
  if (!runes.keystone || !runes.keystone.id) {
    errors.push('Keystone no identificada');
  } else if (!isValidRune(runes.keystone.id)) {
    errors.push(`Keystone ID ${runes.keystone.id} no existe en los datos del juego`);
  }

  // Validate primary minors (must be 3)
  if (!Array.isArray(runes.primaryMinors) || runes.primaryMinors.length !== 3) {
    errors.push(`Se esperaban 3 runas primarias menores, encontradas: ${runes.primaryMinors?.length || 0}`);
  } else {
    runes.primaryMinors.forEach((m) => {
      if (!isValidRune(m.id)) {
        errors.push(`Runa primaria menor ${m.name} (${m.id}) no es válida en el parche actual`);
      }
    });
  }

  // Validate secondary minors (must be 2)
  if (!Array.isArray(runes.secondaryMinors) || runes.secondaryMinors.length !== 2) {
    errors.push(`Se esperaban 2 runas secundarias menores, encontradas: ${runes.secondaryMinors?.length || 0}`);
  } else {
    runes.secondaryMinors.forEach((m) => {
      if (!isValidRune(m.id)) {
        errors.push(`Runa secundaria menor ${m.name} (${m.id}) no es válida en el parche actual`);
      }
    });
  }

  // Validate shards
  if (!runes.shards || !runes.shards.offense || !runes.shards.flex || !runes.shards.defense) {
    errors.push('Fragmentos de estadísticas incompletos');
  }

  return {
    isValid: errors.length === 0,
    runes,
    errors,
  };
};
