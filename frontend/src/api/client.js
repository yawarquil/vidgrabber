import axios from 'axios';

// Create axios instance with base config
const api = axios.create({
    baseURL: '/api',
    timeout: 120000, // 120 seconds for video extraction (increased for slow platforms)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.detail || error.message || 'An error occurred';
        return Promise.reject(new Error(message));
    }
);

// API Methods
export const videoApi = {
    // Extract video info from URL
    extract: async (url) => {
        const response = await api.post('/extract', { url });
        return response.data;
    },

    // Start video download
    download: async (url, options = {}) => {
        const response = await api.post('/download', {
            url,
            format_id: options.formatId || 'best',
            audio_only: options.audioOnly || false,
            embed_subs: options.embedSubs || false,
            embed_thumbnail: options.embedThumbnail || false,
        });
        return response.data;
    },

    // Get download status
    getStatus: async (taskId) => {
        const response = await api.get(`/status/${taskId}`);
        return response.data;
    },

    // Get download file URL (for saving to device)
    getDownloadUrl: (taskId) => {
        return `/api/download/${taskId}`;
    },

    // Get video stream URL (for preview)
    getStreamUrl: (taskId) => {
        return `/api/stream/${taskId}`;
    },

    // Get all available formats for a task
    getAllFormats: async (taskId) => {
        const response = await api.get(`/formats/${taskId}`);
        return response.data;
    },

    // Get supported sites
    getSites: async () => {
        const response = await api.get('/sites');
        return response.data;
    },

    // Get site count
    getSiteCount: async () => {
        const response = await api.get('/sites/count');
        return response.data;
    },

    // Batch extract
    batchExtract: async (urls) => {
        const response = await api.post('/batch/extract', { urls });
        return response.data;
    },

    // Cancel a download task
    cancelDownload: async (taskId) => {
        const response = await api.delete(`/download/${taskId}`);
        return response.data;
    },

    // Get video stream URL for preview
    getStreamUrl: (taskId) => {
        return `/api/stream/${taskId}`;
    },
};

// WebSocket connection for progress updates
export const createProgressSocket = (taskId, onMessage, onError, onClose) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws/progress/${taskId}`;

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            onMessage(data);
        } catch (e) {
            console.error('WebSocket parse error:', e);
        }
    };

    ws.onerror = (error) => {
        onError?.(error);
    };

    ws.onclose = () => {
        console.log('WebSocket closed');
        onClose?.();
    };

    return ws;
};

export default api;

