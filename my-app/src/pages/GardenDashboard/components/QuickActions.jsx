
import * as Md from 'react-icons/md';


export default function QuickActions({ onClimate, navigate }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Climate */}
      <button
        onClick={onClimate}
        className="bg-black text-white rounded-2xl p-4 relative overflow-hidden group hover:ring-2 hover:ring-[#1b6b51] transition-all text-left"
      >
        <Md.MdThermostat className="absolute -bottom-3 -right-3 text-7xl text-white/5 group-hover:scale-110 transition-transform duration-500" />
        <div className="relative z-10">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center mb-3">
            <Md.MdThermostat className="text-white text-sm" />
          </div>
          <p className="text-sm font-bold">Climate</p>
          <p className="text-white/50 text-[11px] mt-0.5">Live env. data →</p>
        </div>
      </button>

      {/* Diagnostic Scan */}
      <button
        onClick={() => navigate('/diagnostic-scan')}
        className="bg-[#a6f2d1] rounded-2xl p-4 group hover:bg-[#1b6b51] hover:text-white transition-all duration-300 text-left"
      >
        <div className="w-8 h-8 rounded-xl bg-white/60 group-hover:bg-white/20 flex items-center justify-center mb-3 transition-colors">
          <Md.MdCenterFocusStrong className="text-[#1b6b51] group-hover:text-white text-sm transition-colors" />
        </div>
        <p className="text-sm font-bold text-[#1b6b51] group-hover:text-white transition-colors">AI Scan</p>
        <p className="text-[#237157]/70 group-hover:text-white/70 text-[11px] mt-0.5 transition-colors">Identify plant →</p>
      </button>
    </div>
  );
}