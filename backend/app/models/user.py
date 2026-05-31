from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.db.database import Base


role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id"), primary_key=True),
)


class Role(Base):
    """Predefined roles controlling access levels across the platform.

    Seeded values: Admin, Validation Engineer, Reviewer, Viewer.
    """

    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    role_name = Column(String(50), unique=True, nullable=False)

    users = relationship("User", back_populates="role")
    permissions = relationship(
        "Permission",
        secondary=role_permissions,
        back_populates="roles",
    )

    def __repr__(self) -> str:
        return f"<Role(id={self.id}, role_name='{self.role_name}')>"


class User(Base):
    """Platform user with a single assigned role."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)

    role = relationship("Role", back_populates="users", lazy="joined")
    projects = relationship("Project", back_populates="creator")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"


class Permission(Base):
    """Granular permission attached to roles (optional schema).

    This matches the suggested 'permissions' table in the assignment.
    """

    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=True)

    roles = relationship(
        "Role",
        secondary=role_permissions,
        back_populates="permissions",
    )

    def __repr__(self) -> str:
        return f"<Permission(id={self.id}, name='{self.name}')>"
