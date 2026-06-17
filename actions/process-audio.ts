"use server";

import {
  synthesizeTextWithSarvam,
  transcribeWithDeepgram,
  transcribeWithLocalIndicConformer,
  transcribeWithRouterEnsemble,
  transcribeWithShunyalabs,
  transcribeWithWhisper,
} from "./asr";
import { runFullPipeline } from "./pipeline";

export async function processAudioAction(formData: FormData) {
  const file = formData.get("audio") as File | null;
  const text = formData.get("text") as string | null;
  const languageHint = (formData.get("languageHint") as string) || "multi";
  const asrProvider = (formData.get("asrProvider") as string) || "router";

  if (text) {
    // 1. Synthesize text to speech
    const audioBuffer = await synthesizeTextWithSarvam(text, languageHint);

    let transcript = "";
    let route = asrProvider;

    // 2. Transcribe the synthesized speech using the chosen ASR engine
    if (asrProvider === "whisper") {
      transcript = await transcribeWithWhisper(audioBuffer);
    } else if (asrProvider === "deepgram") {
      transcript = await transcribeWithDeepgram(audioBuffer, languageHint);
    } else if (asrProvider === "shunyalabs") {
      transcript = await transcribeWithShunyalabs(audioBuffer);
    } else if (asrProvider === "indic-conformer") {
      transcript = await transcribeWithLocalIndicConformer(
        audioBuffer,
        languageHint,
      );
    } else {
      // Default Brahmo ASR Router
      const res = await transcribeWithRouterEnsemble(audioBuffer, languageHint);
      transcript = res.transcript;
      route = res.route;
    }

    // 3. Process the resulting transcript
    const results = await runFullPipeline(transcript, `${route}-tts`);
    return { success: true, results };
  }

  if (file) {
    // Process audio file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let transcript = "";
    let route = asrProvider;

    // 1. ASR - Explicitly route based on the selected provider
    if (asrProvider === "whisper") {
      transcript = await transcribeWithWhisper(buffer);
    } else if (asrProvider === "deepgram") {
      transcript = await transcribeWithDeepgram(buffer, languageHint);
    } else if (asrProvider === "shunyalabs") {
      transcript = await transcribeWithShunyalabs(buffer);
    } else if (asrProvider === "indic-conformer") {
      transcript = await transcribeWithLocalIndicConformer(
        buffer,
        languageHint,
      );
    } else {
      // Default Brahmo ASR Router
      const res = await transcribeWithRouterEnsemble(buffer, languageHint);
      transcript = res.transcript;
      route = res.route;
    }

    // 2. Full Pipeline (Intelligence + Node Extraction)
    const results = await runFullPipeline(transcript, route);

    return { success: true, results };
  }

  throw new Error("No audio or text provided");
}
