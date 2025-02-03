interface SentimentProps {
  data: {
    positive: number;
    mixed: number;
    negative: number;
  };
}

export function Sentiment ({ data }: SentimentProps) {
  return (
    <div className="flex gap-4">
      {Object.entries(data).map(([type, value]) => (
        <div
          key={type}
          className="flex-1 rounded-lg border bg-card p-3"
        >
          <div className="mb-1 text-sm font-medium capitalize">{type}</div>
          <div className="text-2xl font-bold">
            {Math.round(value * 100)}%
          </div>
        </div>
      ))}
    </div>
  );
}
