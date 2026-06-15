CREATE TYPE "code_switch_support" AS ENUM('native', 'workaround', 'none');--> statement-breakpoint
CREATE TYPE "danger_level" AS ENUM('SAFE', 'MODERATE', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "node_type" AS ENUM('CONSTRAINT', 'DECISION', 'ANTI_PATTERN', 'FACT');--> statement-breakpoint
CREATE TABLE "accuracy_results" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "accuracy_results_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"voice_note_id" text NOT NULL,
	"language" text NOT NULL,
	"specialty" text NOT NULL,
	"your_provider" text NOT NULL,
	"your_transcript" text,
	"your_wer" numeric(5,2),
	"your_medical_term_accuracy" numeric(5,2),
	"your_negation_preserved" boolean,
	"your_nodes_extracted" jsonb,
	"your_node_count" integer,
	"your_node_accuracy" numeric(5,2),
	"chatgpt_output" text,
	"chatgpt_nodes" jsonb,
	"chatgpt_node_accuracy" numeric(5,2),
	"baseline2_name" text,
	"baseline2_output" text,
	"baseline2_node_accuracy" numeric(5,2),
	"danger_level" "danger_level",
	"negation_critical" boolean DEFAULT false,
	"generic_ai_dangerous" boolean DEFAULT false,
	"notes" text,
	"tested_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asr_evaluations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "asr_evaluations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"provider_name" text NOT NULL,
	"provider_type" text NOT NULL,
	"description" text,
	"languages_supported" text[],
	"code_switch_support" "code_switch_support",
	"cost_per_hour" numeric(10,2),
	"cost_currency" text DEFAULT 'INR',
	"latency_seconds" numeric(5,2),
	"privacy_model" text,
	"wer_overall" numeric(5,2),
	"wer_by_language" jsonb,
	"medical_term_accuracy" numeric(5,2),
	"negation_accuracy" numeric(5,2),
	"chosen" boolean DEFAULT false,
	"chosen_reason" text,
	"rejected_reason" text,
	"test_date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cost_analysis" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cost_analysis_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"provider" text NOT NULL,
	"scenario" text NOT NULL,
	"doctors_count" integer NOT NULL,
	"notes_per_day" integer NOT NULL,
	"seconds_per_note" integer DEFAULT 30,
	"daily_hours" numeric(5,2),
	"monthly_cost" numeric(10,2),
	"annual_cost" numeric(12,2),
	"cost_per_node" numeric(5,2),
	"currency" text DEFAULT 'INR',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_nodes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "knowledge_nodes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"org_id" text DEFAULT 'supra' NOT NULL,
	"type" "node_type" NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"importance" numeric(3,2) NOT NULL,
	"department" text,
	"hierarchy_level" integer,
	"source" text DEFAULT 'VOICE_CAPTURE',
	"source_transcript_id" integer,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_dictionary" (
	"term" text PRIMARY KEY,
	"term_type" text NOT NULL,
	"phonetic" text,
	"common_mistranscriptions" text[],
	"brand_names" text[]
);
--> statement-breakpoint
CREATE TABLE "transcripts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "transcripts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"doctor_id" text NOT NULL,
	"patient_id" text,
	"language_code" text NOT NULL,
	"asr_provider" text NOT NULL,
	"asr_provider_reason" text,
	"raw_transcript" text NOT NULL,
	"corrected_transcript" text,
	"confirmed_transcript" text,
	"corrections_applied" jsonb,
	"segments" jsonb,
	"overall_confidence" numeric(3,2),
	"status" text DEFAULT 'PENDING',
	"pipeline_time_ms" integer,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "knowledge_nodes" ADD CONSTRAINT "knowledge_nodes_source_transcript_id_transcripts_id_fkey" FOREIGN KEY ("source_transcript_id") REFERENCES "transcripts"("id");