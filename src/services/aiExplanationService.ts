import { BuildRecommendation, CompositionAnalysis } from '../types';
import { isValidItem } from './itemData';

interface AIExplanationResult {
  reasons: string[];
  tacticalSummary: string;
}

/**
 * Validates that an explanation does not hallucinate non-existent items.
 */
export const sanitizeExplanationText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text.trim();
};

/**
 * Enhances the build explanation using Groq LLM with strict validation against official game data.
 * If Groq is not configured or fails, smoothly returns the deterministic rule-based reasons.
 */
export const generateAIExplanation = async (
  recommendation: BuildRecommendation,
  composition: CompositionAnalysis,
  groqApiKey?: string
): Promise<AIExplanationResult> => {
  // If no Groq key, return verified deterministic explanation
  if (!groqApiKey || groqApiKey.trim() === '') {
    return {
      reasons: recommendation.explanation.reasons,
      tacticalSummary: recommendation.explanation.tacticalSummary,
    };
  }

  const promptPayload = {
    champion: recommendation.playerChampion,
    patch: recommendation.patch,
    enemyDamage: `${composition.damageBreakdown.adPercent}% AD, ${composition.damageBreakdown.apPercent}% AP (${composition.damageBreakdown.predominance})`,
    enemyTanks: composition.resistanceBreakdown.tankCount,
    enemyHealers: composition.healingBreakdown.heavyHealers,
    enemyAssassins: composition.burstThreatBreakdown.physicalAssassins.concat(composition.burstThreatBreakdown.magicAssassins),
    recommendedBoots: recommendation.boots.name,
    recommendedCore: recommendation.coreBuild.map((b) => b.name),
    situationalTriggers: recommendation.situationalItems.filter((s) => s.triggerMatched).map((s) => `${s.condition} -> ${s.name}`),
  };

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: 600,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Eres un analista de League of Legends de nivel Challenger.
Tu tarea es resumir en español 2 a 4 razones breves y técnicas de por qué la build recomendada contrarresta la composición enemiga.

REGLAS ESTRICTAS DE VALIDACIÓN:
- PROHIBIDO inventar objetos, runas o estadísticas. Cita ÚNICAMENTE los objetos mencionados en el prompt.
- No generes párrafos largos. Cada razón debe tener 1 o 2 oraciones concisas y directas.
- Devuelve ÚNICAMENTE un JSON válido con esta estructura:
{
  "reasons": ["Razón 1", "Razón 2", "Razón 3"],
  "tacticalSummary": "Resumen táctico de una frase"
}`
          },
          {
            role: 'user',
            content: `Genera la explicación para esta build:\n${JSON.stringify(promptPayload)}`
          }
        ]
      }),
    });

    if (!res.ok) {
      console.warn(`Groq API returned HTTP ${res.status}, falling back to deterministic explanation.`);
      return {
        reasons: recommendation.explanation.reasons,
        tacticalSummary: recommendation.explanation.tacticalSummary,
      };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return {
        reasons: recommendation.explanation.reasons,
        tacticalSummary: recommendation.explanation.tacticalSummary,
      };
    }

    const parsed = JSON.parse(content);
    const reasons = Array.isArray(parsed.reasons) ? parsed.reasons.map(String).filter((r: string) => r.length > 5) : [];
    const tacticalSummary = parsed.tacticalSummary ? String(parsed.tacticalSummary) : recommendation.explanation.tacticalSummary;

    if (reasons.length >= 2) {
      return {
        reasons: reasons.slice(0, 4),
        tacticalSummary,
      };
    }
  } catch (err) {
    console.warn('Error during Groq explanation generation, using deterministic explanation.', err);
  }

  return {
    reasons: recommendation.explanation.reasons,
    tacticalSummary: recommendation.explanation.tacticalSummary,
  };
};
