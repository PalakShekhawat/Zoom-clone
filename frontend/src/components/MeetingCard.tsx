"use client";

import { format } from "date-fns";
import { Calendar, Copy, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MeetingOut } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function MeetingCard({
  meeting,
  variant,
}: {
  meeting: MeetingOut;
  variant: "upcoming" | "recent";
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  async function copyLink() {
    if (!meeting.invite_link) return;
    try {
      await navigator.clipboard.writeText(meeting.invite_link);
      setCopied(true);
      showToast("Invite link copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast("Couldn't copy link — copy it manually.", "error");
    }
  }

  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-zoom-border hover:bg-zoom-hover/50 transition-colors bg-white">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-md bg-blue-50 text-zoom-blue flex items-center justify-center shrink-0">
          {variant === "upcoming" ? <Calendar size={14} /> : <Video size={14} />}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium truncate">{meeting.title}</p>
          <p className="text-[11px] text-zoom-text-muted">
            {variant === "upcoming" && meeting.scheduled_time
              ? format(new Date(meeting.scheduled_time), "EEE, MMM d · h:mm a")
              : `Meeting ID: ${meeting.meeting_code}`}
            {variant === "upcoming" && ` · ${meeting.duration_minutes} min`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {variant === "upcoming" && (
          <button
            onClick={copyLink}
            className="text-[11px] font-medium text-zoom-text-muted hover:text-zoom-blue flex items-center gap-1 px-1.5 py-1 rounded-md hover:bg-zoom-hover"
          >
            <Copy size={12} />
            {copied ? "Copied!" : "Copy link"}
          </button>
        )}
        {variant === "upcoming" && (
          <button
            onClick={() => router.push(`/meeting/${meeting.meeting_code}`)}
            className="text-[11px] font-semibold text-white bg-zoom-blue hover:bg-zoom-blue-dark px-2.5 py-1 rounded-md"
          >
            Start
          </button>
        )}
      </div>
    </div>
  );
}
