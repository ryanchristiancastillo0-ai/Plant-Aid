import {  useEffect } from 'react';
import { MdClose,MdRemoveRedEye,} from 'react-icons/md';
import { IoLeaf } from 'react-icons/io5';
import {CATEGORY_ICONS,DIFFICULTY_CONFIG} from '../constant/tip'

export default function DeepDiveModal({ tip, onClose }) {
  const Icon       = CATEGORY_ICONS[tip.category] || IoLeaf;
  const difficulty = DIFFICULTY_CONFIG[tip.difficulty] || DIFFICULTY_CONFIG.Beginner;

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    // Prevent body scroll while modal open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdrop}
    >
      <div className="relative w-full sm:max-w-2xl bg-white dark:bg-[#1a1a1a] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-4 duration-300">

        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-zinc-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-4 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 bg-[#a6f2d1] rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="text-[#237157] text-xl" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="bg-[#8bd6b6]/20 text-[#00513b] text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  {tip.category}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${difficulty.bg} ${difficulty.text} ${difficulty.border}`}>
                  {tip.difficulty}
                </span>
              </div>
              <h2 className="text-base font-bold text-black dark:text-white tracking-tight leading-snug line-clamp-2">
                {tip.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 flex items-center justify-center transition-colors"
          >
            <MdClose className="text-lg text-zinc-600" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Cover image */}
          {tip.imageUrl && (
            <img
              src={tip.imageUrl}
              alt={tip.title}
              className="w-full h-48 object-cover rounded-2xl"
            />
          )}

          {/* Summary */}
          <div className="bg-[#f0faf5] rounded-2xl px-4 py-3 border border-[#a6f2d1]/40">
            <p className="text-sm text-[#1b6b51] font-medium leading-relaxed">{tip.summary}</p>
          </div>

          {/* Full content */}
          {tip.content && (
            <div>
              <h3 className="text-xs font-bold text-black/40 dark:text-gray-400 uppercase tracking-widest mb-3">Full Guide</h3>
              <p className="text-sm text-[#47464a] leading-relaxed whitespace-pre-line">{tip.content}</p>
            </div>
          )}

          {/* Tags */}
          {tip.tags?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-black/40 dark:text-gray-400 uppercase tracking-widest mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {tip.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-[#f0faf5] text-[#1b6b51] px-2.5 py-1 rounded-full border border-[#a6f2d1]/40 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related plants */}
          {tip.relatedPlants?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-black/40 dark:text-gray-400 uppercase tracking-widest mb-2">Related Plants</h3>
              <div className="flex flex-wrap gap-1.5">
                {tip.relatedPlants.map((plant) => (
                  <span key={plant} className="text-xs bg-zinc-50 text-zinc-600 px-2.5 py-1 rounded-full border border-zinc-200 font-medium flex items-center gap-1">
                    <IoLeaf className="text-[#1b6b51] text-xs" /> {plant}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Views */}
          {tip.views > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <MdRemoveRedEye className="text-sm" />
              {tip.views.toLocaleString()} gardeners found this helpful
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100">
          <button
            onClick={onClose}
            className="w-full bg-black text-white rounded-xl py-3.5 font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
}
