import  { useState, useRef, } from 'react';
import {
  MdPhotoCamera,
  MdUploadFile,
} from 'react-icons/md';
import { ORGANS } from '../utils/diagnosticUtils'


export default function ScannerViewport({ activeOrgan, setActiveOrgan, onFileSelected, scanning, preview }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    onFileSelected(file);
  };

  return (
      <div className="w-full flex flex-col items-center gap-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
        onClick={() => !scanning && fileRef.current?.click()}
        className={`w-full max-w-3xl bg-zinc-950 rounded-[28px] overflow-hidden relative shadow-2xl border-4 cursor-pointer transition-all duration-300 ${
          isDragging ? 'border-[#1b6b51] scale-[1.01]'
          : scanning  ? 'border-[#1b6b51]/60 cursor-wait'
          :              'border-white hover:border-[#1b6b51]/60'
        }`}
        style={{ aspectRatio: '9/16', maxHeight: '70vh' }}
      >
        {preview ? (
          <img src={preview} alt="Scan preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-900 to-zinc-950">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center">
              <MdPhotoCamera className="text-4xl text-zinc-500" />
            </div>
            <p className="text-zinc-500 text-sm font-medium">Drag an image or tap to upload</p>
          </div>
        )}

        {scanning && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20">
            <div className="w-16 h-16 rounded-full border-4 border-[#1b6b51]/30 border-t-[#1b6b51] animate-spin" />
            <p className="text-white text-sm font-semibold">Analysing specimen…</p>
            <p className="text-white/50 text-xs">Plant.id AI + Gemini are working</p>
          </div>
        )}

        {!scanning && (
          <div className="absolute inset-0 pointer-events-none p-6">
            {[
              'top-6 left-6 border-t-4 border-l-4 rounded-tl-xl',
              'top-6 right-6 border-t-4 border-r-4 rounded-tr-xl',
              'bottom-6 left-6 border-b-4 border-l-4 rounded-bl-xl',
              'bottom-6 right-6 border-b-4 border-r-4 rounded-br-xl',
            ].map((cls, i) => (
              <div key={i} className={`absolute w-10 h-10 border-white/30 ${cls} animate-pulse`} />
            ))}
          </div>
        )}

        {!scanning && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-emerald-900/30 backdrop-blur-sm border border-emerald-500/30 rounded-lg px-3 py-1.5 z-10">
            <div className="w-2 h-2 bg-[#1b6b51] rounded-full animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-[#1b6b51] font-bold">Live Precision Engine</span>
          </div>
        )}

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center bg-zinc-900/80 backdrop-blur-md rounded-full p-1.5 border border-white/10 z-10">
          {ORGANS.map((organ) => (
            <button
              key={organ}
              onClick={(e) => { e.stopPropagation(); setActiveOrgan(organ); }}
              className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
                activeOrgan === organ ? 'bg-[#1b6b51] text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {organ}
            </button>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none" />
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])} />

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-[#1b6b51]/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          <button
            onClick={() => !scanning && fileRef.current?.click()}
            disabled={scanning}
            className="relative z-10 w-[72px] h-[72px] bg-black text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all duration-200 border-4 border-[#fbf8ff] hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-wait"
          >
            <MdPhotoCamera className="text-[28px]" />
          </button>
        </div>
        <button
          onClick={() => !scanning && fileRef.current?.click()}
          disabled={scanning}
          className="text-sm text-[#1b6b51] font-semibold flex items-center gap-2 hover:opacity-75 transition-opacity disabled:opacity-40"
        >
          <MdUploadFile className="text-lg" />
          Or upload from device gallery
        </button>
      </div>
    </div>
  );
}
