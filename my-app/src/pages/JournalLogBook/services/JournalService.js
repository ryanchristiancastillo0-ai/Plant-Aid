import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';


// ─────────────────────────────────────────────────────────────
// HELPER: convert + compress image file to base64 data URL
// ─────────────────────────────────────────────────────────────

/**
 * Convert an image File to a compressed base64 data URL.
 * Keeps Firestore document size small (no Storage bucket in use).
 *
 * @param {File}   file
 * @param {number} [maxWidth=1000]
 * @param {number} [quality=0.7]
 * @returns {Promise<string>} base64 data URL
 */
function fileToCompressedBase64(file, maxWidth = 1000, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


// ─────────────────────────────────────────────────────────────
// 1. FETCH JOURNALS
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all journal entries for a user, newest first.
 *
 * @param {string} userId
 * @returns {Promise<JournalDoc[]>}
 */
export async function fetchJournals(userId) {
  const q = query(
    collection(db, 'journals'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch a single journal entry by ID.
 *
 * @param {string} journalId
 * @returns {Promise<JournalDoc|null>}
 */
export async function fetchJournalById(journalId) {
  const snap = await getDoc(doc(db, 'journals', journalId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Fetch journals for a specific userPlant.
 *
 * @param {string} userId
 * @param {string} userPlantId
 * @returns {Promise<JournalDoc[]>}
 */
export async function fetchJournalsByPlant(userId, userPlantId) {
  const q = query(
    collection(db, 'journals'),
    where('userId',      '==', userId),
    where('userPlantId', '==', userPlantId),
    orderBy('createdAt', 'desc'),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}


// ─────────────────────────────────────────────────────────────
// 2. CREATE JOURNAL
// ─────────────────────────────────────────────────────────────

/**
 * Create a new journal entry. Images are compressed and stored
 * as base64 data URLs directly in Firestore (no Storage bucket).
 *
 * @param {string} userId
 * @param {object} data
 * @param {string}    data.title
 * @param {string}    data.content
 * @param {string}    [data.userPlantId]      – optional plant link
 * @param {string}    [data.customPlantLabel] – optional custom plant name
 * @param {File}      [data.imageFile]        – optional image file
 * @returns {Promise<JournalDoc>}              – the newly created journal with id
 */
export async function createJournal(userId, {
  title,
  content,
  userPlantId = '',
  customPlantLabel = '',
  imageFile = null,
}) {
  let imageUrl = '';

  if (imageFile) {
    imageUrl = await fileToCompressedBase64(imageFile);
  }

  const docRef = await addDoc(collection(db, 'journals'), {
    userId,
    userPlantId,
    customPlantLabel,
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
    customPlantLabel,
    title:     title.trim(),
    content:   content.trim(),
    imageUrl,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}


// ─────────────────────────────────────────────────────────────
// 3. UPDATE JOURNAL
// ─────────────────────────────────────────────────────────────

/**
 * Update an existing journal entry. If a new imageFile is provided,
 * it's compressed and replaces the stored base64 image.
 *
 * @param {string} journalId
 * @param {string} userId
 * @param {object} data
 * @param {string}    [data.title]
 * @param {string}    [data.content]
 * @param {string}    [data.userPlantId]
 * @param {string}    [data.customPlantLabel]
 * @param {File}      [data.imageFile]    – new image to replace existing one
 * @param {boolean}   [data.removeImage]  – set true to clear the image
 * @returns {Promise<{ imageUrl: string|undefined }>} the new imageUrl (if changed)
 */
export async function updateJournal(journalId, userId, {
  title,
  content,
  userPlantId,
  customPlantLabel,
  imageFile = null,
  removeImage = false,
}) {
  const updates = {
    updatedAt: serverTimestamp(),
  };

  if (title             !== undefined) updates.title             = title.trim();
  if (content           !== undefined) updates.content           = content.trim();
  if (userPlantId       !== undefined) updates.userPlantId       = userPlantId;
  if (customPlantLabel  !== undefined) updates.customPlantLabel  = customPlantLabel;

  if (imageFile) {
    updates.imageUrl = await fileToCompressedBase64(imageFile);
  } else if (removeImage) {
    updates.imageUrl = '';
  }

  await updateDoc(doc(db, 'journals', journalId), updates);

  return { imageUrl: updates.imageUrl };
}


// ─────────────────────────────────────────────────────────────
// 4. DELETE JOURNAL
// ─────────────────────────────────────────────────────────────

/**
 * Delete a journal entry from Firestore.
 *
 * @param {string} journalId
 * @returns {Promise<void>}
 */
export async function deleteJournal(journalId) {
  await deleteDoc(doc(db, 'journals', journalId));
}

/**
 * Delete a journal entry. Kept for compatibility with existing calls —
 * no separate image cleanup needed since images are stored inline.
 *
 * @param {string} journalId
 * @param {string} [imageUrl] – unused, kept for signature compatibility
 * @returns {Promise<void>}
 */
export async function deleteJournalWithImage(journalId, imageUrl) {
  await deleteDoc(doc(db, 'journals', journalId));
}


// ─────────────────────────────────────────────────────────────
// 5. HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Format a Firestore Timestamp or JS Date to a readable string.
 * e.g. "June 03, 2026"
 *
 * @param {Timestamp|Date|null} ts
 * @returns {string}
 */
export function formatJournalDate(ts) {
  if (!ts) return '';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'long',
    day:   '2-digit',
  });
}