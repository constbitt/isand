import type {
  AnalysisMode,
  EntityType,
  TopicYearDataPoint,
} from './trendForecastTypes';

export type { BatchPredictResult, TopicYearDataPoint } from './trendForecastTypes';

export function analysisModeToEntityType(
  mode: AnalysisMode
): 'factor' | 'subfactor' | 'term' {
  if (mode === 'factors_terms' || mode === 'factors_publs') return 'factor';
  if (mode === 'subfactors_terms' || mode === 'subfactors_publs') return 'subfactor';
  return 'term';
}

export function entityTypeToContextType(
  t: EntityType
): 'journal' | 'organization' {
  return t === 'organizations' ? 'organization' : 'journal';
}

export function buildTimeSeries(
  data: TopicYearDataPoint[],
  topic: string
): { years: number[]; timeSeries: number[] } {
  const sorted = [...data].sort((a, b) => a.year - b.year);
  const years: number[] = [];
  const timeSeries: number[] = [];
  for (const row of sorted) {
    const v = row.topics[topic] ?? 0;
    if (v === undefined || v === null) continue;
    years.push(row.year);
    timeSeries.push(typeof v === 'number' && !Number.isNaN(v) ? v : Number(v) || 0);
  }
  return { years, timeSeries };
}

export interface MlClassResult {
  predicted_class: number;
  class_name: string;
  probabilities?: {
    [key: string]: number;
  };
}
