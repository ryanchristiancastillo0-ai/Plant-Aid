
import { MdWaterDrop} from 'react-icons/md';

export default function WeatherDayCard({ day, Icon, temp, humidity, isActive }) {
  return (
    <div className={`flex flex-col items-center p-3 sm:p-4 rounded-2xl border transition-all cursor-default ${
      isActive ? 'bg-[#f4f2fd] dark:bg-zinc-800 border-transparent' : 'bg-white dark:bg-zinc-900 border-[#c8c5ca]/50 dark:border-zinc-700/50 hover:border-[#1b6b51]'
    }`}>
      <span className="text-[10px] sm:text-xs text-[#47464a] uppercase font-bold tracking-wider">{day}</span>
      {Icon && <Icon className="my-1.5 sm:my-2 text-[#1b6b51] text-xl sm:text-2xl" />}
      <span className="text-sm sm:text-base font-bold">{temp}°</span>
      <div className="flex items-center gap-0.5 mt-1 text-[#47464a]">
        <MdWaterDrop className="text-xs" />
        <span className="text-[9px] sm:text-[10px] font-semibold">{humidity}</span>
      </div>
    </div>
  );
}
