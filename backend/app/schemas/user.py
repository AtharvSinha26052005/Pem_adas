from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """Payload for user registration."""
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    """Payload for user login."""
    email: EmailStr
    password: str


class UserOut(BaseModel):
    """User data returned in API responses (no password)."""
    id: int
    name: str
    email: str
    role_name: str

    model_config = {"from_attributes": True}


class RoleUpdate(BaseModel):
    """Payload for admin role-change endpoint."""
    role_name: str
