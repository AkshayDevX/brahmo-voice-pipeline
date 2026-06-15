import { defineRelations } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// --- PostgreSQL Enums ---
export const nodeTypeEnum = pgEnum("node_type", [
  "CONSTRAINT",
  "DECISION",
  "ANTI_PATTERN",
  "FACT",
]);

export const codeSwitchSupportEnum = pgEnum("code_switch_support", [
  "native",
  "workaround",
  "none",
]);

export const dangerLevelEnum = pgEnum("danger_level", [
  "SAFE",
  "MODERATE",
  "CRITICAL",
]);

// --- Database Tables ---
export const transcripts = pgTable("transcripts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  doctorId: text("doctor_id").notNull(),
  patientId: text("patient_id"),
  languageCode: text("language_code").notNull(),
  asrProvider: text("asr_provider").notNull(),
  asrProviderReason: text("asr_provider_reason"),
  rawTranscript: text("raw_transcript").notNull(),
  correctedTranscript: text("corrected_transcript"),
  confirmedTranscript: text("confirmed_transcript"),
  correctionsApplied: jsonb("corrections_applied"),
  segments: jsonb("segments"),
  overallConfidence: decimal("overall_confidence", { precision: 3, scale: 2 }),
  status: text("status").default("PENDING"),
  pipelineTimeMs: integer("pipeline_time_ms"),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const knowledgeNodes = pgTable("knowledge_nodes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  orgId: text("org_id").default("supra").notNull(),
  type: nodeTypeEnum("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  importance: decimal("importance", { precision: 3, scale: 2 }).notNull(),
  department: text("department"),
  hierarchyLevel: integer("hierarchy_level"),
  source: text("source").default("VOICE_CAPTURE"),
  sourceTranscriptId: integer("source_transcript_id").references(
    () => transcripts.id,
  ),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const asrEvaluations = pgTable("asr_evaluations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  providerName: text("provider_name").notNull(),
  providerType: text("provider_type").notNull(),
  description: text("description"),
  languagesSupported: text("languages_supported").array(),
  codeSwitchSupport: codeSwitchSupportEnum("code_switch_support"),
  costPerHour: decimal("cost_per_hour", { precision: 10, scale: 2 }),
  costCurrency: text("cost_currency").default("INR"),
  latencySeconds: decimal("latency_seconds", { precision: 5, scale: 2 }),
  privacyModel: text("privacy_model"),
  werOverall: decimal("wer_overall", { precision: 5, scale: 2 }),
  werByLanguage: jsonb("wer_by_language"),
  medicalTermAccuracy: decimal("medical_term_accuracy", {
    precision: 5,
    scale: 2,
  }),
  negationAccuracy: decimal("negation_accuracy", { precision: 5, scale: 2 }),
  chosen: boolean("chosen").default(false),
  chosenReason: text("chosen_reason"),
  rejectedReason: text("rejected_reason"),
  testDate: timestamp("test_date", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const accuracyResults = pgTable("accuracy_results", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  voiceNoteId: text("voice_note_id").notNull(),
  language: text("language").notNull(),
  specialty: text("specialty").notNull(),
  yourProvider: text("your_provider").notNull(),
  yourTranscript: text("your_transcript"),
  yourWer: decimal("your_wer", { precision: 5, scale: 2 }),
  yourMedicalTermAccuracy: decimal("your_medical_term_accuracy", {
    precision: 5,
    scale: 2,
  }),
  yourNegationPreserved: boolean("your_negation_preserved"),
  yourNodesExtracted: jsonb("your_nodes_extracted"),
  yourNodeCount: integer("your_node_count"),
  yourNodeAccuracy: decimal("your_node_accuracy", { precision: 5, scale: 2 }),
  chatgptOutput: text("chatgpt_output"),
  chatgptNodes: jsonb("chatgpt_nodes"),
  chatgptNodeAccuracy: decimal("chatgpt_node_accuracy", {
    precision: 5,
    scale: 2,
  }),
  baseline2Name: text("baseline2_name"),
  baseline2Output: text("baseline2_output"),
  baseline2NodeAccuracy: decimal("baseline2_node_accuracy", {
    precision: 5,
    scale: 2,
  }),
  dangerLevel: dangerLevelEnum("danger_level"),
  negationCritical: boolean("negation_critical").default(false),
  genericAiDangerous: boolean("generic_ai_dangerous").default(false),
  notes: text("notes"),
  testedAt: timestamp("tested_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const costAnalysis = pgTable("cost_analysis", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  provider: text("provider").notNull(),
  scenario: text("scenario").notNull(),
  doctorsCount: integer("doctors_count").notNull(),
  notesPerDay: integer("notes_per_day").notNull(),
  secondsPerNote: integer("seconds_per_note").default(30),
  dailyHours: decimal("daily_hours", { precision: 5, scale: 2 }),
  monthlyCost: decimal("monthly_cost", { precision: 10, scale: 2 }),
  annualCost: decimal("annual_cost", { precision: 12, scale: 2 }),
  costPerNode: decimal("cost_per_node", { precision: 5, scale: 2 }),
  currency: text("currency").default("INR"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const medicalDictionary = pgTable("medical_dictionary", {
  term: text("term").primaryKey(),
  termType: text("term_type").notNull(),
  phonetic: text("phonetic"),
  commonMistranscriptions: text("common_mistranscriptions").array(),
  brandNames: text("brand_names").array(),
});

// --- Relations ---
export const relations = defineRelations(
  {
    transcripts,
    knowledgeNodes,
    asrEvaluations,
    accuracyResults,
    costAnalysis,
    medicalDictionary,
  },
  (helpers) => ({
    transcripts: {
      knowledgeNodes: helpers.many.knowledgeNodes(),
    },
    knowledgeNodes: {
      transcript: helpers.one.transcripts({
        from: helpers.knowledgeNodes.sourceTranscriptId,
        to: helpers.transcripts.id,
      }),
    },
  }),
);
