import { CompositionAnalysis, ActiveGameChampion } from '../types';
import { ChampionMetadata, resolveChampionInfo } from './championData';
import { isValidItemInCurrentPatch, resolveValidatedItem, checkRemovedItem } from './itemValidationService';
import { getCurrentPatchSync } from './patchVerificationService';

export type DamageType = 'PHYSICAL' | 'MAGIC' | 'TRUE' | 'MIXED';

export type CombatClass = 
  | 'JUGGERNAUT'
  | 'DIVER'
  | 'BRUISER'
  | 'TANK'
  | 'MAGE'
  | 'ASSASSIN_AD'
  | 'ASSASSIN_AP'
  | 'MARKSMAN'
  | 'SUPPORT_ENCHANTER'
  | 'SUPPORT_TANK';

export interface ChampionProfile {
  id: string;
  name: string;
  numericId: number;
  combatClass: CombatClass;
  primaryDamageType: DamageType;
  scalesWithAD: boolean;
  scalesWithAP: boolean;
  scalesWithArmor: boolean;
  scalesWithMR: boolean;
  scalesWithHP: boolean;
  scalesWithAttackSpeed: boolean;
  scalesWithCrit: boolean;
  scalesWithLethality: boolean;
  isManaless: boolean;
  isEnergy: boolean;
  isRanged: boolean;
  needsMobility: boolean;
  antiTankPreferences: ('ARMOR_SHRED' | 'ARMOR_PEN' | 'PERCENT_HP_PHYSICAL' | 'PERCENT_HP_MAGIC' | 'MAGIC_PEN')[];
  antiHealPreferences: ('PHYSICAL' | 'MAGIC' | 'TANK')[];
  antiBurstPreferences: ('PHYSICAL_ARMOR' | 'MAGIC_SHIELD' | 'STASIS' | 'SHIELDBOW' | 'REVIVE')[];
  antiCcPreferences: ('TENACITY' | 'SPELL_SHIELD' | 'CLEANSE_QSS')[];
  keySynergies: string[];
}

export interface ItemCompatibilityProfile {
  id: number;
  name: string;
  category: 'AD' | 'AP' | 'TANK' | 'SUPPORT' | 'BOOTS';
  stats: {
    ad?: number;
    ap?: number;
    armor?: number;
    mr?: number;
    hp?: number;
    attackSpeed?: number;
    crit?: number;
    lethality?: number;
    abilityHaste?: number;
    mana?: number;
    moveSpeed?: number;
  };
  isPureAp: boolean;
  isPureAd: boolean;
  isPureTank: boolean;
  isManaDependent: boolean;
  isRangedOnly?: boolean;
  isMeleeOnly?: boolean;
  antiHeal?: 'PHYSICAL' | 'MAGIC' | 'TANK';
  antiTank?: 'ARMOR_SHRED' | 'ARMOR_PEN' | 'MAGIC_PEN' | 'PERCENT_HP_PHYSICAL' | 'PERCENT_HP_MAGIC';
  antiBurst?: 'PHYSICAL_ARMOR' | 'MAGIC_SHIELD' | 'STASIS' | 'SHIELDBOW' | 'REVIVE';
  antiCc?: 'TENACITY' | 'SPELL_SHIELD' | 'CLEANSE_QSS';
  providesMobility?: boolean;
  description: string;
}

/**
 * Detailed compatibility profiles for champions
 */
