/**
 * Calculates Word Error Rate (WER)
 * WER = (Substitutions + Deletions + Insertions) / Number of words in reference
 */
export function calculateWER(reference: string, hypothesis: string): number {
  const refWords = reference.toLowerCase().trim().split(/\s+/);
  const hypWords = hypothesis.toLowerCase().trim().split(/\s+/);

  // To calculate WER perfectly, we need edit distance on words, not characters.
  // We'll adapt Levenshtein for arrays of strings.
  const matrix = [];
  for (let i = 0; i <= hypWords.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= refWords.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= hypWords.length; i++) {
    for (let j = 1; j <= refWords.length; j++) {
      if (hypWords[i - 1] === refWords[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1,
          ), // deletion
        );
      }
    }
  }

  const edits = matrix[hypWords.length][refWords.length];
  return edits / refWords.length;
}

/**
 * Calculates Medical Term Accuracy (MTA)
 * MTA = correctly recognized medical terms / total medical terms in reference
 */
export function calculateMTA(
  referenceTerms: string[],
  hypothesis: string,
): number {
  if (referenceTerms.length === 0) return 1.0;

  const hypLower = hypothesis.toLowerCase();
  let correct = 0;
  for (const term of referenceTerms) {
    if (hypLower.includes(term.toLowerCase())) {
      correct++;
    }
  }
  return correct / referenceTerms.length;
}

/**
 * Calculates Negation Accuracy (NA)
 * Checks if the negations present in the reference are captured in the hypothesis
 */
export function calculateNA(
  referenceNegations: string[],
  hypothesis: string,
): number {
  if (referenceNegations.length === 0) return 1.0;

  const hypLower = hypothesis.toLowerCase();
  let correct = 0;
  for (const term of referenceNegations) {
    if (hypLower.includes(term.toLowerCase())) {
      correct++;
    }
  }
  return correct / referenceNegations.length;
}

/**
 * Generates an Evaluation Report
 */
export function generateEvaluationReport(
  testCases: Array<{
    id: string;
    referenceTranscript: string;
    medicalTerms: string[];
    negations: string[];
    hypothesisTranscript: string;
  }>,
) {
  let totalWER = 0;
  let totalMTA = 0;
  let totalNA = 0;

  const results = testCases.map((tc) => {
    const wer = calculateWER(tc.referenceTranscript, tc.hypothesisTranscript);
    const mta = calculateMTA(tc.medicalTerms, tc.hypothesisTranscript);
    const na = calculateNA(tc.negations, tc.hypothesisTranscript);

    totalWER += wer;
    totalMTA += mta;
    totalNA += na;

    return {
      id: tc.id,
      WER: wer,
      MTA: mta,
      NA: na,
    };
  });

  return {
    averageWER: totalWER / testCases.length,
    averageMTA: totalMTA / testCases.length,
    averageNA: totalNA / testCases.length,
    detailedResults: results,
  };
}
