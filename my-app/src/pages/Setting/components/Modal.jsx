import  { useEffect, useRef,} from 'react';
import { MdClose } from 'react-icons/md';



export default function Modal({ isOpen, onClose, title, children }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else        document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      {/* Sheet: slides up from bottom on mobile, centered on sm+ */}
      <div className="
        bg-white w-full sm:max-w-md
        rounded-t-3xl sm:rounded-3xl
        shadow-2xl
        flex flex-col
        max-h-[92dvh] sm:max-h-[85vh]
        animate-[slideUp_0.25s_ease-out]
        mx-0 sm:mx-4
      ">
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#c8c5ca]/60" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-[#c8c5ca]/30 flex-shrink-0 sm:pt-5 sm:px-6">
          <h3 className="text-base sm:text-lg font-bold text-black tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f4f2fd] flex items-center justify-center hover:bg-[#e8e7f1] transition-colors flex-shrink-0"
          >
            <MdClose className="text-[#47464a] text-lg" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}