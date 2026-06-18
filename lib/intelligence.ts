// Medical Intelligence Layer

import commonNames_JSON from "./common_names.json";
import DICTIONARY_JSON from "./dictionary.json";
import NEGATIONS_JSON from "./negations.json";
import NUMBERS_JSON from "./numbers.json";

export interface DictionaryEntry {
  term: string;
  mistranscriptions: string[];
}

export const DICTIONARY = DICTIONARY_JSON as DictionaryEntry[];
export const NEGATIONS = NEGATIONS_JSON as Record<string, string[]>;
export const commonNames = commonNames_JSON as string[];

const NUMBERS = NUMBERS_JSON as Record<string, Record<string, number>>;

/**
 * Normalizes a transcript by applying the Medical Intelligence Layer.
 */
export function processMedicalIntelligence(rawTranscript: string): string {
  let corrected = rawTranscript;

  // 1. Correct mistranscribed drugs
  // We use simple string replacement since these are multi-word phrases and Levenshtein might falsely match others.
  // We do case-insensitive replacements
  for (const entry of DICTIONARY) {
    for (const mistranscription of entry.mistranscriptions) {
      const regex = new RegExp(`\\b${mistranscription}\\b`, "gi");
      corrected = corrected.replace(regex, entry.term);
    }
  }

  // 2. Identify Negations and wrap them with a clear flag for the LLM
  // Deduplicate and sort by length descending to match longer phrases first
  const uniqueNegations = Array.from(
    new Set(Object.values(NEGATIONS).flat()),
  ).sort((a, b) => b.length - a.length);

  // Match in a single pass using a combined regex to prevent double-wrapping
  // Exclude "na" to prevent false positives in Tamil conditional suffixes and Sodium (Na) symbols
  const escapedNegations = uniqueNegations
    .filter((n) => n !== "na")
    .map((n) => n.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"));

  const negationRegex = new RegExp(
    `\\b(${escapedNegations.join("|")})\\b`,
    "gi",
  );
  corrected = corrected.replace(
    negationRegex,
    (match) => `[CRITICAL NEGATION: ${match}]`,
  );

  // Match "na" specifically, ensuring it's not preceded by Tamil conditional verbs / chemicals
  // and not followed by result keywords
  const naRegex =
    /(?<!\b(?:sodium|serum|poguthu|varthu|aana|venam)\s+)\bna\b(?!\s+(?:level|value|concentration|result))/gi;
  corrected = corrected.replace(
    naRegex,
    (match) => `[CRITICAL NEGATION: ${match}]`,
  );

  // 3. Extract dosages
  // We will normalize regional numbers to their numeric values
  const allNumberLangs = Object.values(NUMBERS);
  for (const numLangMap of allNumberLangs) {
    for (const [word, value] of Object.entries(numLangMap)) {
      if (word === "do") {
        // Keep do: 2 for assessment alignment, but restrict replacement so it only matches
        // when followed by numerical or dosage units (e.g. "do tablet", "do weeks")
        // to avoid replacing the extremely common Hindi verb 'do' (give).
        const regex =
          /\bdo\b(?=\s*(?:tablet|drop|spoon|capsule|mg|ml|unit|od|bd|tds|qds|prn|sos|stat|day|week|month|year|percent|%))/gi;
        corrected = corrected.replace(regex, `${value}`);
      } else if (word === "don") {
        // Protect Marathi "don" (2) from matching "don't"
        const regex = /\bdon\b(?!')/gi;
        corrected = corrected.replace(regex, `${value}`);
      } else if (word === "teen" || word === "bees" || word === "tin") {
        // Protect English words "teen", "bees", "tin" by requiring a dosage/time unit context
        const regex = new RegExp(
          `\\b${word}\\b(?=\\s*(?:tablet|drop|spoon|capsule|mg|ml|unit|od|bd|tds|qds|prn|sos|stat|day|week|month|year|percent|%))`,
          "gi",
        );
        corrected = corrected.replace(regex, `${value}`);
      } else {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        corrected = corrected.replace(regex, `${value}`);
      }
    }
  }

  // 4. PHI Stripping (Heuristic)
  for (const name of commonNames) {
    const regex = new RegExp(`\\b${name}\\b`, "gi");
    corrected = corrected.replace(regex, `[PATIENT]`);
  }

  return corrected;
}
