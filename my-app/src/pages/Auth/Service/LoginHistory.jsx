// ============================================================
// LoginHistoryService.js
// Logs user login activity to the loginHistory collection.
// ============================================================

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';

const COLLECTION = 'loginHistory';

// ─────────────────────────────────────────────────────────────
// 1. LOG A LOGIN EVENT
// ─────────────────────────────────────────────────────────────
export async function logLoginActivity({ userId, email, method }) {
  await addDoc(collection(db, COLLECTION), {
    userId,
    email,
    method,
    loginAt: Timestamp.now(),
  });
}

// ─────────────────────────────────────────────────────────────
// 2. FETCH LOGIN HISTORY (one-shot)
// ─────────────────────────────────────────────────────────────
export async function fetchLoginHistory(userId, maxItems = 10) {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('loginAt', 'desc'),
    limit(maxItems),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─────────────────────────────────────────────────────────────
// 3. REAL-TIME LOGIN HISTORY LISTENER
// ─────────────────────────────────────────────────────────────
export function subscribeLoginHistory(userId, onChange, maxItems = 5) {
  if (!userId) { onChange([]); return () => {}; }

  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('loginAt', 'desc'),
    limit(maxItems),
  );

  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}