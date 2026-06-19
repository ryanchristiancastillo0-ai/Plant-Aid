import { MdWarning } from "react-icons/md";


export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-6">
      <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
        <MdWarning className="text-2xl text-red-500" />
      </div>
      <p className="text-sm font-bold text-red-700">{message}</p>
      <button onClick={onRetry} className="text-xs font-bold text-[#1b6b51] hover:underline">
        Try again
      </button>
    </div>
  );
}