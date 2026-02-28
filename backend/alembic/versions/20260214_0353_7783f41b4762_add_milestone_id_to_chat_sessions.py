"""add milestone_id to chat_sessions

Revision ID: 7783f41b4762
Revises: 000_initial
Create Date: 2026-02-14 03:53:25.803192

"""
from alembic import op # type: ignore
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7783f41b4762'
down_revision = '000_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('chat_sessions', sa.Column('milestone_id', sa.String(), nullable=True))
    op.create_index(op.f('ix_chat_sessions_milestone_id'), 'chat_sessions', ['milestone_id'], unique=False)
    op.create_foreign_key('fk_chat_sessions_milestone_id', 'chat_sessions', 'milestones', ['milestone_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    op.drop_constraint('fk_chat_sessions_milestone_id', 'chat_sessions', type_='foreignkey')
    op.drop_index(op.f('ix_chat_sessions_milestone_id'), table_name='chat_sessions')
    op.drop_column('chat_sessions', 'milestone_id')
