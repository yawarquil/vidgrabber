"""
Fallback video downloaders when yt-dlp fails or has limited quality
"""
import subprocess
import json
from typing import Optional, Dict, Any
import asyncio


class DownloadResult:
    def __init__(self, success: bool, data: Optional[Dict[str, Any]] = None, error: str = ""):
        self.success = success
        self.data = data or {}
        self.error = error


async def try_youtube_dl(url: str) -> DownloadResult:
    """
    Try youtube-dl - original YouTube downloader (slower but stable)
    """
    try:
        def _run():
            result = subprocess.run(
                ['youtube-dl', '--dump-json', '--no-download', url],
                capture_output=True,
                timeout=60,
                text=True
            )
            return result
        
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _run)
        
        if result.returncode == 0:
            try:
                data = json.loads(result.stdout)
                return DownloadResult(True, data={
                    'title': data.get('title', 'Unknown'),
                    'extractor': 'youtube-dl',
                    'formats': data.get('formats', []),
                    'thumbnail': data.get('thumbnail'),
                    'duration': data.get('duration')
                })
            except json.JSONDecodeError:
                return DownloadResult(False, error="Failed to parse youtube-dl output")
        
        return DownloadResult(False, error=result.stderr or "youtube-dl extraction failed")
    
    except subprocess.TimeoutExpired:
        return DownloadResult(False, error="youtube-dl timed out")
    except FileNotFoundError:
        return DownloadResult(False, error="youtube-dl not installed")
    except Exception as e:
        return DownloadResult(False, error=f"youtube-dl error: {str(e)}")


async def try_youget(url: str) -> DownloadResult:
    """
    Try You-Get - good for Bilibili, Vimeo, and Chinese platforms
    """
    try:
        def _run():
            result = subprocess.run(
                ['you-get', '--json', url],
                capture_output=True,
                timeout=30,
                text=True
            )
            return result
        
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _run)
        
        if result.returncode == 0:
            try:
                data = json.loads(result.stdout)
                return DownloadResult(True, data={
                    'title': data.get('title', 'Unknown'),
                    'extractor': 'you-get',
                    'site': data.get('site', 'Unknown'),
                    'streams': data.get('streams', [])
                })
            except json.JSONDecodeError:
                return DownloadResult(False, error="Failed to parse you-get output")
        
        return DownloadResult(False, error=result.stderr or "you-get extraction failed")
    
    except subprocess.TimeoutExpired:
        return DownloadResult(False, error="you-get timed out")
    except FileNotFoundError:
        return DownloadResult(False, error="you-get not installed")
    except Exception as e:
        return DownloadResult(False, error=f"you-get error: {str(e)}")


async def try_streamlink(url: str) -> DownloadResult:
    """
    Try Streamlink - excellent for live streams (Twitch, YouTube Live, etc.)
    """
    try:
        def _run():
            result = subprocess.run(
                ['streamlink', '--json', url],
                capture_output=True,
                timeout=30,
                text=True
            )
            return result
        
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _run)
        
        if result.returncode == 0:
            try:
                data = json.loads(result.stdout)
                streams = data.get('streams', {})
                return DownloadResult(True, data={
                    'title': data.get('metadata', {}).get('title', 'Unknown'),
                    'extractor': 'streamlink',
                    'streams': list(streams.keys()),
                    'best_stream': 'best' if 'best' in streams else list(streams.keys())[0] if streams else None
                })
            except (json.JSONDecodeError, IndexError):
                return DownloadResult(False, error="Failed to parse streamlink output")
        
        return DownloadResult(False, error=result.stderr or "streamlink extraction failed")
    
    except subprocess.TimeoutExpired:
        return DownloadResult(False, error="streamlink timed out")
    except FileNotFoundError:
        return DownloadResult(False, error="streamlink not installed")
    except Exception as e:
        return DownloadResult(False, error=f"streamlink error: {str(e)}")


