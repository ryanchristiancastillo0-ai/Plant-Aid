import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/Service/AuthContext';
import { Topbar, FullPageLoader, MobileSectionNav, SectionHeader } from '../../../components/index';

// React Icons
import {
  MdCheckCircle,
  MdArrowForward,
  MdArrowBack,
  MdEco,
  MdLocalFlorist,
  MdGrass,
  MdSpa,
  MdScience,
  MdInfoOutline,
  MdCalendarToday,
  MdFavorite,
  MdTimeline,
  MdOutlineWaterDrop,
} from 'react-icons/md';
import { IoLeaf } from 'react-icons/io5';
import { FaSeedling } from 'react-icons/fa6';
import { GiPlantSeed, GiFlowerPot, GiGrapes } from 'react-icons/gi';

import {
  loadJourneyData,
  loadPlantJourneyDetail,
  jumpToStage,
  advancePlantStage,
  retreatPlantStage,
  GROWTH_STAGES,
  stageIndexOf,
  formatTimestamp,
  daysSincePlanted,
  healthStatus,
} from '../services/GrowthJourneyService';


// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const STAGE_ICONS = [
  <GiPlantSeed   key="0" />,
  <MdGrass       key="1" />,
  <MdLocalFlorist key="2" />,
  <GiFlowerPot   key="3" />,
  <GiGrapes      key="4" />,
];

const HEALTH_STYLES = {
  'Optimized Health': 'text-emerald-600 bg-emerald-50 border-emerald-200',
  'On Track':         'text-sky-600 bg-sky-50 border-sky-200',
  'Needs Attention':  'text-amber-600 bg-amber-50 border-amber-200',
};

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23ecfdf5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' font-weight='bold' fill='%236ee7b7'%3EPlant%3C/text%3E%3C/svg%3E";


// ─────────────────────────────────────────────────────────────
// Reusable – Stage Icon Badge
// ─────────────────────────────────────────────────────────────
function StageDot({ index, isVisited, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-[#064e3b]/40 ${
        isActive
          ? 'bg-[#064e3b] border-4 border-[#d1fae5] text-white shadow-md scale-110'
          : isVisited
          ? 'bg-[#064e3b] border-4 border-[#d1fae5]/60 text-white shadow-sm'
          : 'bg-neutral-100 border-2 border-neutral-200 text-neutral-400 hover:border-[#064e3b]/30'
      }`}
    >
      {isVisited && !isActive ? (
        <MdCheckCircle className="text-[18px]" />
      ) : (
        <span className="text-[13px]">{STAGE_ICONS[index]}</span>
      )}
    </button>
  );
}


// ─────────────────────────────────────────────────────────────
// Reusable – Stage Row
// ─────────────────────────────────────────────────────────────
function StageRow({ stage, index, currentIndex, onSelect }) {
  const isVisited = index <= currentIndex;
  const isActive  = index === currentIndex;

  return (
    <div
      className="group cursor-pointer relative flex items-start gap-6"
      onClick={() => onSelect(index)}
    >
      <StageDot
        index={index}
        isVisited={isVisited}
        isActive={isActive}
        onClick={() => onSelect(index)}
      />
      <div className="flex-grow pt-0.5 pb-1">
        <h3 className={`text-base tracking-tight transition-all duration-300 ${
          isActive   ? 'text-[#064e3b] font-extrabold' :
          isVisited  ? 'text-[#064e3b] font-semibold'  :
                       'text-zinc-800 font-semibold'
        }`}>
          {stage.title}
        </h3>
        <p className={`text-sm leading-snug mt-0.5 transition-all duration-300 ${
          isActive ? 'text-zinc-600' : 'text-zinc-400'
        }`}>
          {stage.description}
        </p>
      </div>
      {isActive && (
        <span className="mt-1 flex-shrink-0 text-[10px] font-bold uppercase tracking-widest text-[#064e3b] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          Current
        </span>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Reusable – Plant Selector Card (left panel)
// ─────────────────────────────────────────────────────────────
function PlantSelectorCard({ userPlant, isActive, onClick }) {
  const stageIdx = stageIndexOf(userPlant.currentStage);
  const progress = Math.round((stageIdx / (GROWTH_STAGES.length - 1)) * 100);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
        isActive
          ? 'bg-white border-emerald-300 shadow-md'
          : 'bg-white/60 border-zinc-200 hover:border-emerald-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl overflow-hidden bg-emerald-50 border border-zinc-100 flex-shrink-0">
          {userPlant.imageUrl ? (
            <img
              src={userPlant.imageUrl}
              alt={userPlant.nickname}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <IoLeaf className="text-xl text-emerald-300" />
            </div>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <p className="text-sm font-bold text-zinc-900 truncate">{userPlant.nickname}</p>
          <p className="text-[11px] text-zinc-400 truncate">{userPlant.currentStage}</p>
          {/* Mini progress bar */}
          <div className="mt-1.5 w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}


// ─────────────────────────────────────────────────────────────
// Reusable – Stage Log Entry
// ─────────────────────────────────────────────────────────────
function StageLogEntry({ log, index }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
        <MdCheckCircle className="text-emerald-500 text-xs" />
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-800">{log.stage}</p>
        {log.note && <p className="text-xs text-zinc-400 mt-0.5 italic">"{log.note}"</p>}
        <p className="text-[10px] text-zinc-300 mt-0.5">{formatTimestamp(log.loggedAt)}</p>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Reusable – DetailSpinner
// ─────────────────────────────────────────────────────────────
function DetailSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <span className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Reusable – Stat Chip
// ─────────────────────────────────────────────────────────────
function StatChip({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 bg-white border border-zinc-100 rounded-2xl shadow-sm min-w-[90px]">
      <span className="text-[#064e3b] text-xl">{icon}</span>
      <p className="text-lg font-extrabold text-zinc-900 leading-none">{value}</p>
      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide">{label}</p>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Reusable – Health Badge
// ─────────────────────────────────────────────────────────────
function HealthBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${HEALTH_STYLES[status] ?? HEALTH_STYLES['On Track']}`}>
      <MdFavorite className="text-[13px]" />
      {status}
    </span>
  );
}


