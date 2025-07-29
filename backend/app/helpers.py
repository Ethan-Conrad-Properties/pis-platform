from datetime import datetime
from app.models import EditHistory

def log_edit(db, edited_by, entity_type, entity_id, changes, old_value, new_value):
    record = EditHistory(
        edited_by=edited_by,
        edited_at=datetime.now(),
        entity_type=entity_type,
        entity_id=entity_id,
        changes=changes,
        old_value=old_value,
        new_value=new_value,
        action="edit"
    )
    db.add(record)
    db.commit()

def log_add(db, edited_by, entity_type, entity_id, new_value):
    record = EditHistory(
        edited_by=edited_by,
        edited_at=datetime.utcnow(),
        entity_type=entity_type,
        entity_id=str(entity_id),
        changes="created",
        old_value="",
        new_value=str(new_value),
        action="add"
    )
    db.add(record)
    db.commit()

def log_delete(db, edited_by, entity_type, entity_id, old_value):
    record = EditHistory(
        edited_by=edited_by,
        edited_at=datetime.utcnow(),
        entity_type=entity_type,
        entity_id=str(entity_id),
        changes="deleted",
        old_value=str(old_value),
        new_value="",
        action="delete"
    )
    db.add(record)
    db.commit()