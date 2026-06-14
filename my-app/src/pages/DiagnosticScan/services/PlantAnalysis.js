// PlantAnalysisService.js
// Gemini API integration for deep botanical analysis.
// Called AFTER Plant.id identifies the plant.
// Saves results to the new `plantAnalysis` Firestore collection.
// ============================================================

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_BASE    = 'https://generativelanguage.googleapis.com/v1beta/models';

// ─────────────────────────────────────────────────────────────
// FREE TIER MODEL ROTATION
// Only models confirmed to have free quota (RPM > 0).
// Ordered by RPD (requests per day) — highest first.
// callGeminiApi() tries them in order — if one returns 429,
// it automatically falls back to the next one.
//
// Free tier quotas (as of your plan):
//   gemini-3.1-flash-lite  → 15 RPM, 250K TPM, 500 RPD  ← best
//   gemini-2.5-flash-lite  → 10 RPM, 250K TPM,  20 RPD
//   gemini-2.5-flash       →  5 RPM, 250K TPM,  20 RPD
//   gemini-3.5-flash       →  5 RPM, 250K TPM,  20 RPD
//   gemini-3-flash         →  5 RPM, 250K TPM,  20 RPD
// ─────────────────────────────────────────────────────────────
const GEMINI_MODELS = [
  'gemini-3.1-flash-lite',   // primary   — 500 RPD, highest free quota
  'gemini-2.5-flash-lite',   // fallback 1 — 10 RPM, separate bucket
  'gemini-2.5-flash',        // fallback 2 — separate quota
  'gemini-3.5-flash',        // fallback 3 — separate quota
  'gemini-3-flash',          // fallback 4 — last resort
];


// ─────────────────────────────────────────────────────────────
// 1. BUILD PROMPT  (from Plant.id result)
// ─────────────────────────────────────────────────────────────

/**
 * Build a structured Gemini prompt from the Plant.id result.
 * Asks Gemini to return strict JSON matching our Firestore schema.
 *
 * @param {object} plantIdResult  – normalized result from identifyPlant()
 * @returns {string}              – prompt string
 */
function buildGeminiPrompt(plantIdResult) {
  const top        = plantIdResult.suggestions?.[0];
  const commonName = top?.commonNames?.[0] || top?.name || 'Unknown Plant';
  const sciName    = top?.name || '';
  const isHealthy  = plantIdResult.isHealthy;
  const diseases   = plantIdResult.diseases?.map((d) => d.name).join(', ') || 'none detected';

  return `
You are an expert botanist and horticulturist. A plant has been identified with the following details:

- Common Name: ${commonName}
- Scientific Name: ${sciName}
- Health Status: ${isHealthy ? 'Healthy' : 'Unhealthy / Diseased'}
- Detected Conditions / Diseases: ${diseases}

Provide a comprehensive botanical analysis in STRICT JSON format. Do NOT include markdown, code blocks, or any text outside the JSON. Return ONLY this JSON object:

{
  "overview": "2-3 sentence description of this plant, its origin, and characteristics",
  "careDifficulty": "Easy" | "Moderate" | "Advanced",
  "gardeningMethod": "one of: Container Gardening | Raised Bed | In-Ground | Hydroponic | Aquaponic | Vertical Garden | Greenhouse | Indoor | Balcony Garden",
  "wateringGuide": {
    "frequency": "e.g. Every 7 days",
    "amount": "e.g. Water until soil is moist 2 inches deep",
    "tips": "1-2 specific watering tips for this plant"
  },
  "sunlightGuide": {
    "requirement": "Full Sun | Partial Shade | Indirect Light | Low Light",
    "hoursPerDay": "e.g. 6-8 hours",
    "tips": "1-2 specific light tips"
  },
  "soilGuide": {
    "type": "e.g. Well-draining loamy soil",
    "pH": "e.g. 6.0–7.0",
    "tips": "1-2 soil preparation tips"
  },
  "fertilizingGuide": {
    "frequency": "e.g. Every 30 days during growing season",
    "type": "e.g. Balanced NPK 10-10-10",
    "tips": "1-2 fertilizing tips"
  },
  "commonPests": ["pest1", "pest2", "pest3"],
  "pestControl": "2-3 sentence practical pest management advice for this specific plant",
  "diseaseManagement": "${isHealthy ? 'Preventive care tips to keep this plant healthy' : `Treatment advice for the detected condition: ${diseases}`}",
  "propagationMethods": ["method1", "method2"],
  "growthTimeline": {
    "germination": "e.g. 7-14 days",
    "seedling": "e.g. 2-4 weeks",
    "maturity": "e.g. 60-90 days"
  },
  "harvestTips": "Harvest guidance if applicable, or null if not a food plant",
  "companionPlants": ["plant1", "plant2", "plant3"],
  "toxicity": {
    "istoxic": true | false,
    "toxicTo": ["humans", "cats", "dogs"] or [],
    "details": "brief toxicity note or null"
  },
  "climateSuitability": "Ideal climate zones and temperature range for this plant",
  "quickTips": ["tip1", "tip2", "tip3", "tip4"]
}
`.trim();
}


