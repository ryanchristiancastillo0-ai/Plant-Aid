
import { useState, useEffect,  } from "react";
import {MdNotificationsActive, MdClose, MdWaterDrop,
  MdLocalFlorist, MdYard, MdEditNote,MdCheckCircleOutline,
  MdLogin,
} from 'react-icons/md';
import { FaGoogle, FaGithub } from 'react-icons/fa';


// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  WATER:     { icon: MdWaterDrop,    color: 'text-blue-500',   bg: 'bg-blue-50'    },
  FERTILIZE: { icon: MdLocalFlorist, color: 'text-amber-500',  bg: 'bg-amber-50'   },
  REPOT:     { icon: MdYard,         color: 'text-orange-500', bg: 'bg-orange-50'  },
  CUSTOM:    { icon: MdEditNote,     color: 'text-[#1b6b51]',  bg: 'bg-[#e6f9f1]' },
};

const METHOD_CONFIG = {
  email:  { icon: MdLogin,  label: 'Email',  color: 'text-zinc-500', bg: 'bg-zinc-100' },
  google: { icon: FaGoogle, label: 'Google', color: 'text-red-500',  bg: 'bg-red-50'   },
  github: { icon: FaGithub, label: 'GitHub', color: 'text-zinc-800', bg: 'bg-zinc-100' },
};

function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate?.() ?? new Date(timestamp);
  const now  = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatLoginDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate?.() ?? new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month:  'short',
    day:    'numeric',
    year:   'numeric',
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  });
}



export default function Notification({ onClose, reminders, loginHistory, loading, onDismiss, dismissing }) {
  const [activeTab,   setActiveTab]   = useState('reminders');
  const [localNotifs, setLocalNotifs] = useState(reminders);

  const unreadCount = reminders.filter((n) => n.unread).length;

  useEffect(() => { setLocalNotifs(reminders); }, [reminders]);

  const markAllRead = () => setLocalNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  const markRead    = (id) => setLocalNotifs((prev) => prev.map((n) => n.id === id ? { ...n, unread: false } : n));

  return (
    <>
      {/* ── Backdrop (mobile only) ───────────────────────── */}
      <div
        className="fixed inset-0 z-40 bg-black/20 sm:hidden"
        onClick={onClose}
      />

      {/* ── Panel ────────────────────────────────────────── */}
      <div
        className={`
          z-50 bg-white border border-zinc-100 shadow-2xl overflow-hidden
          animate-in fade-in duration-200

          /* Mobile — fixed full width sheet from top */
          fixed left-2 right-2 top-[68px] rounded-2xl
          
          /* Desktop — absolute dropdown anchored to bell */
          sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-80 sm:rounded-2xl
          sm:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)]
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-black">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-[#1b6b51] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'reminders' && unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] text-[#1b6b51] font-semibold hover:underline"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors"
            >
              <MdClose className="text-zinc-400 text-sm" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100">
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
              activeTab === 'reminders'
                ? 'text-[#1b6b51] border-b-2 border-[#1b6b51]'
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            Reminders
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
              activeTab === 'activity'
                ? 'text-[#1b6b51] border-b-2 border-[#1b6b51]'
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            Login Activity
          </button>
        </div>

        {/* List */}
        <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto">

          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-zinc-50 animate-pulse">
                  <div className="w-8 h-8 bg-zinc-100 rounded-xl flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5 py-0.5">
                    <div className="h-3 bg-zinc-100 rounded w-2/3" />
                    <div className="h-2.5 bg-zinc-100 rounded w-full" />
                    <div className="h-2 bg-zinc-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── REMINDERS TAB ───────────────────────────── */}
          {!loading && activeTab === 'reminders' && (
            <>
              {localNotifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
                  <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center">
                    <MdNotificationsActive className="text-2xl text-zinc-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-400">All caught up!</p>
                    <p className="text-xs text-zinc-300 mt-0.5">No pending reminders.</p>
                  </div>
                </div>
              ) : (
                localNotifs.map((notif) => {
                  const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.CUSTOM;
                  const Icon   = config.icon;
                  return (
                    <div
                      key={notif.id}
                      onClick={() => markRead(notif.id)}
                      className={`flex items-start gap-3 px-4 py-3.5 border-b border-zinc-50 cursor-pointer hover:bg-zinc-50 transition-colors relative ${
                        notif.unread ? 'bg-[#f0faf5]' : ''
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        notif.unread ? config.bg : 'bg-zinc-100'
                      }`}>
                        <Icon className={`text-base ${notif.unread ? config.color : 'text-zinc-400'}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-7">
                        <p className={`text-xs leading-snug mb-0.5 ${notif.unread ? 'font-bold text-black' : 'font-medium text-zinc-500'}`}>
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-zinc-400 leading-snug">
                          {notif.overdue ? '⚠️ Overdue · ' : ''}
                          {notif.type.charAt(0) + notif.type.slice(1).toLowerCase()} reminder
                        </p>
                        <p className="text-[10px] text-zinc-300 mt-1">{formatDate(notif.reminderDate)}</p>
                      </div>

                      {/* Dismiss */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
                        disabled={dismissing === notif.id}
                        title="Mark as done"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-zinc-200 flex items-center justify-center transition-colors"
                      >
                        {dismissing === notif.id
                          ? <span className="w-3 h-3 border-2 border-[#1b6b51]/30 border-t-[#1b6b51] rounded-full animate-spin" />
                          : <MdCheckCircleOutline className="text-base text-zinc-300 hover:text-[#1b6b51] transition-colors" />
                        }
                      </button>

                      {/* Unread dot */}
                      {notif.unread && (
                        <div className="absolute right-3 top-3.5 w-1.5 h-1.5 rounded-full bg-[#1b6b51]" />
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* ── LOGIN ACTIVITY TAB ──────────────────────── */}
          {!loading && activeTab === 'activity' && (
            <>
              {loginHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
                  <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center">
                    <MdLogin className="text-2xl text-zinc-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-400">No login history yet.</p>
                    <p className="text-xs text-zinc-300 mt-0.5">Activity will appear here after login.</p>
                  </div>
                </div>
              ) : (
                loginHistory.map((entry, index) => {
                  const config   = METHOD_CONFIG[entry.method] || METHOD_CONFIG.email;
                  const Icon     = config.icon;
                  const isLatest = index === 0;
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-start gap-3 px-4 py-3.5 border-b border-zinc-50 transition-colors ${
                        isLatest ? 'bg-[#f0faf5]' : 'hover:bg-zinc-50'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${config.bg}`}>
                        <Icon className={`text-base ${config.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <p className="text-xs font-bold text-black">
                            Signed in via {config.label}
                          </p>
                          {isLatest && (
                            <span className="text-[9px] bg-[#1b6b51] text-white px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug truncate">
                          {entry.email}
                        </p>
                        <p className="text-[10px] text-zinc-300 mt-1">
                          {formatLoginDate(entry.loginAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="px-4 py-2.5 border-t border-zinc-100">
            <p className="text-xs text-zinc-400 text-center">
              {activeTab === 'reminders'
                ? `${localNotifs.length} pending reminder${localNotifs.length !== 1 ? 's' : ''}`
                : `${loginHistory.length} recent login${loginHistory.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        )}
      </div>
    </>
  );
}