from datetime import datetime
from app.models import EditHistory

def _with_property_context(entity, field_name: str) -> str:
    """Append property_yardi context if available."""
    if not entity:
        return field_name
    prop_id = getattr(entity, "property_yardi", None)
    return f"{field_name} (property {prop_id})" if prop_id else field_name

def _display_label(entity_type, entity_obj):
    """Return a human-friendly label for an entity if possible."""
    if not entity_obj:
        return None
    try:
        if entity_type == "property":
            return getattr(entity_obj, "address", None) or getattr(entity_obj, "yardi", None)
        if entity_type == "suite":
            return getattr(entity_obj, "suite", None)
        if entity_type == "service":
            return getattr(entity_obj, "service_type", None) or getattr(entity_obj, "vendor", None)
        if entity_type == "utility":
            return getattr(entity_obj, "service", None) or getattr(entity_obj, "account_number", None)
        if entity_type == "code":
            return getattr(entity_obj, "description", None) or getattr(entity_obj, "code", None)
        if entity_type == "contact":
            return getattr(entity_obj, "name", None)
    except Exception:
        return None
    return None

def log_edit(db, edited_by, entity_type, entity_id, field, old_value, new_value, entity_obj=None):
    field_with_context = _with_property_context(entity_obj, field)
    label = _display_label(entity_type, entity_obj)
    entity_display = f"{entity_id}" if not label else f"{entity_id} / {label}"

    record = EditHistory(
        edited_by=edited_by,
        edited_at=datetime.now(),
        entity_type=entity_type,
        entity_id=entity_display,
        changes=field_with_context,   # frontend shows this as h.field
        old_value=str(old_value),
        new_value=str(new_value),
        action="edit"
    )
    db.add(record)
    db.commit()

def log_add(db, edited_by, entity_type, entity_id, new_value, entity_obj=None):
    label = _display_label(entity_type, entity_obj)
    entity_display = f"{entity_id}" if not label else f"{entity_id} / {label}"

    prop_id = getattr(entity_obj, "property_yardi", None) if entity_obj else None
    changes = f"created (property {prop_id})" if prop_id else "created"

    record = EditHistory(
        edited_by=edited_by,
        edited_at=datetime.now(),
        entity_type=entity_type,
        entity_id=entity_display,
        changes=changes,
        old_value="",
        new_value=str(new_value),
        action="add"
    )
    db.add(record)
    db.commit()

def log_delete(db, edited_by, entity_type, entity_id, old_value, entity_obj=None):
    label = _display_label(entity_type, entity_obj)
    entity_display = f"{entity_id}" if not label else f"{entity_id} / {label}"

    prop_id = getattr(entity_obj, "property_yardi", None) if entity_obj else None
    changes = f"deleted (property {prop_id})" if prop_id else "deleted"

    record = EditHistory(
        edited_by=edited_by,
        edited_at=datetime.now(),
        entity_type=entity_type,
        entity_id=entity_display,
        changes=changes,
        old_value=str(old_value),
        new_value="",
        action="delete"
    )
    db.add(record)
    db.commit()
