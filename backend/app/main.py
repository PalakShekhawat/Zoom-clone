import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.routers import meetings, users

# Create tables if they don't exist yet
Base.metadata.create_all(bind=engine)

# Seed sample data on startup (idempotent for demo)
try:
    from app.db.seed import seed_data
    seed_data()
    print("✅ Database seeded successfully on startup")
except Exception as e:
    print("⚠️ Seed skipped (already done or error):", e)

app = FastAPI(title="Zoom Clone API", version="1.0.0")

# CORS configuration
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
