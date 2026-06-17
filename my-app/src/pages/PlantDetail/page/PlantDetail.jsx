import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MdArrowBack,
  MdEdit,
  MdErrorOutline,
} from 'react-icons/md';
import { IoLeaf } from 'react-icons/io5';
import { GiNotebook } from 'react-icons/gi';
import { useAuth } from '../../Auth/Service/AuthContext';
import { FullPageLoader } from '../../../components/index';
import {
  loadPlantDetailsData,
  daysSincePlanted,
  updateUserPlant,
} from '../services/PlantDetailService';
import { findUserPlant } from '../../PlantDirectory/services/PlantService';
import {
  BotanicalSpecsView,
  CareRemindersView,
  JournalLogsView,
  ProgressView,
  PlantPlaceholder,
  StagePill
} from '../components/index';

import {TABS} from '../constant/detail'



// ── Main ─────────────────────────────────────────────────────
export default function PlantDetails() {
  const { plantId }     = useParams();
  const navigate        = useNavigate();
  const { currentUser } = useAuth();
  const userId          = currentUser?.uid;

  const [activeTab,   setActiveTab]   = useState('progress');
  const [data,        setData]        = useState(null);
  const [userPlantId, setUserPlantId] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [uploading,   setUploading]   = useState(false);
  const [imgError,    setImgError]    = useState(false);

  const loadData = useCallback(async () => {
    if (!userId || !plantId) return;
    try {
      const userPlantDoc = await findUserPlant(userId, plantId);
      if (!userPlantDoc) {
        setData(null);
        setUserPlantId(null);
        setError(null);
        return;
      }
      const resolvedId = userPlantDoc.id;
      setUserPlantId(resolvedId);
      const result = await loadPlantDetailsData(resolvedId, userId);
      setData(result);
      setError(null);
      setImgError(false);
    } catch (err) {
      console.error('PlantDetails load error:', err);
      setError('Could not load plant data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [userId, plantId]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userPlantId) return;
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2MB.'); return; }
    setUploading(true);
    try {
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload  = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      await updateUserPlant(userPlantId, { imageUrl: base64 });
      setImgError(false);
      await loadData();
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Failed to save image. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) return <FullPageLoader message="Loading plant details, please wait" />;

  // ── Not in garden state ──────────────────────────────────
  if (!data?.userPlant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 border-2 border-dashed border-emerald-200 flex items-center justify-center mx-auto mb-6">
            <IoLeaf className="text-4xl text-emerald-300" />
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Not in your garden</h2>
          <p className="text-zinc-400 text-sm mt-2 leading-relaxed font-medium">
            Add this plant from the directory first to start tracking it here.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 bg-zinc-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const { userPlant, masterPlant, reminders, journals } = data;
  const displayName    = userPlant.nickname || masterPlant?.name || 'My Plant';
  const scientificName = masterPlant?.scientificName || '';
  const days           = daysSincePlanted(userPlant.plantedDate);
  const displayImg = userPlant?.imageUrl?.startsWith('data:') 
  ? userPlant.imageUrl       // user uploaded a custom base64 photo
  : masterPlant?.imageUrl;   // fall back to catalog image

const hasValidImg = displayImg && !imgError;

  return (
    <div className="bg-zinc-50 min-h-screen font-sans text-zinc-800 flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-900">

      {/* ── Top Nav — matches PlantDirectory style ── */}
      <header className="w-full h-16 bg-white border-b border-zinc-200/80 sticky top-0 z-40 flex items-center px-4 md:px-6">
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors"
            >
              <MdArrowBack className="text-zinc-700 text-xl" />
            </button>
            <div className="h-5 w-px bg-zinc-200" />
            <div className="flex items-center gap-2">
              <IoLeaf className="text-emerald-600 text-xl" />
              <span className="text-xl font-extrabold text-zinc-900 tracking-tight">PlantAid</span>
            </div>
          </div>

          {/* Actions in nav on desktop */}
          <div className="hidden md:flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2 border border-zinc-200 bg-white text-zinc-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-all">
              {uploading
                ? <span className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
                : <MdEdit className="text-base" />}
              {uploading ? 'Uploading…' : 'Update Photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <button
              onClick={() => setActiveTab('journal')}
              className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
            >
              <GiNotebook className="text-base" />
              Log Growth
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 md:px-6 py-10">

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
            <MdErrorOutline className="flex-shrink-0 text-lg" /> {error}
          </div>
        )}

        {/* ── Hero header ── */}
        <header className="mb-10">
          <div className="flex items-start gap-5">
            {/* Plant image / placeholder */}
            <div className="flex-shrink-0">
              {hasValidImg ? (
               <img
  src={displayImg}
  alt={displayName}
  onError={() => setImgError(true)}
  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border border-zinc-200"
/>
              ) : (
                <PlantPlaceholder size="lg" />
              )}
            </div>

            {/* Title block */}
            <div className="flex-grow min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight truncate">
                  {displayName}
                </h1>
                <StagePill stage={userPlant.currentStage} />
              </div>
              {scientificName && (
                <p className="text-sm text-zinc-400 font-medium italic">{scientificName}</p>
              )}
              <p className="text-sm text-zinc-400 font-medium mt-0.5">
                {days} {days === 1 ? 'day' : 'days'} old
              </p>
            </div>
          </div>

          {/* Mobile actions below header */}
          <div className="flex items-center gap-2 mt-5 md:hidden">
            <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 border border-zinc-200 bg-white text-zinc-700 py-2.5 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-all">
              {uploading
                ? <span className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
                : <MdEdit className="text-base" />}
              {uploading ? 'Uploading…' : 'Update Photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <button
              onClick={() => setActiveTab('journal')}
              className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 text-white py-2.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
            >
              <GiNotebook className="text-base" />
              Log Growth
            </button>
          </div>
        </header>

        {/* ── Tab bar — matches PlantDirectory pill style ── */}
        <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-2xl p-1.5 mb-8 overflow-x-auto [scrollbar-width:none]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max py-2 px-4 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="min-h-[500px]">
          {activeTab === 'progress' && (
            <ProgressView masterPlant={masterPlant} userPlant={userPlant} journals={journals} />
          )}
          {activeTab === 'care' && (
            <CareRemindersView reminders={reminders} userId={userId} userPlantId={userPlantId} onRefresh={loadData} />
          )}
          {activeTab === 'journal' && (
            <JournalLogsView journals={journals} userId={userId} userPlantId={userPlantId} onRefresh={loadData} />
          )}
          {activeTab === 'specs' && (
            <BotanicalSpecsView masterPlant={masterPlant} />
          )}
        </div>
      </main>

      {/* ── Footer — matches PlantDirectory ── */}
      <footer className="bg-white border-t border-zinc-200/80 flex flex-col items-center gap-2 w-full px-6 py-6 mt-12">
        <div className="flex items-center gap-1.5 mb-1">
          <IoLeaf className="text-emerald-600 text-lg" />
          <span className="text-sm font-extrabold text-zinc-900">PlantAid</span>
        </div>
        <div className="flex gap-6">
          <a className="text-zinc-400 hover:text-emerald-700 transition-colors text-xs font-medium" href="#">Sign up</a>
          <a className="text-zinc-400 hover:text-emerald-700 transition-colors text-xs font-medium" href="#">Privacy Policy</a>
          <a className="text-zinc-400 hover:text-emerald-700 transition-colors text-xs font-medium" href="#">Help Center</a>
        </div>
        <p className="text-xs text-zinc-400/60 font-medium mt-1">
          © {new Date().getFullYear()} PlantAid. Botanical Precision.
        </p>
      </footer>
    </div>
  );
}