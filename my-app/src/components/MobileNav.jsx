// ============================================================
// MobileNav.jsx
// Bottom nav bar with integrated quick-scan camera sheet,
// notifications popup, active route persistence via localStorage,
// and smooth animated active indicator.
// ============================================================
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../pages/Auth/Service/AuthContext';

import {
  MdHome,
  MdOutlineEco,
  MdAdd,
  MdSettings,
  MdClose,
  MdPhotoCamera,
  MdCheckCircle,
  MdWarning,
  MdArrowForward,
  MdNotificationsNone,
  MdCollections,
  MdTipsAndUpdates,
  MdHomeFilled,
  MdHistory,
} from 'react-icons/md';
import { IoLeaf } from 'react-icons/io5';

import {
  runScanPipeline,
  formatConfidence,
  getHealthConfig,
} from '../pages/DiagnosticScan/services/Diagnostic';


// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const STORAGE_KEY = 'plantaid_active_route';

const NAV_ITEMS = [
  {
    label:      'Today',
    path:       '/dashboard',
    Icon:       MdHome,
    IconActive: MdHomeFilled,
  },
  {
    label:      'Collection',
    path:       '/collection',
    Icon:       MdCollections,
    IconActive: MdCollections,
  },
  // center slot — handled separately
  {
    label:      'Plants',
    path:       '/plants',
    Icon:       MdOutlineEco,
    IconActive: MdOutlineEco,
  },
  {
    label:      'Tips',
    path:       '/tips',
    Icon:       MdTipsAndUpdates,
    IconActive: MdTipsAndUpdates,
  },
];


