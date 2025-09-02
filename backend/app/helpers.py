from datetime import datetime
from app.models import EditHistory

# -------------------------------------------------------------------
# Logging Helpers
# These functions create audit log entries in the EditHistory table.
# They are called by routers whenever an entity is created, updated,
# or deleted. The log captures:
#   - Who made the change (edited_by)
#   - When it happened (edited_at)
#   - What entity was changed (entity_type + entity_id)
#   - The field/values affected (changes, old_value, new_value)
#   - The action type (add, edit, delete)
# -------------------------------------------------------------------


def _with_property_context(entity, field_name: str) -> str:
    """
    Append property_yardi context to a field name if available.

    Example:
        suite_number → "suite_number (property P123)"
    """
    if not entity:
        return field_name
    prop_id = getattr(entity, "property_yardi", None)
    return f"{field_name} (property {prop_id})" if prop_id else field_name


def _display_label(entity_type, entity_obj):
    """
    Generate a human-friendly label for an entity, based on its type.

    Args:
        entity_type (str): e.g., "property", "suite", "service"
        entity_obj (Any): The actual SQLAlchemy model instance.

    Returns:
        str | None: Best available display label for the entity.
    """
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
    """
    Log an edit action.

    Args:
        db (Session): Database session.
        edited_by (str): User performing the change.
        entity_type (str): Type of entity (property, suite, etc.).
        entity_id (Any): Entity identifier.
        field (str): Field name being changed.
        old_value (Any): Value before edit.
        new_value (Any): Value after edit.
        entity_obj (Any, optional): Full entity object for context.
    """
    field_with_context = _with_property_context(entity_obj, field)
    label = _display_label(entity_type, entity_obj)
    entity_display = f"{entity_id}" if not label else f"{entity_id} / {label}"

    record = EditHistory(
        edited_by=edited_by,
        edited_at=datetime.now(),
        entity_type=entity_type,
        entity_id=entity_display,
        changes=field_with_context,  # frontend shows this as h.field
        old_value=str(old_value),
        new_value=str(new_value),
        action="edit",
    )
    db.add(record)
    db.commit()


def log_add(db, edited_by, entity_type, entity_id, new_value, entity_obj=None):
    """
    Log a create action.

    Args:
        db (Session): Database session.
        edited_by (str): User performing the change.
        entity_type (str): Type of entity (property, suite, etc.).
        entity_id (Any): Entity identifier.
        new_value (Any): Value that was created.
        entity_obj (Any, optional): Full entity object for context.
    """
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
        action="add",
    )
    db.add(record)
    db.commit()


def log_delete(db, edited_by, entity_type, entity_id, old_value, entity_obj=None):
    """
    Log a delete action.

    Args:
        db (Session): Database session.
        edited_by (str): User performing the change.
        entity_type (str): Type of entity (property, suite, etc.).
        entity_id (Any): Entity identifier.
        old_value (Any): Value before deletion.
        entity_obj (Any, optional): Full entity object for context.
    """
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
        action="delete",
    )
    db.add(record)
    db.commit()
