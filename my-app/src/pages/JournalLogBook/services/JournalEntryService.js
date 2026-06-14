// ============================================================
// NewJournalEntryService.js
// Data layer for the New Journal Entry screen.
// Follows the same pattern as JournalService.js
// ============================================================

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';


// ─────────────────────────────────────────────────────────────
// 1. USER PLANTS  (for the plant selector dropdown)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all userPlants for a user — used to populate the
 * "Select Plant" dropdown in the editor.
 *
 * @param {string} userId
 * @returns {Promise<UserPlantDoc[]>}
 *
 * UserPlantDoc shape:
 * { id, userId, plantId, nickname, currentStage, imageUrl, createdAt }
 */
export async function fetchUserPlantsForSelector(userId) {
  const q = query(
    collection(db, 'userPlants'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}


// ─────────────────────────────────────────────────────────────
// 2. PUBLISH JOURNAL ENTRY
// ─────────────────────────────────────────────────────────────

/**
 * Publish (create) a new journal entry in Firestore.
 *
 * @param {string}    userId
 * @param {object}    data
 * @param {string}    data.title
 * @param {string}    data.content
 * @param {string}    [data.userPlantId]  – selected plant id (optional)
 * @returns {Promise<JournalDoc>}         – newly created journal with id
 *
 * JournalDoc shape (matches Firestore schema):
 * { id, userId, userPlantId, title, content, imageUrl, createdAt, updatedAt }
 */
export async function publishJournalEntry(userId, {
  title,
  content,
  userPlantId = '',
}) {
  let imageUrl = '';

  const docRef = await addDoc(collection(db, 'journals'), {
    userId,
    userPlantId,
    title:     title.trim(),
    content:   content.trim(),
    imageUrl,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    userId,
    userPlantId,
    title:     title.trim(),
    content:   content.trim(),
    imageUrl,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}


// ─────────────────────────────────────────────────────────────
// 3. HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Get today's date formatted for display in the editor.
 * e.g. "June 04, 2026"
 *
 * @returns {string}
 */
export function getTodayLabel() {
  return new Date().toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'long',
    day:   '2-digit',
  });
}

/**
 * Validate journal entry fields before publishing.
 * Returns an error message string, or null if valid.
 *
 * @param {string} title
 * @param {string} content
 * @returns {string|null}
 */
export function validateEntry(title, content) {
  if (!title.trim())   return 'Please add a title before publishing.';
  if (!content.trim()) return 'Please add some notes before publishing.';
  return null;
}