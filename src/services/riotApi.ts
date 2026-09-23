import { 
  PlatformRegion, 
  GlobalRegion, 
  RiotAccount, 
  MatchDetail, 
  MatchParticipant,
  RoleFilter,
  TargetRank
} from '../types';
import { generateMatchTacticalAdvice } from './tacticalAdvice';

export const getGlobalRegion = (platform: PlatformRegion): GlobalRegion => {
  switch (platform) {
    case 'LA1':
    case 'LA2':
    case 'LAN':
    case 'LAS':
    case 'NA1':
    case 'BR1':
      return 'americas';
    case 'EUW1':
    case 'EUN1':
      return 'europe';
    case 'KR':
      return 'asia';
    default:
      return 'americas';
  }
};

const handleRiotResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Riot API Key inválida o expirada. Por favor verifica tu API Key en la Configuración.');
    }
    if (response.status === 404) {
      throw new Error('No se encontró el Invocador o los datos solicitados en Riot Games API.');
    }
    if (response.status === 429) {
      throw new Error('Límite de peticiones de Riot API alcanzado (Rate Limit). Intenta de nuevo en unos momentos.');
    }
    throw new Error(`Error HTTP de Riot API: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const fetchRiotAccount = async (
  gameName: string,
  tagLine: string,
  platform: PlatformRegion,
  apiKey: string
): Promise<RiotAccount> => {
  const globalRegion = getGlobalRegion(platform);
  const cleanGameName = encodeURIComponent(gameName.trim());
  const cleanTagLine = encodeURIComponent(tagLine.trim());

  const url = `https://${globalRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${cleanGameName}/${cleanTagLine}?api_key=${apiKey}`;
  
  const data = await fetch(url).then(handleRiotResponse);
  return {
    puuid: data.puuid,
    gameName: data.gameName,
    tagLine: data.tagLine,
  };
};

export const fetchMatchIds = async (
  puuid: string,
  globalRegion: GlobalRegion,
  count: number,
  apiKey: string
): Promise<string[]> => {
  // queue=420 is Ranked Solo/Duo
  const url = `https://${globalRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=0&count=${count}&api_key=${apiKey}`;
  const matchIds = await fetch(url).then(handleRiotResponse);
  return matchIds || [];
};

export const fetchMatchDetail = async (
  matchId: string,
  globalRegion: GlobalRegion,
  puuid: string,
  apiKey: string,
  targetRank: TargetRank = 'Gold'
): Promise<MatchDetail> => {
  const detailUrl = `https://${globalRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKey}`;
  const detailData = await fetch(detailUrl).then(handleRiotResponse);
  const info = detailData.info;

  const participants: any[] = info.participants || [];
  const rawTarget = participants.find((p) => p.puuid === puuid) || participants[0];

  const mapParticipant = (p: any): MatchParticipant => {
    const durationMin = Math.max(1, info.gameDuration / 60);
    const totalCs = (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0);
    const deaths = p.deaths || 0;
    const kills = p.kills || 0;
    const assists = p.assists || 0;

    const rawPosition = (p.teamPosition || 'UNKNOWN').toUpperCase();
    const displayPosition =
      rawPosition === 'MIDDLE' ? 'MID' :
      rawPosition === 'BOTTOM' ? 'BOT' :
      rawPosition === 'UTILITY' ? 'SUPPORT' : rawPosition;

    return {
      puuid: p.puuid,
      summonerName: p.summonerName || p.riotIdGameName || 'Desconocido',
      championId: p.championId,
      championName: p.championName,
      teamPosition: displayPosition,
      kills,
      deaths,
      assists,
      kda: Number(((kills + assists) / Math.max(1, deaths)).toFixed(2)),
      goldEarned: p.goldEarned || 0,
      totalDamageDealtToChampions: p.totalDamageDealtToChampions || 0,
      totalDamageTaken: p.totalDamageTaken || 0,
      visionScore: p.visionScore || 0,
      totalMinionsKilled: p.totalMinionsKilled || 0,
      neutralMinionsKilled: p.neutralMinionsKilled || 0,
      csPerMin: Number((totalCs / durationMin).toFixed(1)),
      win: !!p.win,
      item0: p.item0 || 0,
      item1: p.item1 || 0,
      item2: p.item2 || 0,
      item3: p.item3 || 0,
      item4: p.item4 || 0,
      item5: p.item5 || 0,
      item6: p.item6 || 0,
      firstBloodKill: !!p.firstBloodKill,
      firstBloodAssist: !!p.firstBloodAssist,
      champLevel: p.champLevel || 1,
    };
  };

  const targetSummoner = mapParticipant(rawTarget);

  // Find direct lane opponent on enemy team with same teamPosition
  const rawOpponent = participants.find(
    (p) => p.teamId !== rawTarget.teamId && p.teamPosition === rawTarget.teamPosition
  );
  const laneOpponent = rawOpponent ? mapParticipant(rawOpponent) : undefined;
  targetSummoner.laneOpponent = laneOpponent;

  // Try fetching match timeline for deeper early game analytics
  let timelineHighlights = {
    csAt10: Math.round(targetSummoner.csPerMin * 8),
    csAt15: Math.round(targetSummoner.csPerMin * 12.5),
    goldAt10: Math.round(targetSummoner.goldEarned * 0.28),
    goldAt15: Math.round(targetSummoner.goldEarned * 0.45),
    deathsBefore15: Math.min(targetSummoner.deaths, Math.floor(targetSummoner.deaths * 0.6)),
    firstDeathTimeMin: targetSummoner.deaths > 0 ? 6.5 : undefined,
    mythicItemTimeMin: 13.2
  };

  try {
    const timelineUrl = `https://${globalRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline?api_key=${apiKey}`;
    const timelineData = await fetch(timelineUrl).then(handleRiotResponse);
    if (timelineData?.info?.frames) {
      const frames = timelineData.info.frames;
      const targetParticipantId = rawTarget.participantId;
      
      const frame10 = frames[Math.min(10, frames.length - 1)];
      const frame15 = frames[Math.min(15, frames.length - 1)];

      if (frame10?.participantFrames?.[targetParticipantId]) {
        const p10 = frame10.participantFrames[targetParticipantId];
        timelineHighlights.csAt10 = (p10.minionsKilled || 0) + (p10.jungleMinionsKilled || 0);
        timelineHighlights.goldAt10 = p10.totalGold || timelineHighlights.goldAt10;
      }
      if (frame15?.participantFrames?.[targetParticipantId]) {
        const p15 = frame15.participantFrames[targetParticipantId];
        timelineHighlights.csAt15 = (p15.minionsKilled || 0) + (p15.jungleMinionsKilled || 0);
        timelineHighlights.goldAt15 = p15.totalGold || timelineHighlights.goldAt15;
      }

      // Count deaths before 15 min frame
      let earlyDeaths = 0;
      let firstDeathMin: number | undefined = undefined;

      frames.forEach((frame: any, idx: number) => {
        if (idx <= 15 && frame.events) {
          frame.events.forEach((evt: any) => {
            if (evt.type === 'CHAMPION_KILL' && evt.victimId === targetParticipantId) {
              earlyDeaths++;
              if (firstDeathMin === undefined) {
                firstDeathMin = Number((evt.timestamp / 60000).toFixed(1));
              }
            }
          });
        }
      });

      timelineHighlights.deathsBefore15 = earlyDeaths;
      if (firstDeathMin !== undefined) {
        timelineHighlights.firstDeathTimeMin = firstDeathMin;
      }
    }
  } catch (err) {
    console.warn('Match timeline unavailable, using estimated early stats.', err);
  }

  // Generate hyper-specific tactical advice for this match based on live metrics
  const specificAdvice = generateMatchTacticalAdvice({
    targetSummoner,
    laneOpponent,
    gameDuration: info.gameDuration || 1800,
    targetRank,
    timelineHighlights,
  });

  return {
    matchId,
    gameMode: info.gameMode || 'CLASSIC',
    gameDuration: info.gameDuration || 1800,
    gameCreation: info.gameCreation || Date.now(),
    targetSummoner,
    laneOpponent,
    timelineHighlights,
    specificAdvice,
  };
};

