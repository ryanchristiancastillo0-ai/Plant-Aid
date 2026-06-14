import React from 'react';


import { MdPersonOutline,MdNotificationsNone, MdDeveloperBoard, MdGavel, MdHelpOutline, MdChevronRight, MdLogout,} from 'react-icons/md';


export default function SettingsMenu({ onOpen, profileName }) {
  const settingsRows = [
    { label: 'Profile Adjustments',  icon: MdPersonOutline,     modal: 'profile'       },
    { label: 'Notification Toggles', icon: MdNotificationsNone, modal: 'notifications' },
    { label: 'About Developer Bios', icon: MdDeveloperBoard,    modal: 'developer'     },
    { label: 'Terms & Conditions',   icon: MdGavel,             modal: 'terms'         },
    { label: 'Help & FAQ',           icon: MdHelpOutline,       modal: 'help'          },
  ];

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg sm:text-xl font-bold px-1 mb-3 text-black">Suite Configuration</h2>

      <div className="flex flex-col bg-white border border-[#c8c5ca]/50 rounded-3xl overflow-hidden shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]">
        {settingsRows.map((row, index) => (
          <React.Fragment key={index}>
            <button
              onClick={() => onOpen(row.modal)}
              className="flex items-center justify-between px-4 sm:px-5 py-4 hover:bg-[#f4f2fd] transition-colors group w-full text-left"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <row.icon className="text-[#47464a] group-hover:text-black text-xl transition-colors flex-shrink-0" />
                <span className="text-sm text-[#1a1b22] font-semibold truncate">{row.label}</span>
              </div>
              <MdChevronRight className="text-[#78767b] text-xl transition-transform group-hover:translate-x-1 flex-shrink-0" />
            </button>
            {index < settingsRows.length - 1 && (
              <div className="h-px bg-[#c8c5ca]/20 mx-4 sm:mx-5" />
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={() => onOpen('logout')}
        className="mt-4 w-full py-4 bg-[#ffdad6]/20 border border-[#ffdad6] rounded-2xl text-[#ba1a1a] font-bold flex items-center justify-center gap-2 hover:bg-[#ffdad6]/40 transition-all active:scale-95 duration-200 text-sm"
      >
        <MdLogout className="text-lg" />
        Sign Out
      </button>

      <div className="pt-8">
        <p className="text-center text-sm text-[#47464a] italic">"Precision care for every leaf."</p>
      </div>
    </div>
  );
}
