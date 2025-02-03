interface ImpactFieldsProps {
  data: Record<string, number>;
}

export function ImpactFields ({ data }: ImpactFieldsProps) {
  return (
    <div className="-ml-4 mr-1 grid grid-cols-2 gap-4 rounded-lg">
      {Object.entries(data).map(([field, value]) => (
        <div
          key={field}
          className="flex items-center gap-3"
        >
          <span className="min-w-[100px] text-right text-sm font-medium">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </span>
          <div className="h-2 w-full rounded-full bg-secondary">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${value}%` }}
            />
          </div>

        </div>
      ))}
    </div>
  );
}
