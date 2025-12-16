"""add_cascade_delete_to_junction_tables

Revision ID: 00ce60112b7e
Revises: 035f58d182d8
Create Date: 2025-12-16 14:32:45.056749

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '00ce60112b7e'
down_revision: Union[str, Sequence[str], None] = '035f58d182d8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop existing foreign keys
    op.drop_constraint('suite_contacts_suite_id_fkey', 'suite_contacts', type_='foreignkey')
    op.drop_constraint('service_contacts_service_id_fkey', 'service_contacts', type_='foreignkey')
    op.drop_constraint('utility_contacts_utility_id_fkey', 'utility_contacts', type_='foreignkey')
    
    # Recreate with CASCADE
    op.create_foreign_key('suite_contacts_suite_id_fkey', 'suite_contacts', 'suites', ['suite_id'], ['suite_id'], ondelete='CASCADE')
    op.create_foreign_key('service_contacts_service_id_fkey', 'service_contacts', 'services', ['service_id'], ['service_id'], ondelete='CASCADE')
    op.create_foreign_key('utility_contacts_utility_id_fkey', 'utility_contacts', 'utilities', ['utility_id'], ['utility_id'], ondelete='CASCADE')


def downgrade() -> None:
    """Downgrade schema."""
    # Reverse: drop and recreate without CASCADE
    op.drop_constraint('suite_contacts_suite_id_fkey', 'suite_contacts', type_='foreignkey')
    op.drop_constraint('service_contacts_service_id_fkey', 'service_contacts', type_='foreignkey')
    op.drop_constraint('utility_contacts_utility_id_fkey', 'utility_contacts', type_='foreignkey')
    
    op.create_foreign_key('suite_contacts_suite_id_fkey', 'suite_contacts', 'suites', ['suite_id'], ['suite_id'])
    op.create_foreign_key('service_contacts_service_id_fkey', 'service_contacts', 'services', ['service_id'], ['service_id'])
    op.create_foreign_key('utility_contacts_utility_id_fkey', 'utility_contacts', 'utilities', ['utility_id'], ['utility_id'])
