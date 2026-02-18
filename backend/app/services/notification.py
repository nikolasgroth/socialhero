"""
Push Notification Service using Firebase Cloud Messaging.
Falls back to WebSocket-only if FCM is not configured.
"""
import json
import logging
from typing import List, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

_fcm_initialized = False


def _init_fcm():
    global _fcm_initialized
    if _fcm_initialized:
        return True
    if not settings.FCM_CREDENTIALS_JSON:
        logger.info("FCM not configured – push notifications disabled, using WebSocket only")
        return False
    try:
        import firebase_admin
        from firebase_admin import credentials

        cred_dict = json.loads(settings.FCM_CREDENTIALS_JSON)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        _fcm_initialized = True
        logger.info("Firebase Cloud Messaging initialized")
        return True
    except Exception as e:
        logger.warning(f"Failed to initialize FCM: {e}")
        return False


async def send_push_notification(
    token: str,
    title: str,
    body: str,
    data: Optional[dict] = None,
) -> bool:
    """Send a push notification to a single device."""
    if not _init_fcm():
        return False

    try:
        from firebase_admin import messaging

        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data={k: str(v) for k, v in (data or {}).items()},
            token=token,
            android=messaging.AndroidConfig(
                priority="high",
                notification=messaging.AndroidNotification(
                    channel_id="sos_alerts",
                    priority="max",
                    sound="default",
                ),
            ),
            apns=messaging.APNSConfig(
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(
                        alert=messaging.ApsAlert(title=title, body=body),
                        sound="default",
                        content_available=True,
                        category="SOS_ALERT",
                    ),
                ),
                headers={"apns-priority": "10"},
            ),
        )

        response = messaging.send(message)
        logger.info(f"Push sent: {response}")
        return True
    except Exception as e:
        logger.error(f"Push notification failed: {e}")
        return False


async def send_push_to_many(
    tokens: List[str],
    title: str,
    body: str,
    data: Optional[dict] = None,
) -> int:
    """Send push notification to multiple devices. Returns count of successful sends."""
    if not _init_fcm() or not tokens:
        return 0

    try:
        from firebase_admin import messaging

        message = messaging.MulticastMessage(
            notification=messaging.Notification(title=title, body=body),
            data={k: str(v) for k, v in (data or {}).items()},
            tokens=tokens,
            android=messaging.AndroidConfig(priority="high"),
            apns=messaging.APNSConfig(
                headers={"apns-priority": "10"},
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(sound="default", content_available=True),
                ),
            ),
        )

        response = messaging.send_each_for_multicast(message)
        logger.info(f"Push multicast: {response.success_count} success, {response.failure_count} failed")
        return response.success_count
    except Exception as e:
        logger.error(f"Multicast push failed: {e}")
        return 0
