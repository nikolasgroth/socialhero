"""
2-Step Geolocation Service

Step 1 (Coarse): Use Redis geospatial index to quickly find all users
        within a generous radius (e.g. 2x alert radius). This uses low-precision
        cached locations that users periodically report.

Step 2 (Fine):  For the shortlisted users, request precise location via
        WebSocket push. Only those confirmed within the exact alert radius
        get the actual alert.
"""
import math
import json
from datetime import datetime, timezone
from typing import List, Tuple, Optional

from app.core.redis import get_redis
from app.core.config import settings

REDIS_GEO_KEY = "user:locations"
LOCATION_EXPIRY_SEC = 600  # 10 minutes


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two points in km."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def add_rough_offset(lat: float, lng: float, meters: int = 200) -> Tuple[float, float]:
    """Add random-ish offset to create a rough location (~200m accuracy)."""
    import random
    offset_lat = (random.random() - 0.5) * (meters / 111_000) * 2
    offset_lng = (random.random() - 0.5) * (meters / (111_000 * math.cos(math.radians(lat)))) * 2
    return lat + offset_lat, lng + offset_lng


async def update_user_location(user_id: str, lat: float, lng: float):
    """Store user's coarse location in Redis geo index."""
    r = await get_redis()
    # GEOADD key longitude latitude member
    await r.geoadd(REDIS_GEO_KEY, (lng, lat, user_id))
    # Also store timestamp
    await r.set(f"user:loc_ts:{user_id}", datetime.now(timezone.utc).isoformat(), ex=LOCATION_EXPIRY_SEC)


async def remove_user_location(user_id: str):
    """Remove user from geo index."""
    r = await get_redis()
    await r.zrem(REDIS_GEO_KEY, user_id)
    await r.delete(f"user:loc_ts:{user_id}")


async def step1_coarse_search(lat: float, lng: float, radius_km: float = None) -> List[str]:
    """
    Step 1: Coarse geofencing.
    Find all user IDs within a generous radius using Redis GEORADIUS.
    Uses 2x the alert radius to account for location staleness.
    """
    r = await get_redis()
    search_radius = (radius_km or settings.ALERT_RADIUS_KM) * 2  # 2x for safety margin

    # GEOSEARCH returns members within radius
    results = await r.geosearch(
        REDIS_GEO_KEY,
        longitude=lng,
        latitude=lat,
        radius=search_radius,
        unit="km",
        withcoord=True,
        withdist=True,
        sort="ASC",
    )

    user_ids = []
    for member in results:
        # member is (name, distance, (lng, lat))
        if isinstance(member, (list, tuple)):
            user_ids.append(member[0] if isinstance(member[0], str) else str(member[0]))
        else:
            user_ids.append(str(member))

    return user_ids


async def step2_fine_filter(
    candidates: List[str],
    target_lat: float,
    target_lng: float,
    precise_locations: dict,  # {user_id: (lat, lng)}
    radius_km: float = None,
) -> List[str]:
    """
    Step 2: Fine-grained filtering.
    From the coarse candidates, filter using precise (freshly requested) locations.
    Only users confirmed within exact radius pass through.
    """
    radius = radius_km or settings.ALERT_RADIUS_KM
    confirmed = []

    for user_id in candidates:
        if user_id in precise_locations:
            ulat, ulng = precise_locations[user_id]
            dist = haversine_km(target_lat, target_lng, ulat, ulng)
            if dist <= radius:
                confirmed.append(user_id)

    return confirmed


async def get_nearby_users(lat: float, lng: float, exclude_id: str = None) -> List[str]:
    """
    Combined coarse search for immediate use.
    For the MVP, this does Step 1 and returns results.
    Step 2 happens via WebSocket location request/response cycle.
    """
    candidates = await step1_coarse_search(lat, lng)
    if exclude_id:
        candidates = [uid for uid in candidates if uid != exclude_id]
    return candidates
