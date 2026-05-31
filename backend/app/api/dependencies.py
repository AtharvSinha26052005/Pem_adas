from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.models.project import Project  # noqa: F401 — ensure relationship resolves

# Extracts the token from the Authorization: Bearer <token> header
bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Decode the JWT and return the authenticated user.

    Raises 401 if the token is missing, invalid, expired,
    or the user no longer exists in the database.
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing user identifier.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def require_roles(*allowed_roles: str):
    """Factory that returns a dependency enforcing role-based access.

    Usage in a route:
        @router.get("/admin-only", dependencies=[Depends(require_roles("Admin"))])

    Or as a parameter dependency:
        current_user: User = Depends(require_roles("Admin", "Reviewer"))

    Raises 403 if the user's role is not in the allowed list.
    """

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.role_name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(allowed_roles)}. "
                       f"Your role: {current_user.role.role_name}.",
            )
        return current_user

    return role_checker
