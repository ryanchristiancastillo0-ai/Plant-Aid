import  { useState} from 'react';
import {

  getTodayLabel,
  validateEntry,
} from '../services/JournalEntryService';

// React Icons
import { MdErrorOutline, MdBookmark, MdCalendarToday,MdClose} from 'react-icons/md';
import {PlantSelector,ImageDropzone} from './index'

export default function EntryModal({ mode, entry, onClose, onSave, saving, plants, loadingPlants }) {
  const isEdit = mode === 'edit';

  const [title,           setTitle]           = useState(entry?.title   ?? '');
  const [body,            setBody]            = useState(entry?.content ?? '');
  const [selectedPlantId, setSelectedPlantId] = useState(entry?.userPlantId ?? '');
  const [customPlant,     setCustomPlant]     = useState('');
  const [imageFile,       setImageFile]       = useState(null);
  const [preview,         setPreview]         = useState(entry?.imageUrl ?? '');
  const [validationError, setValidationError] = useState(null);

  const handleFile  = (file) => { setImageFile(file); setPreview(URL.createObjectURL(file)); };
  const handleClear = ()     => { setImageFile(null); setPreview(''); };

  const handleSubmit = () => {
    const err = validateEntry(title, body);
    if (err) { setValidationError(err); return; }
    setValidationError(null);

    // Resolve plant label: use custom text if __custom__ selected
    const resolvedPlantId = selectedPlantId === '__custom__' ? '' : selectedPlantId;
    const plantLabel      = selectedPlantId === '__custom__' ? customPlant.trim() : '';

    onSave({ title, content: body, imageFile, userPlantId: resolvedPlantId, customPlantLabel: plantLabel });
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md"
    >
      <div
        className="bg-[#fbf8ff] w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95dvh] sm:max-h-[90vh] mx-0 sm:mx-4 animate-[slideUp_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#c8c5ca]/60" />
        </div>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 sm:px-8 pt-4 pb-4 border-b border-zinc-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#a6f2d1] flex items-center justify-center flex-shrink-0">
              <MdBookmark className="text-[#1b6b51] text-base" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#1a1b22] tracking-tight">
              {isEdit ? 'Edit Entry' : 'New Journal Entry'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"
          >
            <MdClose className="text-zinc-500 text-lg" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-8 py-5 space-y-6">

          {/* Validation error */}
          {validationError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl px-4 py-3">
              <MdErrorOutline className="flex-shrink-0" />
              {validationError}
            </div>
          )}

          {/* Title — big like NewJournalEntry */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title your botanical observation…"
            style={{ fontSize: '16px' }}
            className="w-full border-none p-0 focus:ring-0 text-2xl sm:text-3xl font-bold placeholder:text-[#c8c5ca] bg-transparent outline-none text-[#1a1b22]"
          />

          {/* Metadata row — date + plant selector */}
          <div className="flex flex-wrap items-start gap-3 border-b border-[#c8c5ca]/60 pb-5">
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[#f4f2fd] rounded-full text-[#47464a] flex-shrink-0">
              <MdCalendarToday className="text-sm" />
              <span className="text-sm">{getTodayLabel()}</span>
            </div>

            <PlantSelector
              plants={plants}
              selectedId={selectedPlantId}
              onSelect={setSelectedPlantId}
              customPlant={customPlant}
              onCustomChange={setCustomPlant}
              loadingPlants={loadingPlants}
            />
          </div>

          {/* Body textarea */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Today's observations on growth, humidity, and nutrient response…"
            rows={8}
            style={{ fontSize: '16px' }}
            className="w-full border-none p-0 focus:ring-0 text-base placeholder:text-[#c8c5ca] bg-transparent resize-none leading-relaxed outline-none text-[#1a1b22]"
          />

          {/* Photo dropzone */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Photo (optional)
            </label>
            <ImageDropzone preview={preview} onFile={handleFile} onClear={handleClear} />
          </div>

        </div>

        {/* ── Footer actions ── */}
        <div className="px-5 sm:px-8 pb-6 pt-4 border-t border-zinc-100 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : isEdit ? 'Save Changes' : 'Publish Entry'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