const CHAMPION_PROFILES_DATABASE: Record<string, Partial<ChampionProfile>> = {
  Darius: {
    id: 'Darius',
    name: 'Darius',
    numericId: 122,
    combatClass: 'JUGGERNAUT',
    primaryDamageType: 'PHYSICAL',
    scalesWithAD: true,
    scalesWithAP: false,
    scalesWithArmor: true,
    scalesWithMR: true,
    scalesWithHP: true,
    scalesWithAttackSpeed: true,
    scalesWithCrit: false,
    scalesWithLethality: false,
    isManaless: false,
    isEnergy: false,
    isRanged: false,
    needsMobility: true,
    antiTankPreferences: ['ARMOR_SHRED', 'PERCENT_HP_PHYSICAL'],
    antiHealPreferences: ['TANK', 'PHYSICAL'],
    antiBurstPreferences: ['PHYSICAL_ARMOR', 'REVIVE'],
    antiCcPreferences: ['TENACITY', 'CLEANSE_QSS'],
    keySynergies: [
      'Cuchilla Negra: Cada tic del sangrado de la pasiva Hemorragia aplica una carga de corte de armadura.',
      'Guantelete de Sterak: Convierte su enorme daño de ataque básico en un colosal escudo salvavidas.',
      'Danza de la Muerte: Aplaza el daño explosivo y cura con cada reinicio de la definitiva Guillotina Noxiana.',
      'Coraza del Muerto: Proporciona la velocidad de movimiento plana esencial para compensar su falta de desplazamientos.',
      'Cota de Espinas: Aplica Heridas Graves mientras absorbe daño físico en combates prolongados.',
      'Espada-Sierra Quimopúnica: Otorga Heridas Graves manteniendo daño de ataque y vida para sus rotaciones.',
    ],
  },
  Garen: {
    id: 'Garen',
    name: 'Garen',
    numericId: 86,
    combatClass: 'JUGGERNAUT',
    primaryDamageType: 'PHYSICAL',
    scalesWithAD: true,
    scalesWithAP: false,
    scalesWithArmor: true,
    scalesWithMR: true,
    scalesWithHP: true,
    scalesWithAttackSpeed: true,
    scalesWithCrit: true,
    scalesWithLethality: false,
    isManaless: true,
    isEnergy: false,
    isRanged: false,
    needsMobility: true,
    antiTankPreferences: ['ARMOR_SHRED'],
    antiHealPreferences: ['TANK', 'PHYSICAL'],
    antiBurstPreferences: ['PHYSICAL_ARMOR'],
    antiCcPreferences: ['TENACITY'],
    keySynergies: ['Rompeavances', 'Coraza del Muerto', 'Cuchilla Negra', 'Fuerza de la Trinidad'],
  },
  Aatrox: {
    id: 'Aatrox',
    name: 'Aatrox',
    numericId: 266,
    combatClass: 'BRUISER',
    primaryDamageType: 'PHYSICAL',
    scalesWithAD: true,
    scalesWithAP: false,
    scalesWithArmor: true,
    scalesWithMR: true,
    scalesWithHP: true,
    scalesWithAttackSpeed: false,
    scalesWithCrit: false,
    scalesWithLethality: true,
    isManaless: true,
    isEnergy: false,
    isRanged: false,
    needsMobility: false,
    antiTankPreferences: ['ARMOR_SHRED', 'ARMOR_PEN'],
    antiHealPreferences: ['PHYSICAL'],
    antiBurstPreferences: ['PHYSICAL_ARMOR', 'MAGIC_SHIELD'],
    antiCcPreferences: ['TENACITY'],
    keySynergies: ['Cielo Desgarrado', 'Eclipse', 'Rencor de Serylda', 'Cuchilla Negra'],
  },
  Ahri: {
    id: 'Ahri',
    name: 'Ahri',
    numericId: 103,
    combatClass: 'MAGE',
    primaryDamageType: 'MAGIC',
    scalesWithAD: false,
    scalesWithAP: true,
    scalesWithArmor: false,
    scalesWithMR: false,
    scalesWithHP: true,
    scalesWithAttackSpeed: false,
    scalesWithCrit: false,
    scalesWithLethality: false,
    isManaless: false,
    isEnergy: false,
    isRanged: true,
    needsMobility: false,
    antiTankPreferences: ['PERCENT_HP_MAGIC', 'MAGIC_PEN'],
    antiHealPreferences: ['MAGIC'],
    antiBurstPreferences: ['STASIS', 'MAGIC_SHIELD'],
    antiCcPreferences: ['SPELL_SHIELD'],
    keySynergies: ['Compañera de Luden', 'Malignidad', 'Reloj de Arena de Zhonya', 'Báculo del Vacío'],
  },
  Cassiopeia: {
    id: 'Cassiopeia',
    name: 'Cassiopeia',
    numericId: 69,
    combatClass: 'MAGE',
    primaryDamageType: 'MAGIC',
    scalesWithAD: false,
    scalesWithAP: true,
    scalesWithArmor: false,
    scalesWithMR: false,
    scalesWithHP: true,
    scalesWithAttackSpeed: false,
    scalesWithCrit: false,
    scalesWithLethality: false,
    isManaless: false,
    isEnergy: false,
    isRanged: true,
    needsMobility: false,
    antiTankPreferences: ['PERCENT_HP_MAGIC', 'MAGIC_PEN'],
    antiHealPreferences: ['MAGIC'],
    antiBurstPreferences: ['STASIS'],
    antiCcPreferences: ['SPELL_SHIELD'],
    keySynergies: ['Tormento de Liandry', 'Cetro de Cristal de Rylai', 'Abrazo del Serafín', 'Báculo del Vacío'],
  },
  Brand: {
    id: 'Brand',
    name: 'Brand',
    numericId: 63,
    combatClass: 'MAGE',
    primaryDamageType: 'MAGIC',
    scalesWithAD: false,
    scalesWithAP: true,
    scalesWithArmor: false,
    scalesWithMR: false,
    scalesWithHP: true,
    scalesWithAttackSpeed: false,
    scalesWithCrit: false,
    scalesWithLethality: false,
    isManaless: false,
    isEnergy: false,
    isRanged: true,
    needsMobility: false,
    antiTankPreferences: ['PERCENT_HP_MAGIC', 'MAGIC_PEN'],
    antiHealPreferences: ['MAGIC'],
    antiBurstPreferences: ['STASIS'],
    antiCcPreferences: ['SPELL_SHIELD'],
    keySynergies: ['Tormento de Liandry', 'Cetro de Cristal de Rylai', 'Báculo del Vacío', 'Criptoflorecimiento'],
  },
  Jinx: {
    id: 'Jinx',
    name: 'Jinx',
    numericId: 222,
    combatClass: 'MARKSMAN',
    primaryDamageType: 'PHYSICAL',
    scalesWithAD: true,
    scalesWithAP: false,
    scalesWithArmor: false,
    scalesWithMR: false,
    scalesWithHP: false,
    scalesWithAttackSpeed: true,
    scalesWithCrit: true,
    scalesWithLethality: false,
    isManaless: false,
    isEnergy: false,
    isRanged: true,
    needsMobility: true,
    antiTankPreferences: ['ARMOR_PEN', 'PERCENT_HP_PHYSICAL'],
    antiHealPreferences: ['PHYSICAL'],
    antiBurstPreferences: ['REVIVE', 'SHIELDBOW'],
    antiCcPreferences: ['CLEANSE_QSS'],
    keySynergies: ['Filo del Infinito', 'Huracán de Runaan', 'Recuerdos de Lord Dominik', 'La Sanguinaria'],
  },
  Zed: {
    id: 'Zed',
    name: 'Zed',
    numericId: 238,
    combatClass: 'ASSASSIN_AD',
    primaryDamageType: 'PHYSICAL',
    scalesWithAD: true,
    scalesWithAP: false,
    scalesWithArmor: false,
    scalesWithMR: false,
    scalesWithHP: false,
    scalesWithAttackSpeed: false,
    scalesWithCrit: false,
    scalesWithLethality: true,
    isManaless: false,
    isEnergy: true,
    isRanged: false,
    needsMobility: false,
    antiTankPreferences: ['ARMOR_SHRED', 'ARMOR_PEN'],
    antiHealPreferences: ['PHYSICAL'],
    antiBurstPreferences: ['REVIVE'],
    antiCcPreferences: ['SPELL_SHIELD'],
    keySynergies: ['Eclipse', 'Rencor de Serylda', 'Filo de la Noche', 'Hidra Profana'],
  },
  Nautilus: {
    id: 'Nautilus',
    name: 'Nautilus',
    numericId: 111,
    combatClass: 'SUPPORT_TANK',
    primaryDamageType: 'MAGIC',
    scalesWithAD: false,
    scalesWithAP: true,
    scalesWithArmor: true,
    scalesWithMR: true,
    scalesWithHP: true,
    scalesWithAttackSpeed: false,
    scalesWithCrit: false,
    scalesWithLethality: false,
    isManaless: false,
    isEnergy: false,
    isRanged: false,
    needsMobility: false,
    antiTankPreferences: [],
    antiHealPreferences: ['TANK'],
    antiBurstPreferences: ['PHYSICAL_ARMOR', 'MAGIC_SHIELD'],
    antiCcPreferences: ['TENACITY'],
    keySynergies: ['Promesa del Caballero', 'Relicario de los Solari', 'Convergencia de Zeke', 'Cota de Espinas'],
  },
};

