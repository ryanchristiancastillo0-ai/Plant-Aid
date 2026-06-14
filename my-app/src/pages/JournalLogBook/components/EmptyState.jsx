

// React Icons
import { MdSearch, MdAdd,} from 'react-icons/md';

import { FaSeedling } from 'react-icons/fa6';



export default function EmptyState({ isFiltered, onNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center space-y-4 col-span-full">
      <div className="w-16 h-16 rounded-2xl bg-[#a6f2d1]/40 flex items-center justify-center">
        {isFiltered
          ? <MdSearch   className="text-3xl text-[#1b6b51]" />
          : <FaSeedling className="text-3xl text-[#1b6b51]" />
        }
      </div>
      <div className="space-y-1">
        <p className="text-base font-bold text-[#1a1b22]">
          {isFiltered ? 'No entries found' : 'No journal entries yet'}
        </p>
        <p className="text-sm text-[#47464a] max-w-xs">
          {isFiltered
            ? 'Try a different search term.'
            : 'Start documenting your botanical journey.'}
        </p>
      </div>
      {!isFiltered && (
      <button
  onClick={onNew}
  className="mt-2 bg-black text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:scale-[0.98] transition-transform flex items-center justify-center gap-2 w-full sm:w-auto"
>
  <MdAdd className="text-lg" />
  <p>New Entry</p>
</button>
      )}
    </div>
  );
}