// ─────────────────────────────────────────────────────────────
// CameraSheet
// ─────────────────────────────────────────────────────────────
function CameraSheet({ onClose }) {
  const { currentUser } = useAuth();
  const userId   = currentUser?.uid ?? null;
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [preview,   setPreview]   = useState('');
  const [scanning,  setScanning]  = useState(false);
  const [result,    setResult]    = useState(null);
  const [scanError, setScanError] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (!userId) { setScanError('Please sign in to scan plants.'); return; }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setResult(null);
    setScanError(null);
    setScanning(true);

    try {
      const { result: scanResult } = await runScanPipeline(userId, file, {});
      setResult(scanResult);
    } catch (err) {
      console.error('Quick scan error:', err);
      setScanError('Scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  }, [userId]);

  const handleViewDetails = useCallback(() => {
    onClose();
    navigate('/diagnostic-scan');
  }, [navigate, onClose]);

  const handleReset = useCallback(() => {
    setPreview('');
    setResult(null);
    setScanError(null);
  }, []);

  const topMatch   = result?.suggestions?.[0];
  const healthCfg  = result ? getHealthConfig(result.isHealthy, result.isHealthyScore) : null;
  const confidence = topMatch ? Math.round((topMatch.probability ?? 0) * 100) : 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#fbf8ff] rounded-t-3xl shadow-2xl"
        style={{ maxHeight: '88vh', overflowY: 'auto' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#c8c5ca]/60 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#c8c5ca]/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#a6f2d1] flex items-center justify-center">
              <MdPhotoCamera className="text-[#1b6b51] text-base" />
            </div>
            <span className="text-base font-bold text-black" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Quick Scan
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e8e7f1] transition-colors"
          >
            <MdClose className="text-[#47464a] text-lg" />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          {!preview && !scanning && !result && (
            <UploadPrompt onFile={handleFile} fileRef={fileRef} />
          )}
          {scanning && <ScanningState preview={preview} />}
          {scanError && !scanning && (
            <ErrorState message={scanError} onRetry={handleReset} />
          )}
          {result && !result.isPlant && !scanning && (
            <NotPlantState score={result.isPlantScore} onRetry={handleReset} />
          )}
          {result && result.isPlant && !scanning && topMatch && (
            <QuickResult
              preview={preview}
              topMatch={topMatch}
              confidence={confidence}
              healthCfg={healthCfg}
              result={result}
              onRetry={handleReset}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>

        <div className="h-6" />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </>
  );
}


// ─────────────────────────────────────────────────────────────
// UploadPrompt
// ─────────────────────────────────────────────────────────────
function UploadPrompt({ onFile, fileRef }) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      onDragOver={(e)  => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={()  => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        onFile(e.dataTransfer.files?.[0]);
      }}
      onClick={() => fileRef.current?.click()}
      className={`w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
        isDragging
          ? 'border-[#1b6b51] bg-[#a6f2d1]/20'
          : 'border-[#c8c5ca] bg-white hover:border-[#1b6b51]/60'
      }`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#a6f2d1]/30 flex items-center justify-center">
        <MdPhotoCamera className="text-3xl text-[#1b6b51]" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-black">Take or upload a photo</p>
        <p className="text-xs text-[#47464a] mt-0.5">Tap to open camera or gallery</p>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// ScanningState
// ─────────────────────────────────────────────────────────────
function ScanningState({ preview }) {
  return (
    <div className="w-full h-52 rounded-2xl overflow-hidden relative bg-zinc-950">
      {preview && (
        <img src={preview} alt="Scanning" className="w-full h-full object-cover opacity-60" />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-[#1b6b51]/30 border-t-[#1b6b51] animate-spin" />
        <p className="text-white text-sm font-semibold">Scanning plant…</p>
        <p className="text-white/50 text-xs">Plant.id AI is working</p>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// ErrorState
// ─────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-6">
      <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
        <MdWarning className="text-2xl text-red-500" />
      </div>
      <p className="text-sm font-bold text-red-700">{message}</p>
      <button onClick={onRetry} className="text-xs font-bold text-[#1b6b51] hover:underline">
        Try again
      </button>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// NotPlantState
// ─────────────────────────────────────────────────────────────
function NotPlantState({ score, onRetry }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-6 bg-amber-50 rounded-2xl border border-amber-200 px-4">
      <MdWarning className="text-3xl text-amber-500" />
      <div>
        <p className="text-sm font-bold text-amber-900">No plant detected</p>
        <p className="text-xs text-amber-700 mt-0.5">
          {formatConfidence(score)} confidence · try a clearer photo
        </p>
      </div>
      <button onClick={onRetry} className="text-xs font-bold text-amber-700 hover:underline">
        Try again
      </button>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// QuickResult
// ─────────────────────────────────────────────────────────────
function QuickResult({ preview, topMatch, confidence, healthCfg, result, onRetry, onViewDetails }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white rounded-2xl border border-[#c8c5ca]/40 p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
          <img
            src={topMatch?.imageUrl || preview}
            alt={topMatch?.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#47464a] font-medium uppercase tracking-widest mb-0.5">Top Match</p>
          <h3
            className="text-base font-extrabold text-black leading-tight truncate"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {topMatch?.commonNames?.[0] || topMatch?.name || 'Unknown Plant'}
          </h3>
          {topMatch?.name && (
            <p className="text-xs italic text-[#47464a] truncate">{topMatch.name}</p>
          )}
        </div>
        <div className="flex-shrink-0 text-right">
          <span className="text-lg font-extrabold text-[#1b6b51]">{confidence}%</span>
          <p className="text-[10px] text-[#47464a]">confidence</p>
        </div>
      </div>

      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${healthCfg.bg} ${healthCfg.border}`}>
        {result.isHealthy
          ? <MdCheckCircle className={`text-xl flex-shrink-0 ${healthCfg.text}`} />
          : <MdWarning     className={`text-xl flex-shrink-0 ${healthCfg.text}`} />
        }
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${healthCfg.text}`}>{healthCfg.label}</p>
          {result.diseases?.length > 0 && (
            <p className={`text-xs ${healthCfg.text} opacity-70 truncate`}>
              {result.diseases[0]?.commonNames?.[0] || result.diseases[0]?.name}
            </p>
          )}
        </div>
        <span className={`text-xs font-semibold ${healthCfg.text} flex-shrink-0`}>
          {formatConfidence(result.isHealthyScore)}
        </span>
      </div>

      {result.suggestions.length > 1 && (
        <div className="bg-white rounded-2xl border border-[#c8c5ca]/40 px-4 py-3">
          <p className="text-[10px] font-bold text-[#47464a] uppercase tracking-widest mb-2">
            Other possibilities
          </p>
          <div className="flex flex-col gap-1.5">
            {result.suggestions.slice(1, 3).map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <IoLeaf className="text-[#1b6b51] text-xs flex-shrink-0" />
                  <span className="text-xs text-black truncate">
                    {s.commonNames?.[0] || s.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#47464a] flex-shrink-0">
                  {Math.round(s.probability * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-1">
        <button
          onClick={onRetry}
          className="flex-1 h-11 border border-[#c8c5ca] rounded-xl text-sm font-semibold text-[#47464a] hover:bg-[#e8e7f1] transition-colors"
        >
          Scan Again
        </button>
        <button
          onClick={onViewDetails}
          className="flex-1 h-11 bg-[#1b6b51] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-all active:scale-95"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          View Full Details
          <MdArrowForward className="text-base" />
        </button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// NotificationsPopup
// ─────────────────────────────────────────────────────────────
function NotificationsPopup({ onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl border border-[#c8c5ca]/40 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#c8c5ca]/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#a6f2d1] flex items-center justify-center">
              <MdNotificationsNone className="text-[#1b6b51] text-sm" />
            </div>
            <span className="text-sm font-bold text-black" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Notifications
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#e8e7f1] transition-colors"
          >
            <MdClose className="text-[#47464a] text-base" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#a6f2d1]/30 flex items-center justify-center">
            <MdNotificationsNone className="text-2xl text-[#1b6b51]" />
          </div>
          <p className="text-sm font-bold text-black" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            No notifications yet
          </p>
          <p className="text-xs text-[#47464a] max-w-[220px] leading-relaxed">
            Plant care reminders and alerts will appear here once you set them up.
          </p>
        </div>
      </div>
    </>
  );
}


// ─────────────────────────────────────────────────────────────
// NavButton — individual tab with animated active state
// ─────────────────────────────────────────────────────────────
function NavButton({ item, isActive, onClick }) {
  const { label, Icon, IconActive } = item;
  const ActiveIcon = isActive ? IconActive : Icon;

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-end gap-0.5 px-2 transition-all duration-200 active:scale-90"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Top pill indicator */}
      <span
        className={`
          absolute top-0 left-1/2 -translate-x-1/2
          h-0.5 rounded-full bg-[#1b6b51]
          transition-all duration-300 ease-out
          ${isActive ? 'w-6 opacity-100' : 'w-0 opacity-0'}
        `}
      />

      {/* Icon + blob */}
      <span
        className={`
          relative flex items-center justify-center
          transition-all duration-300 ease-out
          ${isActive ? 'scale-110' : 'scale-100'}
        `}
      >
        <span
          className={`
            absolute w-10 h-7 rounded-xl
            transition-all duration-300 ease-out
            ${isActive ? 'bg-[#a6f2d1]/40 opacity-100 scale-100' : 'opacity-0 scale-75'}
          `}
        />
        <ActiveIcon
          className={`
            relative text-[22px]
            transition-all duration-300 ease-out
            ${isActive ? 'text-[#1b6b51]' : 'text-zinc-400'}
          `}
        />
      </span>

      {/* Label */}
      <span
        className={`
          text-[10px] font-semibold leading-none
          transition-all duration-300 ease-out
          ${isActive ? 'text-[#1b6b51]' : 'text-zinc-400'}
        `}
      >
        {label}
      </span>
    </button>
  );
}


// ─────────────────────────────────────────────────────────────
// MobileNav — main export
// ─────────────────────────────────────────────────────────────
export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isOnDiagnostic = location.pathname === '/diagnostic-scan';

  // ── Persist active route across reloads ────────────────────
  const [activeRoute, setActiveRoute] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || location.pathname;
  });

  // Keep activeRoute in sync with browser navigation (back/forward)
  useEffect(() => {
    setActiveRoute(location.pathname);
    localStorage.setItem(STORAGE_KEY, location.pathname);
  }, [location.pathname]);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);

  const handleNavigate = (path) => {
    setActiveRoute(path);
    localStorage.setItem(STORAGE_KEY, path);
    navigate(path);
  };

  return (
    <>
      {/* ── Bottom Nav Bar ───────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 z-40 pb-safe">
        <nav className="flex items-end justify-between h-16 w-full max-w-md mx-auto px-2">

          {/* Left two items */}
          <div className="flex flex-1 items-end justify-around pb-2">
            {NAV_ITEMS.slice(0, 2).map((item) => (
              <NavButton
                key={item.path}
                item={item}
                isActive={activeRoute === item.path}
                onClick={() => handleNavigate(item.path)}
              />
            ))}
          </div>

          {/* Center — FAB or History Log button */}
          <div className="flex items-end justify-center pb-2 px-3">
            {!isOnDiagnostic ? (
              /* ── Normal FAB (quick scan) ── */
              <div className="relative" style={{ marginBottom: '12px' }}>
                <button
                  onClick={() => setCameraOpen(true)}
                  className="
                    flex items-center justify-center
                    w-14 h-14 rounded-full
                    bg-[#1b6b51] text-white
                    shadow-[0_8px_20px_-4px_rgba(27,107,81,0.5)]
                    hover:bg-[#237157]
                    active:scale-90
                    transition-all duration-200 ease-out
                  "
                  aria-label="Quick plant scan"
                >
                  <MdAdd className="text-3xl" />
                </button>
              </div>
            ) : (
              /* ── History log button (shown only on /diagnostic-scan) ── */
              <div className="relative" style={{ marginBottom: '12px' }}>
                <button
                  onClick={() => handleNavigate('/history-logs')}
                  className="
                    flex flex-col items-center justify-center
                    w-14 h-14 rounded-full
                    bg-[#eeedf7] text-[#1b6b51]
                    shadow-[0_4px_12px_-2px_rgba(27,107,81,0.15)]
                    hover:bg-[#a6f2d1]/40
                    active:scale-90
                    transition-all duration-200 ease-out
                  "
                  aria-label="Scan history"
                >
                  <MdHistory className="text-2xl" />
                </button>
                {/* Label underneath */}
                <span
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-[#1b6b51] whitespace-nowrap"
                >
                  History
                </span>
              </div>
            )}
          </div>

          {/* Right two items */}
          <div className="flex flex-1 items-end justify-around pb-2">
            {NAV_ITEMS.slice(2).map((item) => (
              <NavButton
                key={item.path}
                item={item}
                isActive={activeRoute === item.path}
                onClick={() => handleNavigate(item.path)}
              />
            ))}
          </div>

        </nav>
      </div>

      {/* Camera sheet */}
      {cameraOpen && (
        <CameraSheet onClose={() => setCameraOpen(false)} />
      )}

      {/* Notifications popup */}
      {notifOpen && (
        <NotificationsPopup onClose={() => setNotifOpen(false)} />
      )}
    </>
  );
}