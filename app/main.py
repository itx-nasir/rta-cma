# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import camera, camera_action, location, nvr_device, auth
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# Configure CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(camera.router, prefix="/cameras", tags=["Cameras"])
app.include_router(location.router, prefix="/locations", tags=["Locations"])
app.include_router(nvr_device.router, prefix="/nvrs", tags=["NVR Devices"])
app.include_router(camera_action.router, prefix="/actions", tags=["Camera Actions"])

@app.get("/")
def read_root():
    return {
        "message": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "features": [
            "JWT Authentication & Authorization",
            "Role-based access control (Admin, Operator, Viewer)",
            "Advanced filtering and search",
            "Pagination support",
            "Sorting capabilities",
            "Date range filtering",
            "Related entity inclusion",
            "Location management",
            "NVR device management",
            "Camera action audit trail"
        ]
    }

