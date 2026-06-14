
import { IoLeaf } from 'react-icons/io5';
export default function Toast({ message, visible }) {
  return (
    <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
    }`}>
      <div className="bg-zinc-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2">
        <IoLeaf className="text-emerald-400" />
        {message}
      </div>
    </div>
  );
}
