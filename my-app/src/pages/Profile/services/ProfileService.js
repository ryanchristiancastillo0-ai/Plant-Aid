// ============================================================
// ProfileService.js
// Data layer for the Profile page.
// Handles: user doc, stats aggregation, display name update,
//          and password change. No Firebase Storage used.
// ============================================================

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getCountFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { db, auth } from '../../../firebase/firebase';


// ─────────────────────────────────────────────────────────────
// 1. FETCH USER PROFILE
// ─────────────────────────────────────────────────────────────
export async function fetchUserProfile(userId) {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}


// ─────────────────────────────────────────────────────────────
// 2. FETCH USER STATS
// ─────────────────────────────────────────────────────────────
export async function fetchUserStats(userId) {
  const makeCount = async (collectionName) => {
    const q    = query(collection(db, collectionName), where('userId', '==', userId));
    const snap = await getCountFromServer(q);
    return snap.data().count;
  };

  const [plants, journals, reminders, scans] = await Promise.all([
    makeCount('userPlants'),
    makeCount('journals'),
    makeCount('reminders'),
    makeCount('identificationHistory'),
  ]);

  return { plants, journals, reminders, scans };
}


// ─────────────────────────────────────────────────────────────
// 3. UPDATE DISPLAY NAME
// ─────────────────────────────────────────────────────────────
export async function updateDisplayName(userId, newName) {
  const trimmed = newName.trim();
  if (!trimmed) throw new Error('Name cannot be empty.');

  await Promise.all([
    updateProfile(auth.currentUser, { displayName: trimmed }),
    updateDoc(doc(db, 'users', userId), {
      name:      trimmed,
      updatedAt: serverTimestamp(),
    }),
  ]);
}


// ─────────────────────────────────────────────────────────────
// 4. CHANGE PASSWORD
// ─────────────────────────────────────────────────────────────
export async function changePassword(currentPassword, newPassword) {
  if (newPassword.length < 6) throw new Error('Password must be at least 6 characters.');

  const user       = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}


// ─────────────────────────────────────────────────────────────
// 5. FORMAT MEMBER SINCE
// ─────────────────────────────────────────────────────────────
export function formatMemberSince(timestamp) {
  if (!timestamp) return '';
  const date = timestamp?.toDate?.() ?? new Date(timestamp);
  return `Member since ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
}


// ─────────────────────────────────────────────────────────────
// 6. GET INITIALS
// ─────────────────────────────────────────────────────────────
export function getInitials(name, email) {
  if (name?.trim()) {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  return email?.[0]?.toUpperCase() ?? '?';
}