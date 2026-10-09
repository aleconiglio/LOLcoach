import { 
  ActiveGameChampion, 
  CompositionAnalysis, 
  BuildRecommendation, 
  RoleFilter 
} from '../types';
import { resolveChampionInfo, ChampionMetadata } from './championData';
import { getItemById, getItemName, isValidItem } from './itemData';
import { getRuneById, getRuneName, isValidRune } from './runeData';
import { validateBuildRecommendation } from './recommendationValidationService';
import { researchChampionBuild } from './championBuildResearchService';
import { getCurrentPatchSync } from './patchVerificationService';
import { generateSituationalRecommendations } from './championCompatibilityService';

export interface BuildRecommendationInput {
  patch: string;
  playerChampion: string;
  playerRole?: RoleFilter;
  allies: ActiveGameChampion[];
  enemies: ActiveGameChampion[];
  compositionAnalysis: CompositionAnalysis;
  searchApiKey?: string;
}


export const generateBuildRecommendation = (
  input: BuildRecommendationInput
): BuildRecommendation => {
  const { patch, playerChampion, playerRole, allies, enemies, compositionAnalysis } = input;
  const meta: ChampionMetadata = resolveChampionInfo(playerChampion);
  const effectiveRole: RoleFilter = playerRole || meta.role;

  const comp = compositionAnalysis;
  const isEnemyHeavyAd = comp.damageBreakdown.predominance === 'PREDOMINANTLY_AD';
  const isEnemyHeavyAp = comp.damageBreakdown.predominance === 'PREDOMINANTLY_AP';
  const isHeavyAntiTankNeeded = comp.resistanceBreakdown.penetrationNeed === 'CRITICAL' || comp.resistanceBreakdown.tankCount >= 2;
  const isGrievousWoundsUrgent = comp.healingBreakdown.needGrievousWounds === 'URGENT';
  const isBurstThreatHigh = comp.burstThreatBreakdown.overallBurstThreat === 'HIGH_BURST';
  const isHeavyCc = comp.crowdControlBreakdown.threatLevel === 'HEAVY_CC';

  // 1. STARTING ITEMS
  let startingPrimary = { id: 1056, name: 'Anillo de Doran', reason: 'Poder de habilidad, vida y sustentabilidad de maná al dar últimos golpes.' };
  let startingAlternative: { id: number; name: string; reason: string } | undefined = { id: 2033, name: 'Poción de Corrupción', reason: 'Excelente para intercambios cortos agresivos y regeneración constante.' };

  if (effectiveRole === 'JUNGLE') {
    if (meta.combatClass === 'TANK' || isHeavyCc) {
      startingPrimary = { id: 1102, name: 'Brote de Pisotesta', reason: 'Otorga escudo y tenacidad vitales al cruzar campamentos y escaramuzas.' };
      startingAlternative = { id: 1101, name: 'Cría de Caminabrisas', reason: 'Alternativa de movilidad superior para rotaciones rápidas.' };
    } else {
      startingPrimary = { id: 1103, name: 'Cachorro Garrafuego', reason: 'Daño adicional y ralentización para asegurar ganks tempranos.' };
      startingAlternative = { id: 1101, name: 'Cría de Caminabrisas', reason: 'Velocidad de movimiento adicional en el mapa y la jungla.' };
    }
  } else if (effectiveRole === 'SUPPORT') {
    startingPrimary = { id: 3865, name: 'Atlas Mundial', reason: 'Generación de oro para apoyos y evolución hacia Guardián de visión.' };
    startingAlternative = undefined;
  } else if (meta.combatClass === 'MARKSMAN') {
    if (comp.rangeBreakdown.isPokeComp) {
      startingPrimary = { id: 1054, name: 'Escudo de Doran', reason: 'Mitiga el desgaste y poke a distancia constante del carril rival.' };
      startingAlternative = { id: 1055, name: 'Espada de Doran', reason: 'Alternativa ofensiva con daño de ataque y omnivampirismo para all-in.' };
    } else {
      startingPrimary = { id: 1055, name: 'Espada de Doran', reason: 'AD base y omnivampirismo óptimo para intercambios en el carril.' };
      startingAlternative = { id: 1054, name: 'Escudo de Doran', reason: 'Opción defensiva si la línea enemiga ejerce excesiva presión.' };
    }
  } else if (meta.combatClass === 'BRUISER' || meta.combatClass === 'TANK') {
    if (comp.rangeBreakdown.isPokeComp) {
      startingPrimary = { id: 1054, name: 'Escudo de Doran', reason: 'Regeneración pasiva reactiva esencial frente al hostigamiento enemigo.' };
      startingAlternative = { id: 1055, name: 'Espada de Doran', reason: 'Opción agresiva para buscar presión y asesinatos en niveles 1-3.' };
    } else {
      startingPrimary = { id: 1055, name: 'Espada de Doran', reason: 'Poder de duelo cuerpo a cuerpo y vida extra.' };
      startingAlternative = { id: 1054, name: 'Escudo de Doran', reason: 'Mayor sustain contra desgaste sostenido.' };
    }
  } else if (meta.combatClass === 'ASSASSIN_AD') {
    startingPrimary = { id: 1055, name: 'Espada de Doran', reason: 'AD base y vida temprana para asegurar la primera sangre.' };
    startingAlternative = { id: 3134, name: 'Puñal Serrado', reason: 'Rush directo de letalidad en primer recall.' };
  }

  // 2. BOOTS RECOMMENDATION
  let bootsId = 3158; // Jonias default
  let bootsReason = 'Aceleración de habilidad y reducción en enfriamiento de hechizos de invocador.';

  if (isEnemyHeavyAd || (comp.damageBreakdown.adPercent >= 60 && comp.burstThreatBreakdown.physicalAssassins.length > 0)) {
    bootsId = 3047;
    bootsReason = `Botas Blindadas (Tabis): El rival concentra ${comp.damageBreakdown.adPercent}% de daño físico. Reduce 12% del daño de autoataques y añade 20 de armadura.`;
  } else if (isEnemyHeavyAp || isHeavyCc) {
    bootsId = 3111;
    bootsReason = `Botas de Mercurio: Contrarresta el ${comp.damageBreakdown.apPercent}% de daño mágico rival y otorga 30% de Tenacidad contra su control de masas.`;
  } else if (meta.combatClass === 'MAGE') {
    bootsId = 3020;
    bootsReason = 'Botas del Hechicero: Penetración mágica plana esencial para maximizar el daño explosivo a campeones frágiles.';
  } else if (meta.combatClass === 'MARKSMAN') {
    bootsId = 3006;
    bootsReason = 'Grebas de Berserker: 35% de velocidad de ataque para acelerar el ciclo de autoataques y kiting.';
  } else if (meta.combatClass === 'SUPPORT_ENCHANTER' || meta.combatClass === 'SUPPORT_TANK') {
    bootsId = 3158;
    bootsReason = 'Botas Jonias: Rotación más rápida de escudos, curaciones y hechizos de invocador (Flash/Ignite).';
  }

  // 3. CORE BUILD (1 -> 2 -> 3, then 4 -> 5 -> 6)
  const coreBuild: Array<{ order: number; id: number; name: string; reason: string; isCore: boolean }> = [];

  const addItemToBuild = (id: number, reason: string) => {
    if (coreBuild.some((item) => item.id === id)) return;
    const itemInfo = getItemById(id);
    const name = itemInfo ? itemInfo.name : getItemName(id);
    const order = coreBuild.length + 1;
    coreBuild.push({
      order,
      id,
      name,
      reason,
      isCore: order <= 3,
    });
  };

  // Archetype customized build paths
  if (meta.combatClass === 'MAGE') {
    // 1st Item
    if (isHeavyAntiTankNeeded) {
      addItemToBuild(6653, 'Tormento de Liandry: Quemadura por vida máxima indispensable frente a los tanques enemigos.');
    } else if (meta.id === 'Ahri' || meta.id === 'Syndra' || meta.id === 'Lux' || meta.id === 'Vex') {
      addItemToBuild(6655, 'Compañera de Luden: Máximo daño de ráfaga y maná para castigar la fragilidad enemiga.');
    } else {
      addItemToBuild(6655, 'Compañera de Luden: Pico de poder de 1 ítem con regeneración de maná y aceleración.');
    }

    // 2nd Item
    if (isBurstThreatHigh || (isEnemyHeavyAd && comp.burstThreatBreakdown.physicalAssassins.length > 0)) {
      addItemToBuild(3157, 'Reloj de Arena de Zhonya: Armadura y estasis protectora de 2.5s para neutralizar el burst físico rival.');
    } else if (isHeavyAntiTankNeeded && !coreBuild.some((i) => i.id === 6653)) {
      addItemToBuild(6653, 'Tormento de Liandry: Daño sostenido en área para derretir la primera línea resistente.');
    } else {
      addItemToBuild(4645, 'Llamasombría: Crítico mágico y penetración contra objetivos con escudo o baja vida.');
    }

    // 3rd Item
    if (comp.resistanceBreakdown.highResistanceThreats.length > 0 || isHeavyAntiTankNeeded) {
      addItemToBuild(3135, 'Báculo del Vacío: 40% de penetración mágica porcentual para atravesar la resistencia mágica enemiga.');
    } else {
      addItemToBuild(3089, 'Sombrero Mortal de Rabadon: Multiplicador masivo de poder de habilidad (+35% AP total).');
    }

    // 4th Item
    if (isGrievousWoundsUrgent && !coreBuild.some((i) => i.id === 3165)) {
      addItemToBuild(3165, 'Morellonomicón: 40% de Heridas Graves para cortar la curación masiva enemiga.');
    } else if (!coreBuild.some((i) => i.id === 3089)) {
      addItemToBuild(3089, 'Sombrero Mortal de Rabadon: Pico de daño definitivo para juego medio/tardío.');
    } else if (!coreBuild.some((i) => i.id === 3157)) {
      addItemToBuild(3157, 'Reloj de Arena de Zhonya: Seguridad en peleas grupales y mitigación de daño.');
    } else {
      addItemToBuild(3137, 'Criptoflorecimiento: Penetración mágica con curación de aliados tras derribos.');
    }

    // 5th Item
    if (isEnemyHeavyAp && !coreBuild.some((i) => i.id === 3102)) {
      addItemToBuild(3102, 'Velo del Hada de la Muerte: Escudo anti-hechizos y resistencia mágica contra su iniciación.');
    } else if (!coreBuild.some((i) => i.id === 3116) && comp.teamfightProfile.primaryStyle === 'FRONT_TO_BACK') {
      addItemToBuild(3116, 'Cetro de Cristal de Rylai: Ralentización continua para controlar el ritmo de las peleas.');
    } else {
      addItemToBuild(4646, 'Sobrecarga Tormentosa: Ejecución y ráfaga de velocidad para cerrar escaramuzas.');
    }

    // 6th Item
    if (!coreBuild.some((i) => i.id === 3135) && !coreBuild.some((i) => i.id === 3137)) {
      addItemToBuild(3135, 'Báculo del Vacío: Garantiza daño máximo contra cualquier objetivo con resistencia mágica.');
    } else {
      addItemToBuild(3100, 'Maldición del Liche: Daño explosivo adicional en autoataques tras lanzar habilidades.');
    }

  } else if (meta.combatClass === 'MARKSMAN') {
    // 1st Item
    if (isHeavyAntiTankNeeded) {
      addItemToBuild(3153, 'Espada del Rey Arruinado: Daño porcentual por vida actual y robo de vida contra tanques.');
    } else {
      addItemToBuild(6672, 'Verdugo de Krakens: Daño creciente sostenido cada 3 impactos para ganar duelos.');
    }

    // 2nd Item
    if (meta.id === 'Jhin' || meta.id === 'Caitlyn' || meta.id === 'Draven') {
      addItemToBuild(6676, 'El Coleccionista: Letalidad y ejecución a menos del 5% de vida para capitalizar ventajas.');
    } else {
      addItemToBuild(3046, 'Bailarín Espectral: Velocidad de movimiento y ataque para perfeccionar el espaciado/kiting.');
    }

    // 3rd Item
    addItemToBuild(3031, 'Filo del Infinito: Aumento crítico definitivo (+40% daño crítico) obligatorio en el mid-game.');

    // 4th Item
    if (isGrievousWoundsUrgent) {
      addItemToBuild(3033, 'Recordatorio Mortal: 35% penetración de armadura junto a Heridas Graves anti-curación.');
    } else {
      addItemToBuild(3036, 'Recuerdos de Lord Dominik: 35% de penetración de armadura pura para neutralizar la primera línea.');
    }

    // 5th Item
    if (isBurstThreatHigh || isEnemyHeavyAd) {
      addItemToBuild(6673, 'Arcoescudo Inmortal: Escudo salvavidas masivo que impide morir de un combo explosivo.');
    } else {
      addItemToBuild(3072, 'La Sanguinaria: 18% de robo de vida y escudo sobrecurativo para sostener asedios.');
    }

    // 6th Item
    if (isEnemyHeavyAp || isHeavyCc) {
      addItemToBuild(3139, 'Cimitarra Mercurial: Purificación de aturdimientos y supresiones con resistencia mágica.');
    } else {
      addItemToBuild(3026, 'Ángel de la Guarda: Resurrección de emergencia para peleas decisivas de Barón.');
    }

  } else if (meta.combatClass === 'BRUISER') {
    // 1st Item
    if (meta.id === 'Aatrox' || meta.id === 'Riven' || meta.id === 'Renekton') {
      addItemToBuild(6692, 'Eclipse: Escudo pasivo al intercambiar golpes y daño porcentual en duelos.');
    } else {
      addItemToBuild(3078, 'Fuerza de la Trinidad: Estadísticas completas y daño adicional de Brillo tras cada habilidad.');
    }

    // 2nd Item
    if (isHeavyAntiTankNeeded || comp.resistanceBreakdown.tankCount >= 1) {
      addItemToBuild(3071, 'Cuchilla Negra: Reduce hasta 24% la armadura enemiga y aporta 400 de vida.');
    } else {
      addItemToBuild(6610, 'Cielo Desgarrado: Crítico garantizado en el primer golpe y curación vital en escaramuzas.');
    }

    // 3rd Item
    if (isBurstThreatHigh) {
      addItemToBuild(3053, 'Guantelete de Sterak: Escudo gigante de tenacidad al caer al 30% de vida.');
    } else if (isEnemyHeavyAd) {
      addItemToBuild(6333, 'Danza de la Muerte: Aplaza el daño recibido en sangrado y cura con derribos.');
    } else {
      addItemToBuild(3053, 'Guantelete de Sterak: Resistencia pura a ráfagas y daño de ataque base.');
    }

    // 4th Item
    if (isEnemyHeavyAp) {
      addItemToBuild(3156, 'Fauces de Malmortius: Escudo antimagia con robo de vida omnivampírico.');
    } else if (isEnemyHeavyAd && !coreBuild.some((i) => i.id === 6333)) {
      addItemToBuild(6333, 'Danza de la Muerte: Armadura y absorción de daño físico.');
    } else if (!coreBuild.some((i) => i.id === 3053)) {
      addItemToBuild(3053, 'Guantelete de Sterak: Resistencia pura a ráfagas y escudo de tenacidad.');
    } else {
      addItemToBuild(3161, 'Lanza de Shojin: Aceleración de habilidades básicas y amplificación progresiva de daño.');
    }

    // 5th Item
    if (isGrievousWoundsUrgent) {
      addItemToBuild(3075, 'Cota de Espinas: Corta el drenaje enemigo mientras aporta 70 de armadura.');
    } else {
      addItemToBuild(6665, 'Jak\'Sho el Proteico: Multiplica armadura y resistencia mágica en combate prolongado.');
    }

    // 6th Item
    addItemToBuild(3026, 'Ángel de la Guarda: Segunda oportunidad en la pelea final por el nexo.');

  } else if (meta.combatClass === 'TANK' || meta.combatClass === 'SUPPORT_TANK') {
    // Tanks
    if (isEnemyHeavyAd) {
      addItemToBuild(3068, 'Égida de Fuego Solar: Daño en área constante y armadura para ganar duelos en línea.');
      addItemToBuild(3110, 'Corazón de Hielo: Ralentiza 20% los ataques rivales y anula a sus tiradores.');
      addItemToBuild(3075, 'Cota de Espinas: Aplica Heridas Graves y devuelve daño reflejado.');
      addItemToBuild(3143, 'Presagio de Randuin: Reduce el daño crítico recibido un 30% con activa de ralentización.');
      addItemToBuild(6665, 'Jak\'Sho el Proteico: Escalado defensivo mixto para resistir en el centro de las peleas.');
      addItemToBuild(3084, 'Corazón de Acero: Acumulación de vida infinita en escaramuzas prolongadas.');
    } else if (isEnemyHeavyAp) {
      addItemToBuild(6667, 'Bastión de Kaenic: Escudo de daño mágico masivo que se regenera cada 12 segundos.');
      addItemToBuild(3065, 'Rostro Espiritual: Potencia todas tus curaciones y aporta alta resistencia mágica.');
      addItemToBuild(4401, 'Fuerza de la Naturaleza: Absorción de hechizos mágicos acumulativa con velocidad de movimiento.');
      addItemToBuild(3001, 'Máscara Abisal: Destruye la resistencia mágica de los enemigos cercanos.');
      addItemToBuild(6665, 'Jak\'Sho el Proteico: Cierra las resistencias con bonificación híbrida.');
      addItemToBuild(3068, 'Égida de Fuego Solar: Aporta armadura y limpieza de oleadas para equilibrar.');
    } else {
      addItemToBuild(3084, 'Corazón de Acero: Acumula vida permanentemente con golpes cuerpo a cuerpo.');
      addItemToBuild(3068, 'Égida de Fuego Solar: Armadura y daño continuo alrededor de tu campeón.');
      addItemToBuild(6667, 'Bastión de Kaenic: Cobertura completa contra el daño mágico del equipo rival.');
      addItemToBuild(3075, 'Cota de Espinas: Anti-curación y resistencia física.');
      addItemToBuild(6665, 'Jak\'Sho el Proteico: Pico de resistencias en combate prolongado.');
      addItemToBuild(3065, 'Rostro Espiritual: Mayor efectividad de escudos y regeneración.');
    }

  } else if (meta.combatClass === 'ASSASSIN_AD') {
    addItemToBuild(6695, 'Hidra Profana: Limpieza instantánea de oleadas y daño explosivo de ejecución en área.');
    addItemToBuild(6696, 'Oportunidad: Letalidad adicional en el asalto inicial y velocidad para retirarse.');
    addItemToBuild(6694, 'Rencor de Serylda: Penetración de armadura basada en tu letalidad con ralentización.');
    
    if (isBurstThreatHigh || isEnemyHeavyAd) {
      addItemToBuild(6692, 'Eclipse: Escudo reactivo para sobrevivir en trades cuerpo a cuerpo.');
    } else {
      addItemToBuild(3814, 'Filo de la Noche: Escudo anti-hechizos para entrar en combate sin ser interrumpido.');
    }

    if (isGrievousWoundsUrgent) {
      addItemToBuild(3033, 'Recordatorio Mortal: Anti-curación de alto impacto con daño crítico.');
    } else {
      addItemToBuild(6697, 'Cicloespada Voltaica: Ralentiza al primer objetivo y acelera el combo de asesinato.');
    }

    addItemToBuild(3026, 'Ángel de la Guarda: Cobertura defensiva para entrar con tu definitivo sin morir en vano.');

  } else {
    // Fallback / Support Enchanter
    addItemToBuild(6617, 'Renovador de Piedra Lunar: Encadena curaciones y escudos a múltiples aliados en combate.');
    addItemToBuild(3107, 'Redención: Curación en área a gran distancia y daño a enemigos en peleas de objetivo.');
    addItemToBuild(3504, 'Incensario Ardiente: Otorga velocidad de ataque y daño mágico adicional a tu tirador.');
    addItemToBuild(3190, 'Relicario de los Solari de Hierro: Escudo global para salvar al equipo de daño explosivo.');
    addItemToBuild(3050, 'Convergencia de Zeke: Tormenta de hielo al usar la definitiva que potencia a tu compañero.');
    addItemToBuild(2065, 'Canto de Guerra de Shurelya: Ráfaga de velocidad para iniciar o escapar de peleas grupales.');
  }

  // Safety filler pool to ensure guaranteed 6 items in build order
  const genericFillers = meta.damageType === 'AP'
    ? [3089, 3135, 3157, 4645, 6653, 3137, 3116, 3165]
    : meta.combatClass === 'MARKSMAN'
    ? [3031, 3094, 3036, 3072, 6676, 3046, 3153, 3033]
    : meta.combatClass === 'TANK' || meta.combatClass === 'SUPPORT_TANK'
    ? [3068, 6665, 3075, 6667, 3110, 3065, 3143]
    : [3071, 3053, 6333, 3026, 3161, 6610, 3156, 3078];

  for (const fillerId of genericFillers) {
    if (coreBuild.length >= 6) break;
    addItemToBuild(fillerId, 'Objeto táctico versátil para complementar estadísticas de combate.');
  }

  // Ensure exactly 6 items in coreBuild order
  const guaranteedCore = coreBuild.slice(0, 6);

  // 4. SITUATIONAL ITEMS: Evaluated through 3-Layer Compatibility & Scoring Motor
  const excludedItemIds = [bootsId];
  const situationalItems: BuildRecommendation['situationalItems'] = generateSituationalRecommendations(
    meta.name,
    comp,
    excludedItemIds,
    patch || getCurrentPatchSync()
  );

  // 5. RUNES RECOMMENDATION
  const keystoneInfo = getRuneById(meta.keystoneId) || getRuneById(8112)!;
  const primaryTree = meta.primaryTree || 'Dominación';
  const secondaryTree = meta.secondaryTree || 'Brujería';

  // Primary minor runes selection
  const primaryMinors: Array<{ id: number; name: string }> = [];
  if (primaryTree === 'Dominación') {
    primaryMinors.push({ id: 8139, name: getRuneName(8139) }); // Sabor a Sangre
    primaryMinors.push({ id: 8138, name: getRuneName(8138) }); // Colección de Ojos
    primaryMinors.push({ id: 8106, name: getRuneName(8106) }); // Cazador Definitivo
  } else if (primaryTree === 'Precisión') {
    primaryMinors.push({ id: 9111, name: getRuneName(9111) }); // Triunfo
    primaryMinors.push({ id: 9104, name: getRuneName(9104) }); // Leyenda: Presteza
    primaryMinors.push({ id: 8014, name: getRuneName(8014) }); // Golpe de Gracia
  } else if (primaryTree === 'Valor') {
    primaryMinors.push({ id: 8446, name: getRuneName(8446) }); // Demoler
    primaryMinors.push({ id: 8444, name: getRuneName(8444) }); // Fuerzas Renovadas
    primaryMinors.push({ id: 8451, name: getRuneName(8451) }); // Sobrecrecimiento
  } else {
    primaryMinors.push({ id: 8226, name: getRuneName(8226) }); // Banda de Maná
    primaryMinors.push({ id: 8210, name: getRuneName(8210) }); // Trascendencia
    primaryMinors.push({ id: 8237, name: getRuneName(8237) }); // Piromancia
  }

  // Secondary minor runes selection
  const secondaryMinors: Array<{ id: number; name: string }> = [];
  if (secondaryTree === 'Brujería') {
    secondaryMinors.push({ id: 8226, name: getRuneName(8226) }); // Banda de Maná
    secondaryMinors.push({ id: 8210, name: getRuneName(8210) }); // Trascendencia
  } else if (secondaryTree === 'Inspiración') {
    secondaryMinors.push({ id: 8304, name: getRuneName(8304) }); // Calzado Mágico
    secondaryMinors.push({ id: 8347, name: getRuneName(8347) }); // Perspicacia Cósmica
  } else if (secondaryTree === 'Valor') {
    secondaryMinors.push({ id: 8444, name: getRuneName(8444) }); // Fuerzas Renovadas
    secondaryMinors.push({ id: 8451, name: getRuneName(8451) }); // Sobrecrecimiento
  } else {
    secondaryMinors.push({ id: 8138, name: getRuneName(8138) }); // Colección de Ojos
    secondaryMinors.push({ id: 8105, name: getRuneName(8105) }); // Cazador Implacable
  }

  // Adaptive Shards
  const shards = {
    offense: '+9 Fuerza Adaptativa',
    flex: comp.rangeBreakdown.isPokeComp ? '+65 Vida Plana' : '+9 Fuerza Adaptativa',
    defense: isEnemyHeavyAd 
      ? '+6 Armadura (Adaptada vs Daño Físico)' 
      : isEnemyHeavyAp 
      ? '+8 Resistencia Mágica (Adaptada vs Daño Mágico)' 
      : '+65-140 Vida por Nivel',
  };

  // 6. SKILL ORDER
  const skillOrderTokens = (meta.skillOrder || 'Q > W > E').split('>').map((s) => s.trim() as 'Q' | 'W' | 'E');
  const primarySkill = skillOrderTokens[0] || 'Q';
  const secondarySkill = skillOrderTokens[1] || 'W';
  const tertiarySkill = skillOrderTokens[2] || 'E';

  // Realistic level progression (levels 1-18)
  const levels: Array<{ level: number; skill: 'Q' | 'W' | 'E' | 'R' }> = [];
  levels.push({ level: 1, skill: primarySkill });
  levels.push({ level: 2, skill: secondarySkill });
  levels.push({ level: 3, skill: tertiarySkill });
  levels.push({ level: 4, skill: primarySkill });
  levels.push({ level: 5, skill: primarySkill });
  levels.push({ level: 6, skill: 'R' });
  levels.push({ level: 7, skill: primarySkill });
  levels.push({ level: 8, skill: secondarySkill });
  levels.push({ level: 9, skill: primarySkill });
  levels.push({ level: 10, skill: secondarySkill });
  levels.push({ level: 11, skill: 'R' });
  levels.push({ level: 12, skill: secondarySkill });
  levels.push({ level: 13, skill: secondarySkill });
  levels.push({ level: 14, skill: tertiarySkill });
  levels.push({ level: 15, skill: tertiarySkill });
  levels.push({ level: 16, skill: 'R' });
  levels.push({ level: 17, skill: tertiarySkill });
  levels.push({ level: 18, skill: tertiarySkill });

  // 7. EXPLANATION: "¿POR QUÉ ESTA BUILD?" (2-4 concise reasons)
  const reasons: string[] = [];

  if (isEnemyHeavyAd) {
    reasons.push(`El equipo enemigo concentra un ${comp.damageBreakdown.adPercent}% de daño físico predominante; la itemización prioriza armadura temprana y mitigación de autoataques.`);
  } else if (isEnemyHeavyAp) {
    reasons.push(`La composición rival es ${comp.damageBreakdown.apPercent}% mágica; se prioriza resistencia mágica y escudos anti-hechizos para anular su combo.`);
  } else {
    reasons.push('El daño rival es equilibrado; la build equilibra ofensiva óptima con durabilidad flexible.');
  }

  if (isHeavyAntiTankNeeded) {
    reasons.push(`Detectada primera línea resistente (${comp.resistanceBreakdown.tankCount} tanques / luchadores); se acelera la compra de daño porcentual por vida y penetración.`);
  }

  if (isGrievousWoundsUrgent) {
    reasons.push(`Presencia de curación crítica en el rival (${comp.healingBreakdown.heavyHealers.join(', ')}); es obligatorio invertir 800 de oro temprano en Heridas Graves.`);
  }

  if (isBurstThreatHigh) {
    reasons.push('Alta amenaza de daño explosivo y asesinos rivales; los objetos de supervivencia tienen prioridad antes de las peleas por el Dragón.');
  }

  if (reasons.length < 2) {
    reasons.push('La curva de objetos maximiza el pico de poder (Power Spike) de 2 y 3 ítems según las fortalezas del campeón.');
  }

  const rawRec: BuildRecommendation = {
    patch: patch || getCurrentPatchSync(),
    playerChampion: meta.name,
    startingItem: {
      primary: startingPrimary,
      alternative: startingAlternative,
    },
    boots: {
      id: bootsId,
      name: getItemName(bootsId),
      reason: bootsReason,
    },
    coreBuild: guaranteedCore,
    situationalItems,
    runes: {
      primaryTree,
      keystone: {
        id: keystoneInfo.id,
        name: keystoneInfo.name,
        description: keystoneInfo.description,
      },
      primaryMinors,
      secondaryTree,
      secondaryMinors,
      shards,
    },
    skillOrder: {
      levels,
      maxOrder: `${primarySkill} > ${secondarySkill} > ${tertiarySkill}`,
      first3Levels: `${primarySkill} -> ${secondarySkill} -> ${tertiarySkill}`,
    },
    explanation: {
      title: `Estrategia de Build Adaptada vs ${enemies.length} Rivales`,
      reasons: reasons.slice(0, 4),
      tacticalSummary: `Configuración diseñada para explotar la debilidad estructural del equipo enemigo en el parche ${patch || getCurrentPatchSync()}.`,
    },
  };

  const validated = validateBuildRecommendation(rawRec);
  return validated.recommendation;
};

