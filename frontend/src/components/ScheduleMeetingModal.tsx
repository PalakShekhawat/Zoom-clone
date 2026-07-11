"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";

export default function ScheduleMeetingModal({
  onClose,
  onScheduled,
}: {
  onClose: () => void;
  onScheduled: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !date || !time) {
      setError("Please fill in title, date, and time.");
      return;
    }

    setLoading(true);
    try {
      const scheduledTime = new Date(`${date}T${time}`).toISOString();
      await api.scheduleMeeting({
        title,
        description,
        scheduled_time: scheduledTime,
        duration_minutes: duration,
      });
      onScheduled();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not schedule meeting.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zoom-border">
          <h2 className="text-[15px] font-semibold">Schedule a Meeting</h2>
          <button onClick={onClose} className="text-zoom-text-muted hover:text-zoom-text">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSchedule} className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-[12px] font-medium mb-1.5">Title</label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Weekly Team Sync"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 text-[13px] border border-zoom-border rounded-lg focus:border-zoom-blue outline-none" style={{height: 36}}
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5">Description</label>
            <textarea
              placeholder="Optional agenda or notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 text-[13px] border border-zoom-border rounded-lg focus:border-zoom-blue outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 text-[13px] border border-zoom-border rounded-lg focus:border-zoom-blue outline-none" style={{height: 36}}
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 text-[13px] border border-zoom-border rounded-lg focus:border-zoom-blue outline-none" style={{height: 36}}
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 text-[13px] border border-zoom-border rounded-lg focus:border-zoom-blue outline-none" style={{height: 36}}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
            </select>
          </div>

          {error && <p className="text-[12px] text-zoom-red">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zoom-blue hover:bg-zoom-blue-dark text-white font-semibold rounded-lg text-[13px] transition-colors disabled:opacity-60"
            style={{ height: 36 }}
          >
            {loading ? "Scheduling..." : "Schedule"}
          </button>
        </form>
      </div>
    </div>
  );
}
