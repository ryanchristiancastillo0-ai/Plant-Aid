
import * as Md from 'react-icons/md';
import { IoLeaf } from 'react-icons/io5';
import { formatTime, getReminderMeta, isReminderDone } from '../utils/gardenUtils.jsx';

export default function CareScheduleList({ reminders, onToggle, navigate }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#c8c5ca]/40 dark:border-zinc-700/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-[#1a1b22]">Care Schedule</h4>
        <button onClick={() => navigate('/reminders')} className="p-1 rounded-lg hover:bg-zinc-100 transition-colors text-[#1b6b51]">
          <Md.MdCalendarMonth className="text-base" />
        </button>
      </div>

      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center gap-1.5">
          <IoLeaf className="text-xl text-emerald-200" />
          <p className="text-xs text-zinc-400">No tasks scheduled for today.</p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {reminders.map((item) => {
            const done = isReminderDone(item);
            const { Icon, color } = getReminderMeta(item.type, done);
            return (
              <li
                key={item.id}
                onClick={() => onToggle(item)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer select-none ${
                  !done ? 'bg-[#a6f2d1]/20 hover:bg-[#a6f2d1]/30 border-l-2 border-[#1b6b51]' : 'hover:bg-zinc-50 opacity-50'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${done ? 'bg-zinc-300' : 'bg-[#1b6b51]'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${done ? 'line-through text-zinc-400' : 'text-[#1a1b22]'}`}>{item.title}</p>
                  <p className="text-[10px] text-[#47464a]">{formatTime(item.reminderDate)}</p>
                </div>
                {done
                  ? <Md.MdCheckCircle className="text-base text-emerald-500 flex-shrink-0" />
                  : <Icon className={`text-base flex-shrink-0 ${color}`} />
                }
              </li>
            );
          })}
        </ul>
      )}

      {reminders.length > 0 && (
        <button onClick={() => navigate('/reminders')} className="mt-3 w-full text-[11px] font-semibold text-[#1b6b51] hover:opacity-75 transition-opacity flex items-center justify-center gap-1 pt-2.5 border-t border-zinc-100">
          View all <Md.MdArrowForward className="text-xs" />
        </button>
      )}
    </div>
  );
}
