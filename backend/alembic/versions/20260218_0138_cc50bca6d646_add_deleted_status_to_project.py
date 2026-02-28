"""add_deleted_status_to_project

Revision ID: cc50bca6d646
Revises: 6fee2c7e3774
Create Date: 2026-02-18 01:38:43.040341

"""
from alembic import op # type: ignore


# revision identifiers, used by Alembic.
revision = 'cc50bca6d646'
down_revision = '6fee2c7e3774'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE projectstatus ADD VALUE IF NOT EXISTS 'DELETED'")


def downgrade() -> None:
    # PostgreSQL doesn't support removing enum values directly.
    # To reverse, you'd need to recreate the enum type without DELETED.
    pass
