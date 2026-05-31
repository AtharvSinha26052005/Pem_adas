from sqlalchemy.orm import Session
from app.models.project import Project


def get_all_projects(db: Session) -> list[Project]:
    """Return all projects with their creator info."""
    return db.query(Project).all()


def get_project_by_id(db: Session, project_id: int) -> Project | None:
    """Look up a project by its primary key."""
    return db.query(Project).filter(Project.id == project_id).first()


def create_project(
    db: Session,
    name: str,
    vehicle_platform: str,
    odd_type: str,
    creator_id: int,
) -> Project:
    """Create a new validation project."""
    project = Project(
        name=name,
        vehicle_platform=vehicle_platform,
        odd_type=odd_type,
        created_by=creator_id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project: Project, updates: dict) -> Project:
    """Apply partial updates to a project.

    Only non-None values in the updates dict are applied.
    """
    for field, value in updates.items():
        if value is not None:
            setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project
