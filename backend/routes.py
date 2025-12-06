"""
API Routes for VidGrabber - Video extraction and download endpoints
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse, Response
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
import asyncio
import os
import mimetypes
import httpx
import base64
from urllib.parse import unquote

from .extractors import YTDLPHandler
from .utils.validators import validate_url, normalize_url


# Initialize router and handler
router = APIRouter(prefix="/api", tags=["video"])
handler = YTDLPHandler()

# WebSocket connections for progress tracking
active_connections: Dict[str, WebSocket] = {}


# Request/Response Models
class ExtractRequest(BaseModel):
    url: str


class DownloadRequest(BaseModel):
    url: str
    format_id: str = "best"
    audio_only: bool = False
    embed_subs: bool = False
    embed_thumbnail: bool = False


class BatchExtractRequest(BaseModel):
    urls: List[str]


class VideoFormatResponse(BaseModel):
    format_id: str
    ext: str
    resolution: Optional[str]
    quality_label: str
    size_str: str
    is_audio_only: bool
    is_video_only: bool


class VideoInfoResponse(BaseModel):
    id: str
    title: str
    url: str
    thumbnail: Optional[str] = None
    duration: Optional[float] = None
    duration_str: str = "Unknown"
    uploader: Optional[str] = None
    view_count: Optional[int] = None
    view_count_str: str = "Unknown"
    extractor: Optional[str] = None
    formats: List[VideoFormatResponse] = []
    recommended_formats: List[Dict[str, Any]] = []
    has_subtitles: bool = False
    is_live: bool = False


class DownloadStatusResponse(BaseModel):
    task_id: str
    status: str
    progress: float
    speed: Optional[str]
    eta: Optional[str]
    filename: Optional[str]
    filesize: Optional[int]
    error: Optional[str]


class SiteInfo(BaseModel):
    name: str
    description: str


# API Endpoints
@router.post("/extract", response_model=VideoInfoResponse)
async def extract_video_info(request: ExtractRequest):
    """
    Extract video metadata from a URL without downloading.
    Returns video info, available formats, and recommended quality options.
    """
    # Validate URL
    is_valid, platform, error = validate_url(request.url)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)
    
    url = normalize_url(request.url)
    
    try:
        info = await handler.extract_info(url)
        
        # Convert formats to response model
        formats = [
            VideoFormatResponse(
                format_id=f.format_id,
                ext=f.ext,
                resolution=f.resolution,
                quality_label=f.quality_label,
                size_str=f.size_str,
                is_audio_only=f.is_audio_only,
                is_video_only=f.is_video_only,
            )
            for f in info.formats[:50]  # Limit to 50 formats
        ]
        
        # Get recommended formats
        recommended = handler.get_recommended_formats(info)
        
        return VideoInfoResponse(
            id=info.id,
            title=info.title,
            url=info.url,
            thumbnail=info.thumbnail,
            duration=int(info.duration) if info.duration else None,
            duration_str=info.duration_str,
            uploader=info.uploader,
            view_count=info.view_count,
            view_count_str=info.view_count_str,
            extractor=info.extractor,
            formats=formats,
            recommended_formats=recommended,
            has_subtitles=bool(info.subtitles),
            is_live=info.is_live,
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/download", response_model=DownloadStatusResponse)
async def start_download(request: DownloadRequest, background_tasks: BackgroundTasks):
    """
    Start a video download task.
    Returns a task ID that can be used to track progress and retrieve the file.
    """
    # Validate URL
    is_valid, platform, error = validate_url(request.url)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)
    
    url = normalize_url(request.url)
    
    # Create progress callback for WebSocket updates
    async def send_progress(task):
        task_id = task.task_id
        if task_id in active_connections:
            try:
                await active_connections[task_id].send_json({
                    'task_id': task_id,
                    'status': task.status.value,
                    'progress': task.progress,
                    'speed': task.speed,
                    'eta': task.eta,
                    'filename': task.filename,
                })
            except Exception:
                pass
    
    def progress_callback(task):
        # Schedule async callback
        try:
            loop = asyncio.get_event_loop()
            loop.create_task(send_progress(task))
        except Exception:
            pass
    
    # Start download in background
    task = await handler.download_video(
        url=url,
        format_id=request.format_id,
        audio_only=request.audio_only,
        embed_subs=request.embed_subs,
        embed_thumbnail=request.embed_thumbnail,
        progress_callback=progress_callback,
    )
    
    return DownloadStatusResponse(
        task_id=task.task_id,
        status=task.status.value,
        progress=task.progress,
        speed=task.speed,
        eta=task.eta,
        filename=task.filename,
        filesize=task.filesize,
        error=task.error,
    )


@router.get("/status/{task_id}", response_model=DownloadStatusResponse)
async def get_download_status(task_id: str):
    """
    Get the current status of a download task.
    """
    task = handler.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return DownloadStatusResponse(
        task_id=task.task_id,
        status=task.status.value,
        progress=task.progress,
        speed=task.speed,
        eta=task.eta,
        filename=task.filename,
        filesize=task.filesize,
        error=task.error,
    )


@router.get("/download/{task_id}")
async def get_download_file(task_id: str):
    """
    Retrieve the downloaded file for a completed task.
    """
    task = handler.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.status.value != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Download not ready. Status: {task.status.value}"
        )
    
    if not task.filepath or not os.path.exists(task.filepath):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=task.filepath,
        filename=task.filename,
        media_type='application/octet-stream',
    )


@router.delete("/download/{task_id}")
async def cancel_download(task_id: str):
    """
    Cancel an in-progress download.
    """
    success = handler.cancel_task(task_id)
    if not success:
        raise HTTPException(status_code=400, detail="Cannot cancel this task")
    
    return {"message": "Download cancelled", "task_id": task_id}


@router.get("/sites", response_model=List[SiteInfo])
async def get_supported_sites():
    """
    Get list of all supported video sites.
    """
    sites = handler.get_supported_sites()
    return [SiteInfo(name=s['name'], description=s['description']) for s in sites]


@router.get("/sites/count")
async def get_site_count():
    """
    Get the total count of supported sites.
    """
    sites = handler.get_supported_sites()
    return {"count": len(sites)}


@router.post("/batch/extract")
async def batch_extract(request: BatchExtractRequest):
    """
    Extract metadata for multiple URLs.
    Limited to 10 URLs per request.
    """
    if len(request.urls) > 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 URLs per batch request"
        )
    
    results = []
    for url in request.urls:
        try:
            is_valid, platform, error = validate_url(url)
            if not is_valid:
                results.append({
                    'url': url,
                    'success': False,
                    'error': error,
                })
                continue
            
            normalized_url = normalize_url(url)
            info = await handler.extract_info(normalized_url)
            
            results.append({
                'url': url,
                'success': True,
                'data': {
                    'id': info.id,
                    'title': info.title,
                    'thumbnail': info.thumbnail,
                    'duration_str': info.duration_str,
                    'uploader': info.uploader,
                }
            })
        except Exception as e:
            results.append({
                'url': url,
                'success': False,
                'error': str(e),
            })
    
    return {'results': results}


# WebSocket endpoint for real-time progress
@router.websocket("/ws/progress/{task_id}")
async def websocket_progress(websocket: WebSocket, task_id: str):
    """
    WebSocket endpoint for real-time download progress updates.
    """
    await websocket.accept()
    active_connections[task_id] = websocket
    
    try:
        while True:
            # Keep connection alive and check task status
            task = handler.get_task(task_id)
            if task:
                await websocket.send_json({
                    'task_id': task_id,
                    'status': task.status.value,
                    'progress': task.progress,
                    'speed': task.speed,
                    'eta': task.eta,
                    'filename': task.filename,
                    'error': task.error,
                })
                
                # Close if task is done
                if task.status.value in ('completed', 'failed', 'cancelled'):
                    break
            
            await asyncio.sleep(0.5)
            
    except WebSocketDisconnect:
        pass
    finally:
        if task_id in active_connections:
            del active_connections[task_id]


@router.get("/stream/{task_id}")
async def stream_video(task_id: str, request: Request):
    """
    Stream the downloaded video for preview before saving.
    Uses FileResponse for better browser compatibility.
    """
    print(f"📹 Stream request for task: {task_id}")
    
    task = handler.get_task(task_id)
    if not task:
        print(f"❌ Task {task_id} not found!")
        raise HTTPException(status_code=404, detail="Task not found")
    
    print(f"✅ Task found. Status: {task.status.value}")
    
    if task.status.value != "completed":
        print(f"❌ Task not completed. Status: {task.status.value}")
        raise HTTPException(
            status_code=400,
            detail=f"Download not ready. Status: {task.status.value}"
        )
    
    print(f"📁 Filepath: {task.filepath}")
    
    if not task.filepath or not os.path.exists(task.filepath):
        print(f"❌ File not found at: {task.filepath}")
        raise HTTPException(status_code=404, detail="File not found")
    
    file_size = os.path.getsize(task.filepath)
    print(f"📊 File size: {file_size / (1024*1024):.2f} MB")
    
    # Determine content type
    content_type, _ = mimetypes.guess_type(task.filepath)
    if not content_type:
        content_type = 'video/mp4'
    
    print(f"🎬 Content-Type: {content_type}")
    
    # Use FileResponse which handles range requests automatically
    return FileResponse(
        path=task.filepath,
        media_type=content_type,
        filename=task.filename or os.path.basename(task.filepath),
        headers={
            'Accept-Ranges': 'bytes',
            'Access-Control-Allow-Origin': '*',
        }
    )


@router.get("/formats/{task_id}")
async def get_all_formats(task_id: str):
    """
    Get all available formats for a completed extraction.
    """
    task = handler.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if not task.video_info:
        raise HTTPException(status_code=400, detail="No video info available")
    
    # Group formats by type
    formats = {
        'video_audio': [],  # Combined video+audio
        'video_only': [],   # Video only (no audio)
        'audio_only': [],   # Audio only
    }
    
    for fmt in task.video_info.formats:
        format_data = {
            'format_id': fmt.format_id,
            'ext': fmt.ext,
            'resolution': fmt.resolution,
            'quality_label': fmt.quality_label,
            'size_str': fmt.size_str,
            'filesize': fmt.filesize or fmt.filesize_approx,
            'vcodec': fmt.vcodec,
            'acodec': fmt.acodec,
            'fps': fmt.fps,
            'tbr': fmt.tbr,
        }
        
        if fmt.is_audio_only:
            formats['audio_only'].append(format_data)
        elif fmt.is_video_only:
            formats['video_only'].append(format_data)
        else:
            formats['video_audio'].append(format_data)
    
    return formats


@router.get("/thumbnail")
async def proxy_thumbnail(url: str):
    """
    Proxy endpoint to fetch thumbnails from external sources.
    Bypasses CORS restrictions for platforms like Instagram.
    """
    if not url:
        raise HTTPException(status_code=400, detail="URL parameter required")
    
    # Decode URL if needed
    thumbnail_url = unquote(url)
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                thumbnail_url,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.instagram.com/',
                },
                follow_redirects=True
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch thumbnail")
            
            # Get content type
            content_type = response.headers.get('content-type', 'image/jpeg')
            
            return Response(
                content=response.content,
                media_type=content_type,
                headers={
                    'Cache-Control': 'public, max-age=3600',
                    'Access-Control-Allow-Origin': '*',
                }
            )
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timeout fetching thumbnail")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching thumbnail: {str(e)}")
