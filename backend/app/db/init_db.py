from sqlalchemy.orm import Session
from app.db.database import engine, Base

# Import all models so Base.metadata knows about them before create_all()
from app.models.user import Role, User, Permission  # noqa: F401
from app.models.project import Project  # noqa: F401
from app.core.config import settings

SEED_ROLES = ["Admin", "Validation Engineer", "Reviewer", "Viewer"]

SEED_PERMISSIONS = [
    {
        "name": "users:read",
        "description": "View users and role assignments",
    },
    {
        "name": "users:role:update",
        "description": "Update a user's system role",
    },
    {
        "name": "projects:read",
        "description": "View projects",
    },
    {
        "name": "projects:create",
        "description": "Create validation projects",
    },
    {
        "name": "projects:update:any",
        "description": "Edit any project fields",
    },
    {
        "name": "projects:update:own",
        "description": "Edit own project details (non-status)",
    },
    {
        "name": "projects:update:status",
        "description": "Update project workflow status",
    },
]

ROLE_PERMISSION_MAP = {
    "Admin": [
        "users:read",
        "users:role:update",
        "projects:read",
        "projects:create",
        "projects:update:any",
        "projects:update:status",
    ],
    "Validation Engineer": [
        "projects:read",
        "projects:create",
        "projects:update:own",
    ],
    "Reviewer": [
        "projects:read",
        "projects:update:status",
    ],
    "Viewer": [
        "projects:read",
    ],
}


def init_db() -> None:
    """Create all tables and seed the default roles if they don't exist.

    Safe to call multiple times — skips role insertion if roles already present.
    """
    Base.metadata.create_all(bind=engine)

    from app.db.database import SessionLocal

    db: Session = SessionLocal()
    try:
        existing = db.query(Role).count()
        if existing == 0:
            for role_name in SEED_ROLES:
                db.add(Role(role_name=role_name))
            db.commit()
            print(f"[init_db] Seeded {len(SEED_ROLES)} roles: {SEED_ROLES}")
        else:
            print(f"[init_db] Roles already exist ({existing} found), skipping seed.")

        # Seed permissions (optional schema in assignment)
        existing_permissions = {p.name for p in db.query(Permission).all()}
        missing_permissions = [p for p in SEED_PERMISSIONS if p["name"] not in existing_permissions]
        if missing_permissions:
            for perm in missing_permissions:
                db.add(Permission(name=perm["name"], description=perm["description"]))
            db.commit()
            print(f"[init_db] Seeded {len(missing_permissions)} permissions.")
        else:
            print("[init_db] Permissions already exist, skipping seed.")

        # Ensure role-permission mappings exist
        role_by_name = {r.role_name: r for r in db.query(Role).all()}
        perm_by_name = {p.name: p for p in db.query(Permission).all()}
        for role_name, perm_names in ROLE_PERMISSION_MAP.items():
            role = role_by_name.get(role_name)
            if not role:
                continue
            desired = [perm_by_name[name] for name in perm_names if name in perm_by_name]
            existing = {p.name for p in role.permissions}
            to_add = [p for p in desired if p.name not in existing]
            if to_add:
                role.permissions.extend(to_add)
        db.commit()
        print("[init_db] Role-permission mappings verified.")

        # Optional admin bootstrap
        if settings.ADMIN_BOOTSTRAP_ENABLED:
            if not settings.ADMIN_BOOTSTRAP_EMAIL or not settings.ADMIN_BOOTSTRAP_PASSWORD:
                print("[init_db] Admin bootstrap enabled but email/password not set. Skipping.")
            else:
                admin_role = role_by_name.get("Admin")
                if admin_role is None:
                    admin_role = db.query(Role).filter(Role.role_name == "Admin").first()
                existing_admin = (
                    db.query(User)
                    .join(Role)
                    .filter(Role.role_name == "Admin")
                    .first()
                )
                if existing_admin:
                    print("[init_db] Admin user already exists, skipping bootstrap.")
                else:
                    from app.core.security import hash_password

                    existing_user = (
                        db.query(User)
                        .filter(User.email == settings.ADMIN_BOOTSTRAP_EMAIL)
                        .first()
                    )
                    if existing_user:
                        existing_user.role_id = admin_role.id
                        db.commit()
                        print("[init_db] Promoted existing user to Admin via bootstrap.")
                    else:
                        admin_user = User(
                            name=settings.ADMIN_BOOTSTRAP_NAME or "Admin User",
                            email=settings.ADMIN_BOOTSTRAP_EMAIL,
                            password_hash=hash_password(settings.ADMIN_BOOTSTRAP_PASSWORD),
                            role_id=admin_role.id,
                        )
                        db.add(admin_user)
                        db.commit()
                        print("[init_db] Bootstrapped Admin user from env settings.")
    except Exception as e:
        db.rollback()
        print(f"[init_db] Error seeding roles: {e}")
        raise
    finally:
        db.close()
