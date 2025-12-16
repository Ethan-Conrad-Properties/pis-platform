"""add_tenant_specific_and_suite_specifics_to_services

Revision ID: 035f58d182d8
Revises: 305494957838
Create Date: 2025-12-16 11:59:28.054316

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '035f58d182d8'
down_revision: Union[str, Sequence[str], None] = '305494957838'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('services', sa.Column('tenant_specifics', sa.Text(), nullable=True))
    op.add_column('services', sa.Column('suite_specifics', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('services', 'suite_specifics')
    op.drop_column('services', 'tenant_specifics')
