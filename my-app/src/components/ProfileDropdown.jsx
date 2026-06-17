import { useRef, useState, useEffect } from 'react';
import { MdFeedback, MdStar, MdStarBorder, MdSend, MdClose } from 'react-icons/md';
import emailjs from '@emailjs/browser';
import {
  MdAccountCircle,
  MdSettings,
  MdLogout,
} from 'react-icons/md';

import { useAuth } from '../pages/Auth/Service/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaJournalWhills, FaTasks, FaUserAstronaut } from 'react-icons/fa';


function FeedbackModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const [rating,   setRating]   = useState(0);
  const [hovered,  setHovered]  = useState(0);
  const [category, setCategory] = useState('general');
  const [message,  setMessage]  = useState('');
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (isOpen) {
      setRating(0); setHovered(0); setCategory('general');
      setMessage(''); setSent(false); setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = [
    { value: 'general', label: 'General'    },
    { value: 'bug',     label: 'Bug Report' },
    { value: 'feature', label: 'Feature'    },
    { value: 'ux',      label: 'Design/UX'  },
  ];

  const handleSend = async () => {
    if (!message.trim()) { setError('Please write your feedback first.'); return; }
    setSending(true);
    setError(null);
    try {
      await emailjs.send(
        'service_mm8zobf',
        'template_y6ccye4',
        {
          to_email:   'skidrow199268@gmail.com',
          from_email: currentUser?.email ?? 'Anonymous',
          category,
          rating:     rating || 'Not rated',
          message:    message.trim(),
        },
        'CnhCrcjoNNEDkGHgE'
      );
      setSent(true);
    } catch (err) {
      console.error('Feedback send error:', err);
      setError('Could not send feedback. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[80vh] mx-0 sm:mx-4">
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-200" />
        </div>
        <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-zinc-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#a6f2d1] flex items-center justify-center">
              <MdFeedback className="text-[#1b6b51] text-base" />
            </div>
            <h3 className="text-base font-bold text-black">Send Feedback</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
            <MdClose className="text-zinc-500 text-lg" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {sent ? (
            <div className="flex flex-col items-center text-center gap-3 py-8">
              <div className="w-14 h-14 rounded-2xl bg-[#a6f2d1] flex items-center justify-center">
                <MdSend className="text-2xl text-[#1b6b51]" />
              </div>
              <p className="text-base font-bold text-black">Feedback sent!</p>
              <p className="text-xs text-zinc-500 max-w-[240px] leading-relaxed">
                Thanks for helping improve PlantAid. We'll review your message shortly.
              </p>
              <button onClick={onClose} className="mt-2 px-6 py-2.5 bg-[#1b6b51] text-white rounded-xl text-sm font-bold hover:bg-[#237157] transition-colors">
                Done
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block">Rate your experience</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <button key={star} onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(star)} className="transition-transform duration-150 hover:scale-110 active:scale-95">
                      {star <= (hovered || rating) ? <MdStar className="text-2xl text-amber-400" /> : <MdStarBorder className="text-2xl text-zinc-300" />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(({ value, label }) => (
                    <button key={value} onClick={() => setCategory(value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${category === value ? 'bg-[#1b6b51] text-white border-[#1b6b51]' : 'bg-white text-zinc-500 border-zinc-200 hover:border-[#1b6b51] hover:text-[#1b6b51]'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block">Your message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what's on your mind…" rows={4} style={{ fontSize: '16px' }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-black outline-none resize-none focus:border-[#1b6b51] transition-colors placeholder:text-zinc-300" />
                <p className="text-[10px] text-zinc-300 text-right mt-1">{message.length}/500</p>
              </div>
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              <button onClick={handleSend} disabled={sending || !message.trim()}
                className="w-full py-3 bg-[#1b6b51] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#237157] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {sending ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><MdSend className="text-base" /> Send Feedback</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [showFeedback, setShowFeedback] = useState(false);
  const { logout, userProfile, currentUser } = useAuth();

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const displayName  = userProfile?.name     || currentUser?.displayName || 'User';
  const displayEmail = userProfile?.email    || currentUser?.email       || '';
  const photoURL     = userProfile?.photoURL || currentUser?.photoURL    || null;
  const initials     = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const AvatarCircle = ({ size = 'w-10 h-10' }) => (
    <div className={`${size} rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border border-zinc-200 shrink-0`}>
      {photoURL
        ? <img alt={displayName} className="w-full h-full object-cover" src={photoURL} />
        : <span className="text-sm font-extrabold text-emerald-700">{initials}</span>
      }
    </div>
  );

  const navItems = [
    { label: 'View Profile',    icon: <MdAccountCircle className="text-zinc-400 group-hover:text-emerald-600 transition-colors text-[20px]" />, path: '/profile' },
    { label: 'Settings',        icon: <MdSettings      className="text-zinc-400 group-hover:text-emerald-600 transition-colors text-[20px]" />, path: '/settings' },
    { label: 'My Collection',   icon: <FaUserAstronaut className="text-zinc-400 group-hover:text-emerald-600 transition-colors text-[18px]" />, path: '/collection' },
    { label: 'My Journal',      icon: <FaJournalWhills className="text-zinc-400 group-hover:text-emerald-600 transition-colors text-[18px]" />, path: '/journal' },
    { label: 'Task Management', icon: <FaTasks         className="text-zinc-400 group-hover:text-emerald-600 transition-colors text-[18px]" />, path: '/task-management' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-emerald-400 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        aria-label="Profile menu"
        aria-expanded={open}
      >
        {photoURL
          ? <img alt={displayName} className="w-full h-full object-cover" src={photoURL} />
          : <span className="text-sm font-extrabold text-emerald-700">{initials}</span>
        }
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel
              Mobile  : fixed bottom sheet
              Desktop : fixed top-right, positioned via inline style
                        so it's immune to any parent stacking context (fixed headers, transforms, etc.) */}
          <div
            className="z-50 bg-white flex flex-col overflow-hidden fixed bottom-16 left-0 right-0 rounded-t-3xl shadow-2xl max-h-[85dvh] sm:bottom-auto sm:left-auto sm:right-auto sm:top-auto sm:w-64 sm:rounded-2xl sm:border sm:border-zinc-200/80 sm:shadow-xl sm:shadow-zinc-900/10"
            style={{
              // on desktop override: pin to viewport, not to any parent
              ...(window.innerWidth >= 640 && {
                position: 'fixed',
                top: '72px',
                right: '16px',
                left: 'auto',
                bottom: 'auto',
                maxHeight: 'min(420px, calc(100vh - 80px))',
              })
            }}
          >
            {/* Drag handle — mobile only */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-zinc-200" />
            </div>

            {/* User info */}
            <div className="px-4 py-4 border-b border-zinc-100 flex items-center gap-3 flex-shrink-0">
              <AvatarCircle />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-zinc-900 truncate">{displayName}</p>
                <p className="text-xs text-zinc-400 truncate">{displayEmail}</p>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors sm:hidden flex-shrink-0">
                <MdClose className="text-zinc-500 text-lg" />
              </button>
            </div>

            {/* Scrollable nav */}
            <div className="overflow-y-auto flex-1 min-h-0 p-2 space-y-0.5">
              {navItems.map(({ label, icon, path }) => (
                <button key={path} onClick={() => { setOpen(false); navigate(path); }}
                  className="w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl text-left text-sm text-zinc-700 font-medium hover:bg-zinc-50 active:bg-zinc-100 transition-colors group">
                  {icon}{label}
                </button>
              ))}
              <button onClick={() => { setOpen(false); setShowFeedback(true); }}
                className="w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl text-left text-sm text-zinc-700 font-medium hover:bg-zinc-50 active:bg-zinc-100 transition-colors group">
                <MdFeedback className="text-zinc-400 group-hover:text-emerald-600 transition-colors text-[20px]" />
                Send Feedback
              </button>
            </div>

            {/* Sign out */}
            <div className="p-2 border-t border-zinc-100 flex-shrink-0">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl text-left text-sm font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors">
                <MdLogout className="text-red-400 text-[20px]" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        userEmail={displayEmail}
      />
    </div>
  );
}