from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Project(Base):
    """ADAS validation project linked to a creating user.

    Status lifecycle: Draft → In Review → Approved / Rejected
    """

    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    vehicle_platform = Column(String(100), nullable=False)
    odd_type = Column(String(100), nullable=False)  # Operational Design Domain
    status = Column(String(50), nullable=False, default="Draft")
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    creator = relationship("User", back_populates="projects", lazy="joined")

    def __repr__(self) -> str:
        return f"<Project(id={self.id}, name='{self.name}', status='{self.status}')>"
