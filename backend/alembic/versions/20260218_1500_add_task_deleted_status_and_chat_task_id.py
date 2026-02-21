"""add_deleted_status_to_task_and_task_id_to_chat_sessions

Revision ID: a1b2c3d4e5f6
Revises: cc50bca6d646
Create Date: 2026-02-18 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'cc50bca6d646'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE taskstatus ADD VALUE IF NOT EXISTS 'DELETED'")
    op.add_column('chat_sessions', sa.Column('task_id', sa.String(), nullable=True))
    op.create_foreign_key(
        'fk_chat_sessions_task_id',
        'chat_sessions', 'tasks',
        ['task_id'], ['id'],
        ondelete='SET NULL',
    )


def downgrade() -> None:
    op.drop_constraint('fk_chat_sessions_task_id', 'chat_sessions', type_='foreignkey')
    op.drop_column('chat_sessions', 'task_id')
    # PostgreSQL doesn't support removing enum values directly.
    pass
