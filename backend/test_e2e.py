"""End-to-end test for all API routes with RBAC enforcement."""
import urllib.request
import json

BASE = "http://localhost:8000"


def request(method, path, data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(f"{BASE}{path}", data=body, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(req)
        return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def p(label, status, body, expected=None):
    mark = "OK" if expected is None or status == expected else "FAIL"
    print(f"  [{mark}] {label}: {status} -> {json.dumps(body, default=str)[:120]}")


print("=" * 60)
print("SETUP: Creating users with different roles")
print("=" * 60)

# Login as existing admin@adas.com (Viewer from Phase 3)
_, r = request("POST", "/auth/login", {"email": "admin@adas.com", "password": "Admin123!"})
viewer_token = r["access_token"]

# Create more test users
users_data = [
    {"name": "Engineer User", "email": "engineer@adas.com", "password": "Eng123!"},
    {"name": "Reviewer User", "email": "reviewer@adas.com", "password": "Rev123!"},
    {"name": "Viewer User", "email": "viewer@adas.com", "password": "View123!"},
]
for u in users_data:
    s, b = request("POST", "/auth/signup", u)
    p(f"Signup {u['name']}", s, b)

# Manually promote admin@adas.com to Admin via direct DB (simulating initial setup)
# For now, let's use a script to set this up
import sys
sys.path.insert(0, ".")
from app.db.database import SessionLocal
from app.models.user import User, Role
from app.models.project import Project  # noqa

db = SessionLocal()
admin_role = db.query(Role).filter(Role.role_name == "Admin").first()
eng_role = db.query(Role).filter(Role.role_name == "Validation Engineer").first()
reviewer_role = db.query(Role).filter(Role.role_name == "Reviewer").first()

# Set admin@adas.com → Admin
admin_user = db.query(User).filter(User.email == "admin@adas.com").first()
admin_user.role_id = admin_role.id
admin_user_id = admin_user.id
# Set engineer@adas.com → Validation Engineer
eng_user = db.query(User).filter(User.email == "engineer@adas.com").first()
eng_user.role_id = eng_role.id
# Set reviewer@adas.com → Reviewer
rev_user = db.query(User).filter(User.email == "reviewer@adas.com").first()
rev_user.role_id = reviewer_role.id
db.commit()
db.close()

# Get fresh tokens
_, r = request("POST", "/auth/login", {"email": "admin@adas.com", "password": "Admin123!"})
admin_token = r["access_token"]
_, r = request("POST", "/auth/login", {"email": "engineer@adas.com", "password": "Eng123!"})
eng_token = r["access_token"]
_, r = request("POST", "/auth/login", {"email": "reviewer@adas.com", "password": "Rev123!"})
rev_token = r["access_token"]
_, r = request("POST", "/auth/login", {"email": "viewer@adas.com", "password": "View123!"})
viewer_token = r["access_token"]

print(f"\nTokens obtained for all 4 roles OK\n")

# ========================================
print("=" * 60)
print("TEST: Users API (Admin only)")
print("=" * 60)

s, b = request("GET", "/users", token=admin_token)
p("Admin GET /users", s, b, 200)

s, b = request("GET", "/users", token=eng_token)
p("Engineer GET /users (should 403)", s, b, 403)

s, b = request("GET", "/users", token=viewer_token)
p("Viewer GET /users (should 403)", s, b, 403)

# ========================================
print("\n" + "=" * 60)
print("TEST: Admin updates a user's role via API")
print("=" * 60)

# Get all users to find IDs
_, users_list = request("GET", "/users", token=admin_token)
viewer_user_data = [u for u in users_list if u["email"] == "viewer@adas.com"][0]

s, b = request("PUT", f"/users/{viewer_user_data['id']}/role", {"role_name": "Reviewer"}, token=admin_token)
p(f"Admin changes viewer to Reviewer", s, b, 200)

# Revert
request("PUT", f"/users/{viewer_user_data['id']}/role", {"role_name": "Viewer"}, token=admin_token)

# Self-change should fail
s, b = request("PUT", f"/users/{admin_user_id}/role", {"role_name": "Viewer"}, token=admin_token)
p("Admin self-role-change (should 400)", s, b, 400)

# ========================================
print("\n" + "=" * 60)
print("TEST: Projects API - Create")
print("=" * 60)

project_data = {"name": "AEB Highway v2", "vehicle_platform": "SUV-X1", "odd_type": "Highway"}

s, b = request("POST", "/projects", project_data, token=admin_token)
p("Admin creates project", s, b, 201)
admin_project_id = b["id"]

s, b = request("POST", "/projects", {"name": "LKA Urban", "vehicle_platform": "Sedan-S3", "odd_type": "Urban"}, token=eng_token)
p("Engineer creates project", s, b, 201)
eng_project_id = b["id"]

s, b = request("POST", "/projects", project_data, token=rev_token)
p("Reviewer creates project (should 403)", s, b, 403)

s, b = request("POST", "/projects", project_data, token=viewer_token)
p("Viewer creates project (should 403)", s, b, 403)

# ========================================
print("\n" + "=" * 60)
print("TEST: Projects API - List")
print("=" * 60)

s, b = request("GET", "/projects", token=viewer_token)
p(f"Viewer lists projects (count={len(b)})", s, b, 200)

s, b = request("GET", "/projects", token=rev_token)
p(f"Reviewer lists projects (count={len(b)})", s, b, 200)

# ========================================
print("\n" + "=" * 60)
print("TEST: Projects API - Update (RBAC)")
print("=" * 60)

# Admin edits any project
s, b = request("PUT", f"/projects/{eng_project_id}", {"name": "LKA Urban v2"}, token=admin_token)
p("Admin edits engineer's project", s, b, 200)

# Engineer edits own project
s, b = request("PUT", f"/projects/{eng_project_id}", {"name": "LKA Urban v3"}, token=eng_token)
p("Engineer edits own project", s, b, 200)

# Engineer edits someone else's project → 403
s, b = request("PUT", f"/projects/{admin_project_id}", {"name": "Hacked"}, token=eng_token)
p("Engineer edits admin's project (should 403)", s, b, 403)

# Engineer tries to change status → 403
s, b = request("PUT", f"/projects/{eng_project_id}", {"status": "Approved"}, token=eng_token)
p("Engineer changes status (should 403)", s, b, 403)

# Reviewer updates status
s, b = request("PUT", f"/projects/{eng_project_id}", {"status": "Approved"}, token=rev_token)
p("Reviewer approves project", s, b, 200)

# Reviewer tries to edit name → 403
s, b = request("PUT", f"/projects/{eng_project_id}", {"name": "Hacked"}, token=rev_token)
p("Reviewer edits name (should 403)", s, b, 403)

# Viewer tries to edit → 403
s, b = request("PUT", f"/projects/{eng_project_id}", {"name": "Hacked"}, token=viewer_token)
p("Viewer edits project (should 403)", s, b, 403)

# No token → 403
s, b = request("PUT", f"/projects/{eng_project_id}", {"name": "Hacked"})
p("No token edit (should 403)", s, b, 403)

print("\n" + "=" * 60)
print("ALL TESTS COMPLETE")
print("=" * 60)
