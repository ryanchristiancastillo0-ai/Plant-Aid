import  { useState} from 'react';
import { useNavigate } from 'react-router-dom';

import {signOutUser,} from '../services/Setting';
import {MdLogout,MdErrorOutline,} from 'react-icons/md';
import {Modal} from './index'

export default function LogoutModal({ isOpen, onClose }) {
  const navigate         = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [error,      setError]      = useState(null);

  const handleLogout = async () => {
    setSigningOut(true);
    setError(null);
    try {
      await signOutUser();
      navigate('/auth/login', { replace: true });
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Could not sign out. Please try again.');
      setSigningOut(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign Out">
      <div className="space-y-5 pb-2">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-3 py-2">
            <MdErrorOutline className="flex-shrink-0" /> {error}
          </div>
        )}
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
            <MdLogout className="text-red-500 text-2xl" />
          </div>
          <p className="text-sm text-[#47464a] leading-relaxed">
            Are you sure you want to sign out of PlantAid? Your garden data will be safe.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={signingOut}
            className="flex-1 py-3 rounded-xl border border-[#c8c5ca] text-sm font-semibold text-[#47464a] hover:bg-[#f4f2fd] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={signingOut}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {signingOut
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><MdLogout className="text-base" /> Sign Out</>
            }
          </button>
        </div>
      </div>
    </Modal>
  );
}