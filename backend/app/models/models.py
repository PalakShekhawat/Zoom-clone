"""
Database schema.

Design notes (for the evaluation interview):
- users: minimal user table. Since auth is out of scope, we seed one
  "default logged in user" plus a few extra users for sample data
  (as hosts of past/upcoming meetings).
- meetings: covers both instant AND scheduled meetings via `meeting_type`.
  `meeting_code` is the short human-friendly ID (e.g. 482-193-201) used
  to join; `invite_link` is the shareable full URL built from it.
- participants: join table between meetings and "attendees". An attendee
  may or may not be a registered user (guests join with just a display
  name), so user_id is nullable but display_name is always stored.
- Relationships: User 1---N Meeting (as host), Meeting 1---N Participant.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, Enum, Boolean, Text
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class MeetingType(str, enum.Enum):
    instant = "instant"
    scheduled = "scheduled"


class MeetingStatus(str, enum.Enum):
    scheduled = "scheduled"   # upcoming, not started
    active = "active"         # currently in progress
    ended = "ended"           # finished


class ParticipantRole(str, enum.Enum):
    host = "host"
    co_host = "co_host"
    participant = "participant"


def generate_meeting_code() -> str:
    """Zoom-style 9 digit meeting code, e.g. 482-193-201."""
    digits = str(uuid.uuid4().int)[:9].zfill(9)
    return f"{digits[0:3]}-{digits[3:6]}-{digits[6:9]}"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    avatar_color = Column(String(20), default="#2D8CFF")  # Zoom blue default
    created_at = Column(DateTime, default=datetime.utcnow)

    meetings_hosted = relationship("Meeting", back_populates="host")


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    meeting_code = Column(String(15), unique=True, index=True, default=generate_meeting_code)
    invite_link = Column(String(255), nullable=True)

    title = Column(String(200), nullable=False, default="Instant Meeting")
    description = Column(Text, nullable=True)

    meeting_type = Column(Enum(MeetingType), nullable=False, default=MeetingType.instant)
    status = Column(Enum(MeetingStatus), nullable=False, default=MeetingStatus.scheduled)

    scheduled_time = Column(DateTime, nullable=True)   # null for instant meetings
    duration_minutes = Column(Integer, default=30)

    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    host = relationship("User", back_populates="meetings_hosted")

    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)

    participants = relationship(
        "Participant", back_populates="meeting", cascade="all, delete-orphan"
    )


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # null = guest

    display_name = Column(String(100), nullable=False)
    role = Column(Enum(ParticipantRole), default=ParticipantRole.participant)

    is_muted = Column(Boolean, default=False)
    is_video_on = Column(Boolean, default=True)

    joined_at = Column(DateTime, default=datetime.utcnow)
    left_at = Column(DateTime, nullable=True)

    meeting = relationship("Meeting", back_populates="participants")
    user = relationship("User")
