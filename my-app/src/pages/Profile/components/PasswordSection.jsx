import  { useState} from 'react';
import { MdLock, MdErrorOutline, MdVisibility,MdVisibilityOff,} from 'react-icons/md';

export default function PasswordSection({ onSave, saving }) {
  const [open,        setOpen]        = useState(false);
  const [currentPw,   setCurrentPw]   = useState('');
  const [newPw,       setNewPw]       = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [error,       setError]       = useState('');

  const reset = () => {
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setError(''); setOpen(false);
  };

  const handleSubmit = async () => {
    if (!currentPw)          { setError('Enter your current password.'); return; }
    if (newPw.length < 6)    { setError('New password must be at least 6 characters.'); return; }
    if (newPw !== confirmPw) { setError('Passwords do not match.'); return; }
    setError('');
    try {
      await onSave(currentPw, newPw);
      reset();
    } catch (err) {
      setError(err.message || 'Incorrect current password.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#f4f2fd] flex items-center justify-center">
            <MdLock className="text-[#6c5ce7] text-lg" />
          </div>
          <div>
            <p className="text-sm font-bold text-black">Password</p>
            <p className="text-xs text-[#47464a]">Change your account password</p>
          </div>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-semibold text-[#1b6b51] hover:underline"
        >
          {open ? 'Cancel' : 'Change'}
        </button>
      </div>

      {open && (
        <div className="mt-5 space-y-3 border-t border-zinc-100 pt-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-3 py-2.5">
              <MdErrorOutline className="flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Current password"
              style={{ fontSize: '16px' }}
              className="w-full bg-[#fbf8ff] border border-[#c8c5ca]/60 rounded-xl px-3 py-2.5 text-sm text-black pr-10 outline-none focus:border-[#1b6b51] transition"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              {showCurrent ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="New password (min 6 chars)"
              style={{ fontSize: '16px' }}
              className="w-full bg-[#fbf8ff] border border-[#c8c5ca]/60 rounded-xl px-3 py-2.5 text-sm text-black pr-10 outline-none focus:border-[#1b6b51] transition"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              {showNew ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          <input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="Confirm new password"
            style={{ fontSize: '16px' }}
            className="w-full bg-[#fbf8ff] border border-[#c8c5ca]/60 rounded-xl px-3 py-2.5 text-sm text-black outline-none focus:border-[#1b6b51] transition"
          />

          <div className="flex gap-2 pt-1">
            <button
              onClick={reset}
              className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Update password'
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
