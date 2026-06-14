
import { MdArrowForward,} from 'react-icons/md';
import { IoLeaf } from 'react-icons/io5';

import {CATEGORY_ICONS,DIFFICULTY_CONFIG,} from '../constant/tip'


export default function GridTipCard({ tip, onDeepDive }) {
  const Icon       = CATEGORY_ICONS[tip.category] || IoLeaf;
  const difficulty = DIFFICULTY_CONFIG[tip.difficulty] || DIFFICULTY_CONFIG.Beginner;

  return (
    <div className="bg-white border border-[#c8c5ca]/30 rounded-3xl p-5 flex flex-col shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)] hover:border-[#1b6b51] hover:shadow-[0_8px_24px_-6px_rgba(27,107,81,0.10)] transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-[#a6f2d1] rounded-xl flex items-center justify-center group-hover:bg-[#1b6b51] transition-colors duration-300">
          <Icon className="text-[#237157] text-lg group-hover:text-white transition-colors duration-300" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="bg-[#8bd6b6]/20 text-[#00513b] text-[10px] px-2.5 py-0.5 rounded-full font-semibold">
            {tip.category}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${difficulty.bg} ${difficulty.text} ${difficulty.border}`}>
            {tip.difficulty}
          </span>
        </div>
      </div>
      <h3 className="text-sm font-bold text-black tracking-tight leading-snug mb-2 line-clamp-2">{tip.title}</h3>
      <p className="text-xs text-[#47464a] leading-relaxed flex-1 mb-3 line-clamp-3">{tip.summary}</p>
      {tip.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tip.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[9px] bg-[#f0faf5] text-[#1b6b51] px-1.5 py-0.5 rounded-full border border-[#a6f2d1]/40 font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="border-t border-[#c8c5ca]/20 pt-3 flex items-center justify-between">
        <button
          onClick={() => onDeepDive(tip)}
          className="text-[#1b6b51] text-xs font-bold inline-flex items-center gap-1 hover:opacity-70 transition-opacity"
        >
          Deep Dive <MdArrowForward className="text-sm" />
        </button>
        {tip.views > 0 && <span className="text-[9px] text-[#47464a]/50">{tip.views} views</span>}
      </div>
    </div>
  );
}