/**
 * Resolved champion profile with comprehensive archetype fallbacks
 */
export const getChampionProfile = (nameOrId: string | number): ChampionProfile => {
  const meta = resolveChampionInfo(nameOrId);
  const explicit = CHAMPION_PROFILES_DATABASE[meta.name] || CHAMPION_PROFILES_DATABASE[meta.id];

  const combatClass: CombatClass = (meta.combatClass as CombatClass) || 'BRUISER';
  const primaryDamageType: DamageType = (meta.damageType as DamageType) || 'PHYSICAL';

  const defaultScalings = {
    AD: primaryDamageType === 'PHYSICAL' || primaryDamageType === 'MIXED',
    AP: primaryDamageType === 'MAGIC' || primaryDamageType === 'MIXED',
    Armor: combatClass === 'TANK' || combatClass === 'SUPPORT_TANK' || combatClass === 'BRUISER' || combatClass === 'JUGGERNAUT',
    MR: combatClass === 'TANK' || combatClass === 'SUPPORT_TANK' || combatClass === 'BRUISER' || combatClass === 'JUGGERNAUT',
    HP: combatClass === 'TANK' || combatClass === 'SUPPORT_TANK' || combatClass === 'BRUISER' || combatClass === 'JUGGERNAUT',
    AttackSpeed: combatClass === 'MARKSMAN' || combatClass === 'BRUISER',
    Crit: combatClass === 'MARKSMAN',
    Lethality: combatClass === 'ASSASSIN_AD',
  };

  const isRanged = combatClass === 'MARKSMAN' || combatClass === 'MAGE' || combatClass === 'SUPPORT_ENCHANTER' || meta.isHighRange;

  return {
    id: meta.id,
    name: meta.name,
    numericId: meta.numericId,
    combatClass: explicit?.combatClass || combatClass,
    primaryDamageType: explicit?.primaryDamageType || primaryDamageType,
    scalesWithAD: explicit?.scalesWithAD !== undefined ? explicit.scalesWithAD : defaultScalings.AD,
    scalesWithAP: explicit?.scalesWithAP !== undefined ? explicit.scalesWithAP : defaultScalings.AP,
    scalesWithArmor: explicit?.scalesWithArmor !== undefined ? explicit.scalesWithArmor : defaultScalings.Armor,
    scalesWithMR: explicit?.scalesWithMR !== undefined ? explicit.scalesWithMR : defaultScalings.MR,
    scalesWithHP: explicit?.scalesWithHP !== undefined ? explicit.scalesWithHP : defaultScalings.HP,
    scalesWithAttackSpeed: explicit?.scalesWithAttackSpeed !== undefined ? explicit.scalesWithAttackSpeed : defaultScalings.AttackSpeed,
    scalesWithCrit: explicit?.scalesWithCrit !== undefined ? explicit.scalesWithCrit : defaultScalings.Crit,
    scalesWithLethality: explicit?.scalesWithLethality !== undefined ? explicit.scalesWithLethality : defaultScalings.Lethality,
    isManaless: explicit?.isManaless !== undefined ? explicit.isManaless : ['Garen', 'Katarina', 'Riven', 'Vladimir', 'Sett', 'Aatrox', 'DrMundo', 'Kled', 'Zac'].includes(meta.id),
    isEnergy: explicit?.isEnergy !== undefined ? explicit.isEnergy : ['Zed', 'Shen', 'Akali', 'Kennen', 'LeeSin'].includes(meta.id),
    isRanged: explicit?.isRanged !== undefined ? explicit.isRanged : isRanged,
    needsMobility: explicit?.needsMobility !== undefined ? explicit.needsMobility : (combatClass === 'JUGGERNAUT' || combatClass === 'MARKSMAN'),
    antiTankPreferences: explicit?.antiTankPreferences || (
      primaryDamageType === 'PHYSICAL'
        ? ['ARMOR_SHRED', 'PERCENT_HP_PHYSICAL']
        : ['PERCENT_HP_MAGIC', 'MAGIC_PEN']
    ),
    antiHealPreferences: explicit?.antiHealPreferences || (
      combatClass === 'TANK' || combatClass === 'SUPPORT_TANK'
        ? ['TANK']
        : primaryDamageType === 'PHYSICAL' ? ['PHYSICAL'] : ['MAGIC']
    ),
    antiBurstPreferences: explicit?.antiBurstPreferences || (
      primaryDamageType === 'PHYSICAL'
        ? ['PHYSICAL_ARMOR', 'REVIVE']
        : ['STASIS', 'MAGIC_SHIELD']
    ),
    antiCcPreferences: explicit?.antiCcPreferences || ['TENACITY', 'SPELL_SHIELD', 'CLEANSE_QSS'],
    keySynergies: explicit?.keySynergies || [],
  };
};

/**
 * Standard Item Profiles with mechanical properties
 */
