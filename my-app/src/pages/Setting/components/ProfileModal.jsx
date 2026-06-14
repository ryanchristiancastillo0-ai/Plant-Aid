import{ useState, useEffect } from 'react';
import {Modal} from './index'
import {
  updateUserProfile,
} from '../services/Setting';


import { MdPersonOutline, MdEdit,MdSave,MdCheck, MdEmail, MdPhone,MdLock, MdLocationOn,MdErrorOutline,} from 'react-icons/md';


export default function ProfileModal({ isOpen, onClose, profile, uid, onProfileSaved }) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState(null);
  const [form,    setForm]    = useState({
    name:     '',
    email:    '',
    phone:    '',
    location: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name:     profile.name     ?? '',
        email:    profile.email    ?? '',
        phone:    profile.phone    ?? '',
        location: profile.location ?? '',
      });
    }
  }, [profile, isOpen]);

  const handleSave = async () => {
    if (!uid) return;
    setSaving(true);
    setError(null);
    try {
      await updateUserProfile(uid, form);
      setSaved(true);
      setEditing(false);
      onProfileSaved(form);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Profile save error:', err);
      setError('Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        name:     profile.name     ?? '',
        email:    profile.email    ?? '',
        phone:    profile.phone    ?? '',
        location: profile.location ?? '',
      });
    }
    setEditing(false);
    setError(null);
  };

  const initial = (form.name || 'U')[0].toUpperCase();

  const fields = [
    { label: 'Full Name', icon: MdPersonOutline, key: 'name'     },
    { label: 'Email',     icon: MdEmail,         key: 'email'    },
    { label: 'Phone',     icon: MdPhone,         key: 'phone'    },
    { label: 'Location',  icon: MdLocationOn,    key: 'location' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile Adjustments">
      <div className="space-y-3 pb-2">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#a6f2d1] flex items-center justify-center text-xl sm:text-2xl font-bold text-[#1b6b51] flex-shrink-0 overflow-hidden">
            {profile?.photoURL
              ? <img src={profile.photoURL} alt="avatar" className="w-full h-full object-cover" />
              : initial
            }
          </div>
          <div>
            <p className="text-sm font-bold text-black">{form.name || 'PlantAid User'}</p>
            <p className="text-xs text-[#47464a]">PlantAid Member</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-3 py-2">
            <MdErrorOutline className="flex-shrink-0" /> {error}
          </div>
        )}

        {/* Fields */}
        {fields.map(({ label, icon: Icon, key }) => (
          <div key={key}>
            <label className="text-[10px] font-bold text-[#47464a]/60 uppercase tracking-widest mb-1 block">
              {label}
            </label>
            <div className="flex items-center gap-3 bg-[#fbf8ff] border border-[#c8c5ca]/50 rounded-xl px-3 py-2.5">
              <Icon className="text-[#47464a] text-lg flex-shrink-0" />
              {editing
                ? <input
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="flex-1 min-w-0 bg-transparent text-sm text-black outline-none"
                    style={{ fontSize: '16px' /* prevents iOS zoom */ }}
                  />
                : <span className="flex-1 min-w-0 text-sm text-black truncate">
                    {form[key] || <span className="text-[#c8c5ca]">Not set</span>}
                  </span>
              }
            </div>
          </div>
        ))}

        {/* Password row */}
        <div>
          <label className="text-[10px] font-bold text-[#47464a]/60 uppercase tracking-widest mb-1 block">Password</label>
          <div className="flex items-center gap-3 bg-[#fbf8ff] border border-[#c8c5ca]/50 rounded-xl px-3 py-2.5">
            <MdLock className="text-[#47464a] text-lg flex-shrink-0" />
            <span className="flex-1 text-sm text-black">••••••••</span>
            <button className="text-xs font-bold text-[#1b6b51] hover:opacity-70 flex-shrink-0">Change</button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 py-3 rounded-xl border border-[#c8c5ca] text-sm font-semibold text-[#47464a] hover:bg-[#f4f2fd] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-[#1b6b51] text-white text-sm font-bold hover:bg-[#237157] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <><MdSave className="text-base" /> Save</>
                }
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <MdEdit className="text-base" /> Edit Profile
            </button>
          )}
        </div>

        {saved && (
          <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold justify-center">
            <MdCheck className="text-lg" /> Changes saved!
          </div>
        )}
      </div>
    </Modal>
  );
}
