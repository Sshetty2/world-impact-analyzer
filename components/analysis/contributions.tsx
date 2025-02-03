interface Contribution {
  title: string;
  summary: string;
}

interface ContributionsProps {
  data: Contribution[];
}

export function Contributions ({ data }: ContributionsProps) {
  return (
    <div className="space-y-3">
      {data.map((contribution, index) => (
        <div
          key={index}
          className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/5"
        >
          <h4 className="mb-1 font-medium">{contribution.title}</h4>
          <p className="text-sm text-muted-foreground">{contribution.summary}</p>
        </div>
      ))}
    </div>
  );
}
