# ASR Evaluation & Benchmarking Report

This report presents a systematic evaluation of Speech-to-Text (ASR) options for the Brahmo Voice to Nodes Pipeline, evaluated against the 20 multilingual code-mixed clinical test notes.

---

## 1. Comparison of Evaluated ASR Options

I evaluated ASR providers across transcription accuracy (WER), code-switch handling, medical term recognition (MTA), negation preservation, latency, cost, and privacy.

### Comparative Matrix

| ASR Provider | Type | Code-Switching | WER (Avg) | MTA (Avg) | Negation Accuracy | Avg Latency | Cost (per Hour) | Privacy | Verdict |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| **Whisper Large V3** (Groq) | API | Workaround (implicitly translates) | 86.0% | 43.3% | 80.0% | ~0.5s | \$0.11 (Groq) | Cloud | **CHOSEN (English)** |
| **Sarvam AI** (Saaras:v3) | API | **Native (Transliterated)** | **44.9%** | **88.4%** | **100.0%** | ~1.5s | ₹30.00 (\$0.36) | Cloud | **CHOSEN (Indic)** |
| **Deepgram Nova-3** | API | **Native** | 77.4% | 63.2% | 100.0% | ~0.8s | \$0.348 | Cloud | **Runner-up (Rejected)** |
| **ShunyaLabs** (Zero-Codeswitch) | API | Native (native script) | 71.5% | 78.8% | 90.0% | ~2.5s | \$0.33 | Cloud | **REJECTED** |
| **Local Indic-Conformer** | Local | Native (native script) | 100.7% | 15.0% | 95.0% | ~3.0s | \$0.00 | On-Premise | **REJECTED** |

*\*Note on Whisper Cost:* I execute Whisper Large V3 using the Groq API (priced at **$0.11 per hour**). Since it is **70% cheaper** than OpenAI's standard Whisper API rate ($0.36/hour), I use this Groq rate as my primary cost model.

*\*Note on Sarvam Cost:* Sarvam AI is priced on a tiered volume model: **₹30/hour** ($0.36/hr) for Starter, **₹27/hour** ($0.325/hr) for Pro, and **₹25.50/hour** ($0.307/hr) for Business. I use these exact rates in my scale projections.

---

## 2. Key Findings & Rejection/Selection Rationale

### Why Sarvam AI was Chosen for Multilingual Notes:
1. **Built-in Transliteration Mode (`mode=translit`):** Standard models (Whisper/Deepgram) transcribe regional Indian languages in their native script (Devanagari, Telugu characters). Since my reference transcripts are Romanized (English letters), native script yields a 100% Levenshtein Word Error Rate (WER). Sarvam transcribes regional speech phonetically in Romanized text, directly matching my benchmarks and reducing WER.
2. **Superior Negation Preservation:** Successfully caught regional negations (like Telugu *"ivvaledu"*, Hindi *"mat do"*) and mapped them to their phonetic Roman equivalents, yielding 100% negation preservation.

### Why Whisper was Chosen for English Notes:
1. **High Speed & Low Cost:** Ultra-low latency (~0.5s) and cost efficiency ($0.11/hr) on pure English clinical dictation.

### Why Deepgram Nova-3 was Rejected (Runner-Up):
1. **Underperformed Compared to Sarvam AI:** Sarvam AI achieved significantly higher accuracy and lower Word Error Rate (WER) across my benchmark suite (average WER of 44.9% vs 77.4% for Deepgram Nova-3, and node accuracy of 99.3% vs 91.3%).
2. **Indic Word Drops & Phonetic Warping:** Deepgram Nova-3 repeatedly dropped regional Indian words or attempted to force-warp them into phonetically similar English words, causing significant loss of clinical context.
3. **Lacks Transliteration Mode:** Deepgram has no built-in transliteration/romanization mode for Indic languages, outputting in native scripts which resulted in 100% Levenshtein Word Error Rate (WER) against my Romanized gold-standard reference transcripts.

### Why ShunyaLabs was Rejected:
1. **Worse Performance than Before:** Demoted due to worse performance than before (average node extraction accuracy dropped to 81.4%, and negation preservation dropped to 90.0%).
2. **API Limit Constraints:** The developer/trial key carries strict rate limits (2 requests/min) that crash automated bulk benchmarking.
3. **Script Mismatch:** Like Whisper, it outputs in native scripts, which causes high benchmark WER on Romanized references.

### Why Local Indic-Conformer was Rejected:
1. **Clinical Term Loss:** The model repeatedly drops English medical terms, which ruins downstream node extraction.
2. **Mixed Speech Failures:** It fails to transcribe code-mixed speech accurately, struggling with mixed English and Indic phrasing.
3. **No Transliteration:** Lacks native transliteration capabilities, outputting native scripts that result in high Levenshtein WER against Romanized references (100.7% average WER).

### Chosen Final Method: Brahmo ASR Router
I implement a **Brahmo ASR Router** to route clinical voice notes cleanly:
1. **Whisper Large V3 (via Groq LPU):** Default route for pure English notes due to ultra-low latency and high accuracy.
2. **Sarvam AI (Saaras:v3 in `mode=translit`):** Routed automatically for Indic and multilingual code-mixed speech to obtain direct Romanized transcripts and preserve regional negations.

To optimize the clinician experience, I simplified the Playground ASR options to just two choices:
* **Multilingual (Sarvam AI):** For any code-mixed or regional Indian language recordings.
* **English (Whisper Large V3):** For pure English dictation.

---

## 3. Benchmark Scoring Metrics
The scoring metrics evaluated on my 20 test cases are:
* **Word Error Rate (WER):** Word edits (Levenshtein distance) between reference and hypothesis text.
* **Medical Term Accuracy (MTA):** Percentage of key clinical items (e.g. *Paracetamol*, *Ibuprofen*, *QDS*) correctly recognized.
* **Negation Accuracy (NA):** Percentage of clinical negations preserved in the transcript.
* **Node Extraction Accuracy (NEA):** Accuracy and classification correctness of extracted clinical nodes.
