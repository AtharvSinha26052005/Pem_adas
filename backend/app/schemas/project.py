from pydantic import BaseModel
from typing import Optional


class ProjectCreate(BaseModel):
    """Payload for creating a new validation project."""
    name: str
    vehicle_platform: str
    odd_type: str


class ProjectUpdate(BaseModel):
    """Payload for updating a project.

    All fields are optional — only provided fields are updated.
    Validation Engineers can update name/vehicle_platform/odd_type (own projects only).
    Reviewers can only update status.
    Admins can update everything.
    """
    name: Optional[str] = None
    vehicle_platform: Optional[str] = None
    odd_type: Optional[str] = None
    status: Optional[str] = None


class ProjectOut(BaseModel):
    """Project data returned in API responses."""
    id: int
    name: str
    vehicle_platform: str
    odd_type: str
    status: str
    created_by: int
    creator_name: str

    model_config = {"from_attributes": True}
