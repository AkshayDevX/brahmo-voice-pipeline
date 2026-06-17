import { Suspense } from "react";
import {
  getCachedTestNotes,
  getCachedAccuracyResultsForAsr,
} from "../../actions/cache";
import BenchmarkDashboard from "../../components/BenchmarkDashboard";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ asr?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-zinc-500 animate-pulse font-medium">
            Loading accuracy benchmarking platform...
          </p>
        </div>
      }
    >
      <BenchmarkContainer searchParams={searchParams} />
    </Suspense>
  );
}

async function BenchmarkContainer({
  searchParams,
}: {
  searchParams: Promise<{ asr?: string }>;
}) {
  const { asr } = await searchParams;
  const asrProvider = asr || "sarvam";

  const notes = await getCachedTestNotes();
  const results = await getCachedAccuracyResultsForAsr(asrProvider);

  return (
    <BenchmarkDashboard
      notes={notes}
      initialResults={results}
      asrProvider={asrProvider}
    />
  );
}
