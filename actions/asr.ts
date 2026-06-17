"use server";

// Helper to get environment variables safely
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const SHUNYALABS_API_KEY = process.env.SHUNYALABS_API_KEY;
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

/**
 * Transcribes audio using Groq's Whisper Large V3
 * Groq uses the standard OpenAI compatible audio transcriptions endpoint.
 */
export async function transcribeWithWhisper(
  audioBuffer: Buffer,
  filename: string = "audio.wav",
): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

  // Groq API requires a File/Blob, so we use FormData
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: "audio/wav" });
  formData.append("file", blob, filename);
  formData.append("model", "whisper-large-v3");
  formData.append("response_format", "json");

  const response = await fetch(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq Whisper Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.text;
}

/**
 * Transcribes audio using Deepgram's Nova-3 medical model (or general multilingual)
 */
export async function transcribeWithDeepgram(
  audioBuffer: Buffer,
  language: string = "auto",
): Promise<string> {
  if (!DEEPGRAM_API_KEY) throw new Error("DEEPGRAM_API_KEY is not configured");

  // If language is "auto", use detect_language=true, otherwise target the specific language
  const modelParams =
    language === "auto"
      ? "model=nova-3&detect_language=true&smart_format=true"
      : `model=nova-3&language=${language}&smart_format=true`;

  const response = await fetch(
    `https://api.deepgram.com/v1/listen?${modelParams}`,
    {
      method: "POST",
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        "Content-Type": "audio/wav",
      },
      body: new Blob([new Uint8Array(audioBuffer)], { type: "audio/wav" }),
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Deepgram Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.results?.channels[0]?.alternatives[0]?.transcript || "";
}

/**
 * Transcribes audio using ShunyaLabs API
 */
export async function transcribeWithShunyalabs(
  audioBuffer: Buffer,
  filename: string = "audio.wav",
): Promise<string> {
  if (!SHUNYALABS_API_KEY)
    throw new Error("SHUNYALABS_API_KEY is not configured");

  // ShunyaLabs API logic - typically form data
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: "audio/wav" });
  formData.append("file", blob, filename);
  formData.append("model", "zero-codeswitch");

  // Assuming standard endpoint for Shunyalabs
  const response = await fetch(
    "https://asr.shunyalabs.ai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SHUNYALABS_API_KEY}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    // Some mock fallback since API URL might differ based on exact documentation
    console.warn(
      `Shunyalabs Error (might be mock endpoint): ${response.status} - ${errText}`,
    );
    throw new Error(`Shunyalabs Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.text;
}

/**
 * Transcribes audio using our local AI4Bharat Indic Conformer FastAPI microservice
 */
export async function transcribeWithLocalIndicConformer(
  audioBuffer: Buffer,
  language: string = "hi",
  filename: string = "audio.wav",
): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: "audio/wav" });
  formData.append("file", blob, filename);
  formData.append("language", language);

  // Assuming the FastAPI microservice runs on port 8000
  const response = await fetch("http://localhost:8000/transcribe/indic", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Local Indic Conformer Error: ${response.status} - ${errText}`,
    );
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`Local Indic Conformer Service Error: ${data.error}`);
  }
  return data.text;
}

/**
 * Chunks a WAV file into smaller WAV buffers to bypass duration limits
 */
