import React from 'react';
import { MdEco, MdVerifiedUser, MdLibraryAdd } from 'react-icons/md';



export default function ScanSuccessModal({ isOpen, onClose, onSave, plantData }) {
  if (!isOpen) return null;

  // Use real data passed in, with fallbacks
  const plantInfo = {
    name: plantData?.commonName || 'Unknown Plant',
    scientificName: plantData?.scientificName || '',
    imageSrc: plantData?.imageSrc || '',
    confidence: plantData?.confidence || 0,
    healthStatus: plantData?.healthStatus || 'Unknown',
    anomalies: plantData?.anomalies || 'None',
  };

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (plantInfo.confidence / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 antialiased font-sans">
      <div className="absolute inset-0" onClick={onClose} />
      {/* Added max-h-[95vh] and overflow-y-auto for short screen scrolling */}
      <div className="relative w-full max-w-xl max-h-[95vh] overflow-y-auto bg-white rounded-3xl p-6 md:p-8 border border-[#c8c5ca] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Added z-20 to ensure it stays above stacked content */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 text-gray-400 hover:text-black font-bold text-xl px-2">
          ✕
        </button>

        {/* Plant header: Switched to flex-col on mobile, flex-row on sm screens. Added top margin for mobile close button clearance. */}
        <section className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6 mb-6 mt-6 sm:mt-0">
          <div className="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border border-[#c8c5ca] bg-zinc-100">
            {plantInfo.imageSrc
              ? <img className="w-full h-full object-cover" src={plantInfo.imageSrc} alt={plantInfo.name} />
              : <div className="w-full h-full flex items-center justify-center text-zinc-300 text-4xl">🌿</div>
            }
          </div>
          {/* Alignment wrapper for text */}
          <div className="flex flex-col justify-center items-center sm:items-start">
            <h2 className="text-2xl font-bold text-black">{plantInfo.name}</h2>
            <p className="text-lg text-[#1b6b51] font-medium italic">{plantInfo.scientificName}</p>
          </div>
        </section>

        {/* Confidence ring */}
        <section className="flex flex-col items-center justify-center mb-8 sm:mb-10">
          <div className="relative flex items-center justify-center">
            <svg className="w-48 h-48 -rotate-90">
              <circle className="text-[#eeedf7]" cx="96" cy="96" fill="transparent" r={radius} stroke="currentColor" strokeWidth="12" />
              <circle cx="96" cy="96" fill="transparent" r={radius} stroke="#1b6b51" strokeLinecap="round" strokeWidth="12"
                style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 1.5s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-[#1b6b51]">{plantInfo.confidence}%</span>
              <span className="text-xs text-[#47464a] uppercase tracking-wider font-semibold">Confidence Match</span>
            </div>
          </div>
        </section>

        {/* Health metrics */}
        <section className="space-y-3 mb-6">
          <div className="flex items-center p-3 bg-[#a6f2d1]/20 rounded-xl border border-[#a6f2d1]/30">
            <div className="w-10 h-10 rounded-lg bg-[#a6f2d1] flex items-center justify-center mr-3 flex-shrink-0">
              <MdEco className="text-[24px] text-[#00513b]" />
            </div>
            <div>
              <p className="text-xs text-[#47464a]">Health Status</p>
              <p className="text-lg font-bold text-[#00513b]">{plantInfo.healthStatus}</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-[#f4f2fd] rounded-xl border border-[#c8c5ca]">
            <div className="w-10 h-10 rounded-lg bg-[#e3e1ec] flex items-center justify-center mr-3 flex-shrink-0">
              <MdVerifiedUser className="text-[24px] text-[#47464a]" />
            </div>
            <div>
              <p className="text-xs text-[#47464a]">Detected Anomalies</p>
              <p className="text-lg font-bold text-black">{plantInfo.anomalies}</p>
            </div>
          </div>
        </section>

        {/* Save button */}
        <footer>
          <button onClick={onSave}
            className="w-full bg-black text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all duration-200">
            <MdLibraryAdd className="text-[22px]" />
            <span className="truncate">Save to My Garden Catalog</span>
          </button>
        </footer>
      </div>
    </div>
  );
}