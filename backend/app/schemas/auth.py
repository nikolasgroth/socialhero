from pydantic import BaseModel, EmailStr
from typing import Optional


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SocialLoginRequest(BaseModel):
    provider: str  # "google" or "apple"
    id_token: str
    name: Optional[str] = None  # Apple only sends name on first auth


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    auth_provider: str
    is_available: bool
    shortcut_enabled: bool
    created_at: str

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    is_available: Optional[bool] = None
    shortcut_enabled: Optional[bool] = None


class FCMTokenRequest(BaseModel):
    token: str
