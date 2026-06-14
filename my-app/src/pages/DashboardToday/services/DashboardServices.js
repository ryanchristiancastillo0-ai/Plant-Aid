// ============================================================
// DashboardService.js
// Centralised data layer for the Dashboard (Today) screen.
// Mirrors the pattern used in AuthContext – pure async functions
// that the UI can call directly or wrap in useEffect / custom hooks.
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
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';

// ─────────────────────────────────────────────────────────────
// 1. WEATHER  (OpenWeatherMap – or any API with VITE_WEATHER_API)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch current weather for a given lat/lon.
 * Returns a normalised object so the UI never touches raw API shapes.
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<WeatherData>}
 *
 * WeatherData shape:
 * {
 *   temp:        number,      // Celsius
 *   feelsLike:   number,
 *   humidity:    number,      // %
 *   description: string,      // e.g. "Partly cloudy"
 *   icon:        string,      // OpenWeather icon code, e.g. "02d"
 *   cityName:    string,
 *   wind:        number,      // m/s
 *   isRainy:     boolean,
 *   isSunny:     boolean,
 *   isHumid:     boolean,     // humidity >= 70
 * }
 */
export async function fetchWeather(lat, lon) {
  const apiKey = import.meta.env.VITE_WEATHER_API;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

  const data = await res.json();

  const weatherId = data.weather?.[0]?.id ?? 800;
  const isRainy   = weatherId >= 200 && weatherId < 700;
  const isSunny   = weatherId >= 800;
  const humidity  = data.main?.humidity ?? 0;

  return {
    temp:        Math.round(data.main?.temp ?? 0),
    feelsLike:   Math.round(data.main?.feels_like ?? 0),
    humidity,
    description: data.weather?.[0]?.description ?? '',
    icon:        data.weather?.[0]?.icon ?? '01d',
    cityName:    data.name ?? '',
    wind:        Math.round(data.wind?.speed ?? 0),
    isRainy,
    isSunny,
    isHumid:     humidity >= 70,
  };
}

/**
 * Tiny helper – resolves the user's position via browser Geolocation API.
 * Falls back to Manila, PH if permission is denied.
 *
 * @returns {Promise<{ lat: number, lon: number }>}
 */
export function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: 14.5995, lon: 120.9842 }); // Manila fallback
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      ()    => resolve({ lat: 14.5995, lon: 120.9842 }),
      { timeout: 6000 },
    );
  });
}

/**
 * Generate a botanical insight tip based on weather data.
 * Pure function – no API call needed.
 *
 * @param {object} weather  – result of fetchWeather()
 * @returns {string}
 */
export function getBotanicalInsight(weather) {
  if (!weather) return 'Check on your plants today and make sure they have enough light and water.';

  if (weather.isRainy)
    return 'Rain is on the way! Skip manual watering today – your outdoor plants are covered. Watch for waterlogged soil and ensure drainage is clear.';

  if (weather.isHumid && weather.isSunny)
    return `High humidity (${weather.humidity}%) with sunshine is perfect for tropical misting. Give your Monstera and Calathea collection some love this afternoon.`;

  if (weather.temp >= 32)
    return `It's ${weather.temp}°C outside – heat stress alert! Move sensitive plants out of direct afternoon sun and increase watering frequency today.`;

  if (weather.temp <= 18)
    return `Cool temperatures today (${weather.temp}°C). Keep tropical plants away from draughty windows and hold off on fertilising until it warms up.`;

  if (weather.isHumid)
    return `Humidity is at ${weather.humidity}% – great conditions for propagation. Consider misting leafy plants and checking for fungal issues on dense foliage.`;

  return `${weather.temp}°C with ${weather.description} – a great day for outdoor plant care. Ideal conditions for repotting or transplanting seedlings.`;
}


// ─────────────────────────────────────────────────────────────
// 2. REMINDERS
// ─────────────────────────────────────────────────────────────

/**
 * Fetch PENDING reminders for a user, ordered by reminderDate.
 *
 * @param {string} userId
 * @param {number} [maxItems=10]
 * @returns {Promise<ReminderDoc[]>}
 *
 * ReminderDoc shape (matches Firestore schema):
 * { id, userId, userPlantId, title, type, reminderDate (Timestamp), status, createdAt }
 */