async def try_gallery_dl(url: str) -> DownloadResult:
    """
    Try gallery-dl - for image/video galleries and collections
    """
    try:
        def _run():
            result = subprocess.run(
                ['gallery-dl', '--no-download', '--dump-json', url],
                capture_output=True,
                timeout=30,
                text=True
            )
            return result
        
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _run)
        
        if result.returncode == 0:
            try:
                # gallery-dl outputs one JSON object per line
                lines = result.stdout.strip().split('\n')
                if lines:
                    first_item = json.loads(lines[0])
                    return DownloadResult(True, data={
                        'title': first_item.get('filename', 'Unknown'),
                        'extractor': 'gallery-dl',
                        'category': first_item.get('category', 'Unknown'),
                        'count': len(lines)
                    })
            except (json.JSONDecodeError, IndexError):
                return DownloadResult(False, error="Failed to parse gallery-dl output")
        
        return DownloadResult(False, error=result.stderr or "gallery-dl extraction failed")
    
    except subprocess.TimeoutExpired:
        return DownloadResult(False, error="gallery-dl timed out")
    except FileNotFoundError:
        return DownloadResult(False, error="gallery-dl not installed")
    except Exception as e:
        return DownloadResult(False, error=f"gallery-dl error: {str(e)}")


async def try_lux(url: str) -> DownloadResult:
    """
    Try lux (formerly annie) - Go-based, good for Bilibili, YouTube, Twitter
    """
    try:
        def _run():
            result = subprocess.run(
                ['lux', '-j', url],
                capture_output=True,
                timeout=30,
                text=True
            )
            return result
        
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _run)
        
        if result.returncode == 0:
            try:
                data = json.loads(result.stdout)
                if isinstance(data, list) and len(data) > 0:
                    first = data[0]
                    return DownloadResult(True, data={
                        'title': first.get('title', 'Unknown'),
                        'extractor': 'lux',
                        'site': first.get('site', 'Unknown'),
                        'streams': first.get('streams', {})
                    })
            except json.JSONDecodeError:
                return DownloadResult(False, error="Failed to parse lux output")
        
        return DownloadResult(False, error=result.stderr or "lux extraction failed")
    
    except subprocess.TimeoutExpired:
        return DownloadResult(False, error="lux timed out")
    except FileNotFoundError:
        return DownloadResult(False, error="lux not installed")
    except Exception as e:
        return DownloadResult(False, error=f"lux error: {str(e)}")


async def try_fallback_extractors(url: str) -> DownloadResult:
    """
    Try alternative extractors in sequence when yt-dlp fails
    """
    print(f"🔄 Trying fallback extractors for: {url}")
    
    # Check if it's a YouTube URL - try youtube-dl first
    is_youtube = 'youtube.com' in url.lower() or 'youtu.be' in url.lower()
    
    if is_youtube:
        # Try youtube-dl first for YouTube
        print("  → Trying youtube-dl...")
        result = await try_youtube_dl(url)
        if result.success:
            print("  ✅ Success with youtube-dl!")
            return result
        print(f"  ✗ youtube-dl failed: {result.error}")
    
    # Try lux
    print("  → Trying lux...")
    result = await try_lux(url)
    if result.success:
        print("  ✅ Success with lux!")
        return result
    print(f"  ✗ lux failed: {result.error}")
    
    # Try you-get
    print("  → Trying you-get...")
    result = await try_youget(url)
    if result.success:
        print("  ✅ Success with you-get!")
        return result
    print(f"  ✗ you-get failed: {result.error}")
    
    # Try streamlink
    print("  → Trying streamlink...")
    result = await try_streamlink(url)
    if result.success:
        print("  ✅ Success with streamlink!")
        return result
    print(f"  ✗ streamlink failed: {result.error}")
    
    # Try gallery-dl
    print("  → Trying gallery-dl...")
    result = await try_gallery_dl(url)
    if result.success:
        print("  ✅ Success with gallery-dl!")
        return result
    print(f"  ✗ gallery-dl failed: {result.error}")
    
    return DownloadResult(False, error="All fallback extractors failed")

