import { Groq } from 'groq-sdk';
import { MatchDetail, TargetRank, AIAnalysisReport } from '../types';
import { getBenchmarkForRank } from './benchmarks';
import { getBuildItemNames } from './itemData';

const SYSTEM_PROMPT = `Eres el Head Coach de League of Legends de nivel Challenger / Analista Principal de LCK y LEC.
Tu tarea es realizar una auditoría técnica profunda y un diagnóstico hiper-específico del rendimiento del jugador, evaluando cómo cerrar la brecha con el benchmark de su RANGO OBJETIVO.

PROHIBICIONES ESTRICTAS (REGLA DE TOLERANCIA CERO A CONSEJOS GENÉRICOS):
- Queda TERMINANTEMENTE PROHIBIDO dar consejos vagos, superficiales o clichés como: "mejora tu visión", "farmea mejor tras el min 15", "ten cuidado con los ganks", "posiciónate mejor", "ajusta tu build", o "compra más pinks".
- Cualquier sugerencia debe contener detalles de ejecución mecánicos, estratégicos y tácticos EXACTOS.

DIRECTIVAS OBLIGATORIAS DE HIPER-ESPECIFICIDAD:
1. MECÁNICAS Y HABILIDADES EXACTAS: Menciona siempre los nombres o teclas de las habilidades (Q, W, E, R, Pasiva), combos específicos y enfriamientos clave tanto del campeón del jugador como de su oponente directo de carril (por ejemplo: "Usa el Charm/E de Ahri de forma reactiva sólo tras confirmar que Zed ha usado su W", "Castiga los 16s de enfriamiento de la E de Syndra para tradear").
2. CONTROL DE OLEADAS Y TIMINGS DE RECALL: Describe la técnica de oleada precisa (Slow Push, Fast Push, Crash, Freeze, Bounce), el número de oleada y el minuto exacto (por ejemplo: "Slow push en oleadas 1 y 2 para lograr Crash en la 3ª oleada con súbdito de cañón al minuto 3:15 y ejecutar un Cheater Recall con 450+ de oro sin perder experiencia").
3. ITEMIZACIÓN ADAPTATIVA Y PICOS DE PODER: Especifica los nombres exactos de los objetos y componentes tácticos (ej. Malignidad, Botas Blindadas, Reloj de Arena de Zhonya, Llamada del Verdugo a 800g, El Coleccionista, Cielo Desgarrado), justificando por qué contrarrestan el daño o la build del rival.
4. MACRO Y ROTACIONES POST MINUTO 15: No te limites a decir "farmea". Explica qué línea lateral tomar (top o bot según Teleport y objetivo activo: Dragón vs Barón/Larvas), hasta qué punto empujar (altura del río) y cuándo colapsar.
5. VISIÓN CON MINUTO Y LOCALIZACIÓN GEOGRÁFICA: Especifica el arbusto exacto (pixel bush de río, tribush, cruce de raptores enemigos, foso de Dragón) y el minuto clave (minuto 2:40 para detectar el gank de nivel 3 del jungla rival; 60 segundos antes del spawn de Dragón o Barón).

Debes responder ÚNICAMENTE con un objeto JSON estrictamente válido, sin introducciones ni textos extra fuera del JSON.

Estructura obligatoria del JSON:
{
  "coachingGrade": "S" | "A+" | "A" | "A-" | "B+" | "B" | "C",
  "summaryText": "Resumen ejecutivo analítico y directo sobre el potencial de ascenso y los 2 mayores diferenciales técnicos observados",
  "strengths": [
    {
      "title": "Nombre técnico de la fortaleza (ej. Conversión de Daño con Power Spike de 1 Ítem)",
      "description": "Explicación detallada con contexto estratégico y de campeón",
      "metric": "Dato o métrica numérica destacada"
    }
  ],
  "criticalErrors": [
    {
      "title": "Nombre técnico del error (ej. Vulnerabilidad a Ganks de Nivel 3 en Minuto 2:45-3:30)",
      "description": "Explicación táctica detallada de por qué este error cuesta la partida o el control del carril",
      "impact": "CRÍTICO" | "ALTO" | "MEDIO",
      "recommendation": "Instrucción de corrección técnica hiper-específica (mencionando habilidades, oleadas u objetos exactos)"
    }
  ],
  "actionPlan": [
    {
      "step": 1,
      "objective": "Objetivo técnico cuantificable para la próxima partida",
      "howToExecute": "Instrucción paso a paso de ejecución en juego con timings, nombres de ítems/habilidades y posicionamiento",
      "targetMetric": "Métrica meta exacta a lograr"
    }
  ]
}

REGLAS DE FORMATO:
- Genera exactamente 3 Puntos Fuertes basados en las métricas más destacadas.
- Genera exactamente 3 Errores Críticos con soluciones técnicas detalladas.
- Genera exactamente 3 pasos del Plan de Acción Inmediato.
- Redacta todo en español neutro, técnico, incisivo y profesional.`;

