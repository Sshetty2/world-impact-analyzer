'use client';

import { ScoreCard } from './score-card';
import { ImpactFields } from './impact-fields';
import { Timeline } from './timeline';
import { Contributions } from './contributions';
import { Sentiment } from './sentiment';
import { PersonalityTraits } from './personality-traits';
import { useEffect } from 'react';
import { WorldMap } from './world-map';

interface AnalysisPanelProps {
  data: any; // We'll type this properly later
}

export function AnalysisPanel ({ data }: AnalysisPanelProps) {
  useEffect(() => {
    console.log({ data });
  }, [data]);

  if (!data) {
    return null;
  }

  return (
    <div className="h-full space-y-6 overflow-y-auto p-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{data.name}</h2>
        <p className="text-sm text-muted-foreground">{data.summary}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <ScoreCard
          title="World Impact"
          value={data.worldly_impact_score}
          description="Overall global influence and impact"
        />
        <ScoreCard
          title="Innovation"
          value={data.innovation_score}
          description="Contribution to new ideas and progress"
        />
        <ScoreCard
          title="Influence"
          value={data.influence_score}
          description="Overall breadth and depth of influence across domains"
        />
        <ScoreCard
          title="Longevity"
          value={data.longevity_score}
          description="Lasting impact over time"
        />
        <ScoreCard
          title="Reach"
          value={data.reach_score}
          description="Breadth of influence across different domains"
        />
        <ScoreCard
          title="Controversy"
          value={data.controversy_score}
          description="Level of debate and discussion generated"
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Fields of Impact</h3>
        <ImpactFields data={data.fields_of_impact} />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Geographic Influence</h3>
        <WorldMap data={data.geographic_areas_of_influence} />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Public Sentiment</h3>
        <Sentiment data={data.sentiment_index} />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Timeline</h3>
        <Timeline events={data.timeline_of_influence} />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Major Contributions</h3>
        <Contributions data={data.major_contributions} />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Personality Profile</h3>
        <PersonalityTraits data={data.personality_characteristics} />
      </div>
    </div>
  );
}
