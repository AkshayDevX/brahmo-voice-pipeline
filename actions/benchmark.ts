"use server";

import fs from "node:fs";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db } from "../drizzle/index";
import {
  accuracyResults,
  asrEvaluations,
  costAnalysis,
} from "../drizzle/schema";
import { commonNames, DICTIONARY } from "../lib/intelligence";
import { calculateMTA, calculateWER } from "../scripts/evaluate";
import {
  transcribeWithDeepgram,
  transcribeWithLocalIndicConformer,
  transcribeWithRouterEnsemble,
  transcribeWithSarvam,
  transcribeWithShunyalabs,
  transcribeWithWhisper,
} from "./asr";
import { runFullPipeline } from "./pipeline";

function getLanguageCode(langStr: string): string {
  const lower = langStr.toLowerCase();
  if (lower.includes("telugu")) return "te";
  if (lower.includes("hindi")) return "hi";
  if (lower.includes("tamil")) return "ta";
  if (lower.includes("kannada")) return "kn";
  if (lower.includes("malayalam")) return "ml";
  if (lower.includes("marathi")) return "mr";
  if (lower.includes("bengali")) return "bn";
  if (lower.includes("gujarati")) return "gu";
  return "en"; // fallback
}

export type Note = {
  id: string;
  title: string;
  languages: string;
  doctor: string;
  context: string;
  transcript: string;
  translation: string;
  expected_nodes: Array<{ type: string; content: string }>;
  why_fails: string[];
};

export async function getTestNotes(): Promise<Note[]> {
  const filePath = path.join(process.cwd(), "lib", "notes.json");
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data) as Note[];
}

export async function getAccuracyResults() {
  if (!db) return [];
  try {
    return await db.select().from(accuracyResults);
  } catch (e) {
    console.error("Failed to load accuracy results", e);
    return [];
  }
}

export async function getAsrEvaluations() {
  if (!db) return [];
  try {
    return await db.select().from(asrEvaluations);
  } catch (e) {
    console.error("Failed to load ASR evaluations", e);
    return [];
  }
}

export async function getCostAnalysis() {
  if (!db) return [];
  try {
    return await db.select().from(costAnalysis);
  } catch (e) {
    console.error("Failed to load cost analysis", e);
    return [];
  }
}

// Known regional negation words
const NEGATION_WORDS = [
  "ivvakudadu",
  "ivvaledu",
  "kudadu",
  "vaddu",
  "vaddhu",
  "aapeyandi",
  "cheyakudadu",
  "aapandi",
  "mat do",
  "nahi",
  "mat karo",
  "band karo",
  "nahi dena",
  "mat dena",
  "rok do",
  "hatao",
  "kudadhu",
  "vendaam",
  "vendam",
  "venda",
  "pannakudadhu",
  "kodukka kudadhu",
  "paadilla",
  "aruthhu",
  "kodukkaruthhu",
  "cheyyaruthhu",
  "nako",
  "nahi",
  "deu naka",
  "band kara",
  "beda",
  "kodabaradu",
  "baralla",
  "maadabaradu",
];

/**
 * Normalizes corrected text for WER comparison by removing tags and restoring names
 */
function cleanTranscriptForWer(correctedText: string, refText: string): string {
  // 1. Remove CRITICAL NEGATION tags (keep the word)
  let cleaned = correctedText.replace(
    /\[CRITICAL NEGATION:\s*([^\]]+)\]/gi,
    "$1",
  );

  // 2. Restore patient name (replace [PATIENT] with the actual name in refText)
  const patientName = commonNames.find((name) =>
    new RegExp(`\\b${name}\\b`, "i").test(refText),
  );
  if (patientName) {
    cleaned = cleaned.replace(/\[PATIENT\]/gi, patientName);
  } else {
    cleaned = cleaned.replace(/\[PATIENT\]/gi, "patient");
  }

  return cleaned;
}

