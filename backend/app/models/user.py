import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Boolean, DateTime, Float, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    hashed_password: Mapped[str | None] = mapped_column(String(128), nullable=True)
    picture: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # OAuth
    auth_provider: Mapped[str] = mapped_column(String(20), default="email")  # email, google, apple
    provider_id: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)  # Available to receive alerts

    # Push notification token
    fcm_token: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Last known rough location (updated periodically when app is active)
    last_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    location_updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Settings
    shortcut_enabled: Mapped[bool] = mapped_column(Boolean, default=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    missions_sent = relationship("Mission", back_populates="sender", foreign_keys="Mission.sender_id")
    missions_helped = relationship("MissionResponse", back_populates="helper")
