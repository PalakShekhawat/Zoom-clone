from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=schemas.UserOut)
def get_default_user(db: Session = Depends(get_db)):
    """
    No auth in this app (per assignment spec) — always return the
    seeded 'default logged in user' with id=1.
    """
    user = db.query(models.User).filter(models.User.id == 1).first()
    if not user:
        raise HTTPException(status_code=404, detail="Default user not seeded yet")
    return user
