import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateBuildRecommendation } from '../buildRecommendationEngine';
import { analyzeComposition } from '../compositionAnalyzer';
import { validateBuildRecommendation } from '../recommendationValidationService';
import { generateAIExplanation } from '../aiExplanationService';
import { 
  getChampionProfile, 
  evaluateAndScoreCandidateItem,
  filterC_ChampionCompatibility,
  ITEM_PROFILES 
} from '../championCompatibilityService';
import { resolveChampionInfo, getChampionIconUrl } from '../championData';
import { ActiveGameChampion, BuildRecommendation } from '../../types';

describe('Corrección Crítica del Motor de Builds - 10 Casos Obligatorios + Resolución de Campeones', () => {

  // Caso 1: Darius contra una composición con mucha resistencia mágica
  it('Caso 1: Darius contra composición con mucha MR no debe recomendar Báculo del Vacío ni penetración mágica', () => {
    const mrEnemies: ActiveGameChampion[] = [
      { championId: 3, championName: 'Galio', puuid: '1', summonerName: 'E1', teamId: 200, isPlayer: false },
      { championId: 516, championName: 'Ornn', puuid: '2', summonerName: 'E2', teamId: 200, isPlayer: false },
      { championId: 98, championName: 'Shen', puuid: '3', summonerName: 'E3', teamId: 200, isPlayer: false },
      { championId: 222, championName: 'Jinx', puuid: '4', summonerName: 'E4', teamId: 200, isPlayer: false },
      { championId: 201, championName: 'Braum', puuid: '5', summonerName: 'E5', teamId: 200, isPlayer: false },
    ];

    const comp = analyzeComposition(mrEnemies, []);
    expect(comp.resistanceBreakdown.highResistanceThreats.length).toBeGreaterThan(0);

    const rec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Darius',
      allies: [],
      enemies: mrEnemies,
      compositionAnalysis: comp,
    });

    // Darius MUST NOT be recommended Void Staff (3135) or Cryptbloom (3137)
    const hasVoidStaff = rec.situationalItems.some((s) => s.id === 3135);
    const hasCryptbloom = rec.situationalItems.some((s) => s.id === 3137);
    expect(hasVoidStaff).toBe(false);
    expect(hasCryptbloom).toBe(false);

    // Filter C check
    const dariusProfile = getChampionProfile('Darius');
    const voidStaffProfile = ITEM_PROFILES[3135];
    const compatResult = filterC_ChampionCompatibility(dariusProfile, voidStaffProfile);
    expect(compatResult.allowed).toBe(false);
    expect(compatResult.reason).toContain('Darius');
  });

  // Caso 2: Darius contra varios tanques
  it('Caso 2: Darius contra varios tanques evalúa Cuchilla Negra / BORK y NUNCA Tormento de Liandry', () => {
    const tankEnemies: ActiveGameChampion[] = [
      { championId: 31, championName: 'Cho\'Gath', puuid: '1', summonerName: 'E1', teamId: 200, isPlayer: false },
      { championId: 14, championName: 'Sion', puuid: '2', summonerName: 'E2', teamId: 200, isPlayer: false },
      { championId: 32, championName: 'Amumu', puuid: '3', summonerName: 'E3', teamId: 200, isPlayer: false },
      { championId: 222, championName: 'Jinx', puuid: '4', summonerName: 'E4', teamId: 200, isPlayer: false },
      { championId: 12, championName: 'Alistar', puuid: '5', summonerName: 'E5', teamId: 200, isPlayer: false },
    ];

    const comp = analyzeComposition(tankEnemies, []);
    expect(comp.resistanceBreakdown.tankCount).toBeGreaterThanOrEqual(2);

    const rec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Darius',
      allies: [],
      enemies: tankEnemies,
      compositionAnalysis: comp,
    });

    // Liandry (6653) is strictly forbidden on Darius
    expect(rec.situationalItems.some((s) => s.id === 6653)).toBe(false);
    expect(rec.coreBuild.some((c) => c.id === 6653)).toBe(false);

    // Recommended anti-tank items for Darius must be physical / bruiser oriented
    const hasBlackCleaver = rec.situationalItems.some((s) => s.id === 3071) || rec.coreBuild.some((c) => c.id === 3071);
    expect(hasBlackCleaver).toBe(true);
  });

  // Caso 3: Darius contra mucho daño físico
  it('Caso 3: Darius contra mucho daño físico evalúa Danza de la Muerte / Randuin / Coraza / Sterak y NUNCA Zhonya', () => {
    const adEnemies: ActiveGameChampion[] = [
      { championId: 238, championName: 'Zed', puuid: '1', summonerName: 'E1', teamId: 200, isPlayer: false },
      { championId: 121, championName: 'Kha\'Zix', puuid: '2', summonerName: 'E2', teamId: 200, isPlayer: false },
      { championId: 119, championName: 'Draven', puuid: '3', summonerName: 'E3', teamId: 200, isPlayer: false },
      { championId: 555, championName: 'Pyke', puuid: '4', summonerName: 'E4', teamId: 200, isPlayer: false },
      { championId: 64, championName: 'Lee Sin', puuid: '5', summonerName: 'E5', teamId: 200, isPlayer: false },
    ];

    const comp = analyzeComposition(adEnemies, []);
    expect(comp.damageBreakdown.adPercent).toBeGreaterThanOrEqual(60);

    const rec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Darius',
      allies: [],
      enemies: adEnemies,
      compositionAnalysis: comp,
    });

    // Zhonya (3157) must NEVER be recommended to Darius
    expect(rec.situationalItems.some((s) => s.id === 3157)).toBe(false);
    expect(rec.coreBuild.some((c) => c.id === 3157)).toBe(false);

    // Check bruiser/tank defensive items
    const hasBruiserDefensive = rec.situationalItems.some((s) => 
      [6333, 3143, 3742, 3053].includes(s.id)
    );
    expect(hasBruiserDefensive).toBe(true);

    // Tabis (3047) should be recommended as boots against 100% AD
    expect(rec.boots.id).toBe(3047);
  });

  // Caso 4: Darius contra mucha curación
  it('Caso 4: Darius contra mucha curación evalúa Cota de Espinas / Espada-Sierra Quimopúnica y NUNCA Morellonomicón', () => {
    const healEnemies: ActiveGameChampion[] = [
      { championId: 266, championName: 'Aatrox', puuid: '1', summonerName: 'E1', teamId: 200, isPlayer: false },
      { championId: 16, championName: 'Soraka', puuid: '2', summonerName: 'E2', teamId: 200, isPlayer: false },
      { championId: 8, championName: 'Vladimir', puuid: '3', summonerName: 'E3', teamId: 200, isPlayer: false },
      { championId: 222, championName: 'Jinx', puuid: '4', summonerName: 'E4', teamId: 200, isPlayer: false },
      { championId: 19, championName: 'Warwick', puuid: '5', summonerName: 'E5', teamId: 200, isPlayer: false },
    ];

    const comp = analyzeComposition(healEnemies, []);
    expect(comp.healingBreakdown.needGrievousWounds).toBe('URGENT');

    const rec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Darius',
      allies: [],
      enemies: healEnemies,
      compositionAnalysis: comp,
    });

    // Morellonomicon (3165) is strictly forbidden
    expect(rec.situationalItems.some((s) => s.id === 3165)).toBe(false);

    // Recommended anti-heal must be Thornmail (3075) or Chempunk (6609)
    const hasValidAntiHeal = rec.situationalItems.some((s) => s.id === 3075 || s.id === 6609);
    expect(hasValidAntiHeal).toBe(true);
  });

  // Caso 5: Un mago de daño sostenido contra varios tanques
  it('Caso 5: Un mago de daño sostenido (Cassiopeia / Brand) contra tanques sí puede recibir Tormento de Liandry y Báculo del Vacío', () => {
    const tankEnemies: ActiveGameChampion[] = [
      { championId: 31, championName: 'Cho\'Gath', puuid: '1', summonerName: 'E1', teamId: 200, isPlayer: false },
      { championId: 14, championName: 'Sion', puuid: '2', summonerName: 'E2', teamId: 200, isPlayer: false },
      { championId: 32, championName: 'Amumu', puuid: '3', summonerName: 'E3', teamId: 200, isPlayer: false },
      { championId: 222, championName: 'Jinx', puuid: '4', summonerName: 'E4', teamId: 200, isPlayer: false },
      { championId: 12, championName: 'Alistar', puuid: '5', summonerName: 'E5', teamId: 200, isPlayer: false },
    ];

    const comp = analyzeComposition(tankEnemies, []);

    const rec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Cassiopeia',
      allies: [],
      enemies: tankEnemies,
      compositionAnalysis: comp,
    });

    // For Cassiopeia (AP mage), Liandry (6653) and Void Staff (3135) ARE valid
    const hasLiandry = rec.coreBuild.some((c) => c.id === 6653) || rec.situationalItems.some((s) => s.id === 6653);
    const hasVoidStaff = rec.coreBuild.some((c) => c.id === 3135) || rec.situationalItems.some((s) => s.id === 3135);
    expect(hasLiandry || hasVoidStaff).toBe(true);
  });

  // Caso 6: Un campeón de daño físico frente a mucha resistencia mágica
  it('Caso 6: Un campeón de daño físico (Jinx / Zed) frente a mucha MR no confunde MR rival con necesidad de penetración mágica', () => {
    const mrEnemies: ActiveGameChampion[] = [
      { championId: 3, championName: 'Galio', puuid: '1', summonerName: 'E1', teamId: 200, isPlayer: false },
      { championId: 516, championName: 'Ornn', puuid: '2', summonerName: 'E2', teamId: 200, isPlayer: false },
      { championId: 98, championName: 'Shen', puuid: '3', summonerName: 'E3', teamId: 200, isPlayer: false },
      { championId: 222, championName: 'Jinx', puuid: '4', summonerName: 'E4', teamId: 200, isPlayer: false },
      { championId: 201, championName: 'Braum', puuid: '5', summonerName: 'E5', teamId: 200, isPlayer: false },
    ];

    const comp = analyzeComposition(mrEnemies, []);

    const jinxRec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Jinx',
      allies: [],
      enemies: mrEnemies,
      compositionAnalysis: comp,
    });

    expect(jinxRec.situationalItems.some((s) => s.id === 3135)).toBe(false);
    expect(jinxRec.situationalItems.some((s) => s.id === 3137)).toBe(false);

    const zedRec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Zed',
      allies: [],
      enemies: mrEnemies,
      compositionAnalysis: comp,
    });

    expect(zedRec.situationalItems.some((s) => s.id === 3135)).toBe(false);
  });

  // Caso 7: Objeto eliminado
  it('Caso 7: Objetos eliminados del parche actual (Galeforce, Divine Sunderer, Duskblade) son rechazados por Filter A y B', () => {
    const comp = analyzeComposition([], []);
    const dariusProfile = getChampionProfile('Darius');

    // Test evaluation of removed items
    const evalGaleforce = evaluateAndScoreCandidateItem(dariusProfile, 6671, comp, '16.20.1');
    expect(evalGaleforce.passesAllMandatoryFilters).toBe(false);
    expect(evalGaleforce.filterFailureReason).toMatch(/Filtro A|Filtro B/);

    const evalDuskblade = evaluateAndScoreCandidateItem(dariusProfile, 6691, comp, '16.20.1');
    expect(evalDuskblade.passesAllMandatoryFilters).toBe(false);

    const evalDivineSunderer = evaluateAndScoreCandidateItem(dariusProfile, 6632, comp, '16.20.1');
    expect(evalDivineSunderer.passesAllMandatoryFilters).toBe(false);
  });

  // Caso 8: Objeto existente pero incompatible
  it('Caso 8: Objetos oficiales existentes pero incompatibles (Rabadon o Zhonya en Darius) son rechazados por Filter C', () => {
    const comp = analyzeComposition([], []);
    const dariusProfile = getChampionProfile('Darius');

    // Rabadon (3089) exists, but is AP pure on Darius
    const evalRabadon = evaluateAndScoreCandidateItem(dariusProfile, 3089, comp, '16.20.1');
    expect(evalRabadon.passesAllMandatoryFilters).toBe(false);
    expect(evalRabadon.filterFailureReason).toContain('Filtro C (Compatibilidad)');

    // Zhonya (3157) exists, but is AP on Darius
    const evalZhonya = evaluateAndScoreCandidateItem(dariusProfile, 3157, comp, '16.20.1');
    expect(evalZhonya.passesAllMandatoryFilters).toBe(false);
    expect(evalZhonya.filterFailureReason).toContain('Filtro C (Compatibilidad)');

    // Banshee's Veil (3102) exists, but is AP on Darius
    const evalBanshee = evaluateAndScoreCandidateItem(dariusProfile, 3102, comp, '16.20.1');
    expect(evalBanshee.passesAllMandatoryFilters).toBe(false);
  });

  // Caso 9: Respuesta incorrecta o alucinada del LLM
  it('Caso 9: La validación rechaza alucinaciones del LLM y mantiene la build determinista verificada', async () => {
    const comp = analyzeComposition([], []);
    const rec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Darius',
      allies: [],
      enemies: [],
      compositionAnalysis: comp,
    });

    // Mock an LLM response containing hallucinated / removed items
    const hallucinatedLLM = {
      reasons: [
        'Debes comprar Tenaza del Muerte Ígnea para deletear al carry.',
        'Viento Huracanado te dará desplazamiento rápido.',
        'Cuchilla Negra desgastará la armadura enemiga.',
      ],
      tacticalSummary: 'Build recomendada con objetos míticos antiguos.',
    };

    const mockBadRecommendation: BuildRecommendation = {
      ...rec,
      explanation: {
        title: 'Build con alucinaciones',
        reasons: hallucinatedLLM.reasons,
        tacticalSummary: hallucinatedLLM.tacticalSummary,
      },
    };

    const validated = validateBuildRecommendation(mockBadRecommendation);

    // Removed items must be sanitized
    expect(validated.recommendation.explanation.reasons.some((r) => r.includes('Tenaza del Muerte Ígnea'))).toBe(false);
    expect(validated.recommendation.explanation.reasons.some((r) => r.includes('Viento Huracanado'))).toBe(false);
    expect(validated.validationSummary.errors.length).toBeGreaterThan(0);
  });

  // Caso 10: Ninguna opción válida / Opciones limitadas
  it('Caso 10: El sistema devuelve menos recomendaciones válidas en lugar de rellenar tarjetas con objetos incompatibles', () => {
    // Empty / low threat composition
    const peacefulEnemies: ActiveGameChampion[] = [
      { championId: 103, championName: 'Ahri', puuid: '1', summonerName: 'E1', teamId: 200, isPlayer: false },
    ];
    const comp = analyzeComposition(peacefulEnemies, []);

    const rec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Darius',
      allies: [],
      enemies: peacefulEnemies,
      compositionAnalysis: comp,
    });

    // Situational items must only contain valid, compatible items
    expect(rec.situationalItems.length).toBeLessThanOrEqual(6);
    rec.situationalItems.forEach((sit) => {
      const itemProfile = ITEM_PROFILES[sit.id];
      if (itemProfile) {
        const compat = filterC_ChampionCompatibility(getChampionProfile('Darius'), itemProfile);
        expect(compat.allowed).toBe(true);
      }
    });

    // Does NOT pad with AP items
    const hasApItem = rec.situationalItems.some((s) => [3135, 6653, 3165, 3157, 3102, 3089].includes(s.id));
    expect(hasApItem).toBe(false);
  });

  // Test adicional: Resolución segura de imágenes y nombres de nuevos campeones (Ambessa 799, Locke 805)
  it('Resolución de Campeones: Resuelve correctamente claves numéricas de Ambessa (799) y Locke (805)', () => {
    // 799 -> Ambessa
    const ambessaMeta = resolveChampionInfo(799);
    expect(ambessaMeta.name).toBe('Ambessa');
    expect(ambessaMeta.id).toBe('Ambessa');
    const ambessaIcon = getChampionIconUrl(799);
    expect(ambessaIcon).toContain('/img/champion/Ambessa.png');

    // 805 -> Locke
    const lockeMeta = resolveChampionInfo(805);
    expect(lockeMeta.name).toBe('Locke');
    expect(lockeMeta.id).toBe('Locke');
    const lockeIcon = getChampionIconUrl('805');
    expect(lockeIcon).toContain('/img/champion/Locke.png');

    // In BuildAdvisor UI fallback: ensure "805" string resolves to Locke
    const resolvedFromString = resolveChampionInfo('805');
    expect(resolvedFromString.name).toBe('Locke');
  });

});
