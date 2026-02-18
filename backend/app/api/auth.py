from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.rate_limit import limiter
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    verify_google_token,
    verify_apple_token,
)
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    SocialLoginRequest,
    AuthResponse,
    UserResponse,
    UserUpdateRequest,
    FCMTokenRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        picture=user.picture,
        auth_provider=user.auth_provider,
        is_available=user.is_available,
        shortcut_enabled=user.shortcut_enabled,
        created_at=user.created_at.isoformat(),
    )


@router.post("/register", response_model=AuthResponse, status_code=201)
@limiter.limit("5/minute")
async def register(request: Request, req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == req.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="E-Mail bereits registriert")

    user = User(
        name=req.name,
        email=req.email,
        hashed_password=hash_password(req.password),
        auth_provider="email",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id)
    return AuthResponse(access_token=token, user=_user_response(user))


@router.post("/login", response_model=AuthResponse)
@limiter.limit("10/minute")
async def login(request: Request, req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")

    token = create_access_token(user.id)
    return AuthResponse(access_token=token, user=_user_response(user))


@router.post("/social", response_model=AuthResponse)
@limiter.limit("10/minute")
async def social_login(request: Request, req: SocialLoginRequest, db: AsyncSession = Depends(get_db)):
    # Verify the token with the provider
    if req.provider == "google":
        info = await verify_google_token(req.id_token)
    elif req.provider == "apple":
        info = await verify_apple_token(req.id_token)
    else:
        raise HTTPException(status_code=400, detail="Unbekannter Anbieter")

    if not info:
        raise HTTPException(status_code=401, detail="Token-Verifizierung fehlgeschlagen")

    # Check if user exists by provider_id
    result = await db.execute(
        select(User).where(
            User.auth_provider == req.provider,
            User.provider_id == info["provider_id"],
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        # Check by email
        result = await db.execute(select(User).where(User.email == info["email"]))
        user = result.scalar_one_or_none()

        if user:
            # Link existing account to social provider
            user.auth_provider = req.provider
            user.provider_id = info["provider_id"]
            if info.get("picture"):
                user.picture = info["picture"]
        else:
            # Create new user
            name = req.name or info.get("name") or info["email"].split("@")[0]
            user = User(
                name=name,
                email=info["email"],
                auth_provider=req.provider,
                provider_id=info["provider_id"],
                picture=info.get("picture"),
            )
            db.add(user)

    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id)
    return AuthResponse(access_token=token, user=_user_response(user))


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return _user_response(user)


@router.patch("/me", response_model=UserResponse)
async def update_me(
    req: UserUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if req.name is not None:
        user.name = req.name
    if req.is_available is not None:
        user.is_available = req.is_available
    if req.shortcut_enabled is not None:
        user.shortcut_enabled = req.shortcut_enabled

    await db.commit()
    await db.refresh(user)
    return _user_response(user)


@router.post("/fcm-token")
async def update_fcm_token(
    req: FCMTokenRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user.fcm_token = req.token
    await db.commit()
    return {"status": "ok"}


@router.delete("/me", status_code=204)
async def delete_account(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user.is_active = False
    user.email = f"deleted_{user.id}@deleted.local"
    user.name = "Gelöschter Benutzer"
    user.fcm_token = None
    await db.commit()
