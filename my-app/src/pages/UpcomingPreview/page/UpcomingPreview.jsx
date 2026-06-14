import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/Service/AuthContext';
import { FullPageLoader, SectionHeader,MobileSectionNav } from '../../../components/index';

import {
  MdOutlineWaterDrop,
  MdThermostat,

} from 'react-icons/md';


import {
  loadUpcomingData,
  fetchUserPlantsForForm,
  markReminderComplete,
  
  deleteReminder,
  
} from '../services/UpcomingService';

import {HeroSection,TimelineItem,Toast,UpcomingPanel} from '../component/index'


export default function PlantAidUpcomingPreview() {

  const { currentUser } = useAuth();
  const userId          = currentUser?.uid ?? null;

  const [upcoming,   setUpcoming]   = useState([]);
  const [overdue,    setOverdue]    = useState([]);
  const [userPlants, setUserPlants] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [reloading,  setReloading]  = useState(false);
  const [showModal,  setShowModal]  = useState(false);

  const [toast,       setToast]       = useState({ message: '', visible: false });
  const toastTimerRef                 = useRef(null);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimerRef.current);
    setToast({ message: msg, visible: true });
    toastTimerRef.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      2500,
    );
  }, []);

  // ── Full initial load ─────────────────────────────────────
  const loadData = useCallback(async (silent = false) => {
    if (!userId) { setLoading(false); return; }

    if (silent) {
      setReloading(true);
    } else {
      setLoading(true);
    }

    try {
      const [screenData, plants] = await Promise.all([
        loadUpcomingData(userId),
        fetchUserPlantsForForm(userId),
      ]);
      setUpcoming(screenData.upcoming);
      setOverdue(screenData.overdue);
      setUserPlants(plants);
      if (silent) showToast('Reminders refreshed!');
    } catch (err) {
      console.error('Load error:', err);
      showToast('Failed to load reminders.');
    } finally {
      setLoading(false);
      setReloading(false);
    }
  }, [userId, showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Reload (silent refresh — no spinner overlay) ─────────
  const handleReload = useCallback(() => {
    loadData(true);
  }, [loadData]);

  // ── Complete ──────────────────────────────────────────────
  const handleComplete = useCallback(async (reminderId) => {
    // Optimistic remove from both lists
    setUpcoming((prev) => prev.filter((r) => r.id !== reminderId));
    setOverdue ((prev) => prev.filter((r) => r.id !== reminderId));
    try {
      await markReminderComplete(reminderId);
      showToast('Marked as complete!');
    } catch (err) {
      console.error(err);
      await loadData(true);
      showToast('Failed to update reminder.');
    }
  }, [showToast, loadData]);

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = useCallback(async (reminderId) => {
    setUpcoming((prev) => prev.filter((r) => r.id !== reminderId));
    setOverdue ((prev) => prev.filter((r) => r.id !== reminderId));
    try {
      await deleteReminder(reminderId);
      showToast('Reminder deleted.');
    } catch (err) {
      console.error(err);
      await loadData(true);
      showToast('Failed to delete reminder.');
    }
  }, [showToast, loadData]);

  // ── Modal saved ───────────────────────────────────────────
  const handleModalSaved = useCallback(async (msg) => {
    setShowModal(false);
    await loadData(true);
    showToast(msg);
  }, [loadData, showToast]);

  if (loading) return <FullPageLoader message="Loading your care schedule" />;

  return (
    <div
      className="bg-[#fbf8ff] pb-20 lg:pb-8 text-[#1a1b22] min-h-screen flex flex-col"
      style={{ fontFamily: 'Manrope, sans-serif' }}
    >
      {/* Topbar — your reusable component */}
     {/* Desktop topbar — hidden on small screens */}
<div className="hidden lg:block md:block">
  <SectionHeader />
</div>

<div className="block lg:hidden">
  <MobileSectionNav/>
</div>

      {/* Main — original bento grid layout */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left column ──────────────────────────────────── */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Hero */}
      <HeroSection/>

          {/* Stat Cards — live Firestore data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-[#c8c5ca]/40 shadow-[0_8px_30px_rgba(0,0,0,0.02)] h-44 flex flex-col justify-between">
              <div>
                <MdOutlineWaterDrop className="text-xl text-[#1b6b51]" />
                <h3
                  className="font-bold mt-2 text-[17px]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Upcoming Tasks
                </h3>
              </div>
              <div
                className="text-3xl font-bold text-black"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {upcoming.length}
                <span className="text-sm font-medium text-[#47464a] ml-1">reminders</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#c8c5ca]/40 shadow-[0_8px_30px_rgba(0,0,0,0.02)] h-44 flex flex-col justify-between">
              <div>
                <MdThermostat className="text-xl text-[#1b6b51]" />
                <h3
                  className="font-bold mt-2 text-[17px]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Overdue
                </h3>
              </div>
              <div
                className={`text-3xl font-bold ${overdue.length > 0 ? 'text-amber-500' : 'text-black'}`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {overdue.length}
                <span className="text-sm font-medium text-[#47464a] ml-1">
                  {overdue.length === 0 ? 'all clear' : 'need attention'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column — live timeline panel ─────────── */}
        <aside className="lg:col-span-4 h-full" style={{ minHeight: '520px' }}>
          <UpcomingPanel
            items={[...overdue, ...upcoming]}
            overdueCount={overdue.length}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onAdd={() => setShowModal(true)}
            onReload={handleReload}
            reloading={reloading}
          />
        </aside>
      </main>

      {/* Footer */}
      <footer className="bg-[#fbf8ff] border-t border-[#c8c5ca] py-5 px-6 flex flex-col items-center gap-2 mt-auto">
        <div
          className="text-lg font-bold text-black"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          PlantAid
        </div>
        <div className="flex gap-5">
          <a className="text-sm text-[#47464a] hover:text-[#1b6b51] transition-colors" href="#signup">Sign up</a>
          <a className="text-sm text-[#47464a] hover:text-[#1b6b51] transition-colors" href="#privacy">Privacy Policy</a>
          <a className="text-sm text-[#47464a] hover:text-[#1b6b51] transition-colors" href="#help">Help Center</a>
        </div>
        <p className="text-sm text-[#1b6b51]">© {new Date().getFullYear()} PlantAid. Botanical Precision.</p>
      </footer>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}