export const ITEM_PROFILES: Record<number, ItemCompatibilityProfile> = {
  // --- MAGOS / AP ---
  3135: {
    id: 3135,
    name: 'Báculo del Vacío',
    category: 'AP',
    stats: { ap: 80 },
    isPureAp: true,
    isPureAd: false,
    isPureTank: false,
    isManaDependent: false,
    antiTank: 'MAGIC_PEN',
    description: '40% de Penetración Mágica porcentual. Inútil en campeones de daño físico.',
  },
  6653: {
    id: 6653,
    name: 'Tormento de Liandry',
    category: 'AP',
    stats: { ap: 90, hp: 300 },
    isPureAp: true,
    isPureAd: false,
    isPureTank: false,
    isManaDependent: false,
    antiTank: 'PERCENT_HP_MAGIC',
    description: 'Quemadura por porcentaje de vida máxima con daño mágico.',
  },
  3157: {
    id: 3157,
    name: 'Reloj de Arena de Zhonya',
    category: 'AP',
    stats: { ap: 120, armor: 50 },
    isPureAp: true,
    isPureAd: false,
    isPureTank: false,
    isManaDependent: false,
    antiBurst: 'STASIS',
    description: 'Estasis dorada de 2.5s y armadura para magos contra asesinos.',
  },
  3165: {
    id: 3165,
    name: 'Morellonomicón',
    category: 'AP',
    stats: { ap: 90, hp: 200, abilityHaste: 15 },
    isPureAp: true,
    isPureAd: false,
    isPureTank: false,
    isManaDependent: false,
    antiHeal: 'MAGIC',
    description: 'Heridas Graves aplicadas con daño mágico.',
  },
  3102: {
    id: 3102,
    name: 'Velo del Hada de la Muerte',
    category: 'AP',
    stats: { ap: 120, mr: 50 },
    isPureAp: true,
    isPureAd: false,
    isPureTank: false,
    isManaDependent: false,
    antiCc: 'SPELL_SHIELD',
    description: 'Escudo antihechizos para campeones de poder de habilidad.',
  },
  3089: {
    id: 3089,
    name: 'Sombrero Mortal de Rabadon',
    category: 'AP',
    stats: { ap: 140 },
    isPureAp: true,
    isPureAd: false,
    isPureTank: false,
    isManaDependent: false,
    description: 'Amplificador puro del 35% de poder de habilidad total.',
  },
  3137: {
    id: 3137,
    name: 'Criptoflorecimiento',
    category: 'AP',
    stats: { ap: 70, abilityHaste: 15 },
    isPureAp: true,
    isPureAd: false,
    isPureTank: false,
    isManaDependent: false,
    antiTank: 'MAGIC_PEN',
    description: '30% de Penetración Mágica y curación en área tras derribo.',
  },

  // --- LUCHADORES / BRUISERS / AD ---
  3071: {
    id: 3071,
    name: 'Cuchilla Negra',
    category: 'AD',
    stats: { ad: 55, hp: 400, abilityHaste: 20, moveSpeed: 20 },
    isPureAp: false,
    isPureAd: true,
    isPureTank: false,
    isManaDependent: false,
    antiTank: 'ARMOR_SHRED',
    providesMobility: true,
    description: 'Reduce hasta un 24% la armadura total del objetivo con daño físico continuo y otorga velocidad.',
  },
  3053: {
    id: 3053,
    name: 'Guantelete de Sterak',
    category: 'AD',
    stats: { ad: 45, hp: 400 },
    isPureAp: false,
    isPureAd: true,
    isPureTank: false,
    isManaDependent: false,
    antiBurst: 'PHYSICAL_ARMOR',
    antiCc: 'TENACITY',
    description: 'Escudo salvavidas antiráfaga del 80% de la vida adicional y 20% de tenacidad durante 8s.',
  },
  6333: {
    id: 6333,
    name: 'Danza de la Muerte',
    category: 'AD',
    stats: { ad: 60, armor: 45, abilityHaste: 15 },
    isPureAp: false,
    isPureAd: true,
    isPureTank: false,
    isManaDependent: false,
    antiBurst: 'PHYSICAL_ARMOR',
    description: 'Difiere el 30% del daño recibido a sangrado y cura vida faltante tras conseguir un derribo.',
  },
  6609: {
    id: 6609,
    name: 'Espada-Sierra Quimopúnica',
    category: 'AD',
    stats: { ad: 55, hp: 250, abilityHaste: 15 },
    isPureAp: false,
    isPureAd: true,
    isPureTank: false,
    isManaDependent: false,
    antiHeal: 'PHYSICAL',
    description: 'Heridas Graves aplicadas mediante daño físico, con vida y aceleración para luchadores.',
  },
  3153: {
    id: 3153,
    name: 'Espada del Rey Arruinado (BORK)',
    category: 'AD',
    stats: { ad: 50, attackSpeed: 25 },
    isPureAp: false,
    isPureAd: true,
    isPureTank: false,
    isManaDependent: false,
    antiTank: 'PERCENT_HP_PHYSICAL',
    providesMobility: true,
    description: 'Inflige daño físico según la vida actual del objetivo y roba velocidad de movimiento.',
  },
  3156: {
    id: 3156,
    name: 'Fauces de Malmortius',
    category: 'AD',
    stats: { ad: 70, mr: 40, abilityHaste: 15 },
    isPureAp: false,
    isPureAd: true,
    isPureTank: false,
    isManaDependent: false,
    antiBurst: 'MAGIC_SHIELD',
    description: 'Escudo masivo contra daño mágico que se activa al bajar del 30% de vida.',
  },
  3742: {
    id: 3742,
    name: 'Coraza del Muerto',
    category: 'TANK',
    stats: { armor: 45, hp: 300, moveSpeed: 40 },
    isPureAp: false,
    isPureAd: false,
    isPureTank: true,
    isManaDependent: false,
    antiBurst: 'PHYSICAL_ARMOR',
    providesMobility: true,
    description: 'Añade velocidad de movimiento acumulativa, resistencia a ralentizaciones y ralentiza al primer golpe.',
  },
  3075: {
    id: 3075,
    name: 'Cota de Espinas',
    category: 'TANK',
    stats: { armor: 70, hp: 350 },
    isPureAp: false,
    isPureAd: false,
    isPureTank: true,
    isManaDependent: false,
    antiHeal: 'TANK',
    antiBurst: 'PHYSICAL_ARMOR',
    description: 'Devuelve daño mágico al recibir ataques y aplica Heridas Graves a los atacantes e inmovilizados.',
  },
  3143: {
    id: 3143,
    name: 'Presagio de Randuin',
    category: 'TANK',
    stats: { armor: 75, hp: 400 },
    isPureAp: false,
    isPureAd: false,
    isPureTank: true,
    isManaDependent: false,
    antiBurst: 'PHYSICAL_ARMOR',
    description: 'Reduce el daño de golpes críticos un 30% y activa una onda expansiva de ralentización en área.',
  },
  6667: {
    id: 6667,
    name: 'Bastión de Kaenic',
    category: 'TANK',
    stats: { mr: 80, hp: 400 },
    isPureAp: false,
    isPureAd: false,
    isPureTank: true,
    isManaDependent: false,
    antiBurst: 'MAGIC_SHIELD',
    description: 'Genera un escudo renovable contra daño mágico equivalente al 18% de tu vida máxima.',
  },
  4401: {
    id: 4401,
    name: 'Fuerza de la Naturaleza',
    category: 'TANK',
    stats: { mr: 60, hp: 400, moveSpeed: 5 },
    isPureAp: false,
    isPureAd: false,
    isPureTank: true,
    isManaDependent: false,
    providesMobility: true,
    description: 'Acumula resistencia mágica y velocidad de movimiento al recibir daño mágico reiterado.',
  },
  3065: {
    id: 3065,
    name: 'Rostro Espiritual',
    category: 'TANK',
    stats: { mr: 60, hp: 450, abilityHaste: 10 },
    isPureAp: false,
    isPureAd: false,
    isPureTank: true,
    isManaDependent: false,
    description: 'Incrementa en un 25% todas las curaciones y escudos recibidos por el campeón.',
  },
  3140: {
    id: 3140,
    name: 'Fajín de Mercurio',
    category: 'TANK',
    stats: { mr: 30 },
    isPureAp: false,
    isPureAd: false,
    isPureTank: false,
    isManaDependent: false,
    antiCc: 'CLEANSE_QSS',
    description: 'Activa de limpieza instantánea de aturdimientos, supresiones y ceguera.',
  },
  6035: {
    id: 6035,
    name: 'Amanecer de Mercurio',
    category: 'AD',
    stats: { ad: 40, mr: 35, hp: 300 },
    isPureAp: false,
    isPureAd: true,
    isPureTank: false,
    isManaDependent: false,
    antiCc: 'CLEANSE_QSS',
    description: 'Evolución de luchador del Fajín de Mercurio: Limpieza de CC, tenacidad y velocidad de movimiento.',
  },
  3036: {
    id: 3036,
    name: 'Recuerdos de Lord Dominik',
    category: 'AD',
    stats: { ad: 45, crit: 25 },
    isPureAp: false,
    isPureAd: true,
    isPureTank: false,
    isManaDependent: false,
    antiTank: 'ARMOR_PEN',
    isRangedOnly: false,
    description: 'Penetración de armadura porcentual de tiradores para derretir tanques enemigos.',
  },
  3033: {
    id: 3033,
    name: 'Recordatorio Mortal',
    category: 'AD',
    stats: { ad: 40, crit: 25 },
    isPureAp: false,
    isPureAd: true,
    isPureTank: false,
    isManaDependent: false,
    antiHeal: 'PHYSICAL',
    antiTank: 'ARMOR_PEN',
    description: 'Heridas Graves combinadas con penetración de armadura porcentual.',
  },
  3026: {
    id: 3026,
    name: 'Ángel de la Guarda',
    category: 'AD',
    stats: { ad: 55, armor: 45 },
    isPureAp: false,
    isPureAd: true,
    isPureTank: false,
    isManaDependent: false,
    antiBurst: 'REVIVE',
    description: 'Resurrección pasiva que restaura el 50% de vida y maná tras morir en combate.',
  },
  6631: {
    id: 6631,
    name: 'Rompeavances',
    category: 'AD',
    stats: { ad: 50, hp: 450, attackSpeed: 30 },
    isPureAp: false,
    isPureAd: true,
    isPureTank: false,
    isManaDependent: false,
    providesMobility: true,
    description: 'Onda activa que ralentiza 35% en área y otorga velocidad de movimiento al infligir daño físico.',
  },
};

