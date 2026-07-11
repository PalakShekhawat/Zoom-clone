import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/api/meetings", tags=["meetings"])

# Base URL of the deployed frontend, used to build shareable invite links.
# Configurable via env var so this works cleanly in any deployment
# (falls back to localhost for local dev only).
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000").rstrip("/")


def _build_invite_link(meeting_code: str) -> str:
    return f"{FRONTEND_BASE_URL}/join/{meeting_code}"


@router.post("/instant", response_model=schemas.MeetingOut)
def create_instant_meeting(payload: schemas.CreateInstantMeetingRequest, db: Session = Depends(get_db)):
    host = db.query(models.User).filter(models.User.id == payload.host_id).first()
    if not host:
        raise HTTPException(status_code=404, detail="Host user not found")

    meeting = models.Meeting(
        title=payload.title or "Instant Meeting",
        meeting_type=models.MeetingType.instant,
        status=models.MeetingStatus.active,
        host_id=host.id,
        started_at=datetime.utcnow(),
    )
    db.add(meeting)
    db.flush()  # get meeting.id / default meeting_code before commit
    meeting.invite_link = _build_invite_link(meeting.meeting_code)

    # Host automatically joins as a participant
    host_participant = models.Participant(
        meeting_id=meeting.id,
        user_id=host.id,
        display_name=host.name,
        role=models.ParticipantRole.host,
    )
    db.add(host_participant)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.post("/schedule", response_model=schemas.MeetingOut)
def schedule_meeting(payload: schemas.ScheduleMeetingRequest, db: Session = Depends(get_db)):
    host = db.query(models.User).filter(models.User.id == payload.host_id).first()
    if not host:
        raise HTTPException(status_code=404, detail="Host user not found")

    meeting = models.Meeting(
        title=payload.title,
        description=payload.description,
        meeting_type=models.MeetingType.scheduled,
        status=models.MeetingStatus.scheduled,
        scheduled_time=payload.scheduled_time,
        duration_minutes=payload.duration_minutes,
        host_id=host.id,
    )
    db.add(meeting)
    db.flush()
    meeting.invite_link = _build_invite_link(meeting.meeting_code)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.get("/upcoming", response_model=list[schemas.MeetingOut])
def get_upcoming_meetings(host_id: int = 1, db: Session = Depends(get_db)):
    return (
        db.query(models.Meeting)
        .filter(models.Meeting.host_id == host_id)
        .filter(models.Meeting.status == models.MeetingStatus.scheduled)
        .order_by(models.Meeting.scheduled_time.asc())
        .all()
    )


@router.get("/recent", response_model=list[schemas.MeetingOut])
def get_recent_meetings(host_id: int = 1, db: Session = Depends(get_db)):
    return (
        db.query(models.Meeting)
        .filter(models.Meeting.host_id == host_id)
        .filter(models.Meeting.status == models.MeetingStatus.ended)
        .order_by(models.Meeting.ended_at.desc())
        .limit(10)
        .all()
    )


@router.get("/{meeting_code}", response_model=schemas.MeetingDetailOut)
def get_meeting_by_code(meeting_code: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.post("/join", response_model=schemas.MeetingDetailOut)
def join_meeting(payload: schemas.JoinMeetingRequest, db: Session = Depends(get_db)):
    if not payload.meeting_code and not payload.invite_link:
        raise HTTPException(status_code=400, detail="Provide a meeting code or invite link")

    code = payload.meeting_code
    if not code and payload.invite_link:
        code = payload.invite_link.rstrip("/").split("/")[-1]

    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_code == code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found. Check the ID or link.")
    if meeting.status == models.MeetingStatus.ended:
        raise HTTPException(status_code=410, detail="This meeting has already ended.")

    # Activate a scheduled meeting the moment someone joins
    if meeting.status == models.MeetingStatus.scheduled:
        meeting.status = models.MeetingStatus.active
        meeting.started_at = datetime.utcnow()

    participant = models.Participant(
        meeting_id=meeting.id,
        display_name=payload.display_name,
        role=models.ParticipantRole.participant,
    )
    db.add(participant)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.post("/{meeting_code}/end")
def end_meeting(meeting_code: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting.status = models.MeetingStatus.ended
    meeting.ended_at = datetime.utcnow()
    db.commit()
    return {"detail": "Meeting ended"}


@router.post("/{meeting_code}/participants/{participant_id}/mute")
def mute_participant(meeting_code: str, participant_id: int, db: Session = Depends(get_db)):
    participant = db.query(models.Participant).filter(models.Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    participant.is_muted = True
    db.commit()
    return {"detail": "Participant muted"}


@router.post("/{meeting_code}/mute-all")
def mute_all(meeting_code: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    for p in meeting.participants:
        if p.role != models.ParticipantRole.host:
            p.is_muted = True
    db.commit()
    return {"detail": "All participants muted"}


@router.delete("/{meeting_code}/participants/{participant_id}")
def remove_participant(meeting_code: str, participant_id: int, db: Session = Depends(get_db)):
    participant = db.query(models.Participant).filter(models.Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    db.delete(participant)
    db.commit()
    return {"detail": "Participant removed"}
