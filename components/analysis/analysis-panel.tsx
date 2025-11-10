'use client';

import { ScoreCard } from './score-card';
import { ImpactFields } from './impact-fields';
import { Timeline } from './timeline';
import { Contributions } from './contributions';
import { Sentiment } from './sentiment';
import { PersonalityTraits } from './personality-traits';
import { WorldMap } from './world-map';
import { HistoricalFigureAnalysis } from '@/app/api/analyze/types';

interface AnalysisPanelProps {
  data: { properties: HistoricalFigureAnalysis };
}

export function AnalysisPanel ({ data }: AnalysisPanelProps) {
  if (!data) {
    return null;
  }

  const {
    name = '',
    summary = '',
    worldly_impact_score,
    innovation_score,
    influence_score,
    longevity_score,
    reach_score,
    controversy_score,
    fields_of_impact = {},
    geographic_areas_of_influence = {},
    sentiment_index = {
      positive: 0,
      mixed   : 0,
      negative: 0
    },
    timeline_of_influence = [],
    major_contributions = [],
    personality_characteristics = {}
  } = data.properties || {};

  return (
    <div className="mt-8 h-full space-y-6 overflow-y-auto p-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{name}</h2>
        <p className="text-sm text-muted-foreground">{summary}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <ScoreCard
          title="World Impact"
          value={worldly_impact_score}
          description="Overall global influence and impact"
        />
        <ScoreCard
          title="Innovation"
          value={innovation_score}
          description="Contribution to new ideas and progress"
        />
        <ScoreCard
          title="Influence"
          value={influence_score}
          description="Overall breadth and depth of influence across domains"
        />
        <ScoreCard
          title="Longevity"
          value={longevity_score}
          description="Lasting impact over time"
        />
        <ScoreCard
          title="Reach"
          value={reach_score}
          description="Breadth of influence across different domains"
        />
        <ScoreCard
          title="Controversy"
          value={controversy_score}
          description="Level of debate and discussion generated"
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Fields of Impact</h3>
        <ImpactFields data={fields_of_impact as Record<string, number>} />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Geographic Influence</h3>
        <WorldMap data={geographic_areas_of_influence as Record<string, number>} />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Public Sentiment</h3>
        <Sentiment data={sentiment_index} />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Timeline</h3>
        <Timeline events={timeline_of_influence} />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Major Contributions</h3>
        <Contributions data={major_contributions} />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Personality Profile</h3>
        <PersonalityTraits data={personality_characteristics as { visionary: number; resilience: number; charisma: number; empathy: number; adaptability: number; controversial_nature: number; }} />
      </div>
    </div>
  );
}
