// ============================================================
// SettingsService.js
// Data layer for the PlantAid Settings & Weather Suite view.
// Reads and writes the users/{uid} Firestore document.
// ============================================================

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../../firebase/firebase';


// ─────────────────────────────────────────────────────────────
// 1. FETCH USER PROFILE
// ─────────────────────────────────────────────────────────────

/**
 * Fetch the full user profile document.
 *
 * @param {string} uid
 * @returns {Promise<UserProfile|null>}
 *
 * UserProfile shape (mirrors Firestore schema):
 * {
 *   uid:       string,
 *   name:      string,
 *   email:     string,
 *   photoURL:  string,
 *   phone:     string,
 *   location:  string,
 *   createdAt: Timestamp,
 *   settings: {
 *     wateringReminders:  boolean,
 *     weatherAlerts:      boolean,
 *     weeklyDigest:       boolean,
 *     diseaseAlerts:      boolean,
 *     communityUpdates:   boolean,
 *     pushNotifications:  boolean,
 *   }
 * }
 */
export async function fetchUserProfile(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
}


// ─────────────────────────────────────────────────────────────
// 2. UPDATE PROFILE FIELDS
// ─────────────────────────────────────────────────────────────

/**
 * Update editable profile fields on the user document.
 * Only the fields passed are written (partial update).
 *
 * @param {string} uid
 * @param {{ name?: string, email?: string, phone?: string, location?: string }} updates
 * @returns {Promise<void>}
 */
export async function updateUserProfile(uid, updates) {
  if (!uid) throw new Error('No user ID provided.');
  const allowed = ['name', 'email', 'phone', 'location', 'photoURL'];
  const safe = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k)),
  );
  await updateDoc(doc(db, 'users', uid), safe);
}


// ─────────────────────────────────────────────────────────────
// 3. UPDATE NOTIFICATION SETTINGS
// ─────────────────────────────────────────────────────────────

/**
 * Update the nested `settings` map on the user document.
 * Uses Firestore dot-notation so other fields are untouched.
 *
 * @param {string} uid
 * @param {Partial<UserProfile['settings']>} settings
 * @returns {Promise<void>}
 */
export async function updateUserSettings(uid, settings) {
  if (!uid) throw new Error('No user ID provided.');

  // Build dot-notation keys: { 'settings.wateringReminders': true, … }
  const dotted = Object.fromEntries(
    Object.entries(settings).map(([k, v]) => [`settings.${k}`, v]),
  );

  await updateDoc(doc(db, 'users', uid), dotted);
}


// ─────────────────────────────────────────────────────────────
// 4. SIGN OUT
// ─────────────────────────────────────────────────────────────

/**
 * Sign the current user out of Firebase Auth.
 *
 * @returns {Promise<void>}
 */
export async function signOutUser() {
  await signOut(auth);
}


// ─────────────────────────────────────────────────────────────
// 5. AGGREGATE – single call that loads everything the screen needs
// ─────────────────────────────────────────────────────────────

/**
 * Load all data for the Settings screen.
 * Call this once on mount with the authenticated uid.
 *
 * @param {string} uid
 * @returns {Promise<SettingsScreenData>}
 *
 * SettingsScreenData shape:
 * {
 *   profile:  UserProfile | null,
 * }
 */
export async function loadSettingsData(uid) {
  const profile = await fetchUserProfile(uid);
  return { profile };
}


// ─────────────────────────────────────────────────────────────
// 6. DEFAULT SETTINGS  (used when user doc has no settings yet)
// ─────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS = {
  wateringReminders: true,
  weatherAlerts:     true,
  weeklyDigest:      false,
  diseaseAlerts:     true,
  communityUpdates:  false,
  pushNotifications: true,
};