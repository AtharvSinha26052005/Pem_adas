# ADAS Safety & Validation Platform

An enterprise-grade, full-stack User Management and Role-Based Access Control (RBAC) module designed for AI-powered Advanced Driver Assistance Systems (ADAS) validation platforms.

---

## 🚀 Platform Overview

This platform is engineered to support safety-critical separation of duties when validating AI perception systems, vehicle sensor profiles, and Operational Design Domain (ODD) conditions. 

It provides an interactive React-based dashboard connected to a high-performance FastAPI backend, backed by PostgreSQL. The entire platform enforces strict access boundaries based on **4 distinct user roles**:

| Role | Description | Core Backend Permissions | UI Experience |
|:---|:---|:---|:---|
| **Admin** | System administrator. Controls access and provisioning. | Full CRUD on users and projects. | Can change any user's role. Can update any project detail or status. |
| **Validation Engineer** | Sensor profile and test suite author. | Can create projects. Can edit text details of their own projects. | Access to dashboard and workspaces. Fully editable text forms for owned projects; status selector is locked. |
| **Reviewer** | Safety board representative. | Can view projects. Can change project workflow status. | Access to dashboard and workspaces. Project text forms are locked; status selector is fully unlocked. |
| **Viewer** | Auditor / Read-only supervisor. | Read-only access to users and projects. | Inspects metrics, distributes configurations, but all edit buttons are disabled/hidden. |

---

## 📸 Screenshots

### Authentication

![Sign In](Screenshots/signin.png.png)
![Sign Up](Screenshots/signup.png.png)

### Dashboard and Workspace

![Dashboard](Screenshots/dashboard.png.png)
![Workspace](Screenshots/workspace.png.png)

### Projects and Admin

![Create Project](Screenshots/create_project.png.png)
![Admin Page](Screenshots/admin_page.png.png)

### AI Report

![AI Report](Screenshots/AI_report.png.png)

---

## 🛠️ Technology Stack

### Backend
- **Core Framework**: FastAPI (Python 3.12+)
- **ORM & DB Layer**: SQLAlchemy + PostgreSQL
- **Security & JWT**: Passlib (bcrypt) + JWT Signature Verification
- **Validation**: Pydantic v2 schemas

### Frontend
- **Core Library**: React 19 + TypeScript
- **Styling**: Tailwind CSS v3
- **Tooling**: Vite
- **Icons**: Lucide React

---

## 📁 System Architecture

```mermaid
graph TD
    subgraph Frontend [React SPA - Port 5173]
        UI[Tailwind UI] --> Auth[AuthContext]
        UI --> API[API Service]
        Auth --> LS[(Local Storage)]
    end

    subgraph Backend [FastAPI - Port 8000]
        API --> Routes[API Routers]
        Routes --> AuthRoute[POST /auth/login]
        Routes --> UserRoute[PUT /users/id/role]
        Routes --> ProjectRoute[PUT /projects/id]
        
        Routes --> RBAC[RBAC Middleware]
        RBAC --> CRUD[CRUD Controllers]
    end

    subgraph Database [PostgreSQL - Port 5432]
        CRUD --> PG[(PostgreSQL DB)]
    end
```

---

## ⚡ Setup & Execution Guide

### 1. Database Provisioning

Make sure **PostgreSQL** is running locally on port `5432`. Create a new database named `adas_platform` using pgAdmin or the `psql` shell:

```sql
CREATE DATABASE adas_platform;
```

---

### 2. Backend Setup

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `backend/.env`. A `.env.example` file is included. Create your `.env` with the connection string:
   ```env
   DATABASE_URL=postgresql://postgres:root@localhost:5432/adas_platform
   JWT_SECRET=adas-platform-super-secret-jwt-key-2024
   JWT_ALGORITHM=HS256
   JWT_EXPIRE_MINUTES=60
   # Optional: one-time admin bootstrap on startup
   ADMIN_BOOTSTRAP_ENABLED=true
   ADMIN_BOOTSTRAP_NAME=Admin User
   ADMIN_BOOTSTRAP_EMAIL=admin@adas.com
   ADMIN_BOOTSTRAP_PASSWORD=Admin123!
   ```
5. Start the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
   *Note: On initial startup, the backend automatically creates all database tables and seeds the 4 default roles.*

   *If admin bootstrap is enabled and no Admin exists, the backend will create one using the env values above.*

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Access the web interface at: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Verification & Automated Testing

The backend includes comprehensive end-to-end integration tests validating all RBAC and Authentication rules.

To run the verification suite:
```bash
cd backend
.\venv\Scripts\python.exe test_e2e.py
```

The E2E suite will perform:
1. User registration across all roles.
2. Sign-in and token extraction.
3. Access denial verification on protected routes.
4. Project CRUD and fields/status isolation checks based on role constraints.

---

## Optional: Seed Realistic ADAS Data

To make the UI look alive on first login, you can seed realistic validation projects:

```bash
cd backend
python seed_data.py
```

Optional flags:
- `--owner-email` forces all projects to be owned by a specific user.
- `--allow-duplicates` inserts even if a project with the same name exists.

---

## Optional: Permissions Schema

The database also includes a `permissions` table and a `role_permissions` mapping table to match the suggested schema. Current API enforcement still uses role checks, but the schema is ready for future fine-grained permission checks.

---

## 🔒 API Specifications

### Authentication
- `POST /auth/signup` - Register a new user (defaults to Viewer role).
- `POST /auth/login` - Authenticate user and obtain a JWT bearer token.
- `GET /auth/me` - Retrieve current logged-in user profile details.

### Users (Admin Only)
- `GET /users` - Retrieve all users and their role assignments.
- `PUT /users/{user_id}/role` - Update a user's system role (locks own user role to prevent lockout).

### Projects (RBAC Controlled)
- `GET /projects` - View all active validation configurations.
- `POST /projects` - Create a new project (Admin and Validation Engineer only).
- `PUT /projects/{project_id}` - Update a project configuration:
  - **Admin**: Full access.
  - **Validation Engineer**: Can edit name, platform, and ODD on owned projects. Status is locked.
  - **Reviewer**: Can edit status field only. Text fields are locked.
  - **Viewer**: Read-only.
