"""MindCanvas API — FastAPI Application Entrypoint."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup/shutdown lifecycle."""
    # Create upload directory
    os.makedirs(settings.upload_dir, exist_ok=True)
    yield


app = FastAPI(
    title="MindCanvas API",
    description="Personal Life Operating System — API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads
if os.path.exists(settings.upload_dir) or True:
    os.makedirs(settings.upload_dir, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# Register routers
from app.api.v1.auth import router as auth_router
from app.api.v1.journal import router as journal_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.crud import (
    ideas_router, projects_router, tasks_router,
    finance_router, learning_router, wellness_router,
    events_router, search_router,
)

API_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(journal_router, prefix=API_PREFIX)
app.include_router(dashboard_router, prefix=API_PREFIX)
app.include_router(ideas_router, prefix=API_PREFIX)
app.include_router(projects_router, prefix=API_PREFIX)
app.include_router(tasks_router, prefix=API_PREFIX)
app.include_router(finance_router, prefix=API_PREFIX)
app.include_router(learning_router, prefix=API_PREFIX)
app.include_router(wellness_router, prefix=API_PREFIX)
app.include_router(events_router, prefix=API_PREFIX)
app.include_router(search_router, prefix=API_PREFIX)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "mindcanvas-api"}
