from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.user import UserCreate, LoginRequest, UserOut
from app.schemas.token import TokenResponse
from app.crud.user import get_user_by_email, create_user, get_role_by_name
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    """Register a new user. Defaults to the 'Viewer' role."""

    # Check for duplicate email
    if get_user_by_email(db, payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    # Assign default role
    viewer_role = get_role_by_name(db, "Viewer")
    if not viewer_role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Default role 'Viewer' not found. Run database initialization.",
        )

    user = create_user(
        db=db,
        name=payload.name,
        email=payload.email,
        password=payload.password,
        role_id=viewer_role.id,
    )

    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        role_name=user.role.role_name,
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT token."""

    user = get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(user_id=user.id, role_name=user.role.role_name)

    return TokenResponse(access_token=token)


from app.api.dependencies import get_current_user
from app.models.user import User

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Fetch the profile of the currently authenticated user."""
    return UserOut(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role_name=current_user.role.role_name,
    )

