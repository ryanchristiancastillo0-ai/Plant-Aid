// ============================================================
// PlantDetailsService.js
// Centralised data layer for the Plant Details screen.
// Mirrors the pattern used in GrowthJourneyService – pure async
// functions the UI can call directly or wrap in useEffect /
// custom hooks.
// ============================================================

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
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { lookup } from '../../../constant/plantDetail';


// ─────────────────────────────────────────────────────────────
// 1. USER PLANT  (the specific plant being viewed)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch a single userPlant document by its Firestore ID.
 *
 * @param {string} userPlantId
 * @returns {Promise<UserPlantDoc|null>}
 *
 * UserPlantDoc shape (matches Firestore schema):
 * {
 *   id:           string,
 *   userId:       string,
 *   plantId:      string,
 *   nickname:     string,
 *   plantedDate:  Timestamp,
 *   currentStage: string,
 *   imageUrl:     string,
 *   createdAt:    Timestamp,
 * }
 */
export async function fetchUserPlantById(userPlantId) {
  const snap = await getDoc(doc(db, 'userPlants', userPlantId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Fetch the master plant entry that a userPlant references.
 *
 * @param {string} plantId
 * @returns {Promise<PlantDoc|null>}
 *
 * PlantDoc shape:
 * {
 *   id, name, scientificName, description, imageUrl,
 *   sunlight, wateringFrequency, fertilizerFrequency,
 *   growthDays, pests, diseases, createdAt
 * }
 */
export async function fetchMasterPlant(plantId) {
  if (!plantId) return null;
  const snap = await getDoc(doc(db, 'plants', plantId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Update editable fields on a userPlant document.
 *
 * @param {string} userPlantId
 * @param {{ nickname?: string, currentStage?: string, imageUrl?: string }} updates
 * @returns {Promise<void>}
 */
export async function updateUserPlant(userPlantId, updates) {
  await updateDoc(doc(db, 'userPlants', userPlantId), updates);
}

// uploadPlantImage() removed — Firebase Storage unavailable on free plan.


// ─────────────────────────────────────────────────────────────
// 2. REMINDERS  (care schedule for this plant)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all PENDING reminders for a specific userPlant, ordered by date.
 *
 * @param {string} userId
 * @param {string} userPlantId
 * @returns {Promise<ReminderDoc[]>}
 *
 * ReminderDoc shape (matches Firestore schema):
 * {
 *   id, userId, userPlantId, title, type,
 *   reminderDate (Timestamp), completed, createdAt
 * }
 *
 * Types: WATER | FERTILIZE | REPOT | CUSTOM
 */
export async function fetchPlantReminders(userId, userPlantId) {
  const q = query(
    collection(db, 'reminders'),
    where('userId',      '==', userId),
    where('userPlantId', '==', userPlantId),
    where('completed',   '==', false),
    orderBy('reminderDate', 'asc'),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch ALL reminders (completed + pending) for a plant — for history view.
 *
 * @param {string} userId
 * @param {string} userPlantId
 * @param {number} [maxItems=20]
 * @returns {Promise<ReminderDoc[]>}
 */
export async function fetchAllPlantReminders(userId, userPlantId, maxItems = 20) {
  const q = query(
    collection(db, 'reminders'),
    where('userId',      '==', userId),
    where('userPlantId', '==', userPlantId),
    orderBy('reminderDate', 'asc'),
    limit(maxItems),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Create a new reminder for a plant.
 *
 * @param {string} userId
 * @param {string} userPlantId
 * @param {{ title: string, type: string, reminderDate: Date }} data
 * @returns {Promise<string>}  – new reminderId
 */
export async function addReminder(userId, userPlantId, { title, type, reminderDate }) {
  const ref = await addDoc(collection(db, 'reminders'), {
    userId,
    userPlantId,
    title,
    type,
    reminderDate: Timestamp.fromDate(new Date(reminderDate)),
    completed:    false,
    createdAt:    Timestamp.now(),
  });
  return ref.id;
}

/**
 * Mark a reminder as completed.
 *
 * @param {string} reminderId
 * @returns {Promise<void>}
 */
export async function completeReminder(reminderId) {
  await updateDoc(doc(db, 'reminders', reminderId), { completed: true });
}

/**
 * Delete a reminder permanently.
 *
 * @param {string} reminderId
 * @returns {Promise<void>}
 */
export async function deleteReminder(reminderId) {
  await deleteDoc(doc(db, 'reminders', reminderId));
}


// ─────────────────────────────────────────────────────────────
// 3. JOURNALS  (growth diary entries for this plant)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all journal entries for a specific userPlant, newest first.
 *
 * @param {string} userId
 * @param {string} userPlantId
 * @param {number} [maxItems=20]
 * @returns {Promise<JournalDoc[]>}
 *
 * JournalDoc shape (matches Firestore schema):
 * {
 *   id, userId, userPlantId, title, content,
 *   imageUrl, createdAt (Timestamp), updatedAt (Timestamp)
 * }
 */
export async function fetchPlantJournals(userId, userPlantId, maxItems = 20) {
  const q = query(
    collection(db, 'journals'),
    where('userId',      '==', userId),
    where('userPlantId', '==', userPlantId),
    orderBy('createdAt', 'desc'),
    limit(maxItems),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Add a new journal entry for a plant.
 *
 * @param {string} userId
 * @param {string} userPlantId
 * @param {{ title: string, content: string, imageUrl?: string }} data
 * @returns {Promise<string>}  – new journalId
 */
export async function addJournalEntry(userId, userPlantId, { title, content, imageUrl = '' }) {
  const now = Timestamp.now();
  const ref = await addDoc(collection(db, 'journals'), {
    userId,
    userPlantId,
    title,
    content,
    imageUrl,
    createdAt:  now,
    updatedAt:  now,
  });
  return ref.id;
}

/**
 * Update an existing journal entry.
 *
 * @param {string} journalId
 * @param {{ title?: string, content?: string, imageUrl?: string }} updates
 * @returns {Promise<void>}
 */
export async function updateJournalEntry(journalId, updates) {
  await updateDoc(doc(db, 'journals', journalId), {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete a journal entry permanently.
 *
 * @param {string} journalId
 * @returns {Promise<void>}
 */
export async function deleteJournalEntry(journalId) {
  await deleteDoc(doc(db, 'journals', journalId));
}

// uploadJournalImage() removed — Firebase Storage unavailable on free plan.


// ─────────────────────────────────────────────────────────────
// 4. BOTANICAL SPECS  (derived from master plant — read-only)
// ─────────────────────────────────────────────────────────────

/**
 * Derive botanical classification data from the master plant.
 * Since the House Plants API doesn't include taxonomy, we use a
 * simple lookup table for common families/genera.
 *
 * @param {PlantDoc} masterPlant
 * @returns {{ family: string, genus: string, origin: string, toxicity: string }}
 */
export function deriveBotanicalSpecs(masterPlant) {
  if (!masterPlant) return { family: '—', genus: '—', origin: '—', toxicity: '—' };

  const name = (masterPlant.scientificName ?? '').toLowerCase();

 

  const match = lookup.find((l) => name.includes(l.match));
  return match
    ? { family: match.family, genus: match.genus, origin: match.origin, toxicity: match.toxicity }
    : { family: '—', genus: '—', origin: '—', toxicity: '—' };
}


// ─────────────────────────────────────────────────────────────
// 5. DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Format a Firestore Timestamp or JS Date to "MMM D, YYYY".
 *
 * @param {Timestamp|Date|null} ts
 * @returns {string}
 */
export function formatDate(ts) {
  if (!ts) return '—';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/**
 * Format a Timestamp to "h:mm AM/PM".
 *
 * @param {Timestamp|Date|null} ts
 * @returns {string}
 */
export function formatTime(ts) {
  if (!ts) return '—';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

/**
 * Map reminder type → display label and color class.
 *
 * @param {string} type  – WATER | FERTILIZE | REPOT | CUSTOM
 * @returns {{ label: string, colorClass: string }}
 */
export function reminderTypeMeta(type) {
  switch (type) {
    case 'WATER':     return { label: 'Water',     colorClass: 'bg-sky-50 text-sky-700 border-sky-100'    };
    case 'FERTILIZE': return { label: 'Fertilize', colorClass: 'bg-amber-50 text-amber-700 border-amber-100' };
    case 'REPOT':     return { label: 'Repot',     colorClass: 'bg-lime-50 text-lime-700 border-lime-100'  };
    default:          return { label: 'Custom',    colorClass: 'bg-purple-50 text-purple-700 border-purple-100' };
  }
}

/**
 * Map sunlight value → human-readable label.
 *
 * @param {string} sunlight
 * @returns {string}
 */
export function sunlightLabel(sunlight = '') {
  const map = {
    direct:   'Full Sun',
    partial:  'Partial Shade',
    indirect: 'Indirect Light',
    low:      'Low Light',
    shade:    'Deep Shade',
  };
  return map[sunlight.toLowerCase().trim()] ?? sunlight;
}

/**
 * Calculate how many days since a plant was planted.
 *
 * @param {Timestamp|Date|null} plantedDate
 * @returns {number}
 */
export function daysSincePlanted(plantedDate) {
  if (!plantedDate) return 0;

  let d;
  if (typeof plantedDate.toDate === 'function') {
    d = plantedDate.toDate();
  } else if (plantedDate?.seconds) {
    d = new Date(plantedDate.seconds * 1000);
  } else {
    d = new Date(plantedDate);
  }

  if (isNaN(d.getTime())) return 0;

  const now = new Date();
  return Math.max(0, Math.floor((now - d) / (1000 * 60 * 60 * 24)));
}

// ─────────────────────────────────────────────────────────────
// 6. AGGREGATE – single call that loads everything the screen needs
// ─────────────────────────────────────────────────────────────

/**
 * Load all data for the Plant Details screen in parallel.
 * Call this once on mount with the userPlantId from the route.
 *
 * @param {string} userPlantId
 * @param {string} userId
 * @returns {Promise<PlantDetailsData>}
 *
 * PlantDetailsData shape:
 * {
 *   userPlant:   UserPlantDoc | null,
 *   masterPlant: PlantDoc     | null,
 *   reminders:   ReminderDoc[],
 *   journals:    JournalDoc[],
 * }
 */
export async function loadPlantDetailsData(userPlantId, userId) {
  const userPlant = await fetchUserPlantById(userPlantId);
  if (!userPlant) return { userPlant: null, masterPlant: null, reminders: [], journals: [] };

  const [masterPlant, reminders, journals] = await Promise.all([
    fetchMasterPlant(userPlant.plantId),
    fetchPlantReminders(userId, userPlantId),
    fetchPlantJournals(userId, userPlantId),
  ]);

  return { userPlant, masterPlant, reminders, journals };
}