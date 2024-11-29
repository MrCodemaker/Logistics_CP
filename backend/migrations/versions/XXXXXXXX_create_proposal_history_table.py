"""create proposal history table

Revision ID: XXXXXXXX
Revises: предыдущий_id_если_есть
Create Date: 2023-xx-xx
"""
from alembic import op
import sqlalchemy as sa


def upgrade():
    op.create_table('proposal_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('data', sa.JSON(), nullable=True),
        sa.Column('file_path', sa.String(length=500), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_proposal_user', 'proposal_history', ['user_id'])
    op.create_index('idx_proposal_created', 'proposal_history', ['created_at'])
    op.create_index('idx_proposal_status', 'proposal_history', ['status'])


def downgrade():
    op.drop_index('idx_proposal_status')
    op.drop_index('idx_proposal_created')
    op.drop_index('idx_proposal_user')
    op.drop_table('proposal_history')