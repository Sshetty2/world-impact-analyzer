export interface Analysis {
  status: string;
  result: AnalysisResult;
}

export interface AnalysisResult {
  name: string;
  worldly_impact_score: number;
  reach_score: number;
  controversy_score: number;
  longevity_score: number;
  innovation_score: number;
  fields_of_impact: Record<string, number>;
  sentiment_index: {
    positive: number;
    mixed: number;
    negative: number;
  };
  citations_count: number | null;
  timeline_of_influence: Array<{
    year: string;
    event: string;
  }>;
  geographic_areas_of_influence: Record<string, number>;
  summary: string;
  major_contributions: Array<{
    title: string;
    summary: string;
  }>;
  influence_score: number;
  personality_characteristics: {
    visionary: number;
    resilience: number;
    charisma: number;
    empathy: number;
    adaptability: number;
    controversial_nature: number;
  };

  // Add other types as needed
}
