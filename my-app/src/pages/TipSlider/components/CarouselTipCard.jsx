
import {MdArrowForward,} from 'react-icons/md';
import { IoLeaf } from 'react-icons/io5';
import {CATEGORY_ICONS,DIFFICULTY_CONFIG,} from '../constant/tip'
export default function CarouselTipCard({ tip, onDeepDive }) {
  const Icon       = CATEGORY_ICONS[tip.category] || IoLeaf;
  const difficulty = DIFFICULTY_CONFIG[tip.difficulty] || DIFFICULTY_CONFIG.Beginner;

  return (
    <div className="min-w-[260px] md:min-w-[360px] snap-start flex-shrink-0">
      <div className="bg-white border border-[#c8c5ca]/30 rounded-3xl p-6 h-full flex flex-col shadow-[0_8px_24px_-8px_rgba(0,0,0,0.06)] hover:border-[#1b6b51] transition-colors duration-300">
        <div className="flex items-start justify-between mb-5">
          <div className="w-12 h-12 bg-[#a6f2d1] rounded-xl flex items-center justify-center">
            <Icon className="text-[#237157] text-2xl" />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="bg-[#8bd6b6]/20 text-[#00513b] text-xs px-3 py-1 rounded-full font-medium">
              {tip.category}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${difficulty.bg} ${difficulty.text} ${difficulty.border}`}>
              {tip.difficulty}
            </span>
          </div>
        </div>
        <h3 className="text-lg font-bold text-black tracking-tight leading-snug mb-2">{tip.title}</h3>
        <p className="text-sm text-[#47464a] leading-relaxed flex-1 mb-4">{tip.summary}</p>
        {tip.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tip.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] bg-[#f0faf5] text-[#1b6b51] px-2 py-0.5 rounded-full border border-[#a6f2d1]/40 font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="border-t border-[#c8c5ca]/20 pt-4 flex items-center justify-between">
          <button
            onClick={() => onDeepDive(tip)}
            className="text-[#1b6b51] text-sm font-bold inline-flex items-center gap-1 hover:opacity-70 transition-opacity"
          >
            Deep Dive <MdArrowForward className="text-base" />
          </button>
          {tip.views > 0 && <span className="text-[10px] text-[#47464a]/60">{tip.views} views</span>}
        </div>
      </div>
    </div>
  );
}