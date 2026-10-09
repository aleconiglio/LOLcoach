import { RoleFilter } from '../../types';

export type SpecializedSourceId = 
  | 'OP_GG' 
  | 'U_GG' 
  | 'MOBALYTICS' 
  | 'LEAGUE_OF_GRAPHS' 
  | 'MOBAFIRE';

export interface SpecializedSourceMetadata {
  id: SpecializedSourceId;
  name: string;
  baseUrl: string;
  displayName: string;
}

export const PERMITTED_SOURCES: Record<SpecializedSourceId, SpecializedSourceMetadata> = {
  OP_GG: {
    id: 'OP_GG',
    name: 'OP.GG',
    baseUrl: 'https://op.gg/lol',
    displayName: 'OP.GG Champion Analytics',
  },
  U_GG: {
    id: 'U_GG',
    name: 'U.GG',
    baseUrl: 'https://u.gg/lol',
    displayName: 'U.GG Pro Builds & Stats',
  },
  MOBALYTICS: {
    id: 'MOBALYTICS',
    name: 'Mobalytics',
    baseUrl: 'https://mobalytics.gg/lol',
    displayName: 'Mobalytics Champion Tier & Build',
  },
  LEAGUE_OF_GRAPHS: {
    id: 'LEAGUE_OF_GRAPHS',
    name: 'League of Graphs',
    baseUrl: 'https://www.leagueofgraphs.com',
    displayName: 'League of Graphs High Elo Analytics',
  },
  MOBAFIRE: {
    id: 'MOBAFIRE',
    name: 'MOBAFire',
    baseUrl: 'https://www.mobafire.com',
    displayName: 'MOBAFire Community Verified Guides',
  },
};

export interface PurchaseOrderItem {
  order: number;
  id: number;
  name: string;
  isCore: boolean;
  stepLabel: string; // e.g. "1º Objeto (Rush)", "2º Objeto", "3º Objeto (Pico de Poder)", "Posterior"
  reason: string;
}

export interface BackedSituationalItem {
  id: number;
  name: string;
  condition: string; // Threat condition (e.g. "Mucha Armadura / Múltiples Tanques")
  reason: string;
  backedBySource: boolean;
  sourceContextText: string;
}

export interface PublishedRunePage {
  primaryTree: string;
  keystone: {
    id: number;
    name: string;
    description?: string;
  };
  primaryMinors: Array<{ id: number; name: string }>;
  secondaryTree: string;
  secondaryMinors: Array<{ id: number; name: string }>;
  shards: {
    offense: string;
    flex: string;
    defense: string;
  };
}

export interface PublishedBuild {
  sourceId: SpecializedSourceId;
  sourceName: string;
  sourceUrl: string;
  champion: string;
  role: RoleFilter;
  patch: string;
  fetchTimestamp: number;
  lastUpdatedDate: string;
  sampleSize: number;
  winRate?: number;
  pickRate?: number;
  isStandardBuild: boolean;
  validationStatus: 'VERIFIED_CURRENT_PATCH' | 'PROVISIONAL_PREVIOUS_PATCH' | 'UNVERIFIED';

  startingItems: {
    primary: { id: number; name: string; reason: string };
    alternative?: { id: number; name: string; reason: string };
  };
  boots: {
    id: number;
    name: string;
    reason: string;
  };
  purchaseOrder: PurchaseOrderItem[];
  laterItems: Array<{ id: number; name: string; reason: string }>;
  situationalOptions: BackedSituationalItem[];
  runes: PublishedRunePage;
  skillOrder?: {
    maxOrder: string;
    first3Levels: string;
  };
}

export interface SourceQueryResult {
  build: PublishedBuild | null;
  sourceUsed?: SpecializedSourceId;
  urlConsulted?: string;
  isFromCache: boolean;
  error?: string;
}
