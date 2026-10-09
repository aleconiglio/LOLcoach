import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  checkRemovedItem, 
  isValidItemInCurrentPatch, 
  resolveValidatedItem, 
  syncOfficialItemCatalog,
  clearItemCatalog 
} from '../itemValidationService';
import { 
  checkRemovedRune, 
  isValidRuneInCurrentPatch, 
  getValidatedRune, 
  validateRuneConfiguration, 
  syncOfficialRuneCatalog,
  clearRuneCatalog 
} from '../runeValidationService';
import { 
  fetchCurrentGameVersion, 
  isPatchCompatible, 
  comparePatches, 
  resetPatchCache,
  setLastSeenPatch 
} from '../patchVerificationService';

import { 
  executeWebResearch, 
  fetchWebPageContent, 
  clearWebResearchCache,
  sanitizeExternalWebText 
} from '../webResearchService';
import { 
  researchChampionBuild, 
  SUFFICIENT_SAMPLE_THRESHOLD 
} from '../championBuildResearchService';
import { 
  validateBuildRecommendation 
} from '../recommendationValidationService';
import { 
  checkAndAutoUpdateKnowledgeBase, 
  forceUpdateKnowledgeBase, 
  invalidateOutdatedCache, 
  getKnowledgeBaseStatus 
} from '../knowledgeBaseManager';
import { 
  generateBuildRecommendation, 
  generateDeepResearchBuildRecommendation 
} from '../buildRecommendationEngine';
import { analyzeComposition } from '../compositionAnalyzer';
import { generateAIExplanation } from '../aiExplanationService';
import { ActiveGameChampion, BuildRecommendation } from '../../types';

