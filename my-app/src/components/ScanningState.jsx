export default function ScanningState({ preview }) {
  return (
    <div className="w-full h-52 rounded-2xl overflow-hidden relative bg-zinc-950">
      {preview && (
        <img src={preview} alt="Scanning" className="w-full h-full object-cover opacity-60" />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-[#1b6b51]/30 border-t-[#1b6b51] animate-spin" />
        <p className="text-white text-sm font-semibold">Scanning plant…</p>
        <p className="text-white/50 text-xs">Plant.id AI is working</p>
      </div>
    </div>
  );
}