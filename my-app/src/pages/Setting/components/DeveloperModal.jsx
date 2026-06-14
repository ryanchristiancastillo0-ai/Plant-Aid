import { IoLeaf } from "react-icons/io5";
import {Modal} from './index'
import {devs} from '../../../constant/setting'
export default function DeveloperModal({ isOpen, onClose }) {


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="About Developer Bios">
      <div className="space-y-4 pb-2">
        <div className="flex items-center gap-3 bg-[#a6f2d1]/20 border border-[#a6f2d1]/40 rounded-2xl p-4">
          <IoLeaf className="text-[#1b6b51] text-2xl flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-black">PlantAid v1.0</p>
            <p className="text-xs text-[#47464a]">React · Firebase · Tailwind CSS · Vite</p>
          </div>
        </div>
        {devs.map(({ initial, name, role, note }) => (
          <div key={name} className="flex items-start gap-4 p-4 bg-[#fbf8ff] rounded-2xl border border-[#c8c5ca]/30">
            <div className="w-10 h-10 rounded-xl bg-[#1b6b51] flex items-center justify-center text-white font-bold flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-black">{name}</p>
              <p className="text-[10px] font-semibold text-[#1b6b51] uppercase tracking-widest">{role}</p>
              <p className="text-xs text-[#47464a] mt-1">{note}</p>
            </div>
          </div>
        ))}
       <p className="text-[10px] text-center text-[#47464a]/40">Built with 🌿 in Calabarzon, Philippines.</p>

{/* Group 3 note */}
<div className="mt-3 bg-[#a6f2d1]/20 border border-[#a6f2d1]/40 rounded-2xl px-4 py-3 text-center">
  <p className="text-[10px] font-bold text-[#1b6b51] uppercase tracking-widest mb-1">Group 3</p>
  <p className="text-xs text-[#47464a] leading-relaxed">
    All members of Group 3 participated in the planning, design, and development of this web application.
  </p>
</div>
      </div>
      
    </Modal>
  );
}
