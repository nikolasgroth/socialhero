from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.database import get_db
from app.core.config import settings
from app.core.deps import get_current_user
from app.models.user import User
from app.models.mission import Mission, MissionResponse
from app.schemas.mission import (
    CreateMissionRequest,
    MissionResponseAction,
    EndMissionRequest,
    MissionSchema,
    MissionHistoryItem,
)
from app.services.location import (
    get_nearby_users,
    add_rough_offset,
    update_user_location,
)
from app.services.ws_manager import manager
from app.services.notification import send_push_to_many

router = APIRouter(prefix="/missions", tags=["missions"])


@router.post("/create", response_model=MissionSchema, status_code=201)
async def create_mission(
    req: CreateMissionRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new SOS mission (alert).
    This triggers the 2-step geolocation and notification process.
    """
    # Check for existing active mission
    result = await db.execute(
        select(Mission).where(
            Mission.sender_id == user.id,
            Mission.status == "active",
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Du hast bereits einen aktiven Einsatz")

    # Create rough location (Step 1 accuracy)
    rough_lat, rough_lng = add_rough_offset(req.lat, req.lng)

    mission = Mission(
        sender_id=user.id,
        lat=req.lat,
        lng=req.lng,
        rough_lat=rough_lat,
        rough_lng=rough_lng,
        note=req.note,
        status="active",
    )
    db.add(mission)
    await db.commit()
    await db.refresh(mission)

    # Step 1: Find nearby users (coarse search)
    nearby_user_ids = await get_nearby_users(req.lat, req.lng, exclude_id=user.id)

    # Also find users via DB who have recent locations (fallback)
    if not nearby_user_ids:
        from app.services.location import haversine_km
        result = await db.execute(
            select(User).where(
                User.is_active == True,
                User.is_available == True,
                User.id != user.id,
                User.last_lat.isnot(None),
                User.last_lng.isnot(None),
            )
        )
        db_users = result.scalars().all()
        for u in db_users:
            dist = haversine_km(req.lat, req.lng, u.last_lat, u.last_lng)
            if dist <= settings.ALERT_RADIUS_KM * 2:
                nearby_user_ids.append(u.id)

    # Step 2: Request precise location from candidates via WebSocket
    await manager.request_precise_location(nearby_user_ids)

    # Broadcast alert to all candidates (with rough location)
    ws_notified = await manager.broadcast_alert(
        user_ids=nearby_user_ids,
        mission_id=mission.id,
        sender_name=user.name,
        rough_lat=rough_lat,
        rough_lng=rough_lng,
        accept_timeout=settings.ACCEPT_TIMEOUT_SEC,
    )

    # Also send push notifications to users with FCM tokens
    result = await db.execute(
        select(User.fcm_token).where(
            User.id.in_(nearby_user_ids),
            User.fcm_token.isnot(None),
        )
    )
    tokens = [row[0] for row in result.all()]
    push_count = await send_push_to_many(
        tokens=tokens,
        title="🆘 Hilferuf in deiner Nähe!",
        body=f"{user.name} braucht Hilfe. Tippe um zu helfen.",
        data={"mission_id": mission.id, "type": "sos_alert"},
    )

    mission.helpers_alerted = ws_notified + push_count
    await db.commit()
    await db.refresh(mission)

    return MissionSchema(
        id=mission.id,
        sender_id=mission.sender_id,
        sender_name=user.name,
        lat=mission.lat,
        lng=mission.lng,
        rough_lat=mission.rough_lat,
        rough_lng=mission.rough_lng,
        status=mission.status,
        helpers_alerted=mission.helpers_alerted,
        helpers_accepted=mission.helpers_accepted,
        note=mission.note,
        created_at=mission.created_at.isoformat(),
        ended_at=None,
    )


@router.post("/respond")
async def respond_to_mission(
    req: MissionResponseAction,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Accept or decline a mission as a helper."""
    result = await db.execute(
        select(Mission).where(Mission.id == req.mission_id, Mission.status == "active")
    )
    mission = result.scalar_one_or_none()
    if not mission:
        raise HTTPException(status_code=404, detail="Einsatz nicht gefunden oder bereits beendet")

    if mission.sender_id == user.id:
        raise HTTPException(status_code=400, detail="Du kannst nicht auf deinen eigenen Einsatz reagieren")

    # Check for duplicate response
    result = await db.execute(
        select(MissionResponse).where(
            MissionResponse.mission_id == req.mission_id,
            MissionResponse.helper_id == user.id,
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Du hast bereits auf diesen Einsatz reagiert")

    response = MissionResponse(
        mission_id=req.mission_id,
        helper_id=user.id,
        action=req.action,
        helper_lat=req.helper_lat,
        helper_lng=req.helper_lng,
    )
    db.add(response)

    if req.action == "accepted":
        mission.helpers_accepted += 1

        # Send precise location to helper
        await manager.send_precise_location_to_helper(
            helper_id=user.id,
            mission_id=mission.id,
            lat=mission.lat,
            lng=mission.lng,
        )

        # Notify the sender that a helper is coming
        await manager.send_mission_update(
            user_ids=[mission.sender_id],
            mission_id=mission.id,
            update_type="HELPER_ACCEPTED",
            data={
                "helper_name": user.name,
                "helpers_accepted": mission.helpers_accepted,
            },
        )

    await db.commit()

    return {
        "status": "ok",
        "action": req.action,
        "precise_lat": mission.lat if req.action == "accepted" else None,
        "precise_lng": mission.lng if req.action == "accepted" else None,
    }


@router.post("/end")
async def end_mission(
    req: EndMissionRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """End an active mission."""
    result = await db.execute(
        select(Mission).where(Mission.id == req.mission_id, Mission.status == "active")
    )
    mission = result.scalar_one_or_none()
    if not mission:
        raise HTTPException(status_code=404, detail="Einsatz nicht gefunden")

    # Both sender and accepted helpers can end a mission
    is_sender = mission.sender_id == user.id
    if not is_sender:
        result = await db.execute(
            select(MissionResponse).where(
                MissionResponse.mission_id == req.mission_id,
                MissionResponse.helper_id == user.id,
                MissionResponse.action == "accepted",
            )
        )
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Du bist nicht berechtigt, diesen Einsatz zu beenden")

    mission.status = "completed"
    mission.ended_at = datetime.now(timezone.utc)
    await db.commit()

    # Notify all participants
    result = await db.execute(
        select(MissionResponse.helper_id).where(
            MissionResponse.mission_id == req.mission_id,
            MissionResponse.action == "accepted",
        )
    )
    helper_ids = [row[0] for row in result.all()]
    all_participants = list(set([mission.sender_id] + helper_ids))

    await manager.send_mission_update(
        user_ids=all_participants,
        mission_id=mission.id,
        update_type="ENDED",
        data={"ended_by": user.id},
    )

    return {"status": "ok", "mission_id": mission.id}


@router.get("/active", response_model=MissionSchema | None)
async def get_active_mission(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the user's current active mission (as sender or helper)."""
    # Check as sender
    result = await db.execute(
        select(Mission).where(
            Mission.sender_id == user.id,
            Mission.status == "active",
        )
    )
    mission = result.scalar_one_or_none()
    if mission:
        sender = await db.get(User, mission.sender_id)
        return MissionSchema(
            id=mission.id,
            sender_id=mission.sender_id,
            sender_name=sender.name if sender else None,
            lat=mission.lat,
            lng=mission.lng,
            rough_lat=mission.rough_lat,
            rough_lng=mission.rough_lng,
            status=mission.status,
            helpers_alerted=mission.helpers_alerted,
            helpers_accepted=mission.helpers_accepted,
            note=mission.note,
            created_at=mission.created_at.isoformat(),
            ended_at=None,
        )

    # Check as helper
    result = await db.execute(
        select(MissionResponse).where(
            MissionResponse.helper_id == user.id,
            MissionResponse.action == "accepted",
        )
    )
    for resp in result.scalars().all():
        m_result = await db.execute(
            select(Mission).where(Mission.id == resp.mission_id, Mission.status == "active")
        )
        mission = m_result.scalar_one_or_none()
        if mission:
            sender = await db.get(User, mission.sender_id)
            return MissionSchema(
                id=mission.id,
                sender_id=mission.sender_id,
                sender_name=sender.name if sender else None,
                lat=mission.lat,
                lng=mission.lng,
                rough_lat=mission.rough_lat,
                rough_lng=mission.rough_lng,
                status=mission.status,
                helpers_alerted=mission.helpers_alerted,
                helpers_accepted=mission.helpers_accepted,
                note=mission.note,
                created_at=mission.created_at.isoformat(),
                ended_at=None,
            )

    return None


@router.get("/history", response_model=list[MissionHistoryItem])
async def get_mission_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the user's mission history (as sender and helper)."""
    items = []

    # Missions I sent
    result = await db.execute(
        select(Mission)
        .where(Mission.sender_id == user.id, Mission.status != "active")
        .order_by(Mission.created_at.desc())
        .limit(50)
    )
    for m in result.scalars().all():
        duration = None
        if m.ended_at:
            duration = int((m.ended_at - m.created_at).total_seconds() / 60)
        items.append(MissionHistoryItem(
            id=m.id,
            role="sender",
            status=m.status,
            lat=m.lat,
            lng=m.lng,
            helpers_accepted=m.helpers_accepted,
            created_at=m.created_at.isoformat(),
            ended_at=m.ended_at.isoformat() if m.ended_at else None,
            duration_minutes=duration,
        ))

    # Missions I helped with
    result = await db.execute(
        select(MissionResponse)
        .where(MissionResponse.helper_id == user.id, MissionResponse.action == "accepted")
        .order_by(MissionResponse.created_at.desc())
        .limit(50)
    )
    for resp in result.scalars().all():
        m_result = await db.execute(select(Mission).where(Mission.id == resp.mission_id))
        m = m_result.scalar_one_or_none()
        if m and m.status != "active":
            sender = await db.get(User, m.sender_id)
            duration = None
            if m.ended_at:
                duration = int((m.ended_at - m.created_at).total_seconds() / 60)
            items.append(MissionHistoryItem(
                id=m.id,
                role="helper",
                status=m.status,
                lat=m.rough_lat,  # Helpers only see rough location in history
                lng=m.rough_lng,
                helpers_accepted=m.helpers_accepted,
                created_at=m.created_at.isoformat(),
                ended_at=m.ended_at.isoformat() if m.ended_at else None,
                duration_minutes=duration,
                sender_name=sender.name if sender else None,
            ))

    items.sort(key=lambda x: x.created_at, reverse=True)
    return items[:50]
