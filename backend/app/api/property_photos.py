from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models import PropertyPhoto
from app.database import get_db
from app.auth import verify_token
import shutil
import os



router = APIRouter()
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/property-photos/upload")
def upload_photo(file: UploadFile = File(...), user=Depends(verify_token)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    url = f"/uploads/{file.filename}"
    return {"url": url}

@router.post("/property-photos")
def add_property_photo(
    property_yardi: str = Form(...),
    photo_url: str = Form(...),
    caption: str = Form(""),
    db: Session = Depends(get_db),
    user=Depends(verify_token)
):
    photo = PropertyPhoto(property_yardi=property_yardi, photo_url=photo_url, caption=caption)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo

@router.get("/property-photos/{property_yardi}")
def get_property_photos(property_yardi: str, db: Session = Depends(get_db), user=Depends(verify_token)):
    photos = db.query(PropertyPhoto).filter_by(property_yardi=property_yardi).all()
    return photos

@router.delete("/property-photos/{photo_id}")
def delete_property_photo(photo_id: int, db: Session = Depends(get_db), user=Depends(verify_token)):
    photo = db.query(PropertyPhoto).get(photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    db.delete(photo)
    db.commit()
    return {"success": True}
