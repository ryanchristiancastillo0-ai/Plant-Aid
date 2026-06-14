export default function HealthBadge({ status }) {
  const map = {
    HEALTHY: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    WARNING: 'bg-amber-50   text-amber-700   border-amber-100',
    SICK:    'bg-red-50     text-red-700     border-red-100',
  };
  return (
    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${map[status] ?? map.HEALTHY}`}>
      {status}
    </span>
  );
}