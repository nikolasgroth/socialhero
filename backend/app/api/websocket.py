import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.services.ws_manager import manager
from app.services.location import update_user_location

logger = logging.getLogger(__name__)

router = APIRouter(tags=["websocket"])


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Main WebSocket endpoint.

    Connection: ws://host/ws?token=<jwt_token>

    Client -> Server messages:
        {"type": "LOCATION_UPDATE", "payload": {"lat": float, "lng": float}}
        {"type": "LOCATION_RESPONSE", "payload": {"lat": float, "lng": float}}
        {"type": "PING"}

    Server -> Client messages:
        {"type": "INCOMING_ALERT", "payload": {...}}
        {"type": "LOCATION_REQUEST", "payload": {"reason": "alert_verification"}}
        {"type": "MISSION_HELPER_ACCEPTED", "payload": {...}}
        {"type": "MISSION_PRECISE_LOCATION", "payload": {"mission_id": str, "lat": float, "lng": float}}
        {"type": "MISSION_ENDED", "payload": {...}}
        {"type": "PONG"}
        {"type": "CONNECTED", "payload": {"user_id": str}}
    """
    # Authenticate via query param
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Token fehlt")
        return

    user_id = decode_access_token(token)
    if not user_id:
        await websocket.close(code=4001, reason="Ungültiger Token")
        return

    # Verify user exists
    async with AsyncSessionLocal() as db:
        user = await db.get(User, user_id)
        if not user or not user.is_active:
            await websocket.close(code=4003, reason="Benutzer nicht gefunden")
            return

    await manager.connect(websocket, user_id)

    try:
        await websocket.send_json({
            "type": "CONNECTED",
            "payload": {"user_id": user_id},
        })

        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "")
            payload = data.get("payload", {})

            if msg_type == "PING":
                await websocket.send_json({"type": "PONG"})

            elif msg_type == "LOCATION_UPDATE":
                # Periodic coarse location update
                lat = payload.get("lat")
                lng = payload.get("lng")
                if lat is not None and lng is not None:
                    await update_user_location(user_id, lat, lng)
                    # Also update DB
                    async with AsyncSessionLocal() as db:
                        user = await db.get(User, user_id)
                        if user:
                            user.last_lat = lat
                            user.last_lng = lng
                            user.location_updated_at = datetime.now(timezone.utc)
                            await db.commit()

            elif msg_type == "LOCATION_RESPONSE":
                # Step 2: Precise location in response to LOCATION_REQUEST
                lat = payload.get("lat")
                lng = payload.get("lng")
                if lat is not None and lng is not None:
                    manager.store_precise_location(user_id, lat, lng)

            else:
                logger.warning(f"Unknown WS message type from {user_id}: {msg_type}")

    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        logger.error(f"WebSocket error for {user_id}: {e}")
        manager.disconnect(user_id)
