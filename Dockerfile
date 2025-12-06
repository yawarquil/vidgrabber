# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Python Backend
FROM python:3.11-slim

# Install system dependencies (ffmpeg for audio/video processing, curl/wget for downloads)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    wget \
    aria2 \
    && rm -rf /var/lib/apt/lists/*

# Download and install binary downloaders
WORKDIR /tmp

# Install N_m3u8DL-RE (for HLS/M3U8 streams)
RUN curl -L -o N_m3u8DL-RE.zip "https://github.com/nilaoda/N_m3u8DL-RE/releases/download/v0.3.0-beta/N_m3u8DL-RE_v0.3.0-beta_linux-x64.zip" 2>/dev/null || true \
    && if [ -f N_m3u8DL-RE.zip ]; then unzip -q N_m3u8DL-RE.zip -d /usr/local/bin/ 2>/dev/null || true; fi \
    && rm -f N_m3u8DL-RE.zip

# Install lux (formerly annie, for Bilibili/YouTube)
RUN curl -L -o lux.tar.gz "https://github.com/iawia002/lux/releases/download/v0.24.1/lux_0.24.1_Linux_x86_64.tar.gz" 2>/dev/null || true \
    && if [ -f lux.tar.gz ]; then tar -xzf lux.tar.gz -C /usr/local/bin/ lux 2>/dev/null || true; fi \
    && rm -f lux.tar.gz

WORKDIR /app

# Copy backend requirements
COPY backend/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend to static directory
COPY --from=frontend-builder /app/frontend/dist ./static/

# Create downloads directory
RUN mkdir -p /app/downloads

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DOWNLOAD_DIR=/app/downloads

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Run the application
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
