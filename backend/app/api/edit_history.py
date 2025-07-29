from app.models import EditHistory
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.auth import verify_token

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/edit-history")
async def get_all_edit_history(db: Session = Depends(get_db), user=Depends(verify_token)):
    history = db.query(EditHistory).order_by(EditHistory.edited_at.desc()).all()
    return {
        "edit_history": [
            {
                "id": h.id,
                "edited_by": h.edited_by,
                "edited_at": h.edited_at.isoformat() if h.edited_at else None,
                "entity_type": h.entity_type,
                "entity_id": h.entity_id,
                "changes": h.changes,
                "old_value": h.old_value,
                "new_value": h.new_value,
                "action": h.action,
            }
            for h in history
        ]
    }