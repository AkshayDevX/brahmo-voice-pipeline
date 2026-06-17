# Brahmo Voice to Nodes Pipeline

An ensembled, multilingual clinical voice capture and knowledge-extraction pipeline built for the Indic healthcare context. It transcribes code-mixed speech, preserves safety negations, extracts structured clinical nodes, and provides an interactive portal for clinician sign-off.

---

## 🚀 Key Features

*   **Indic Code-Switched ASR Routing:** Automatically routes English inputs to **Whisper Large V3 (Groq)** and regional/code-mixed speech (Hindi, Telugu, etc.) to **Sarvam AI (Saaras:v3)**.
*   **Built-in Romanized Transliteration:** Utilizes Sarvam's `mode=translit` to transcribe Indic speech directly into phonetic English letters, preventing script mismatches and yielding highly accurate Word Error Rate (WER) benchmarks.
*   **Medical Intelligence Correction:** Pre-processes transcripts to fix drug brand names and tag regional critical negations (e.g., Telugu *"ivvaledu"*, Hindi *"mat do"*) before LLM inference.
*   **Clinical Knowledge Extraction:** Uses **DeepSeek-V4-Flash** to classify extracted symptoms, conditions, and allergies into standard clinical nodes (`CONSTRAINT`, `DECISION`, `FACT`, `ANTI_PATTERN`).
*   **Interactive Doctor Review Portal:** An interactive editor where clinicians edit transcripts, add/delete nodes, adjust numerical importance sliders, and sign-off directly to the database.

---

## 🗺️ System Architecture

```mermaid
graph TD
    A[Raw Audio Note] --> B{Brahmo ASR Router}
    B -- "English" --> C[Whisper Large V3 via Groq]
    B -- "Multilingual/Indic" --> D[Sarvam AI Saaras:v3]
    C --> F[Medical Intelligence Layer]
    D --> F
    F --> G[Clinical LLM: DeepSeek v4 Flash]
    G --> H[Interactive Doctor Review UI]
    H --> I[PostgreSQL EHR Commit]
```

---

## 📂 Assessment Documentation Directory

We have prepared comprehensive documentation files detailing the evaluation metrics, architecture selections, cost breakdowns, and implementation details:

*   📖 **[ASR Evaluation & Benchmarking Report](file:///c:/Users/aksha/OneDrive/Desktop/My%20Projects/assessments/Astroum/brahmo-voice-pipeline/docs/ASR_EVALUATION_REPORT.md)**: Side-by-side comparison of evaluated ASR models (Whisper, Sarvam, Deepgram, ShunyaLabs), metrics (WER, MTA, Negation Preservation), and rejection rationales.
*   📖 **[Architecture & Cost Analysis Report](file:///c:/Users/aksha/OneDrive/Desktop/My%20Projects/assessments/Astroum/brahmo-voice-pipeline/docs/ARCHITECTURE_AND_COST.md)**: Brahmo ASR Router strategy, base infrastructure costs, and scaling projections (Pilot, Moderate, Scale).
*   📖 **[Technical Walkthrough & Verification](file:///c:/Users/aksha/OneDrive/Desktop/My%20Projects/assessments/Astroum/brahmo-voice-pipeline/docs/WALKTHROUGH.md)**: Deep dive into chunking logic, negation handling, database mappings, and interactive review workflows.

---

## 🛠️ Setup & Running Locally

### Prerequisites
*   [Bun](https://bun.sh) runtime installed.
*   Supabase PostgreSQL database connection URL.
*   API keys for Groq, Sarvam AI, and Gemini (baselines) configured.

### Environment Setup
Create a `.env.local` file inside the `brahmo-voice-pipeline` folder:
```env
DATABASE_URL=your_postgres_connection_url
GROQ_API_KEY=your_groq_api_key
SARVAM_API_KEY=your_sarvam_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 1. Install Dependencies
```bash
bun install
```

### 2. Run Database Migrations
Deploy schemas for `transcripts`, `knowledge_nodes`, `accuracy_results`, `asr_evaluations`, and `cost_analysis`:
```bash
bun run db:push
```

### 3. Seed Cost Projections & Evaluations
Seeding script updates the tables with precise Sarvam tiered rates and actual pricing:
```bash
bun run scripts/seed_cost_analysis.ts  # (if script exists, otherwise run database update script)
```

### 4. Run the Dev Server
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the Benchmarking & Doctor Review Portal.

---

## 📊 Running Benchmarks

To run the automated ASR accuracy metrics and node evaluations against the 20 code-mixed clinical test notes:
```bash
bun run scripts/run_benchmarks.ts
```
*Calculated metrics (WER, MTA, Negation Preserved, Node Accuracy) will be saved directly to the PostgreSQL `accuracy_results` table.*
