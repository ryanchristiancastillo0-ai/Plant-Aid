import { useState, useEffect } from 'react';
import {FALLBACK_IMAGE} from '../constant/collection.js'

export default function FeaturedPlantCard({ plant, navigate }) {
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [plant?.id]);

  const imgSrc    = (!plant?.imageUrl || imgError) ? FALLBACK_IMAGE : plant.imageUrl;
  const plantName = plant?.nickname     || 'Your Garden';
  const stage     = plant?.currentStage || '';

  return (
    <div
      onClick={() => plant && navigate(`/plants/${plant.plantId}`)}
      className={`relative overflow-hidden rounded-2xl shadow-md ${plant ? 'cursor-pointer group' : ''}`}
      style={{ height: '320px' }}
    >
      <img
        alt={plantName}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        src={imgSrc}
        onError={() => setImgError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 p-5 text-white">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="bg-[#1b6b51] px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">Plant Health</span>
          {stage && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 border border-white/30 text-white uppercase">{stage}</span>
          )}
        </div>
        <h3 className="text-2xl font-extrabold tracking-tight leading-tight">{plantName}</h3>
        {plant && <p className="text-white/70 text-xs mt-1">Tap to view full details <span className="text-[#a6f2d1]">→</span></p>}
      </div>
    </div>
  );
}