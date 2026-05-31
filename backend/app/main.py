from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.init_db import init_db
from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.projects import router as projects_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run init_db on startup to create tables and seed roles."""
    init_db()
    yield


app = FastAPI(
    title="ADAS Validation Platform",
    description="User Management & RBAC module for AI-powered ADAS validation",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the React dev server to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(projects_router)


@app.get("/health", tags=["Health"])
def health_check():
    """Simple health check endpoint to verify the server is running."""
    return {"status": "healthy", "service": "ADAS Validation Platform"}


