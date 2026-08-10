import { TargetRank, RankBenchmark } from '../types';

export const RANK_BENCHMARKS: Record<TargetRank, RankBenchmark> = {
  Iron: {
    rank: 'Iron',
    csPerMin: 4.5,
    kda: 1.8,
    visionScorePerMin: 0.6,
    damageSharePercentage: 18.0,
    deathsBefore15: 3.8,
    goldPerMin: 320,
  },
  Bronze: {
    rank: 'Bronze',
    csPerMin: 5.2,
    kda: 2.1,
    visionScorePerMin: 0.8,
    damageSharePercentage: 20.0,
    deathsBefore15: 3.2,
    goldPerMin: 350,
  },
  Silver: {
    rank: 'Silver',
    csPerMin: 5.8,
    kda: 2.4,
    visionScorePerMin: 0.95,
    damageSharePercentage: 21.5,
    deathsBefore15: 2.7,
    goldPerMin: 380,
  },
  Gold: {
    rank: 'Gold',
    csPerMin: 6.5,
    kda: 2.8,
    visionScorePerMin: 1.15,
    damageSharePercentage: 23.0,
    deathsBefore15: 2.2,
    goldPerMin: 410,
  },
  Platinum: {
    rank: 'Platinum',
    csPerMin: 7.2,
    kda: 3.1,
    visionScorePerMin: 1.35,
    damageSharePercentage: 24.5,
    deathsBefore15: 1.8,
    goldPerMin: 435,
  },
  Emerald: {
    rank: 'Emerald',
    csPerMin: 7.8,
    kda: 3.4,
    visionScorePerMin: 1.50,
    damageSharePercentage: 25.5,
    deathsBefore15: 1.5,
    goldPerMin: 460,
  },
  Diamond: {
    rank: 'Diamond',
    csPerMin: 8.3,
    kda: 3.7,
    visionScorePerMin: 1.70,
    damageSharePercentage: 26.5,
    deathsBefore15: 1.2,
    goldPerMin: 485,
  },
  'Master+': {
    rank: 'Master+',
    csPerMin: 8.9,
    kda: 4.2,
    visionScorePerMin: 1.95,
    damageSharePercentage: 28.0,
    deathsBefore15: 0.9,
    goldPerMin: 520,
  },
};

export const getBenchmarkForRank = (targetRank: TargetRank): RankBenchmark => {
  return RANK_BENCHMARKS[targetRank] || RANK_BENCHMARKS.Emerald;
};

export const compareStatsWithBenchmark = (
  actualCS: number,
  actualKDA: number,
  actualVisionPerMin: number,
  actualDeathsEarly: number,
  benchmark: RankBenchmark
) => {
  return {
    csDiff: actualCS - benchmark.csPerMin,
    csPercentage: Math.round((actualCS / benchmark.csPerMin) * 100),
    kdaDiff: actualKDA - benchmark.kda,
    kdaPercentage: Math.round((actualKDA / benchmark.kda) * 100),
    visionDiff: actualVisionPerMin - benchmark.visionScorePerMin,
    visionPercentage: Math.round((actualVisionPerMin / benchmark.visionScorePerMin) * 100),
    earlyDeathsDiff: actualDeathsEarly - benchmark.deathsBefore15,
  };
};
