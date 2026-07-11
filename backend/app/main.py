import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.routers import meetings, users

# Create tables if they don't exist yet (seed.py does this too, but this
# makes `uvicorn app.main:app` work standalone as well).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Zoom Clone API", version="1.0.0")

# Allowed origins are configurable via env var for clean deployment
# (comma-separated list). Defaults to "*" to preserve current local/demo
# behavior when nothing is set.
_cors_origins = os.getenv("CORS_ORIGINS", "*")
allow_origins = ["*"] if _cors_origins.strip() == "*" else [
    o.strip() for o in _cors_origins.split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings.router)
app.include_router(users.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "zoom-clone-api"}
