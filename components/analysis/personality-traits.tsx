'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';

interface PersonalityTraitsProps {
  data: {
    visionary: number;
    resilience: number;
    charisma: number;
    empathy: number;
    adaptability: number;
    controversial_nature: number;
  };
}

const OFFSET_MAP: Record<string, number> = {
  resilience          : -20,
  charisma            : -20,
  adaptability        : 20,
  controversial_nature: 40
};

export function PersonalityTraits ({ data }: PersonalityTraitsProps) {
  const radarData = Object.entries(data).map(([key, value]) => ({
    trait: key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    value
  }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        {Object.entries(data).map(([trait, value]) => (
          <div
            key={trait}
            className="space-y-1"
          >
            <div className="flex justify-between text-sm">
              <span className="font-medium capitalize">
                {trait
                  .split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </span>
              <span className="text-muted-foreground">{value}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-secondary">
              <div
                className="h-2.5 rounded-full bg-primary transition-all"
                style={{
                  width  : `${value}%`,
                  opacity: 0.8
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="75%"
            data={radarData}
          >
            <PolarGrid
              className="text-muted-foreground"
              stroke="currentColor"
              strokeOpacity={0.2}
            />
            <PolarAngleAxis
              dataKey="trait"
              className="text-xs font-medium"
              tick={({ payload : { value }, x, y, textAnchor }) => {
                const dx = OFFSET_MAP[value.toLowerCase().replace(' ', '_')] ?? 0;

                return (
                  <g className="recharts-layer recharts-polar-angle-axis-tick">
                    <text
                      x={x}
                      y={y}
                      className="fill-current text-xs font-medium"
                      textAnchor={textAnchor}
                      dx={dx}
                    >
                      {value}
                    </text>
                  </g>
                );
              }}
            />
            <Radar
              name="Traits"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
