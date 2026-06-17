import { cacheLife, cacheTag } from "next/cache";
import {
  getAccuracyResults,
  getAsrEvaluations,
  getCostAnalysis,
  getTestNotes,
} from "./benchmark";
import { getConfirmedEhrRecords } from "./pipeline";

export async function getCachedTestNotes() {
  "use cache";
  cacheLife("days");
  return getTestNotes();
}

export async function getCachedAccuracyResults() {
  "use cache";
  cacheTag("accuracy-results");
  return getAccuracyResults();
}

export async function getCachedAccuracyResultsForAsr(asrProvider: string) {
  "use cache";
  cacheTag("accuracy-results");
  const allResults = await getAccuracyResults();
  return allResults.filter((r) => r.yourProvider === asrProvider);
}

export async function getCachedAsrEvaluations() {
  "use cache";
  cacheTag("asr-evaluations");
  cacheLife("days");
  return getAsrEvaluations();
}

export async function getCachedCostAnalysis() {
  "use cache";
  cacheTag("cost-analysis");
  cacheLife("days");
  return getCostAnalysis();
}

export async function getCachedConfirmedEhrRecords() {
  "use cache";
  cacheTag("ehr-records");
  return getConfirmedEhrRecords();
}
