export type PlatformRegion = 
  | 'LA1' | 'LA2' | 'NA1' | 'EUW1' | 'EUN1' | 'KR' | 'BR1' | 'LAN' | 'LAS';

export type GlobalRegion = 'americas' | 'europe' | 'asia' | 'esports';

export type RoleFilter = 'ALL' | 'TOP' | 'JUNGLE' | 'MID' | 'BOT' | 'SUPPORT';

export type TargetRank = 
  | 'Iron' 
  | 'Bronze' 
  | 'Silver' 
  | 'Gold' 
  | 'Platinum' 
  | 'Emerald' 
  | 'Diamond' 
  | 'Master+';

export interface SearchFormData {
  gameName: string;
  tagLine: string;
  platform: PlatformRegion;
  matchCount: number;
  championFilter: string;
  roleFilter: RoleFilter;
  targetRank: TargetRank;
}

export interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface MatchParticipant {
  puuid: string;
  summonerName: string;
  championId: number;
  championName: string;
  teamPosition: string;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  goldEarned: number;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  visionScore: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  csPerMin: number;
  win: boolean;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  firstBloodKill: boolean;
  firstBloodAssist: boolean;
  champLevel: number;
  laneOpponent?: MatchParticipant;
}

export interface MatchDetail {
  matchId: string;
  gameMode: string;
  gameDuration: number; // in seconds
  gameCreation: number;
  targetSummoner: MatchParticipant;
  laneOpponent?: MatchParticipant;
  specificAdvice?: string[];
  timelineHighlights?: {
    firstDeathTimeMin?: number;
    mythicItemTimeMin?: number;
    csAt10: number;
    csAt15: number;
    goldAt10: number;
    goldAt15: number;
    deathsBefore15: number;
  };
}

export interface RankBenchmark {
  rank: TargetRank;
  csPerMin: number;
  kda: number;
  visionScorePerMin: number;
  damageSharePercentage: number;
  deathsBefore15: number;
  goldPerMin: number;
}

export interface AggregateStats {
  totalMatches: number;
  winRate: number;
  avgKDA: number;
  avgCSPerMin: number;
  avgVisionScore: number;
  avgDamageDealt: number;
  avgDeathsBefore15: number;
  mostPlayedChampions: { championName: string; count: number; winRate: number }[];
}

export interface AIAnalysisReport {
  strengths: {
    title: string;
    description: string;
    metric?: string;
  }[];
  criticalErrors: {
    title: string;
    description: string;
    impact: 'ALTO' | 'CRÍTICO' | 'MEDIO';
    recommendation: string;
  }[];
  actionPlan: {
    step: number;
    objective: string;
    howToExecute: string;
    targetMetric: string;
  }[];
  summaryText: string;
  coachingGrade: string; // e.g. "A-", "B+", "S"
}

export interface AppSettings {
  riotApiKey: string;
  groqApiKey: string;
  isDemoMode: boolean;
}
