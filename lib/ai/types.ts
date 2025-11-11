/**
 * TypeScript types for historical figure analysis
 * Generated from analysis_schema.json
 */

export interface PersonalityCharacteristics {
  visionary: number;
  resilience: number;
  charisma: number;
  empathy: number;
  adaptability: number;
  controversial_nature: number;
}

export interface FieldsOfImpact {
  science?: number;
  philosophy?: number;
  politics?: number;
  arts?: number;
  technology?: number;
  social?: number;
  religion?: number;
  economics?: number;
}

export interface SentimentIndex {
  positive: number;
  mixed: number;
  negative: number;
}

export interface TimelineEvent {
  year: string;
  event: string;
}

export interface GeographicAreasOfInfluence {
  europe?: number;
  north_america?: number;
  south_america?: number;
  asia?: number;
  africa?: number;
  oceania?: number;
}

export interface MajorContribution {
  title: string;
  summary: string;
  date?: string;
}

export interface NotableContemporary {
  name: string;
  relationship: string;
}

export interface SourceReference {
  url: string;
  context: string;
}

export interface CounterNarrative {
  perspective: string;
  argument: string;
  significance: number;
  relevant_sources: SourceReference[];
}

export type MetricType = 'index' | 'score' | 'ratio' | 'multiplier';

export interface AdditionalMetric {
  title: string;
  type: MetricType;
  value: number;
  description: string;
}

export type ReadingMaterialType =
  | 'book'
  | 'article'
  | 'paper'
  | 'video'
  | 'podcast'
  | 'website'
  | 'other';

export type DifficultyLevel =
  | 'introductory'
  | 'intermediate'
  | 'advanced'
  | 'scholarly';

export interface AdditionalReading {
  title: string;
  author?: string;
  type: ReadingMaterialType;
  url?: string;
  year?: string;
  description: string;
  difficulty_level: DifficultyLevel;
}

export type SourceType =
  | 'academic'
  | 'primary_source'
  | 'biography'
  | 'analysis'
  | 'media'
  | 'other';

export interface Source {
  title: string;
  url: string;
  type: SourceType;
  description?: string;
}

/**
 * Complete analysis response for a historical figure
 */
export interface HistoricalFigureAnalysis {
  name: string;
  worldly_impact_score: number;
  reach_score: number;
  controversy_score: number;
  longevity_score: number;
  innovation_score: number;
  influence_score: number;
  personality_characteristics: PersonalityCharacteristics;
  fields_of_impact: FieldsOfImpact;
  sentiment_index: SentimentIndex;
  citations_count: number | null;
  timeline_of_influence: TimelineEvent[];
  geographic_areas_of_influence: GeographicAreasOfInfluence;
  summary: string;
  major_contributions: MajorContribution[];
  notable_contemporaries: NotableContemporary[];
  counter_narratives?: CounterNarrative[];
  additional_metrics?: AdditionalMetric[];
  additional_reading: AdditionalReading[];
  sources?: Source[];
}

/**
 * API request body for analysis endpoint
 */
export interface AnalyzeRequest {
  personName: string;
}

/**
 * API response for analysis endpoint
 */
export interface AnalyzeResponse {
  status: 'existing' | 'new';
  result: HistoricalFigureAnalysis;
}

/**
 * API error response
 */
export interface AnalyzeErrorResponse {
  error: string;
}
