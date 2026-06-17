import { Suspense } from "react";
import { getCachedConfirmedEhrRecords } from "../../actions/cache";
import EhrRecordsView from "../../components/EhrRecordsView";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-zinc-500 animate-pulse font-medium">
            Loading saved EHR records...
          </p>
        </div>
      }
    >
      <EhrRecordsContainer />
    </Suspense>
  );
}

async function EhrRecordsContainer() {
  const records = await getCachedConfirmedEhrRecords();
  return <EhrRecordsView records={records} />;
}
