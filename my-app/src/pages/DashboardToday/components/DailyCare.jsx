
import {ReminderIcon,formatTime,} from '../utils/reminderUtils.jsx'

import { IoLeaf } from 'react-icons/io5';


export default function DailyCare({ todayReminders = [], onComplete }) {
  const doneCount = todayReminders.filter(r => r.status === 'COMPLETED').length;

  return (
    <section className="col-span-12 md:col-span-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-700 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-100 dark:hover:shadow-zinc-900/30">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-zinc-900">Daily Care</h3>
        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
          {doneCount}/{todayReminders.length} Done
        </span>
      </div>

      {todayReminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-center space-y-2">
          <IoLeaf className="text-3xl text-emerald-200" />
          <p className="text-sm text-zinc-400">All clear! No tasks for today.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayReminders.map((task) => {
            const isChecked = task.status === 'COMPLETED';
            return (
              <label
                key={task.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                  isChecked ? 'bg-zinc-50 border-transparent' : 'border-zinc-200 hover:border-emerald-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => !isChecked && onComplete(task.id)}
                  className="w-5 h-5 rounded-full border-zinc-300 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <span className={`block text-sm font-medium truncate transition-all ${
                    isChecked ? 'line-through text-zinc-400' : 'text-zinc-700'
                  }`}>
                    {task.title}
                  </span>
                  <span className="text-[11px] text-zinc-400">{formatTime(task.reminderDate)}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ReminderIcon type={task.type} className="text-lg" />
                </div>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
}
