
import { useState, } from 'react';

import {
  MdPhotoCamera,
} from 'react-icons/md';



export default function UploadPrompt({ onFile, fileRef }) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      onDragOver={(e)  => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={()  => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        onFile(e.dataTransfer.files?.[0]);
      }}
      onClick={() => fileRef.current?.click()}
      className={`w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
        isDragging
          ? 'border-[#1b6b51] bg-[#a6f2d1]/20'
          : 'border-[#c8c5ca] bg-white dark:bg-zinc-900 hover:border-[#1b6b51]/60'
      }`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#a6f2d1]/30 flex items-center justify-center">
        <MdPhotoCamera className="text-3xl text-[#1b6b51]" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-black dark:text-white">Take or upload a photo</p>
        <p className="text-xs text-[#47464a] mt-0.5">Tap to open camera or gallery</p>
      </div>
    </div>
  );
}