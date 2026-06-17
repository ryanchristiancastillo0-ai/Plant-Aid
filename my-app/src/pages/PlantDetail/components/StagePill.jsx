export default function StagePill({ stage }) {
  const map = {
    'Early Growth':      'bg-sky-50 text-sky-700 border-sky-100',
    'Vegetative Growth': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Flowering':         'bg-pink-50 text-pink-700 border-pink-100',
    'Fruit Formation':   'bg-orange-50 text-orange-700 border-orange-100',
    'Mature Fruiting':   'bg-amber-50 text-amber-700 border-amber-100',
  };
  const cls = map[stage] || 'bg-zinc-100 text-zinc-600 border-zinc-200';
  return (
    <span className={`border text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${cls}`}>
      {stage || 'Growing'}
    </span>
  );
}