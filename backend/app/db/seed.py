"""
Seeds the database with sample data:
- A default logged-in user (id=1) since there's no auth
- A couple of extra users (as past-meeting hosts/participants)
- A few upcoming (scheduled) meetings
- A few recent (ended) meetings with participants
Run with: python -m app.db.seed
"""
from datetime import datetime, timedelta

from app.db.database import SessionLocal, engine, Base
from app.models import models


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(models.User).count() > 0:
        print("Database already seeded. Skipping.")
        db.close()
        return

    # --- Users ---
    default_user = models.User(name="Alex Morgan", email="alex@example.com", avatar_color="#2D8CFF")
    jordan = models.User(name="Jordan Lee", email="jordan@example.com", avatar_color="#F26D21")
    sam = models.User(name="Sam Rivera", email="sam@example.com", avatar_color="#00A76F")
    db.add_all([default_user, jordan, sam])
    db.flush()  # assign IDs

    # --- Upcoming (scheduled) meetings, hosted by default user ---
    upcoming1 = models.Meeting(
        title="Weekly Product Sync",
        description="Review sprint progress and blockers",
        meeting_type=models.MeetingType.scheduled,
        status=models.MeetingStatus.scheduled,
        scheduled_time=datetime.utcnow() + timedelta(days=1, hours=2),
        duration_minutes=30,
        host_id=default_user.id,
    )
    upcoming2 = models.Meeting(
        title="Client Onboarding Call",
        description="Walkthrough of the platform for new client",
        meeting_type=models.MeetingType.scheduled,
        status=models.MeetingStatus.scheduled,
        scheduled_time=datetime.utcnow() + timedelta(days=2, hours=5),
        duration_minutes=45,
        host_id=default_user.id,
    )
    db.add_all([upcoming1, upcoming2])
    db.flush()
    upcoming1.invite_link = f"http://localhost:3000/join/{upcoming1.meeting_code}"
    upcoming2.invite_link = f"http://localhost:3000/join/{upcoming2.meeting_code}"

    # --- Recent (ended) meetings ---
    recent1 = models.Meeting(
        title="Design Review",
        description="Homepage redesign feedback",
        meeting_type=models.MeetingType.instant,
        status=models.MeetingStatus.ended,
        duration_minutes=25,
        host_id=default_user.id,
        started_at=datetime.utcnow() - timedelta(days=1, hours=3),
        ended_at=datetime.utcnow() - timedelta(days=1, hours=2, minutes=35),
    )
    recent2 = models.Meeting(
        title="1:1 with Jordan",
        meeting_type=models.MeetingType.instant,
        status=models.MeetingStatus.ended,
        duration_minutes=15,
        host_id=default_user.id,
        started_at=datetime.utcnow() - timedelta(days=3),
        ended_at=datetime.utcnow() - timedelta(days=3) + timedelta(minutes=15),
    )
    db.add_all([recent1, recent2])
    db.flush()
    recent1.invite_link = f"http://localhost:3000/join/{recent1.meeting_code}"
    recent2.invite_link = f"http://localhost:3000/join/{recent2.meeting_code}"

    # Participants for recent1
    db.add_all([
        models.Participant(meeting_id=recent1.id, user_id=default_user.id, display_name=default_user.name, role=models.ParticipantRole.host),
        models.Participant(meeting_id=recent1.id, user_id=jordan.id, display_name=jordan.name),
        models.Participant(meeting_id=recent1.id, user_id=sam.id, display_name=sam.name),
    ])
    db.add_all([
        models.Participant(meeting_id=recent2.id, user_id=default_user.id, display_name=default_user.name, role=models.ParticipantRole.host),
        models.Participant(meeting_id=recent2.id, user_id=jordan.id, display_name=jordan.name),
    ])

    db.commit()
    db.close()
    print("Database seeded successfully.")


if __name__ == "__main__":
    run()
