
import {MdDeleteOutline,} from 'react-icons/md';

export default function DeleteModal({ isOpen, onConfirm, onCancel, deleting }) {
  if (!isOpen) return null;
  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 max-w-sm w-full border border-neutral-200 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#ffdad6] flex items-center justify-center">
          <MdDeleteOutline className="text-2xl text-[#ba1a1a]" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-black">Delete Record?</h3>
          <p className="text-sm text-[#47464a] mt-1 leading-relaxed">
            This scan record will be permanently removed from your history. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          <button
            onClick={onCancel}
            className="flex-1 border border-neutral-200 text-black py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 bg-[#ba1a1a] text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {deleting
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : 'Delete'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
