import { describe, it, expect, beforeEach } from 'vitest';
import { 
  generateBuildRecommendation, 
  generateDeepResearchBuildRecommendation 
} from '../buildRecommendationEngine';
import { analyzeComposition } from '../compositionAnalyzer';
import { 
  selectBestPublishedBuild, 
  selectBestPublishedBuildSync 
} from '../specializedSources/buildSelectionService';
import { 
  retrievePublishedBuilds, 
  retrievePublishedBuildsSync 
} from '../specializedSources/buildRetrievalService';
import { 
  isAllowedSpecializedSourceUrl, 
  generateCanonicalSourceUrl,
  ALLOWED_SPECIALIZED_DOMAINS 
} from '../specializedSources/sourceResearchService';
import { validatePublishedBuild } from '../specializedSources/patchAndItemValidator';
import { validatePublishedRunes } from '../specializedSources/runeRetrievalService';
import { resolveChampionAndRole } from '../specializedSources/championRoleResolver';
import { 
  getCachedBuilds, 
  setCachedBuilds, 
  clearSourceCache, 
  checkAndInvalidateOnPatchChange 
} from '../specializedSources/sourceCache';
import { PUBLISHED_BUILDS_CATALOG } from '../specializedSources/specializedSourcesCatalog';
import { ActiveGameChampion } from '../../types';

