import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Music, Film, AlertCircle } from 'lucide-react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

// Custom styles for Video.js to match our dark theme with premium progress bar
const customStyles = `
.vjs-theme-dark {
    --vjs-theme-dark--primary: #22d3ee;
    --vjs-theme-dark--secondary: #1a1a2e;
}

.vjs-theme-dark .vjs-control-bar {
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.9)) !important;
    height: 4.5em !important;
    padding: 0 0.5rem !important;
}

/* Progress Control Container */
.vjs-theme-dark .vjs-progress-control {
    position: absolute !important;
    bottom: 3.5em !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    height: 1.5em !important;
    padding: 0 1rem !important;
}

/* Progress Holder - the track */
.vjs-theme-dark .vjs-progress-holder {
    height: 5px !important;
    background: rgba(255, 255, 255, 0.15) !important;
    border-radius: 10px !important;
    margin: 0 !important;
    transition: height 0.15s ease, box-shadow 0.15s ease !important;
    cursor: pointer !important;
}

/* Expand progress bar on hover */
.vjs-theme-dark .vjs-progress-control:hover .vjs-progress-holder {
    height: 8px !important;
    box-shadow: 0 0 15px rgba(34, 211, 238, 0.3) !important;
}

/* Load Progress (buffered) */
.vjs-theme-dark .vjs-load-progress {
    background: rgba(255, 255, 255, 0.25) !important;
    border-radius: 10px !important;
}

.vjs-theme-dark .vjs-load-progress div {
    background: rgba(255, 255, 255, 0.35) !important;
    border-radius: 10px !important;
}

/* Play Progress - the filled part with gradient */
.vjs-theme-dark .vjs-play-progress {
    background: linear-gradient(90deg, #22d3ee 0%, #a855f7 50%, #ec4899 100%) !important;
    border-radius: 10px !important;
    box-shadow: 0 0 10px rgba(34, 211, 238, 0.5), 0 0 20px rgba(168, 85, 247, 0.3) !important;
}

/* Scrubber Handle */
.vjs-theme-dark .vjs-play-progress:before {
    content: '' !important;
    position: absolute !important;
    right: -7px !important;
    top: 50% !important;
    transform: translateY(-50%) scale(0) !important;
    width: 14px !important;
    height: 14px !important;
    background: #fff !important;
    border-radius: 50% !important;
    box-shadow: 0 0 10px rgba(34, 211, 238, 0.8), 0 2px 8px rgba(0, 0, 0, 0.4) !important;
    transition: transform 0.15s ease !important;
    font-size: 0 !important;
}

/* Show scrubber handle on hover */
.vjs-theme-dark .vjs-progress-control:hover .vjs-play-progress:before {
    transform: translateY(-50%) scale(1) !important;
}

/* Slider (general - for volume too) */
.vjs-theme-dark .vjs-slider {
    background: rgba(255, 255, 255, 0.15) !important;
    border-radius: 10px !important;
}

/* Volume Level */
.vjs-theme-dark .vjs-volume-level {
    background: linear-gradient(90deg, #22d3ee, #06b6d4) !important;
    border-radius: 10px !important;
}

/* Volume bar styling */
.vjs-theme-dark .vjs-volume-bar {
    height: 5px !important;
    border-radius: 10px !important;
}

/* Big Play Button */
.vjs-theme-dark .vjs-big-play-button {
    background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%) !important;
    border: none !important;
    border-radius: 50% !important;
    width: 80px !important;
    height: 80px !important;
    line-height: 80px !important;
    font-size: 40px !important;
    margin-left: -40px !important;
    margin-top: -40px !important;
    box-shadow: 0 0 30px rgba(34, 211, 238, 0.4), 0 8px 32px rgba(0, 0, 0, 0.4) !important;
    transition: transform 0.2s ease, box-shadow 0.2s ease !important;
}

.vjs-theme-dark .vjs-big-play-button:hover,
.vjs-theme-dark .vjs-big-play-button:focus {
    background: linear-gradient(135deg, #06b6d4 0%, #9333ea 100%) !important;
    transform: scale(1.1) !important;
    box-shadow: 0 0 50px rgba(34, 211, 238, 0.6), 0 12px 40px rgba(0, 0, 0, 0.5) !important;
}

/* Control hover color */
.vjs-theme-dark .vjs-control:hover {
    color: #22d3ee !important;
}

/* Time controls */
.vjs-theme-dark .vjs-time-control {
    line-height: 4.5em !important;
    font-size: 0.9em !important;
    padding: 0 0.5rem !important;
}

.vjs-theme-dark .vjs-current-time,
.vjs-theme-dark .vjs-duration {
    color: #fff !important;
}

.vjs-theme-dark .vjs-time-divider {
    color: rgba(255, 255, 255, 0.5) !important;
}

/* Tooltip styling */
.vjs-theme-dark .vjs-time-tooltip {
    background: rgba(0, 0, 0, 0.9) !important;
    border: 1px solid rgba(34, 211, 238, 0.3) !important;
    border-radius: 6px !important;
    color: #22d3ee !important;
    font-weight: 500 !important;
    padding: 4px 8px !important;
}

/* Mouse display (hover time indicator) */
.vjs-theme-dark .vjs-mouse-display {
    background: rgba(34, 211, 238, 0.8) !important;
    width: 2px !important;
}

/* Fullscreen button */
.vjs-theme-dark .vjs-fullscreen-control {
    transition: transform 0.2s ease !important;
}

.vjs-theme-dark .vjs-fullscreen-control:hover {
    transform: scale(1.15) !important;
}

/* Play/Pause button glow */
.vjs-theme-dark .vjs-play-control {
    transition: text-shadow 0.2s ease !important;
}

.vjs-theme-dark .vjs-play-control:hover {
    text-shadow: 0 0 10px rgba(34, 211, 238, 0.8) !important;
}

/* Audio-only styling */
.vjs-audio .vjs-big-play-button {
    display: block !important;
}

.vjs-audio-only-mode .vjs-poster {
    display: flex !important;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
}

.audio-visualizer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 100%;
}

.audio-bar {
    width: 4px;
    background: #22d3ee;
    border-radius: 2px;
    animation: audioWave 0.5s ease-in-out infinite;
}

@keyframes audioWave {
    0%, 100% { height: 20%; }
    50% { height: 80%; }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
`;

