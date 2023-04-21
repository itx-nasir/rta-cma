# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import camera, camera_action, location, nvr_device

app = FastAPI(
    title="RTA Camera Management API",
    description="Advanced Camera Management System with comprehensive filtering, search, and pagination",
    version="2.0.0"
)

# Configure CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(camera.router, prefix="/cameras", tags=["Cameras"])
app.include_router(location.router, prefix="/locations", tags=["Locations"])
app.include_router(nvr_device.router, prefix="/nvrs", tags=["NVR Devices"])
app.include_router(camera_action.router, prefix="/actions", tags=["Camera Actions"])

@app.get("/")
def read_root():
    return {
        "message": "RTA Camera Management API",
        "version": "2.0.0",
        "features": [
            "Advanced filtering and search",
            "Pagination support",
            "Sorting capabilities",
            "Date range filtering",
            "Related entity inclusion"
        ]
    }

