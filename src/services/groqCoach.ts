import { Groq } from 'groq-sdk';
import { MatchDetail, TargetRank, AIAnalysisReport } from '../types';
import { getBenchmarkForRank } from './benchmarks';

const SYSTEM_PROMPT = `Eres un Coach de Élite de League of Legends de nivel Challenger / Analista LCK/LCS/LEC.
Tu objetivo es analizar cuantitativa y cualitativamente el rendimiento de un jugador comparándolo contra el benchmark de su RANGO OBJETIVO.

Debes responder ÚNICAMENTE con un objeto JSON estrictamente válido, sin introducciones ni textos extra fuera del JSON.

Estructura obligatoria del JSON:
{
  "coachingGrade": "S" | "A+" | "A" | "A-" | "B+" | "B" | "C",
  "summaryText": "Resumen ejecutivo del desempeño general y potencial de ascenso",
  "strengths": [
    {
      "title": "Nombre corto de la fortaleza",
      "description": "Explicación detallada con contexto estratégico",
      "metric": "Dato o métrica numérica destacada"
    }
  ],
  "criticalErrors": [
    {
      "title": "Nombre del error crítico",
      "description": "Explicación de cómo este error cuesta partidas o impide subir de rango",
      "impact": "CRÍTICO" | "ALTO" | "MEDIO",
      "recommendation": "Solución técnica concreta"
    }
  ],
  "actionPlan": [
    {
      "step": 1,
      "objective": "Objetivo cuantificable para la próxima partida",
      "howToExecute": "Instrucción paso a paso de cómo ejecutarlo en juego",
      "targetMetric": "Métrica meta a lograr"
    }
  ]
}

REGLAS DE ANÁLISIS:
1. Genera exactamente 3 Puntos Fuertes reales basados en las mejores métricas observadas.
2. Genera exactamente 3 Errores Críticos enfocados en: control de oleadas, muertes tempranas/pre-objetivos, CS/min post min 15, visión o matchups.
3. Genera un Plan de Acción Inmediato con 3 objetivos CONCRETOS y 100% aplicables en la siguiente partida.
4. Redacta todo en español neutro, técnico y motivador.`;

export const DEFAULT_GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'llama3-70b-8192',
  'llama3-8b-8192',
  'deepseek-r1-distill-llama-70b',
  'mixtral-8x7b-32768',
];

export const fetchAvailableGroqModels = async (groqApiKey: string): Promise<string[]> => {
  if (!groqApiKey || groqApiKey.trim() === '') return DEFAULT_GROQ_MODELS;
  try {
    const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });
    const modelsList = await groq.models.list();
    const activeModels = modelsList.data
      .map((m) => m.id)
      .filter((id) => !id.includes('whisper') && !id.includes('guard') && !id.includes('vision') && !id.includes('embed'));
    return activeModels.length > 0 ? activeModels : DEFAULT_GROQ_MODELS;
  } catch (err) {
    console.warn('No se pudieron obtener los modelos de la API de Groq, usando la lista predeterminada:', err);
    return DEFAULT_GROQ_MODELS;
  }
};

export const generateGroqCoachAnalysis = async (
  matches: MatchDetail[],
  targetRank: TargetRank,
  groqApiKey: string,
  groqModel?: string
): Promise<AIAnalysisReport> => {
  if (!groqApiKey || groqApiKey.trim() === '') {
    throw new Error('Groq API Key no configurada. Ingrésala en el panel de Configuración de la aplicación.');
  }

  const groq = new Groq({
    apiKey: groqApiKey,
    dangerouslyAllowBrowser: true,
  });

  const preferredModel = groqModel && groqModel.trim() !== '' ? groqModel.trim() : 'llama-3.3-70b-versatile';
  
  // Deduplicated list of models to try (preferred first, then fallbacks)
  const candidateModels = Array.from(
    new Set([preferredModel, 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant', ...DEFAULT_GROQ_MODELS])
  );

  const benchmark = getBenchmarkForRank(targetRank);

  // Compute aggregate statistics
  const totalMatches = matches.length;
  const wins = matches.filter((m) => m.targetSummoner.win).length;
  const winRate = Math.round((wins / totalMatches) * 100);

  const avgKDA = Number(
    (matches.reduce((acc, m) => acc + m.targetSummoner.kda, 0) / totalMatches).toFixed(2)
  );

  const avgCS = Number(
    (matches.reduce((acc, m) => acc + m.targetSummoner.csPerMin, 0) / totalMatches).toFixed(1)
  );

  const avgVision = Number(
    (
      matches.reduce((acc, m) => acc + (m.targetSummoner.visionScore / (m.gameDuration / 60)), 0) /
      totalMatches
    ).toFixed(2)
  );

  const avgDamage = Math.round(
    matches.reduce((acc, m) => acc + m.targetSummoner.totalDamageDealtToChampions, 0) / totalMatches
  );

  const avgDeathsEarly = Number(
    (
      matches.reduce((acc, m) => acc + (m.timelineHighlights?.deathsBefore15 || 0), 0) / totalMatches
    ).toFixed(1)
  );

  const matchSummaries = matches.map((m, idx) => ({
    game: idx + 1,
    champion: m.targetSummoner.championName,
    role: m.targetSummoner.teamPosition,
    result: m.targetSummoner.win ? 'Victoria' : 'Derrota',
    kda: `${m.targetSummoner.kills}/${m.targetSummoner.deaths}/${m.targetSummoner.assists} (KDA: ${m.targetSummoner.kda})`,
    csPerMin: m.targetSummoner.csPerMin,
    damage: m.targetSummoner.totalDamageDealtToChampions,
    visionScore: m.targetSummoner.visionScore,
    opponentChampion: m.laneOpponent?.championName || 'Desconocido',
    opponentKDA: m.laneOpponent ? `${m.laneOpponent.kills}/${m.laneOpponent.deaths}/${m.laneOpponent.assists}` : 'N/A',
    opponentCSPerMin: m.laneOpponent?.csPerMin || 'N/A',
    timeline: {
      csAt10: m.timelineHighlights?.csAt10,
      csAt15: m.timelineHighlights?.csAt15,
      deathsBefore15: m.timelineHighlights?.deathsBefore15,
      firstDeathMin: m.timelineHighlights?.firstDeathTimeMin || 'Ninguna',
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

  let lastError: any = null;

  for (const modelToUse of candidateModels) {
    try {
      console.log(`Intentando análisis con modelo Groq: ${modelToUse}...`);
      const completion = await groq.chat.completions.create({
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
      });

      const responseContent = completion.choices[0]?.message?.content || '';
      const parsedReport: AIAnalysisReport = JSON.parse(responseContent);
      return parsedReport;
    } catch (error: any) {
      console.warn(`El modelo ${modelToUse} falló:`, error?.message || error);
      lastError = error;
      // If error is not model specific (e.g., authentication or quota), don't retry endlessly
      if (error?.status === 401 || error?.message?.includes('Invalid API Key') || error?.message?.includes('API key')) {
        throw new Error(`Groq API Key inválida: ${error.message}`);
      }
    }
  }

  throw new Error(
    `Error en el servicio de Coaching con Groq AI (Modelos probados: ${candidateModels.join(', ')}): ${
      lastError?.message || lastError || 'Error desconocido'
    }`
  );
};
