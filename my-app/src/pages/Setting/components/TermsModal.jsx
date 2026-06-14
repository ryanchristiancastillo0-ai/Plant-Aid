
import { MdInfo} from 'react-icons/md';
import {Modal} from './index'
export default function TermsModal({ isOpen, onClose }) {
  const sections = [
    { title: '1. Usage',         body: 'PlantAid is a personal plant care assistant. Data is stored securely in Firebase Firestore and is only accessible by the authenticated user.' },
    { title: '2. Data Privacy',  body: 'We do not sell your data. Plant scan images are processed by third-party AI APIs and are not permanently stored on our servers.' },
    { title: '3. Liability',     body: 'PlantAid provides botanical guidance for informational purposes. We are not liable for plant health outcomes based on app recommendations.' },
    { title: '4. API Services',  body: 'This app uses Plant.id, OpenWeatherMap, and Google Gemini APIs. Their respective terms of service also apply.' },
    { title: '5. Modifications', body: 'We reserve the right to modify these terms at any time. Continued use of the app constitutes acceptance of updated terms.' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Terms & Conditions">
      <div className="space-y-4 pb-2">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <MdInfo className="text-amber-600 text-lg flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">Placeholder terms — replace with your legal copy before launch.</p>
        </div>
        {sections.map(({ title, body }) => (
          <div key={title}>
            <p className="text-sm font-bold text-black mb-1">{title}</p>
            <p className="text-xs text-[#47464a] leading-relaxed">{body}</p>
          </div>
        ))}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[#1b6b51] text-white text-sm font-bold hover:bg-[#237157] transition-colors mt-2"
        >
          I Understand
        </button>
      </div>
    </Modal>
  );
}