// ─────────────────────────────────────────────────────────────
// 2. CALL GEMINI API  (with model rotation on 429)
// ─────────────────────────────────────────────────────────────

/**
 * Try calling a single Gemini model. Returns the parsed JSON on
 * success, or throws with a { is429: true } flag so the caller
 * knows to try the next model in the rotation.
 *
 * @param {string} model   – model name string
 * @param {string} prompt
 * @returns {Promise<object>}
 */
async function tryModel(model, prompt) {
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature:     0.3,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (response.status === 429 || response.status === 404) {
    console.warn(`[PlantAnalysis] ${response.status} on model "${model}" — trying next model...`);
    const err    = new Error(`${response.status} on ${model}`);
    err.is429    = true; // reuse flag for any skippable error
    err.model    = model;
    throw err;
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error('Invalid Gemini API key. Check VITE_GEMINI_API_KEY.');
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${model}): ${response.status} — ${errText}`);
  }

  const data    = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  console.log(`[PlantAnalysis] ✓ Model "${model}" responded. Preview:`, rawText.slice(0, 120));

const cleaned = rawText
  .replace(/^```json\s*/i, '')
  .replace(/^```\s*/i, '')
  .replace(/\s*```$/i, '')
  .replace(/,(\s*[}\]])/g, '$1')   // ← strips trailing commas
  .trim();

  try {
    return JSON.parse(cleaned);
  } catch (parseErr) {
    console.error('[PlantAnalysis] JSON parse error. Raw text:', rawText);
    throw new Error('Gemini returned invalid JSON. Try scanning again.');
  }
}

/**
 * Call the Gemini API with automatic model rotation.
 * Tries each model in GEMINI_MODELS in order.
 * Falls through to the next model only on 429 (rate limit).
 * All other errors (auth, parse, network) throw immediately.
 *
 * @param {string} prompt
 * @returns {Promise<object>}  – parsed JSON analysis object
 */
async function callGeminiApi(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('[PlantAnalysis] VITE_GEMINI_API_KEY is not set in your .env file.');
  }

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const result = await tryModel(model, prompt);
      console.log(`[PlantAnalysis] Successfully used model: "${model}"`);
      return result;
    } catch (err) {
      if (err.is429) {
        lastError = err;
        continue; // try next model
      }
      throw err; // non-429 error — bubble up immediately
    }
  }

  // All 5 models exhausted (429 or 404)
  throw new Error(
    'All Gemini models are unavailable right now. Please wait a minute and try again.\n' +
    `Last error: ${lastError?.message}`
  );
}


// ─────────────────────────────────────────────────────────────
// 3. SAVE TO FIRESTORE  (plantAnalysis collection)
// ─────────────────────────────────────────────────────────────

/**
 * Save a Gemini analysis to the `plantAnalysis` Firestore collection.
 *
 * @param {string} userId
 * @param {string} scanId        – from identificationHistory
 * @param {string} commonName
 * @param {string} scientificName
 * @param {object} analysis      – parsed Gemini response
 * @returns {Promise<string>}    – new analysisId
 */