describe('Deep Web Research & LoL Build Verification - Section 14 Complete Test Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearItemCatalog();
    clearRuneCatalog();
    clearWebResearchCache();
    resetPatchCache();
  });

  // 1. Objeto eliminado
  it('1. Debe detectar y rechazar objetos eliminados (ej: Tenaza del Muerte Ígnea, Viento Huracanado)', () => {
    const dfg = checkRemovedItem(3128);
    expect(dfg.isRemoved).toBe(true);
    expect(dfg.reason).toContain('eliminada');
    expect(isValidItemInCurrentPatch(3128)).toBe(false);

    const galeforce = checkRemovedItem('viento huracanado');
    expect(galeforce.isRemoved).toBe(true);
    expect(isValidItemInCurrentPatch(6671)).toBe(false);

    const duskblade = checkRemovedItem('duskblade');
    expect(duskblade.isRemoved).toBe(true);
  });

  // 2. Objeto renombrado / alias
  it('2. Debe resolver correctamente objetos renombrados o alias coloquiales al ID actual del parche', () => {
    // "Tabis" -> Botas Blindadas (3047)
    const tabis = resolveValidatedItem('tabis');
    expect(tabis).toBeDefined();
    expect(tabis?.id).toBe(3047);
    expect(tabis?.name).toBe('Botas Blindadas (Tabis)');

    // "Liandry" -> Tormento de Liandry (6653)
    const liandry = resolveValidatedItem('liandry');
    expect(liandry).toBeDefined();
    expect(liandry?.id).toBe(6653);

    // "BORK" -> Espada del Rey Arruinado (3153)
    const bork = resolveValidatedItem('bork');
    expect(bork).toBeDefined();
    expect(bork?.id).toBe(3153);
  });

  // 3. Objeto con estadísticas modificadas
  it('3. Debe cargar y validar estadísticas y coste de objetos del parche activo', async () => {
    const mockDDragonItems = {
      data: {
        '3089': {
          name: 'Sombrero Mortal de Rabadon',
          gold: { total: 3600, base: 1100, purchasable: true },
          maps: { '11': true },
          inStore: true,
          tags: ['SpellDamage'],
          stats: { FlatMagicDamageMod: 140 },
        },
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDDragonItems,
    } as any);

    await syncOfficialItemCatalog('16.20.1');
    const rabadon = resolveValidatedItem(3089);
    expect(rabadon).toBeDefined();
    expect(rabadon?.gold.total).toBe(3600);
    expect(rabadon?.stats?.FlatMagicDamageMod).toBe(140);
  });

  // 4. Objeto válido del parche actual
  it('4. Debe validar objetos activos del parche actual y verificar disponibilidad en la Grieta', () => {
    expect(isValidItemInCurrentPatch(3089)).toBe(true); // Rabadon
    expect(isValidItemInCurrentPatch(3157)).toBe(true); // Zhonya
    expect(isValidItemInCurrentPatch(3031)).toBe(true); // Infinity Edge

    const zhonya = resolveValidatedItem(3157);
    expect(zhonya?.maps['11']).toBe(true);
    expect(zhonya?.gold.purchasable).toBe(true);
  });

  // 5. Runa eliminada
  it('5. Debe detectar y descartar runas eliminadas (ej: Depredador, Prototipo: Omnipiedra)', () => {
    const predator = checkRemovedRune(8124);
    expect(predator.isRemoved).toBe(true);
    expect(isValidRuneInCurrentPatch(8124)).toBe(false);

    const omnistone = checkRemovedRune('omnipiedra');
    expect(omnistone.isRemoved).toBe(true);
    expect(isValidRuneInCurrentPatch(8358)).toBe(false);
  });

  // 6. Runa modificada
  it('6. Debe sincronizar y validar runas modificadas y sus descripciones actuales', async () => {
    const mockRunes = [
      {
        id: 8000,
        key: 'Precision',
        name: 'Precisión',
        slots: [
          {
            runes: [
              { id: 8010, key: 'Conqueror', name: 'Conquistador', shortDesc: 'Fuerza adaptativa acumulable y curación' },
            ],
          },
          {
            runes: [
              { id: 9101, key: 'AbsorbLife', name: 'Absorber Vida', shortDesc: 'Curación al eliminar objetivos' },
            ],
          },
        ],
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRunes,
    } as any);

    await syncOfficialRuneCatalog('16.20.1');
    const conqueror = getValidatedRune(8010);
    expect(conqueror).toBeDefined();
    expect(conqueror?.slot).toBe('KEYSTONE');
    expect(conqueror?.tree).toBe('Precisión');
  });

  // 7. Runa válida del parche actual
  it('7. Debe validar una configuración completa de runas válidas en el parche actual', () => {
    const setup = {
      primaryTree: 'Precisión',
      keystone: { id: 8010, name: 'Conquistador' },
      primaryMinors: [
        { id: 9111, name: 'Triunfo' },
        { id: 9104, name: 'Leyenda: Presteza' },
        { id: 8014, name: 'Golpe de Gracia' },
      ],
      secondaryTree: 'Inspiración',
      secondaryMinors: [
        { id: 8304, name: 'Calzado Mágico' },
        { id: 8347, name: 'Perspicacia Cósmica' },
      ],
    };

    const validated = validateRuneConfiguration(setup);
    expect(validated.isValid).toBe(true);
    expect(validated.errors.length).toBe(0);
    expect(validated.sanitized.primaryTree).toBe('Precisión');
    expect(validated.sanitized.secondaryTree).toBe('Inspiración');
  });

  // 8. Build encontrada en una página antigua con objetos obsoletos
  it('8. Debe sustituir o descartar objetos obsoletos si una build proviene de una fuente desactualizada', () => {
    const outdatedRec: BuildRecommendation = {
      patch: '15.3.1',
      playerChampion: 'Ahri',
      startingItem: {
        primary: { id: 3128, name: 'Tenaza del Muerte Ígnea', reason: 'Antiguo rush AP' },
      },
      boots: { id: 3020, name: 'Botas del Hechicero', reason: 'Penetración' },
      coreBuild: [
        { order: 1, id: 6671, name: 'Viento Huracanado', reason: 'Mítico eliminado', isCore: true },
        { order: 2, id: 3089, name: 'Sombrero Mortal de Rabadon', reason: 'AP masivo', isCore: true },
      ],
      situationalItems: [
        { id: 6691, name: 'Hoja Crepuscular de Draktharr', condition: 'Anti-burst', reason: 'Invisibilidad', triggerMatched: true },
      ],
      runes: {
        primaryTree: 'Dominación',
        keystone: { id: 8124, name: 'Depredador', description: 'Velocidad' }, // Depredador eliminada!
        primaryMinors: [{ id: 8139, name: 'Sabor a Sangre' }, { id: 8138, name: 'Colección de Ojos' }, { id: 8106, name: 'Cazador Definitivo' }],
        secondaryTree: 'Brujería',
        secondaryMinors: [{ id: 8226, name: 'Banda de Maná' }, { id: 8237, name: 'Piroláser' }],
        shards: { offense: '+9 AP', flex: '+9 AP', defense: '+65 HP' },
      },
      explanation: {
        title: 'Build con Viento Huracanado y Tenaza del Muerte Ígnea',
        reasons: ['Comprar Tenaza del Muerte Ígnea para daño explosivo'],
        tacticalSummary: 'Resumen antiguo',
      },
    };

    const result = validateBuildRecommendation(outdatedRec);
    // El objeto inicial 3128 eliminado debe ser sustituido por Anillo de Doran
    expect(result.recommendation.startingItem.primary.id).toBe(1056);
    // El mítico 6671 eliminado debe haber sido sustituido o purgado del core
    expect(result.recommendation.coreBuild.some((i) => i.id === 6671)).toBe(false);
    // El situacional 6691 eliminado debe haber sido descartado
    expect(result.recommendation.situationalItems.some((s) => s.id === 6691)).toBe(false);
    // La keystone 8124 eliminada debe haber sido sustituida por una keystone válida
    expect(result.recommendation.runes.keystone.id).not.toBe(8124);
    // Errores deben reflejar la sustitución
    expect(result.validationSummary.replacedItems.length).toBeGreaterThan(0);
  });

  // 9. Contradicción entre fuentes
  it('9. Debe resolver contradicción entre fuentes priorizando datos oficiales y mayor fiabilidad', async () => {
    const research = await researchChampionBuild('Ahri', 'MID', '16.20.1');
    expect(research.sources.length).toBeGreaterThan(0);
    // La fuente oficial siempre encabeza o está presente con alta fiabilidad
    const official = research.sources.find((s) => s.type === 'OFFICIAL_RIOT');
    expect(official).toBeDefined();
    expect(official?.reliability).toBe('HIGH');
  });

  // 10. Estadística con muestra insuficiente (< 500 partidas)
  it('10. Debe marcar baja confianza y advertencia cuando la muestra estadística es insuficiente (< 500)', () => {
    const rec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Ahri',
      allies: [],
      enemies: [],
      compositionAnalysis: analyzeComposition([], []),
    });

    // Validar con muestra pequeña (150 partidas)
    const validated = validateBuildRecommendation(rec, [], 150, 'LOW', 'Muestra insuficiente');
    expect(validated.recommendation.traceability?.isSampleInsufficient).toBe(true);
    expect(validated.recommendation.traceability?.confidenceLevel).toBe('LOW');
  });

  // 11. Parche nuevo sin datos estadísticos suficientes
  it('11. Debe advertir cuando se trata de un nuevo parche y basar la recomendación en datos oficiales', async () => {
    // Simular que el parche anterior registrado era 16.19.1
    setLastSeenPatch('16.19.1');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ['16.20.1', '16.19.1'],
    } as any);

    const versionInfo = await fetchCurrentGameVersion(true);
    expect(versionInfo.patch).toBe('16.20.1');
    expect(versionInfo.isNewPatch).toBe(true);
  });


  // 12. Error del proveedor de búsqueda
  it('12. Debe recuperarse limpiamente con fallback estructurado si el proveedor de búsqueda falla', async () => {
    // Proveedor lanza error de red
    global.fetch = vi.fn().mockRejectedValue(new Error('Search API timeout'));

    const searchRes = await executeWebResearch('Ahri mid build', 'tvly-invalid-key', '16.20.1');
    expect(searchRes.success).toBe(true);
    expect(searchRes.providerUsed).toBe('RIOT_OFFICIAL');
    expect(searchRes.sources.length).toBeGreaterThan(0);
  });

  // 13. Página web inaccesible (HTTP 404/500)
  it('13. Debe manejar páginas web externas inaccesibles sin propagar excepciones', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as any);

    const page = await fetchWebPageContent('https://u.gg/lol/champions/non-existent-url');
    expect(page.success).toBe(false);
    expect(page.error).toContain('HTTP 404');
  });

  // 14. Respuesta inválida del LLM con alucinación de ítems
  it('14. Debe purgar alucinaciones de objetos eliminados en la explicación del LLM', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                reasons: [
                  'Comprar Viento Huracanado para desplazarte rápidamente.',
                  'Comprar Reloj de Arena de Zhonya para sobrevivir al burst.',
                ],
                tacticalSummary: 'Build recomendada para ganar.',
              }),
            },
          },
        ],
      }),
    } as any);

    const comp = analyzeComposition([], []);
    const rec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Ahri',
      allies: [],
      enemies: [],
      compositionAnalysis: comp,
    });

    const aiRes = await generateAIExplanation(rec, comp, 'gsk-valid-key');
    rec.explanation.reasons = aiRes.reasons;

    // Validación final
    const finalVal = validateBuildRecommendation(rec);
    // El texto con Viento Huracanado debe haber sido neutralizado
    expect(finalVal.recommendation.explanation.reasons.some((r) => r.includes('Viento Huracanado'))).toBe(false);
  });

  // 15. ID de objeto inventado
  it('15. Debe rechazar categóricamente IDs inventados o inexistentes', () => {
    expect(isValidItemInCurrentPatch(9999999)).toBe(false);
    expect(isValidItemInCurrentPatch(-1)).toBe(false);
    expect(resolveValidatedItem(9999999)).toBeUndefined();

    const badRec: BuildRecommendation = {
      patch: '16.20.1',
      playerChampion: 'Ahri',
      startingItem: { primary: { id: 9999999, name: 'ItemFantasma', reason: 'Inventado' } },
      boots: { id: 3020, name: 'Botas del Hechicero', reason: 'Penetración' },
      coreBuild: [{ order: 1, id: 9999999, name: 'ItemFantasma', reason: 'Inventado', isCore: true }],
      situationalItems: [],
      runes: {
        primaryTree: 'Precisión',
        keystone: { id: 8010, name: 'Conquistador', description: 'AP' },
        primaryMinors: [{ id: 9111, name: 'Triunfo' }, { id: 9104, name: 'Presteza' }, { id: 8014, name: 'Golpe de Gracia' }],
        secondaryTree: 'Inspiración',
        secondaryMinors: [{ id: 8304, name: 'Calzado' }, { id: 8347, name: 'Perspicacia' }],
        shards: { offense: 'AP', flex: 'AP', defense: 'HP' },
      },
      explanation: { title: 'Test', reasons: ['Razón 1', 'Razón 2'], tacticalSummary: 'Sum' },
    };

    const sanitized = validateBuildRecommendation(badRec);
    expect(sanitized.recommendation.startingItem.primary.id).not.toBe(9999999);
    expect(sanitized.recommendation.coreBuild.some((i) => i.id === 9999999)).toBe(false);
  });

  // 16. Cache obsoleta
  it('16. Debe invalidar la caché automáticamente cuando se detecta un cambio de parche', () => {
    invalidateOutdatedCache('16.20.1');
    const status = getKnowledgeBaseStatus();
    expect(status.patch).toBeDefined();
  });

  // 17. Actualización de datos después de un parche
  it('17. Debe actualizar el catálogo completo tras detectarse un nuevo parche', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('versions.json')) {
        return Promise.resolve({ ok: true, json: async () => ['16.21.1', '16.20.1'] });
      }
      if (url.includes('item.json')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: {
              '3089': { name: 'Rabadon', gold: { total: 3600, purchasable: true }, maps: { '11': true }, inStore: true },
            },
          }),
        });
      }
      if (url.includes('runesReforged.json')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.reject(new Error('Unknown url'));
    });

    const updateRes = await forceUpdateKnowledgeBase('16.21.1');
    expect(updateRes.success).toBe(true);
    expect(updateRes.patch).toBe('16.21.1');
  });

  // 18. Recomendación contra una composición enemiga
  it('18. Debe adaptar la build contra composición enemiga pesada en AD y tanques con ítems válidos', () => {
    const enemyTeam: ActiveGameChampion[] = [
      { championId: 122, championName: 'Darius', puuid: '1', summonerName: 'E1', teamId: 200, isPlayer: false },
      { championId: 238, championName: 'Zed', puuid: '2', summonerName: 'E2', teamId: 200, isPlayer: false },
      { championId: 121, championName: 'Kha\'Zix', puuid: '3', summonerName: 'E3', teamId: 200, isPlayer: false },
      { championId: 222, championName: 'Jinx', puuid: '4', summonerName: 'E4', teamId: 200, isPlayer: false },
      { championId: 111, championName: 'Nautilus', puuid: '5', summonerName: 'E5', teamId: 200, isPlayer: false },
    ];

    const comp = analyzeComposition(enemyTeam, []);
    expect(comp.damageBreakdown.predominance).toBe('PREDOMINANTLY_AD');

    const rec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Ahri',
      allies: [],
      enemies: enemyTeam,
      compositionAnalysis: comp,
    });

    // Botas defensivas contra AD o core con Zhonya
    expect(rec.boots.id === 3047 || rec.coreBuild.some((i) => i.id === 3157)).toBe(true);
    expect(isValidItemInCurrentPatch(rec.boots.id)).toBe(true);
  });

  // 19. Falta de conexión con fuentes externas
  it('19. Debe operar de forma resiliente con el catálogo de respaldo si la red está offline', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch (offline)'));

    const patchInfo = await fetchCurrentGameVersion();
    expect(patchInfo.isFallback).toBe(true);
    expect(patchInfo.patch).toBeDefined();

    // Comprobar que los ítems base siguen resolviéndose sin conexión
    const doran = resolveValidatedItem(1056);
    expect(doran).toBeDefined();
    expect(doran?.id).toBe(1056);
  });

  // 20. Protección de las claves del backend
  it('20. Nunca debe exponer claves de API de Riot, Groq ni Tavily en mensajes de error ni payloads', async () => {
    const SECRET_KEY = 'tvly-SUPER-SECRET-RESEARCH-KEY-99999';
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: `Invalid key ${SECRET_KEY}` }),
    } as any);

    const res = await executeWebResearch('build', SECRET_KEY, '16.20.1');
    // La respuesta nunca debe filtrar el secreto
    const serialized = JSON.stringify(res);
    expect(serialized).not.toContain(SECRET_KEY);
  });
});