const MediaPreviewModal = ({ isOpen, onClose, mediaUrl, filename, onDownload, isAudio = false }) => {
    const videoContainerRef = useRef(null);
    const playerRef = useRef(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Inject custom styles
    useEffect(() => {
        const styleId = 'videojs-custom-theme';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = customStyles;
            document.head.appendChild(style);
        }
    }, []);

    // Initialize Video.js player
    useEffect(() => {
        if (!isOpen || !videoContainerRef.current) return;

        setLoading(true);
        setError(null);

        // Determine media type
        const ext = filename?.split('.').pop()?.toLowerCase() || '';
        const audioExtensions = ['mp3', 'm4a', 'wav', 'flac', 'aac', 'ogg', 'opus', 'wma'];
        const isAudioFile = isAudio || audioExtensions.includes(ext);

        // Create video element
        const videoElement = document.createElement(isAudioFile ? 'audio' : 'video');
        videoElement.className = 'video-js vjs-theme-dark vjs-big-play-centered';
        videoContainerRef.current.innerHTML = '';
        videoContainerRef.current.appendChild(videoElement);

        // Initialize player
        const player = videojs(videoElement, {
            autoplay: false,
            controls: true,
            responsive: true,
            fluid: true,
            preload: 'auto',
            sources: [{
                src: mediaUrl,
                type: isAudioFile ? 'audio/mpeg' : 'video/mp4'
            }],
            controlBar: {
                children: [
                    'playToggle',
                    'volumePanel',
                    'currentTimeDisplay',
                    'timeDivider',
                    'durationDisplay',
                    'progressControl',
                    'fullscreenToggle'
                ]
            }
        });

        playerRef.current = player;

        // Event handlers
        player.on('loadeddata', () => {
            setLoading(false);
        });

        player.on('error', (e) => {
            console.error('Video.js error:', player.error());
            setLoading(false);
            const err = player.error();
            let msg = 'Unable to load media.';
            if (err) {
                switch (err.code) {
                    case 1: msg = 'Media loading aborted.'; break;
                    case 2: msg = 'Network error while loading media.'; break;
                    case 3: msg = 'Media decoding failed.'; break;
                    case 4: msg = 'Media format not supported.'; break;
                }
            }
            setError(msg);
        });

        player.on('canplay', () => {
            setLoading(false);
        });

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
            document.body.style.overflow = '';
        };
    }, [isOpen, mediaUrl, filename, isAudio]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKey = (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === ' ' && playerRef.current) {
                e.preventDefault();
                if (playerRef.current.paused()) {
                    playerRef.current.play();
                } else {
                    playerRef.current.pause();
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Determine if audio
    const ext = filename?.split('.').pop()?.toLowerCase() || '';
    const audioExtensions = ['mp3', 'm4a', 'wav', 'flac', 'aac', 'ogg', 'opus', 'wma'];
    const isAudioFile = isAudio || audioExtensions.includes(ext);

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: isAudioFile ? '32rem' : '56rem',
                        backgroundColor: '#1a1a2e',
                        borderRadius: '1rem',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        background: 'linear-gradient(to right, #1a1a2e, #16213e)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '80%' }}>
                            {isAudioFile ? (
                                <Music style={{ width: 24, height: 24, color: '#22d3ee', flexShrink: 0 }} />
                            ) : (
                                <Film style={{ width: 24, height: 24, color: '#22d3ee', flexShrink: 0 }} />
                            )}
                            <h3 style={{
                                fontWeight: 600,
                                color: 'white',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                margin: 0,
                            }}>
                                {filename || (isAudioFile ? 'Audio Preview' : 'Video Preview')}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '0.5rem',
                                color: '#9ca3af',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <X style={{ width: 20, height: 20 }} />
                        </button>
                    </div>

                    {/* Media Container */}
                    <div style={{
                        position: 'relative',
                        backgroundColor: '#0a0a14',
                        aspectRatio: isAudioFile ? '16/6' : '16/9',
                        minHeight: isAudioFile ? '180px' : undefined,
                    }}>
                        {/* Video.js container */}
                        <div
                            ref={videoContainerRef}
                            style={{
                                width: '100%',
                                height: '100%',
                                display: error ? 'none' : 'block',
                            }}
                        />

                        {/* Audio Visualization Background */}
                        {isAudioFile && !error && !loading && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 60,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                                pointerEvents: 'none',
                                zIndex: -1,
                            }}>
                                <div className="audio-visualizer" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    height: '60%',
                                }}>
                                    {[...Array(20)].map((_, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                width: 6,
                                                background: 'linear-gradient(to top, #22d3ee, #06b6d4)',
                                                borderRadius: 3,
                                                animation: `audioWave ${0.4 + Math.random() * 0.4}s ease-in-out infinite`,
                                                animationDelay: `${i * 0.05}s`,
                                                height: `${20 + Math.random() * 60}%`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Loading Spinner */}
                        {loading && !error && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                zIndex: 10,
                            }}>
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    border: '4px solid #22d3ee',
                                    borderTopColor: 'transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                }} />
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#0a0a14',
                                padding: '2rem',
                                textAlign: 'center',
                            }}>
                                <AlertCircle style={{ width: 48, height: 48, color: '#f87171', marginBottom: '1rem' }} />
                                <div style={{ color: '#f87171', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    Preview Not Available
                                </div>
                                <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: 400 }}>
                                    {error} Download the file to play it in your preferred media player.
                                </div>
                                <button
                                    onClick={onDownload}
                                    style={{
                                        padding: '0.875rem 2rem',
                                        background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                    }}
                                >
                                    <Download style={{ width: 20, height: 20 }} />
                                    Download {isAudioFile ? 'Audio' : 'Video'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '1rem 1.5rem',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        background: 'linear-gradient(to right, #16213e, #1a1a2e)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            {isAudioFile ? '🎵 Audio file' : '🎬 Video file'}
                        </div>
                        <button
                            onClick={onDownload}
                            style={{
                                padding: '0.625rem 1.25rem',
                                background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.625rem',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                            }}
                        >
                            <Download style={{ width: 18, height: 18 }} />
                            Save to Device
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default MediaPreviewModal;
