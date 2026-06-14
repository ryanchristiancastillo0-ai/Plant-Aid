

import { FaSeedling } from 'react-icons/fa6';

export default function EmptyState({ query, category }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
        <FaSeedling className="text-3xl text-emerald-300" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-bold text-zinc-700">No plants found</p>
        <p className="text-sm text-zinc-400 max-w-xs">
          {query
            ? `No results for "${query}". Try a different name or scientific name.`
            : `No plants in the "${category}" category yet.`}
        </p>
      </div>
    </div>
  );
}