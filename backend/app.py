"""
VidGrabber - Universal Video Downloader Backend
FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
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
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)


# Root endpoint
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


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Resource not found"}
    )


@app.exception_handler(500)
async def server_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


# Startup event
@app.on_event("startup")
async def startup_event():
    print("🚀 VidGrabber API starting up...")
    print("📹 yt-dlp video downloader ready")
    print("📖 API docs available at /api/docs")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    print("👋 VidGrabber API shutting down...")
