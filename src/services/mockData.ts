import { MatchDetail, AIAnalysisReport, SearchFormData } from '../types';

export const getMockMatches = (formData: SearchFormData): MatchDetail[] => {
  const champion = formData.championFilter || (formData.roleFilter === 'MID' ? 'Ahri' : formData.roleFilter === 'BOT' ? 'Jinx' : 'Aatrox');
  const opponentChamp = formData.roleFilter === 'MID' ? 'Syndra' : formData.roleFilter === 'BOT' ? 'Kaisa' : 'Darius';
  const roleDisplay = formData.roleFilter === 'ALL' ? 'MID' : formData.roleFilter;
  
  const count = formData.matchCount || 5;
  const matches: MatchDetail[] = [];

  for (let i = 0; i < count; i++) {
    const isWin = i % 2 === 0 || i === 1;
    const gameDuration = 1650 + Math.floor(Math.random() * 600); // ~27 to 37 mins
    const kills = isWin ? 6 + Math.floor(Math.random() * 7) : 2 + Math.floor(Math.random() * 4);
    const deaths = isWin ? 2 + Math.floor(Math.random() * 3) : 5 + Math.floor(Math.random() * 4);
    const assists = 5 + Math.floor(Math.random() * 8);
    const cs = Math.floor((gameDuration / 60) * (isWin ? 7.8 : 6.1));
    const kda = Number(((kills + assists) / Math.max(1, deaths)).toFixed(2));

    const earlyDeaths = isWin ? 1 : 3;
    const csAt10 = isWin ? 76 : 58;

    const specificAdvice: string[] = [
      isWin
        ? `Mantuviste un gran control en fase de líneas con ${csAt10} CS al min 10. Para la próxima partida en esta posición, busca castear tu combo tras el nivel 6 antes del gank enemigo.`
        : `En esta partida sufriste ${earlyDeaths} muertes tempranas antes del min 15. Evita pelear sin visión en los arbustos de río cuando la oleada esté empujada hacia la torreta rival.`,
      isWin
        ? `Aprovechaste tu pico de poder de primer objeto para asegurar el Dragón de los 12 minutos. Mantén este ritmo de recall.`
        : `Tu rival directo (${opponentChamp}) logró un KDA de ${isWin ? '1.16' : '8.0'}. Prioriza comprar Botas de Hechicero/Mercurio tempranas para mitigar su hostigamiento.`,
      `Objetivo para la revancha con ${champion}: Eleva tu visión colocando al menos 2 Control Wards defensivos en fase de carril.`
    ];

    matches.push({
      matchId: `MOCK_MATCH_${1000 + i}`,
      gameMode: 'CLASSIC',
      gameDuration,
      gameCreation: Date.now() - i * 86400000,
      specificAdvice,
      targetSummoner: {
        puuid: 'mock-puuid-user',
        summonerName: formData.gameName || 'Summoner',
        championId: 103,
        championName: champion,
        teamPosition: roleDisplay,
        kills,
        deaths,
        assists,
        kda,
        goldEarned: 11500 + i * 800,
        totalDamageDealtToChampions: 21000 + i * 2500,
        totalDamageTaken: 17000 + i * 1500,
        visionScore: 24 + i * 3,
        totalMinionsKilled: cs,
        neutralMinionsKilled: 12,
        csPerMin: Number((cs / (gameDuration / 60)).toFixed(1)),
        win: isWin,
        item0: 6655, item1: 3020, item2: 4645, item3: 3089, item4: 3157, item5: 1056, item6: 3340,
        firstBloodKill: i === 0,
        firstBloodAssist: false,
        champLevel: 15,
      },
      laneOpponent: {
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
        item0: 3070, item1: 3020, item2: 3135, item3: 0, item4: 0, item5: 0, item6: 3340,
        firstBloodKill: !isWin,
        firstBloodAssist: false,
        champLevel: 14,
      },
      timelineHighlights: {
        firstDeathTimeMin: isWin ? 11.4 : 4.2,
        mythicItemTimeMin: isWin ? 12.1 : 16.5,
        csAt10: isWin ? 76 : 58,
        csAt15: isWin ? 124 : 92,
        goldAt10: isWin ? 3600 : 2900,
        goldAt15: isWin ? 5800 : 4400,
        deathsBefore15: isWin ? 1 : 3,
      }
    });
  }

  return matches;
};

