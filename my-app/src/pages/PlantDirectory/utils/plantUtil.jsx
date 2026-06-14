import {MdOutlineEco, MdWbSunny} from 'react-icons/md'

export  function CareBadge({ level }) {
  const isModerate = level === 'Moderate';
  const isHigh     = level === 'High Maintenance';
  const cls = isHigh
    ? 'bg-red-50 text-red-700 border-red-100'
    : isModerate
      ? 'bg-amber-50 text-amber-700 border-amber-100'
      : 'bg-emerald-50 text-emerald-700 border-emerald-100';

  return (
    <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${cls}`}>
      <MdOutlineEco className="text-[13px]" />
      {level}
    </span>
  );
}

export  function SunBadge({ label }) {
  return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500">
      <MdWbSunny className="text-amber-400 text-[14px]" />
      {label}
    </span>
  );
}
