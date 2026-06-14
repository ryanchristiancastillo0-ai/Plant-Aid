import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/Service/AuthContext';
import { Topbar, FullPageLoader } from '../../../components/index';

import {
  loadHistoryScreenData,
  fetchScanHistory,
  deleteScanRecord,
  deriveStatusType,
  deriveStatusLabel,
  formatScanDate,
  formatConfidenceLabel,
} from '../services/History';

import {
  MdCheckCircle,
  MdWarning,
  MdInfo,
  MdChevronRight,
  MdDeleteOutline,
  MdRefresh,
  MdHistory,
  MdOutlineHealthAndSafety,
  MdBiotech,
  MdSearchOff,
  MdFilterList,
} from 'react-icons/md';
import { IoLeaf } from 'react-icons/io5';


// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const FILTERS = ['All', 'Healthy', 'Disease Detected', 'Identified'];

const STATUS_THEMES = {
  solved: {
    card:   'hover:border-[#1b6b51]',
    badge:  'bg-[#a6f2d1] text-[#237157] border-[#a6f2d1]',
    dot:    'bg-[#1b6b51]',
    Icon:   MdCheckCircle,
  },
  danger: {
    card:   'hover:border-[#ba1a1a]',
    badge:  'bg-[#ffdad6] text-[#93000a] border-[#ffdad6]',
    dot:    'bg-[#ba1a1a]',
    Icon:   MdWarning,
  },
  neutral: {
    card:   'hover:border-[#47464a]',
    badge:  'bg-[#e8e7f1] text-[#47464a] border-[#e8e7f1]',
    dot:    'bg-[#47464a]',
    Icon:   MdInfo,
  },
};


