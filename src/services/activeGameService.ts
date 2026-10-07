import { 
  PlatformRegion, 
  RiotActiveGame, 
  ActiveGameChampion, 
  ActiveGameData 
} from '../types';
import { 
  fetchRiotAccount, 
  fetchActiveGameByPuuid, 
  fetchLatestPatchVersion 
} from './riotApi';
import { resolveChampionInfo } from './championData';

interface CachedEntry {
  data: ActiveGameData;
  timestamp: number;
}

const activeGameCache = new Map<string, CachedEntry>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes TTL

/**
 * Clears cached active games
 */
export const clearActiveGameCache = (cacheKey?: string): void => {
  if (cacheKey) {
    activeGameCache.delete(cacheKey.toLowerCase());
  } else {
    activeGameCache.clear();
  }
};

/**
 * Generates a realistic mock active match for Demo Mode or Testing
 */
export const getMockActiveGame = (
  gameName = 'Invocador',
  playerChampionName = 'Ahri',
  customEnemies?: string[],
  customAllies?: string[]
): ActiveGameData => {
  const playerMeta = resolveChampionInfo(playerChampionName || 'Ahri');

  const defaultAllies = ['Aatrox', 'Lee Sin', 'Jinx', 'Thresh'];
  const defaultEnemies = ['Darius', 'Viego', 'Syndra', 'Kai\'Sa', 'Nautilus'];

  const allyNames = customAllies && customAllies.length === 4 ? customAllies : defaultAllies;
  const enemyNames = customEnemies && customEnemies.length === 5 ? customEnemies : defaultEnemies;

  const playerParticipant: ActiveGameChampion = {
    championId: playerMeta.numericId,
    championName: playerMeta.name,
    role: playerMeta.role,
    puuid: 'mock-player-puuid',
    summonerName: gameName || 'Tu Invocador',
    teamId: 100,
    isPlayer: true,
  };

  const allies: ActiveGameChampion[] = allyNames.map((name, idx) => {
    const m = resolveChampionInfo(name);
    return {
      championId: m.numericId,
      championName: m.name,
      role: m.role,
      puuid: `mock-ally-${idx}`,
      summonerName: `Aliado #${idx + 1}`,
      teamId: 100,
      isPlayer: false,
    };
  });

  const enemies: ActiveGameChampion[] = enemyNames.map((name, idx) => {
    const m = resolveChampionInfo(name);
    return {
      championId: m.numericId,
      championName: m.name,
      role: m.role,
      puuid: `mock-enemy-${idx}`,
      summonerName: `Rival #${idx + 1}`,
      teamId: 200,
      isPlayer: false,
    };
  });

  return {
    gameId: 9988776655,
    gameMode: 'CLASSIC',
    gameStartTime: Date.now() - 360000,
    playerChampion: playerParticipant,
    allies,
    enemies,
    patch: '15.3.1',
  };
};

/**
 * Fetches and structures active game information from Riot Spectator-v5
 * Identifies the user strictly by their authenticated PUUID and separates teams.
 * Implements strict one-time fetching with caching (NO POLLING).
 */
