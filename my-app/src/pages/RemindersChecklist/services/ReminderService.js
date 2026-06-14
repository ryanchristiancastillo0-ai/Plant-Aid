// RemindersService.js
// Centralised data layer for the Reminders Checklist screen.
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
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';


// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

export const REMINDER_TYPES = ['WATER', 'FERTILIZE', 'REPOT', 'CUSTOM'];

export const REMINDER_TYPE_LABELS = {
  WATER:     'Water',
  FERTILIZE: 'Fertilize',
  REPOT:     'Repot',
  CUSTOM:    'Custom',
};


// ─────────────────────────────────────────────────────────────
// 1. READ (one-shot)
// ─────────────────────────────────────────────────────────────

export async function fetchAllReminders(userId) {
  if (!userId) return [];
  const q = query(
    collection(db, 'reminders'),
    where('userId', '==', userId),
    orderBy('reminderDate', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchTodayReminders(userId) {
  if (!userId) return [];

  const now        = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const q = query(
    collection(db, 'reminders'),
    where('userId', '==', userId),
    where('reminderDate', '>=', Timestamp.fromDate(startOfDay)),
    where('reminderDate', '<=', Timestamp.fromDate(endOfDay)),
    orderBy('reminderDate', 'asc'),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchUserPlantForReminder(userPlantId) {
  if (!userPlantId) return null;
  const snap = await getDoc(doc(db, 'userPlants', userPlantId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

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
// 2. REAL-TIME LISTENER  ← NEW
// ─────────────────────────────────────────────────────────────

/**
 * Subscribe to today's reminders in real-time.
 * Fires `onChange(reminders[])` immediately and on every change.
 * Returns an unsubscribe function — call it on component unmount.
 *
 * @param {string}   userId
 * @param {function} onChange  – called with ReminderDoc[]
 * @returns {function}         – unsubscribe
 */
export function subscribeTodayReminders(userId, onChange) {
  if (!userId) {
    onChange([]);
    return () => {};
  }

  const now        = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const q = query(
    collection(db, 'reminders'),
    where('userId', '==', userId),
    where('reminderDate', '>=', Timestamp.fromDate(startOfDay)),
    where('reminderDate', '<=', Timestamp.fromDate(endOfDay)),
    orderBy('reminderDate', 'asc'),
  );

  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}


// ─────────────────────────────────────────────────────────────
// 3. WRITE
// ─────────────────────────────────────────────────────────────

export async function createReminder(data) {
  const ref = await addDoc(collection(db, 'reminders'), {
    userId:      data.userId,
    userPlantId: data.userPlantId,
    title:       data.title,
    type:        data.type,
    reminderDate: data.reminderDate instanceof Date
      ? Timestamp.fromDate(data.reminderDate)
      : data.reminderDate,
    completed: false,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function setReminderCompleted(reminderId, completed) {
  await updateDoc(doc(db, 'reminders', reminderId), { completed });
}

export async function deleteReminder(reminderId) {
  await deleteDoc(doc(db, 'reminders', reminderId));
}


// ─────────────────────────────────────────────────────────────
// 4. AGGREGATE – kept for any other screens that still use it
// ─────────────────────────────────────────────────────────────

export async function loadChecklistData(userId) {
  const [tasks, userPlants] = await Promise.all([
    fetchTodayReminders(userId),
    fetchUserPlantsForForm(userId),
  ]);

  const nicknameMap = {};
  for (const up of userPlants) {
    nicknameMap[up.id] = up.nickname ?? '';
  }

  const enriched = tasks.map((t) => ({
    ...t,
    plantNickname: nicknameMap[t.userPlantId] ?? '',
  }));

  return { tasks: enriched, userPlants };
}


// ─────────────────────────────────────────────────────────────
// 5. DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────

export function formatTime(ts) {
  if (!ts) return '—';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleTimeString('en-US', {
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(ts) {
  if (!ts) return '—';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

export function datetimeLocalToTimestamp(datetimeLocalStr) {
  return Timestamp.fromDate(new Date(datetimeLocalStr));
}

export function timestampToDatetimeLocal(ts) {
  if (!ts) return '';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  const pad  = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}