// ─────────────────────────────────────────────────────────────
// Stats Strip
// ─────────────────────────────────────────────────────────────
function StatsStrip({ stats }) {
  const items = [
    {
      label: 'Total Scans',
      value: stats.total,
      Icon:  MdHistory,
      color: 'text-[#47464a]',
      bg:    'bg-[#e8e7f1]',
    },
    {
      label: 'Healthy',
      value: stats.healthy,
      Icon:  MdOutlineHealthAndSafety,
      color: 'text-[#237157]',
      bg:    'bg-[#a6f2d1]',
    },
    {
      label: 'Diseased',
      value: stats.diseased,
      Icon:  MdWarning,
      color: 'text-[#93000a]',
      bg:    'bg-[#ffdad6]',
    },
    {
      label: 'Identified',
      value: stats.unknown,
      Icon:  MdBiotech,
      color: 'text-[#47464a]',
      bg:    'bg-[#f4f2fd]',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {items.map(({ label, value, Icon, color, bg }) => (
        <div
          key={label}
          className="bg-white border border-neutral-200/60 rounded-2xl p-4 flex items-center gap-3 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)]"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
            <Icon className={`text-xl ${color}`} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-black leading-none">{value}</p>
            <p className="text-xs text-[#47464a] font-medium mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Filter Bar
// ─────────────────────────────────────────────────────────────
function FilterBar({ active, onChange }) {
  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <MdFilterList className="text-[#47464a] text-lg flex-shrink-0" />
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            active === f
              ? 'bg-black text-white shadow-sm'
              : 'bg-white border border-neutral-200/80 text-[#47464a] hover:border-[#1b6b51]/40'
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Scan Log Card
// ─────────────────────────────────────────────────────────────
function ScanLogCard({ record, onViewDetails, onDelete, deleting }) {
  const statusType  = deriveStatusType(record);
  const statusLabel = deriveStatusLabel(record);
  const theme       = STATUS_THEMES[statusType] || STATUS_THEMES.neutral;
  const { Icon }    = theme;

  return (
    <div
      className={`bg-white border border-neutral-200/50 rounded-[24px] p-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] flex items-center justify-between group transition-all duration-300 hover:-translate-y-0.5 ${theme.card}`}
    >
      {/* Left — avatar + info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Plant image placeholder — identificationHistory has no stored imageUrl */}
        <div className="w-14 h-14 rounded-2xl bg-[#eeedf7] flex-shrink-0 flex items-center justify-center border border-neutral-100">
          <IoLeaf className="text-2xl text-[#a6f2d1]" />
        </div>

        <div className="flex flex-col min-w-0">
          <h3 className="text-sm font-bold text-black truncate leading-tight">
            {record.commonName || 'Unknown Plant'}
          </h3>
          {record.scientificName && (
            <p className="text-xs italic text-[#47464a] truncate mt-0.5">{record.scientificName}</p>
          )}
          <p className="text-xs text-[#47464a] mt-1">{formatScanDate(record.scannedAt)}</p>
          {record.confidence != null && (
            <p className="text-[10px] text-[#47464a] opacity-60 mt-0.5">
              {formatConfidenceLabel(record.confidence)}
            </p>
          )}
        </div>
      </div>

      {/* Right — badge + actions */}
      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
        {/* Disease tag if present */}
        {record.detectedDisease?.trim() && (
          <span className="hidden md:block text-[10px] font-semibold text-[#93000a] bg-[#ffdad6] px-2 py-0.5 rounded-full max-w-[120px] truncate">
            {record.detectedDisease}
          </span>
        )}

        {/* Status badge */}
        <span
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${theme.badge}`}
        >
          <Icon className="text-sm flex-shrink-0" />
          {statusLabel}
        </span>

        {/* Delete */}
        <button
          onClick={() => onDelete(record.id)}
          disabled={deleting}
          title="Delete record"
          className="w-9 h-9 flex items-center justify-center rounded-full text-[#47464a] hover:bg-[#ffdad6] hover:text-[#93000a] transition-all duration-200 active:scale-95 disabled:opacity-40"
        >
          {deleting
            ? <span className="w-3 h-3 border-2 border-[#47464a] border-t-transparent rounded-full animate-spin" />
            : <MdDeleteOutline className="text-lg" />
          }
        </button>

        {/* View Details */}
        <button
          onClick={() => onViewDetails(record.id)}
          aria-label={`View details for ${record.commonName}`}
          className="w-9 h-9 flex items-center justify-center rounded-full text-[#47464a] hover:bg-[#eeedf7] transition-all duration-200 active:scale-95"
        >
          <MdChevronRight className="text-xl" />
        </button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────
function EmptyState({ filtered, onGoScan }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-[#eeedf7] flex items-center justify-center">
        {filtered
          ? <MdSearchOff className="text-3xl text-[#c8c5ca]" />
          : <MdHistory    className="text-3xl text-[#c8c5ca]" />
        }
      </div>
      <div>
        <p className="text-base font-bold text-black">
          {filtered ? 'No matches found' : 'No scans yet'}
        </p>
        <p className="text-sm text-[#47464a] mt-1 max-w-xs">
          {filtered
            ? 'Try a different filter to see your scan records.'
            : 'Head to the Diagnostic Scanner to identify your first plant.'}
        </p>
      </div>
      {!filtered && (
        <button
          onClick={onGoScan}
          className="mt-2 flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
        >
          <MdBiotech className="text-base" /> Go to Scanner
        </button>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Delete Confirm Modal
// ─────────────────────────────────────────────────────────────
function DeleteModal({ isOpen, onConfirm, onCancel, deleting }) {
  if (!isOpen) return null;
  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 max-w-sm w-full border border-neutral-200 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#ffdad6] flex items-center justify-center">
          <MdDeleteOutline className="text-2xl text-[#ba1a1a]" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-black">Delete Record?</h3>
          <p className="text-sm text-[#47464a] mt-1 leading-relaxed">
            This scan record will be permanently removed from your history. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          <button
            onClick={onCancel}
            className="flex-1 border border-neutral-200 text-black py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 bg-[#ba1a1a] text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {deleting
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : 'Delete'
            }
          </button>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#fbf8ff] w-full py-6 flex flex-col items-center gap-2 px-6 mt-auto border-t border-[#c8c5ca]">
      <div className="flex flex-wrap justify-center gap-6 mb-1">
        <a className="text-[#47464a] hover:text-[#1b6b51] transition-colors text-sm" href="#">Sign up</a>
        <a className="text-[#47464a] hover:text-[#1b6b51] transition-colors text-sm" href="#">Privacy Policy</a>
        <a className="text-[#47464a] hover:text-[#1b6b51] transition-colors text-sm" href="#">Help Center</a>
      </div>
      <p className="text-sm text-[#1b6b51] font-bold">© {new Date().getFullYear()} PlantAid. Botanical Precision.</p>
    </footer>
  );
}


// ─────────────────────────────────────────────────────────────
// Main – ScanningHistoryLogs
// ─────────────────────────────────────────────────────────────
export default function ScanningHistoryLogs() {
  const navigate          = useNavigate();
  const { currentUser }   = useAuth();
  const userId            = currentUser?.uid ?? null;

  // ── Data state ───────────────────────────────────────────
  const [records,      setRecords]      = useState([]);
  const [stats,        setStats]        = useState({ total: 0, healthy: 0, diseased: 0, unknown: 0 });
  const [lastDoc,      setLastDoc]      = useState(null);   // pagination cursor
  const [hasMore,      setHasMore]      = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [error,        setError]        = useState(null);

  // ── Filter state ─────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState('All');

  // ── Delete state ─────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);   // scanId pending confirm
  const [deletingId,   setDeletingId]   = useState(null);   // scanId being deleted

  // ── Load on mount ────────────────────────────────────────
  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await loadHistoryScreenData(userId, 20);
        setRecords(data.records);
        setStats(data.stats);
        setLastDoc(data.lastDoc);
        setHasMore(!!data.lastDoc);
      } catch (err) {
        console.error('History load error:', err);
        setError('Could not load scan history. Please check your connection.');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // ── Load more (pagination) ───────────────────────────────
  const handleLoadMore = useCallback(async () => {
    if (!userId || !lastDoc || loadingMore) return;
    setLoadingMore(true);
    try {
      const { records: more, lastDoc: nextCursor } = await fetchScanHistory(userId, 20, lastDoc);
      setRecords((prev) => [...prev, ...more]);
      setLastDoc(nextCursor);
      setHasMore(!!nextCursor);
    } catch (err) {
      console.error('Load more error:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [userId, lastDoc, loadingMore]);

  // ── Delete flow ──────────────────────────────────────────
  const handleDeleteRequest = (scanId) => setDeleteTarget(scanId);
  const handleDeleteCancel  = () => setDeleteTarget(null);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget);
    try {
      await deleteScanRecord(deleteTarget);
      setRecords((prev) => prev.filter((r) => r.id !== deleteTarget));
      setStats((prev) => {
        const deleted = records.find((r) => r.id === deleteTarget);
        if (!deleted) return prev;
        const type = deriveStatusType(deleted);
        return {
          total:    Math.max(0, prev.total    - 1),
          healthy:  type === 'solved'  ? Math.max(0, prev.healthy  - 1) : prev.healthy,
          diseased: type === 'danger'  ? Math.max(0, prev.diseased - 1) : prev.diseased,
          unknown:  type === 'neutral' ? Math.max(0, prev.unknown  - 1) : prev.unknown,
        };
      });
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }, [deleteTarget, records]);

  // ── Navigate to scan detail / scanner ───────────────────
  const handleViewDetails = (scanId) => {
    navigate(`/diagnostic/${scanId}`);
  };

  // ── Client-side filtering ────────────────────────────────
  const filteredRecords = records.filter((r) => {
    if (activeFilter === 'All')              return true;
    if (activeFilter === 'Healthy')          return r.isHealthy && !r.detectedDisease?.trim();
    if (activeFilter === 'Disease Detected') return !!r.detectedDisease?.trim();
    if (activeFilter === 'Identified')       return !r.isHealthy && !r.detectedDisease?.trim();
    return true;
  });

  // ── Full-page loader ─────────────────────────────────────
  if (loading) {
    return <FullPageLoader message="Loading your scan history" />;
  }

  return (
    <div className="font-sans text-base antialiased overflow-x-hidden min-h-screen flex flex-col bg-[#fbf8ff]">
      <Topbar />

      <DeleteModal
        isOpen={!!deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        deleting={!!deletingId}
      />

      <main className="flex-grow bg-neutral-50/60 px-4 md:px-6 py-8 md:py-10">
        <div className="max-w-3xl mx-auto">

          {/* Page Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 text-[#1b6b51] mb-3">
              <MdHistory className="text-lg" />
              <span className="text-xs font-bold uppercase tracking-widest">Scan Records</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight">
                  Scanning History
                </h1>
                <p className="text-base text-[#47464a] mt-1">
                  {stats.total} total scan{stats.total !== 1 ? 's' : ''} recorded
                </p>
              </div>
              <button
                onClick={() => navigate('/diagnostic-scan')}
                className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all self-start md:self-auto"
              >
                <MdBiotech className="text-base" />
                New Scan
              </button>
            </div>
          </header>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
              <span>⚠️</span>
              {error}
              <button
                onClick={() => window.location.reload()}
                className="ml-auto flex items-center gap-1 text-xs font-bold hover:opacity-70"
              >
                <MdRefresh /> Retry
              </button>
            </div>
          )}

          {/* Stats */}
          {records.length > 0 && <StatsStrip stats={stats} />}

          {/* Filter Bar */}
          {records.length > 0 && (
            <FilterBar active={activeFilter} onChange={setActiveFilter} />
          )}

          {/* List */}
          {filteredRecords.length === 0 ? (
            <EmptyState
              filtered={activeFilter !== 'All' || records.length > 0}
              onGoScan={() => navigate('/diagnostic')}
            />
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record) => (
                <ScanLogCard
                  key={record.id}
                  record={record}
                  onViewDetails={handleViewDetails}
                  onDelete={handleDeleteRequest}
                  deleting={deletingId === record.id}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && activeFilter === 'All' && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-8 py-3 bg-white border border-neutral-200 rounded-2xl font-bold text-black hover:bg-neutral-50 transition-all shadow-sm text-sm disabled:opacity-50"
              >
                {loadingMore
                  ? <span className="w-4 h-4 border-2 border-[#47464a] border-t-transparent rounded-full animate-spin" />
                  : <MdRefresh className="text-base" />
                }
                {loadingMore ? 'Loading…' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}