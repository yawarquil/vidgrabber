# VidGrabber - Universal Video Downloader

A modern, privacy-focused web application for downloading videos from 1000+ sites using yt-dlp.

![VidGrabber Preview](https://via.placeholder.com/800x450/0a0a0f/00d4ff?text=VidGrabber)

## ✨ Features

- **🌐 Universal Support** - Download from YouTube, Twitter/X, TikTok, Instagram, Vimeo, and 1000+ other sites
- **🎨 Modern UI** - Sleek dark theme with glassmorphism, animations, and responsive design
- **📊 Format Selection** - Choose from various quality options (4K, 1080p, 720p, etc.) or audio-only
- **📁 Batch Downloads** - Queue multiple videos for sequential downloading
- **🔒 Privacy Focused** - No accounts, no tracking, no data collection
- **⚡ Real-time Progress** - Live download progress with speed and ETA
- **📝 Subtitle Support** - Option to embed subtitles in downloaded videos

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- FFmpeg (optional, for format conversion)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/vidgrabber.git
cd vidgrabber
```

2. **Set up the backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

3. **Set up the frontend**
```bash
cd frontend
npm install
```

4. **Run both servers**

In terminal 1 (Backend):
```bash
cd backend
uvicorn app:app --reload --port 8000
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

5. **Open the app**
Navigate to `http://localhost:3000`

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t vidgrabber .
docker run -p 8000:8000 vidgrabber
```

Access at `http://localhost:8000`

## 📖 API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

### Main Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/extract` | POST | Extract video metadata from URL |
| `/api/download` | POST | Start video download |
| `/api/status/{task_id}` | GET | Get download progress |
| `/api/download/{task_id}` | GET | Download completed file |
| `/api/sites` | GET | List supported sites |

## 🛠 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **yt-dlp** - Video extraction engine (1000+ sites)
- **Uvicorn** - ASGI server with WebSocket support

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

## 📂 Project Structure

```
vidgrabber/
├── backend/
│   ├── app.py                 # FastAPI entry point
│   ├── routes.py              # API endpoints
│   ├── requirements.txt       # Python dependencies
│   ├── extractors/
│   │   └── ytdlp_handler.py   # yt-dlp wrapper
│   └── utils/
│       └── validators.py      # URL validation
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main component
│   │   ├── api/client.js      # API client
│   │   └── components/        # React components
│   ├── package.json
│   └── tailwind.config.js
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## ⚠️ Legal Notice

This tool is intended for personal use only. Please:
- Respect the terms of service of video platforms
- Only download content you have the right to download
- Do not use for commercial purposes without proper licensing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details.

---

Made with ❤️ using yt-dlp
