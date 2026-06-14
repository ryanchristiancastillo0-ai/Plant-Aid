// ============================================================
// GrowthJourneyService.js
// Centralised data layer for the Growth Journey screen.
// Mirrors the pattern used in PlantDirectoryService – pure async
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
 * Ordered list of all growth stages.
 * The index is used as the stage "level" (0-based).
 */
export const GROWTH_STAGES = [
  {
    key:         'Early Growth',
    title:       'Early Growth',
    description: 'Germination successful. Initial cotyledon development and root anchoring phase.',
    icon:        'sprout',
  },
  {
    key:         'Vegetative Growth',
    title:       'Vegetative Growth',
    description: 'Rapid biomass accumulation. Focus on leaf expansion and structural stem reinforcement.',
    icon:        'leaf',
  },
  {
    key:         'Flowering',
    title:       'Flowering',
    description: 'Transition to reproductive state. Buds forming at axillary nodes under specialised light cycles.',
    icon:        'flower',
  },
  {
    key:         'Fruit Formation',
    title:       'Fruit Formation',
    description: 'Post-pollination swelling. Nutrient redirection toward botanical ovaries and seed development.',
    icon:        'seedling',
  },
  {
    key:         'Mature Fruiting',
    title:       'Mature Fruiting',
    description: 'Peak ripeness. Reaching optimal terpene and sugar profiles for final harvesting.',
    icon:        'harvest',
  },
];

/**
 * Get the numeric index (0-based) for a given stage key.
 * Returns 0 if the key is not found.
 *
 * @param {string} stageKey
 * @returns {number}
 */
export function stageIndexOf(stageKey) {
  const idx = GROWTH_STAGES.findIndex((s) => s.key === stageKey);
  return idx === -1 ? 0 : idx;
}

/**
 * Get the GROWTH_STAGES entry for a given stage key.
 *
 * @param {string} stageKey
 * @returns {object}
 */
export function stageByKey(stageKey) {
  return GROWTH_STAGES.find((s) => s.key === stageKey) ?? GROWTH_STAGES[0];
}


// ─────────────────────────────────────────────────────────────
// 1. USER PLANTS  (read – for the journey display)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all userPlants for a given user, ordered by creation date desc.
 *
 * @param {string} userId
 * @returns {Promise<UserPlantDoc[]>}
 *
 * UserPlantDoc shape (matches Firestore schema):
 * {
 *   id:           string,   // Firestore document ID
 *   userId:       string,
 *   plantId:      string,   // reference to master plants collection
 *   nickname:     string,
 *   plantedDate:  Timestamp,
 *   currentStage: string,   // one of GROWTH_STAGES[*].key
 *   imageUrl:     string,
 *   createdAt:    Timestamp,
 * }
 */
