import { ActiveGameChampion, CompositionAnalysis } from '../types';
import { resolveChampionInfo, ChampionMetadata } from './championData';

/**
 * Analyzes both enemy and allied team compositions based on verified champion metadata.
 */
export const analyzeComposition = (
  enemies: ActiveGameChampion[],
  allies: ActiveGameChampion[],
  playerChampion?: ActiveGameChampion
): CompositionAnalysis => {
  // Resolve rich metadata for each enemy champion
  const enemyMetaList: ChampionMetadata[] = (enemies || []).map((e) =>
    resolveChampionInfo(e.championId || e.championName)
  );

  const totalEnemies = Math.max(1, enemyMetaList.length);

  // 1. DAMAGE PROFILE BREAKDOWN
  let adPoints = 0;
  let apPoints = 0;
  let trueDamageCount = 0;
  let burstPoints = 0;
  let dpsPoints = 0;

  enemyMetaList.forEach((meta) => {
    if (meta.damageType === 'AD') {
      adPoints += 1;
    } else if (meta.damageType === 'AP') {
      apPoints += 1;
    } else if (meta.damageType === 'MIXED') {
      adPoints += 0.5;
      apPoints += 0.5;
    } else if (meta.damageType === 'TRUE') {
      trueDamageCount += 1;
      adPoints += 0.5;
      apPoints += 0.5;
    }

    if (meta.isHighBurst) {
      burstPoints += 1;
    } else {
      dpsPoints += 1;
    }
  });

  const adPercent = Math.round((adPoints / totalEnemies) * 100);
  const apPercent = Math.round((apPoints / totalEnemies) * 100);

  let predominance: 'PREDOMINANTLY_AD' | 'PREDOMINANTLY_AP' | 'MIXED_DAMAGE' = 'MIXED_DAMAGE';
  if (adPercent >= 65) {
    predominance = 'PREDOMINANTLY_AD';
  } else if (apPercent >= 65) {
    predominance = 'PREDOMINANTLY_AP';
  } else {
    predominance = 'MIXED_DAMAGE';
  }

  let damageStyle: 'BURST' | 'DPS_SUSTAINED' | 'HYBRID' = 'HYBRID';
  if (burstPoints >= 3) {
    damageStyle = 'BURST';
  } else if (dpsPoints >= 4) {
    damageStyle = 'DPS_SUSTAINED';
  }

  // 2. RESISTANCE & DURABILITY PROFILE
  const tanks = enemyMetaList.filter((m) => m.combatClass === 'TANK' || m.combatClass === 'SUPPORT_TANK');
  const bruisers = enemyMetaList.filter((m) => m.combatClass === 'BRUISER');
  const squishies = enemyMetaList.filter((m) => m.combatClass === 'MARKSMAN' || m.combatClass === 'MAGE' || m.combatClass === 'ASSASSIN_AD' || m.combatClass === 'ASSASSIN_AP' || m.combatClass === 'SUPPORT_ENCHANTER');

  // Specific high HP stackers (Heartsteel / infinite HP scaling / high base HP)
  const highHpNames = ['Sion', 'Cho\'Gath', 'Dr. Mundo', 'Sett', 'Tahm Kench', 'Zac', 'Volibear'];
  const highHpThreats = enemyMetaList
    .filter((m) => highHpNames.includes(m.name) || m.combatClass === 'TANK')
    .map((m) => m.name);

  // High resistance stackers (Armor/MR powerhouses)
  const highResNames = ['Malphite', 'Rammus', 'Galio', 'Ornn', 'K\'Sante', 'Leona', 'Taric', 'Poppy', 'Shen'];
  const highResistanceThreats = enemyMetaList
    .filter((m) => highResNames.includes(m.name))
    .map((m) => m.name);

  const tankCount = tanks.length;
  const bruiserCount = bruisers.length;
  const squishyCount = squishies.length;

  let penetrationNeed: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
  if (tankCount >= 2 || (tankCount >= 1 && bruiserCount >= 2)) {
    penetrationNeed = 'CRITICAL';
  } else if (tankCount === 1 || bruiserCount >= 2) {
    penetrationNeed = 'HIGH';
  } else if (bruiserCount === 1) {
    penetrationNeed = 'MODERATE';
  }

  // 3. CROWD CONTROL & ENGAGE THREAT
  const hardCcChamps = enemyMetaList.filter((m) => m.hasHardCc);
  const hardCcCount = hardCcChamps.length;
  const softCcCount = totalEnemies - hardCcCount;

  let threatLevel: 'HEAVY_CC' | 'MODERATE_CC' | 'LOW_CC' = 'LOW_CC';
  if (hardCcCount >= 3) {
    threatLevel = 'HEAVY_CC';
  } else if (hardCcCount >= 2) {
    threatLevel = 'MODERATE_CC';
  }

  const hardEngageChamps = ['Malphite', 'Leona', 'Nautilus', 'Amumu', 'Zac', 'Rakan', 'Rell', 'Jarvan IV', 'Hecarim', 'Sejuani'];
  const pickChamps = ['Blitzcrank', 'Thresh', 'Ahri', 'Morgana', 'Pyke', 'Pantheon', 'Twisted Fate'];
  
  const hasHardEngage = enemyMetaList.some((m) => hardEngageChamps.includes(m.name));
  const hasPick = enemyMetaList.some((m) => pickChamps.includes(m.name));

  const engageStyle: 'HARD_ENGAGE' | 'PICK' | 'REACTIVE_DISENGAGE' | 'POKE' =
    hasHardEngage ? 'HARD_ENGAGE' : hasPick ? 'PICK' : 'REACTIVE_DISENGAGE';

  const tenacityPriority = hardCcCount >= 2;
  const cleanseQssRecommended = hardCcCount >= 3 || enemyMetaList.some((m) => ['Malzahar', 'Skarner', 'Warwick', 'Mordekaiser', 'Ashe'].includes(m.name));

  // 4. HEALING & SUSTAIN PROFILE (Grievous Wounds urgency)
  const heavyHealersList = enemyMetaList.filter((m) => m.hasHeavyHealing).map((m) => m.name);
  let needGrievousWounds: 'URGENT' | 'RECOMMENDED' | 'LOW' = 'LOW';
  let antiHealReason: string | undefined = undefined;

  const premierDrainHealers = ['Aatrox', 'Soraka', 'Vladimir', 'Briar', 'Warwick', 'Sylas', 'Dr. Mundo', 'Yuumi', 'Swain', 'Fiora', 'Illaoi'];
  const matchingPremier = enemyMetaList.filter((m) => premierDrainHealers.includes(m.name));

  if (matchingPremier.length >= 2 || heavyHealersList.length >= 3) {
    needGrievousWounds = 'URGENT';
    antiHealReason = `Múltiples fuentes de curación masiva enemiga (${heavyHealersList.join(', ')}). Comprar componente de Heridas Graves (800g) prioritario.`;
  } else if (matchingPremier.length === 1 || heavyHealersList.length >= 1) {
    needGrievousWounds = 'RECOMMENDED';
    antiHealReason = `Presencia de regeneración/drenaje notable (${heavyHealersList.join(', ')}). Considerar objeto de Heridas Graves para mitigar su sustain.`;
  }

  // 5. BURST & ASSASSIN PROFILE
  const physicalAssassins = enemyMetaList
    .filter((m) => m.combatClass === 'ASSASSIN_AD')
    .map((m) => m.name);

  const magicAssassins = enemyMetaList
    .filter((m) => m.combatClass === 'ASSASSIN_AP')
    .map((m) => m.name);

  const totalAssassins = physicalAssassins.length + magicAssassins.length;
  let overallBurstThreat: 'HIGH_BURST' | 'MODERATE' | 'LOW' = 'LOW';
  if (totalAssassins >= 2 || (totalAssassins >= 1 && burstPoints >= 3)) {
    overallBurstThreat = 'HIGH_BURST';
  } else if (totalAssassins === 1 || burstPoints >= 2) {
    overallBurstThreat = 'MODERATE';
  }

  const defensiveItemNeed = overallBurstThreat === 'HIGH_BURST' || (adPercent >= 70 && physicalAssassins.length > 0) || (apPercent >= 70 && magicAssassins.length > 0);

  // 6. RANGE & POKE PROFILE
  const pokeChampions = ['Xerath', 'Jayce', 'Ziggs', 'Varus', 'Lux', 'Corki', 'Vel\'Koz', 'Ezreal', 'Hwei', 'Kog\'Maw'];
  const enemyPokeCount = enemyMetaList.filter((m) => pokeChampions.includes(m.name) || m.isHighRange).length;
  const isPokeComp = enemyPokeCount >= 3;

  let averageRangeType: 'HIGH_RANGE_POKE' | 'BALANCED' | 'SHORT_RANGE_MELEE' = 'BALANCED';
  if (isPokeComp) {
    averageRangeType = 'HIGH_RANGE_POKE';
  } else if (enemyMetaList.filter((m) => !m.isHighRange).length >= 4) {
    averageRangeType = 'SHORT_RANGE_MELEE';
  }

  // 7. TEAMFIGHT STYLE & SCALING
  let primaryStyle: 'FRONT_TO_BACK' | 'DIVE_ASSASSINATE' | 'POKE_SIEGE' | 'PICK_SKIRMISH' | 'SPLIT_PUSH' = 'FRONT_TO_BACK';
  if (isPokeComp) {
    primaryStyle = 'POKE_SIEGE';
  } else if (totalAssassins >= 2 || (hasHardEngage && burstPoints >= 3)) {
    primaryStyle = 'DIVE_ASSASSINATE';
  } else if (hasPick && totalAssassins >= 1) {
    primaryStyle = 'PICK_SKIRMISH';
  } else if (enemyMetaList.some((m) => ['Fiora', 'Camille', 'Tryndamere', 'Yorick', 'Jax'].includes(m.name))) {
    primaryStyle = 'SPLIT_PUSH';
  }

  // Scaling profile based on champion types
  const lateGameScalers = ['Kassadin', 'Kayle', 'Smolder', 'Aurelion Sol', 'Jinx', 'Vayne', 'Vladimir', 'Veigar', 'Senna', 'Kog\'Maw'];
  const earlyGameBullies = ['Draven', 'Renekton', 'Pantheon', 'Lee Sin', 'Elise', 'LeBlanc', 'Nidalee', 'Jayce'];

  const scalerCount = enemyMetaList.filter((m) => lateGameScalers.includes(m.name)).length;
  const bullyCount = enemyMetaList.filter((m) => earlyGameBullies.includes(m.name)).length;

  let scalingProfile: 'EARLY_SNOWBALL' | 'MID_GAME_POWERSPIKE' | 'LATE_GAME_HYPERSCALING' = 'MID_GAME_POWERSPIKE';
  if (scalerCount >= 2) {
    scalingProfile = 'LATE_GAME_HYPERSCALING';
  } else if (bullyCount >= 2) {
    scalingProfile = 'EARLY_SNOWBALL';
  }

  return {
    damageBreakdown: {
      adCount: Math.round(adPoints),
      apCount: Math.round(apPoints),
      adPercent,
      apPercent,
      predominance,
      damageStyle,
      hasTrueDamageThreat: trueDamageCount > 0,
    },
    resistanceBreakdown: {
      tankCount,
      bruiserCount,
      squishyCount,
      highHpThreats,
      highResistanceThreats,
      penetrationNeed,
    },
    crowdControlBreakdown: {
      hardCcCount,
      softCcCount,
      threatLevel,
      engageStyle,
      tenacityPriority,
      cleanseQssRecommended,
    },
    healingBreakdown: {
      heavyHealers: heavyHealersList,
      needGrievousWounds,
      antiHealReason,
    },
    burstThreatBreakdown: {
      physicalAssassins,
      magicAssassins,
      overallBurstThreat,
      defensiveItemNeed,
    },
    rangeBreakdown: {
      isPokeComp,
      averageRangeType,
    },
    teamfightProfile: {
      primaryStyle,
      scalingProfile,
    },
  };
};
