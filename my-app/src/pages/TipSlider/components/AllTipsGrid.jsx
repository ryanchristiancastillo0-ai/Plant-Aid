import { useState, useEffect, useMemo, } from 'react';
import { MdSearch, MdClose,} from 'react-icons/md';
import { IoLeaf } from 'react-icons/io5';
import { fetchAllTips, } from '../services/PlantTip';
import {CATEGORY_ICONS,GRID_CATEGORIES} from '../constant/tip'
import {GridTipCard,GridSkeletonCard} from './index'

export default function AllTipsGrid({ onDeepDive }) {
  const [allTips,        setAllTips]        = useState([]);
  const [gridLoading,    setGridLoading]    = useState(true);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAllTips(100);
        setAllTips(data);
      } catch (err) {
        console.error('Failed to load all tips:', err);
      } finally {
        setGridLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let result = allTips;
    if (activeCategory !== 'All') {
      result = result.filter((t) => t.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(q)   ||
          t.summary?.toLowerCase().includes(q) ||
          t.content?.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
          t.relatedPlants?.some((p) => p.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allTips, activeCategory, searchQuery]);

  return (
    <section className="mt-16">

      {/* Section Header */}
      <div className="mb-6">
        <span className="text-xs font-semibold text-black/50 dark:text-gray-400 tracking-widest uppercase">
          Browse All
        </span>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-1">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white tracking-tight">All Tips</h2>
            {!gridLoading && (
              <p className="text-base text-[#47464a] mt-1">
                {allTips.length} tips across {GRID_CATEGORIES.length - 1} categories.
              </p>
            )}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#47464a]/40 text-xl pointer-events-none" />
            <input
              type="text"
              placeholder="Search tips, tags, plants…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#c8c5ca]/60 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-black dark:text-white placeholder:text-[#47464a]/40 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#1b6b51] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#47464a]/40 hover:text-[#47464a] transition-colors"
              >
                <MdClose className="text-lg" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-5">
        {GRID_CATEGORIES.map((cat) => {
          const CatIcon = CATEGORY_ICONS[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-[#47464a] border-[#c8c5ca]/60 hover:border-[#1b6b51]/40'
              }`}
            >
              {CatIcon && <CatIcon className="text-sm" />}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      {(searchQuery || activeCategory !== 'All') && !gridLoading && (
        <p className="text-xs text-[#47464a]/60 mb-5">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          {searchQuery && <> for <span className="font-semibold text-black">"{searchQuery}"</span></>}
          {activeCategory !== 'All' && <> in <span className="font-semibold text-black">{activeCategory}</span></>}
        </p>
      )}

      {/* Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {gridLoading
          ? Array.from({ length: 8 }).map((_, i) => <GridSkeletonCard key={i} />)
          : filtered.length === 0
            ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-16 h-16 bg-[#a6f2d1]/30 rounded-2xl flex items-center justify-center">
                  <IoLeaf className="text-3xl text-[#1b6b51]" />
                </div>
                <div>
                  <p className="text-base font-bold text-black dark:text-white">No tips found</p>
                  <p className="text-sm text-[#47464a] mt-1">
                    {searchQuery
                      ? `No results for "${searchQuery}". Try a different search.`
                      : `No tips in "${activeCategory}" yet.`}
                  </p>
                </div>
              </div>
            )
            : filtered.map((tip) => <GridTipCard key={tip.id} tip={tip} onDeepDive={onDeepDive} />)
        }
      </div>

    </section>
  );
}