/**
 * Evaluates node extraction accuracy.
 *
 * For each expected node, we check if the extracted output captures the clinical INTENT:
 * - Correct node type (CONSTRAINT vs DECISION vs FACT)
 * - Key clinical terms present (drug names, conditions, actions)
 *
 * Uses strict 1:1 matching with a minimum threshold.
 */
function evaluateNodes(extracted: any, expected: any[]): number {
  if (!extracted || !Array.isArray(extracted) || extracted.length === 0)
    return 0;
  if (!expected || expected.length === 0) return 1;

  let matchedCount = 0;
  const usedIndices = new Set<number>();

  for (const exp of expected) {
    // Extract clinical keywords: drug names, conditions, numbers, actions
    // Filter out very short words and common filler words
    const fillerWords = new Set([
      "the",
      "and",
      "for",
      "with",
      "from",
      "that",
      "this",
      "was",
      "has",
      "had",
      "been",
      "also",
      "not",
      "but",
    ]);
    const keywords = exp.content
      .toLowerCase()
      .replace(/[—→()/,;.]/g, " ")
      .split(/\s+/)
      .filter((w: string) => w.length > 2 && !fillerWords.has(w));

    if (keywords.length === 0) continue;

    let bestMatchIdx = -1;
    let bestMatchScore = 0;

    for (let i = 0; i < extracted.length; i++) {
      if (usedIndices.has(i)) continue;

      const nodeStr = JSON.stringify(extracted[i]).toLowerCase();

      // Check keyword overlap
      const matchingKeywords = keywords.filter((k: string) =>
        nodeStr.includes(k),
      );
      let score = matchingKeywords.length / keywords.length;

      // Bonus for matching node type correctly
      if (
        exp.type &&
        extracted[i].type &&
        exp.type.toUpperCase() === (extracted[i].type || "").toUpperCase()
      ) {
        score += 0.15;
      }

      // Bonus for negation-related nodes that correctly identify the negation
      if (exp.type === "CONSTRAINT") {
        const hasNegationIndicator =
          /\b(not|don't|do not|must not|cannot|stop|avoid|discontinue|refus|contraindic|no oral|no nsaid)/i.test(
            nodeStr,
          );
        if (hasNegationIndicator) score += 0.1;
      }

      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatchIdx = i;
      }
    }

    // Require meaningful overlap to count as a match
    if (bestMatchIdx >= 0 && bestMatchScore >= 0.3) {
      matchedCount++;
      usedIndices.add(bestMatchIdx);
    }
  }

  return Math.min(matchedCount / expected.length, 1.0);
}

/**
 * Checks whether critical negations are preserved in the output.
 * This is a CLINICAL SAFETY check — not a keyword game.
 */
function checkNegationPreservation(
  transcript: string,
  extractedNodes: any,
): boolean {
  const transcriptLower = transcript.toLowerCase();

  // Find which negation words appear in the original transcript
  const presentNegations = NEGATION_WORDS.filter((neg) =>
    transcriptLower.includes(neg.toLowerCase()),
  );

  if (presentNegations.length === 0) return true; // No negations to preserve

  const nodesStr = JSON.stringify(extractedNodes).toLowerCase();

  // The negation must be reflected in the output — either as the original word
  // or as English equivalents indicating "do not do X"
  // NOTE: Excluded node type names like "anti_pattern", "constraint", "warning" to avoid false positives!
  const negationIndicators = [
    "do not",
    "don't",
    "must not",
    "cannot",
    "should not",
    "shouldn't",
    "does not",
    "doesn't",
    "doesnt",
    "no response",
    "not respond",
    "without",
    "if no",
    "if not",
    "stop",
    "avoid",
    "discontinue",
    "refusal",
    "refused",
    "no oral",
    "not give",
    "don't give",
    "contraindicated",
    "not recommended",
    "critical negation",
    "no nsaid",
    "ivvakudadu",
    "ivvaledu",
    "kudadhu",
    "mat do",
    "paadilla",
    "venda",
    "nako",
    "beda",
    ...presentNegations,
  ];

  return negationIndicators.some((indicator) =>
    nodesStr.includes(indicator.toLowerCase()),
  );
}

