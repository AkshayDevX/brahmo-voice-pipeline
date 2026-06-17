import { db } from "../drizzle/index";
import {
  accuracyResults,
  knowledgeNodes,
  transcripts,
} from "../drizzle/schema";

async function clearDb() {
  console.log("Clearing accuracy_results, knowledge_nodes, and transcripts...");

  try {
    // Clear in order to respect foreign keys
    const _deletedNodes = await db.delete(knowledgeNodes);
    console.log("Cleared knowledge_nodes");

    const _deletedTranscripts = await db.delete(transcripts);
    console.log("Cleared transcripts");

    const _deletedResults = await db.delete(accuracyResults);
    console.log("Cleared accuracy_results");

    console.log("Database cleared successfully!");
  } catch (error) {
    console.error("Error clearing DB:", error);
  } finally {
    process.exit(0);
  }
}

clearDb();
