import{ useState } from 'react';
import {MdAir,MdClose,} from 'react-icons/md';


export default function HighWindAlert({ weather }) {
  const [dismissed, setDismissed] = useState(false);
  const isHighWind = weather && weather.wind >= 7;
  if (!isHighWind || dismissed) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
      <div className="bg-amber-100 p-2 rounded-lg flex-shrink-0">
        <MdAir className="text-amber-900 text-xl animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-amber-900 mb-1">
          High Wind Alert{weather.cityName ? `: ${weather.cityName}` : ''} · {weather.wind} m/s
        </h3>
        <p className="text-amber-800 text-xs leading-relaxed">
          Sustained gusts detected. Secure lightweight container plants and deploy physical shielding for delicate ferns or broad-leaf specimens.
        </p>
      </div>
      <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-700 transition-colors flex-shrink-0 mt-0.5">
        <MdClose className="text-xl" />
      </button>
    </div>
  );
}
