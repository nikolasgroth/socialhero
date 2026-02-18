"""initial schema

Revision ID: 001_initial
Revises:
Create Date: 2026-02-18
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=False), primary_key=True),
        sa.Column("email", sa.String(320), unique=True, index=True, nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("hashed_password", sa.String(128), nullable=True),
        sa.Column("picture", sa.String(500), nullable=True),
        sa.Column("auth_provider", sa.String(20), nullable=False, server_default="email"),
        sa.Column("provider_id", sa.String(200), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("is_available", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("fcm_token", sa.Text, nullable=True),
        sa.Column("last_lat", sa.Float, nullable=True),
        sa.Column("last_lng", sa.Float, nullable=True),
        sa.Column("location_updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("shortcut_enabled", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    op.create_table(
        "missions",
        sa.Column("id", UUID(as_uuid=False), primary_key=True),
        sa.Column("sender_id", UUID(as_uuid=False), sa.ForeignKey("users.id"), index=True, nullable=False),
        sa.Column("lat", sa.Float, nullable=False),
        sa.Column("lng", sa.Float, nullable=False),
        sa.Column("rough_lat", sa.Float, nullable=False),
        sa.Column("rough_lng", sa.Float, nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="active", index=True),
        sa.Column("helpers_alerted", sa.Integer, nullable=False, server_default="0"),
        sa.Column("helpers_accepted", sa.Integer, nullable=False, server_default="0"),
        sa.Column("note", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "mission_responses",
        sa.Column("id", UUID(as_uuid=False), primary_key=True),
        sa.Column("mission_id", UUID(as_uuid=False), sa.ForeignKey("missions.id"), index=True, nullable=False),
        sa.Column("helper_id", UUID(as_uuid=False), sa.ForeignKey("users.id"), index=True, nullable=False),
        sa.Column("action", sa.String(20), nullable=False, server_default="accepted"),
        sa.Column("helper_lat", sa.Float, nullable=True),
        sa.Column("helper_lng", sa.Float, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )


def downgrade() -> None:
    op.drop_table("mission_responses")
    op.drop_table("missions")
    op.drop_table("users")
