// ============================================================
// UpcomingService.js
// Centralised data layer for the Upcoming / Reminders screen.
// Mirrors the pattern used in GrowthJourneyService – pure async
// functions the UI can call directly or wrap in useEffect /
// custom hooks.
// ============================================================

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';


// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

/**
 * All valid reminder types (matches Firestore schema).
 */
export const REMINDER_TYPES = ['WATER', 'FERTILIZE', 'REPOT', 'CUSTOM'];

/**
 * Human-readable labels for each reminder type.
 */
export const REMINDER_TYPE_LABELS = {
  WATER:     'Water',
  FERTILIZE: 'Fertilize',
  REPOT:     'Repot',
  CUSTOM:    'Custom',
};

/**
 * Icon name hint per type (used by the UI layer).
 */
export const REMINDER_TYPE_ICONS = {
  WATER:     'water',
  FERTILIZE: 'fertilize',
  REPOT:     'repot',
  CUSTOM:    'custom',
};


// ─────────────────────────────────────────────────────────────
// 1. REMINDERS  (read)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all reminders for a given user, ordered by reminderDate asc.
 *
 * @param {string} userId
 * @returns {Promise<ReminderDoc[]>}
 *
 * ReminderDoc shape (matches Firestore schema):
 * {
 *   id:           string,    // Firestore document ID
 *   userId:       string,
 *   userPlantId:  string,    // reference to userPlants collection
 *   title:        string,
 *   type:         string,    // one of REMINDER_TYPES
 *   reminderDate: Timestamp,
 *   completed:    boolean,
 *   createdAt:    Timestamp,
 * }
 */
