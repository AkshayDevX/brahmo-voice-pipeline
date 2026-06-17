// Medical Intelligence Layer

// 1. Phonetic Dictionary for Drug Names
export const DICTIONARY = [
  {
    term: "Paracetamol",
    mistranscriptions: [
      "parasitamol",
      "para see tamol",
      "paris at a mall",
      "para sita mole",
    ],
  },
  {
    term: "Ibuprofen",
    mistranscriptions: [
      "I be proven",
      "ibu pro fan",
      "I view profen",
      "I proof in",
    ],
  },
  {
    term: "Tramadol",
    mistranscriptions: [
      "trauma doll",
      "tram a doll",
      "trauma dull",
      "tramadole",
    ],
  },
  {
    term: "Metformin",
    mistranscriptions: [
      "met for men",
      "metaphor min",
      "met forming",
      "metform in",
    ],
  },
  {
    term: "Glimepiride",
    mistranscriptions: [
      "glimpse ride",
      "glib pride",
      "glam a pride",
      "glimmer ride",
    ],
  },
  {
    term: "Warfarin",
    mistranscriptions: [
      "war for in",
      "warfare in",
      "war faring",
      "wore far in",
    ],
  },
  {
    term: "Clopidogrel",
    mistranscriptions: [
      "close pedigree",
      "clopidol grill",
      "club piddle grill",
    ],
  },
  {
    term: "Enoxaparin",
    mistranscriptions: ["e nox a parr in", "enox a parent", "in ox a paring"],
  },
  {
    term: "Aspirin",
    mistranscriptions: ["aspiring", "a spring", "as per in", "aspren"],
  },
  {
    term: "Atorvastatin",
    mistranscriptions: [
      "a tour of statin",
      "at or vast a tin",
      "at over statin",
    ],
  },
  {
    term: "Omeprazole",
    mistranscriptions: ["oh my prays all", "home a prism", "omega prazoal"],
  },
  {
    term: "Pantoprazole",
    mistranscriptions: [
      "pant oh pray soul",
      "panther prays all",
      "panto prism",
    ],
  },
  {
    term: "Amoxicillin",
    mistranscriptions: ["a moxie see lin", "amoks see lin", "a mock silly in"],
  },
  {
    term: "Azithromycin",
    mistranscriptions: [
      "a with row my sin",
      "az throw my sin",
      "a zither oh my sin",
    ],
  },
  {
    term: "Telmisartan",
    mistranscriptions: ["tell me sartan", "tele me start on", "telma sartan"],
  },
  {
    term: "Amlodipine",
    mistranscriptions: ["am loading peen", "amlo di pine", "a melody pin"],
  },
  {
    term: "Metoprolol",
    mistranscriptions: ["metal oil", "met oh pro lol", "me toe pro loll"],
  },
  {
    term: "Ramipril",
    mistranscriptions: ["ram a pill", "ramp aril", "rami prill"],
  },
  {
    term: "Escitalopram",
    mistranscriptions: [
      "escape tell a pram",
      "es sit a low pram",
      "es cital o pram",
    ],
  },
  {
    term: "Levothyroxine",
    mistranscriptions: ["leave oh thy rocks in", "levo thigh roxanne"],
  },
  {
    term: "Methylprednisolone",
    mistranscriptions: ["methyl predator so lone", "metal prednisone"],
  },
  {
    term: "Prednisolone",
    mistranscriptions: ["predator so lone", "pred ni solo", "prednisone alone"],
  },
  {
    term: "Furosemide",
    mistranscriptions: ["furious a maid", "few rows a mid", "furose might"],
  },
  {
    term: "Spironolactone",
    mistranscriptions: ["spiral lactone", "spy rono lack tone"],
  },
  {
    term: "Torsemide",
    mistranscriptions: ["tour semi day", "toss a mide", "torso might"],
  },
  {
    term: "Insulin Glargine",
    mistranscriptions: ["insult in glarjeen", "insulin glad gene"],
  },
  {
    term: "Insulin Aspart",
    mistranscriptions: ["insult in apart", "insulin as part"],
  },
  {
    term: "Clarithromycin",
    mistranscriptions: ["clarity row my sin", "cla rhythm ice in"],
  },
  {
    term: "Cefuroxime",
    mistranscriptions: ["safe you rocks him", "sef euro extreme"],
  },
  {
    term: "Apixaban",
    mistranscriptions: ["a picks a ban", "apex a ban", "a pixel ban"],
  },
  {
    term: "Linagliptin",
    mistranscriptions: ["linear glip tin", "lina grip tin"],
  },
  {
    term: "Labetalol",
    mistranscriptions: ["label all", "la better lol", "label a lol"],
  },
  {
    term: "Hydroxychloroquine",
    mistranscriptions: ["hydroxy chloroquine", "hydroxy claw queen"],
  },
  {
    term: "Methotrexate",
    mistranscriptions: ["metro tracks eight", "method tracks ate"],
  },
  { term: "Gabapentin", mistranscriptions: ["grab a pen tin", "gab upon tin"] },
  { term: "QDS", mistranscriptions: ["cue d s", "kudos", "cuties"] },
  { term: "TDS", mistranscriptions: ["t d s", "tedious", "teddies"] },
  { term: "BD", mistranscriptions: ["be de", "beady", "buddy"] },
  { term: "OD", mistranscriptions: ["oh dee", "ode", "oddy"] },
  { term: "PRN", mistranscriptions: ["pee are en", "pirn", "preen"] },
  { term: "SOS", mistranscriptions: ["sos", "sauce"] },
  { term: "STAT", mistranscriptions: ["state"] },
  { term: "Heparin", mistranscriptions: ["heparin", "hep rin", "hep-rin"] },
  { term: "Morphine", mistranscriptions: ["morphine", "more fin", "morfin"] },
  {
    term: "Diclofenac",
    mistranscriptions: ["diclofenac", "diclo", "declofenac"],
  },
  { term: "HS", mistranscriptions: ["aitch es", "hes", "his"] },
  {
    term: "Troponin",
    mistranscriptions: [
      "trope on in",
      "tropo nine",
      "tropical nin",
      "trophy nin",
    ],
  },
  {
    term: "Creatinine",
    mistranscriptions: ["creative nine", "create a nine", "cree atinine"],
  },
  {
    term: "HbA1c",
    mistranscriptions: ["hba one see", "hab a one see", "h b a 1 c"],
  },
  {
    term: "PT-INR",
    mistranscriptions: ["pt inner", "pity inner", "petty in r"],
  },
];

