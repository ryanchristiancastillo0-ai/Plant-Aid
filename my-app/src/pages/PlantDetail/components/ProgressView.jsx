
import {
  MdEditNote,
  MdAutoAwesome,
  MdWbSunny,
  MdThermostat,
  MdOpacity,
  MdSpa,
  MdCalendarToday,
  MdTimeline,
} from 'react-icons/md';
import { IoLeaf } from 'react-icons/io5';


import {

  formatDate,

  sunlightLabel,
  daysSincePlanted,
} from '../services/PlantDetailService';

import {PlantPlaceholder} from './index'


export default function ProgressView({ masterPlant, userPlant, journals }) {
  const days        = daysSincePlanted(userPlant?.plantedDate);
  const growthDays  = masterPlant?.growthDays || 90;
  
  // Progress = combination of days elapsed + journal activity bonus
  // Each journal entry = 1 bonus day (max 20% bonus)
  const journalCount   = journals?.length ?? 0;
  const journalBonus   = Math.min(journalCount * 2, Math.round(growthDays * 0.2));
  const effectiveDays  = days + journalBonus;
  const progressPct    = Math.min(100, Math.round((effectiveDays / growthDays) * 100));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const currentMonth = new Date().getMonth();
  const bars = months.map((month, i) => ({
    month,
    value: Math.round(20 + Math.sin((i / 6) * Math.PI) * 70),
    active: i === Math.min(currentMonth, 6),
  }));
  const maxVal = Math.max(...bars.map((b) => b.value));

  const statCards = [
    {
      icon: MdOpacity,
      label: 'Watering',
      value: masterPlant?.wateringFrequency ? `Every ${masterPlant.wateringFrequency}d` : '—',
      iconColor: 'text-sky-500',
      bg: 'bg-sky-50',
    },
    {
      icon: MdWbSunny,
      label: 'Sunlight',
      value: masterPlant?.sunlight ? sunlightLabel(masterPlant.sunlight) : '—',
      iconColor: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      icon: MdThermostat,
      label: 'Fertilize',
      value: masterPlant?.fertilizerFrequency ? `Every ${masterPlant.fertilizerFrequency}d` : '—',
      iconColor: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: MdTimeline,
      label: 'Maturity',
      value: masterPlant?.growthDays ? `${masterPlant.growthDays} days` : '—',
      iconColor: 'text-violet-500',
      bg: 'bg-violet-50',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Progress + Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Growth Progress Card */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col gap-5">

          {/* Top: percentage */}
          <div>
            <p className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-2">Growth Progress</p>
            <p className="text-4xl font-extrabold text-zinc-900 tracking-tight">
              {journalCount === 0 && days === 0 ? 'Day 1' : `${progressPct}%`}
            </p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              {journalCount === 0 && days === 0
                ? 'Add journal entries to track progress'
                : `${days} days · ${journalCount} log${journalCount !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Progress bar */}
          <div>
            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.max(progressPct, journalCount > 0 ? 2 : 0)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-zinc-400 font-semibold">Planted</span>
              <span className="text-[10px] text-zinc-400 font-semibold">Mature</span>
            </div>
          </div>

          {/* Journal bonus indicator */}
          {journalCount > 0 && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
              <MdEditNote className="text-emerald-600 text-sm flex-shrink-0" />
              <span className="text-xs font-semibold text-emerald-700">
                +{journalBonus} days from {journalCount} log{journalCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Planted date */}
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2">
            <MdCalendarToday className="text-emerald-600 text-sm flex-shrink-0" />
            <span className="text-xs font-semibold text-zinc-500">
              Planted {formatDate(userPlant?.plantedDate)}
            </span>
          </div>
        </div>

        {/* Growth Trajectory Chart */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-1">Growth Trajectory</p>
              <p className="text-lg font-extrabold text-zinc-900 tracking-tight">Monthly Overview</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                This month
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-100 inline-block" />
                Previous
              </span>
            </div>
          </div>

          <div className="flex items-end gap-2 h-36">
            {bars.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className={`text-[9px] font-bold ${bar.active ? 'text-emerald-600' : 'text-transparent'}`}>
                  {bar.value}%
                </span>
                <div className="w-full flex items-end" style={{ height: '88px' }}>
                  <div
                    className={`w-full rounded-md transition-all duration-500 ${
                      bar.active ? 'bg-emerald-500' : 'bg-emerald-100 hover:bg-emerald-300'
                    }`}
                    style={{ height: `${(bar.value / maxVal) * 100}%` }}
                  />
                </div>
                <span className={`text-[9px] font-bold ${bar.active ? 'text-emerald-600' : 'text-zinc-400'}`}>
                  {bar.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, iconColor, bg }) => (
          <div key={label} className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-100">
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`text-base ${iconColor}`} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">{label}</p>
              <p className="text-sm font-bold text-zinc-900 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Care tip + Plant image row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 bg-zinc-900 text-white rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center gap-2">
            <MdAutoAwesome className="text-emerald-400 text-sm flex-shrink-0" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">AI Care Tip</span>
          </div>
          <p className="text-sm font-extrabold text-white tracking-tight leading-snug">
            {masterPlant?.name || 'Your Plant'} Care Guide
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
            {masterPlant?.description || 'Keep monitoring your plant and check back for personalised care tips!'}
          </p>
          <IoLeaf className="absolute -bottom-3 -right-3 text-[70px] text-white/5 pointer-events-none" />
        </div>

        {userPlant?.imageUrl || userPlant?.imageUrl !== undefined ? (
          
          <div className="relative group rounded-2xl overflow-hidden border border-zinc-200" style={{ height: '130px' }}>
           
            <img
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={userPlant.imageUrl }
              alt={userPlant.nickname || 'Plant photo'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex items-end">
              <span className="text-white text-[10px] font-semibold">
                Planted {formatDate(userPlant.plantedDate)}
              </span>
            </div>
            
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center gap-2 text-center p-4" style={{ height: '130px' }}>
            <MdSpa className="text-2xl text-zinc-300" />
            <p className="text-xs text-zinc-400 font-medium">No photo yet</p>
          </div>
        )}
      </div>
    </div>
  );
}