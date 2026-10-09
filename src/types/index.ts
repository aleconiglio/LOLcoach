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

export interface AIMatchBreakdown {
  game: number;
  matchId?: string;
  laneMatchup: string;     // Diagnóstico del 1v1 y habilidades contra el campeón rival específico
  macroAndVision: string;  // Timings de ganks, control de oleadas y rotaciones
  buildVerdict: string;    // Eficacia de los ítems comprados frente a la build enemiga
  decisiveFactor: string;  // Qué jugada o error definió el resultado de esta partida
}

export interface MatchDetail {
  matchId: string;
  gameMode: string;
  gameDuration: number; // in seconds
  gameCreation: number;
  targetSummoner: MatchParticipant;
  laneOpponent?: MatchParticipant;
  specificAdvice?: string[];
  aiBreakdown?: AIMatchBreakdown;
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
  matchBreakdowns?: AIMatchBreakdown[];
}

export interface AppSettings {
  riotApiKey: string;
  groqApiKey: string;
  searchApiKey?: string;
  isDemoMode: boolean;
}

// ==========================================
// DEEP WEB RESEARCH & TRACEABILITY TYPES
// ==========================================

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface WebResearchSource {
  id: string;
  name: string;
  url: string;
  type: 'OFFICIAL_RIOT' | 'STATISTICS_SITE' | 'HIGH_ELO_GUIDE' | 'WEB_SEARCH';
  patch: string;
  sampleSize?: number;
  winRate?: number;
  pickRate?: number;
  reliability: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: number;
  excerpt?: string;
}

export interface BuildRecommendationTraceability {
  patch: string;
  generatedAt: number;
  researchAt: number;
  sources: WebResearchSource[];
  confidenceLevel: ConfidenceLevel;
  evidenceQualityText: string;
  isNewPatchWarning?: boolean;
  isSampleInsufficient?: boolean;
  sampleSize?: number;
  contradictionsDetected?: string[];
  engineVersion: string;
  validationResult: {
    isValid: boolean;
    checkedItemsCount: number;
    checkedRunesCount: number;
    replacedItems?: string[];
    replacedRunes?: string[];
    errors: string[];
  };
}

export interface GameVersionInfo {
  patch: string;
  season?: number;
  releaseDate?: string;
  isNewPatch: boolean;
  lastCheckedTimestamp: number;
  isFallback: boolean;
}

export interface KnowledgeBaseStatus {
  patch: string;
  lastUpdatedTimestamp: number;
  itemCount: number;
  runeCount: number;
  isSynchronized: boolean;
  sourcesAvailable: string[];
}

// ==========================================
// BUILD ADVISOR TYPES & SPECTATOR V5 DOMAIN
// ==========================================

export interface RiotActiveGameParticipant {
  puuid: string;
  teamId: number; // 100 = Blue, 200 = Red
  spell1Id: number;
  spell2Id: number;
  championId: number;
  summonerId?: string;
  riotId?: string;
  bot: boolean;
  perks?: {
    perkIds: number[];
    perkStyle: number;
    perkSubStyle: number;
  };
}

export interface RiotActiveGame {
  gameId: number;
  gameType: string;
  gameStartTime: number;
  mapId: number;
  gameLength: number;
  platformId: string;
  gameMode: string;
  bannedChampions: Array<{ championId: number; teamId: number; pickTurn: number }>;
  gameQueueConfigId: number;
  participants: RiotActiveGameParticipant[];
}

export interface ActiveGameChampion {
  championId: number;
  championName: string;
  role?: RoleFilter;
  puuid: string;
  summonerName: string;
  teamId: number;
  isPlayer: boolean;
}

export interface ActiveGameData {
  gameId: number;
  gameMode: string;
  gameStartTime: number;
  playerChampion: ActiveGameChampion;
  allies: ActiveGameChampion[];
  enemies: ActiveGameChampion[];
  patch: string;
}