// 2. Multilingual Negations
export const NEGATIONS: Record<string, string[]> = {
  te: [
    "ivvaledu",
    "ivvakudadu",
    "kudadu",
    "ledu",
    "vaddhu",
    "cheyakandi",
    "aapandi",
    "cheyakudadu",
  ],
  hi: [
    "mat do",
    "nahi",
    "band karo",
    "mat karo",
    "na dena",
    "nahi dena",
    "mat dena",
    "rok do",
    "hatao",
    "bilkul nahi",
  ],
  ta: [
    "kudadhu",
    "venda",
    "illai",
    "kudaadhu",
    "pannakudadhu",
    "kodukka kudadhu",
    "vaenda",
  ],
  kn: ["baralla", "kudadu", "beda", "kodabaradu", "maadabaradu", "nillisi"],
  ml: ["paadilla", "aruthhu", "venda", "kodukkaruthhu", "cheyyaruthhu"],
  mr: ["deu naka", "nahi", "nako", "band kara", "thambav", "deu naye"],
  bn: ["deben na", "korben na", "bandho korun", "na", "deoaa uchhit noy"],
  gu: ["aapvo nahi", "nathi", "band karo", "nakko", "na aapo"],
};

// 3. Regional Number Words
const NUMBERS: Record<string, Record<string, number>> = {
  te: {
    oka: 1,
    rendu: 2,
    moodu: 3,
    naalugu: 4,
    aidu: 5,
    aaru: 6,
    edu: 7,
    enimidi: 8,
    thommidi: 9,
    padhi: 10,
    iravai: 20,
    nooru: 100,
  },
  hi: {
    ek: 1,
    do: 2,
    teen: 3,
    chaar: 4,
    paanch: 5,
    chhe: 6,
    saat: 7,
    aath: 8,
    nau: 9,
    das: 10,
    bees: 20,
    sau: 100,
    dedh: 1.5,
    dhai: 2.5,
  },
  ta: {
    onnu: 1,
    rendu: 2,
    moonu: 3,
    naalu: 4,
    anju: 5,
    aaru: 6,
    ezhu: 7,
    ettu: 8,
    onpathu: 9,
    pathu: 10,
    iruvathu: 20,
    nooru: 100,
  },
  kn: {
    ondu: 1,
    eradu: 2,
    mooru: 3,
    nalku: 4,
    aidu: 5,
    aaru: 6,
    elu: 7,
    entu: 8,
    ombattu: 9,
    hathu: 10,
    ippathu: 20,
    nooru: 100,
  },
  ml: {
    onnu: 1,
    randu: 2,
    moonnu: 3,
    naalu: 4,
    anchu: 5,
    aaru: 6,
    ezhu: 7,
    ettu: 8,
    onpathu: 9,
    pathu: 10,
  },
  mr: {
    ek: 1,
    don: 2,
    teen: 3,
    chaar: 4,
    paach: 5,
    saha: 6,
    saat: 7,
    aath: 8,
    nau: 9,
    daha: 10,
    vees: 20,
  },
  bn: {
    ek: 1,
    dui: 2,
    tin: 3,
    char: 4,
    panch: 5,
    chhoy: 6,
    shaat: 7,
    aat: 8,
    noy: 9,
    dosh: 10,
  },
};

