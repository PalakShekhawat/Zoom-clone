"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, UserPlus, CalendarPlus, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import JoinMeetingModal from "./JoinMeetingModal";
import ScheduleMeetingModal from "./ScheduleMeetingModal";

export default function ActionTiles({ onScheduled }: { onScheduled: () => void }) {
  const router = useRouter();
  const [showJoin, setShowJoin] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleNewMeeting() {
    setCreating(true);
    setError(null);
    try {
      const meeting = await api.createInstantMeeting();
      router.push(`/meeting/${meeting.meeting_code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start meeting.");
      setCreating(false);
    }
  }

  const buttons = [
    {
      label: "New Meeting",
      icon: creating ? Loader2 : Video,
      color: "bg-zoom-orange hover:bg-[#E4661F]",
      onClick: handleNewMeeting,
      spin: creating,
    },
    {
      label: "Join",
      icon: UserPlus,
      color: "bg-zoom-blue hover:bg-zoom-blue-dark",
      onClick: () => setShowJoin(true),
      spin: false,
    },
    {
      label: "Schedule",
      icon: CalendarPlus,
      color: "bg-zoom-blue hover:bg-zoom-blue-dark",
      onClick: () => setShowSchedule(true),
      spin: false,
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-start" style={{ gap: 40 }}>
        {buttons.map(({ label, icon: Icon, color, onClick, spin }) => (
          <button
            key={label}
            onClick={onClick}
            disabled={creating}
            className="flex flex-col items-center gap-2 disabled:opacity-70"
          >
            <span
              className={`${color} text-white rounded-full flex items-center justify-center transition-colors shadow-sm`}
              style={{ width: 56, height: 56 }}
            >
              <Icon size={22} className={spin ? "animate-spin" : ""} />
            </span>
            <span className="text-[13px] font-medium text-zoom-text">{label}</span>
          </button>
        ))}
      </div>

      {error && <p className="text-[13px] text-zoom-red mt-3">{error}</p>}

      {showJoin && <JoinMeetingModal onClose={() => setShowJoin(false)} />}
      {showSchedule && (
        <ScheduleMeetingModal
          onClose={() => setShowSchedule(false)}
          onScheduled={onScheduled}
        />
      )}
    </div>
  );
}
