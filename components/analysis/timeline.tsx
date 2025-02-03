interface TimelineEvent {
  year: string;
  event: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline ({ events }: TimelineProps) {
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div
          key={index}
          className="relative flex gap-4 pl-6 before:absolute before:left-2 before:top-2 before:size-2 before:rounded-full before:bg-primary before:content-[''] after:absolute after:left-[11px] after:top-4 after:h-full after:w-px after:bg-border after:content-['']"
        >
          <div className="min-w-16 font-mono text-sm text-muted-foreground">
            {event.year}
          </div>
          <p className="pb-4 text-sm">{event.event}</p>
        </div>
      ))}
    </div>
  );
}