export async function fetchReminders(userId) {
  if (!userId) return [];

  const q = query(
    collection(db, 'reminders'),
    where('userId', '==', userId),
    orderBy('reminderDate', 'asc'),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch only upcoming (not completed) reminders for a user,
 * from now onward, limited to the next 48 hours if desired.
 *
 * @param {string} userId
 * @param {boolean} [upcomingOnly=false]  – if true, filters to future reminders only
 * @returns {Promise<ReminderDoc[]>}
 */
export async function fetchUpcomingReminders(userId, upcomingOnly = false) {
  if (!userId) return [];

  const constraints = [
    where('userId', '==', userId),
    where('completed', '==', false),
    orderBy('reminderDate', 'asc'),
  ];

  if (upcomingOnly) {
    constraints.splice(2, 0, where('reminderDate', '>=', Timestamp.now()));
  }

  const q = query(collection(db, 'reminders'), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch a single reminder by its Firestore ID.
 *
 * @param {string} reminderId
 * @returns {Promise<ReminderDoc|null>}
 */
export async function fetchReminderById(reminderId) {
  const snap = await getDoc(doc(db, 'reminders', reminderId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Fetch the userPlant document linked to a reminder.
 *
 * @param {string} userPlantId
 * @returns {Promise<UserPlantDoc|null>}
 */
export async function fetchUserPlantForReminder(userPlantId) {
  if (!userPlantId) return null;
  const snap = await getDoc(doc(db, 'userPlants', userPlantId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}


// ─────────────────────────────────────────────────────────────
// 2. REMINDERS  (write)
// ─────────────────────────────────────────────────────────────

/**
 * Create a new reminder document in Firestore.
 *
 * @param {{
 *   userId:       string,
 *   userPlantId:  string,
 *   title:        string,
 *   type:         string,
 *   reminderDate: Date | Timestamp,
 * }} data
 * @returns {Promise<string>}  – new reminder doc ID
 */
export async function createReminder(data) {
  const ref = await addDoc(collection(db, 'reminders'), {
    userId:       data.userId,
    userPlantId:  data.userPlantId,
    title:        data.title,
    type:         data.type,
    reminderDate: data.reminderDate instanceof Date
      ? Timestamp.fromDate(data.reminderDate)
      : data.reminderDate,
    completed: false,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

/**
 * Update an existing reminder document.
 *
 * @param {string} reminderId
 * @param {Partial<ReminderDoc>} updates
 * @returns {Promise<void>}
 */
export async function updateReminder(reminderId, updates) {
  const payload = { ...updates };
  if (payload.reminderDate instanceof Date) {
    payload.reminderDate = Timestamp.fromDate(payload.reminderDate);
  }
  await updateDoc(doc(db, 'reminders', reminderId), payload);
}

/**
 * Mark a reminder as completed.
 *
 * @param {string} reminderId
 * @returns {Promise<void>}
 */
export async function markReminderComplete(reminderId) {
  await updateDoc(doc(db, 'reminders', reminderId), { completed: true });
}

/**
 * Mark a reminder as not completed (undo).
 *
 * @param {string} reminderId
 * @returns {Promise<void>}
 */
export async function markReminderIncomplete(reminderId) {
  await updateDoc(doc(db, 'reminders', reminderId), { completed: false });
}

/**
 * Delete a reminder document permanently.
 *
 * @param {string} reminderId
 * @returns {Promise<void>}
 */
export async function deleteReminder(reminderId) {
  await deleteDoc(doc(db, 'reminders', reminderId));
}


// ─────────────────────────────────────────────────────────────
// 3. AGGREGATE – single call for the Upcoming screen
// ─────────────────────────────────────────────────────────────

/**
 * Load all data needed for the Upcoming screen in one call.
 * Returns reminders split into upcoming (future/today) and past.
 *
 * @param {string} userId
 * @returns {Promise<UpcomingScreenData>}
 *
 * UpcomingScreenData shape:
 * {
 *   upcoming:  ReminderDoc[],   – not completed, reminderDate >= now
 *   overdue:   ReminderDoc[],   – not completed, reminderDate < now
 *   completed: ReminderDoc[],   – completed === true
 * }
 */
export async function loadUpcomingData(userId) {
  const all = await fetchReminders(userId);
  const now = new Date();

  const upcoming  = [];
  const overdue   = [];
  const completed = [];

  for (const r of all) {
    if (r.completed) {
      completed.push(r);
    } else {
      const rd = r.reminderDate?.toDate ? r.reminderDate.toDate() : new Date(r.reminderDate);
      if (rd < now) {
        overdue.push(r);
      } else {
        upcoming.push(r);
      }
    }
  }

  return { upcoming, overdue, completed };
}

/**
 * Load all userPlants for a given user (for the "add reminder" form dropdown).
 *
 * @param {string} userId
 * @returns {Promise<UserPlantDoc[]>}
 */
export async function fetchUserPlantsForForm(userId) {
  if (!userId) return [];

  const q = query(
    collection(db, 'userPlants'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}


// ─────────────────────────────────────────────────────────────
// 4. DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Format a Firestore Timestamp (or JS Date) to a readable string.
 *
 * @param {Timestamp|Date|null} ts
 * @returns {string}
 */
export function formatReminderDate(ts) {
  if (!ts) return '—';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
    year:    'numeric',
  });
}

/**
 * Format a Timestamp to a time string (e.g. "8:00 AM").
 *
 * @param {Timestamp|Date|null} ts
 * @returns {string}
 */
export function formatReminderTime(ts) {
  if (!ts) return '—';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleTimeString('en-US', {
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Return a human-friendly relative label for a reminder date.
 * e.g. "Today", "Tomorrow", "In 3 days", "Yesterday", "Overdue"
 *
 * @param {Timestamp|Date|null} ts
 * @returns {string}
 */
export function relativeReminderLabel(ts) {
  if (!ts) return '—';

  const date    = ts?.toDate ? ts.toDate() : new Date(ts);
  const now     = new Date();
  const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dateMs  = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDay = Math.round((dateMs - todayMs) / (1000 * 60 * 60 * 24));

  if (diffDay === 0)  return 'Today';
  if (diffDay === 1)  return 'Tomorrow';
  if (diffDay === -1) return 'Yesterday';
  if (diffDay > 1)    return `In ${diffDay} days`;
  return `${Math.abs(diffDay)} days ago`;
}

/**
 * Check if a reminder is within the next N hours.
 *
 * @param {Timestamp|Date|null} ts
 * @param {number} hours
 * @returns {boolean}
 */
export function isWithinHours(ts, hours = 48) {
  if (!ts) return false;
  const date  = ts?.toDate ? ts.toDate() : new Date(ts);
  const now   = new Date();
  const limit = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return date >= now && date <= limit;
}

/**
 * Convert a JS Date to a Firestore Timestamp.
 *
 * @param {Date} date
 * @returns {Timestamp}
 */
export function toFirestoreTimestamp(date) {
  return Timestamp.fromDate(date);
}

/**
 * Convert a datetime-local input string (e.g. "2024-06-15T08:00")
 * to a Firestore Timestamp.
 *
 * @param {string} datetimeLocalStr
 * @returns {Timestamp}
 */
export function datetimeLocalToTimestamp(datetimeLocalStr) {
  return Timestamp.fromDate(new Date(datetimeLocalStr));
}

/**
 * Convert a Firestore Timestamp to a datetime-local input string.
 *
 * @param {Timestamp|Date|null} ts
 * @returns {string}
 */
export function timestampToDatetimeLocal(ts) {
  if (!ts) return '';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  const pad  = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}