"""
VidGrabber - Universal Video Downloader Backend
FastAPI application entry point
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
import os

from .routes import router


# Create FastAPI app
app = FastAPI(
    title="VidGrabber API",
    description="Universal Video Downloader powered by yt-dlp",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*",  # Allow all origins in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)

# Serve static frontend files in production
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")

if os.path.exists(STATIC_DIR):
    # Mount static files (CSS, JS, assets)
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")
    
    @app.get("/")
    async def serve_frontend():
        """Serve the frontend index.html"""
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
    
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """Serve SPA - return index.html for client-side routing"""
        # Don't intercept API routes
        if full_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        
        # Check if file exists in static directory
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Return index.html for SPA routing
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
else:
    # Development mode - just return API info
    @app.get("/")
    async def root():
        return {
            "name": "VidGrabber API",
            "version": "1.0.0",
            "description": "Universal Video Downloader - Download videos from 1000+ sites",
            "docs": "/api/docs",
        }


# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Startup event
@app.on_event("startup")
async def startup_event():
    print("🚀 VidGrabber API starting up...")
    print("📹 yt-dlp video downloader ready")
    print("📖 API docs available at /api/docs")
    if os.path.exists(STATIC_DIR):
        print("🌐 Serving frontend from /static")
    else:
        print("⚠️ No static directory found - API only mode")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    print("👋 VidGrabber API shutting down...")