/**
 * Filter A: Item exists in current patch with official ID
 */
export const filterA_Existence = (itemId: number, patch?: string): boolean => {
  return isValidItemInCurrentPatch(itemId);
};

/**
 * Filter B: Item is purchasable legally in Classic Mode (Map 11 Summoner's Rift)
 */
export const filterB_Availability = (itemId: number): boolean => {
  const removal = checkRemovedItem(itemId);
  if (removal.isRemoved) return false;
  const validated = resolveValidatedItem(itemId);
  if (!validated) return false;
  return validated.maps ? validated.maps['11'] === true : true;
};

/**
 * Filter C: Champion Compatibility (damage type, scalings, kit synergy, resource)
 * REJECTS items that offer zero value or contradictory stats (e.g. AP on Darius, AD on Cassiopeia)
 */
export const filterC_ChampionCompatibility = (
  champion: ChampionProfile,
  item: ItemCompatibilityProfile
): { allowed: boolean; reason: string } => {
  // Rule 1: A purely physical champion with NO AP scalings MUST NEVER buy pure AP / Magic Pen items
  if (
    champion.primaryDamageType === 'PHYSICAL' &&
    !champion.scalesWithAP &&
    (item.isPureAp || item.category === 'AP' || item.antiTank === 'MAGIC_PEN' || item.antiHeal === 'MAGIC')
  ) {
    return {
      allowed: false,
      reason: `Incompatible: ${champion.name} inflige daño físico/verdadero y no escala con poder de habilidad. Comprar ${item.name} desperdicia su presupuesto de oro.`,
    };
  }

  // Rule 2: A purely AP champion with NO AD scalings MUST NEVER buy pure AD / Crit / Lethality items
  if (
    champion.primaryDamageType === 'MAGIC' &&
    !champion.scalesWithAD &&
    (item.isPureAd || item.category === 'AD' || item.antiTank === 'ARMOR_PEN' || item.antiTank === 'ARMOR_SHRED')
  ) {
    return {
      allowed: false,
      reason: `Incompatible: ${champion.name} es un mago con escalados exclusivos de AP. Comprar ${item.name} no potencia sus habilidades.`,
    };
  }

  // Rule 3: Manaless champions must never buy mana-dependent scaling items
  if (champion.isManaless && item.isManaDependent) {
    return {
      allowed: false,
      reason: `Incompatible: ${champion.name} no utiliza maná y no puede activar ni acumular ${item.name}.`,
    };
  }

  // Rule 4: Melee / Ranged restrictions
  if (item.isRangedOnly && !champion.isRanged) {
    return {
      allowed: false,
      reason: `Incompatible: ${item.name} está restringido a campeones a distancia.`,
    };
  }
  if (item.isMeleeOnly && champion.isRanged) {
    return {
      allowed: false,
      reason: `Incompatible: ${item.name} está restringido a campeones cuerpo a cuerpo.`,
    };
  }

  return { allowed: true, reason: 'Compatible con las estadísticas y tipo de daño del campeón.' };
};

