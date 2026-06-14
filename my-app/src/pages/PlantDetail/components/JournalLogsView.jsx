import { useState} from 'react';

import {
  MdEditNote,
  MdAdd,
  MdDelete,

} from 'react-icons/md';


import {
  addJournalEntry,
  deleteJournalEntry,
  formatDate,
} from '../services/PlantDetailService';



export default function JournalLogsView({ journals=[], userId, userPlantId, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ title: '', content: '' });
  const [saving, setSaving]     = useState(false);

  const handleAdd = async () => {
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      await addJournalEntry(userId, userPlantId, form);
      setForm({ title: '', content: '' });
      setShowForm(false);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight">Growth Diary</h3>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">
            {journals?.length} entr{journals?.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-zinc-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all"
        >
          <MdAdd className="text-sm" /> New Entry
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">New Journal Entry</p>
          <input
            className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition font-medium text-zinc-800"
            placeholder="Entry title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <textarea
            className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 resize-none transition font-medium text-zinc-800"
            rows={4}
            placeholder="What did you observe today?"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          />
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-500 hover:bg-white transition-all">
              Cancel
            </button>
            <button onClick={handleAdd} disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {saving
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Save Entry'}
            </button>
          </div>
        </div>
      )}

      {journals.length === 0 && !showForm ? (
        <div className="bg-white border border-zinc-200 rounded-3xl p-10 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center">
            <MdEditNote className="text-zinc-400 text-2xl" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">No Journal Entries</p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Start documenting your plant's journey.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {journals.map((j) => (
            <div key={j.id}
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 flex items-start gap-4 hover:border-emerald-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-zinc-100 transition-all duration-200">
              <div className="w-10 h-10 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <MdEditNote className="text-zinc-400 text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-zinc-900 truncate">{j.title}</p>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed font-medium">{j.content}</p>
                <p className="text-[11px] text-zinc-300 mt-2 font-semibold">{formatDate(j.createdAt)}</p>
              </div>
              <button onClick={() => deleteJournalEntry(j.id).then(onRefresh)}
                className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5"
                title="Delete entry">
                <MdDelete className="text-lg text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}