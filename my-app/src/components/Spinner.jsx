import { IoLeaf } from 'react-icons/io5';
export default function FullPageLoader({ message = 'Loading your garden' }) {
  return (
    <div className="fixed inset-0 z-50 bg-zinc-50 flex flex-col items-center justify-center gap-6">
      {/* Animated leaf ring */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Outer spinning ring */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ animationDuration: '1.4s' }}
        >
          <circle
            cx="40" cy="40" r="34"
            stroke="#d1fae5"
            strokeWidth="4"
          />
          <circle
            cx="40" cy="40" r="34"
            stroke="#10b981"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="60 154"
            strokeDashoffset="0"
          />
        </svg>
        {/* Center leaf icon */}
        <IoLeaf className="text-emerald-500 text-3xl z-10" />
      </div>

      {/* Brand */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-extrabold text-zinc-900 tracking-tight">PlantAid</span>
      </div>

      {/* Status message with animated dots */}
      <div className="flex items-center gap-1.5 text-sm text-zinc-400 font-medium">
        <span>{message}</span>
        <span className="flex gap-0.5 items-end pb-0.5">
          <span className="w-1 h-1 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: '0ms',   animationDuration: '1s' }} />
          <span className="w-1 h-1 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }} />
          <span className="w-1 h-1 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }} />
        </span>
      </div>
    </div>
  );
}
