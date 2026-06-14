import { useState, useEffect} from 'react';
import * as Md from 'react-icons/md';
import {
  fetchWeather,
  getUserLocation,
  getBotanicalInsight,
} from '../../DashboardToday/services/DashboardServices.js';

export default function WeatherStrip() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { lat, lon } = await getUserLocation();
        setWeather(await fetchWeather(lat, lon));
      } catch (err) {
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="h-10 bg-white rounded-xl border border-[#c8c5ca]/40 animate-pulse" />;
  if (!weather) return null;

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-[#c8c5ca]/40 px-4 py-2.5 text-xs">
      <div className="flex items-center gap-1.5 font-bold text-black">
        {weather.isRainy ? <Md.MdUmbrella className="text-sky-500 text-sm" /> : weather.isSunny ? <Md.MdWbSunny className="text-amber-400 text-sm" /> : <Md.MdCloud className="text-zinc-400 text-sm" />}
        {weather.temp}°C
      </div>
      <span className="text-[#47464a] capitalize hidden sm:block">{weather.description}</span>
      <span className="text-[#c8c5ca] hidden sm:block">·</span>
      <span className="text-[#47464a] flex items-center gap-1 hidden sm:flex"><Md.MdWaterDrop className="text-sky-400" />{weather.humidity}%</span>
      <span className="text-[#47464a] flex items-center gap-1 hidden sm:flex"><Md.MdAir className="text-teal-400" />{weather.wind} m/s</span>
      <span className="text-[#c8c5ca] hidden md:block">·</span>
      <p className="text-[#1b6b51] font-medium hidden md:block line-clamp-1 flex-1">{getBotanicalInsight(weather)}</p>
    </div>
  );
}
