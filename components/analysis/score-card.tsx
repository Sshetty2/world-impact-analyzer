interface ScoreCardProps {
  title: string;
  value: number;
  description: string;
}

export function ScoreCard ({ title, value, description }: ScoreCardProps) {
  const getColor = (_value: number) => {
    if (_value >= 90) {
      return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
    }

    if (_value >= 70) {
      return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
    }

    if (_value >= 40) {
      return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
    }

    return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300';
  };

  return (
    <div
      className={`rounded-lg p-4 transition-colors ${getColor(value)} cursor-help hover:scale-105`}
      title={description}
    >
      <div className="text-sm font-medium">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