export const fetchLatestGroqModels = async (groqApiKey: string): Promise<string[]> => {
  const DEFAULT_FALLBACKS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'deepseek-r1-distill-llama-70b',
  ];

  if (!groqApiKey || groqApiKey.trim() === '') return DEFAULT_FALLBACKS;

  try {
    console.log('Consultando la lista de modelos de Groq en https://api.groq.com/openai/v1/models...');
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${groqApiKey.trim()}`,
      },
    });

    if (!res.ok) return DEFAULT_FALLBACKS;

    const data = await res.json();
    const modelsList: any[] = data.data || [];

    // Filter active chat/completion models
    const chatModels = modelsList.filter((m) => {
      const id = (m.id || '').toLowerCase();
      return (
        m.active !== false &&
        !id.includes('whisper') &&
        !id.includes('guard') &&
        !id.includes('vision') &&
        !id.includes('embed') &&
        !id.includes('audio') &&
        !id.includes('tts')
      );
    });

    // Sort by created timestamp descending (most recent first)
    chatModels.sort((a, b) => (b.created || 0) - (a.created || 0));

    const sortedIds = chatModels.map((m) => m.id);
    return sortedIds.length > 0 ? sortedIds : DEFAULT_FALLBACKS;
  } catch (err) {
    console.warn('Error al consultar https://api.groq.com/openai/v1/models:', err);
    return DEFAULT_FALLBACKS;
  }
};

export const generateGroqCoachAnalysis = async (
  matches: MatchDetail[],
  targetRank: TargetRank,
  groqApiKey: string
): Promise<AIAnalysisReport> => {
  if (!groqApiKey || groqApiKey.trim() === '') {
    throw new Error('Groq API Key no configurada. Ingrésala en el panel de Configuración de la aplicación.');
  }

  const benchmark = getBenchmarkForRank(targetRank);

  // Excluir partidas menores a 8 min (remakes) para no alterar las métricas
  const filteredMatches = matches.filter((m) => (m.gameDuration || 0) >= 480);
  const activeMatches = filteredMatches.length > 0 ? filteredMatches : matches;

  // Compute aggregate statistics
  const totalMatches = activeMatches.length;
  const wins = activeMatches.filter((m) => m.targetSummoner.win).length;
  const winRate = Math.round((wins / totalMatches) * 100);

  const avgKDA = Number(
    (activeMatches.reduce((acc, m) => acc + m.targetSummoner.kda, 0) / totalMatches).toFixed(2)
  );

  const avgCS = Number(
    (activeMatches.reduce((acc, m) => acc + m.targetSummoner.csPerMin, 0) / totalMatches).toFixed(1)
  );

  const avgVision = Number(
    (
      activeMatches.reduce((acc, m) => acc + (m.targetSummoner.visionScore / (m.gameDuration / 60)), 0) /
      totalMatches
    ).toFixed(2)
  );

  const avgDamage = Math.round(
    activeMatches.reduce((acc, m) => acc + m.targetSummoner.totalDamageDealtToChampions, 0) / totalMatches
  );

  const avgDeathsEarly = Number(
    (
      activeMatches.reduce((acc, m) => acc + (m.timelineHighlights?.deathsBefore15 || 0), 0) / totalMatches
    ).toFixed(1)
  );

  const matchSummaries = activeMatches.map((m, idx) => ({
    game: idx + 1,
    champion: m.targetSummoner.championName,
    role: m.targetSummoner.teamPosition,
    result: m.targetSummoner.win ? 'Victoria' : 'Derrota',
    kda: `${m.targetSummoner.kills}/${m.targetSummoner.deaths}/${m.targetSummoner.assists} (KDA: ${m.targetSummoner.kda})`,
    csPerMin: m.targetSummoner.csPerMin,
    damage: m.targetSummoner.totalDamageDealtToChampions,
    goldEarned: m.targetSummoner.goldEarned,
    itemsBuilt: getBuildItemNames([
      m.targetSummoner.item0,
      m.targetSummoner.item1,
      m.targetSummoner.item2,
      m.targetSummoner.item3,
      m.targetSummoner.item4,
      m.targetSummoner.item5,
    ]),
    visionScore: m.targetSummoner.visionScore,
    opponentChampion: m.laneOpponent?.championName || 'Desconocido',
    opponentKDA: m.laneOpponent ? `${m.laneOpponent.kills}/${m.laneOpponent.deaths}/${m.laneOpponent.assists}` : 'N/A',
    opponentCSPerMin: m.laneOpponent?.csPerMin || 'N/A',
    opponentDamage: m.laneOpponent?.totalDamageDealtToChampions || 'N/A',
    opponentItemsBuilt: m.laneOpponent
      ? getBuildItemNames([
          m.laneOpponent.item0,
          m.laneOpponent.item1,
          m.laneOpponent.item2,
          m.laneOpponent.item3,
          m.laneOpponent.item4,
          m.laneOpponent.item5,
        ])
      : [],
    timeline: {
      csAt10: m.timelineHighlights?.csAt10,
      csAt15: m.timelineHighlights?.csAt15,
      deathsBefore15: m.timelineHighlights?.deathsBefore15,
      firstDeathMin: m.timelineHighlights?.firstDeathTimeMin !== undefined ? `${m.timelineHighlights.firstDeathTimeMin}m` : 'Ninguna',
    }
  }));

  const userPromptPayload = {
    targetRankBenchmark: benchmark,
    playerAggregateStats: {
      totalMatches,
      winRatePercentage: winRate,
      avgKDA,
      avgCSPerMin: avgCS,
      avgVisionScorePerMin: avgVision,
      avgDamageDealt: avgDamage,
      avgDeathsBefore15: avgDeathsEarly,
    },
    matchesDetail: matchSummaries,
  };

  // Dynamically fetch and sort active models by created timestamp (newest first)
  const candidateModels = await fetchLatestGroqModels(groqApiKey);
  let lastErrorMessage = '';

  for (const modelToUse of candidateModels) {
    try {
      console.log(`Llamando a Groq API (https://api.groq.com/openai/v1/chat/completions) usando el modelo más reciente: ${modelToUse}...`);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Realiza el diagnóstico de coaching para el siguiente perfil de partidas de League of Legends:\n\n${JSON.stringify(
                userPromptPayload,
                null,
                2
              )}`,
            },
          ],
          model: modelToUse,
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.status === 401) {
        throw new Error('Fallo de autenticación con la API de Groq. Por favor verifica que tu Groq API Key sea válida.');
      }

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const message = errorJson?.error?.message || `Error HTTP ${response.status}`;
        lastErrorMessage = message;
        console.warn(`El modelo ${modelToUse} devolvió error HTTP ${response.status} (${message}). Reintentando con el siguiente modelo más reciente...`);
        continue;
      }

      const jsonResponse = await response.json();
      const responseContent = jsonResponse.choices?.[0]?.message?.content || '';
      const parsedReport: AIAnalysisReport = JSON.parse(responseContent);
      return parsedReport;
    } catch (error: any) {
      if (error.message?.includes('autenticación') || error.message?.includes('Groq API Key no configurada')) {
        throw error;
      }
      console.warn(`Error llamando a Groq API con ${modelToUse}:`, error?.message || error);
      lastErrorMessage = error?.message || String(error);
    }
  }

  throw new Error(`Error en el servicio de Coaching con Groq AI: ${lastErrorMessage}`);
};
