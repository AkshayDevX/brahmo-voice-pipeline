import * as dotenv from "dotenv";
import { getTestNotes, runBenchmark } from "../actions/benchmark";

dotenv.config({ path: ".env.local" });

async function runAll() {
  console.log("Loading test notes...");
  const notes = await getTestNotes();
  console.log(
    `Found ${notes.length} notes. Starting evaluation with 'sarvam'...`,
  );

  for (const note of notes) {
    console.log(`\n=================== ${note.id}: SARVAM ===================`);
    try {
      const _res = await runBenchmark(note.id, "sarvam");
      console.log(`Completed ${note.id}`);
    } catch (e) {
      console.error(`Error running benchmark for ${note.id} with sarvam:`, e);
    }
  }

  console.log("\nStarting evaluation with 'router'...");
  for (const note of notes) {
    console.log(`\n=================== ${note.id}: ROUTER ===================`);
    try {
      const _res = await runBenchmark(note.id, "router");
      console.log(`Completed ${note.id}`);
    } catch (e) {
      console.error(`Error running benchmark for ${note.id} with router:`, e);
    }
  }

  console.log("\nAll benchmarks completed successfully!");
  process.exit(0);
}

runAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
