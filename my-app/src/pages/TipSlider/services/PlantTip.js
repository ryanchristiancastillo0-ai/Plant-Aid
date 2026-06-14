// ============================================================
// PlantTipsService.js
// Data layer for the plantTips Firestore collection.
// ============================================================

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';

import { db } from '../../../firebase/firebase';

const TIPS_COLLECTION = 'plantTips';


// ─────────────────────────────────────────────────────────────
// 1. FETCH FEATURED TIPS
// Returns tips where featured === true, ordered by createdAt desc.
// ─────────────────────────────────────────────────────────────

/**
 * @param {number} [maxItems=8]
 * @returns {Promise<TipDoc[]>}
 */
export async function fetchFeaturedTips(maxItems = 8) {
  const q = query(
    collection(db, TIPS_COLLECTION),
    where('featured', '==', true),
    orderBy('createdAt', 'desc'),
    limit(maxItems),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}


// ─────────────────────────────────────────────────────────────
// 2. FETCH ALL TIPS (ordered by createdAt desc)
// ─────────────────────────────────────────────────────────────

/**
 * @param {number} [maxItems=20]
 * @returns {Promise<TipDoc[]>}
 */
export async function fetchAllTips(maxItems = 20) {
  const q = query(
    collection(db, TIPS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(maxItems),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}


// ─────────────────────────────────────────────────────────────
// 3. FETCH TIPS BY CATEGORY
// ─────────────────────────────────────────────────────────────

/**
 * @param {string} category  – e.g. "Watering", "Sunlight"
 * @param {number} [maxItems=8]
 * @returns {Promise<TipDoc[]>}
 */
export async function fetchTipsByCategory(category, maxItems = 8) {
  const q = query(
    collection(db, TIPS_COLLECTION),
    where('category', '==', category),
    orderBy('createdAt', 'desc'),
    limit(maxItems),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}


// ─────────────────────────────────────────────────────────────
// 4. FETCH TIP BY SLUG
// ─────────────────────────────────────────────────────────────

/**
 * @param {string} slug
 * @returns {Promise<TipDoc|null>}
 */
export async function fetchTipBySlug(slug) {
  const q = query(
    collection(db, TIPS_COLLECTION),
    where('slug', '==', slug),
    limit(1),
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}


// ─────────────────────────────────────────────────────────────
// 5. FETCH TIP BY ID
// ─────────────────────────────────────────────────────────────

/**
 * @param {string} tipId
 * @returns {Promise<TipDoc|null>}
 */
export async function fetchTipById(tipId) {
  const ref  = doc(db, TIPS_COLLECTION, tipId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}


// ─────────────────────────────────────────────────────────────
// 6. INCREMENT VIEW COUNT
// Called when user opens a tip's deep-dive.
// ─────────────────────────────────────────────────────────────

/**
 * @param {string} tipId
 * @returns {Promise<void>}
 */
export async function incrementTipViews(tipId) {
  const ref = doc(db, TIPS_COLLECTION, tipId);
  await updateDoc(ref, { views: increment(1) });
}


// ─────────────────────────────────────────────────────────────
// 7. FETCH TIPS BY TAG
// ─────────────────────────────────────────────────────────────

/**
 * @param {string} tag      – e.g. "root health"
 * @param {number} [maxItems=6]
 * @returns {Promise<TipDoc[]>}
 */
export async function fetchTipsByTag(tag, maxItems = 6) {
  const q = query(
    collection(db, TIPS_COLLECTION),
    where('tags', 'array-contains', tag),
    orderBy('createdAt', 'desc'),
    limit(maxItems),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}


// ─────────────────────────────────────────────────────────────
// 8. FETCH TIPS RELATED TO A PLANT
// ─────────────────────────────────────────────────────────────

/**
 * @param {string} plantName  – e.g. "Pothos"
 * @param {number} [maxItems=4]
 * @returns {Promise<TipDoc[]>}
 */
export async function fetchTipsForPlant(plantName, maxItems = 4) {
  const q = query(
    collection(db, TIPS_COLLECTION),
    where('relatedPlants', 'array-contains', plantName),
    orderBy('createdAt', 'desc'),
    limit(maxItems),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}