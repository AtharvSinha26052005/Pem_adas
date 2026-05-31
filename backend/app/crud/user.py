from sqlalchemy.orm import Session
from app.models.user import User, Role
from app.core.security import hash_password


def get_user_by_email(db: Session, email: str) -> User | None:
    """Look up a user by their email address."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    """Look up a user by their primary key."""
    return db.query(User).filter(User.id == user_id).first()


def get_all_users(db: Session) -> list[User]:
    """Return all users with their roles (admin endpoint)."""
    return db.query(User).all()


def create_user(db: Session, name: str, email: str, password: str, role_id: int) -> User:
    """Create a new user with a hashed password."""
    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role_id=role_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_role_by_name(db: Session, role_name: str) -> Role | None:
    """Look up a role by its name."""
    return db.query(Role).filter(Role.role_name == role_name).first()


def update_user_role(db: Session, user: User, new_role: Role) -> User:
    """Change a user's role (admin action)."""
    user.role_id = new_role.id
    db.commit()
    db.refresh(user)
    return user
