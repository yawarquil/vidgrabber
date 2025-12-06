import yt_dlp
import sys

url = sys.argv[1] if len(sys.argv) > 1 else "https://www.instagram.com/reel/DDLdHhvS4Pu/"

ydl_opts = {
    'quiet': True,
    'no_warnings': True,
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info(url, download=False)
    formats = info.get('formats', [])
    
    print(f"\n{'='*60}")
    print(f"Title: {info.get('title', 'Unknown')}")
    print(f"Total formats: {len(formats)}")
    print(f"{'='*60}\n")
    
    for f in formats:
        format_id = f.get('format_id', 'N/A')
        ext = f.get('ext', 'N/A')
        vcodec = f.get('vcodec', 'none')
        acodec = f.get('acodec', 'none')
        height = f.get('height', 0)
        width = f.get('width', 0)
        
        has_video = vcodec != 'none'
        has_audio = acodec != 'none'
        
        status = ""
        if has_video and has_audio:
            status = "VIDEO+AUDIO"
        elif has_video:
            status = "VIDEO ONLY"
        elif has_audio:
            status = "AUDIO ONLY"
        
        print(f"{format_id:15} | {ext:5} | {width}x{height:4} | v:{vcodec[:10]:10} a:{acodec[:10]:10} | {status}")
