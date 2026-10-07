import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  analyzeComposition 
} from '../compositionAnalyzer';
import { 
  generateBuildRecommendation 
} from '../buildRecommendationEngine';
import { 
  getActiveGameData, 
  clearActiveGameCache, 
  getMockActiveGame 
} from '../activeGameService';
import { 
  fetchActiveGameByPuuid, 
  fetchLatestPatchVersion 
} from '../riotApi';
import { 
  isValidItem, 
  getItemById 
} from '../itemData';
import { 
  isValidRune, 
  getRuneById 
} from '../runeData';
import { 
  generateAIExplanation 
} from '../aiExplanationService';
import { ActiveGameChampion, RiotActiveGame } from '../../types';

describe('Build Advisor - Comprehensive Test Suite (21 Scenarios)', () => {
  beforeEach(() => {
    clearActiveGameCache();
    vi.restoreAllMocks();
  });

  // 1. No existe partida activa (HTTP 404)
  it('1. Debe manejar correctamente cuando no existe partida activa (HTTP 404)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ status: { message: 'Data not found', status_code: 404 } }),
    } as any);

    const result = await fetchActiveGameByPuuid('test-puuid', 'LAS', 'test-api-key');
    expect(result).toBeNull();
  });

  // 2. Partida activa encontrada
  it('2. Debe procesar correctamente cuando existe una partida activa', async () => {
    const mockRiotActiveGame: RiotActiveGame = {
      gameId: 123456789,
      gameType: 'MATCHED_GAME',
      gameStartTime: Date.now() - 60000,
      mapId: 11,
      gameLength: 60,
      platformId: 'LA2',
      gameMode: 'CLASSIC',
      bannedChampions: [],
      gameQueueConfigId: 420,
      participants: [
        { puuid: 'player-puuid', teamId: 100, championId: 103, spell1Id: 4, spell2Id: 14, bot: false },
        { puuid: 'ally-1', teamId: 100, championId: 266, spell1Id: 4, spell2Id: 12, bot: false },
        { puuid: 'ally-2', teamId: 100, championId: 64, spell1Id: 4, spell2Id: 11, bot: false },
        { puuid: 'ally-3', teamId: 100, championId: 222, spell1Id: 4, spell2Id: 7, bot: false },
        { puuid: 'ally-4', teamId: 100, championId: 412, spell1Id: 4, spell2Id: 14, bot: false },
        { puuid: 'enemy-1', teamId: 200, championId: 122, spell1Id: 4, spell2Id: 12, bot: false },
        { puuid: 'enemy-2', teamId: 200, championId: 234, spell1Id: 4, spell2Id: 11, bot: false },
        { puuid: 'enemy-3', teamId: 200, championId: 134, spell1Id: 4, spell2Id: 14, bot: false },
        { puuid: 'enemy-4', teamId: 200, championId: 145, spell1Id: 4, spell2Id: 7, bot: false },
        { puuid: 'enemy-5', teamId: 200, championId: 111, spell1Id: 4, spell2Id: 14, bot: false },
      ],
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('by-riot-id')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ puuid: 'player-puuid', gameName: 'Faker', tagLine: 'KR1' }),
        });
      }
      if (url.includes('spectator')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockRiotActiveGame,
        });
      }
      if (url.includes('versions.json')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ['15.3.1'],
        });
      }
      return Promise.reject(new Error('Unknown url'));
    });

    const activeGame = await getActiveGameData('Faker', 'KR1', 'KR', 'RGAPI-valid-key', false, true);
    expect(activeGame).not.toBeNull();
    expect(activeGame?.gameId).toBe(123456789);
    expect(activeGame?.playerChampion.championName).toBe('Ahri');
  });

  // 3. Identificación correcta del usuario por PUUID (no asumir índice 0)
  it('3. Debe identificar correctamente al usuario por su PUUID incluso si está en el índice 4', async () => {
    const mockRiotActiveGame: RiotActiveGame = {
      gameId: 987654,
      gameType: 'MATCHED_GAME',
      gameStartTime: Date.now(),
      mapId: 11,
      gameLength: 30,
      platformId: 'LA2',
      gameMode: 'CLASSIC',
      bannedChampions: [],
      gameQueueConfigId: 420,
      participants: [
        { puuid: 'random-player-1', teamId: 100, championId: 266, spell1Id: 4, spell2Id: 12, bot: false },
        { puuid: 'random-player-2', teamId: 100, championId: 64, spell1Id: 4, spell2Id: 11, bot: false },
        { puuid: 'random-player-3', teamId: 100, championId: 134, spell1Id: 4, spell2Id: 14, bot: false },
        { puuid: 'target-user-puuid', teamId: 100, championId: 222, spell1Id: 4, spell2Id: 7, bot: false }, // Jinx at index 3
        { puuid: 'random-player-4', teamId: 100, championId: 412, spell1Id: 4, spell2Id: 14, bot: false },
        { puuid: 'enemy-1', teamId: 200, championId: 122, spell1Id: 4, spell2Id: 12, bot: false },
        { puuid: 'enemy-2', teamId: 200, championId: 234, spell1Id: 4, spell2Id: 11, bot: false },
        { puuid: 'enemy-3', teamId: 200, championId: 103, spell1Id: 4, spell2Id: 14, bot: false },
        { puuid: 'enemy-4', teamId: 200, championId: 145, spell1Id: 4, spell2Id: 7, bot: false },
        { puuid: 'enemy-5', teamId: 200, championId: 111, spell1Id: 4, spell2Id: 14, bot: false },
      ],
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('by-riot-id')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ puuid: 'target-user-puuid', gameName: 'JinxMain', tagLine: 'LAS' }),
        });
      }
      if (url.includes('spectator')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockRiotActiveGame,
        });
      }
      return Promise.resolve({ ok: true, json: async () => ['15.3.1'] });
    });

    const activeGame = await getActiveGameData('JinxMain', 'LAS', 'LAS', 'RGAPI-test', false, true);
    expect(activeGame?.playerChampion.puuid).toBe('target-user-puuid');
    expect(activeGame?.playerChampion.championName).toBe('Jinx');
  });

  // 4. Identificación correcta de aliados (4 aliados)
  it('4. Debe separar exactamente 4 aliados del mismo equipo que el usuario', async () => {
    const game = getMockActiveGame('Player', 'Ahri');
    expect(game.allies).toHaveLength(4);
    game.allies.forEach((ally) => {
      expect(ally.teamId).toBe(game.playerChampion.teamId);
      expect(ally.isPlayer).toBe(false);
    });
  });

  // 5. Identificación correcta de enemigos (5 enemigos)
  it('5. Debe separar exactamente 5 enemigos del equipo rival', async () => {
    const game = getMockActiveGame('Player', 'Ahri');
    expect(game.enemies).toHaveLength(5);
    game.enemies.forEach((enemy) => {
      expect(enemy.teamId).not.toBe(game.playerChampion.teamId);
      expect(enemy.isPlayer).toBe(false);
    });
  });

  // 6. Composición predominantemente AD
  it('6. Debe detectar composición predominantemente AD y recomendar armadura/Tabis', () => {
    const adEnemies: ActiveGameChampion[] = [
      { championId: 122, championName: 'Darius', puuid: '1', summonerName: 'E1', teamId: 200, isPlayer: false },
      { championId: 238, championName: 'Zed', puuid: '2', summonerName: 'E2', teamId: 200, isPlayer: false },
      { championId: 121, championName: 'Kha\'Zix', puuid: '3', summonerName: 'E3', teamId: 200, isPlayer: false },
      { championId: 222, championName: 'Jinx', puuid: '4', summonerName: 'E4', teamId: 200, isPlayer: false },
      { championId: 875, championName: 'Sett', puuid: '5', summonerName: 'E5', teamId: 200, isPlayer: false },
    ];

    const comp = analyzeComposition(adEnemies, []);
    expect(comp.damageBreakdown.predominance).toBe('PREDOMINANTLY_AD');
    expect(comp.damageBreakdown.adPercent).toBeGreaterThanOrEqual(70);

    const rec = generateBuildRecommendation({
      patch: '15.3.1',
      playerChampion: 'Ahri',
      allies: [],
      enemies: adEnemies,
      compositionAnalysis: comp,
    });

    expect(rec.boots.name).toContain('Blindadas');
    expect(rec.coreBuild.some((i) => i.id === 3157)).toBe(true); // Zhonya
  });

  // 7. Composición predominantemente AP
  it('7. Debe detectar composición predominantemente AP y recomendar MR/Mercurio', () => {
    const apEnemies: ActiveGameChampion[] = [
      { championId: 134, championName: 'Syndra', puuid: '1', summonerName: 'E1', teamId: 200, isPlayer: false },
      { championId: 105, championName: 'Fizz', puuid: '2', summonerName: 'E2', teamId: 200, isPlayer: false },
      { championId: 60, championName: 'Elise', puuid: '3', summonerName: 'E3', teamId: 200, isPlayer: false },
      { championId: 63, championName: 'Brand', puuid: '4', summonerName: 'E4', teamId: 200, isPlayer: false },
      { championId: 82, championName: 'Mordekaiser', puuid: '5', summonerName: 'E5', teamId: 200, isPlayer: false },
    ];

    const comp = analyzeComposition(apEnemies, []);
    expect(comp.damageBreakdown.predominance).toBe('PREDOMINANTLY_AP');
    expect(comp.damageBreakdown.apPercent).toBeGreaterThanOrEqual(70);

    const rec = generateBuildRecommendation({
      patch: '15.3.1',
      playerChampion: 'Ahri',
      allies: [],
      enemies: apEnemies,
      compositionAnalysis: comp,
    });

    expect(rec.boots.name).toContain('Mercurio');
  });

  // 8. Composición con daño mixto
  it('8. Debe detectar composición con daño mixto balanceado', () => {
    const mixedEnemies: ActiveGameChampion[] = [
      { championId: 122, championName: 'Darius', puuid: '1', summonerName: 'E1', teamId: 200, isPlayer: false }, // AD
      { championId: 64, championName: 'Lee Sin', puuid: '2', summonerName: 'E2', teamId: 200, isPlayer: false }, // AD
      { championId: 134, championName: 'Syndra', puuid: '3', summonerName: 'E3', teamId: 200, isPlayer: false }, // AP
      { championId: 222, championName: 'Jinx', puuid: '4', summonerName: 'E4', teamId: 200, isPlayer: false }, // AD
      { championId: 111, championName: 'Nautilus', puuid: '5', summonerName: 'E5', teamId: 200, isPlayer: false }, // AP
    ];

    const comp = analyzeComposition(mixedEnemies, []);
    expect(comp.damageBreakdown.predominance).toBe('MIXED_DAMAGE');
  });

  // 9. Composición con múltiples tanques
  it('9. Debe detectar múltiples tanques y priorizar penetración y daño porcentual (Liandry / BORK / LDR)', () => {
    const tankEnemies: ActiveGameChampion[] = [
      { championId: 31, championName: 'Cho\'Gath', puuid: '1', summonerName: 'E1', teamId: 200, isPlayer: false }, // Tank
      { championId: 14, championName: 'Sion', puuid: '2', summonerName: 'E2', teamId: 200, isPlayer: false }, // Tank
      { championId: 32, championName: 'Amumu', puuid: '3', summonerName: 'E3', teamId: 200, isPlayer: false }, // Tank
      { championId: 222, championName: 'Jinx', puuid: '4', summonerName: 'E4', teamId: 200, isPlayer: false },
      { championId: 12, championName: 'Alistar', puuid: '5', summonerName: 'E5', teamId: 200, isPlayer: false }, // Tank
    ];

    const comp = analyzeComposition(tankEnemies, []);
    expect(comp.resistanceBreakdown.tankCount).toBeGreaterThanOrEqual(2);
    expect(comp.resistanceBreakdown.penetrationNeed).toBe('CRITICAL');

    const rec = generateBuildRecommendation({
      patch: '15.3.1',
      playerChampion: 'Ahri',
      allies: [],
      enemies: tankEnemies,
      compositionAnalysis: comp,
    });

    expect(rec.coreBuild.some((i) => i.id === 6653)).toBe(true); // Liandry's Torment
    expect(rec.coreBuild.some((i) => i.id === 3135)).toBe(true); // Void Staff
  });

  // 10. Composición con mucho burst
  it('10. Debe detectar amenazas de ráfaga y asesinos (HIGH_BURST)', () => {
    const burstEnemies: ActiveGameChampion[] = [
      { championId: 238, championName: 'Zed', puuid: '1', summonerName: 'E1', teamId: 200, isPlayer: false }, // Assassin AD
      { championId: 7, championName: 'LeBlanc', puuid: '2', summonerName: 'E2', teamId: 200, isPlayer: false }, // Assassin AP
      { championId: 121, championName: 'Kha\'Zix', puuid: '3', summonerName: 'E3', teamId: 200, isPlayer: false }, // Assassin AD
      { championId: 119, championName: 'Draven', puuid: '4', summonerName: 'E4', teamId: 200, isPlayer: false },
      { championId: 555, championName: 'Pyke', puuid: '5', summonerName: 'E5', teamId: 200, isPlayer: false },
    ];

    const comp = analyzeComposition(burstEnemies, []);
    expect(comp.burstThreatBreakdown.overallBurstThreat).toBe('HIGH_BURST');
    expect(comp.burstThreatBreakdown.defensiveItemNeed).toBe(true);
  });

  // 11. Composición con mucha curación
  it('11. Debe detectar curación masiva enemiga y requerir Heridas Graves urgente', () => {
    const healingEnemies: ActiveGameChampion[] = [
      { championId: 266, championName: 'Aatrox', puuid: '1', summonerName: 'E1', teamId: 200, isPlayer: false },
      { championId: 16, championName: 'Soraka', puuid: '2', summonerName: 'E2', teamId: 200, isPlayer: false },
      { championId: 8, championName: 'Vladimir', puuid: '3', summonerName: 'E3', teamId: 200, isPlayer: false },
      { championId: 222, championName: 'Jinx', puuid: '4', summonerName: 'E4', teamId: 200, isPlayer: false },
      { championId: 19, championName: 'Warwick', puuid: '5', summonerName: 'E5', teamId: 200, isPlayer: false },
    ];

    const comp = analyzeComposition(healingEnemies, []);
    expect(comp.healingBreakdown.needGrievousWounds).toBe('URGENT');
    expect(comp.healingBreakdown.heavyHealers.length).toBeGreaterThanOrEqual(3);

    const rec = generateBuildRecommendation({
      patch: '15.3.1',
      playerChampion: 'Ahri',
      allies: [],
      enemies: healingEnemies,
      compositionAnalysis: comp,
    });

    expect(rec.coreBuild.some((i) => i.id === 3165)).toBe(true); // Morellonomicon
  });

  // 12. Composición con mucha MR
  it('12. Debe detectar mucha resistencia mágica enemiga y activar Báculo del Vacío situacional', () => {
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
      patch: '15.3.1',
      playerChampion: 'Ahri',
      allies: [],
      enemies: mrEnemies,
      compositionAnalysis: comp,
    });

    const voidTrigger = rec.situationalItems.find((s) => s.id === 3135);
    expect(voidTrigger?.triggerMatched).toBe(true);
  });

  // 13. Error de Riot API (401, 403, 429)
  it('13. Debe capturar y lanzar errores amigables ante fallos de Riot API (401, 429)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ status: { message: 'Forbidden' } }),
    } as any);

    await expect(fetchActiveGameByPuuid('test-puuid', 'LAS', 'bad-key'))
      .rejects.toThrow('Riot API Key inválida');

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      headers: { get: () => '0' },
    } as any);

    await expect(fetchActiveGameByPuuid('test-puuid', 'LAS', 'rate-limited-key'))
      .rejects.toThrow('Rate Limit');
  }, 15000);

  // 14. Datos incompletos
  it('14. Debe recuperarse de datos incompletos con campeones no identificados', () => {
    const incompleteEnemies: ActiveGameChampion[] = [
      { championId: 99999, championName: 'ChampFantasma', puuid: '1', summonerName: 'E1', teamId: 200, isPlayer: false },
    ];

    const comp = analyzeComposition(incompleteEnemies, []);
    expect(comp).toBeDefined();
    expect(comp.damageBreakdown).toBeDefined();

    const rec = generateBuildRecommendation({
      patch: '15.3.1',
      playerChampion: 'ChampInexistente',
      allies: [],
      enemies: incompleteEnemies,
      compositionAnalysis: comp,
    });

    expect(rec.coreBuild.length).toBe(6);
    expect(rec.boots).toBeDefined();
  });

  // 15. Datos de parche inexistentes
  it('15. Debe hacer fallback a parche estable si Data Dragon no responde', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));
    const patch = await fetchLatestPatchVersion();
    expect(patch).toBe('15.3.1');
  });

  // 16. Objeto inválido
  it('16. Debe validar que los IDs de objetos existan en la base de datos oficial', () => {
    expect(isValidItem(3089)).toBe(true); // Rabadon
    expect(isValidItem(3157)).toBe(true); // Zhonya
    expect(isValidItem(999999)).toBe(false); // Objeto inválido
    expect(getItemById(999999)).toBeUndefined();
  });

  // 17. Runa inválida
  it('17. Debe validar que las runas existan en la base oficial', () => {
    expect(isValidRune(8010)).toBe(true); // Conquistador
    expect(isValidRune(8112)).toBe(true); // Electrocutar
    expect(isValidRune(99999)).toBe(false); // Runa inválida
    expect(getRuneById(99999)).toBeUndefined();
  });

  // 18. Respuesta inválida del LLM
  it('18. Debe descartar respuestas rotas o JSON inválido del LLM y mantener recomendación determinista', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'This is not json at all!' } }],
      }),
    } as any);

    const comp = analyzeComposition(getMockActiveGame().enemies, []);
    const rec = generateBuildRecommendation({
      patch: '15.3.1',
      playerChampion: 'Ahri',
      allies: [],
      enemies: getMockActiveGame().enemies,
      compositionAnalysis: comp,
    });

    const aiExplanation = await generateAIExplanation(rec, comp, 'gsk-dummy-key');
    expect(aiExplanation.reasons.length).toBeGreaterThanOrEqual(2);
    expect(aiExplanation.reasons).toEqual(rec.explanation.reasons);
  });

  // 19. Cache
  it('19. Debe retornar datos desde la caché en llamadas repetidas dentro de la ventana TTL', async () => {
    const fetchSpy = vi.fn().mockImplementation((url: string) => {
      if (url.includes('by-riot-id')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ puuid: 'puuid-cache-test', gameName: 'TestUser', tagLine: 'LAS' }),
        });
      }
      if (url.includes('spectator')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            gameId: 123456,
            participants: [
              { puuid: 'puuid-cache-test', teamId: 100, championId: 103, spell1Id: 4, spell2Id: 14, bot: false },
              { puuid: 'ally-1', teamId: 100, championId: 266, spell1Id: 4, spell2Id: 12, bot: false },
              { puuid: 'enemy-1', teamId: 200, championId: 122, spell1Id: 4, spell2Id: 12, bot: false },
            ],
          }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ['15.3.1'] });
    });
    global.fetch = fetchSpy;

    // First call: calls fetch
    const firstCall = await getActiveGameData('TestUser', 'LAS', 'LAS', 'RGAPI-valid', false, false);
    expect(firstCall).toBeDefined();

    // Reset spy call count
    fetchSpy.mockClear();

    // Second immediate call: should read from cache and NOT hit fetch
    const secondCall = await getActiveGameData('TestUser', 'LAS', 'LAS', 'RGAPI-valid', false, false);
    expect(secondCall).toBeDefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // 20. No realizar polling
  it('20. No debe contener temporizadores periódicos ni ejecutar polling automático', () => {
    vi.useFakeTimers();
    const setIntervalSpy = vi.spyOn(global, 'setInterval');

    // Executing single call
    getMockActiveGame();

    // Verify no interval was registered
    expect(setIntervalSpy).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  // 21. No exponer secretos en frontend
  it('21. Nunca debe exponer la API key ni secretos en mensajes de error al usuario', async () => {
    const SECRET_KEY = 'RGAPI-SUPER-SECRET-TOKEN-12345';
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({ status: { message: `Key ${SECRET_KEY} is expired` } }),
    } as any);

    try {
      await fetchActiveGameByPuuid('user-puuid', 'LAS', SECRET_KEY);
      expect.fail('Debería haber lanzado un error');
    } catch (err: any) {
      expect(err.message).not.toContain(SECRET_KEY);
      expect(err.message).toContain('Riot API Key inválida o expirada');
    }
  });
});
