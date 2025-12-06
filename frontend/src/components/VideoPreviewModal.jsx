import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Download } from 'lucide-react';

const VideoPreviewModal = ({ isOpen, onClose, videoUrl, filename, onDownload }) => {
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setPlaying(false);
            setCurrentTime(0);
            setDuration(0);
            setLoading(true);
            setError(null);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKey = (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === ' ') {
                e.preventDefault();
                togglePlay();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, playing]);

    const togglePlay = () => {
        if (!videoRef.current || error) return;
        if (playing) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch(err => {
                console.error('Play failed:', err);
                setError('Could not play video');
            });
        }
        setPlaying(!playing);
    };

    const handleVideoError = () => {
        const video = videoRef.current;
        const err = video?.error;
        console.error('Video error:', err?.code, err?.message);
        setLoading(false);
        setError('Video format not supported by browser. Download to play in VLC or another media player.');
    };

    const handleLoadedData = () => {
        setLoading(false);
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (videoRef.current && duration > 0) {
            videoRef.current.currentTime = percent * duration;
        }
    };

    const formatTime = (seconds) => {
        if (!seconds || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFullscreen = () => {
        videoRef.current?.requestFullscreen?.();
    };

    if (!isOpen) return null;

    // Use createPortal to render modal at document.body level
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
                        maxWidth: '56rem',
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
                        padding: '1rem',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}>
                        <h3 style={{
                            fontWeight: 600,
                            color: 'white',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            paddingRight: '1rem',
                            maxWidth: '80%',
                        }}>
                            {filename || 'Video Preview'}
                        </h3>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '0.5rem',
                                color: '#9ca3af',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                            }}
                        >
                            <X style={{ width: 20, height: 20 }} />
                        </button>
                    </div>

                    {/* Video Container */}
                    <div style={{
                        position: 'relative',
                        backgroundColor: 'black',
                        aspectRatio: '16/9',
                    }}>
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={handleVideoError}
                            onLoadedData={handleLoadedData}
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={() => setPlaying(false)}
                            onPlay={() => setPlaying(true)}
                            onPause={() => setPlaying(false)}
                            muted={muted}
                            playsInline
                        />

                        {/* Loading Spinner */}
                        {loading && !error && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(0,0,0,0.6)',
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
                                backgroundColor: 'rgba(0,0,0,0.9)',
                                padding: '1.5rem',
                                textAlign: 'center',
                            }}>
                                <div style={{ color: '#f87171', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
                                    ⚠️ Preview Not Available
                                </div>
                                <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: 400 }}>
                                    {error}
                                </div>
                                <button
                                    onClick={onDownload}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#22d3ee',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Download style={{ width: 20, height: 20 }} />
                                    Download Video
                                </button>
                            </div>
                        )}

                        {/* Play Button Overlay */}
                        {!loading && !error && !playing && (
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                }}
                                onClick={togglePlay}
                            >
                                <div style={{
                                    width: 80,
                                    height: 80,
                                    backgroundColor: '#22d3ee',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Play style={{ width: 40, height: 40, color: 'white', fill: 'currentColor', marginLeft: 4 }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div style={{ padding: '1rem', backgroundColor: '#16213e' }}>
                        {/* Progress Bar */}
                        <div
                            style={{
                                height: 8,
                                backgroundColor: '#374151',
                                borderRadius: 4,
                                cursor: 'pointer',
                                marginBottom: '1rem',
                                overflow: 'hidden',
                            }}
                            onClick={handleSeek}
                        >
                            <div
                                style={{
                                    height: '100%',
                                    backgroundColor: '#22d3ee',
                                    width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                                    transition: 'width 0.1s',
                                }}
                            />
                        </div>

                        {/* Control Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button
                                    onClick={togglePlay}
                                    disabled={!!error}
                                    style={{
                                        padding: '0.5rem',
                                        color: 'white',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        cursor: error ? 'not-allowed' : 'pointer',
                                        opacity: error ? 0.5 : 1,
                                    }}
                                >
                                    {playing ? <Pause style={{ width: 24, height: 24 }} /> : <Play style={{ width: 24, height: 24 }} />}
                                </button>

                                <button
                                    onClick={() => setMuted(!muted)}
                                    style={{
                                        padding: '0.5rem',
                                        color: 'white',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {muted ? <VolumeX style={{ width: 20, height: 20 }} /> : <Volume2 style={{ width: 20, height: 20 }} />}
                                </button>

                                <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                    onClick={handleFullscreen}
                                    style={{
                                        padding: '0.5rem',
                                        color: 'white',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Maximize style={{ width: 20, height: 20 }} />
                                </button>

                                <button
                                    onClick={onDownload}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#22d3ee',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Download style={{ width: 20, height: 20 }} />
                                    Save to Device
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default VideoPreviewModal;
