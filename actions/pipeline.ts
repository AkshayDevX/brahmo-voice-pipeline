"use server";

import { desc, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db } from "../drizzle/index"; // Assuming standard setup
import { knowledgeNodes, transcripts } from "../drizzle/schema";
import {
  extract_nodes_baseline_gpt_120b,
  extract_nodes_with_deepseek_v4_flash,
} from "../LLM/index";
import { processMedicalIntelligence } from "../lib/intelligence";

export async function runFullPipeline(
  rawTranscript: string,
  asrProvider: string = "whisper",
) {
  const startTime = Date.now();

  // 1. Intelligence Layer
  const correctedTranscript = processMedicalIntelligence(rawTranscript);

  // 2. Extract Nodes with our chosen model (e.g. deepseek-v4-flash)
  const ourNodes =
    await extract_nodes_with_deepseek_v4_flash(correctedTranscript);

  // Also run baselines for comparison
  const chatgptBaseline = await extract_nodes_baseline_gpt_120b(rawTranscript); // without intelligence layer

  const pipelineTimeMs = Date.now() - startTime;

  let transcriptId: number | null = null;

  // 3. Optional: Store the transcript in DB
  // This depends on the exact drizzle setup, so we wrap in try/catch in case db isn't exported perfectly
  try {
    if (db) {
      const [transcriptRecord] = await db
        .insert(transcripts)
        .values({
          doctorId: "DR-01", // Placeholder
          languageCode: "mix",
          asrProvider: asrProvider,
          rawTranscript: rawTranscript,
          correctedTranscript: correctedTranscript,
          status: "PENDING",
          pipelineTimeMs: pipelineTimeMs,
        })
        .returning();

      transcriptId = transcriptRecord.id;

      // Insert nodes
      if (ourNodes && Array.isArray(ourNodes)) {
        const validTypes = ["CONSTRAINT", "DECISION", "ANTI_PATTERN", "FACT"];
        const nodeInserts = ourNodes.map((n) => {
          const rawType = (n.type || "").toUpperCase();
          const type = validTypes.includes(rawType) ? rawType : "FACT";
          return {
            orgId: "supra",
            type: type as "CONSTRAINT" | "DECISION" | "ANTI_PATTERN" | "FACT",
            title: n.title || "Untitled Node",
            content: n.content || "",
            importance: n.importance ? String(n.importance) : "0.5",
            sourceTranscriptId: transcriptRecord.id,
            createdBy: "SYSTEM",
          };
        });
        if (nodeInserts.length > 0) {
          await db.insert(knowledgeNodes).values(nodeInserts);
        }
      }
    }
  } catch (e) {
    console.warn(
      "DB insertion skipped or failed. Ensure drizzle is connected.",
      e,
    );
  }

  return {
    transcriptId,
    rawTranscript,
    correctedTranscript,
    ourNodes,
    baselines: {
      chatgpt: chatgptBaseline,
    },
    pipelineTimeMs,
  };
}

/**
 * Confirms a doctor's review and finalized knowledge nodes
 */
export async function confirmDoctorReviewAction(
  transcriptId: number,
  confirmedTranscript: string,
  finalNodes: Array<{
    type: string;
    title: string;
    content: string;
    importance: number;
  }>,
) {
  try {
    if (!db) throw new Error("DB not connected");

    // 1. Update the transcript status and text
    await db
      .update(transcripts)
      .set({
        confirmedTranscript: confirmedTranscript,
        status: "COMPLETED",
        confirmedAt: new Date(),
      })
      .where(eq(transcripts.id, transcriptId));

    // 2. Delete existing draft nodes for this transcript
    await db
      .delete(knowledgeNodes)
      .where(eq(knowledgeNodes.sourceTranscriptId, transcriptId));

    // 3. Insert finalized nodes
    if (finalNodes && finalNodes.length > 0) {
      const nodeInserts = finalNodes.map((n) => ({
        orgId: "supra",
        type: (n.type || "FACT") as any,
        title: n.title || "Untitled Node",
        content: n.content || "",
        importance: String(n.importance || 0.5),
        sourceTranscriptId: transcriptId,
        createdBy: "DOCTOR_REVIEW",
      }));
      await db.insert(knowledgeNodes).values(nodeInserts);
    }

    updateTag("ehr-records");
    return { success: true };
  } catch (e: any) {
    console.error("Error in confirmDoctorReviewAction:", e);
    return {
      success: false,
      error: e.message || "Failed to confirm doctor review",
    };
  }
}

export async function getConfirmedEhrRecords() {
  try {
    if (!db) return [];

    // Fetch completed transcripts
    const completedTranscripts = await db
      .select()
      .from(transcripts)
      .where(eq(transcripts.status, "COMPLETED"))
      .orderBy(desc(transcripts.confirmedAt));

    // Fetch doctor reviewed nodes
    const nodes = await db
      .select()
      .from(knowledgeNodes)
      .where(eq(knowledgeNodes.createdBy, "DOCTOR_REVIEW"));

    // Map nodes to their respective transcripts
    const records = completedTranscripts.map((t) => ({
      ...t,
      knowledgeNodes: nodes.filter((n) => n.sourceTranscriptId === t.id),
    }));

    return records;
  } catch (e) {
    console.error("Error fetching EHR records:", e);
    return [];
  }
}