export async function fetchUserPlants(userId) {
  if (!userId) return [];

  const q = query(
    collection(db, 'userPlants'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch a single userPlant document by its Firestore ID.
 *
 * @param {string} userPlantId
 * @returns {Promise<UserPlantDoc|null>}
 */
export async function fetchUserPlantById(userPlantId) {
  const snap = await getDoc(doc(db, 'userPlants', userPlantId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Fetch the matching master plant for a userPlant.
 *
 * @param {string} plantId  – userPlant.plantId
 * @returns {Promise<PlantDoc|null>}
 */
export async function fetchMasterPlant(plantId) {
  if (!plantId) return null;
  const snap = await getDoc(doc(db, 'plants', plantId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}


// ─────────────────────────────────────────────────────────────
// 2. STAGE LOGS  (audit trail of stage transitions)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all stage transition logs for a given userPlant.
 *
 * @param {string} userPlantId
 * @returns {Promise<StageLogDoc[]>}
 *
 * StageLogDoc shape:
 * {
 *   id:          string,
 *   userPlantId: string,
 *   stage:       string,   // one of GROWTH_STAGES[*].key
 *   note:        string,   // optional free-text note
 *   loggedAt:    Timestamp,
 * }
 */
export async function fetchStageLogs(userPlantId) {
  if (!userPlantId) return [];

  const q = query(
    collection(db, 'stageLogs'),
    where('userPlantId', '==', userPlantId),
    orderBy('loggedAt', 'asc'),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Write a new stage log entry.
 *
 * @param {string} userPlantId
 * @param {string} stage
 * @param {string} [note]
 * @returns {Promise<string>}  – new log doc ID
 */
export async function addStageLog(userPlantId, stage, note = '') {
  const ref = await addDoc(collection(db, 'stageLogs'), {
    userPlantId,
    stage,
    note,
    loggedAt: Timestamp.now(),
  });
  return ref.id;
}

/**
 * Delete a stage log entry.
 *
 * @param {string} stageLogId
 * @returns {Promise<void>}
 */
export async function deleteStageLog(stageLogId) {
  await deleteDoc(doc(db, 'stageLogs', stageLogId));
}


// ─────────────────────────────────────────────────────────────
// 3. STAGE PROGRESSION  (write – advance / retreat stage)
// ─────────────────────────────────────────────────────────────

/**
 * Update the currentStage field on a userPlant document.
 * Also writes a stageLog entry for the audit trail.
 *
 * @param {string} userPlantId
 * @param {string} newStageKey   – one of GROWTH_STAGES[*].key
 * @param {string} [note]
 * @returns {Promise<void>}
 */
export async function updatePlantStage(userPlantId, newStageKey, note = '') {
  await Promise.all([
    updateDoc(doc(db, 'userPlants', userPlantId), {
      currentStage: newStageKey,
    }),
    addStageLog(userPlantId, newStageKey, note),
  ]);
}

/**
 * Advance a plant to the next stage (if not already at the last one).
 *
 * @param {string} userPlantId
 * @param {string} currentStageKey
 * @returns {Promise<string|null>}  – new stage key, or null if already at last stage
 */
export async function advancePlantStage(userPlantId, currentStageKey) {
  const currentIdx = stageIndexOf(currentStageKey);
  const nextIdx    = currentIdx + 1;

  if (nextIdx >= GROWTH_STAGES.length) return null;

  const nextKey = GROWTH_STAGES[nextIdx].key;
  await updatePlantStage(userPlantId, nextKey);
  return nextKey;
}

/**
 * Retreat a plant to a previous stage (if not already at the first one).
 *
 * @param {string} userPlantId
 * @param {string} currentStageKey
 * @returns {Promise<string|null>}  – new stage key, or null if already at first stage
 */
export async function retreatPlantStage(userPlantId, currentStageKey) {
  const currentIdx = stageIndexOf(currentStageKey);
  if (currentIdx === 0) return null;

  const prevKey = GROWTH_STAGES[currentIdx - 1].key;
  await updatePlantStage(userPlantId, prevKey);
  return prevKey;
}

/**
 * Jump directly to a specific stage by key.
 * Writes a stageLog entry for the transition.
 *
 * @param {string} userPlantId
 * @param {string} targetStageKey
 * @param {string} [note]
 * @returns {Promise<void>}
 */
export async function jumpToStage(userPlantId, targetStageKey, note = '') {
  await updatePlantStage(userPlantId, targetStageKey, note);
}


// ─────────────────────────────────────────────────────────────
// 4. AGGREGATE – single call that loads everything the journey needs
// ─────────────────────────────────────────────────────────────

/**
 * Load all journey data for a given user in parallel.
 * Call this once on mount.
 *
 * @param {string} userId
 * @returns {Promise<JourneyData>}
 *
 * JourneyData shape:
 * {
 *   userPlants:    UserPlantDoc[],
 * }
 */
export async function loadJourneyData(userId) {
  const userPlants = await fetchUserPlants(userId);
  return { userPlants };
}

/**
 * Load the full detail for a single plant's journey, including
 * the master plant reference and the full stage log history.
 *
 * @param {string} userPlantId
 * @returns {Promise<PlantJourneyDetail>}
 *
 * PlantJourneyDetail shape:
 * {
 *   userPlant:   UserPlantDoc,
 *   masterPlant: PlantDoc | null,
 *   stageLogs:   StageLogDoc[],
 * }
 */
export async function loadPlantJourneyDetail(userPlantId) {
  const userPlant = await fetchUserPlantById(userPlantId);
  if (!userPlant) throw new Error(`userPlant ${userPlantId} not found`);

  const [masterPlant, stageLogs] = await Promise.all([
    fetchMasterPlant(userPlant.plantId),
    fetchStageLogs(userPlantId),
  ]);

  return { userPlant, masterPlant, stageLogs };
}


// ─────────────────────────────────────────────────────────────
// 5. DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Format a Firestore Timestamp (or JS Date) to a readable string.
 *
 * @param {Timestamp|Date|null} ts
 * @returns {string}
 */
export function formatTimestamp(ts) {
  if (!ts) return '—';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

/**
 * Calculate how many days since the plant was first planted.
 *
 * @param {Timestamp|Date|null} plantedDate
 * @returns {number}
 */
export function daysSincePlanted(plantedDate) {
  if (!plantedDate) return 0;
  const planted = plantedDate?.toDate ? plantedDate.toDate() : new Date(plantedDate);
  const now     = new Date();
  const diffMs  = now - planted;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Get the health status label based on how recently the stage was updated
 * relative to the plant's expected growthDays from the master catalog.
 *
 * @param {number} daysSince     – days since planted
 * @param {number} growthDays    – total expected growth days from master plant
 * @param {number} currentStageIdx – 0-based index of current stage
 * @returns {'Optimized Health' | 'On Track' | 'Needs Attention'}
 */
export function healthStatus(daysSince, growthDays, currentStageIdx) {
  if (!growthDays || growthDays === 0) return 'On Track';

  // Expected stage by now
  const expectedIdx = Math.floor((daysSince / growthDays) * (GROWTH_STAGES.length - 1));
  const diff = currentStageIdx - expectedIdx;

  if (diff >= 0)    return 'Optimized Health';
  if (diff === -1)  return 'On Track';
  return 'Needs Attention';
}