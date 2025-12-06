import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Clock,
    User,
    Eye,
    Calendar,
    Globe,
    ExternalLink,
    Play,
    Film,
    Image as ImageIcon,
    AlertCircle
} from 'lucide-react';

const VideoPreview = ({ videoInfo, isLoading }) => {
    const [thumbnailError, setThumbnailError] = useState(false);
    const [thumbnailLoaded, setThumbnailLoaded] = useState(false);

    // Reset thumbnail state when videoInfo changes
    useEffect(() => {
        setThumbnailError(false);
        setThumbnailLoaded(false);
    }, [videoInfo?.thumbnail]);

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 shimmer"
            >
                <div className="flex gap-6">
                    {/* Thumbnail skeleton */}
                    <div className="w-80 h-44 bg-surface-light rounded-xl animate-pulse" />

                    {/* Info skeleton */}
                    <div className="flex-1 space-y-4">
                        <div className="h-8 bg-surface-light rounded-lg w-3/4 animate-pulse" />
                        <div className="h-4 bg-surface-light rounded w-1/2 animate-pulse" />
                        <div className="flex gap-4">
                            <div className="h-4 bg-surface-light rounded w-20 animate-pulse" />
                            <div className="h-4 bg-surface-light rounded w-24 animate-pulse" />
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (!videoInfo) return null;

    const {
        title,
        thumbnail,
        duration_str,
        uploader,
        view_count_str,
        extractor,
        url,
        is_live,
        has_subtitles,
    } = videoInfo;

    // Get webpage URL - use the original url if webpage_url is not available
    const webpage_url = videoInfo.webpage_url || url;

    // Get thumbnail URL - use proxy for external images to bypass CORS
    const getThumbnailUrl = () => {
        if (!thumbnail) return null;
        // Use proxy for Instagram, TikTok, and other platforms that block direct access
        const platform = extractor?.toLowerCase() || '';
        if (platform.includes('instagram') || platform.includes('tiktok') || platform.includes('facebook')) {
            return `/api/thumbnail?url=${encodeURIComponent(thumbnail)}`;
        }
        return thumbnail;
    };

    const thumbnailUrl = getThumbnailUrl();

    // Handle thumbnail load error
    const handleThumbnailError = () => {
        setThumbnailError(true);
        setThumbnailLoaded(false);
    };

    // Handle thumbnail load success
    const handleThumbnailLoad = () => {
        setThumbnailLoaded(true);
        setThumbnailError(false);
    };

    // Generate fallback display based on platform
    const getFallbackContent = () => {
        const platform = extractor?.toLowerCase() || '';
        let bgColor = 'from-gray-700 to-gray-800';
        let Icon = Film;

        if (platform.includes('instagram')) {
            bgColor = 'from-pink-600 via-purple-600 to-orange-500';
            Icon = () => (
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                    <circle cx="12" cy="12" r="3.5" />
                </svg>
            );
        } else if (platform.includes('tiktok')) {
            bgColor = 'from-black to-gray-900';
            Icon = () => (
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
            );
        } else if (platform.includes('youtube')) {
            bgColor = 'from-red-600 to-red-700';
            Icon = () => (
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.5 6.507a3.04 3.04 0 0 0-2.14-2.153C19.456 4 12 4 12 4s-7.455 0-9.36.354A3.04 3.04 0 0 0 .5 6.507C.146 8.42.146 12 .146 12s0 3.58.354 5.493a3.04 3.04 0 0 0 2.14 2.153C4.545 20 12 20 12 20s7.455 0 9.36-.354a3.04 3.04 0 0 0 2.14-2.153c.354-1.913.354-5.493.354-5.493s0-3.58-.354-5.493zM9.75 15.023V8.977L15.5 12l-5.75 3.023z" />
                </svg>
            );
        } else if (platform.includes('twitter') || platform.includes('x')) {
            bgColor = 'from-blue-500 to-blue-600';
        }

        return (
            <div className={`w-full h-full bg-gradient-to-br ${bgColor} flex flex-col items-center justify-center`}>
                <Icon />
                <span className="text-white/80 text-sm mt-2 font-medium">
                    {extractor || 'Video'}
                </span>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6"
        >
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Thumbnail */}
                <div className="relative group">
                    <div className="relative w-full lg:w-80 aspect-video rounded-xl overflow-hidden bg-surface-light">
                        {/* Show loading state while thumbnail loads */}
                        {thumbnailUrl && !thumbnailLoaded && !thumbnailError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-surface-light">
                                <div className="animate-pulse flex flex-col items-center">
                                    <ImageIcon className="w-10 h-10 text-gray-600 animate-pulse" />
                                    <span className="text-xs text-gray-500 mt-2">Loading preview...</span>
                                </div>
                            </div>
                        )}

                        {/* Thumbnail image */}
                        {thumbnailUrl && !thumbnailError ? (
                            <img
                                src={thumbnailUrl}
                                alt={title}
                                className={`w-full h-full object-cover transition-opacity duration-300 ${thumbnailLoaded ? 'opacity-100' : 'opacity-0'
                                    }`}
                                onError={handleThumbnailError}
                                onLoad={handleThumbnailLoad}
                            />
                        ) : (
                            // Fallback when no thumbnail or failed to load
                            getFallbackContent()
                        )}

                        {/* Duration badge */}
                        {duration_str && duration_str !== 'Unknown' && (
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 
                              rounded-md text-xs font-medium text-white">
                                {duration_str}
                            </div>
                        )}

                        {/* Live badge */}
                        {is_live && (
                            <div className="absolute top-2 left-2 badge badge-error">
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5 animate-pulse" />
                                LIVE
                            </div>
                        )}

                        {/* Play overlay */}
                        {webpage_url && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                                transition-opacity duration-300 flex items-center justify-center">
                                <a
                                    href={webpage_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 bg-white/20 backdrop-blur-sm rounded-full 
                           hover:bg-white/30 transition-colors"
                                >
                                    <Play className="w-8 h-8 text-white fill-current" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Video info */}
                <div className="flex-1 flex flex-col">
                    {/* Title */}
                    <h2 className="text-xl font-bold text-white leading-tight mb-3 line-clamp-2">
                        {title}
                    </h2>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                        {uploader && (
                            <div className="flex items-center gap-1.5">
                                <User className="w-4 h-4" />
                                <span>{uploader}</span>
                            </div>
                        )}

                        {view_count_str && view_count_str !== 'Unknown' && (
                            <div className="flex items-center gap-1.5">
                                <Eye className="w-4 h-4" />
                                <span>{view_count_str}</span>
                            </div>
                        )}

                        {duration_str && duration_str !== 'Unknown' && (
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>{duration_str}</span>
                            </div>
                        )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {extractor && (
                            <span className="badge badge-info">
                                <Globe className="w-3 h-3 mr-1" />
                                {extractor}
                            </span>
                        )}

                        {has_subtitles && (
                            <span className="badge badge-success">
                                CC
                            </span>
                        )}

                        {thumbnailError && (
                            <span className="badge bg-amber-500/20 text-amber-400 border-amber-500/30">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Preview unavailable
                            </span>
                        )}
                    </div>

                    {/* Source link */}
                    {webpage_url && (
                        <a
                            href={webpage_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-electric-400 
                         hover:text-electric-300 transition-colors mt-auto"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Open in new tab</span>
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default VideoPreview;

