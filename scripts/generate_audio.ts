import fs from "node:fs";
import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export type Note = {
  id: string;
  title: string;
  languages: string;
  doctor: string;
  context: string;
  transcript: string;
  translation: string;
};

async function generateAudio() {
  const envPath = path.join(process.cwd(), ".env.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  const apiKeyMatch = envContent.match(/SARVAM_API_KEY=([^\r\n]+)/);
  if (!apiKeyMatch) {
    throw new Error("SARVAM_API_KEY not found in .env.local");
  }
  const apiKey = apiKeyMatch[1].trim();

  const filePath = path.join(process.cwd(), "lib", "notes.json");
  const data = fs.readFileSync(filePath, "utf-8");
  const notes: Note[] = JSON.parse(data);

  const audioDir = path.join(process.cwd(), "audio_tests");
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir);
  }

  console.log(
    `Generating audio for ${notes.length} notes using Sarvam AI Bulbul V3...`,
  );

  for (const note of notes) {
    const outPath = path.join(audioDir, `${note.id}.wav`);

    // Determine language code
    let langCode = "en-IN";
    const langLower = note.languages.toLowerCase();
    if (langLower.includes("hindi")) {
      langCode = "hi-IN";
    } else if (langLower.includes("tamil")) {
      langCode = "ta-IN";
    } else if (langLower.includes("telugu")) {
      langCode = "te-IN";
    } else if (langLower.includes("marathi")) {
      langCode = "mr-IN";
    } else if (langLower.includes("kannada")) {
      langCode = "kn-IN";
    } else if (langLower.includes("bengali")) {
      langCode = "bn-IN";
    } else if (langLower.includes("malayalam")) {
      langCode = "ml-IN";
    } else if (langLower.includes("gujarati")) {
      langCode = "gu-IN";
    }

    // Determine speaker gender
    let speaker = "shubh";
    const docLower = note.doctor.toLowerCase();
    if (
      docLower.includes("meera") ||
      docLower.includes("lakshmi") ||
      docLower.includes("parvathy") ||
      docLower.includes("ananya")
    ) {
      speaker = "shreya";
    }

    console.log(
      `Generating [${note.id}] with langCode ${langCode}, speaker ${speaker}...`,
    );

    try {
      const response = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": apiKey,
        },
        body: JSON.stringify({
          text: note.transcript,
          target_language_code: langCode,
          speaker: speaker,
          model: "bulbul:v3",
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Sarvam TTS error: ${response.status} - ${errText}`);
      }

      const resData: any = await response.json();
      if (resData.audios && resData.audios.length > 0) {
        const base64Audio = resData.audios[0];
        const audioBuffer = Buffer.from(base64Audio, "base64");
        fs.writeFileSync(outPath, audioBuffer);
        console.log(`Saved ${note.id} to ${outPath}`);
      } else {
        console.warn(
          `No audio returned for ${note.id}:`,
          JSON.stringify(resData),
        );
      }
    } catch (err) {
      console.error(`Failed to generate audio for ${note.id}:`, err);
    }

    // Add a tiny delay to avoid rate-limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log("Audio generation complete!");
}

generateAudio().catch(console.error);
