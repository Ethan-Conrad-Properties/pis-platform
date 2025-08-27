from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Code
from app.auth import verify_token
from app.helpers import log_add, log_edit, log_delete


router = APIRouter()

# Get all codes for a property
@router.get("/codes")
async def get_codes(property_yardi: str, db: Session = Depends(get_db), user=Depends(verify_token)):
    codes = db.query(Code).filter(Code.property_yardi == property_yardi).all()
    return [c.__dict__ for c in codes]

# Create a new code
@router.post("/codes")
async def create_code(code: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    new_code = Code(**code)
    db.add(new_code)
    db.commit()
    db.refresh(new_code)
    log_add(db, user["name"], "code", new_code.code_id, new_code.__dict__, new_code)
    return {k: v for k, v in new_code.__dict__.items() if not k.startswith('_')}

# Update a code
@router.put("/codes/{code_id}")
async def update_code(code_id: int, updated: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    code = db.query(Code).filter(Code.code_id == code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="Code not found")
    for key, value in updated.items():
        if hasattr(code, key):
            old_value = getattr(code, key)
            if old_value != value:
                setattr(code, key, value)
                log_edit(db, user["name"], "code", code.code_id, key, old_value, value, code)
    db.commit()
    db.refresh(code)
    return {"message": "Code updated successfully", "code": code}

# Delete a code
@router.delete("/codes/{code_id}")
async def delete_code(code_id: int, db: Session = Depends(get_db), user=Depends(verify_token)):
    code = db.query(Code).filter(Code.code_id == code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="Code not found")
    log_delete(db, user["name"], "code", code.code_id, code.__dict__, code)
    db.delete(code)
    db.commit()
    return {"detail": "Code deleted"}