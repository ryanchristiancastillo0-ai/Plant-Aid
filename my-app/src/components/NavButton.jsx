
export default function NavButton({ item, isActive, onClick }) {
  const { label, Icon, IconActive } = item;
  const ActiveIcon = isActive ? IconActive : Icon;

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-end gap-0.5 px-2 transition-all duration-200 active:scale-90"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <span
        className={`
          absolute top-0 left-1/2 -translate-x-1/2
          h-0.5 rounded-full bg-[#1b6b51]
          transition-all duration-300 ease-out
          ${isActive ? 'w-6 opacity-100' : 'w-0 opacity-0'}
        `}
      />
      <span
        className={`
          relative flex items-center justify-center
          transition-all duration-300 ease-out
          ${isActive ? 'scale-110' : 'scale-100'}
        `}
      >
        <span
          className={`
            absolute w-10 h-7 rounded-xl
            transition-all duration-300 ease-out
            ${isActive ? 'bg-[#a6f2d1]/40 opacity-100 scale-100' : 'opacity-0 scale-75'}
          `}
        />
        <ActiveIcon
          className={`
            relative text-[22px]
            transition-all duration-300 ease-out
            ${isActive ? 'text-[#1b6b51]' : 'text-zinc-400'}
          `}
        />
      </span>
      <span
        className={`
          text-[10px] font-semibold leading-none
          transition-all duration-300 ease-out
          ${isActive ? 'text-[#1b6b51]' : 'text-zinc-400'}
        `}
      >
        {label}
      </span>
    </button>
  );
}
