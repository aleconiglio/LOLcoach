import { MatchDetail, AIAnalysisReport, SearchFormData } from '../types';
import { generateMatchTacticalAdvice } from './tacticalAdvice';

export const getMockMatches = (formData: SearchFormData): MatchDetail[] => {
  const champion =
    formData.championFilter.trim() ||
    (formData.roleFilter === 'MID'
      ? 'Ahri'
      : formData.roleFilter === 'BOT'
      ? 'Jinx'
      : formData.roleFilter === 'TOP'
      ? 'Aatrox'
      : formData.roleFilter === 'JUNGLE'
      ? 'Lee Sin'
      : formData.roleFilter === 'SUPPORT'
      ? 'Thresh'
      : 'Ahri');

  const opponentChamp =
    formData.roleFilter === 'MID'
      ? 'Syndra'
      : formData.roleFilter === 'BOT'
      ? 'Kai\'Sa'
      : formData.roleFilter === 'TOP'
      ? 'Darius'
      : formData.roleFilter === 'JUNGLE'
      ? 'Viego'
      : formData.roleFilter === 'SUPPORT'
      ? 'Nautilus'
      : 'Syndra';

  const roleDisplay = formData.roleFilter === 'ALL' ? 'MID' : formData.roleFilter;
  const count = formData.matchCount || 5;
  const matches: MatchDetail[] = [];

  for (let i = 0; i < count; i++) {
    const isWin = i % 2 === 0 || i === 1;
    const gameDuration = 1650 + (i * 120); // ~27 to 37 mins
    const kills = isWin ? 6 + (i * 2) : 2 + (i % 3);
    const deaths = isWin ? 2 + (i % 2) : 5 + (i % 3);
    const assists = 5 + (i * 3);
    const cs = Math.floor((gameDuration / 60) * (isWin ? 7.8 : 6.1));
    const kda = Number(((kills + assists) / Math.max(1, deaths)).toFixed(2));

    const earlyDeaths = isWin ? 0 : 2;
    const csAt10 = isWin ? 78 : 56;
    const csAt15 = isWin ? 128 : 94;
    const firstDeathTimeMin = isWin ? 11.4 : 3.2;

    const timelineHighlights = {
      firstDeathTimeMin,
      mythicItemTimeMin: isWin ? 12.1 : 16.5,
      csAt10,
      csAt15,
      goldAt10: isWin ? 3800 : 2900,
      goldAt15: isWin ? 6100 : 4400,
      deathsBefore15: earlyDeaths,
    };

    const targetSummoner = {
      puuid: 'mock-puuid-user',
      summonerName: formData.gameName || 'Invocador',
      championId: 103,
      championName: champion,
      teamPosition: roleDisplay,
      kills,
      deaths,
      assists,
      kda,
      goldEarned: 11500 + i * 900,
      totalDamageDealtToChampions: 21000 + i * 2800,
      totalDamageTaken: 17000 + i * 1500,
      visionScore: 24 + i * 4,
      totalMinionsKilled: cs,
      neutralMinionsKilled: 12,
      csPerMin: Number((cs / (gameDuration / 60)).toFixed(1)),
      win: isWin,
      item0: 6655, // Luden's Companion
      item1: 3020, // Sorcerer's Shoes
      item2: 4645, // Shadowflame
      item3: 3089, // Rabadon
      item4: 3157, // Zhonya
      item5: 1056, // Doran's Ring
      item6: 3340, // Trinket
      firstBloodKill: i === 0,
      firstBloodAssist: false,
      champLevel: 15,
    };

    const laneOpponent = {
      puuid: `mock-puuid-opp-${i}`,
      summonerName: 'RivalPlayer',
      championId: 134,
      championName: opponentChamp,
      teamPosition: roleDisplay,
      kills: isWin ? 3 : 7,
      deaths: isWin ? 6 : 2,
      assists: isWin ? 4 : 9,
      kda: isWin ? 1.16 : 8.0,
      goldEarned: isWin ? 9800 : 14200,
      totalDamageDealtToChampions: isWin ? 16000 : 26000,
      totalDamageTaken: 19000,
      visionScore: 18,
      totalMinionsKilled: isWin ? cs - 30 : cs + 25,
      neutralMinionsKilled: 4,
      csPerMin: Number(((isWin ? cs - 30 : cs + 25) / (gameDuration / 60)).toFixed(1)),
      win: !isWin,
      item0: 6653, // Liandry's Torment
      item1: 3020, // Sorcerer's Shoes
      item2: 3135, // Void Staff
      item3: 3157, // Zhonya
      item4: 0,
      item5: 0,
      item6: 3340,
      firstBloodKill: !isWin,
      firstBloodAssist: false,
      champLevel: 14,
    };

    const specificAdvice = generateMatchTacticalAdvice({
      targetSummoner,
      laneOpponent,
      gameDuration,
      targetRank: formData.targetRank,
      timelineHighlights,
    });

    matches.push({
      matchId: `MOCK_MATCH_${1000 + i}`,
      gameMode: 'CLASSIC',
      gameDuration,
      gameCreation: Date.now() - i * 86400000,
      specificAdvice,
      targetSummoner,
      laneOpponent,
      timelineHighlights,
    });
  }

  return matches;
};

