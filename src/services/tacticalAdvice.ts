import { MatchParticipant, TargetRank } from '../types';
import { getBenchmarkForRank } from './benchmarks';
import { getItemName } from './itemData';

interface MatchContext {
  targetSummoner: MatchParticipant;
  laneOpponent?: MatchParticipant;
  gameDuration: number; // in seconds
  targetRank: TargetRank;
  timelineHighlights?: {
    firstDeathTimeMin?: number;
    csAt10: number;
    csAt15: number;
    deathsBefore15: number;
    goldAt10: number;
    goldAt15: number;
  };
}

export interface CategorizedAdvice {
  category: 'MATCHUP' | 'WAVES' | 'BUILD' | 'VISION';
  categoryLabel: string;
  badgeColor: string;
  text: string;
}

/**
 * Generador de consejos tácticos hiper-específicos de nivel Challenger para cada partida.
 * Prohíbe frases genéricas y evalúa métricas exactas: minutos de primera muerte, CSD@10,
 * técnicas de oleadas (slow push, freeze, crash, cheater recall), objetos reales y timings de objetivos.
 */
export const generateMatchTacticalAdvice = ({
  targetSummoner,
  laneOpponent,
  gameDuration,
  targetRank,
  timelineHighlights,
}: MatchContext): string[] => {
  const adviceList: string[] = [];
  const benchmark = getBenchmarkForRank(targetRank);
  const durationMin = Math.max(1, Math.round(gameDuration / 60));
  const visionPerMin = Number((targetSummoner.visionScore / durationMin).toFixed(2));
  const champ = targetSummoner.championName;
  const oppChamp = laneOpponent?.championName;
  const role = targetSummoner.teamPosition || 'LANE';

  const deathsEarly = timelineHighlights?.deathsBefore15 ?? 0;
  const firstDeath = timelineHighlights?.firstDeathTimeMin;
  const cs10 = timelineHighlights?.csAt10 ?? Math.round(targetSummoner.csPerMin * 8);
  const cs15 = timelineHighlights?.csAt15 ?? Math.round(targetSummoner.csPerMin * 12.5);

  // -------------------------------------------------------------
  // PILAR 1: FASE DE LÍNEAS & MATCHUP DIRECTO
  // -------------------------------------------------------------
  if (firstDeath !== undefined && firstDeath < 3.8) {
    adviceList.push(
      `[MATCHUP & LÍNEA] Muerte temprana en min ${firstDeath}: Esta marca coincide con la ruta de nivel 3 del jungla rival tras limpiar su segundo campamento/bufo (2:45-3:30) o con un all-in en niveles 2-3. Al jugar ${champ} en ${role} frente a ${oppChamp || 'tu rival'}, coloca un ward en el arbusto de río al minuto 2:40 y no presiones la oleada más allá de la mitad de línea sin confirmar la ubicación del jungla en el mapa.`
    );
  } else if (deathsEarly >= 2) {
    adviceList.push(
      `[MATCHUP & LÍNEA] Sufriste ${deathsEarly} muertes antes del minuto 15 contra ${oppChamp || 'tu rival'}. Cuando quedas en desventaja de 1 muerte o un objeto componente, suspende los intercambios agresivos: mantén la oleada congelada (Freeze) dejando 3-4 súbditos hechiceros rivales vivos justo antes del rango de tu torre para farmear seguro bajo protección.`
    );
  } else if (laneOpponent && targetSummoner.kills > laneOpponent.kills) {
    adviceList.push(
      `[MATCHUP & LÍNEA] Dominaste la fase de carril frente a ${oppChamp} (${targetSummoner.kills}/${targetSummoner.deaths} vs ${laneOpponent.kills}/${laneOpponent.deaths}). Tu ventana óptima fue castigar los momentos en que ${oppChamp} gastaba su habilidad principal para farmear. Continúa explotando los enfriamientos del rival para denegar oro.`
    );
  } else {
    adviceList.push(
      `[MATCHUP & LÍNEA] En el emparejamiento con ${champ} vs ${oppChamp || 'tu rival de carril'}, mantuviste ${deathsEarly === 0 ? 'cero muertes tempranas' : 'solidez táctica'}. Identifica los picos de nivel 2 y 6 para sincronizar intercambios cortos cuando la barra de recursos o enfriamientos de ${oppChamp || 'tu oponente'} estén comprometidos.`
    );
  }

  // -------------------------------------------------------------
  // PILAR 2: CONTROL DE OLEADAS & FARMING TEMPO
  // -------------------------------------------------------------
  if (cs10 < 65) {
    adviceList.push(
      `[OLEADAS & MACRO] Déficit de farmeo temprano con ${cs10} CS al minuto 10 (meta ${targetRank}: 75+ CS). Ejecuta la técnica de "Slow Push": da solo el último golpe a los súbditos de las oleadas 1 y 2 para acumular dos oleadas y estamparlas (Crash) con el súbdito de cañón al minuto 3:15. Esto te otorga un "Cheater Recall" limpio para comprar con 450+ de oro sin perder experiencia.`
    );
  } else if (targetSummoner.csPerMin < benchmark.csPerMin) {
    adviceList.push(
      `[OLEADAS & MACRO] Caída de CS en mid-game: Tuviste ${cs15} CS al min 15 pero cerraste en ${targetSummoner.csPerMin} CS/min (benchmark ${benchmark.csPerMin}). Tras derribar la primera torreta de tu línea, no te quedes en "ARAM" en la calle central: empuja las oleadas de la línea lateral asignada hasta cruzar el río antes de rotar a pelear los objetivos neutrales.`
    );
  } else {
    adviceList.push(
      `[OLEADAS & MACRO] Excelente ritmo de cosecha con ${cs10} CS al min 10 y ${targetSummoner.csPerMin} CS/min general. Tu siguiente paso para consolidar nivel ${targetRank} es el "Wave Bouncing": tras estrellar la oleada contra la torre enemiga, retrocede de inmediato para forzar que la oleada rebote lentamente hacia tu lado, dejándote a salvo de ganks.`
    );
  }

  // -------------------------------------------------------------
  // PILAR 3: ITEMIZACIÓN ESTRATÉGICA & POWER SPIKES
  // -------------------------------------------------------------
  const playerItems = [
    targetSummoner.item0,
    targetSummoner.item1,
    targetSummoner.item2,
    targetSummoner.item3,
    targetSummoner.item4,
    targetSummoner.item5,
  ].filter((id) => id > 0);

  const oppItems = laneOpponent
    ? [
        laneOpponent.item0,
        laneOpponent.item1,
        laneOpponent.item2,
        laneOpponent.item3,
        laneOpponent.item4,
        laneOpponent.item5,
      ].filter((id) => id > 0)
    : [];

  const firstItemName = playerItems.length > 0 ? getItemName(playerItems[0]) : '';
  const oppFirstItemName = oppItems.length > 0 ? getItemName(oppItems[0]) : '';

  if (laneOpponent && laneOpponent.totalDamageDealtToChampions > targetSummoner.totalDamageDealtToChampions) {
    adviceList.push(
      `[BUILD & SPIKES] Tu rival (${oppChamp}) generó mayor impacto de daño (${laneOpponent.totalDamageDealtToChampions.toLocaleString()} vs ${targetSummoner.totalDamageDealtToChampions.toLocaleString()}) con ${oppFirstItemName || 'su primer objeto'}. Considera intercalar botas defensivas (Botas Blindadas frente a autoataques/letalidad o Botas de Mercurio ante CC pesado) antes de completar tu segundo objeto ofensivo.`
    );
  } else if (firstItemName) {
    adviceList.push(
      `[BUILD & SPIKES] Pico de poder con ${firstItemName}: Al completar este objeto central, tu ventaja de estadísticas es máxima. Es el momento exacto para forzar escaramuzas en el Dragón o en las Larvas del Vacío antes de que ${oppChamp || 'tu oponente'} complete su respuesta.`
    );
  } else {
    adviceList.push(
      `[BUILD & SPIKES] Optimización de compras: Si te enfrentas a composiciones con alta regeneración o escudos, recuerda incorporar componentes tácticos tempranos (como Llamada del Verdugo u Orbe del Olvido por 800 de oro) en lugar de retrasar las Heridas Graves a los 25 minutos.`
    );
  }

  // -------------------------------------------------------------
  // PILAR 4: VISIÓN TÁCTICA & OBJETIVOS MAYORES
  // -------------------------------------------------------------
  if (visionPerMin < benchmark.visionScorePerMin) {
    adviceList.push(
      `[VISIÓN & OBJETIVOS] Puntuación de visión de ${targetSummoner.visionScore} (${visionPerMin}/min vs benchmark de ${benchmark.visionScorePerMin}/min). Reserva siempre 75 de oro en cada recall: debes colocar un Guardián de Control (Pink Ward) en el pixel bush de río o foso de objetivo exactamente 60 segundos antes de la salida del Dragón (min 4:00) o Larvas del Vacío (min 5:00) para asegurar la ventaja de información táctica.`
    );
  } else {
    adviceList.push(
      `[VISIÓN & OBJETIVOS] Sólido aporte de visión con ${targetSummoner.visionScore} puntos (${visionPerMin}/min). Mantén la transición al Lente del Oráculo (rojo) a partir del minuto 14 para limpiar la visión enemiga en los accesos a Barón Nashor y preparar emboscadas en arbustos clave.`
    );
  }

  return adviceList;
};
