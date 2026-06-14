import {
  MdWaterDrop,

  MdOutlineScience,
  MdBolt,

} from 'react-icons/md';


import {  FaSeedling } from 'react-icons/fa6';
export function formatTime(ts) {
  if (!ts) return '--:--';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDate(ts) {
  if (!ts) return '';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ReminderIcon({ type, className = '' }) {
  switch (type) {
    case 'WATER':     return <MdWaterDrop     className={`text-sky-500    ${className}`} />;
    case 'FERTILIZE': return <MdOutlineScience className={`text-amber-500  ${className}`} />;
    case 'REPOT':     return <FaSeedling       className={`text-lime-600   ${className}`} />;
    default:          return <MdBolt           className={`text-purple-500 ${className}`} />;
  }
}

export function reminderBadgeClass(type) {
  switch (type) {
    case 'WATER':     return 'bg-sky-50    text-sky-700    border-sky-100';
    case 'FERTILIZE': return 'bg-amber-50  text-amber-700  border-amber-100';
    case 'REPOT':     return 'bg-lime-50   text-lime-700   border-lime-100';
    default:          return 'bg-purple-50 text-purple-700 border-purple-100';
  }
}
