import { Progress } from './ui/progress';

export function AnalysisStatus ({
  isAnalyzing,
  status
}: {
  isAnalyzing: boolean;
  status: { message: string; progress: number } | null;
}) {
  if (isAnalyzing && status) {
    return (
      <div className="mx-auto mt-4 w-full max-w-3xl space-y-3">
        <Progress
          value={status.progress}
          className="h-2 w-full"
        />
        <div className="text-center text-sm text-muted-foreground">
          {status.message}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl text-center text-sm text-muted-foreground">
      <p className="mb-2">
        Enter a person&apos;s name above to analyze their public presence and personality traits.
      </p>
      <br />
      <p>
        Once analyzed, you can chat about the results and explore insights about their character, impact, and influence.
      </p>
    </div>
  );
}
