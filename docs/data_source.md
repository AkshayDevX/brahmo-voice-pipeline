# Clinical Pipeline Data Sources & Reference Lexicons

This document provides a comprehensive specification of the data sources, test datasets, and reference lexicons utilized by the **Brahmo Intelligence Engine** clinical voice pipeline and benchmarking framework.

> [!NOTE]
> The baseline test cases, regional negation keywords, and starting medical terms were provided as part of the **Astroum Assessment Setup Guide**. I have cleaned, updated, and extended these reference datasets to handle specific phonetic edge cases, context-specific numbers, and name-stripping requirements.

---

## 1. Test Dataset: Doctor Voice Notes (20 Cases)

The core validation dataset consists of **20 clinical test cases** (`VN-01` through `VN-20`) based on realistic Indic doctor dictations.
* **Audio Source**: Stored as high-fidelity WAV files in `audio_tests/` (e.g., `VN-01.wav` through `VN-20.wav`).
* **Ground Truth Metadata**: Managed as a structured JSON catalog in [notes.json](https://github.com/AkshayDevX/brahmo-voice-pipeline/tree/main/lib/notes.json).

### Dataset Breakdown
* **Specialties Covered**: Orthopedics, Cardiology, Pediatrics, Pulmonology, Gynecology, Dermatology, and General Practice.
* **Linguistic Diversity**: Code-mixed and bilingual notes (Telugu-English, Hindi-English, Tamil-English, Bengali-English, Kannada-English, and Marathi-English).
* **Expected Outputs**: Each test note includes a predefined list of `expected_nodes` (`FACT`, `DECISION`, `CONSTRAINT`, `ANTI_PATTERN`) to evaluate LLM extraction accuracy.

---

## 2. Phonetic Medical Dictionary

To correct acoustic mistranscriptions from ASR engines (e.g., transcribing brand names phonetically), the pipeline relies on the reference lexicon stored in [dictionary.json](https://github.com/AkshayDevX/brahmo-voice-pipeline/tree/main/lib/dictionary.json).

* **Source**: The starting terms list was provided by the assessment framework. I extended the dictionary to support additional phonetic variants and drug brand names.
* **Format**: Array of `DictionaryEntry` containing the standardized clinical `term` and its common `mistranscriptions`.
* **Example Mappings**:
  * **Tramadol** ← `["trauma doll", "tram a doll", "trauma dull", "tramadole"]`
  * **Metformin** ← `["met for men", "metaphor min", "met forming", "metform in"]`
  * **Ibuprofen** ← `["I be proven", "ibu pro fan", "I view profen", "I proof in"]`
  * **Amoxiclav** ← `["a moxie clav", "amoxy clave", "moxie club"]`

*Detailed justification for medical corrections is documented in [PIPELINE_CORRECTIONS.md](https://github.com/AkshayDevX/brahmo-voice-pipeline/tree/main/docs/PIPELINE_CORRECTIONS.md).*

---

## 3. Indic Negation Patterns

Clinical safety depends on capturing negation (e.g., "do NOT give drug X"). The pipeline uses `lib/negations.json` to load and tag critical negation keywords across Indian languages as `[CRITICAL NEGATION: word]`.

* **Source**: Base negation keywords were provided in the setup guide. I updated the mappings to include Marathi (`nako`, `naka`) and Tamil suffix edge cases.
* **Mapped Languages**: Telugu, Hindi, Tamil, Kannada, Bengali, and Marathi.
* **Key Mappings**:
  * **Telugu**: `ivvakudadu` (should not give), `ivvaledu` (did not give), `vaddu` (no/dont)
  * **Hindi**: `mat do` (dont give), `nahi dena` (should not give), `na karein`
  * **Marathi**: `naka` (dont), `nahi` (no), `nako` (dont want)
  * **Tamil**: `kudadhu` (should not), `vendam` (no/dont)

### Ambiguity Management
Special lookahead and lookbehind rules are applied to the short negation word `"na"` to prevent conflicts with **Sodium** (`Na`) or medical abbreviations:
```regex
/(?<!\b(?:sodium|serum|poguthu|varthu|aana|venam)\s+)\bna\b(?!\s+(?:level|value|concentration|result))/gi
```

---

## 4. Regional Number Conversion Lexicon

To ensure dosages are extracted correctly, written regional numbers (Hindi, Telugu, etc.) are converted to numerical digits via `lib/numbers.json`.

* **Hindi Numbers**: `ek` (1), `do` (2), `teen` (3), `chaar` (4), `paanch` (5), `das` (10), `bees` (20).
* **Telugu Numbers**: `okati` (1), `rendu` (2), `moodu` (3), `naalugu` (4), `aidu` (5), `padi` (10).
* **Ambiguity Handling**:
  The word `"do"` represents "2" in Hindi but is a common verb in English. The pipeline restricts the conversion of `"do"`, `"teen"`, `"bees"`, and `"tin"` to contexts where they are followed by dosage units (e.g., `tablet`, `capsule`, `mg`, `ml`, `od`, `bd`).

---

## 5. PHI Anonymization Name Lexicon

To satisfy data privacy under the **Digital Personal Data Protection (DPDP) Act, 2023**, the pipeline strips patient names using the reference dataset `lib/common_names.json`.

* **Dataset**: Contains common Indian first names (e.g., `Ramaiah`, `Tripathi`, `Priya`, `Amit`, `Srinivas`).
* **Processing**: Name matches are replaced with `[PATIENT]` in the preprocessed transcript before sending the text to the clinical LLM for node extraction.
