import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Service/AuthContext';

export default function ResetConfirm({ oobCodeProp = null }) {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { confirmNewPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');

  const oobCode = oobCodeProp || searchParams.get('oobCode');
  const mode    = oobCodeProp ? 'resetPassword' : searchParams.get('mode');

  // ── If no valid oobCode, password was already changed on Firebase's page
  // ── Just redirect to login automatically
  useEffect(() => {
    if (!oobCode || mode !== 'resetPassword') {
      const timer = setTimeout(() => navigate('/auth/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [oobCode, mode]);

  // ── Auto-redirect after success ───────────────────────────
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate('/auth/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await confirmNewPassword(oobCode, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ─────────────────────────────────────────
  if (success) {
    return (
      <div className="bg-zinc-50/60 min-h-screen text-[#1a1b22] flex items-center justify-center p-4 antialiased">
        <main className="w-full max-w-md bg-white rounded-3xl border border-zinc-200/50 shadow-sm p-8 md:p-10 relative overflow-hidden">
          <div className="mb-8 flex flex-col items-center gap-2">
            <span className="text-3xl font-extrabold tracking-tighter text-black">PlantAid</span>
            <div className="h-1 w-12 bg-[#1b6b51] rounded-full" />
          </div>
          <div className="flex flex-col items-center text-center gap-4 py-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="w-16 h-16 rounded-full bg-[#a6f2d1] flex items-center justify-center">
              <span className="text-3xl">🌱</span>
            </div>
            <h2 className="text-xl font-bold text-black tracking-tight">Password Updated!</h2>
            <p className="text-sm text-[#47464a] leading-relaxed">
              Your password has been reset. Redirecting you to login…
            </p>
            <span className="w-6 h-6 border-2 border-[#1b6b51]/20 border-t-[#1b6b51] rounded-full animate-spin" />
          </div>
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#1b6b51]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#1b6b51]/10 rounded-full blur-3xl pointer-events-none" />
        </main>
      </div>
    );
  }

  // ── No oobCode = password already changed on Firebase page
  // ── Show success modal and redirect to login
  if (!oobCode || mode !== 'resetPassword') {
    return (
      <div className="bg-zinc-50/60 min-h-screen text-[#1a1b22] flex items-center justify-center p-4 antialiased">
        <main className="w-full max-w-md bg-white rounded-3xl border border-zinc-200/50 shadow-sm p-8 md:p-10 relative overflow-hidden">
          <div className="mb-8 flex flex-col items-center gap-2">
            <span className="text-3xl font-extrabold tracking-tighter text-black">PlantAid</span>
            <div className="h-1 w-12 bg-[#1b6b51] rounded-full" />
          </div>
          <div className="flex flex-col items-center text-center gap-4 py-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="w-16 h-16 rounded-full bg-[#a6f2d1] flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-black tracking-tight">Password Changed!</h2>
            <p className="text-sm text-[#47464a] leading-relaxed">
              Your password has been successfully updated. Redirecting you to login in 5 seconds…
            </p>
            <span className="w-6 h-6 border-2 border-[#1b6b51]/20 border-t-[#1b6b51] rounded-full animate-spin" />
          </div>
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#1b6b51]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#1b6b51]/10 rounded-full blur-3xl pointer-events-none" />
        </main>
      </div>
    );
  }

  // ── Set new password form (when oobCode exists in URL) ────
  return (
    <div className="bg-zinc-50/60 min-h-screen text-[#1a1b22] flex items-center justify-center p-4 antialiased">
      <main className="w-full max-w-md bg-white rounded-3xl border border-zinc-200/50 shadow-sm p-8 md:p-10 relative overflow-hidden">

        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <span className="text-3xl font-extrabold tracking-tighter text-black">PlantAid</span>
          <div className="h-1 w-12 bg-[#1b6b51] rounded-full" />
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-black mb-2 tracking-tight">Set New Password</h1>
            <p className="text-sm text-[#47464a]">Choose a strong new password for your account.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold mb-2 ml-1 text-[#47464a]">New Password</label>
              <div className="relative">
                <input
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-5 py-4 text-base focus:ring-4 focus:ring-[#1b6b51]/5 focus:border-[#1b6b51] outline-none transition-all text-zinc-900 placeholder:text-zinc-400 pr-16"
                  placeholder="••••••••"
                  required
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors text-sm font-medium"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                {error}
              </p>
            )}

            <button
              className="w-full bg-black text-white rounded-xl px-5 py-4 font-semibold tracking-wide hover:opacity-90 active:scale-[0.99] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              type="submit"
              disabled={loading}
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Update Password'
              }
            </button>
          </form>
        </div>

        {/* Back to login */}
        <div className="mt-10 pt-6 border-t border-zinc-100 text-center">
          
          <a  className="inline-flex items-center gap-2 text-[#47464a] text-sm font-medium hover:text-black transition-colors"
            href="/auth/login"
          >
            ← Back to Login
          </a>
        </div>

        {/* Ambient blobs */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#1b6b51]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#1b6b51]/10 rounded-full blur-3xl pointer-events-none" />
      </main>
    </div>
  );
}