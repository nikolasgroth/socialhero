from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CreateMissionRequest(BaseModel):
    lat: float
    lng: float
    note: Optional[str] = None


class MissionResponseAction(BaseModel):
    mission_id: str
    action: str  # "accepted" or "declined"
    helper_lat: Optional[float] = None
    helper_lng: Optional[float] = None


class EndMissionRequest(BaseModel):
    mission_id: str


class LocationUpdate(BaseModel):
    lat: float
    lng: float


class MissionResponseSchema(BaseModel):
    id: str
    helper_id: str
    helper_name: Optional[str] = None
    action: str
    created_at: str

    class Config:
        from_attributes = True


class MissionSchema(BaseModel):
    id: str
    sender_id: str
    sender_name: Optional[str] = None
    lat: float
    lng: float
    rough_lat: float
    rough_lng: float
    status: str
    helpers_alerted: int
    helpers_accepted: int
    note: Optional[str] = None
    created_at: str
    ended_at: Optional[str] = None
    responses: List[MissionResponseSchema] = []

    class Config:
        from_attributes = True


class MissionHistoryItem(BaseModel):
    id: str
    role: str  # "sender" or "helper"
    status: str
    lat: float
    lng: float
    helpers_accepted: int
    created_at: str
    ended_at: Optional[str] = None
    duration_minutes: Optional[int] = None
    sender_name: Optional[str] = None


# WebSocket message types
class WSMessage(BaseModel):
    type: str
    payload: dict = {}
