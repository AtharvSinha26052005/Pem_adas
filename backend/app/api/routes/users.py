from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.dependencies import require_roles
from app.models.user import User
from app.schemas.user import UserOut, RoleUpdate
from app.crud.user import get_all_users, get_user_by_id, get_role_by_name, update_user_role

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=list[UserOut])
def list_users(
    current_user: User = Depends(require_roles("Admin")),
    db: Session = Depends(get_db),
):
    """List all users with their roles. Admin only."""
    users = get_all_users(db)
    return [
        UserOut(
            id=u.id,
            name=u.name,
            email=u.email,
            role_name=u.role.role_name,
        )
        for u in users
    ]


@router.put("/{user_id}/role", response_model=UserOut)
def change_user_role(
    user_id: int,
    payload: RoleUpdate,
    current_user: User = Depends(require_roles("Admin")),
    db: Session = Depends(get_db),
):
    """Update a user's role. Admin only.

    Prevents an admin from changing their own role to avoid lockout.
    """
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role.",
        )

    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    new_role = get_role_by_name(db, payload.role_name)
    if not new_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role '{payload.role_name}' does not exist.",
        )

    updated = update_user_role(db, user, new_role)
    return UserOut(
        id=updated.id,
        name=updated.name,
        email=updated.email,
        role_name=updated.role.role_name,
    )
