// GardenService.js
// Data layer for the Garden Dashboard screen.
// Follows the same pattern as DashboardService.js
// ============================================================

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';


// ─────────────────────────────────────────────────────────────
// 1. USER PLANTS
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all userPlants for a user, ordered by newest first.
 *
 * @param {string} userId
 * @returns {Promise<UserPlantDoc[]>}
 *
 * UserPlantDoc shape:
 * { id, userId, plantId, nickname, plantedDate, currentStage,
 *   healthStatus, imageUrl, latitude, longitude, createdAt }
 */
export async function fetchUserPlants(userId) {
  const q = query(
    collection(db, 'userPlants'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch a single userPlant by ID.
 *
 * @param {string} userPlantId
 * @returns {Promise<UserPlantDoc|null>}
 */
export async function fetchUserPlantById(userPlantId) {
  const snap = await getDoc(doc(db, 'userPlants', userPlantId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Fetch the most recently added userPlant (used as the "featured" plant).
 *
 * @param {string} userId
 * @returns {Promise<UserPlantDoc|null>}
 */
export async function fetchFeaturedPlant(userId) {
  const q = query(
    collection(db, 'userPlants'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

/**
 * Update the health status of a userPlant.
 * healthStatus: 'HEALTHY' | 'WARNING' | 'SICK'
 *
 * @param {string} userPlantId
 * @param {string} healthStatus
 * @returns {Promise<void>}
 */
export async function updatePlantHealth(userPlantId, healthStatus) {
  await updateDoc(doc(db, 'userPlants', userPlantId), { healthStatus });
}


// ─────────────────────────────────────────────────────────────
// 2. REMINDERS  (used as Care Schedule)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch today's reminders for a user.
 *
 * @param {string} userId
 * @returns {Promise<ReminderDoc[]>}
 *
 * ReminderDoc shape:
 * { id, userId, userPlantId, title, type, reminderDate (Timestamp), status, createdAt }
 */
export async function fetchTodayReminders(userId) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, 'reminders'),
    where('userId',       '==', userId),
    where('reminderDate', '>=', Timestamp.fromDate(start)),
    where('reminderDate', '<=', Timestamp.fromDate(end)),
    orderBy('reminderDate', 'asc'),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Mark a reminder as COMPLETED.
 *
 * @param {string} reminderId
 * @returns {Promise<void>}
 */
export async function completeReminder(reminderId) {
  await updateDoc(doc(db, 'reminders', reminderId), { status: 'COMPLETED' });
}

/**
 * Mark a reminder back to PENDING (undo complete).
 *
 * @param {string} reminderId
 * @returns {Promise<void>}
 */
export async function uncompleteReminder(reminderId) {
  await updateDoc(doc(db, 'reminders', reminderId), { status: 'PENDING' });
}

/**
 * Create a new reminder.
 *
 * @param {object} data  – { userId, userPlantId, title, type, reminderDate (JS Date) }
 * @returns {Promise<string>}  – new reminderId
 */
export async function createReminder(data) {
  const ref = await addDoc(collection(db, 'reminders'), {
    ...data,
    reminderDate: Timestamp.fromDate(data.reminderDate),
    status: 'PENDING',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}


// ─────────────────────────────────────────────────────────────
// 3. HEALTH STATS  (derived from userPlants)
// ─────────────────────────────────────────────────────────────

/**
 * Compute garden-wide health analytics from a list of userPlants.
 * Pure function — no Firestore call needed.
 *
 * @param {UserPlantDoc[]} userPlants
 * @returns {GardenStats}
 *
 * GardenStats shape:
 * {
 *   totalPlants:    number,
 *   healthyCount:   number,
 *   warningCount:   number,
 *   sickCount:      number,
 *   healthScorePct: number,   // 0-100
 * }
 */
export function computeGardenStats(userPlants) {
  const total   = userPlants.length;
  const healthy = userPlants.filter(p => p.healthStatus === 'HEALTHY').length;
  const warning = userPlants.filter(p => p.healthStatus === 'WARNING').length;
  const sick    = userPlants.filter(p => p.healthStatus === 'SICK').length;

  const score = total === 0 ? 100 : Math.round((healthy / total) * 100);

  return {
    totalPlants:    total,
    healthyCount:   healthy,
    warningCount:   warning,
    sickCount:      sick,
    healthScorePct: score,
  };
}


// ─────────────────────────────────────────────────────────────
// 4. PLANT CATALOG  (master plants collection)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all plants from the master catalog.
 *
 * @returns {Promise<PlantDoc[]>}
 *
 * PlantDoc shape:
 * { id, name, scientificName, description, imageUrl, sunlight,
 *   wateringFrequency, fertilizerFrequency, growthDays,
 *   pests, diseases, createdAt }
 */
export async function fetchPlantCatalog() {
  const snap = await getDocs(collection(db, 'plants'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch a single plant from the catalog.
 *
 * @param {string} plantId
 * @returns {Promise<PlantDoc|null>}
 */
export async function fetchPlantById(plantId) {
  const snap = await getDoc(doc(db, 'plants', plantId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}


// ─────────────────────────────────────────────────────────────
// 5. AGGREGATE  – single call that loads everything the garden
//    dashboard needs
// ─────────────────────────────────────────────────────────────

/**
 * Load all garden dashboard data in parallel.
 *
 * @param {string} userId
 * @returns {Promise<GardenDashboardData>}
 *
 * GardenDashboardData shape:
 * {
 *   userPlants:     UserPlantDoc[],
 *   featuredPlant:  UserPlantDoc|null,
 *   todayReminders: ReminderDoc[],
 *   stats:          GardenStats,
 * }
 */
export async function loadGardenDashboard(userId) {
  const [userPlants, todayReminders] = await Promise.all([
    fetchUserPlants(userId),
    fetchTodayReminders(userId),
  ]);

  const featuredPlant = userPlants[0] ?? null;
  const stats         = computeGardenStats(userPlants);

  return { userPlants, featuredPlant, todayReminders, stats };
}