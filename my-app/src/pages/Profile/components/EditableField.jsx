import  { useState, useEffect, useRef } from 'react';



import { MdEdit, MdCheck, MdClose,} from 'react-icons/md';


export default function EditableField({ value, onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleSave = async () => {
    if (!draft.trim() || draft.trim() === value) { setEditing(false); return; }
    await onSave(draft.trim());
    setEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter')  handleSave();
    if (e.key === 'Escape') { setDraft(value); setEditing(false); }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          style={{ fontSize: '16px' }}
          className="text-2xl font-extrabold text-black bg-transparent border-b-2 border-[#1b6b51] outline-none w-full max-w-xs"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-8 h-8 rounded-full bg-[#1b6b51] text-white flex items-center justify-center hover:bg-[#237157] transition-colors disabled:opacity-50"
        >
          {saving
            ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <MdCheck className="text-sm" />
          }
        </button>
        <button
          onClick={() => { setDraft(value); setEditing(false); }}
          className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center hover:bg-zinc-200 transition-colors"
        >
          <MdClose className="text-sm" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <h1 className="text-2xl font-extrabold text-black tracking-tight">{value || 'Your Name'}</h1>
      <button
        onClick={() => { setDraft(value); setEditing(true); }}
        className="w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 bg-zinc-100 text-zinc-400 hover:text-[#1b6b51] hover:bg-[#a6f2d1]/40 flex items-center justify-center transition-all"
        title="Edit name"
      >
        <MdEdit className="text-sm" />
      </button>
    </div>
  );
}