function chunkWav(
  audioBuffer: Buffer,
  chunkDurationSec: number = 25,
): Buffer[] {
  // WAV header is 44 bytes
  if (audioBuffer.length <= 44) return [audioBuffer];

  // Verify that it is indeed a WAV file (starts with RIFF and has WAVE at offset 8)
  const isWav =
    audioBuffer.toString("ascii", 0, 4) === "RIFF" &&
    audioBuffer.toString("ascii", 8, 12) === "WAVE";

  if (!isWav) {
    console.log("Audio buffer is not a WAV file. Skipping WAV chunking.");
    return [audioBuffer];
  }

  const header = audioBuffer.slice(0, 44);
  const numChannels = header.readUInt16LE(22);
  const sampleRate = header.readUInt32LE(24);
  const bitsPerSample = header.readUInt16LE(34);

  // Guard against corrupted or invalid values in WAV header
  if (!numChannels || !sampleRate || !bitsPerSample) {
    console.log("Invalid WAV header metadata. Skipping chunking.");
    return [audioBuffer];
  }

  const bytesPerSample = (bitsPerSample / 8) * numChannels;
  const bytesPerSecond = sampleRate * bytesPerSample;
  const chunkSizeBytes = Math.floor(chunkDurationSec * bytesPerSecond);

  // If chunk size is invalid or larger than the buffer, don't chunk
  if (chunkSizeBytes <= 0 || chunkSizeBytes >= audioBuffer.length) {
    return [audioBuffer];
  }

  const pcmData = audioBuffer.slice(44);
  const chunks: Buffer[] = [];

  for (let offset = 0; offset < pcmData.length; offset += chunkSizeBytes) {
    const pcmChunk = pcmData.slice(offset, offset + chunkSizeBytes);

    // Create new WAV header
    const newHeader = Buffer.alloc(44);
    header.copy(newHeader);

    const chunkFileLength = pcmChunk.length + 36;
    newHeader.writeUInt32LE(chunkFileLength, 4);
    newHeader.writeUInt32LE(pcmChunk.length, 40);

    chunks.push(Buffer.concat([newHeader, pcmChunk]));
  }

  return chunks;
}

/**
 * Transcribes audio using Sarvam AI STT API with translit mode
 */
export async function transcribeWithSarvam(
  audioBuffer: Buffer,
  _languageHint: string = "hi",
): Promise<string> {
  if (!SARVAM_API_KEY) throw new Error("SARVAM_API_KEY is not configured");

  // Determine file type and signature
  const isWav =
    audioBuffer.length >= 12 &&
    audioBuffer.toString("ascii", 0, 4) === "RIFF" &&
    audioBuffer.toString("ascii", 8, 12) === "WAVE";

  const isWebm =
    audioBuffer.length >= 4 &&
    audioBuffer[0] === 0x1a &&
    audioBuffer[1] === 0x45 &&
    audioBuffer[2] === 0xdf &&
    audioBuffer[3] === 0xa3;

  const mimeType = isWebm ? "audio/webm" : isWav ? "audio/wav" : "audio/wav";
  const fileExt = isWebm ? "webm" : "wav";

  const chunks = chunkWav(audioBuffer, 25);
  const transcripts: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(chunks[i])], { type: mimeType });
    formData.append("file", blob, `chunk_${i}.${fileExt}`);
    formData.append("model", "saaras:v3");
    formData.append("mode", "translit");

    const response = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": SARVAM_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Sarvam Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    if (data.transcript) {
      transcripts.push(data.transcript);
    }
  }

  return transcripts.join(" ");
}

/**
 * Detects the language of the audio using Groq Whisper's verbose_json response
 */
export async function detectLanguageWithWhisper(
  audioBuffer: Buffer,
  filename: string = "audio.wav",
): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: "audio/wav" });
  formData.append("file", blob, filename);
  formData.append("model", "whisper-large-v3");
  formData.append("response_format", "verbose_json");

  const response = await fetch(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq Whisper LID Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.language || "Hindi";
}

/**
 * Maps full language names to standard 2-letter language codes
 */
