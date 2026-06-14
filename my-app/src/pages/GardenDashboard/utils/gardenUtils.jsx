import * as Md from 'react-icons/md';

export function formatTime(ts) {
  if (!ts) return '';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function getReminderMeta(type, completed) {
  const done = completed === true || completed === 'COMPLETED';
  switch (type) {
    case 'WATER':     return { Icon: Md.MdWaterDrop,  color: done ? 'text-zinc-300' : 'text-sky-500'    };
    case 'FERTILIZE': return { Icon: Md.MdScience,     color: done ? 'text-zinc-300' : 'text-amber-500'  };
    case 'REPOT':     return { Icon: Md.MdOutlinePark, color: done ? 'text-zinc-300' : 'text-lime-600'   };
    default:          return { Icon: Md.MdBolt,        color: done ? 'text-zinc-300' : 'text-purple-500' };
  }
}

export function isReminderDone(r) {
  if (typeof r.completed === 'boolean') return r.completed;
  return r.status === 'COMPLETED';
}