export async function fetchUpcomingReminders(userId) {
  const q = query(
    collection(db, 'reminders'),
    where('userId', '==', userId),
    where('completed', '==', false),
    orderBy('reminderDate', 'asc'),
    limit(2),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
/**
 * Fetch today's reminders only (midnight → 23:59 today).
 *
 * @param {string} userId
 * @returns {Promise<ReminderDoc[]>}
 */
export async function fetchTodayReminders(userId) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, 'reminders'),
    where('userId',        '==', userId),
    where('reminderDate',  '>=', Timestamp.fromDate(start)),
    where('reminderDate',  '<=', Timestamp.fromDate(end)),
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
 * Mark a reminder as MISSED.
 *
 * @param {string} reminderId
 * @returns {Promise<void>}
 */
export async function missReminder(reminderId) {
  await updateDoc(doc(db, 'reminders', reminderId), { status: 'MISSED' });
}


// ─────────────────────────────────────────────────────────────
// 3. USER PLANTS (for daily care list)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all userPlants belonging to a user.
 *
 * @param {string} userId
 * @returns {Promise<UserPlantDoc[]>}
 *
 * UserPlantDoc shape (matches Firestore schema):
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
 * Fetch a single userPlant document by its ID.
 *
 * @param {string} userPlantId
 * @returns {Promise<UserPlantDoc|null>}
 */
export async function fetchUserPlantById(userPlantId) {
  const snap = await getDoc(doc(db, 'userPlants', userPlantId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Update the health status of a userPlant.
 *
 * @param {string} userPlantId
 * @param {'HEALTHY'|'WARNING'|'SICK'} healthStatus
 * @returns {Promise<void>}
 */
export async function updatePlantHealth(userPlantId, healthStatus) {
  await updateDoc(doc(db, 'userPlants', userPlantId), { healthStatus });
}


// ─────────────────────────────────────────────────────────────
// 4. JOURNALS (latest entries for the dashboard)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch the most recent journal entries for a user.
 *
 * @param {string} userId
 * @param {number} [maxItems=5]
 * @returns {Promise<JournalDoc[]>}
 *
 * JournalDoc shape:
 * { id, userId, userPlantId, title, content, imageUrl, createdAt, updatedAt }
 */
export async function fetchRecentJournals(userId, maxItems = 5) {
  const q = query(
    collection(db, 'journals'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(maxItems),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}


// ─────────────────────────────────────────────────────────────
// 5. IDENTIFICATION HISTORY
// ─────────────────────────────────────────────────────────────

/**
 * Fetch recent plant identification scans for a user.
 *
 * @param {string} userId
 * @param {number} [maxItems=5]
 * @returns {Promise<ScanDoc[]>}
 *
 * ScanDoc shape:
 * { id, userId, plantId, imageUrl, commonName, scientificName,
 *   confidence, scannedAt }
 */
export async function fetchIdentificationHistory(userId, maxItems = 5) {
  const q = query(
    collection(db, 'identificationHistory'),
    where('userId', '==', userId),
    orderBy('scannedAt', 'desc'),
    limit(maxItems),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}


// ─────────────────────────────────────────────────────────────
// 6. AGGREGATE – single call that loads everything the dashboard needs
// ─────────────────────────────────────────────────────────────

/**
 * Load all dashboard data in parallel.
 * Call this once on mount with the authenticated userId.
 *
 * @param {string} userId
 * @returns {Promise<DashboardData>}
 *
 * DashboardData shape:
 * {
 *   userPlants:   UserPlantDoc[],
 *   todayReminders:    ReminderDoc[],
 *   upcomingReminders: ReminderDoc[],
 *   recentJournals:    JournalDoc[],
 * }
 */
export async function loadDashboardData(userId) {
  const [userPlants, todayReminders, upcomingReminders, recentJournals] =
    await Promise.all([
      fetchUserPlants(userId),
      fetchTodayReminders(userId),
      fetchUpcomingReminders(userId, 5),
      fetchRecentJournals(userId, 3),
    ]);

  return { userPlants, todayReminders, upcomingReminders, recentJournals };
}