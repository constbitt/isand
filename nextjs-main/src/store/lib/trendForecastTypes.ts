export type EntityType =
  | 'authors'
  | 'journals'
  | 'conferences'
  | 'organizations'
  | 'cities';

export type AnalysisMode =
  | 'factors_terms'
  | 'subfactors_terms'
  | 'terms_occurrences'
  | 'factors_publs'
  | 'subfactors_publs'
  | 'unique_terms_publs';

export interface TopicYearDataPoint {
  year: number;
  topics: { [topic: string]: number };
  terms: { [topic: string]: number };
  publicationCounts?: { [topic: string]: number };
  totalPublications?: number;
  isForecast?: boolean;
}

export interface BatchPredictResult {
  results: Array<{
    predicted_class: number;
    class_name: string;
    probabilities?: { [k: string]: number };
  }>;
}
