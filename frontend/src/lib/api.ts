export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type MeetingType = "instant" | "scheduled";
export type MeetingStatus = "scheduled" | "active" | "ended";
export type ParticipantRole = "host" | "co_host" | "participant";

export interface UserOut {
  id: number;
  name: string;
  email: string;
  avatar_color: string;
}

export interface ParticipantOut {
  id: number;
  display_name: string;
  role: ParticipantRole;
  is_muted: boolean;
  is_video_on: boolean;
  joined_at: string;
}

export interface MeetingOut {
  id: number;
  meeting_code: string;
  invite_link: string | null;
  title: string;
  description: string | null;
  meeting_type: MeetingType;
  status: MeetingStatus;
  scheduled_time: string | null;
  duration_minutes: number;
  created_at: string;
  host: UserOut;
}

export interface MeetingDetailOut extends MeetingOut {
  participants: ParticipantOut[];
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "Something went wrong";
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore parse errors
    }
    throw new Error(detail);
  }
  return res.json();
}

export const api = {
  async createInstantMeeting(title?: string): Promise<MeetingOut> {
    const res = await fetch(`${API_BASE_URL}/api/meetings/instant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title || "Instant Meeting", host_id: 1 }),
    });
    return handle<MeetingOut>(res);
  },

  async scheduleMeeting(payload: {
    title: string;
    description?: string;
    scheduled_time: string;
    duration_minutes: number;
  }): Promise<MeetingOut> {
    const res = await fetch(`${API_BASE_URL}/api/meetings/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, host_id: 1 }),
    });
    return handle<MeetingOut>(res);
  },

  async joinMeeting(payload: {
    display_name: string;
    meeting_code?: string;
    invite_link?: string;
  }): Promise<MeetingDetailOut> {
    const res = await fetch(`${API_BASE_URL}/api/meetings/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handle<MeetingDetailOut>(res);
  },

  async getMeeting(code: string): Promise<MeetingDetailOut> {
    const res = await fetch(`${API_BASE_URL}/api/meetings/${code}`);
    return handle<MeetingDetailOut>(res);
  },

  async getUpcoming(): Promise<MeetingOut[]> {
    const res = await fetch(`${API_BASE_URL}/api/meetings/upcoming?host_id=1`, {
      cache: "no-store",
    });
    return handle<MeetingOut[]>(res);
  },

  async getRecent(): Promise<MeetingOut[]> {
    const res = await fetch(`${API_BASE_URL}/api/meetings/recent?host_id=1`, {
      cache: "no-store",
    });
    return handle<MeetingOut[]>(res);
  },

  async endMeeting(code: string): Promise<void> {
    await fetch(`${API_BASE_URL}/api/meetings/${code}/end`, { method: "POST" });
  },

  async muteAll(code: string): Promise<void> {
    await fetch(`${API_BASE_URL}/api/meetings/${code}/mute-all`, { method: "POST" });
  },

  async removeParticipant(code: string, participantId: number): Promise<void> {
    await fetch(`${API_BASE_URL}/api/meetings/${code}/participants/${participantId}`, {
      method: "DELETE",
    });
  },

  async muteParticipant(code: string, participantId: number): Promise<void> {
    await fetch(
      `${API_BASE_URL}/api/meetings/${code}/participants/${participantId}/mute`,
      { method: "POST" }
    );
  },
};
