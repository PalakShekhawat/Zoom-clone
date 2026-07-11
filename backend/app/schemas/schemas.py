from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

from app.models.models import MeetingType, MeetingStatus, ParticipantRole


# ---------- User ----------
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    avatar_color: str


# ---------- Participant ----------
class ParticipantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    display_name: str
    role: ParticipantRole
    is_muted: bool
    is_video_on: bool
    joined_at: datetime


class JoinMeetingRequest(BaseModel):
    display_name: str
    meeting_code: Optional[str] = None   # accept either code...
    invite_link: Optional[str] = None    # ...or a full invite link


# ---------- Meeting ----------
class CreateInstantMeetingRequest(BaseModel):
    title: Optional[str] = "Instant Meeting"
    host_id: int = 1  # default logged-in user (no auth in this app)


class ScheduleMeetingRequest(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_time: datetime
    duration_minutes: int = 30
    host_id: int = 1


class MeetingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    meeting_code: str
    invite_link: Optional[str]
    title: str
    description: Optional[str]
    meeting_type: MeetingType
    status: MeetingStatus
    scheduled_time: Optional[datetime]
    duration_minutes: int
    created_at: datetime
    host: UserOut


class MeetingDetailOut(MeetingOut):
    participants: List[ParticipantOut] = []