/**
 * Async deep web research recommendation engine
 * Investigates current patch, queries stat sites, adapts to enemy comp, and validates all items & runes
 */
export const generateDeepResearchBuildRecommendation = async (
  input: BuildRecommendationInput & { searchApiKey?: string }
): Promise<BuildRecommendation> => {
  const { patch, playerChampion, playerRole, allies, enemies, compositionAnalysis, searchApiKey } = input;
  const targetPatch = patch || getCurrentPatchSync();
  const meta: ChampionMetadata = resolveChampionInfo(playerChampion);
  const effectiveRole: RoleFilter = playerRole || meta.role;

  // 1. Deep web research across Riot Data Dragon & live statistics
  const research = await researchChampionBuild(meta.name, effectiveRole, targetPatch, searchApiKey);

  // 2. Base composition adaptation
  const baseRec = generateBuildRecommendation({
    patch: targetPatch,
    playerChampion: meta.name,
    playerRole: effectiveRole,
    allies,
    enemies,
    compositionAnalysis,
  });

  // 3. Attach skill order from research
  if (research.skillOrder) {
    baseRec.skillOrder = {
      levels: baseRec.skillOrder?.levels || [],
      maxOrder: research.skillOrder.maxOrder,
      first3Levels: research.skillOrder.first3Levels,
    };
  }

  // 4. Enforce final validation gatekeeper
  const validated = validateBuildRecommendation(
    baseRec,
    research.sources,
    research.sampleSize,
    research.confidenceScore,
    research.evidenceQualityText
  );

  return validated.recommendation;
};

