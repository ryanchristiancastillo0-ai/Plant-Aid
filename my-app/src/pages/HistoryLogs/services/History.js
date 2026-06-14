// ============================================================
// ScanHistoryService.js
// Data layer for the Scanning History Logs screen.
// Reads from the same `identificationHistory` collection that
// DiagnosticScanService writes to — no extra Firestore schema needed.
// ============================================================

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';


// ─────────────────────────────────────────────────────────────
// 1. FETCH HISTORY  (paginated)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch a page of scan history records for a user, newest first.
 *
 * @param {string}                userId
 * @param {number}                [pageSize=20]
 * @param {QueryDocumentSnapshot} [lastDoc=null]  – pass for next-page cursor
 * @returns {Promise<{ records: ScanRecord[], lastDoc: QueryDocumentSnapshot|null }>}
 *
 * ScanRecord shape (mirrors DiagnosticScanService.saveScanResult output):
 * {
 *   id:                 string,   // Firestore document ID
 *   userId:             string,
 *   commonName:         string,
 *   scientificName:     string,
 *   confidence:         number,   // 0-100 integer
 *   isPlant:            boolean,
 *   isPlantScore:       number,
 *   isHealthy:          boolean,
 *   healthScore:        number,
 *   detectedDisease:    string,
 *   diseaseProbability: number,
 *   diseaseDescription: string,
 *   scannedAt:          Timestamp,
 * }
 */
export async function fetchScanHistory(userId, pageSize = 20, lastDoc = null) {
  let q = query(
    collection(db, 'identificationHistory'),
    where('userId', '==', userId),
    orderBy('scannedAt', 'desc'),
    limit(pageSize),
  );

  if (lastDoc) {
    q = query(
      collection(db, 'identificationHistory'),
      where('userId', '==', userId),
      orderBy('scannedAt', 'desc'),
      startAfter(lastDoc),
      limit(pageSize),
    );
  }

  const snap = await getDocs(q);
  const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const newLastDoc = snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1] : null;

  return { records, lastDoc: newLastDoc };
}


// ─────────────────────────────────────────────────────────────
// 2. FETCH SINGLE RECORD  (for detail view)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch a single scan record by its Firestore document ID.
 *
 * @param {string} scanId
 * @returns {Promise<ScanRecord|null>}
 */
export async function fetchScanById(scanId) {
  const snap = await getDoc(doc(db, 'identificationHistory', scanId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}


// ─────────────────────────────────────────────────────────────
// 3. DELETE RECORD
// ─────────────────────────────────────────────────────────────

/**
 * Permanently delete a scan record from the history.
 *
 * @param {string} scanId
 * @returns {Promise<void>}
 */
export async function deleteScanRecord(scanId) {
  await deleteDoc(doc(db, 'identificationHistory', scanId));
}


// ─────────────────────────────────────────────────────────────
// 4. AGGREGATE – load everything the screen needs
// ─────────────────────────────────────────────────────────────

/**
 * Load the first page of history plus summary stats in parallel.
 * Call this once on mount.
 *
 * @param {string} userId
 * @param {number} [pageSize=20]
 * @returns {Promise<HistoryScreenData>}
 *
 * HistoryScreenData shape:
 * {
 *   records:    ScanRecord[],
 *   lastDoc:    QueryDocumentSnapshot | null,   // pagination cursor
 *   stats: {
 *     total:    number,   // total records loaded (first page)
 *     healthy:  number,   // isHealthy === true
 *     diseased: number,   // detectedDisease non-empty
 *     unknown:  number,   // isPlant but no disease and not healthy
 *   }
 * }
 */
export async function loadHistoryScreenData(userId, pageSize = 20) {
  const { records, lastDoc } = await fetchScanHistory(userId, pageSize);

  const stats = records.reduce(
    (acc, r) => {
      acc.total++;
      if (r.isHealthy)                      acc.healthy++;
      else if (r.detectedDisease?.trim())   acc.diseased++;
      else                                  acc.unknown++;
      return acc;
    },
    { total: 0, healthy: 0, diseased: 0, unknown: 0 },
  );

  return { records, lastDoc, stats };
}


// ─────────────────────────────────────────────────────────────
// 5. DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Derive a status type string from a scan record.
 * Maps directly to the UI badge themes in the frontend.
 *
 * @param {ScanRecord} record
 * @returns {'solved' | 'danger' | 'neutral'}
 */
export function deriveStatusType(record) {
  if (!record.isPlant)                    return 'neutral';
  if (record.detectedDisease?.trim())     return 'danger';
  if (record.isHealthy)                   return 'solved';
  return 'neutral';
}

/**
 * Derive a human-readable status label from a scan record.
 *
 * @param {ScanRecord} record
 * @returns {string}
 */
export function deriveStatusLabel(record) {
  if (!record.isPlant)                    return 'Not a Plant';
  if (record.detectedDisease?.trim())     return 'Disease Detected';
  if (record.isHealthy)                   return 'Healthy';
  return 'Identified';
}

/**
 * Format a Firestore Timestamp to a human-readable relative or absolute string.
 * - Within 24 h → "Today at h:mm AM/PM"
 * - Within 48 h → "Yesterday at h:mm AM/PM"
 * - Older       → "MMM D, YYYY at h:mm AM/PM"
 *
 * @param {Timestamp|Date|null} ts
 * @returns {string}
 */
export function formatScanDate(ts) {
  if (!ts) return '—';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  const now   = new Date();
  const diffH = (now - date) / (1000 * 60 * 60);

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (diffH < 24)  return `Today at ${timeStr}`;
  if (diffH < 48)  return `Yesterday at ${timeStr}`;

  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${dateStr} at ${timeStr}`;
}

/**
 * Format a 0-100 confidence integer as "XX% confidence".
 *
 * @param {number} confidence
 * @returns {string}
 */
export function formatConfidenceLabel(confidence) {
  if (confidence == null) return '—';
  return `${confidence}% confidence`;
}