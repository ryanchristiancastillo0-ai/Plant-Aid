import { useState, useEffect, useRef,} from 'react';
import { MdAdd,MdExpandMore, } from 'react-icons/md';
import { IoLeaf } from 'react-icons/io5';
import { FaSeedling } from 'react-icons/fa6';

export default function PlantSelector({ plants, selectedId, onSelect, customPlant, onCustomChange, loadingPlants }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = plants.find((p) => p.id === selectedId);
  const isCustom = selectedId === '__custom__';
  const label = isCustom
    ? (customPlant || 'Custom plant')
    : selected?.nickname || selected?.name || 'Select Plant';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loadingPlants}
        className="flex items-center gap-1.5 px-4 py-1.5 bg-[#a6f2d1] text-[#237157] rounded-full hover:bg-[#00513b] hover:text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <FaSeedling className="text-sm" />
        <span className="text-sm font-semibold truncate max-w-[140px]">
          {loadingPlants ? 'Loading…' : label}
        </span>
        <MdExpandMore className="text-base flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#c8c5ca] z-20 overflow-hidden">
          {/* No plant */}
          <div
            onClick={() => { onSelect(''); setOpen(false); }}
            className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center gap-2 ${
              !selectedId ? 'bg-[#a6f2d1]/30 text-[#1b6b51] font-semibold' : 'hover:bg-zinc-50 text-[#47464a]'
            }`}
          >
            <IoLeaf className="text-[#1b6b51] text-sm" />
            No plant linked
          </div>

          {/* Existing plants */}
          {plants.length === 0 ? (
            <div className="px-4 py-3 text-sm text-zinc-400 italic">No plants in your garden yet.</div>
          ) : (
            plants.map((plant) => (
              <div
                key={plant.id}
                onClick={() => { onSelect(plant.id); setOpen(false); }}
                className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                  selectedId === plant.id
                    ? 'bg-[#a6f2d1]/30 text-[#1b6b51] font-semibold'
                    : 'hover:bg-zinc-50 text-black'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 overflow-hidden flex-shrink-0">
                  {plant.imageUrl
                    ? <img src={plant.imageUrl} alt="" className="w-full h-full object-cover" />
                    : <IoLeaf className="text-emerald-400 text-xs m-auto mt-1" />
                  }
                </div>
                <span className="truncate">{plant.nickname || 'My Plant'}</span>
                {plant.currentStage && (
                  <span className="ml-auto text-[10px] text-zinc-400 truncate">{plant.currentStage}</span>
                )}
              </div>
            ))
          )}

          {/* Divider */}
          <div className="h-px bg-zinc-100 mx-3" />

          {/* Custom option */}
          <div
            onClick={() => { onSelect('__custom__'); setOpen(false); }}
            className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center gap-2 ${
              isCustom ? 'bg-[#a6f2d1]/30 text-[#1b6b51] font-semibold' : 'hover:bg-zinc-50 text-[#47464a]'
            }`}
          >
            <MdAdd className="text-base" />
            Type a custom plant name
          </div>
        </div>
      )}

      {/* Custom text input — shown below pill when __custom__ selected */}
      {isCustom && (
        <input
          type="text"
          value={customPlant}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="e.g. Monstera Deliciosa"
          autoFocus
          style={{ fontSize: '16px' }}
          className="mt-2 w-full px-3 py-2 bg-white border border-[#c8c5ca] rounded-xl text-sm text-black outline-none focus:border-[#1b6b51] transition-colors"
        />
      )}
    </div>
  );
}