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
        <div className="text-center text-base font-medium text-zinc-200">
          {status.message}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="mb-2 text-base font-medium text-zinc-200">
        Enter a person&apos;s name above to analyze their public presence and personality traits.
      </p>
      <br />
      <p className="text-base font-medium text-zinc-200">
        Once analyzed, you can chat about the results and explore insights about their character, impact, and influence.
      </p>
    </div>
  );
}