export const fetchFullSummonerAnalysis = async (
  gameName: string,
  tagLine: string,
  platform: PlatformRegion,
  count: number,
  roleFilter: RoleFilter,
  championFilter: string,
  apiKey: string,
  targetRank: TargetRank = 'Gold'
): Promise<{ account: RiotAccount; matches: MatchDetail[] }> => {
  const account = await fetchRiotAccount(gameName, tagLine, platform, apiKey);
  const globalRegion = getGlobalRegion(platform);
  
  // Request slightly more match IDs to allow for champion/role/remake filtering
  const requestCount = Math.min(championFilter || roleFilter !== 'ALL' ? count * 3 : count + 6, 40);
  const rawMatchIds = await fetchMatchIds(account.puuid, globalRegion, requestCount, apiKey);
  const matchIds = Array.isArray(rawMatchIds) ? rawMatchIds : [];

  if (matchIds.length === 0) {
    throw new Error('No se encontraron partidas Ranked Solo/Duo recientes para este invocador.');
  }

  const matchPromises = matchIds.map((id) =>
    fetchMatchDetail(id, globalRegion, account.puuid, apiKey, targetRank).catch(() => null)
  );

  const rawMatches = await Promise.all(matchPromises);
  let validMatches = rawMatches.filter((m): m is MatchDetail => m !== null);

  // Excluir partidas menores a 8 minutos (480 segundos) ya que son remakes y alteran las métricas
  validMatches = validMatches.filter((m) => (m.gameDuration || 0) >= 480);

  // Apply Champion filter if provided
  if (championFilter.trim()) {
    const searchChamp = championFilter.trim().toLowerCase();
    validMatches = validMatches.filter((m) =>
      m.targetSummoner.championName.toLowerCase().includes(searchChamp)
    );
  }

  // Apply Role filter if not ALL
  if (roleFilter !== 'ALL') {
    const riotPosition =
      roleFilter === 'MID' ? 'MID' :
      roleFilter === 'BOT' ? 'BOT' :
      roleFilter === 'SUPPORT' ? 'SUPPORT' : roleFilter;

    validMatches = validMatches.filter((m) =>
      m.targetSummoner.teamPosition.toUpperCase() === riotPosition
    );
  }

  // Cap at requested count
  const finalMatches = validMatches.slice(0, count);

  if (finalMatches.length === 0) {
    throw new Error('No se encontraron partidas válidas de más de 8 minutos (se excluyen remakes) que coincidan con los filtros especificados.');
  }

  return {
    account,
    matches: finalMatches,
  };
};