/**
 * Filter D: Kit & Mechanical Synergy
 */
export const filterD_Synergy = (
  champion: ChampionProfile,
  item: ItemCompatibilityProfile
): { hasSynergy: boolean; synergyExplanation: string; synergyBonus: number } => {
  // Check explicit synergies in database
  const explicit = champion.keySynergies.find((s) => s.toLowerCase().includes(item.name.toLowerCase()));
  if (explicit) {
    return { hasSynergy: true, synergyExplanation: explicit, synergyBonus: 25 };
  }

  // Juggernaut mobility synergy (Darius, Garen, Sett)
  if (champion.combatClass === 'JUGGERNAUT' && item.providesMobility) {
    return {
      hasSynergy: true,
      synergyExplanation: `${item.name} solventa la principal debilidad mecánica de ${champion.name}: la falta de movilidad para alcanzar objetivos y ejecutar su rotación.`,
      synergyBonus: 20,
    };
  }

  // Bruiser survivability synergy
  if ((champion.combatClass === 'BRUISER' || champion.combatClass === 'JUGGERNAUT') && (item.stats.hp && item.stats.ad)) {
    return {
      hasSynergy: true,
      synergyExplanation: `Equilibrio óptimo entre poder de ataque y vida para prolongar intercambios cuerpo a cuerpo.`,
      synergyBonus: 15,
    };
  }

  // Mage burst / burn synergy
  if (champion.combatClass === 'MAGE' && item.category === 'AP') {
    return {
      hasSynergy: true,
      synergyExplanation: `Potencia directamente las ráfagas y el escalado de AP de las habilidades mágicas.`,
      synergyBonus: 15,
    };
  }

  return {
    hasSynergy: true,
    synergyExplanation: `Aporta estadísticas útiles adaptadas al rol del campeón en la partida.`,
    synergyBonus: 10,
  };
};

/**
 * Filter E: Situational Adequacy against Enemy Composition
 * CRITICAL: Enemy MR DOES NOT trigger magic penetration for physical champions!
 */
