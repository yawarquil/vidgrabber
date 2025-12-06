"""
URL Validation and Sanitization Utilities for VidGrabber
"""
import re
from urllib.parse import urlparse, parse_qs
from typing import Optional, Tuple


# Common video platform patterns - expanded for better compatibility
VIDEO_PLATFORM_PATTERNS = {
    'youtube': [
        r'(?:https?://)?(?:www\.)?youtube\.com/watch\?v=[\w-]+',
        r'(?:https?://)?(?:www\.)?youtube\.com/shorts/[\w-]+',
        r'(?:https?://)?youtu\.be/[\w-]+',
        r'(?:https?://)?(?:www\.)?youtube\.com/playlist\?list=[\w-]+',
        r'(?:https?://)?(?:www\.)?youtube\.com/embed/[\w-]+',
        r'(?:https?://)?(?:www\.)?youtube\.com/v/[\w-]+',
        r'(?:https?://)?(?:m\.)?youtube\.com/watch\?v=[\w-]+',
    ],
    'twitter': [
        r'(?:https?://)?(?:www\.)?(?:twitter|x)\.com/\w+/status/\d+',
        r'(?:https?://)?(?:mobile\.)?(?:twitter|x)\.com/\w+/status/\d+',
    ],
    'instagram': [
        # Standard post/reel/tv URLs
        r'(?:https?://)?(?:www\.)?instagram\.com/(?:p|reel|reels|tv)/[\w-]+/?',
        # User profile reels
        r'(?:https?://)?(?:www\.)?instagram\.com/[\w.]+/reel/[\w-]+/?',
        # Stories
        r'(?:https?://)?(?:www\.)?instagram\.com/stories/[\w.]+/\d+/?',
        # IGTV
        r'(?:https?://)?(?:www\.)?instagram\.com/[\w.]+/channel/?',
        # Share URLs
        r'(?:https?://)?(?:www\.)?instagram\.com/share/[\w-]+/?',
        # Mobile URLs
        r'(?:https?://)?(?:www\.)?instagr\.am/(?:p|reel|tv)/[\w-]+/?',
    ],
    'tiktok': [
        r'(?:https?://)?(?:www\.)?tiktok\.com/@[\w.]+/video/\d+',
        r'(?:https?://)?(?:vm|vt)\.tiktok\.com/[\w]+/?',
        r'(?:https?://)?(?:www\.)?tiktok\.com/t/[\w]+/?',
        r'(?:https?://)?(?:m\.)?tiktok\.com/v/\d+',
        r'(?:https?://)?(?:www\.)?tiktok\.com/@[\w.]+/photo/\d+',
    ],
    'vimeo': [
        r'(?:https?://)?(?:www\.)?vimeo\.com/\d+',
        r'(?:https?://)?player\.vimeo\.com/video/\d+',
    ],
    'facebook': [
        r'(?:https?://)?(?:www\.)?facebook\.com/.+/videos/\d+',
        r'(?:https?://)?(?:www\.)?fb\.watch/[\w]+',
        r'(?:https?://)?(?:www\.)?facebook\.com/watch/?\?v=\d+',
        r'(?:https?://)?(?:www\.)?facebook\.com/reel/\d+',
        r'(?:https?://)?(?:www\.)?fb\.com/.+/videos/\d+',
    ],
    'reddit': [
        r'(?:https?://)?(?:www\.)?reddit\.com/r/\w+/comments/[\w]+',
        r'(?:https?://)?(?:v\.)?redd\.it/[\w]+',
    ],
    'twitch': [
        r'(?:https?://)?(?:www\.)?twitch\.tv/videos/\d+',
        r'(?:https?://)?clips\.twitch\.tv/[\w-]+',
        r'(?:https?://)?(?:www\.)?twitch\.tv/[\w]+/clip/[\w-]+',
    ],
    'pinterest': [
        r'(?:https?://)?(?:www\.)?pinterest\.com/pin/\d+',
        r'(?:https?://)?pin\.it/[\w]+',
    ],
    'linkedin': [
        r'(?:https?://)?(?:www\.)?linkedin\.com/posts/[\w-]+-\d+-[\w-]+',
        r'(?:https?://)?(?:www\.)?linkedin\.com/feed/update/urn:li:activity:\d+',
    ],
    'snapchat': [
        r'(?:https?://)?(?:www\.)?snapchat\.com/spotlight/[\w]+',
        r'(?:https?://)?story\.snapchat\.com/[\w/@]+',
    ],
    'dailymotion': [
        r'(?:https?://)?(?:www\.)?dailymotion\.com/video/[\w]+',
        r'(?:https?://)?dai\.ly/[\w]+',
    ],
}


