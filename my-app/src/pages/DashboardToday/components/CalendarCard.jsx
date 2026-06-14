import {ReminderIcon,formatTime,} from '../utils/reminderUtils.jsx'

export default function CalendarCard({ todayReminders = [] }) {
  const today    = new Date();
  const todayNum = today.getDate();
  const dayLabels   = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const startOfWeek = new Date(today);
  const jsDay       = today.getDay();
  const diffToMon   = jsDay === 0 ? -6 : 1 - jsDay;
  startOfWeek.setDate(today.getDate() + diffToMon);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return {
      label:  dayLabels[i],
      num:    d.getDate(),
      active: d.getDate() === todayNum && d.getMonth() === today.getMonth(),
    };
  });

  return (
    <section className="col-span-12 md:col-span-4 bg-white rounded-3xl border border-zinc-200 p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-zinc-900">This Week</h3>
        <span className="text-zinc-400 text-sm">
          {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      <div className="flex justify-between items-center gap-1">
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center flex-1 py-2 rounded-xl relative transition-colors cursor-pointer select-none ${
              day.active
                ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/20'
                : 'hover:bg-zinc-50 text-zinc-600'
            }`}
          >
            <span className={`text-[10px] ${day.active ? 'opacity-80' : 'text-zinc-400'}`}>{day.label}</span>
            <span className="text-sm font-bold mt-0.5">{day.num}</span>
            {day.active && todayReminders.length > 0 && (
              <div className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-100 space-y-2">
        {todayReminders.length === 0 ? (
          <p className="text-sm text-zinc-400">No reminders scheduled for today.</p>
        ) : (
          todayReminders.slice(0, 3).map((r) => (
            <div key={r.id} className="flex items-center gap-2">
              <ReminderIcon type={r.type} className="text-base" />
              <span className="text-sm text-zinc-600 truncate">
                {r.title} · <span className="text-zinc-400">{formatTime(r.reminderDate)}</span>
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