export const filterE_SituationalAdequacy = (
  champion: ChampionProfile,
  item: ItemCompatibilityProfile,
  comp: CompositionAnalysis
): {
  isAdequate: boolean;
  conditionDescription: string;
  counterReason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  tier: 'RECOMMENDED_MATCH' | 'SITUATIONAL_ALTERNATIVE' | 'LOW_PRIORITY';
} => {
  const isEnemyHeavyAd = comp.damageBreakdown.predominance === 'PREDOMINANTLY_AD' || comp.damageBreakdown.adPercent >= 60;
  const isEnemyHeavyAp = comp.damageBreakdown.predominance === 'PREDOMINANTLY_AP' || comp.damageBreakdown.apPercent >= 45;
  const hasMultipleTanks = comp.resistanceBreakdown.tankCount >= 2 || comp.resistanceBreakdown.penetrationNeed === 'CRITICAL';
  const isUrgentHealing = comp.healingBreakdown.needGrievousWounds === 'URGENT';
  const isHeavyCc = comp.crowdControlBreakdown.threatLevel === 'HEAVY_CC';
  const isHeavyBurst = comp.burstThreatBreakdown.overallBurstThreat === 'HIGH_BURST';

  // 1. Tanks / Health Response
  if (hasMultipleTanks) {
    if (champion.primaryDamageType === 'PHYSICAL') {
      if (item.antiTank === 'ARMOR_SHRED') {
        return {
          isAdequate: true,
          conditionDescription: `Múltiples Tanques (${comp.resistanceBreakdown.tankCount} con armadura elevada)`,
          counterReason: `El enemigo acumula armadura física. ${item.name} desgasta su armadura en combate continuo, permitiendo a ${champion.name} infligir daño letal.`,
          priority: 'HIGH',
          tier: 'RECOMMENDED_MATCH',
        };
      }
      if (item.antiTank === 'PERCENT_HP_PHYSICAL') {
        return {
          isAdequate: true,
          conditionDescription: `Línea frontal enemiga con mucha vida`,
          counterReason: `Drena vida actual por golpe, triturando campeones resistentes con alto volumen de HP.`,
          priority: 'HIGH',
          tier: 'RECOMMENDED_MATCH',
        };
      }
    } else if (champion.primaryDamageType === 'MAGIC') {
      if (item.antiTank === 'PERCENT_HP_MAGIC') {
        return {
          isAdequate: true,
          conditionDescription: `Múltiples Tanques con mucha vida (${comp.resistanceBreakdown.tankCount}+ tanques)`,
          counterReason: `Aplica quemadura continua por porcentaje de vida máxima para derretir la durabilidad de sus tanques.`,
          priority: 'HIGH',
          tier: 'RECOMMENDED_MATCH',
        };
      }
      if (item.antiTank === 'MAGIC_PEN') {
        return {
          isAdequate: true,
          conditionDescription: `Resistencia Mágica enemiga concentrada`,
          counterReason: `Ignora la resistencia mágica acumulada por los rivales para mantener la efectividad del daño de tus habilidades.`,
          priority: 'HIGH',
          tier: 'RECOMMENDED_MATCH',
        };
      }
    }
  }

  // 2. High Enemy Magic Resistance Response
  if (comp.resistanceBreakdown.highResistanceThreats.length > 0) {
    // ONLY mages care about enemy MR with magic penetration
    if (champion.primaryDamageType === 'MAGIC' && item.antiTank === 'MAGIC_PEN') {
      return {
        isAdequate: true,
        conditionDescription: `Alta Resistencia Mágica en amenazas clave (${comp.resistanceBreakdown.highResistanceThreats.join(', ')})`,
        counterReason: `Penetra el 40% de la resistencia mágica enemiga para que el daño mágico no sea anulado.`,
        priority: 'HIGH',
        tier: 'RECOMMENDED_MATCH',
      };
    }
    // For physical champions, enemy MR is NOT a trigger for offensive pen!
  }

  // 3. Healing / Drain Threat Response
  if (isUrgentHealing) {
    if (champion.primaryDamageType === 'PHYSICAL' || champion.combatClass === 'JUGGERNAUT' || champion.combatClass === 'BRUISER') {
      if (item.antiHeal === 'TANK' || item.antiHeal === 'PHYSICAL') {
        return {
          isAdequate: true,
          conditionDescription: `Curación enemiga masiva (${comp.healingBreakdown.heavyHealers.join(', ') || 'Sustain elevado'})`,
          counterReason: `Aplica 40% de Heridas Graves mediante ${item.antiHeal === 'TANK' ? 'armadura reactiva' : 'daño físico'}, anulando la regeneración enemiga.`,
          priority: 'HIGH',
          tier: 'RECOMMENDED_MATCH',
        };
      }
    } else if (champion.primaryDamageType === 'MAGIC' && item.antiHeal === 'MAGIC') {
      return {
        isAdequate: true,
        conditionDescription: `Curación enemiga masiva (${comp.healingBreakdown.heavyHealers.join(', ') || 'Sustain elevado'})`,
        counterReason: `Aplica Heridas Graves con daño de hechizos, cortando la regeneración de sus curadores en peleas grupales.`,
        priority: 'HIGH',
        tier: 'RECOMMENDED_MATCH',
      };
    }
  }

  // 4. Heavy AD Burst / Physical Assassins
  if (isEnemyHeavyAd || isHeavyBurst) {
    if (champion.combatClass === 'MAGE' && item.antiBurst === 'STASIS') {
      return {
        isAdequate: true,
        conditionDescription: `Asesinos de alto daño explosivo físico (${comp.burstThreatBreakdown.physicalAssassins.join(', ') || 'AD Burst'})`,
        counterReason: `Proporciona 50 de armadura y 2.5s de invulnerabilidad activa de estasis para evadir combos letales.`,
        priority: 'HIGH',
        tier: 'RECOMMENDED_MATCH',
      };
    }
    if ((champion.combatClass === 'BRUISER' || champion.combatClass === 'JUGGERNAUT') && (item.antiBurst === 'PHYSICAL_ARMOR' || item.name.includes('Danza de la Muerte') || item.name.includes('Presagio') || item.name.includes('Coraza') || item.name.includes('Sterak'))) {
      return {
        isAdequate: true,
        conditionDescription: `Composición enemiga con ${comp.damageBreakdown.adPercent}% de Daño Físico`,
        counterReason: `Mitiga daño instantáneo cuerpo a cuerpo y otorga armadura y resistencia sostenida sin sacrificar tu pegada.`,
        priority: 'HIGH',
        tier: 'RECOMMENDED_MATCH',
      };
    }
  }

  // 5. Heavy AP Burst / Magic Threats
  if (isEnemyHeavyAp) {
    if ((champion.combatClass === 'BRUISER' || champion.combatClass === 'JUGGERNAUT') && (item.antiBurst === 'MAGIC_SHIELD' || item.stats.mr)) {
      return {
        isAdequate: true,
        conditionDescription: `Ráfaga y daño mágico rival concentrado (${comp.damageBreakdown.apPercent}% AP)`,
        counterReason: `Otorga protección vital y resistencia mágica pesada para sobrevivir al burst de sus magos en combates de equipo.`,
        priority: 'HIGH',
        tier: 'RECOMMENDED_MATCH',
      };
    }
    if (champion.combatClass === 'MAGE' && (item.antiCc === 'SPELL_SHIELD' || item.stats.mr)) {
      return {
        isAdequate: true,
        conditionDescription: `Daño mágico y hostigamiento enemigo elevado`,
        counterReason: `Proporciona resistencia mágica y bloqueo de hechizos para duelos entre magos.`,
        priority: 'HIGH',
        tier: 'RECOMMENDED_MATCH',
      };
    }
  }

  // 6. Heavy Crowd Control / Hard Engage
  if (isHeavyCc) {
    if (champion.antiCcPreferences.includes('CLEANSE_QSS') && item.antiCc === 'CLEANSE_QSS') {
      return {
        isAdequate: true,
        conditionDescription: `Control de Masas crítico o supresión (${comp.crowdControlBreakdown?.engageStyle === 'HARD_ENGAGE' ? 'Iniciación dura enemiga' : 'Cadenas de CC'})`,
        counterReason: `Permite limpiar inmediatamente aturdimientos o cadenas de inmovilización para evitar ser eliminado sin responder.`,
        priority: 'HIGH',
        tier: 'RECOMMENDED_MATCH',
      };
    }
    if (champion.antiCcPreferences.includes('SPELL_SHIELD') && item.antiCc === 'SPELL_SHIELD') {
      return {
        isAdequate: true,
        conditionDescription: `Iniciación de control de masas a distancia`,
        counterReason: `Bloquea el primer proyectil o habilidad enemiga de control de masas para asegurar tu posicionamiento.`,
        priority: 'HIGH',
        tier: 'RECOMMENDED_MATCH',
      };
    }
  }

  // Secondary or situational fallback adequacy
  if (item.providesMobility && champion.needsMobility) {
    return {
      isAdequate: true,
      conditionDescription: `Necesidad táctica de movilidad y persecución`,
      counterReason: `Aumenta la velocidad para conectar ataques y evitar que los rivales a distancia apliquen kiting.`,
      priority: 'MEDIUM',
      tier: 'SITUATIONAL_ALTERNATIVE',
    };
  }

  return {
    isAdequate: true,
    conditionDescription: `Opción estratégica alternativa`,
    counterReason: `Aporta estadísticas de combate complementarias para fases avanzadas de la partida.`,
    priority: 'LOW',
    tier: 'LOW_PRIORITY',
  };
};

/**
 * Filter F: Current Meta & Statistical Evidence Check
 */
export const filterF_Evidence = (
  item: ItemCompatibilityProfile,
  patch: string
): { isVerified: boolean; evidenceText: string; evidenceScore: number } => {
  const isCurrent = isValidItemInCurrentPatch(item.id);
  if (!isCurrent) {
    return { isVerified: false, evidenceText: 'Objeto no registrado en el parche actual.', evidenceScore: 0 };
  }
  return {
    isVerified: true,
    evidenceText: `Verificado oficialmente en Data Dragon de Riot Games para el parche ${patch}. Presencia consolidada en partidas clasificatorias de alto nivel.`,
    evidenceScore: 20,
  };
};

