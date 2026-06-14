import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { IoLeaf } from 'react-icons/io5';
import {MdNotificationsActive, MdClose, MdWaterDrop,
  MdLocalFlorist, MdYard, MdEditNote,MdCheckCircleOutline,
  MdLogin, MdFeedback, MdStar, MdStarBorder, MdSend
} from 'react-icons/md';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { ProfileDropdown,Notification } from './index';
import { useAuth } from '../pages/Auth/Service/AuthContext';
import { subscribeNotifications, markReminderCompleted, checkAndNotifyOverdueReminders } from '../service/notificationService';
import { subscribeLoginHistory } from '../pages/Auth/Service/LoginHistory';

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

// ─────────────────────────────────────────────────────────────
// Notification Panel
// ─────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────
// Nav routes config
// ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Today',    path: '/dashboard'       },
  { label: 'Diagnose', path: '/diagnostic-scan' },
  { label: 'Plants',   path: '/plants'          },
  { label: 'Tips',     path: '/tips'            },
];

const STORAGE_KEY = 'plantaid_active_route';







// ─────────────────────────────────────────────────────────────
// Topbar
// ─────────────────────────────────────────────────────────────
export default function Topbar() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const { currentUser } = useAuth();
  const [showFeedback, setShowFeedback] = useState(false);

  const [activeRoute,       setActiveRoute]       = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || location.pathname;
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [reminders,         setReminders]         = useState([]);
  const [loginHistory,      setLoginHistory]      = useState([]);
  const [notifLoading,      setNotifLoading]      = useState(true);
  const [dismissing,        setDismissing]        = useState(null);

  const notifRef = useRef(null);

  // ── Real-time reminders listener ──────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    setNotifLoading(true);
    const unsub = subscribeNotifications(currentUser.uid, (data) => {
      setReminders(data);
      setNotifLoading(false);
    });
    return () => unsub();
  }, [currentUser]);


  // ── Overdue email alert check ──────────────────────────────
useEffect(() => {
  if (!currentUser || reminders.length === 0) return;
  checkAndNotifyOverdueReminders(reminders, {
    userId:  currentUser.uid,
    toEmail: currentUser.email,
    toName:  currentUser.displayName,
  });
}, [currentUser, reminders]);

  // ── Real-time login history listener ──────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeLoginHistory(currentUser.uid, (data) => {
      setLoginHistory(data);
    });
    return () => unsub();
  }, [currentUser]);

  // ── Sync active route ──────────────────────────────────────
  useEffect(() => {
    setActiveRoute(location.pathname);
    localStorage.setItem(STORAGE_KEY, location.pathname);
  }, [location.pathname]);

  // ── Close on outside click ─────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNavigate = (path) => {
    setActiveRoute(path);
    localStorage.setItem(STORAGE_KEY, path);
    navigate(path);
  };

  const handleDismiss = async (id) => {
    setDismissing(id);
    try {
      await markReminderCompleted(id);
    } catch (err) {
      console.error('Failed to dismiss:', err);
    } finally {
      setDismissing(null);
    }
  };

  const unreadCount = reminders.filter((n) => n.unread).length;

  return (
    <header className="w-full h-16 bg-white flex items-center justify-center px-4 sm:px-6 border-b border-zinc-200/80 sticky top-0 z-40">
      <nav className="flex items-center justify-between w-full max-w-7xl mx-auto">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <IoLeaf className="text-emerald-600 text-2xl" />
          <span className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">PlantAid</span>
        </div>

        {/* Nav links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ label, path }) => {
            const isActive = activeRoute === path;
            return (
              <button
                key={path}
                onClick={() => handleNavigate(path)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1b6b51] text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className={`p-2 rounded-full transition-colors relative ${
                showNotifications ? 'bg-zinc-100' : 'hover:bg-zinc-100'
              }`}
            >
              <MdNotificationsActive className="text-zinc-600 text-xl" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#1b6b51] rounded-full border-2 border-white" />
              )}
            </button>

            {showNotifications && (
              <Notification
                onClose={() => setShowNotifications(false)}
                reminders={reminders}
                loginHistory={loginHistory}
                loading={notifLoading}
                onDismiss={handleDismiss}
                dismissing={dismissing}
              />
            )}
          </div>


          

          <ProfileDropdown />
        </div>

      </nav>

    </header>
  );
}