export const commonNames = [
  "Ramaiah",
  "Sharma",
  "Gupta",
  "Yadav",
  "Aadhya",
  "Rajan",
  "Padma",
  "Savitri",
  "Arun",
  "Meera",
  "Kamala",
  "Subrahmanyam",
  "Nisha",
  "Abbas",
  "Murugan",
  "Deshmukh",
  "Tripathi",
];

/**
 * Normalizes a transcript by applying the Medical Intelligence Layer.
 */
export function processMedicalIntelligence(rawTranscript: string): string {
  let corrected = rawTranscript;

  // 1. Correct mistranscribed drugs
  // We use simple string replacement since these are multi-word phrases and Levenshtein might falsely match others.
  // We do case-insensitive replacements
  for (const entry of DICTIONARY) {
    for (const mistranscription of entry.mistranscriptions) {
      const regex = new RegExp(`\\b${mistranscription}\\b`, "gi");
      corrected = corrected.replace(regex, entry.term);
    }
  }

  // 2. Identify Negations and wrap them with a clear flag for the LLM
  // Deduplicate and sort by length descending to match longer phrases first
  const uniqueNegations = Array.from(
    new Set(Object.values(NEGATIONS).flat()),
  ).sort((a, b) => b.length - a.length);

  // Match in a single pass using a combined regex to prevent double-wrapping
  // Exclude "na" to prevent false positives in Tamil conditional suffixes and Sodium (Na) symbols
  const escapedNegations = uniqueNegations
    .filter((n) => n !== "na")
    .map((n) => n.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"));

  const negationRegex = new RegExp(
    `\\b(${escapedNegations.join("|")})\\b`,
    "gi",
  );
  corrected = corrected.replace(
    negationRegex,
    (match) => `[CRITICAL NEGATION: ${match}]`,
  );

  // Match "na" specifically, ensuring it's not preceded by Tamil conditional verbs / chemicals
  // and not followed by result keywords
  const naRegex =
    /(?<!\b(?:sodium|serum|poguthu|varthu|aana|venam)\s+)\bna\b(?!\s+(?:level|value|concentration|result))/gi;
  corrected = corrected.replace(
    naRegex,
    (match) => `[CRITICAL NEGATION: ${match}]`,
  );

  // 3. Extract dosages
  // We will normalize regional numbers to their numeric values
  const allNumberLangs = Object.values(NUMBERS);
  for (const numLangMap of allNumberLangs) {
    for (const [word, value] of Object.entries(numLangMap)) {
      if (word === "do") {
        // Keep do: 2 for assessment alignment, but restrict replacement so it only matches
        // when followed by numerical or dosage units (e.g. "do tablet", "do weeks")
        // to avoid replacing the extremely common Hindi verb 'do' (give).
        const regex =
          /\bdo\b(?=\s*(?:tablet|drop|spoon|capsule|mg|ml|unit|od|bd|tds|qds|prn|sos|stat|day|week|month|year|percent|%))/gi;
        corrected = corrected.replace(regex, `${value}`);
      } else if (word === "don") {
        // Protect Marathi "don" (2) from matching "don't"
        const regex = /\bdon\b(?!')/gi;
        corrected = corrected.replace(regex, `${value}`);
      } else if (word === "teen" || word === "bees" || word === "tin") {
        // Protect English words "teen", "bees", "tin" by requiring a dosage/time unit context
        const regex = new RegExp(
          `\\b${word}\\b(?=\\s*(?:tablet|drop|spoon|capsule|mg|ml|unit|od|bd|tds|qds|prn|sos|stat|day|week|month|year|percent|%))`,
          "gi",
        );
        corrected = corrected.replace(regex, `${value}`);
      } else {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        corrected = corrected.replace(regex, `${value}`);
      }
    }
  }

  // 4. PHI Stripping (Heuristic)
  for (const name of commonNames) {
    const regex = new RegExp(`\\b${name}\\b`, "gi");
    corrected = corrected.replace(regex, `[PATIENT]`);
  }

  return corrected;
}