export const getActiveGameData = async (
  gameName: string,
  tagLine: string,
  platform: PlatformRegion,
  apiKey: string,
  isDemoMode = false,
  bypassCache = false
): Promise<ActiveGameData | null> => {
  const cacheKey = `${platform}:${gameName.trim()}#${tagLine.trim()}`.toLowerCase();

  // 1. Check cache first to avoid unnecessary Riot API calls
  if (!bypassCache && activeGameCache.has(cacheKey)) {
    const cached = activeGameCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    } else {
      activeGameCache.delete(cacheKey);
    }
  }

  // 2. Demo Mode handler
  if (isDemoMode || !apiKey || apiKey.trim() === '') {
    const mockGame = getMockActiveGame(gameName, 'Ahri');
    activeGameCache.set(cacheKey, { data: mockGame, timestamp: Date.now() });
    return mockGame;
  }

  // 3. Live Riot API pipeline
  // Step A: Resolve Riot Account to get official PUUID
  const account = await fetchRiotAccount(gameName, tagLine, platform, apiKey);
  const userPuuid = account.puuid;

  // Step B: Fetch active game from Spectator-v5 by PUUID
  const rawGame: RiotActiveGame | null = await fetchActiveGameByPuuid(userPuuid, platform, apiKey);

  if (!rawGame || !rawGame.participants || rawGame.participants.length === 0) {
    return null;
  }

  // Step C: Fetch current patch
  const patch = await fetchLatestPatchVersion();

  // Step D: Find the user participant explicitly by PUUID (NEVER assume index 0!)
  const rawUserParticipant = rawGame.participants.find(
    (p) => p.puuid === userPuuid || (p.summonerId && p.summonerId === userPuuid)
  );

  if (!rawUserParticipant) {
    // If not found by PUUID, search by riotId if available, or fallback
    const fallbackUser = rawGame.participants.find(
      (p) => p.riotId && p.riotId.toLowerCase().includes(gameName.toLowerCase())
    ) || rawGame.participants[0];

    const playerMeta = resolveChampionInfo(fallbackUser.championId);
    const userTeamId = fallbackUser.teamId;

    const playerChampion: ActiveGameChampion = {
      championId: fallbackUser.championId,
      championName: playerMeta.name,
      role: playerMeta.role,
      puuid: fallbackUser.puuid || userPuuid,
      summonerName: fallbackUser.riotId || gameName,
      teamId: userTeamId,
      isPlayer: true,
    };

    const allies: ActiveGameChampion[] = rawGame.participants
      .filter((p) => p !== fallbackUser && p.teamId === userTeamId)
      .map((p, idx) => {
        const m = resolveChampionInfo(p.championId);
        return {
          championId: p.championId,
          championName: m.name,
          role: m.role,
          puuid: p.puuid || `ally-${idx}`,
          summonerName: p.riotId || `Aliado #${idx + 1}`,
          teamId: p.teamId,
          isPlayer: false,
        };
      });

    const enemies: ActiveGameChampion[] = rawGame.participants
      .filter((p) => p.teamId !== userTeamId)
      .map((p, idx) => {
        const m = resolveChampionInfo(p.championId);
        return {
          championId: p.championId,
          championName: m.name,
          role: m.role,
          puuid: p.puuid || `enemy-${idx}`,
          summonerName: p.riotId || `Rival #${idx + 1}`,
          teamId: p.teamId,
          isPlayer: false,
        };
      });

    const structuredData: ActiveGameData = {
      gameId: rawGame.gameId,
      gameMode: rawGame.gameMode || 'CLASSIC',
      gameStartTime: rawGame.gameStartTime || Date.now(),
      playerChampion,
      allies,
      enemies,
      patch,
    };

    activeGameCache.set(cacheKey, { data: structuredData, timestamp: Date.now() });
    return structuredData;
  }

  const userTeamId = rawUserParticipant.teamId;
  const playerMeta = resolveChampionInfo(rawUserParticipant.championId);

  const playerChampion: ActiveGameChampion = {
    championId: rawUserParticipant.championId,
    championName: playerMeta.name,
    role: playerMeta.role,
    puuid: userPuuid,
    summonerName: rawUserParticipant.riotId || gameName,
    teamId: userTeamId,
    isPlayer: true,
  };

  const allies: ActiveGameChampion[] = rawGame.participants
    .filter((p) => p.puuid !== userPuuid && p.teamId === userTeamId)
    .map((p, idx) => {
      const m = resolveChampionInfo(p.championId);
      return {
        championId: p.championId,
        championName: m.name,
        role: m.role,
        puuid: p.puuid,
        summonerName: p.riotId || `Aliado #${idx + 1}`,
        teamId: p.teamId,
        isPlayer: false,
      };
    });

  const enemies: ActiveGameChampion[] = rawGame.participants
    .filter((p) => p.teamId !== userTeamId)
    .map((p, idx) => {
      const m = resolveChampionInfo(p.championId);
      return {
        championId: p.championId,
        championName: m.name,
        role: m.role,
        puuid: p.puuid,
        summonerName: p.riotId || `Rival #${idx + 1}`,
        teamId: p.teamId,
        isPlayer: false,
      };
    });

  const structuredData: ActiveGameData = {
    gameId: rawGame.gameId,
    gameMode: rawGame.gameMode || 'CLASSIC',
    gameStartTime: rawGame.gameStartTime || Date.now(),
    playerChampion,
    allies,
    enemies,
    patch,
  };

  // Cache result to prevent duplicate immediate requests
  activeGameCache.set(cacheKey, { data: structuredData, timestamp: Date.now() });
  return structuredData;
};
