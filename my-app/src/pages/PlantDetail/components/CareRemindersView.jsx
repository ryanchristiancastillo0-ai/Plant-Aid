import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MdCheckCircle,
  MdNotificationsActive,
  MdAdd,
  MdDelete,
} from 'react-icons/md';


import {addReminder, completeReminder, deleteReminder, formatDate, formatTime, reminderTypeMeta, } from '../services/PlantDetailService';



export default function CareRemindersView({ reminders, userId, userPlantId, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ title: '', type: 'WATER', reminderDate: '' });
  const [saving, setSaving]     = useState(false);

  const handleAdd = async () => {
    if (!form.title || !form.reminderDate) return;
    setSaving(true);
    try {
      await addReminder(userId, userPlantId, form);
      setForm({ title: '', type: 'WATER', reminderDate: '' });
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
          <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight">Upcoming Tasks</h3>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">
            {reminders.length} pending reminder{reminders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-zinc-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all"
        >
          <MdAdd className="text-sm" /> Add Reminder
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">New Reminder</p>
          <input
            className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition font-medium text-zinc-800"
            placeholder="e.g. Water Monstera"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition font-medium text-zinc-800"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="WATER">Water</option>
              <option value="FERTILIZE">Fertilize</option>
              <option value="REPOT">Repot</option>
              <option value="CUSTOM">Custom</option>
            </select>
            <input
              type="datetime-local"
              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition font-medium text-zinc-800"
              value={form.reminderDate}
              onChange={(e) => setForm((f) => ({ ...f, reminderDate: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-500 hover:bg-white transition-all">
              Cancel
            </button>
            <button onClick={handleAdd} disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {saving
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Save Reminder'}
            </button>
          </div>
        </div>
      )}

      {reminders.length === 0 && !showForm ? (
        <div className="bg-white border border-zinc-200 rounded-3xl p-10 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <MdNotificationsActive className="text-emerald-600 text-2xl" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">No Pending Tasks</p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Add a reminder to stay on top of care.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {reminders.map((r) => {
            const { label, colorClass } = reminderTypeMeta(r.type);
            return (
              <div key={r.id}
                className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-emerald-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-zinc-100 transition-all duration-200">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex-shrink-0 ${colorClass}`}>
                  {label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-900 truncate">{r.title}</p>
                  <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                    {formatDate(r.reminderDate)} · {formatTime(r.reminderDate)}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => completeReminder(r.id).then(onRefresh)}
                    className="w-8 h-8 rounded-lg hover:bg-emerald-50 flex items-center justify-center transition-colors"
                    title="Mark complete">
                    <MdCheckCircle className="text-lg text-emerald-500" />
                  </button>
                  <button onClick={() => deleteReminder(r.id).then(onRefresh)}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                    title="Delete">
                    <MdDelete className="text-lg text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
