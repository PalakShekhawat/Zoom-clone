# Zoom Clone — Video Conferencing Platform

A functional clone of Zoom's web app dashboard and meeting workflows, built for the SDE Fullstack Assignment.

**Live demo:** _add your deployed link here_
**Video walkthrough (optional):** _add if recorded_

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4, lucide-react icons |
| Backend | Python, FastAPI, SQLAlchemy ORM |
| Database | SQLite (`zoom_clone.db`, auto-created on first run) |
| Video | Browser `getUserMedia` (local camera/mic preview) — see **Assumptions** below |

---

## Project Structure

```
zoom-clone/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app entrypoint, CORS, router registration
│   │   ├── models/models.py   # SQLAlchemy models (User, Meeting, Participant)
│   │   ├── schemas/schemas.py # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── meetings.py    # instant/schedule/join/upcoming/recent/host-controls
│   │   │   └── users.py       # default user endpoint (no auth)
│   │   └── db/
│   │       ├── database.py    # SQLAlchemy engine/session
│   │       └── seed.py        # seeds sample users + meetings
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx           # Dashboard (Home)
    │   │   ├── login/page.tsx     # Fake login/signup UI (bonus, no real auth)
    │   │   ├── join/[code]/page.tsx    # Invite-link landing page
    │   │   └── meeting/[code]/page.tsx # Meeting room
    │   ├── components/            # Sidebar, TopBar, modals, meeting cards, action tiles
    │   └── lib/api.ts             # Typed API client for the FastAPI backend
    └── package.json
```

---

## Database Schema

Three tables, designed around how Zoom's actual data model works:

**`users`** — minimal user record (no auth fields, since login is out of scope)
- `id`, `name`, `email`, `avatar_color`, `created_at`

**`meetings`** — covers both instant and scheduled meetings via `meeting_type`
- `id`, `meeting_code` (unique, e.g. `482-193-201`), `invite_link`
- `title`, `description`
- `meeting_type` (`instant` | `scheduled`), `status` (`scheduled` | `active` | `ended`)
- `scheduled_time`, `duration_minutes`
- `host_id` → FK to `users.id`
- `created_at`, `started_at`, `ended_at`

**`participants`** — join table between meetings and attendees
- `id`, `meeting_id` → FK to `meetings.id`
- `user_id` → FK to `users.id`, **nullable** (guests join with just a display name)
- `display_name`, `role` (`host` | `co_host` | `participant`)
- `is_muted`, `is_video_on`
- `joined_at`, `left_at`

**Relationships:** `User 1—N Meeting` (as host), `Meeting 1—N Participant` (cascade delete).

---

## Setup Instructions

### Backend (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Seed sample data (creates zoom_clone.db, default user, sample meetings)
python -m app.db.seed

# Run the API
uvicorn app.main:app --reload --port 8000
```

API will be live at `http://localhost:8000` (interactive docs at `/docs`).

**Deployment config (`backend/.env`, see `.env.example`):**
- `FRONTEND_BASE_URL` — the deployed frontend's URL, used to build shareable invite links (e.g. `https://myapp.vercel.app`). Defaults to `http://localhost:3000` for local dev.
- `CORS_ORIGINS` — comma-separated list of allowed origins in production. Defaults to `*`.

### Frontend (Next.js)

```bash
cd frontend
npm install

# Point the frontend at your backend (already set for local dev)
# .env.local -> NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```

App will be live at `http://localhost:3000`.

**Deployment config (`frontend/.env.local`, see `.env.example`):**
- `NEXT_PUBLIC_API_URL` — the deployed backend's URL (no trailing slash). No URLs are hardcoded anywhere else in the app, so this is the only value to change when deploying.

---

## Core Features Implemented

- **Landing Dashboard** — navbar, profile placeholder, New/Join/Schedule buttons, Upcoming & Recent Meetings sections
- **Instant Meeting** — generates a unique 9-digit meeting code + shareable invite link, redirects straight into the meeting room
- **Copy Invite Link** — clipboard copy with toast confirmation, available from the dashboard's Upcoming Meetings list and from inside the meeting room header
- **Join Meeting** — join by meeting code *or* full invite link, enter a display name, backend validates the meeting exists and hasn't ended; visiting an invite URL directly opens the join flow
- **Schedule Meeting** — title, description, date/time picker, duration; auto-generates a link and shows up in Upcoming Meetings
- **Adaptive meeting room** — video grid layout scales its column count with participant count; once other participants join, your own camera becomes a draggable, resizable (small/medium/large) picture-in-picture tile instead of taking a grid slot
- **Host Controls** — Mute All, mute an individual participant, remove a participant, host badge, live participant count, participant list panel (full-screen on mobile)
- **Fake Login/Signup (bonus)** — UI-only, see Assumptions below
- **Responsive layout** — desktop appearance is unchanged; sidebar collapses to a mobile bottom tab bar on small screens, fixed-width sections become fluid, and the meeting room adapts down to phone widths

---

## Assumptions & Known Limitations

1. **No real authentication.** Per the assignment spec ("No Login Required... assume a default user is logged in"), every meeting is created/hosted by a single seeded user (`Alex Morgan`, `id=1`). The `/login` screen is a UI-only bonus addition — submitting it does not check credentials or create a session; it simply redirects to the dashboard.
2. **Video is a local camera/mic preview only, not real peer-to-peer video calling.** The assignment's Core Features ask for meeting *workflows* (create/join/schedule/manage participants) and a Zoom-like *interface*, not a working WebRTC video pipeline — building actual multi-user video calling (signaling server, ICE/STUN/TURN, peer connections) is a separate, much larger project on its own. The meeting room shows your own live camera feed via `getUserMedia`, plus placeholder avatar tiles for other participants (driven by real data from the database), so the room *behaves* correctly (mute, camera toggle, host removes/mutes participants, participant list) even though other participants' video isn't actually streamed in.
3. **SQLite** is used as required; it's file-based, so on some hosting providers (e.g. Render's free tier) the file may reset on redeploy since disks aren't always persistent — fine for a demo/assignment, would swap for Postgres in production.
4. **Meeting codes** are generated as `XXX-XXX-XXX` digit strings (Zoom-style) and are guaranteed unique by the DB's unique constraint.

---

## API Reference (quick)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/meetings/instant` | Create + start an instant meeting |
| POST | `/api/meetings/schedule` | Create a scheduled meeting |
| POST | `/api/meetings/join` | Join by meeting code or invite link |
| GET | `/api/meetings/{code}` | Get meeting + participant details |
| GET | `/api/meetings/upcoming` | List host's upcoming meetings |
| GET | `/api/meetings/recent` | List host's recently ended meetings |
| POST | `/api/meetings/{code}/end` | End a meeting |
| POST | `/api/meetings/{code}/mute-all` | Host: mute all participants |
| POST | `/api/meetings/{code}/participants/{id}/mute` | Host: mute one participant |
| DELETE | `/api/meetings/{code}/participants/{id}` | Host: remove a participant |

Full interactive docs: `http://localhost:8000/docs` (Swagger UI, auto-generated by FastAPI).
