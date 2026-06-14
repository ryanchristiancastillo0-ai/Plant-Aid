export default function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 flex flex-col gap-3 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgb(0,0,0,0.05)] transition-shadow">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="text-lg" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-black tracking-tight leading-none">
          {value ?? '—'}
        </p>
        <p className="text-xs text-[#47464a] mt-1 font-medium">{label}</p>
      </div>
    </div>
  );
}