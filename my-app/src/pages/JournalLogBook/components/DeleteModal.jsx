
// React Icons
import { MdDelete,} from 'react-icons/md';


export default function DeleteModal({ entry, onConfirm, onCancel, deleting }) {
  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 max-w-sm w-full border border-[#c8c5ca] shadow-2xl"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-5">
          <MdDelete className="text-xl" />
        </div>
        <h3 className="text-xl font-extrabold text-[#1a1b22] tracking-tight">Delete Entry?</h3>
        <p className="text-sm text-[#47464a] mt-2 leading-relaxed">
          "<strong>{entry.title}</strong>" will be permanently deleted. This cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-3 rounded-2xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Delete'
            }
          </button>
        </div>
      </div>
    </div>
  );
}