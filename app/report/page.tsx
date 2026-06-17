import { Suspense } from "react";
import {
  getCachedAccuracyResults,
  getCachedAsrEvaluations,
  getCachedCostAnalysis,
} from "../../actions/cache";
import AsrEvaluationReport from "../../components/AsrEvaluationReport";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-zinc-500 animate-pulse font-medium">
            Loading ASR evaluation report...
          </p>
        </div>
      }
    >
      <ReportContainer />
    </Suspense>
  );
}

async function ReportContainer() {
  const evaluations = await getCachedAsrEvaluations();
  const costs = await getCachedCostAnalysis();
  const results = await getCachedAccuracyResults();

  return (
    <AsrEvaluationReport
      evaluations={evaluations}
      costs={costs}
      results={results}
    />
  );
}