export const getMockAIReport = (formData: SearchFormData): AIAnalysisReport => {
  return {
    coachingGrade: 'A-',
    summaryText: `Análisis para ${formData.gameName || 'Invocador'} #${formData.tagLine || 'LAS'} compitiendo hacia la meta ${formData.targetRank}. Se identifican patrones sólidos en daño y participación en mid-game, pero con oportunidades clave de mejora en el control de oleadas y visión en minutos 10-15.`,
    strengths: [
      {
        title: 'Excelente Conversión de Daño en Teamfights',
        description: 'Mantienes una cuota de daño superior al 24% del equipo, posicionándote eficazmente tras los power spikes de 2 objetos.',
        metric: 'Media de 23.4k de daño / partida'
      },
      {
        title: 'Ritmo de Compra de Primer Objeto',
        description: 'Completa tu primer ítem core en promedio al minuto 12:15, lo que te permite dominar la primera escaramuza de Dragón o Heraldo.',
        metric: 'Core Item @ 12:15m'
      },
      {
        title: 'Baja Frecuencia de Muertes en Fase de Carril Temprana',
        description: 'Tus muertes antes del minuto 10 se mantienen por debajo de 1.2 por partida en victorias, demostrando buen respeto a los ganks tempranos.',
        metric: '0.8 Muertes < 10m'
      }
    ],
    criticalErrors: [
      {
        title: 'Caída de CS/min posterior al minuto 15',
        description: 'Al rotar a Mid o bot tras tirar la primera torreta, descuidas el farm en side lanes perdiendo ~2.3 CS por minuto respecto al estándar de ' + formData.targetRank + '.',
        impact: 'CRÍTICO',
        recommendation: 'Asigna una side lane con visión previa antes de agruparte sin objetivo en el mapa.'
      },
      {
        title: 'Muertes Innecesarias antes de Objetivos Mayores (Dragón/Barón)',
        description: 'En el 40% de las partidas analizadas se detecta una muerte entre los 90 y 45 segundos previos a la salida del Dragón.',
        impact: 'ALTO',
        recommendation: 'Establece visión 1:30 minutos antes del Spawn del Dragón y retírate a base a comprar sin forzar tradeos.'
      },
      {
        title: 'Deficit de Visión Profunda (Control Wards)',
        description: 'Compras en promedio solo 0.8 Control Wards por partida, por debajo del benchmark de 2.2 wards para el rango ' + formData.targetRank + '.',
        impact: 'MEDIO',
        recommendation: 'Añade 1 Control Ward en cada recall donde te queden 75+ de oro.'
      }
    ],
    actionPlan: [
      {
        step: 1,
        objective: 'Fijar Benchmark de Farm en Minuto 15',
        howToExecute: 'Busca alcanzar al menos 115 CS al min 15 asegurando el ralentizado de oleadas (slow push) antes de rotar.',
        targetMetric: '7.8 CS/min a min 15'
      },
      {
        step: 2,
        objective: 'Timing de Recall Pre-Dragón',
        howToExecute: 'Si el Dragón respawnea en 1:15m, limpia la oleada, presiona B inmediatamente y compra con tu oro disponible.',
        targetMetric: '0 Muertes < 60s antes de Dragón'
      },
      {
        step: 3,
        objective: 'Hábito de Compra de Control Wards',
        howToExecute: 'Comprométete a colocar al menos 2 Control Wards defensivos en el arbusto de río / tribush durante la fase de carril.',
        targetMetric: '2+ Control Wards por partida'
      }
    ]
  };
};
