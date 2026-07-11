"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Video } from "lucide-react";
import { api, type MeetingOut } from "@/lib/api";

export default function JoinByLinkPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const [meeting, setMeeting] = useState<MeetingOut | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    api
      .getMeeting(code)
      .then(setMeeting)
      .catch(() => setError("This meeting doesn't exist or the link is invalid."))
      .finally(() => setLoading(false));
  }, [code]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Please enter your name to join.");
      return;
    }
    setJoining(true);
    setError(null);
    try {
      const joined = await api.joinMeeting({ display_name: displayName, meeting_code: code });
      router.push(`/meeting/${joined.meeting_code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join meeting.");
      setJoining(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA] px-4">
      <div className="bg-white rounded-xl shadow-md border border-zoom-border w-full max-w-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-zoom-blue flex items-center justify-center text-white font-black">
            Z
          </div>
          <span className="font-bold text-lg">Zoom Clone</span>
        </div>

        {loading ? (
          <p className="text-sm text-zoom-text-muted">Checking meeting...</p>
        ) : meeting ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Video size={16} className="text-zoom-blue" />
              <p className="font-semibold text-sm">{meeting.title}</p>
            </div>
            <p className="text-xs text-zoom-text-muted mb-5">
              Meeting ID: {meeting.meeting_code} · Hosted by {meeting.host.name}
            </p>

            <form onSubmit={handleJoin} className="flex flex-col gap-3">
              <input
                autoFocus
                type="text"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-zoom-border rounded-md focus:border-zoom-blue outline-none"
              />
              {error && <p className="text-sm text-zoom-red">{error}</p>}
              <button
                type="submit"
                disabled={joining}
                className="w-full bg-zoom-blue hover:bg-zoom-blue-dark text-white font-semibold py-2.5 rounded-md transition-colors disabled:opacity-60"
              >
                {joining ? "Joining..." : "Join Meeting"}
              </button>
            </form>
          </>
        ) : (
          <p className="text-sm text-zoom-red">{error}</p>
        )}
      </div>
    </div>
  );
}