export async function savePlantAnalysis(userId, scanId, commonName, scientificName, analysis) {
  const docRef = await addDoc(collection(db, 'plantAnalysis'), {
    userId,
    scanId,
    commonName,
    scientificName,

    overview:           analysis.overview           ?? '',
    careDifficulty:     analysis.careDifficulty     ?? 'Moderate',
    gardeningMethod:    analysis.gardeningMethod    ?? '',
    wateringGuide:      analysis.wateringGuide      ?? {},
    sunlightGuide:      analysis.sunlightGuide      ?? {},
    soilGuide:          analysis.soilGuide          ?? {},
    fertilizingGuide:   analysis.fertilizingGuide   ?? {},
    commonPests:        analysis.commonPests        ?? [],
    pestControl:        analysis.pestControl        ?? '',
    diseaseManagement:  analysis.diseaseManagement  ?? '',
    propagationMethods: analysis.propagationMethods ?? [],
    growthTimeline:     analysis.growthTimeline     ?? {},
    harvestTips:        analysis.harvestTips        ?? null,
    companionPlants:    analysis.companionPlants    ?? [],
    toxicity:           analysis.toxicity           ?? { istoxic: false, toxicTo: [], details: null },
    climateSuitability: analysis.climateSuitability ?? '',
    quickTips:          analysis.quickTips          ?? [],

    createdAt: serverTimestamp(),
  });

  return docRef.id;
}


// ─────────────────────────────────────────────────────────────
// 4. FETCH ANALYSIS
// ─────────────────────────────────────────────────────────────

/**
 * Fetch a plant analysis by its scanId.
 * Returns null if no analysis exists for that scan yet.
 *
 * @param {string} scanId
 * @returns {Promise<PlantAnalysisDoc|null>}
 */
export async function fetchAnalysisByScanId(scanId) {
  const q = query(
    collection(db, 'plantAnalysis'),
    where('scanId', '==', scanId),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

/**
 * Fetch recent plant analyses for a user.
 *
 * @param {string} userId
 * @param {number} [maxItems=5]
 * @returns {Promise<PlantAnalysisDoc[]>}
 */
export async function fetchRecentAnalyses(userId, maxItems = 5) {
  const q = query(
    collection(db, 'plantAnalysis'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(maxItems),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch a single analysis document by its Firestore ID.
 *
 * @param {string} analysisId
 * @returns {Promise<PlantAnalysisDoc|null>}
 */
export async function fetchAnalysisById(analysisId) {
  const snap = await getDoc(doc(db, 'plantAnalysis', analysisId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}


// ─────────────────────────────────────────────────────────────
// 5. FULL ANALYSIS PIPELINE
// ─────────────────────────────────────────────────────────────

/**
 * Run the full Gemini analysis pipeline:
 *   1. Build prompt from Plant.id result
 *   2. Call Gemini API (with model rotation on 429)
 *   3. Save analysis to Firestore plantAnalysis collection
 *
 * @param {string} userId
 * @param {string} scanId          – from identificationHistory (can be null)
 * @param {object} plantIdResult   – normalized result from identifyPlant()
 * @returns {Promise<{ analysisId: string, analysis: object }>}
 */
export async function runAnalysisPipeline(userId, scanId, plantIdResult) {
  const top            = plantIdResult.suggestions?.[0];
  const commonName     = top?.commonNames?.[0] || top?.name || 'Unknown Plant';
  const scientificName = top?.name || '';

  // Step 1 — build prompt
  const prompt = buildGeminiPrompt(plantIdResult);

  // Step 2 — call Gemini (auto-rotates models on 429)
  const analysis = await callGeminiApi(prompt);

  // Step 3 — save to Firestore
  const analysisId = await savePlantAnalysis(
    userId,
    scanId ?? '',
    commonName,
    scientificName,
    analysis,
  );

  return { analysisId, analysis };
}


// ─────────────────────────────────────────────────────────────
// 6. HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Get difficulty config (color + label) for care difficulty string.
 *
 * @param {string} difficulty  – 'Easy' | 'Moderate' | 'Advanced'
 * @returns {{ bg, text, border }}
 */
export function getDifficultyConfig(difficulty) {
  switch (difficulty) {
    case 'Easy':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'Advanced':
      return { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200'     };
    default:
      return { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   };
  }
}