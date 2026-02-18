import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Float, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Mission(Base):
    __tablename__ = "missions"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    sender_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id"),
        index=True,
    )

    # Precise location of the person in need
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)

    # Rough location (sent initially to nearby users)
    rough_lat: Mapped[float] = mapped_column(Float, nullable=False)
    rough_lng: Mapped[float] = mapped_column(Float, nullable=False)

    # Status: active, completed, cancelled
    status: Mapped[str] = mapped_column(String(20), default="active", index=True)

    # Counts
    helpers_alerted: Mapped[int] = mapped_column(Integer, default=0)
    helpers_accepted: Mapped[int] = mapped_column(Integer, default=0)

    # Optional note from sender
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    sender = relationship("User", back_populates="missions_sent", foreign_keys=[sender_id])
    responses = relationship("MissionResponse", back_populates="mission", cascade="all, delete-orphan")


class MissionResponse(Base):
    __tablename__ = "mission_responses"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    mission_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("missions.id"),
        index=True,
    )
    helper_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id"),
        index=True,
    )

    # accepted, declined, expired
    action: Mapped[str] = mapped_column(String(20), default="accepted")

    # Helper's location at time of response
    helper_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    helper_lng: Mapped[float | None] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    mission = relationship("Mission", back_populates="responses")
    helper = relationship("User", back_populates="missions_helped")