export interface CompositionAnalysis {
  damageBreakdown: {
    adCount: number;
    apCount: number;
    adPercent: number;
    apPercent: number;
    predominance: 'PREDOMINANTLY_AD' | 'PREDOMINANTLY_AP' | 'MIXED_DAMAGE';
    damageStyle: 'BURST' | 'DPS_SUSTAINED' | 'HYBRID';
    hasTrueDamageThreat: boolean;
  };
  resistanceBreakdown: {
    tankCount: number;
    bruiserCount: number;
    squishyCount: number;
    highHpThreats: string[];
    highResistanceThreats: string[];
    penetrationNeed: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  };
  crowdControlBreakdown: {
    hardCcCount: number;
    softCcCount: number;
    threatLevel: 'HEAVY_CC' | 'MODERATE_CC' | 'LOW_CC';
    engageStyle: 'HARD_ENGAGE' | 'PICK' | 'REACTIVE_DISENGAGE' | 'POKE';
    tenacityPriority: boolean;
    cleanseQssRecommended: boolean;
  };
  healingBreakdown: {
    heavyHealers: string[];
    needGrievousWounds: 'URGENT' | 'RECOMMENDED' | 'LOW';
    antiHealReason?: string;
  };
  burstThreatBreakdown: {
    physicalAssassins: string[];
    magicAssassins: string[];
    overallBurstThreat: 'HIGH_BURST' | 'MODERATE' | 'LOW';
    defensiveItemNeed: boolean;
  };
  rangeBreakdown: {
    isPokeComp: boolean;
    averageRangeType: 'HIGH_RANGE_POKE' | 'BALANCED' | 'SHORT_RANGE_MELEE';
  };
  teamfightProfile: {
    primaryStyle: 'FRONT_TO_BACK' | 'DIVE_ASSASSINATE' | 'POKE_SIEGE' | 'PICK_SKIRMISH' | 'SPLIT_PUSH';
    scalingProfile: 'EARLY_SNOWBALL' | 'MID_GAME_POWERSPIKE' | 'LATE_GAME_HYPERSCALING';
  };
}

export interface BuildRecommendationItem {
  id: number;
  name: string;
  reason: string;
  isCore?: boolean;
  order?: number;
}

export interface BuildRecommendation {
  patch: string;
  playerChampion: string;
  sourceId?: 'OP_GG' | 'U_GG' | 'MOBALYTICS' | 'LEAGUE_OF_GRAPHS' | 'MOBAFIRE';
  sourceName?: string;
  sourceUrl?: string;
  role?: RoleFilter;
  fetchedAt?: number;
  lastUpdatedDate?: string;
  validationStatus?: 'VERIFIED_CURRENT_PATCH' | 'PROVISIONAL_PREVIOUS_PATCH' | 'UNVERIFIED';
  isStandardBuild?: boolean;
  laterItems?: Array<{ id: number; name: string; reason: string }>;
  confidenceLevel?: ConfidenceLevel;
  traceability?: BuildRecommendationTraceability;
  startingItem: {
    primary: { id: number; name: string; reason: string };
    alternative?: { id: number; name: string; reason: string };
  };
  boots: {
    id: number;
    name: string;
    reason: string;
  };
  coreBuild: Array<{
    order: number;
    id: number;
    name: string;
    reason: string;
    isCore: boolean;
  }>;
  situationalItems: Array<{
    condition: string;
    id: number;
    name: string;
    reason: string;
    triggerMatched: boolean;
    tier?: 'RECOMMENDED_MATCH' | 'SITUATIONAL_ALTERNATIVE' | 'LOW_PRIORITY';
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    championSynergy?: string;
    evidenceText?: string;
    alternativeItem?: { id: number; name: string };
    avoidWhen?: string;
    confidenceScore?: number;
    patch?: string;
  }>;
  runes: {
    primaryTree: string;
    keystone: { id: number; name: string; description: string };
    primaryMinors: Array<{ id: number; name: string }>;
    secondaryTree: string;
    secondaryMinors: Array<{ id: number; name: string }>;
    shards: {
      offense: string;
      flex: string;
      defense: string;
    };
  };
  skillOrder?: {
    levels: Array<{ level: number; skill: 'Q' | 'W' | 'E' | 'R' }>;
    maxOrder: string;
    first3Levels: string;
  };
  explanation: {
    title: string;
    reasons: string[];
    tacticalSummary: string;
  };
}


