"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function JoinMeetingModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [meetingCode, setMeetingCode] = useState("");
  const [displayName, setDisplayName] = useState("Alex Morgan");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!meetingCode.trim()) {
      setError("Please enter a meeting ID or invite link.");
      return;
    }
    if (!displayName.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      // Accept either a raw code (123-456-789) or a full invite link
      const trimmed = meetingCode.trim();
      const isLink = trimmed.includes("/");
      const payload = isLink
        ? { display_name: displayName, invite_link: trimmed }
        : { display_name: displayName, meeting_code: trimmed };

      const meeting = await api.joinMeeting(payload);
      router.push(`/meeting/${meeting.meeting_code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join meeting.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zoom-border">
          <h2 className="text-[15px] font-semibold">Join a Meeting</h2>
          <button onClick={onClose} className="text-zoom-text-muted hover:text-zoom-text">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleJoin} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-medium mb-1.5">
              Meeting ID or invite link
            </label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. 123-456-789"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              className="w-full px-3 text-[13px] border border-zoom-border rounded-lg focus:border-zoom-blue outline-none" style={{height: 36}}
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5">Your name</label>
            <input
              type="text"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 text-[13px] border border-zoom-border rounded-lg focus:border-zoom-blue outline-none" style={{height: 36}}
            />
          </div>

          {error && <p className="text-[12px] text-zoom-red">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zoom-blue hover:bg-zoom-blue-dark text-white font-semibold rounded-lg text-[13px] transition-colors disabled:opacity-60"
            style={{ height: 36 }}
          >
            {loading ? "Joining..." : "Join"}
          </button>
        </form>
      </div>
    </div>
  );
}
