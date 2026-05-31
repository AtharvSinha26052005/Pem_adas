"""Seed realistic ADAS validation projects for demo purposes."""
from __future__ import annotations

import argparse
from typing import Iterable

from app.db.database import SessionLocal
from app.models.project import Project
from app.models.user import User, Role


SEED_PROJECTS = [
    {"name": "LiDAR Fog Perception", "vehicle_platform": "SUV-X1", "odd_type": "Fog"},
    {"name": "Radar Fusion Highway v2", "vehicle_platform": "Sedan-S3", "odd_type": "Highway"},
    {"name": "Pedestrian AEB Urban", "vehicle_platform": "Model-Y", "odd_type": "Urban"},
    {"name": "Night Lane Keep Assist", "vehicle_platform": "SUV-X1", "odd_type": "Night"},
    {"name": "Rainy Road Sign Detection", "vehicle_platform": "Hatch-H2", "odd_type": "Rain"},
    {"name": "Snowy Camera Calibration", "vehicle_platform": "SUV-X1", "odd_type": "Snow"},
    {"name": "Tunnel GPS Degradation", "vehicle_platform": "Sedan-S3", "odd_type": "Tunnel"},
    {"name": "Urban Cyclist Prediction", "vehicle_platform": "Model-3", "odd_type": "Urban"},
    {"name": "Merge Assist Highway", "vehicle_platform": "Model-3", "odd_type": "Highway"},
    {"name": "Construction Zone Detection", "vehicle_platform": "Hatch-H2", "odd_type": "Construction"},
    {"name": "School Zone Speed Assist", "vehicle_platform": "SUV-X1", "odd_type": "School Zone"},
    {"name": "Low Sun Glare Handling", "vehicle_platform": "Sedan-S3", "odd_type": "Dawn"},
    {"name": "Crosswalk Occlusion", "vehicle_platform": "Model-Y", "odd_type": "Urban"},
    {"name": "Multi-Lane Cut-In Safety", "vehicle_platform": "SUV-X1", "odd_type": "Highway"},
    {"name": "Parking Lot Pedestrian", "vehicle_platform": "Hatch-H2", "odd_type": "Parking Lot"},
    {"name": "Nighttime Animal Detection", "vehicle_platform": "Model-Y", "odd_type": "Night"},
    {"name": "Bridge Shadow False Positives", "vehicle_platform": "Sedan-S3", "odd_type": "Highway"},
]

STATUSES = ["Draft", "In Review", "Approved", "Rejected"]


def pick_owner(users: Iterable[User], index: int) -> User:
    users_list = list(users)
    return users_list[index % len(users_list)]


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed ADAS validation projects.")
    parser.add_argument(
        "--owner-email",
        help="Force all seeded projects to be owned by this user email.",
    )
    parser.add_argument(
        "--allow-duplicates",
        action="store_true",
        help="Insert projects even if a project with the same name exists.",
    )
    args = parser.parse_args()

    db = SessionLocal()
    try:
        owner_user = None
        if args.owner_email:
            owner_user = db.query(User).filter(User.email == args.owner_email).first()
            if not owner_user:
                print(f"Owner email not found: {args.owner_email}")
                return

        # Prefer Admin and Validation Engineer as owners
        admin_role = db.query(Role).filter(Role.role_name == "Admin").first()
        eng_role = db.query(Role).filter(Role.role_name == "Validation Engineer").first()
        owners = []
        if admin_role:
            owners.extend(db.query(User).filter(User.role_id == admin_role.id).all())
        if eng_role:
            owners.extend(db.query(User).filter(User.role_id == eng_role.id).all())
        if not owners:
            owners = db.query(User).all()
        if not owners:
            print("No users found. Create users before seeding projects.")
            return

        inserted = 0
        for idx, project in enumerate(SEED_PROJECTS):
            if not args.allow_duplicates:
                existing = db.query(Project).filter(Project.name == project["name"]).first()
                if existing:
                    continue

            owner = owner_user or pick_owner(owners, idx)
            status = STATUSES[idx % len(STATUSES)]
            db.add(
                Project(
                    name=project["name"],
                    vehicle_platform=project["vehicle_platform"],
                    odd_type=project["odd_type"],
                    status=status,
                    created_by=owner.id,
                )
            )
            inserted += 1

        db.commit()
        print(f"Seed complete. Inserted {inserted} projects.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