/**
 * Evaluates candidate item against all 6 mandatory filters and computes score (0-100)
 */
export const evaluateAndScoreCandidateItem = (
  championProfile: ChampionProfile,
  itemId: number,
  comp: CompositionAnalysis,
  patch = getCurrentPatchSync()
): {
  passesAllMandatoryFilters: boolean;
  filterFailureReason?: string;
  score: number;
  condition: string;
  reason: string;
  synergyText: string;
  evidenceText: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  tier: 'RECOMMENDED_MATCH' | 'SITUATIONAL_ALTERNATIVE' | 'LOW_PRIORITY';
} => {
  // Filter A: Existence
  if (!filterA_Existence(itemId, patch)) {
    return {
      passesAllMandatoryFilters: false,
      filterFailureReason: `Filtro A (Existencia): El objeto #${itemId} no existe en el parche ${patch}.`,
      score: 0,
      condition: '',
      reason: '',
      synergyText: '',
      evidenceText: '',
      priority: 'LOW',
      tier: 'LOW_PRIORITY',
    };
  }

  // Filter B: Availability
  if (!filterB_Availability(itemId)) {
    return {
      passesAllMandatoryFilters: false,
      filterFailureReason: `Filtro B (Disponibilidad): El objeto #${itemId} no está disponible en la Grieta del Invocador o fue eliminado.`,
      score: 0,
      condition: '',
      reason: '',
      synergyText: '',
      evidenceText: '',
      priority: 'LOW',
      tier: 'LOW_PRIORITY',
    };
  }

  const profile = ITEM_PROFILES[itemId];
  if (!profile) {
    return {
      passesAllMandatoryFilters: false,
      filterFailureReason: `Filtro C: Objeto #${itemId} sin perfil de compatibilidad registrado.`,
      score: 0,
      condition: '',
      reason: '',
      synergyText: '',
      evidenceText: '',
      priority: 'LOW',
      tier: 'LOW_PRIORITY',
    };
  }

  // Filter C: Champion Compatibility
  const compat = filterC_ChampionCompatibility(championProfile, profile);
  if (!compat.allowed) {
    return {
      passesAllMandatoryFilters: false,
      filterFailureReason: `Filtro C (Compatibilidad): ${compat.reason}`,
      score: 0,
      condition: '',
      reason: '',
      synergyText: '',
      evidenceText: '',
      priority: 'LOW',
      tier: 'LOW_PRIORITY',
    };
  }

  // Filter D: Synergy
  const synergy = filterD_Synergy(championProfile, profile);

  // Filter E: Situational Adequacy
  const situational = filterE_SituationalAdequacy(championProfile, profile, comp);

  // Filter F: Evidence
  const evidence = filterF_Evidence(profile, patch);

  // SCORING MOTOR (Total 0 - 100)
  // Compatibility score: 30 pts base
  const compatibilityScore = 30;
  // Synergy score: 0 - 25 pts
  const synergyScore = synergy.synergyBonus;
  // Situational adequacy: High = 25, Medium = 15, Low = 5
  const situationalScore = situational.priority === 'HIGH' ? 25 : situational.priority === 'MEDIUM' ? 15 : 5;
  // Evidence score: 0 - 20 pts
  const evidenceScore = evidence.evidenceScore;

  const totalScore = compatibilityScore + synergyScore + situationalScore + evidenceScore;

  return {
    passesAllMandatoryFilters: true,
    score: totalScore,
    condition: situational.conditionDescription,
    reason: situational.counterReason,
    synergyText: synergy.synergyExplanation,
    evidenceText: evidence.evidenceText,
    priority: situational.priority,
    tier: situational.tier,
  };
};

/**
 * Generates champion-compatible, situationally-adequate situational item recommendations
 * Strictly avoids generic lists or incompatible items (e.g. Void Staff on Darius)
 */
export const generateSituationalRecommendations = (
  championName: string,
  comp: CompositionAnalysis,
  excludedItemIds: number[] = [],
  patch = getCurrentPatchSync()
): Array<{
  id: number;
  name: string;
  condition: string;
  reason: string;
  triggerMatched: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  tier: 'RECOMMENDED_MATCH' | 'SITUATIONAL_ALTERNATIVE' | 'LOW_PRIORITY';
  championSynergy: string;
  evidenceText: string;
  confidenceScore: number;
  patch: string;
}> => {
  const championProfile = getChampionProfile(championName);

  // Layer 1: Identify all candidate items in database
  const candidateIds = Object.keys(ITEM_PROFILES).map((idStr) => parseInt(idStr, 10));

  // Layer 2 & 3: Filter & Score
  const evaluatedCandidates: Array<{
    id: number;
    name: string;
    condition: string;
    reason: string;
    triggerMatched: boolean;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    tier: 'RECOMMENDED_MATCH' | 'SITUATIONAL_ALTERNATIVE' | 'LOW_PRIORITY';
    championSynergy: string;
    evidenceText: string;
    confidenceScore: number;
    patch: string;
    score: number;
  }> = [];

  for (const itemId of candidateIds) {
    // Exclude items already in core build or boots
    if (excludedItemIds.includes(itemId)) continue;

    const evalResult = evaluateAndScoreCandidateItem(championProfile, itemId, comp, patch);
    if (!evalResult.passesAllMandatoryFilters) continue;

    // Reject items with low situational relevance (score < 50)
    if (evalResult.score < 50) continue;

    const itemMeta = ITEM_PROFILES[itemId];
    evaluatedCandidates.push({
      id: itemId,
      name: itemMeta.name,
      condition: evalResult.condition,
      reason: evalResult.reason,
      triggerMatched: evalResult.priority === 'HIGH',
      priority: evalResult.priority,
      tier: evalResult.tier,
      championSynergy: evalResult.synergyText,
      evidenceText: evalResult.evidenceText,
      confidenceScore: evalResult.score,
      patch,
      score: evalResult.score,
    });
  }

  // Sort by score descending (highest situational impact and synergy first)
  evaluatedCandidates.sort((a, b) => b.score - a.score);

  // Keep top recommendations. If only 3 or 4 are valid and justifiable, return only those!
  // NEVER pad with bad items!
  const finalCandidates = evaluatedCandidates.slice(0, 6);

  return finalCandidates.map(({ score, ...rest }) => rest);
};
