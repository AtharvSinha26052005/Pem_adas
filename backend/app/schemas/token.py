from pydantic import BaseModel


class TokenResponse(BaseModel):
    """Returned to the client after successful login."""
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Decoded JWT payload structure."""
    sub: str        # user id as string
    role: str       # role_name
    exp: int        # expiration timestamp