def validate_url(url: str) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Validate if a URL is a potential video URL.
    
    Returns:
        Tuple of (is_valid, platform_name, error_message)
    """
    if not url or not isinstance(url, str):
        return False, None, "URL cannot be empty"
    
    url = url.strip()
    
    # Basic URL structure check
    try:
        parsed = urlparse(url)
        if not parsed.scheme:
            url = f"https://{url}"
            parsed = urlparse(url)
        
        if parsed.scheme not in ('http', 'https'):
            return False, None, "URL must use HTTP or HTTPS protocol"
        
        if not parsed.netloc:
            return False, None, "Invalid URL format"
            
    except Exception:
        return False, None, "Failed to parse URL"
    
    # Check against known patterns
    for platform, patterns in VIDEO_PLATFORM_PATTERNS.items():
        for pattern in patterns:
            if re.match(pattern, url, re.IGNORECASE):
                return True, platform, None
    
    # If no known pattern matches, still allow it (yt-dlp supports 1000+ sites)
    # but mark as unknown platform
    return True, "other", None


def sanitize_filename(filename: str, max_length: int = 200) -> str:
    """
    Sanitize a filename to be safe for filesystem use.
    """
    if not filename:
        return "video"
    
    # Remove/replace invalid characters
    invalid_chars = '<>:"/\\|?*\x00'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    
    # Remove leading/trailing spaces and dots
    filename = filename.strip(' .')
    
    # Truncate if too long
    if len(filename) > max_length:
        filename = filename[:max_length]
    
    # Ensure we have something
    if not filename:
        filename = "video"
    
    return filename


def normalize_url(url: str) -> str:
    """
    Normalize a URL to a consistent format.
    """
    url = url.strip()
    
    # Add scheme if missing
    if not url.startswith(('http://', 'https://')):
        url = f"https://{url}"
    
    return url


def extract_video_id(url: str, platform: str) -> Optional[str]:
    """
    Extract the video ID from a URL for supported platforms.
    """
    parsed = urlparse(url)
    
    if platform == 'youtube':
        if 'youtube.com' in parsed.netloc:
            query = parse_qs(parsed.query)
            return query.get('v', [None])[0]
        elif 'youtu.be' in parsed.netloc:
            return parsed.path.lstrip('/')
    
    elif platform == 'vimeo':
        return parsed.path.lstrip('/')
    
    elif platform == 'twitter':
        match = re.search(r'/status/(\d+)', parsed.path)
        return match.group(1) if match else None
    
    elif platform == 'tiktok':
        match = re.search(r'/video/(\d+)', parsed.path)
        return match.group(1) if match else None
    
    return None


# Error message mappings for common yt-dlp errors
ERROR_MESSAGES = {
    'Private video': "This video is private. Only the owner can view it.",
    'Video unavailable': "This video is not available. It may have been removed or is geo-restricted.",
    'Sign in': "This video requires you to be signed in. Try a different video.",
    'age-restricted': "This video is age-restricted. Consider using cookies for authentication.",
    'copyright': "This video was removed due to a copyright claim.",
    'This live event has ended': "This was a live stream that has ended and is not available for download.",
    'Unsupported URL': "This URL is not supported. Please try a different video link.",
    'HTTP Error 403': "Access forbidden. The video might be geo-restricted or require authentication.",
    'HTTP Error 404': "Video not found. The URL might be incorrect or the video was removed.",
    'No video formats found': "Could not find any downloadable video formats.",
}


def get_friendly_error(error: str) -> str:
    """
    Convert technical yt-dlp errors to user-friendly messages.
    """
    error_str = str(error).lower()
    
    for key, message in ERROR_MESSAGES.items():
        if key.lower() in error_str:
            return message
    
    return f"An error occurred while processing the video: {error}"
