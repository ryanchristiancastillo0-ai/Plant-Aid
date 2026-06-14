import React, { useState, useEffect, } from 'react';

import { updateUserSettings,  DEFAULT_SETTINGS} from '../services/Setting';
import { MdNotifications,MdNotificationsOff, MdErrorOutline,} from 'react-icons/md';
import {Modal} from './index'

export default function NotificationsModal({ isOpen, onClose, settings, uid, onSettingsSaved }) {
  const [toggles,  setToggles]  = useState({ ...DEFAULT_SETTINGS });
  const [saving,   setSaving]   = useState(null);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (settings) setToggles({ ...DEFAULT_SETTINGS, ...settings });
  }, [settings, isOpen]);

  const handleToggle = async (key) => {
    const newVal = !toggles[key];
    setToggles((prev) => ({ ...prev, [key]: newVal }));
    setSaving(key);
    setError(null);
    try {
      await updateUserSettings(uid, { [key]: newVal });
      onSettingsSaved({ ...toggles, [key]: newVal });
    } catch (err) {
      console.error('Settings save error:', err);
      setToggles((prev) => ({ ...prev, [key]: !newVal }));
      setError('Could not save setting. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const rows = [
    { key: 'wateringReminders', label: 'Watering Reminders', desc: 'Daily care schedule alerts'      },
    { key: 'weatherAlerts',     label: 'Weather Alerts',     desc: 'Wind, rain & UV warnings'        },
    { key: 'weeklyDigest',      label: 'Weekly Digest',      desc: 'Summary of your garden activity' },
    { key: 'diseaseAlerts',     label: 'Disease Alerts',     desc: 'Early detection notifications'   },
    { key: 'communityUpdates',  label: 'Community Updates',  desc: 'New tips and community posts'    },
    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser & mobile push alerts'    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notification Toggles">
      <div className="space-y-0 pb-2">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-3 py-2 mb-3">
            <MdErrorOutline className="flex-shrink-0" /> {error}
          </div>
        )}
        {rows.map(({ key, label, desc }, i) => (
          <React.Fragment key={key}>
            <div className="flex items-center justify-between py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${toggles[key] ? 'bg-[#a6f2d1]' : 'bg-[#f4f2fd]'}`}>
                  {saving === key
                    ? <span className="w-3.5 h-3.5 border-2 border-[#1b6b51]/40 border-t-[#1b6b51] rounded-full animate-spin" />
                    : toggles[key]
                      ? <MdNotifications    className="text-[#1b6b51] text-base" />
                      : <MdNotificationsOff className="text-[#47464a]/40 text-base" />
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-black truncate">{label}</p>
                  <p className="text-[10px] text-[#47464a]/60">{desc}</p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => handleToggle(key)}
                disabled={saving !== null}
                aria-label={`Toggle ${label}`}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 disabled:opacity-60 ${toggles[key] ? 'bg-[#1b6b51]' : 'bg-[#c8c5ca]'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${toggles[key] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            {i < rows.length - 1 && <div className="h-px bg-[#c8c5ca]/20" />}
          </React.Fragment>
        ))}
      </div>
    </Modal>
  );
}
