
import { useNavigate } from 'react-router-dom';
import {
  careLevel,
  sunlightLabel,
} from '../services/PlantService';
import {MdWaterDrop, MdCheckCircle,  MdAddCircleOutline,} from 'react-icons/md';
import {CareBadge,SunBadge} from '../utils/plantUtil'


export default function PlantRow({ plant, isAdded, isToggling, onToggleGarden }) {
  const level   = careLevel(plant.wateringFrequency);
  const sunLabel = sunlightLabel(plant.sunlight);
  const navigate = useNavigate();
  const fallbackImage = 'https://placehold.co/150x150/ecfdf5/10b981?text=Plant';

  return (
    <div
      className={`flex flex-col md:flex-row items-center justify-between bg-white border p-4 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.01)] transition-all hover:border-neutral-300 hover:-translate-y-0.5 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] ${
        isAdded ? 'border-emerald-300/60' : 'border-neutral-200/60'
      }`}
    >
      {/* Left – avatar + name */}
      <div className="flex items-center gap-4 w-full md:w-2/5 cursor-pointer"
       onClick={() => navigate(`/plants/${plant.id}`)}
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex-shrink-0 overflow-hidden border border-zinc-100">
          <img 
            className="w-full h-full object-cover" 
            src={plant.imageUrl || fallbackImage} 
            alt={plant.name}
            onError={(e) => {
              e.target.onerror = null; // Prevents infinite looping if placeholder fails
              e.target.src = fallbackImage;
            }} 
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-zinc-900 tracking-tight leading-tight truncate">{plant.name}</span>
          <span className="text-xs italic text-zinc-400 font-medium truncate">{plant.scientificName}</span>
          {plant.description ? (
            <span className="text-[11px] text-zinc-400 truncate mt-0.5 max-w-[220px]">{plant.description}</span>
          ) : null}
        </div>
      </div>

      {/* Mid – care + sun badges */}
      <div className="flex items-center gap-3 py-3 md:py-0 w-full md:w-1/3 justify-start md:justify-center flex-wrap">
        <CareBadge level={level} />
        <SunBadge  label={sunLabel} />
        {plant.wateringFrequency > 0 && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400">
            <MdWaterDrop className="text-sky-400 text-[13px]" />
            Every {plant.wateringFrequency}d
          </span>
        )}
      </div>

      {/* Right – CTA */}
      <div className="w-full md:w-auto">
        <button
          disabled={isToggling}
          onClick={() => onToggleGarden(plant)}
          className={`w-full md:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
            isAdded
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-zinc-950 text-white hover:bg-zinc-800'
          }`}
        >
          {isToggling ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isAdded ? (
            <>
              <MdCheckCircle className="text-[17px]" />
              <span>In Garden</span>
            </>
          ) : (
            <>
              <MdAddCircleOutline className="text-[17px]" />
              <span>Add to Garden</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}