/**
 * Determines danger level based on clinical safety impact.
 */
function assessDangerLevel(
  note: Note,
  ourAccuracy: number,
  chatgptAccuracy: number,
  ourNegationPreserved: boolean,
  chatgptNegationPreserved: boolean,
): {
  ourDangerLevel: "SAFE" | "MODERATE" | "CRITICAL";
  isGenericDangerous: boolean;
  hasNegation: boolean;
} {
  // Check if this note has negation-critical content
  const hasNegation = note.why_fails.some((f) => {
    const fl = f.toLowerCase();
    return (
      fl.includes("negation") ||
      fl.includes("ivvakudadu") ||
      fl.includes("must not") ||
      fl.includes("don't give") ||
      fl.includes("kudadhu") ||
      fl.includes("mat do") ||
      fl.includes("ivvaledu") ||
      fl.includes("paadilla") ||
      fl.includes("critical")
    );
  });

  // 1. Calculate danger level of OUR pipeline
  let ourDangerLevel: "SAFE" | "MODERATE" | "CRITICAL" = "SAFE";
  if ((hasNegation && !ourNegationPreserved) || ourAccuracy < 0.3) {
    ourDangerLevel = "CRITICAL";
  } else if (ourAccuracy < 0.7) {
    ourDangerLevel = "MODERATE";
  }

  // 2. Calculate if Generic AI (ChatGPT) is dangerous
  const chatgptNegationCritical = hasNegation && !chatgptNegationPreserved;
  const delta = ourAccuracy - chatgptAccuracy;
  const isGenericDangerous =
    chatgptNegationCritical ||
    (delta > 0.15 && hasNegation) ||
    chatgptAccuracy < 0.5;

  return {
    ourDangerLevel,
    isGenericDangerous,
    hasNegation,
  };
}

