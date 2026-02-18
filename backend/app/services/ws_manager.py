"""
WebSocket Connection Manager

Manages all active WebSocket connections and provides methods for:
- Broadcasting alerts to nearby users
- Requesting precise location from specific users
- Sending mission updates to participants
"""
import json
import logging
from typing import Dict, Optional
from datetime import datetime, timezone

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # user_id -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}
        # user_id -> (lat, lng) for precise locations received via WS
        self.precise_locations: Dict[str, tuple] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"WebSocket connected: {user_id} (total: {len(self.active_connections)})")

    def disconnect(self, user_id: str):
        self.active_connections.pop(user_id, None)
        self.precise_locations.pop(user_id, None)
        logger.info(f"WebSocket disconnected: {user_id} (total: {len(self.active_connections)})")

    def is_connected(self, user_id: str) -> bool:
        return user_id in self.active_connections

    async def send_to_user(self, user_id: str, message: dict) -> bool:
        ws = self.active_connections.get(user_id)
        if ws:
            try:
                await ws.send_json(message)
                return True
            except Exception as e:
                logger.error(f"Failed to send to {user_id}: {e}")
                self.disconnect(user_id)
        return False

    async def broadcast_alert(
        self,
        user_ids: list,
        mission_id: str,
        sender_name: str,
        rough_lat: float,
        rough_lng: float,
        accept_timeout: int,
    ) -> int:
        """
        Send SOS alert to a list of users.
        Returns number of users successfully notified via WebSocket.
        """
        count = 0
        message = {
            "type": "INCOMING_ALERT",
            "payload": {
                "mission_id": mission_id,
                "sender_name": sender_name,
                "rough_lat": rough_lat,
                "rough_lng": rough_lng,
                "accept_timeout": accept_timeout,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        }

        for user_id in user_ids:
            if await self.send_to_user(user_id, message):
                count += 1

        logger.info(f"Alert broadcast to {count}/{len(user_ids)} users for mission {mission_id}")
        return count

    async def request_precise_location(self, user_ids: list) -> int:
        """
        Step 2 of 2-step geolocation: Ask users for their precise location.
        """
        count = 0
        message = {
            "type": "LOCATION_REQUEST",
            "payload": {"reason": "alert_verification"},
        }

        for user_id in user_ids:
            if await self.send_to_user(user_id, message):
                count += 1
        return count

    def store_precise_location(self, user_id: str, lat: float, lng: float):
        self.precise_locations[user_id] = (lat, lng)

    def get_precise_location(self, user_id: str) -> Optional[tuple]:
        return self.precise_locations.get(user_id)

    async def send_mission_update(self, user_ids: list, mission_id: str, update_type: str, data: dict = None):
        """Send mission status updates (helper accepted, mission ended, etc.)."""
        message = {
            "type": f"MISSION_{update_type.upper()}",
            "payload": {
                "mission_id": mission_id,
                **(data or {}),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        }
        for user_id in user_ids:
            await self.send_to_user(user_id, message)

    async def send_precise_location_to_helper(
        self, helper_id: str, mission_id: str, lat: float, lng: float
    ):
        """After helper accepts, send them the precise location."""
        message = {
            "type": "MISSION_PRECISE_LOCATION",
            "payload": {
                "mission_id": mission_id,
                "lat": lat,
                "lng": lng,
            },
        }
        await self.send_to_user(helper_id, message)


# Singleton instance
manager = ConnectionManager()