export async function mapLanguageNameToCode(langName: string): Promise<string> {
  const lower = langName.toLowerCase().trim();
  if (lower.includes("english")) return "en";
  if (lower.includes("assamese")) return "as";
  if (lower.includes("bengali")) return "bn";
  if (lower.includes("bodo")) return "brx";
  if (lower.includes("dogri")) return "doi";
  if (lower.includes("gujarati")) return "gu";
  if (lower.includes("hindi")) return "hi";
  if (lower.includes("kannada")) return "kn";
  if (lower.includes("konkani")) return "kok";
  if (lower.includes("kashmiri")) return "ks";
  if (lower.includes("maithili")) return "mai";
  if (lower.includes("malayalam")) return "ml";
  if (lower.includes("manipuri")) return "mni";
  if (lower.includes("marathi")) return "mr";
  if (lower.includes("nepali")) return "ne";
  if (lower.includes("odia") || lower.includes("oriya")) return "or";
  if (lower.includes("punjabi")) return "pa";
  if (lower.includes("sanskrit")) return "sa";
  if (lower.includes("santali")) return "sat";
  if (lower.includes("sindhi")) return "sd";
  if (lower.includes("tamil")) return "ta";
  if (lower.includes("telugu")) return "te";
  if (lower.includes("urdu")) return "ur";
  return "hi"; // fallback to Hindi
}

/**
 * The Brahmo ASR Router Logic (Whisper & Sarvam Router)
 * Routes English to Whisper (Groq) and Indic/Multilingual notes to Sarvam AI.
 */
export async function transcribeWithRouterEnsemble(
  audioBuffer: Buffer,
  languageHint: string = "multi",
): Promise<{ route: string; transcript: string }> {
  const cleanHint = languageHint.toLowerCase().trim();

  if (cleanHint === "en") {
    // English routes to Whisper (Groq)
    const text = await transcribeWithWhisper(audioBuffer);
    return { route: "whisper", transcript: text };
  } else {
    // Multilingual or regional Indic routes to Sarvam AI
    const targetLang =
      cleanHint === "multi" || cleanHint === "auto" ? "hi" : cleanHint;
    const text = await transcribeWithSarvam(audioBuffer, targetLang);
    return { route: "sarvam", transcript: text };
  }
}

/**
 * Synthesizes text to speech using Sarvam's Bulbul:v3 API.
 * Returns a Buffer of the generated audio (WAV format).
 */
export async function synthesizeTextWithSarvam(
  text: string,
  languageHint: string = "multi",
): Promise<Buffer> {
  if (!SARVAM_API_KEY) throw new Error("SARVAM_API_KEY is not configured");

  // Determine target language code based on unicode ranges or languageHint
  let targetLangCode = "hi-IN"; // default

  if (languageHint === "en") {
    targetLangCode = "en-IN";
  } else {
    // Check unicode ranges in text to find the script and map to language code
    if (/[\u0900-\u097F]/.test(text)) {
      // Devanagari script: Hindi/Marathi
      targetLangCode = "hi-IN";
    } else if (/[\u0980-\u09FF]/.test(text)) {
      targetLangCode = "bn-IN";
    } else if (/[\u0C00-\u0C7F]/.test(text)) {
      targetLangCode = "te-IN";
    } else if (/[\u0B80-\u0BFF]/.test(text)) {
      targetLangCode = "ta-IN";
    } else if (/[\u0C80-\u0CFF]/.test(text)) {
      targetLangCode = "kn-IN";
    } else if (/[\u0D00-\u0D7F]/.test(text)) {
      targetLangCode = "ml-IN";
    } else if (/[\u0A80-\u0AFF]/.test(text)) {
      targetLangCode = "gu-IN";
    } else if (/[\u0A00-\u0A7F]/.test(text)) {
      targetLangCode = "pa-IN";
    } else if (/[\u0B00-\u0B7F]/.test(text)) {
      targetLangCode = "od-IN";
    } else {
      // Default Latin script in multi mode to Indian English
      targetLangCode = "en-IN";
    }
  }

  const response = await fetch("https://api.sarvam.ai/text-to-speech", {
    method: "POST",
    headers: {
      "api-subscription-key": SARVAM_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
      speaker: "meera", // Standard clear female voice
      target_language_code: targetLangCode,
      model: "bulbul:v3",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Sarvam TTS Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  if (!data.audio) {
    throw new Error("No audio returned from Sarvam TTS");
  }

  return Buffer.from(data.audio, "base64");
}
