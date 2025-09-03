from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models import PropertyPhoto
from app.database import get_db
from app.auth import verify_token
import shutil
import os

router = APIRouter()

# -------------------------------------------------------------------
# CRUD Endpoints for Property Photos
# Photos are uploaded, stored locally under static/uploads, and linked
# to properties via property_yardi.
# -------------------------------------------------------------------

# Directory to save uploaded photos
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Ensure directory exists


@router.post("/property-photos/upload", status_code=201)
def upload_photo(
    file: UploadFile = File(...),
    user=Depends(verify_token),
):
    """
    Upload a photo file to the server (saved in static/uploads).

    Args:
        file (UploadFile): File uploaded from client.
        user (dict): Authenticated user.

    Returns:
        dict: Public URL for the uploaded photo.
    """
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # Save the file to disk
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
    user=Depends(verify_token),
):
    """
    Add a property photo record to the database.

    Args:
        property_yardi (str): ID of property this photo belongs to.
        photo_url (str): URL of the uploaded photo.
        caption (str): Optional caption/description for the photo.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        PropertyPhoto: Newly created photo record.
    """
    photo = PropertyPhoto(
        property_yardi=property_yardi,
        photo_url=photo_url,
        caption=caption,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)

    return photo


@router.get("/property-photos/{property_yardi}")
def get_property_photos(
    property_yardi: str,
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Get all photos for a given property.

    Args:
        property_yardi (str): Property identifier.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        list[PropertyPhoto]: List of photo records.
    """
    photos = db.query(PropertyPhoto).filter_by(property_yardi=property_yardi).all()
    return photos


@router.delete("/property-photos/{photo_id}")
def delete_property_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Delete a photo by its ID.

    Args:
        photo_id (int): ID of the photo to delete.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Confirmation message after deletion.
    """
    photo = db.query(PropertyPhoto).get(photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    db.delete(photo)
    db.commit()
    return {"success": True}
