import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MdArrowBack,
  MdMoreVert,
  MdEdit,
  MdPlusOne,

} from 'react-icons/md';
import { IoLeaf } from 'react-icons/io5';
import { useAuth } from '../../Auth/Service/AuthContext';
import { FullPageLoader } from '../../../components/index';

import {
  loadPlantDetailsData,
  daysSincePlanted,
} from '../services/PlantDetailService';
import { findUserPlant } from '../../PlantDirectory/services/PlantService';
import { updateUserPlant } from '../services/PlantDetailService';

import {BotanicalSpecsView,CareRemindersView,JournalLogsView,ProgressView} from '../components/index'
import { GiNotebook } from 'react-icons/gi';


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

  const tabList = [
    { id: 'progress', label: 'Progress'        },
    { id: 'care',     label: 'Care Reminders'  },
    { id: 'journal',  label: 'Journal Logs'    },
    { id: 'specs',    label: 'Botanical Specs' },
  ];

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
      const resolvedUserPlantId = userPlantDoc.id;
      setUserPlantId(resolvedUserPlantId);
      const result = await loadPlantDetailsData(resolvedUserPlantId, userId);
      setData(result);
      setError(null);
console.log('plantedDate raw:', result?.userPlant?.plantedDate);
console.log('days:', daysSincePlanted(result?.userPlant?.plantedDate));

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

  // ── Image upload → base64 → Firestore ───────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userPlantId) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB.');
      return;
    }

    setUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await updateUserPlant(userPlantId, { imageUrl: base64 });
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

  if (!data?.userPlant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <IoLeaf className="text-4xl text-emerald-300" />
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Not in your garden</h2>
          <p className="text-zinc-400 text-sm mt-2 max-w-xs mx-auto leading-relaxed font-medium">
            Add this plant to your garden from the directory first to track it here.
          </p>
          <button onClick={() => navigate(-1)}
            className="mt-6 bg-zinc-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all">
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

  return (
    <div className="bg-zinc-50 min-h-screen font-sans text-zinc-800 flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-900">

      {/* Top Nav — matches DashboardToday navigation style */}
      <header className="w-full h-16 bg-white flex items-center justify-center px-6 border-b border-zinc-200/80 sticky top-0 z-40">
        <nav className="flex items-center justify-between w-full max-w-7xl mx-auto">
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
          <div className="hidden md:flex gap-6 text-sm">
            <button onClick={() => navigate('/')}           className="text-zinc-400 hover:text-zinc-900 transition-colors font-medium">Today</button>
            <button onClick={() => navigate('/collection')} className="text-zinc-400 hover:text-zinc-900 transition-colors font-medium">My Collection</button>
            <button onClick={() => navigate('/reports')}    className="text-zinc-400 hover:text-zinc-900 transition-colors font-medium">Health Reports</button>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 w-full flex-grow">

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
            <span className="flex-shrink-0">⚠️</span> {error}
          </div>
        )}

        {/* Page Header — matches dashboard editorial header style */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {/* Plant avatar */}
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-emerald-200/60">
                {userPlant?.imageUrl
                  ? <img src={userPlant.imageUrl} alt={displayName} className="w-full h-full object-cover" />
                  : <IoLeaf className="text-2xl text-emerald-500" />
                }
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">{displayName}</h1>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {userPlant.currentStage || 'Growing'}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 mt-0.5 font-medium">
                  {scientificName && <span className="italic">{scientificName} · </span>}
                  {days} days old
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer border border-zinc-200 bg-white text-zinc-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-all flex items-center gap-1.5">
                {uploading ? (
                  <span className="block lg:hidden w-4 h-4 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
                ) : (
                  <MdEdit className="text-base" />
                )}
               <p className={'hidden lg:block'}> {uploading ? 'Uploading…' : 'Update Photo'}</p>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>

              <button
                onClick={() => setActiveTab('journal')}
                className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm">
                  <GiNotebook className="text-base"/>
                 <p className="hidden lg:block">Log Growth</p>
              </button>
            
            </div>
          </div>
        </header>

        {/* Tab Bar — pill style matching dashboard card aesthetic */}
        <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-2xl p-1.5 mb-8 overflow-x-auto [scrollbar-width:none]">
          {tabList.map((tab) => (
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

        {/* Tab Content */}
        <div className="min-h-[500px]">
         {activeTab === 'progress' && <ProgressView masterPlant={masterPlant} userPlant={userPlant} journals={journals} />}
          {activeTab === 'care'     && (
            <CareRemindersView reminders={reminders} userId={userId} userPlantId={userPlantId} onRefresh={loadData} />
          )}
          {activeTab === 'journal'  && (
            <JournalLogsView journals={journals} userId={userId} userPlantId={userPlantId} onRefresh={loadData} />
          )}
          {activeTab === 'specs'    && <BotanicalSpecsView masterPlant={masterPlant} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200/80 flex flex-col items-center gap-2 w-full px-6 py-6 mt-12">
        <div className="flex items-center gap-1.5">
          <IoLeaf className="text-emerald-600 text-lg" />
          <span className="text-sm font-extrabold text-zinc-900">PlantAid</span>
        </div>
        <div className="flex gap-6">
          <a className="text-zinc-400 hover:text-emerald-700 transition-colors text-xs font-medium" href="#">Sign up</a>
          <a className="text-zinc-400 hover:text-emerald-700 transition-colors text-xs font-medium" href="#">Privacy Policy</a>
          <a className="text-zinc-400 hover:text-emerald-700 transition-colors text-xs font-medium" href="#">Help Center</a>
        </div>
        <p className="text-xs text-zinc-300 font-medium mt-1">© {new Date().getFullYear()} PlantAid. Botanical Precision.</p>
      </footer>
    </div>
  );
}