// ─────────────────────────────────────────────────────────────
// Reusable – PlantHeroCard
// ─────────────────────────────────────────────────────────────
function PlantHeroCard({ selectedPlant, masterPlant, health, currentStageIdx, savingStage, onAdvance, onRetreat }) {
  return (
    <div className="mb-6 p-5 bg-white border border-zinc-200/60 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-zinc-100 flex-shrink-0">
        {selectedPlant.imageUrl ? (
          <img 
            src={selectedPlant.imageUrl} 
            alt={selectedPlant.nickname} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        ) : (
          <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
            <IoLeaf className="text-2xl text-emerald-300" />
          </div>
        )}
      </div>
      {/* Info */}
      <div className="flex-grow min-w-0">
        <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight truncate">
          {selectedPlant.nickname}
        </h2>
        {masterPlant?.scientificName && (
          <p className="text-xs italic text-zinc-400">{masterPlant.scientificName}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <HealthBadge status={health} />
          <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
            <MdCalendarToday className="text-[13px]" />
            Planted {formatTimestamp(selectedPlant.plantedDate)}
          </span>
        </div>
      </div>
      {/* Stage controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          disabled={savingStage || currentStageIdx === 0}
          onClick={onRetreat}
          title="Go back one stage"
          className="w-9 h-9 rounded-xl border border-zinc-200 bg-white flex items-center justify-center text-zinc-500 hover:border-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <MdArrowBack />
        </button>
        <button
          disabled={savingStage || currentStageIdx === GROWTH_STAGES.length - 1}
          onClick={onAdvance}
          title="Advance one stage"
          className="w-9 h-9 rounded-xl bg-[#064e3b] text-white flex items-center justify-center hover:bg-[#053d2f] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
        >
          {savingStage ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <MdArrowForward />
          )}
        </button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Reusable – GrowthTimeline panel
// ─────────────────────────────────────────────────────────────
function GrowthTimeline({ currentStageIdx, onSelect, activeTrackPct }) {
  return (
    <div className="lg:col-span-3 p-6 bg-white border border-zinc-200/60 rounded-3xl shadow-sm">
      <h3 className="text-sm font-bold text-zinc-800 mb-6 uppercase tracking-widest flex items-center gap-2">
        <MdTimeline className="text-[#064e3b]" />
        Growth Timeline
      </h3>
      <div className="relative space-y-10">
        <div className="absolute left-[17px] top-4 bottom-4 w-[2px] bg-zinc-100 -z-10" />
        <div
          className="absolute left-[17px] top-4 w-[2px] bg-[#064e3b] transition-all duration-500 origin-top -z-10"
          style={{ height: activeTrackPct }}
        />
        {GROWTH_STAGES.map((stage, idx) => (
          <StageRow
            key={stage.key}
            stage={stage}
            index={idx}
            currentIndex={currentStageIdx}
            onSelect={onSelect}
          />
        ))}
      </div>
      <p className="mt-6 text-[11px] text-zinc-300 flex items-center gap-1">
        <MdInfoOutline />
        Click any stage to jump directly to it.
      </p>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Reusable – StageHistoryPanel
// ─────────────────────────────────────────────────────────────
function StageHistoryPanel({ stageLogs }) {
  return (
    <div className="lg:col-span-2 p-6 bg-white border border-zinc-200/60 rounded-3xl shadow-sm flex flex-col">
      <h3 className="text-sm font-bold text-zinc-800 mb-5 uppercase tracking-widest flex items-center gap-2">
        <MdOutlineWaterDrop className="text-[#064e3b]" />
        Stage History
      </h3>
      {stageLogs.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center py-8 gap-3">
          <MdEco className="text-3xl text-emerald-200" />
          <p className="text-sm text-zinc-400">No stage transitions logged yet.</p>
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto max-h-80 pr-1 [scrollbar-width:thin]">
          {stageLogs.map((log, i) => (
            <StageLogEntry key={log.id ?? i} log={log} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Reusable – EmptyGarden
// ─────────────────────────────────────────────────────────────
function EmptyGarden({ onNavigate }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center space-y-5">
      <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
        <FaSeedling className="text-4xl text-emerald-300" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-bold text-zinc-800">No plants yet</p>
        <p className="text-sm text-zinc-400 max-w-xs">
          Add plants to your garden to start tracking their growth journey.
        </p>
      </div>
      <button
        onClick={onNavigate}
        className="px-6 py-3 bg-zinc-950 text-white text-sm font-bold rounded-2xl hover:bg-zinc-800 active:scale-95 transition-all"
      >
        Browse Plant Directory
      </button>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Reusable – Error Banner
// ─────────────────────────────────────────────────────────────
function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
      <span className="text-base">⚠️</span>
      {message}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Reusable – Toast
// ─────────────────────────────────────────────────────────────
function Toast({ message, visible }) {
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className="bg-zinc-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2">
        <IoLeaf className="text-emerald-400" />
        {message}
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Main – GrowthJourney
// ─────────────────────────────────────────────────────────────
export default function GrowthJourney() {
  const navigate        = useNavigate();
  const { currentUser } = useAuth();
  const userId          = currentUser?.uid ?? null;

  // ── Data ────────────────────────────────────────────────
  const [userPlants,    setUserPlants]    = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [masterPlant,   setMasterPlant]   = useState(null);
  const [stageLogs,     setStageLogs]     = useState([]);

  // ── UI ──────────────────────────────────────────────────
  const [loadingList,   setLoadingList]   = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingStage,   setSavingStage]   = useState(false);
  const [dataError,     setDataError]     = useState(null);
  const [detailError,   setDetailError]   = useState(null);

  // ── Local stage key (mirrors selectedPlant.currentStage) ──
  const [currentStageKey, setCurrentStageKey] = useState(GROWTH_STAGES[0].key);
  const currentStageIdx = stageIndexOf(currentStageKey);
  const activeTrackPct  = `${(currentStageIdx / (GROWTH_STAGES.length - 1)) * 100}%`;

  // ── Toast ────────────────────────────────────────────────
  const [toast,       setToast]       = useState({ message: '', visible: false });
  const toastTimerRef                 = React.useRef(null);

  const showToast = useCallback((message) => {
    clearTimeout(toastTimerRef.current);
    setToast({ message, visible: true });
    toastTimerRef.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      2500,
    );
  }, []);

  // ── Helper: sync a new stage key into all local state ────
  const syncStageKey = useCallback((plantId, newKey) => {
    setCurrentStageKey(newKey);
    setUserPlants((prev) =>
      prev.map((p) => (p.id === plantId ? { ...p, currentStage: newKey } : p)),
    );
    setSelectedPlant((prev) => (prev ? { ...prev, currentStage: newKey } : prev));
  }, []);

  // ── Helper: refresh stage logs after a write ─────────────
  const refreshLogs = useCallback(async (userPlantId) => {
    const { stageLogs: logs } = await loadPlantJourneyDetail(userPlantId);
    setStageLogs(logs);
  }, []);

  // ── 1. Select a plant + load its detail ──────────────────
  const selectPlant = useCallback(async (userPlant) => {
    setSelectedPlant(userPlant);
    setCurrentStageKey(userPlant.currentStage ?? GROWTH_STAGES[0].key);
    setLoadingDetail(true);
    setDetailError(null);
    try {
      const { masterPlant: mp, stageLogs: logs } = await loadPlantJourneyDetail(userPlant.id);
      setMasterPlant(mp);
      setStageLogs(logs);
    } catch (err) {
      console.error('Detail load error:', err);
      setDetailError('Could not load plant details.');
      setMasterPlant(null);
      setStageLogs([]);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // ── 2. Load plant list on mount ───────────────────────────
  useEffect(() => {
    if (!userId) { setLoadingList(false); return; }
    (async () => {
      setLoadingList(true);
      setDataError(null);
      try {
        const { userPlants: plants } = await loadJourneyData(userId);
        setUserPlants(plants);
        if (plants.length > 0) await selectPlant(plants[0]);
      } catch (err) {
        console.error('Journey load error:', err);
        setDataError('Failed to load your plants. Please check your connection and refresh.');
      } finally {
        setLoadingList(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ── 3. Jump to stage by clicking the timeline ─────────────
  const handleStageSelect = useCallback(async (idx) => {
    if (!selectedPlant || savingStage) return;
    const targetKey = GROWTH_STAGES[idx].key;
    if (targetKey === currentStageKey) return;

    setSavingStage(true);
    syncStageKey(selectedPlant.id, targetKey);           // optimistic
    try {
      await jumpToStage(selectedPlant.id, targetKey);
      await refreshLogs(selectedPlant.id);
      showToast(`Stage updated to "${targetKey}"`);
    } catch (err) {
      console.error('Stage jump error:', err);
      syncStageKey(selectedPlant.id, selectedPlant.currentStage); // revert
      showToast('Failed to update stage. Please try again.');
    } finally {
      setSavingStage(false);
    }
  }, [selectedPlant, currentStageKey, savingStage, syncStageKey, refreshLogs, showToast]);

  // ── 4. Advance one stage ──────────────────────────────────
  const handleAdvance = useCallback(async () => {
    if (!selectedPlant || savingStage) return;
    setSavingStage(true);
    try {
      const nextKey = await advancePlantStage(selectedPlant.id, currentStageKey);
      if (!nextKey) { showToast('Already at the final stage!'); return; }
      syncStageKey(selectedPlant.id, nextKey);
      await refreshLogs(selectedPlant.id);
      showToast(`Advanced to "${nextKey}"`);
    } catch (err) {
      console.error('Advance error:', err);
      showToast('Failed to advance stage.');
    } finally {
      setSavingStage(false);
    }
  }, [selectedPlant, currentStageKey, savingStage, syncStageKey, refreshLogs, showToast]);

  // ── 5. Retreat one stage ──────────────────────────────────
  const handleRetreat = useCallback(async () => {
    if (!selectedPlant || savingStage) return;
    setSavingStage(true);
    try {
      const prevKey = await retreatPlantStage(selectedPlant.id, currentStageKey);
      if (!prevKey) { showToast('Already at the first stage.'); return; }
      syncStageKey(selectedPlant.id, prevKey);
      await refreshLogs(selectedPlant.id);
      showToast(`Retreated to "${prevKey}"`);
    } catch (err) {
      console.error('Retreat error:', err);
      showToast('Failed to retreat stage.');
    } finally {
      setSavingStage(false);
    }
  }, [selectedPlant, currentStageKey, savingStage, syncStageKey, refreshLogs, showToast]);

  // ── Derived display values ────────────────────────────────
  const days   = selectedPlant ? daysSincePlanted(selectedPlant.plantedDate) : 0;
  const health = selectedPlant
    ? healthStatus(days, masterPlant?.growthDays ?? 0, currentStageIdx)
    : 'On Track';

  // ── Full-page loader ──────────────────────────────────────
  if (loadingList) return <FullPageLoader message="Loading your growth journey" />;

  return (
    <div className="bg-[#f7faf7] pb-20 lg:pb-0 text-zinc-800 min-h-screen flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      
<div className="hidden md:block">
  <SectionHeader />
</div>

<div className="md:hidden">
  <Topbar />
  <MobileSectionNav />
</div>

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 md:px-6 py-10">

        {/* Page Header */}
        <header className="mb-8 space-y-1">
          <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight">
            Growth Journey
          </h1>
          <p className="text-base font-medium text-zinc-400">
            Monitor your botanical assets from germination through harvest.
          </p>
        </header>

        <ErrorBanner message={dataError} />

        {userPlants.length === 0 ? (
          <EmptyGarden onNavigate={() => navigate('/plants')} />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Left Panel: Plant List ─────────────────── */}
            <aside className="lg:w-72 flex-shrink-0 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 pl-1">
                Your Plants ({userPlants.length})
              </p>
              {userPlants.map((up) => (
                <PlantSelectorCard
                  key={up.id}
                  userPlant={up}
                  isActive={selectedPlant?.id === up.id}
                  onClick={() => selectPlant(up)}
                />
              ))}
              <button
                onClick={() => navigate('/plants')}
                className="w-full mt-2 px-4 py-2.5 bg-white border border-dashed border-zinc-300 rounded-2xl text-sm font-semibold text-zinc-400 hover:border-emerald-300 hover:text-emerald-600 transition-all"
              >
                + Add More Plants
              </button>
            </aside>

            {/* ── Right Panel: Journey Detail ───────────── */}
            <section className="flex-grow min-w-0">

              {/* Hero card */}
              {selectedPlant && (
                <PlantHeroCard
                  selectedPlant={selectedPlant}
                  masterPlant={masterPlant}
                  health={health}
                  currentStageIdx={currentStageIdx}
                  savingStage={savingStage}
                  onAdvance={handleAdvance}
                  onRetreat={handleRetreat}
                />
              )}

              {/* Stats row */}
              {selectedPlant && (
                <div className="mb-6 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1">
                  <StatChip icon={<MdCalendarToday />} label="Days Growing"  value={days} />
                  <StatChip icon={<MdEco />}           label="Stage"         value={`${currentStageIdx + 1}/${GROWTH_STAGES.length}`} />
                  <StatChip icon={<MdSpa />}           label="Log Entries"   value={stageLogs.length} />
                  {masterPlant?.growthDays > 0 && (
                    <StatChip icon={<MdScience />}     label="Expected Days" value={masterPlant.growthDays} />
                  )}
                </div>
              )}

              <ErrorBanner message={detailError} />

              {/* Detail area */}
              {loadingDetail ? (
                <DetailSpinner />
              ) : selectedPlant ? (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <GrowthTimeline
                    currentStageIdx={currentStageIdx}
                    onSelect={handleStageSelect}
                    activeTrackPct={activeTrackPct}
                  />
                  <StageHistoryPanel stageLogs={stageLogs} />
                </div>
              ) : null}

            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200/80 w-full py-6 flex flex-col items-center gap-2 px-6 mt-auto">
        <div className="flex gap-6">
          <a className="text-zinc-400 hover:text-emerald-700 transition-colors text-xs" href="#">Sign up</a>
          <a className="text-zinc-400 hover:text-emerald-700 transition-colors text-xs" href="#">Privacy Policy</a>
          <a className="text-zinc-400 hover:text-emerald-700 transition-colors text-xs" href="#">Help Center</a>
        </div>
        <p className="text-xs text-zinc-400/60 mt-1">
          © {new Date().getFullYear()} PlantAid. Botanical Precision.
        </p>
      </footer>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}