export const getMockAIReport = (formData: SearchFormData): AIAnalysisReport => {
  const champ =
    formData.championFilter.trim() ||
    (formData.roleFilter === 'MID'
      ? 'Ahri'
      : formData.roleFilter === 'BOT'
      ? 'Jinx'
      : formData.roleFilter === 'TOP'
      ? 'Aatrox'
      : formData.roleFilter === 'JUNGLE'
      ? 'Lee Sin'
      : formData.roleFilter === 'SUPPORT'
      ? 'Thresh'
      : 'Ahri');

  const oppChamp =
    formData.roleFilter === 'MID'
      ? 'Syndra'
      : formData.roleFilter === 'BOT'
      ? 'Kai\'Sa'
      : formData.roleFilter === 'TOP'
      ? 'Darius'
      : formData.roleFilter === 'JUNGLE'
      ? 'Viego'
      : formData.roleFilter === 'SUPPORT'
      ? 'Nautilus'
      : 'Syndra';

  const rank = formData.targetRank || 'Gold';

  return {
    coachingGrade: 'A-',
    summaryText: `Auditoría Challenger para ${formData.gameName || 'Invocador'} #${formData.tagLine || 'LAS'} pilotando a ${champ} con meta en ${rank}. Demuestras gran aprovechamiento del primer pico de objeto (Power Spike) y conversión de daño en escaramuzas. Sin embargo, tu brecha para ${rank} radica en muertes tempranas por sobre-extensión al minuto 2:45-3:30 (ruta de nivel 3 del jungla rival) y desaprovechamiento de las side-lanes tras la caída de la primera torre.`,
    strengths: [
      {
        title: `Conversión de Daño en Escaramuzas con ${champ}`,
        description: `Maximizas el intercambio de daño tras completar tu primer ítem central (Compañera de Luden). Sostienes una cuota de daño superior al 25% del equipo gracias a un óptimo reposicionamiento en el río durante peleas de Dragón.`,
        metric: 'Media de 23.4k de daño / partida'
      },
      {
        title: 'Timing de Primer Power Spike a los 12:15m',
        description: `Alcanzas el primer objeto completo en promedio al minuto 12:15 gracias a cheater recalls limpios en victorias. Esto te asegura una ventaja de +15 AP/AD frente a ${oppChamp} en la disputa del Heraldo y 2º Dragón.`,
        metric: 'Core Item @ 12:15m'
      },
      {
        title: 'Respeto al Espaciado en Duelos 1v1 Ganados',
        description: `En partidas victoriosas lograste 0 muertes antes del min 11, manteniendo a ${oppChamp} a distancia máxima de habilidad y guardando tu habilidad de escape/control para desenganchar.`,
        metric: '0.0 Muertes < 10m en Victorias'
      }
    ],
    criticalErrors: [
      {
        title: 'Vulnerabilidad a Ganks de Nivel 3 en Minuto 2:45 - 3:30',
        description: `En el 50% de las derrotas se registra la primera muerte antes del min 3:45. Empujas la segunda oleada sin haber estrellado la tercera (cañón), quedando sobre-extendido justo cuando el jungla enemigo finaliza su ruta de 3 campamentos o doble bufo.`,
        impact: 'CRÍTICO',
        recommendation: `No empujes la oleada 2. Aplica "Slow Push" en las oleadas 1 y 2, estrella la oleada 3 con súbdito de cañón (Crash) al min 3:15 y wardea el arbusto pixel del río al min 2:40 antes de dar back con 450+ de oro.`
      },
      {
        title: 'Desconexión de Farm en Side-Lanes Post Minuto 15',
        description: `Al derribar la primera torre, abandonas las oleadas laterales para agruparte en "ARAM" en la calle central, perdiendo 2.1 CS/min respecto al benchmark de ${rank}.`,
        impact: 'ALTO',
        recommendation: `Asigna la línea lateral más cercana al objetivo neutral que respawneará en los próximos 2 minutos. Empuja la oleada hasta cruzar la altura del río (sólo si tienes visión en jungla rival) y rota a la jugada con ventaja de súbditos.`
      },
      {
        title: 'Retraso de Ítems Defensivos / Anti-curación',
        description: `Frente a amenazas de daño explosivo físico o campeones con curación masiva, demoras la compra de componentes defensivos clave como Botas Blindadas (Tabis) o Llamada del Verdugo hasta el 3er ítem.`,
        impact: 'MEDIO',
        recommendation: `Invierte 800 de oro en un componente reactivo (Llamada del Verdugo / Orbe del Olvido o Protector del Brazo de la Buscadora) justo después de completar tu primer objeto core.`
      }
    ],
    actionPlan: [
      {
        step: 1,
        objective: 'Ejecutar el Cheater Recall en la 3ª Oleada (Minuto 3:15)',
        howToExecute: `Da solo el último golpe a los súbditos de las 2 primeras oleadas. Al llegar la 3ª oleada con cañón, usa tus habilidades de daño en área para forzar el Crash bajo torre enemiga al min 3:15. Presiona B de inmediato para comprar Botas o Tomo/Espada y vuelve a línea con ventaja de stats antes de que el rival pueda empujar.`,
        targetMetric: 'Crash al min 3:15 con 0 muertes < 4m'
      },
      {
        step: 2,
        objective: 'Timing de Visión y Recall 60s Pre-Dragón',
        howToExecute: `Observa el temporizador del Dragón: cuando falten 1:15m para su spawn, empuja la oleada, presiona B al min 4:00, compra tus componentes disponibles, adquiere 1 Guardián de Control (Pink Ward) y colócalo en el pixel bush o foso de Dragón 45s antes del spawn.`,
        targetMetric: '1 Control Ward activo antes de cada objetivo'
      },
      {
        step: 3,
        objective: 'Mantener el Ritmo de Farm en Mid-Game (Side Lane Catch)',
        howToExecute: `Tras el minuto 15, no compartas súbditos en carril central. Recoge la oleada en la calle lateral asignada, empújala hasta el río y utiliza el tiempo en que la oleada choca para agruparte o invadir la jungla rival con tu equipo.`,
        targetMetric: `Alcanzar 7.5+ CS/min sostenido hasta min 25`
      }
    ]
  };
};