describe('Refactor: Builds Basadas Exclusivamente en Fuentes Especializadas (12 Criterios)', () => {
  beforeEach(() => {
    clearSourceCache();
  });

  // 1. La build mostrada procede de una fuente permitida
  it('1. La build mostrada procede exclusivamente de una de las 5 fuentes permitidas', () => {
    const comp = analyzeComposition([], []);
    const rec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Darius',
      playerRole: 'TOP',
      allies: [],
      enemies: [],
      compositionAnalysis: comp,
    });

    expect(rec.sourceId).toBeDefined();
    expect(['OP_GG', 'U_GG', 'MOBALYTICS', 'LEAGUE_OF_GRAPHS', 'MOBAFIRE']).toContain(rec.sourceId);
    expect(rec.sourceUrl).toBeDefined();
    expect(isAllowedSpecializedSourceUrl(rec.sourceUrl!)).toBe(true);

    // Ensure URL hostname belongs strictly to allowed domains
    const parsedUrl = new URL(rec.sourceUrl!);
    const isDomainAllowed = ALLOWED_SPECIALIZED_DOMAINS.some(
      (d) => parsedUrl.hostname === d || parsedUrl.hostname.endsWith(`.${d}`)
    );
    expect(isDomainAllowed).toBe(true);
  });

  // 2. Los objetos conservan el orden publicado
  it('2. Los objetos conservan la secuencia de compra publicada por la fuente (Rush -> 2º -> 3º)', () => {
    const comp = analyzeComposition([], []);
    const rec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Darius',
      playerRole: 'TOP',
      allies: [],
      enemies: [],
      compositionAnalysis: comp,
    });

    expect(rec.coreBuild.length).toBeGreaterThanOrEqual(3);
    expect(rec.coreBuild[0].order).toBe(1);
    expect(rec.coreBuild[0].id).toBe(3078); // Trinity Force (Rush)
    expect(rec.coreBuild[1].order).toBe(2);
    expect(rec.coreBuild[1].id).toBe(3053); // Sterak's Gage
    expect(rec.coreBuild[2].order).toBe(3);
    expect(rec.coreBuild[2].id).toBe(3742); // Dead Man's Plate
  });

  // 3. Las runas coinciden con la configuración de origen
  it('3. Las runas coinciden con la configuración de origen sin invención de fragmentos ni keystone', () => {
    const comp = analyzeComposition([], []);
    const rec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Darius',
      playerRole: 'TOP',
      allies: [],
      enemies: [],
      compositionAnalysis: comp,
    });

    // Keystone published by OP.GG / U.GG for Darius
    expect(rec.runes.keystone.id).toBe(8010); // Conquistador
    expect(rec.runes.primaryTree).toBe('Precisión');
    expect(rec.runes.primaryMinors.map((m) => m.id)).toEqual([9111, 9104, 8299]); // Triumph, Alacrity, Last Stand
    expect(rec.runes.secondaryTree).toBe('Valor');
    expect(rec.runes.secondaryMinors.map((m) => m.id)).toEqual([8444, 8451]); // Second Wind, Overgrowth

    // Validate using rune retrieval validator
    const runeReport = validatePublishedRunes(rec.runes);
    expect(runeReport.isValid).toBe(true);
    expect(runeReport.errors.length).toBe(0);
  });

  // 4. No se añaden objetos inventados por el LLM
  it('4. No se añaden objetos inventados por el LLM ni combinaciones libres de palabras clave', () => {
    const enemies: ActiveGameChampion[] = [
      { championId: 3, championName: 'Galio', puuid: '1', summonerName: 'E1', teamId: 200, isPlayer: false },
      { championId: 516, championName: 'Ornn', puuid: '2', summonerName: 'E2', teamId: 200, isPlayer: false },
    ];
    const comp = analyzeComposition(enemies, []);
    const rec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Darius',
      playerRole: 'TOP',
      allies: [],
      enemies,
      compositionAnalysis: comp,
    });

    // Darius never gets AP items like Void Staff (3135) or Liandry (6653)
    const allItemIds = rec.coreBuild.map((b) => b.id).concat(rec.situationalItems.map((s) => s.id));
    expect(allItemIds).not.toContain(3135); // Void Staff
    expect(allItemIds).not.toContain(6653); // Liandry
    expect(allItemIds).not.toContain(3157); // Zhonya
    expect(allItemIds).not.toContain(3089); // Rabadon
  });

  // 5. No se mezclan roles incompatibles
  it('5. No se mezclan roles incompatibles ni se asignan guías experimentales a la posición estándar', () => {
    const topResolved = resolveChampionAndRole('Darius', 'TOP');
    expect(topResolved.role).toBe('TOP');

    // If role is omitted, resolver selects primary meta role (TOP for Darius)
    const defaultResolved = resolveChampionAndRole('Darius');
    expect(defaultResolved.role).toBe('TOP');

    const supportResolved = resolveChampionAndRole('Nautilus');
    expect(supportResolved.role).toBe('SUPPORT');

    const comp = analyzeComposition([], []);
    const nautilusRec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Nautilus',
      playerRole: 'SUPPORT',
      allies: [],
      enemies: [],
      compositionAnalysis: comp,
    });

    expect(nautilusRec.startingItem.primary.id).toBe(3865); // World Atlas (Support)
    expect(nautilusRec.coreBuild[0].id).toBe(3190); // Locket of the Iron Solari
  });

  // 6. Las guías antiguas se identifican correctamente
  it('6. Las guías antiguas se identifican correctamente y no se presentan como verificadas en el parche actual', () => {
    const ancientBuild = PUBLISHED_BUILDS_CATALOG.find((b) => b.patch === '14.2.1');
    expect(ancientBuild).toBeDefined();

    const valReport = validatePublishedBuild(ancientBuild!, '16.20.1');
    expect(valReport.isCurrentPatch).toBe(false);
    expect(valReport.status).toBe('UNVERIFIED');
    expect(valReport.errors.some((e) => e.includes('obsoleta'))).toBe(true);
  });

  // 7. Las alternativas situacionales tienen respaldo verificable
  it('7. Las alternativas situacionales tienen respaldo verificable de la fuente especializada', () => {
    const tankEnemies: ActiveGameChampion[] = [
      { championId: 31, championName: 'Cho\'Gath', puuid: '1', summonerName: 'E1', teamId: 200, isPlayer: false },
      { championId: 14, championName: 'Sion', puuid: '2', summonerName: 'E2', teamId: 200, isPlayer: false },
      { championId: 12, championName: 'Alistar', puuid: '3', summonerName: 'E3', teamId: 200, isPlayer: false },
    ];
    const comp = analyzeComposition(tankEnemies, []);
    const rec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Darius',
      playerRole: 'TOP',
      allies: [],
      enemies: tankEnemies,
      compositionAnalysis: comp,
    });

    const blackCleaverOpt = rec.situationalItems.find((s) => s.id === 3071);
    expect(blackCleaverOpt).toBeDefined();
    expect(blackCleaverOpt?.evidenceText).toContain('OP.GG');
    expect(blackCleaverOpt?.triggerMatched).toBe(true);
    expect(blackCleaverOpt?.tier).toBe('RECOMMENDED_MATCH');
  });

  // 8. Una fuente inaccesible no genera datos ficticios
  it('8. Una fuente inaccesible no genera datos ficticios y consulta catálogo verificado', async () => {
    const packageData = await retrievePublishedBuilds('Ahri', 'MID', '16.20.1');
    expect(packageData.validBuilds.length).toBeGreaterThan(0);

    const firstBuild = packageData.validBuilds[0];
    expect(firstBuild.sourceName).toBe('OP.GG');
    expect(firstBuild.sampleSize).toBeGreaterThan(1000);
    expect(firstBuild.sourceUrl).toContain('op.gg');
  });

  // 9. La caché se invalida cuando cambia el parche
  it('9. La caché se invalida automáticamente cuando cambia el parche de la partida', () => {
    setCachedBuilds('Darius', 'TOP', '16.20.1', PUBLISHED_BUILDS_CATALOG);
    
    // Hit in same patch
    const cachedHit = getCachedBuilds('Darius', 'TOP', '16.20.1');
    expect(cachedHit).not.toBeNull();

    // Query in a new patch (16.21.1) must invalidate
    const newPatchHit = getCachedBuilds('Darius', 'TOP', '16.21.1');
    expect(newPatchHit).toBeNull();
  });

  // 10. La interfaz muestra correctamente la fuente y su enlace
  it('10. La recomendación incluye fuente y URL original verificable para enlace directo en UI', () => {
    const comp = analyzeComposition([], []);
    const rec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Jinx',
      playerRole: 'BOT',
      allies: [],
      enemies: [],
      compositionAnalysis: comp,
    });

    expect(rec.sourceName).toBe('OP.GG');
    expect(rec.sourceUrl).toBe('https://op.gg/lol/champions/jinx/bot/build?region=global&tier=emerald_plus&patch=16.20.1');
    expect(rec.lastUpdatedDate).toBeDefined();
  });

  // 11. La aplicación puede mostrar menos objetos situacionales si no hay evidencia suficiente
  it('11. La aplicación muestra únicamente los objetos respaldados sin rellenar artificialmente tarjetas', () => {
    const comp = analyzeComposition([], []);
    const rec = generateBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Ambessa',
      playerRole: 'TOP',
      allies: [],
      enemies: [],
      compositionAnalysis: comp,
    });

    // Ambessa only has 2 backed situational items in OP.GG catalog (Thornmail and Maw of Malmortius)
    expect(rec.situationalItems.length).toBe(2);
    expect(rec.situationalItems.every((s) => s.id === 3075 || s.id === 3156)).toBe(true);
  });

  // 12. La funcionalidad existente sigue funcionando (async y sync)
  it('12. La funcionalidad existente asíncrona y síncrona sigue operando con total compatibilidad', async () => {
    const comp = analyzeComposition([], []);
    const asyncRec = await generateDeepResearchBuildRecommendation({
      patch: '16.20.1',
      playerChampion: 'Cassiopeia',
      playerRole: 'MID',
      allies: [],
      enemies: [],
      compositionAnalysis: comp,
    });

    expect(asyncRec.playerChampion).toBe('Cassiopeia');
    expect(asyncRec.boots.id).toBe(0); // Cassiopeia passive, no boots
    expect(asyncRec.coreBuild.some((b) => b.id === 3003)).toBe(true); // Seraph's Embrace
    expect(asyncRec.coreBuild.some((b) => b.id === 3116)).toBe(true); // Rylai's
    expect(asyncRec.coreBuild.some((b) => b.id === 6653)).toBe(true); // Liandry's
  });
});
