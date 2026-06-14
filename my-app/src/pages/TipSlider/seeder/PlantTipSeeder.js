// ============================================================
// PlantTipsSeeder.js
// Seeds the plantTips Firestore collection from local data.
// Uses count-based threshold — won't re-seed if data exists.
// Mirrors the pattern used in PlantSeeder.js.
// ============================================================

import {
  collection,
  addDoc,
  getCountFromServer,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../../../firebase/firebase';

// ── Import your local tips data ──────────────────────────────
// Create this file at src/features/tips/seeder/data.js
// Shape: export default [ { title, slug, summary, content,
//   category, difficulty, imageUrl, tags, relatedPlants,
//   views, featured }, ... ]
import {tipsData }from './data';

// ── Guard threshold ───────────────────────────────────────────
// If plantTips already has more than this many docs, skip seeding.
// Set higher than any manually added docs you want to coexist with.
const EXISTING_DOC_THRESHOLD = 2;

const TIPS_COLLECTION = 'plantTips';


// ─────────────────────────────────────────────────────────────
// seedPlantTips
// ─────────────────────────────────────────────────────────────

/**
 * Seeds the plantTips collection from local data.js.
 * Skips if the collection already has more than EXISTING_DOC_THRESHOLD docs.
 *
 * @returns {Promise<string>}  – human-readable status message
 */
export async function seedPlantTips() {
  // 1. Count existing docs
  const snap  = await getCountFromServer(collection(db, TIPS_COLLECTION));
  const count = snap.data().count;

  if (count > EXISTING_DOC_THRESHOLD) {
    console.log(`[PlantTipsSeeder] Skipping — ${count} docs already exist.`);
    return `Already seeded (${count} tips found). Nothing written.`;
  }

  // 2. Seed each tip
  let seeded = 0;
  const errors = [];

  for (const tip of tipsData) {
    try {
      await addDoc(collection(db, TIPS_COLLECTION), {
        title:         tip.title         ?? '',
        slug:          tip.slug          ?? '',
        summary:       tip.summary       ?? '',
        content:       tip.content       ?? '',
        category:      tip.category      ?? 'General',
        difficulty:    tip.difficulty    ?? 'Beginner',
        imageUrl:      tip.imageUrl      ?? '',
        tags:          tip.tags          ?? [],
        relatedPlants: tip.relatedPlants ?? [],
        views:         tip.views         ?? 0,
        featured:      tip.featured      ?? false,
        createdAt:     serverTimestamp(),
      });
      seeded++;
    } catch (err) {
      console.error(`[PlantTipsSeeder] Failed to seed "${tip.title}":`, err);
      errors.push(tip.title);
    }
  }

  const message = errors.length > 0
    ? `Seeded ${seeded}/${tipsData.length} tips. Failed: ${errors.join(', ')}`
    : `Successfully seeded ${seeded} tips into plantTips. ✅`;

  console.log(`[PlantTipsSeeder] ${message}`);
  return message;
}