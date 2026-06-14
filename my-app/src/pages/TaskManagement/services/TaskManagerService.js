// ============================================================
// TaskManagerService.js
// Data layer for the PlantAid Task Manager screen.
// Follows the same pattern as DashboardService.js
// ============================================================

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';

// ─────────────────────────────────────────────────────────────
// 1. FETCH REMINDERS  (tasks = reminders in your schema)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch ALL reminders/tasks for a user ordered by reminderDate asc.
 *
 * @param {string} userId
 * @returns {Promise<ReminderDoc[]>}
 *
 * ReminderDoc shape (matches Firestore schema):
 * {
 *   id:           string,
 *   userId:       string,
 *   userPlantId:  string,
 *   title:        string,
 *   type:         'WATER' | 'FERTILIZE' | 'REPOT' | 'CUSTOM',
 *   reminderDate: Timestamp,
 *   completed:    boolean,
 *   createdAt:    Timestamp,
 * }
 */
export async function fetchTasks(userId) {
  const q = query(
    collection(db, 'reminders'),
    where('userId', '==', userId),
    orderBy('reminderDate', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch only pending (not completed) tasks.
 *
 * @param {string} userId
 * @returns {Promise<ReminderDoc[]>}
 */
export async function fetchPendingTasks(userId) {
  const q = query(
    collection(db, 'reminders'),
    where('userId',    '==', userId),
    where('completed', '==', false),
    orderBy('reminderDate', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}


// ─────────────────────────────────────────────────────────────
// 2. CREATE TASK
// ─────────────────────────────────────────────────────────────

/**
 * Create a new task/reminder in Firestore.
 *
 * @param {string} userId
 * @param {object} data
 * @param {string}  data.title
 * @param {string}  data.type         – WATER | FERTILIZE | REPOT | CUSTOM
 * @param {Date}    data.reminderDate – JS Date object
 * @param {string}  [data.userPlantId]
 * @param {string}  [data.notes]      – stored in title as suffix or separate field
 * @returns {Promise<ReminderDoc>}    – the newly created task with id
 */
export async function createTask(userId, {
  title,
  type,
  reminderDate,
  userPlantId = '',
  notes       = '',
}) {
  const fullTitle = notes.trim()
    ? `${title.trim()} — ${notes.trim()}`
    : title.trim();

  const docRef = await addDoc(collection(db, 'reminders'), {
    userId,
    userPlantId,
    title:        fullTitle,
    type,
    reminderDate: Timestamp.fromDate(reminderDate),
    completed:    false,
    createdAt:    serverTimestamp(),
  });

  return {
    id:           docRef.id,
    userId,
    userPlantId,
    title:        fullTitle,
    type,
    reminderDate: Timestamp.fromDate(reminderDate),
    completed:    false,
    createdAt:    Timestamp.now(),
  };
}


// ─────────────────────────────────────────────────────────────
// 3. COMPLETE / UNCOMPLETE TASK
// ─────────────────────────────────────────────────────────────

/**
 * Mark a task as completed.
 *
 * @param {string} taskId
 * @returns {Promise<void>}
 */
export async function completeTask(taskId) {
  await updateDoc(doc(db, 'reminders', taskId), { completed: true });
}

/**
 * Mark a task back to pending (undo complete).
 *
 * @param {string} taskId
 * @returns {Promise<void>}
 */
export async function uncompleteTask(taskId) {
  await updateDoc(doc(db, 'reminders', taskId), { completed: false });
}


// ─────────────────────────────────────────────────────────────
// 4. DELETE TASK
// ─────────────────────────────────────────────────────────────

/**
 * Delete a task permanently.
 *
 * @param {string} taskId
 * @returns {Promise<void>}
 */
export async function deleteTask(taskId) {
  await deleteDoc(doc(db, 'reminders', taskId));
}


// ─────────────────────────────────────────────────────────────
// 5. USER PLANTS  (for the plant selector dropdown)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all userPlants for a user — populates the plant dropdown.
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
// 6. AGGREGATE — single call loads everything the page needs
// ─────────────────────────────────────────────────────────────

/**
 * Load tasks + userPlants in parallel.
 *
 * @param {string} userId
 * @returns {Promise<{ tasks: ReminderDoc[], userPlants: UserPlantDoc[] }>}
 */
export async function loadTaskManagerPage(userId) {
  const [tasks, userPlants] = await Promise.all([
    fetchTasks(userId),
    fetchUserPlantsForSelector(userId),
  ]);
  return { tasks, userPlants };
}


// ─────────────────────────────────────────────────────────────
// 7. HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Map UI category id → Firestore reminder type.
 * The modal uses 'water' | 'fertilize' | 'prune' | 'repot'.
 * Firestore uses 'WATER' | 'FERTILIZE' | 'REPOT' | 'CUSTOM'.
 *
 * @param {string} categoryId  – from the modal category picker
 * @returns {'WATER'|'FERTILIZE'|'REPOT'|'CUSTOM'}
 */
export function categoryToType(categoryId) {
  const map = {
    water:     'WATER',
    fertilize: 'FERTILIZE',
    repot:     'REPOT',
    prune:     'CUSTOM',   // no PRUNE in schema → CUSTOM
  };
  return map[categoryId] ?? 'CUSTOM';
}

/**
 * Map Firestore type back to UI category id.
 *
 * @param {string} type
 * @returns {string}
 */
export function typeToCategory(type) {
  const map = {
    WATER:     'water',
    FERTILIZE: 'fertilize',
    REPOT:     'repot',
    CUSTOM:    'prune',
  };
  return map[type] ?? 'prune';
}

/**
 * Format a Firestore Timestamp for display.
 * e.g. "Today, 8:00 AM" | "Tomorrow, 3:00 PM" | "Friday, 2:30 PM"
 *
 * @param {Timestamp|Date} ts
 * @returns {string}
 */
export function formatTaskTime(ts) {
  if (!ts) return '';
  const date  = ts?.toDate ? ts.toDate() : new Date(ts);
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d     = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff  = Math.round((d - today) / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (diff === 0)            return `Today, ${timeStr}`;
  if (diff === 1)            return `Tomorrow, ${timeStr}`;
  if (diff > 1 && diff < 7) return `${date.toLocaleDateString('en-US', { weekday: 'long' })}, ${timeStr}`;
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`;
}

/**
 * Compute quick stats from a tasks array.
 *
 * @param {ReminderDoc[]} tasks
 * @returns {{ total: number, pending: number, completed: number, overdue: number }}
 */
export function computeTaskStats(tasks) {
  const now       = new Date();
  const pending   = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) =>  t.completed);
  const overdue   = pending.filter((t) => {
    const d = t.reminderDate?.toDate ? t.reminderDate.toDate() : new Date(t.reminderDate);
    return d < now;
  });

  return {
    total:     tasks.length,
    pending:   pending.length,
    completed: completed.length,
    overdue:   overdue.length,
  };
}