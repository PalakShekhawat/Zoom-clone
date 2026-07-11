"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Users, X, ShieldOff,
  Link2, Minimize2, Square, Maximize2, Crown, GripVertical,
} from "lucide-react";
import { api, type MeetingDetailOut, type ParticipantOut } from "@/lib/api";
import { useToast } from "@/components/Toast";

type PipSize = "sm" | "md" | "lg";
const PIP_DIMENSIONS: Record<PipSize, { w: number; h: number }> = {
  sm: { w: 130, h: 98 },
  md: { w: 190, h: 143 },
  lg: { w: 260, h: 195 },
};

// Adaptive video grid: pick a column count that keeps tiles reasonably
// sized as the participant count grows, Zoom-gallery-view style.
function gridColumns(tileCount: number): number {
  if (tileCount <= 1) return 1;
  if (tileCount <= 2) return 2;
  if (tileCount <= 4) return 2;
  if (tileCount <= 9) return 3;
  return 4;
}

export default function MeetingRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const gridAreaRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const [meeting, setMeeting] = useState<MeetingDetailOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Self-view resize/drag state (used once other participants are present
  // and the self tile becomes a floating picture-in-picture box).
  const [pipSize, setPipSize] = useState<PipSize>("md");
  const [pipPos, setPipPos] = useState<{ x: number; y: number } | null>(null);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  // Load meeting details
  useEffect(() => {
    api
      .getMeeting(code)
      .then(setMeeting)
      .catch((err) => setError(err instanceof Error ? err.message : "Meeting not found"))
      .finally(() => setLoading(false));
  }, [code]);

  // Start local camera/mic preview (assignment scope: local preview only,
  // not real peer-to-peer video between browsers)
  useEffect(() => {
    let active = true;
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCameraError("Camera/mic not available or permission denied."));

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function toggleMute() {
    const stream = streamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach((t) => (t.enabled = muted));
    }
    setMuted((m) => !m);
  }

  function toggleVideo() {
    const stream = streamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach((t) => (t.enabled = !videoOn));
    }
    setVideoOn((v) => !v);
  }

  async function handleEndCall() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    await api.endMeeting(code).catch(() => {});
    router.push("/");
  }

  async function handleMuteAll() {
    await api.muteAll(code).catch(() => {});
    const updated = await api.getMeeting(code).catch(() => null);
    if (updated) setMeeting(updated);
  }

  async function handleRemove(participantId: number) {
    await api.removeParticipant(code, participantId).catch(() => {});
    const updated = await api.getMeeting(code).catch(() => null);
    if (updated) setMeeting(updated);
  }

  async function handleMuteOne(participantId: number) {
    await api.muteParticipant(code, participantId).catch(() => {});
    const updated = await api.getMeeting(code).catch(() => null);
    if (updated) setMeeting(updated);
  }

  async function handleCopyInvite() {
    if (!meeting?.invite_link) return;
    try {
      await navigator.clipboard.writeText(meeting.invite_link);
      showToast("Invite link copied to clipboard");
    } catch {
      showToast("Couldn't copy the link — copy it manually.", "error");
    }
  }

  // --- Self-view drag handlers (only active once the tile is floating) ---
  function onDragPointerDown(e: React.PointerEvent) {
    const container = gridAreaRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const { w, h } = PIP_DIMENSIONS[pipSize];
    const current = pipPos ?? { x: rect.width - w - 16, y: rect.height - h - 16 };
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: current.x,
      origY: current.y,
    };
    setPipPos(current);
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onDragPointerMove(e: React.PointerEvent) {
    if (!dragState.current || !gridAreaRef.current) return;
    const rect = gridAreaRef.current.getBoundingClientRect();
    const { w, h } = PIP_DIMENSIONS[pipSize];
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    let nx = dragState.current.origX + dx;
    let ny = dragState.current.origY + dy;
    nx = Math.max(0, Math.min(nx, rect.width - w));
    ny = Math.max(0, Math.min(ny, rect.height - h));
    setPipPos({ x: nx, y: ny });
  }

  function onDragPointerUp() {
    dragState.current = null;
    setDragging(false);
  }

  function cyclePipSize() {
    setPipSize((s) => (s === "sm" ? "md" : s === "md" ? "lg" : "sm"));
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1C1D21] text-white">
        Loading meeting...
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#1C1D21] text-white gap-4">
        <p>{error || "Meeting not found."}</p>
        <button
          onClick={() => router.push("/")}
          className="bg-zoom-blue px-4 py-2 rounded-md font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const otherParticipants: ParticipantOut[] = meeting.participants.filter(
    (p) => p.role !== "host"
  );
  // Once others are present, self-view becomes a floating, resizable/draggable
  // picture-in-picture tile instead of taking a grid slot.
  const selfIsFloating = otherParticipants.length > 0;
  const cols = gridColumns(selfIsFloating ? otherParticipants.length : otherParticipants.length + 1);

  const selfTile = (
    <div
      className="relative rounded-xl overflow-hidden bg-[#2A2B31] flex items-center justify-center w-full h-full"
    >
      {videoOn ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover -scale-x-100"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-zoom-blue flex items-center justify-center font-bold text-xl">
          AM
        </div>
      )}
      {cameraError && (
        <p className="absolute bottom-8 text-[11px] text-white/60 px-2 text-center">
          {cameraError}
        </p>
      )}
      <span className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-0.5 rounded flex items-center gap-1">
        {muted && <MicOff size={11} />} You (Host)
      </span>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#1C1D21] text-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-3 border-b border-white/10 shrink-0 flex-wrap">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{meeting.title}</p>
          <p className="text-xs text-white/50">Meeting ID: {meeting.meeting_code}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {meeting.invite_link && (
            <button
              onClick={handleCopyInvite}
              className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md"
              title="Copy invite link"
            >
              <Link2 size={14} />
              <span className="hidden sm:inline">Copy Invite Link</span>
            </button>
          )}
          <button
            onClick={() => setShowParticipants((v) => !v)}
            className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md"
          >
            <Users size={14} />
            Participants ({meeting.participants.length})
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 relative">
        {/* Video grid */}
        <div
          ref={gridAreaRef}
          className="relative flex-1 p-5 overflow-y-auto"
        >
          <div
            className="grid gap-4 auto-rows-[minmax(140px,1fr)] content-start"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {/* Self tile occupies a normal grid slot only when alone */}
            {!selfIsFloating && <div className="aspect-video">{selfTile}</div>}

            {/* Tiles for other participants (no real WebRTC — static avatar
                placeholder tiles driven by real participant data) */}
            {otherParticipants.map((p) => (
              <div
                key={p.id}
                className="relative rounded-xl overflow-hidden bg-[#2A2B31] flex items-center justify-center aspect-video"
              >
                <div className="w-16 h-16 rounded-full bg-zoom-orange flex items-center justify-center font-bold text-xl">
                  {p.display_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <span className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-0.5 rounded flex items-center gap-1">
                  {p.is_muted && <MicOff size={11} />} {p.display_name}
                </span>
              </div>
            ))}
          </div>

          {/* Floating, resizable/draggable self-view (PiP) once others join */}
          {selfIsFloating && (
            <div
              className="absolute rounded-xl shadow-lg select-none"
              style={{
                width: PIP_DIMENSIONS[pipSize].w,
                height: PIP_DIMENSIONS[pipSize].h,
                left: pipPos?.x ?? undefined,
                top: pipPos?.y ?? undefined,
                right: pipPos ? undefined : 16,
                bottom: pipPos ? undefined : 16,
                cursor: dragging ? "grabbing" : "default",
                touchAction: "none",
              }}
            >
              {selfTile}
              {/* Drag handle */}
              <div
                onPointerDown={onDragPointerDown}
                onPointerMove={onDragPointerMove}
                onPointerUp={onDragPointerUp}
                className="absolute top-1.5 left-1.5 p-1 rounded bg-black/40 hover:bg-black/60 cursor-grab active:cursor-grabbing"
                title="Drag to reposition"
              >
                <GripVertical size={13} />
              </div>
              {/* Size toggle */}
              <button
                onClick={cyclePipSize}
                className="absolute top-1.5 right-1.5 p-1 rounded bg-black/40 hover:bg-black/60"
                title={`Self-view size: ${pipSize} (click to resize)`}
              >
                {pipSize === "sm" && <Maximize2 size={13} />}
                {pipSize === "md" && <Square size={11} />}
                {pipSize === "lg" && <Minimize2 size={13} />}
              </button>
            </div>
          )}
        </div>

        {/* Participants panel */}
        {showParticipants && (
          <div className="fixed inset-0 z-40 sm:static sm:z-auto sm:w-72 bg-[#232429] border-l border-white/10 flex flex-col shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="text-sm font-semibold">
                Participants ({meeting.participants.length})
              </p>
              <button onClick={() => setShowParticipants(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {meeting.participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 px-2 py-2 rounded-md hover:bg-white/5"
                >
                  <span className="text-sm truncate flex items-center gap-1.5 min-w-0">
                    <span className="truncate">{p.display_name}</span>
                    {p.role === "host" && (
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold bg-zoom-blue/20 text-zoom-blue px-1.5 py-0.5 rounded-full shrink-0">
                        <Crown size={10} /> Host
                      </span>
                    )}
                    {p.is_muted && <MicOff size={12} className="text-white/40 shrink-0" />}
                  </span>
                  {p.role !== "host" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleMuteOne(p.id)}
                        disabled={p.is_muted}
                        className="text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-default"
                        title={p.is_muted ? "Already muted" : "Mute participant"}
                      >
                        {p.is_muted ? <MicOff size={14} /> : <Mic size={14} />}
                      </button>
                      <button
                        onClick={() => handleRemove(p.id)}
                        className="text-white/50 hover:text-red-400"
                        title="Remove participant"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-white/10">
              <button
                onClick={handleMuteAll}
                className="w-full flex items-center justify-center gap-2 text-xs bg-white/10 hover:bg-white/20 py-2 rounded-md"
              >
                <ShieldOff size={13} /> Mute All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-center gap-3 py-4 border-t border-white/10 shrink-0">
        <ControlButton
          active={!muted}
          onClick={toggleMute}
          icon={muted ? <MicOff size={19} /> : <Mic size={19} />}
          label={muted ? "Unmute" : "Mute"}
        />
        <ControlButton
          active={videoOn}
          onClick={toggleVideo}
          icon={videoOn ? <Video size={19} /> : <VideoOff size={19} />}
          label={videoOn ? "Stop Video" : "Start Video"}
        />
        <button
          onClick={handleEndCall}
          className="flex flex-col items-center gap-1 px-5 py-2 rounded-lg bg-zoom-red hover:bg-red-700 transition-colors"
        >
          <PhoneOff size={19} />
          <span className="text-[11px] font-medium">End</span>
        </button>
      </div>
    </div>
  );
}

function ControlButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-5 py-2 rounded-lg transition-colors ${
        active ? "bg-white/10 hover:bg-white/20" : "bg-red-600/80 hover:bg-red-700"
      }`}
    >
      {icon}
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}
