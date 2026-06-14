import { useState } from 'react';
import {Modal} from './index'
import {MdChevronRight,} from 'react-icons/md';


export default function HelpModal({ isOpen, onClose }) {
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    { q: 'How do I add a plant?',           a: 'Navigate to the Plant Directory from the bottom nav, search for your plant, and tap "Add to Garden".' },
    { q: 'How does the AI scanner work?',   a: 'Go to Diagnostic Scan, upload or take a photo. Plant.id API identifies the species and Gemini provides a detailed care analysis.' },
    { q: 'Why is my weather data static?',  a: 'Weather pulls from OpenWeatherMap using your location. Ensure VITE_WEATHER_API is set in your .env file.' },
    { q: 'Can I delete a plant?',           a: 'Yes — open the plant detail from My Garden and tap the trash icon. This removes it from your userPlants collection.' },
    { q: 'How do reminders work?',          a: "Reminders are stored in Firestore. The Dashboard shows today's and upcoming tasks. Tap a reminder to mark it complete." },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Help & FAQ">
      <div className="space-y-2 pb-2">
        {faqs.map(({ q, a }, i) => (
          <div key={i} className="border border-[#c8c5ca]/40 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#f4f2fd] transition-colors"
            >
              <span className="text-sm font-semibold text-black pr-2 leading-snug">{q}</span>
              <MdChevronRight className={`text-[#47464a] text-xl flex-shrink-0 transition-transform duration-200 ${openIdx === i ? 'rotate-90' : ''}`} />
            </button>
            {openIdx === i && (
              <div className="px-4 pb-4">
                <p className="text-xs text-[#47464a] leading-relaxed">{a}</p>
              </div>
            )}
          </div>
        ))}
        <div className="pt-1 bg-[#a6f2d1]/20 rounded-2xl p-4 border border-[#a6f2d1]/40">
          <p className="text-xs font-bold text-[#1b6b51] mb-1">Still need help?</p>
          <p className="text-xs text-[#47464a]">Contact support at <span className="font-semibold">support@plantaid.app</span></p>
        </div>
      </div>
    </Modal>
  );
}