export async function runBenchmark(noteId: string, asrProvider: string) {
  const notes = await getTestNotes();
  const note = notes.find((n) => n.id === noteId);
  if (!note) throw new Error("Note not found");

  let transcriptToProcess = note.transcript;
  let actualWer = 0;
  let asrFailed = false;

  const langHint = getLanguageCode(note.languages);

  // Attempt to use REAL ASR if the audio file exists
  const audioPath = path.join(process.cwd(), "audio_tests", `${note.id}.wav`);
  if (fs.existsSync(audioPath)) {
    const audioBuffer = fs.readFileSync(audioPath);
    console.log(`Audio found for ${note.id}, running real ASR: ${asrProvider}`);
    try {
      if (asrProvider === "whisper") {
        transcriptToProcess = await transcribeWithWhisper(audioBuffer);
      } else if (asrProvider === "deepgram") {
        transcriptToProcess = await transcribeWithDeepgram(
          audioBuffer,
          "multi",
        );
      } else if (asrProvider === "shunyalabs") {
        transcriptToProcess = await transcribeWithShunyalabs(audioBuffer);
      } else if (asrProvider === "sarvam") {
        transcriptToProcess = await transcribeWithSarvam(audioBuffer, langHint);
      } else if (asrProvider === "indic-conformer") {
        transcriptToProcess = await transcribeWithLocalIndicConformer(
          audioBuffer,
          langHint,
        );
      } else if (asrProvider === "bilingual-auto") {
        const res = await transcribeWithRouterEnsemble(
          audioBuffer,
          "bilingual-auto",
        );
        transcriptToProcess = res.transcript;
      } else if (asrProvider === "router") {
        const res = await transcribeWithRouterEnsemble(audioBuffer, langHint);
        transcriptToProcess = res.transcript;
      }

      actualWer = calculateWER(note.transcript, transcriptToProcess);
      console.log(
        `Raw ASR WER for ${note.id} with ${asrProvider}: ${(actualWer * 100).toFixed(2)}%`,
      );
    } catch (e) {
      console.error(
        `ASR Failed for ${noteId} using ${asrProvider}. Recording as failed.`,
        e,
      );
      transcriptToProcess = "";
      actualWer = 1.0; // 100% WER on failure
      asrFailed = true;
    }
  } else {
    console.log(
      `No audio found for ${note.id}, falling back to ground-truth text.`,
    );
  }

  // Run the intelligence pipeline
  const results = await runFullPipeline(transcriptToProcess, asrProvider);

  // Recalculate actualWer on the corrected transcript (clean off LLM formatting tags)
  if (!asrFailed && results.correctedTranscript) {
    const werTranscript = cleanTranscriptForWer(
      results.correctedTranscript,
      note.transcript,
    );
    actualWer = calculateWER(note.transcript, werTranscript);
    console.log(
      `Corrected WER for ${note.id} with ${asrProvider}: ${(actualWer * 100).toFixed(2)}%`,
    );
  }

  if (!db) {
    console.warn("DB not connected, skipping DB upsert");
    return { success: true, results };
  }

  // Find present medical terms in the reference transcript for MTA calculation
  const refMedicalTerms = DICTIONARY.map((d) => d.term).filter((term) =>
    new RegExp(`\\b${term}\\b`, "i").test(note.transcript),
  );

  // Calculate metrics
  const ourMta = asrFailed
    ? 0
    : calculateMTA(refMedicalTerms, results.correctedTranscript);
  const yourNodeAcc = asrFailed
    ? 0
    : evaluateNodes(results.ourNodes, note.expected_nodes);
  const chatgptNodeAcc = evaluateNodes(
    results.baselines?.chatgpt,
    note.expected_nodes,
  );

  // Check negation preservation for BOTH our pipeline and the baseline
  const ourNegationPreserved = asrFailed
    ? false
    : checkNegationPreservation(note.transcript, results.ourNodes);
  const chatgptNegationPreserved = checkNegationPreservation(
    note.transcript,
    results.baselines?.chatgpt,
  );

  // Assess danger level
  const danger = assessDangerLevel(
    note,
    yourNodeAcc,
    chatgptNodeAcc,
    ourNegationPreserved,
    chatgptNegationPreserved,
  );

  const dataPayload = {
    voiceNoteId: noteId,
    language: note.languages,
    specialty: note.title,
    yourProvider: asrProvider,
    yourTranscript: results.correctedTranscript,
    yourWer: (actualWer * 100).toFixed(2),
    yourNodesExtracted: results.ourNodes,
    yourNodeCount: results.ourNodes?.length || 0,
    yourNodeAccuracy: (yourNodeAcc * 100).toFixed(2),
    yourMedicalTermAccuracy: (ourMta * 100).toFixed(2),
    yourNegationPreserved: ourNegationPreserved,
    chatgptOutput: JSON.stringify(results.baselines?.chatgpt),
    chatgptNodes: results.baselines?.chatgpt,
    chatgptNodeAccuracy: (chatgptNodeAcc * 100).toFixed(2),
    baseline2Name: null,
    baseline2Output: null,
    baseline2NodeAccuracy: null,
    dangerLevel: danger.ourDangerLevel,
    negationCritical: danger.hasNegation,
    genericAiDangerous: danger.isGenericDangerous,
    testedAt: new Date(),
  };

  try {
    const existing = await db
      .select()
      .from(accuracyResults)
      .where(
        and(
          eq(accuracyResults.voiceNoteId, noteId),
          eq(accuracyResults.yourProvider, asrProvider),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(accuracyResults)
        .set(dataPayload as any)
        .where(eq(accuracyResults.id, existing[0].id));
    } else {
      await db.insert(accuracyResults).values(dataPayload as any);
    }
    updateTag("accuracy-results");
  } catch (e) {
    console.error("DB Upsert failed:", e);
  }

  return { success: true, results, row: dataPayload };
}
