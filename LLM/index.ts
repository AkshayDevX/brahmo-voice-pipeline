import { JsonOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";

export const gpt_120b = new ChatGroq({
  model: "openai/gpt-oss-20b",
  maxRetries: 2,
  temperature: 0,
});

// OUR pipeline prompt — understands intelligence layer tags and extracts precise clinical nodes
const promptTemplate = `You are a clinical knowledge extraction AI specialized in Indian multilingual medical transcripts.

The transcript below has been pre-processed by a Medical Intelligence Layer:
- Drug names have been corrected from phonetic mistranscriptions
- Regional negations have been tagged as [CRITICAL NEGATION: word] — these are CRITICAL safety markers
- Patient names have been replaced with [PATIENT] for privacy
- Regional numbers have been converted to digits
- Medical abbreviations (QDS, BD, OD, HS) are standardized

Extract ALL clinical knowledge nodes. For each node, classify it:
- "CONSTRAINT": Things that must NOT be done (contraindications, drug allergies, refusals). Look for [CRITICAL NEGATION] tags.
- "DECISION": Active clinical decisions (new medication, dose change, discharge, referral)
- "ANTI_PATTERN": Dangerous patterns or risky behavior (patient non-compliance, family interference, repeated unsafe requests)
- "FACT": Clinical observations, vitals, lab values, current medications

Be thorough — extract EVERY clinically relevant piece of information. A single voice note may contain 5-10 nodes.
For CONSTRAINT nodes, explicitly state what must NOT be done and WHY.

Output a JSON array of objects with keys: type, title, content, importance (0.00-1.00).
Do not include markdown formatting like \`\`\`json.

Voice note:
{note}
`;

// BASELINE prompt — this is exactly what you'd paste into ChatGPT/generic AI
// Per assessment: "feed the same text, ask it to extract clinical knowledge"
// NO structured format help, NO node type guidance — let the generic AI figure it out
const baselinePromptTemplate = `Extract clinical knowledge nodes from this doctor's voice note.

Voice note:
{note}`;

const parser = new JsonOutputParser();
const prompt = PromptTemplate.fromTemplate(promptTemplate);

export const extract_nodes_with_deepseek_v4_pro = async (note: string) => {
  if (!note || !note.trim()) {
    return [];
  }
  const chain = prompt.pipe(deepseek_v4_pro).pipe(parser);
  try {
    const result = await chain.invoke({ note });
    return result;
  } catch (error) {
    console.error("DeepSeek V4 Pro Error extracting nodes:", error);
    return [];
  }
};

export const extract_nodes_baseline_gpt_120b = async (note: string) => {
  if (!note || !note.trim()) {
    return [];
  }
  // For baseline: we still need JSON parsing, so we use a minimal wrapper
  // but the actual extraction prompt is generic
  const baselineWithFormat = PromptTemplate.fromTemplate(
    `${baselinePromptTemplate}

Respond with a JSON array. Do not include markdown formatting.`,
  );
  const chain = baselineWithFormat.pipe(gpt_120b).pipe(parser);
  try {
    const result = await chain.invoke({ note });
    return result;
  } catch (error) {
    console.error("Baseline GPT Error extracting nodes:", error);
    return [];
  }
};

export const deepseek_v4_pro = new ChatDeepSeek({
  model: "deepseek-v4-pro",
  maxRetries: 4,
  temperature: 0,
});

export const deepseek_v4_flash = new ChatDeepSeek({
  model: "deepseek-v4-flash",
  maxRetries: 4,
  temperature: 0,
});

export const extract_nodes_with_deepseek_v4_flash = async (note: string) => {
  if (!note || !note.trim()) {
    return [];
  }
  const chain = prompt.pipe(deepseek_v4_flash).pipe(parser);
  try {
    const result = await chain.invoke({ note });
    return result;
  } catch (error) {
    console.error("Deepseek Error extracting nodes:", error);
    return [];
  }
};

// --- Gemini (Second Baseline) ---
export const gemini_flash = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
  maxRetries: 3,
  temperature: 0,
});

export const extract_nodes_baseline_gemini = async (note: string) => {
  if (!note || !note.trim()) {
    return [];
  }
  const baselineWithFormat = PromptTemplate.fromTemplate(
    `${baselinePromptTemplate}

Respond with a JSON array. Do not include markdown formatting.`,
  );
  const chain = baselineWithFormat.pipe(gemini_flash).pipe(parser);
  try {
    const result = await chain.invoke({ note });
    return result;
  } catch (error) {
    console.error("Baseline Gemini Error extracting nodes:", error);
    return [];
  }
};
