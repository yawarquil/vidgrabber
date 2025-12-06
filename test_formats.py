import yt_dlp

url = 'https://www.youtube.com/watch?v=n6MCvGfDPKE'

ydl_opts = {
    'quiet': False,
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info(url, download=False)
    
    formats = info.get('formats', [])
    print(f"\nTotal formats: {len(formats)}")
    
    # Filter video formats
    video_formats = [f for f in formats if f.get('vcodec') != 'none' and f.get('height')]
    print(f"Video formats: {len(video_formats)}")
    
    # Show top 15
    video_formats.sort(key=lambda x: x.get('height', 0), reverse=True)
    print("\nTop formats:")
    for f in video_formats[:15]:
        height = f.get('height')
        vcodec = f.get('vcodec', 'none')
        acodec = f.get('acodec', 'none')
        ext = f.get('ext')
        filesize = f.get('filesize') or f.get('filesize_approx', 0)
        size_mb = filesize / (1024*1024) if filesize else 0
        print(f"  {f['format_id']:>6}: {height:>4}p {ext:>4} v:{vcodec[:10]:>10} a:{acodec[:10]:>10} {size_mb:>6.1f}MB")
