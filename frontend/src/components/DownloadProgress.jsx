import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download,
    Zap,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    HardDrive,
    Wifi,
    Play,
    Eye
} from 'lucide-react';
import VideoPreviewModal from './VideoPreviewModal';

const DownloadProgress = ({
    task,
    onDownloadFile,
    onCancel,
    getVideoUrl
}) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    if (!task) return null;

    const {
        task_id,
        status,
        progress = 0,
        speed,
        eta,
        filename,
        error,
        videoInfo,
        audioOnly
    } = task;

    const isActive = ['pending', 'extracting', 'downloading', 'processing'].includes(status);
    const isComplete = status === 'completed';
    const isFailed = status === 'failed';

    const getStatusInfo = () => {
        switch (status) {
            case 'pending':
                return { label: 'Starting download...', color: 'text-amber-400', icon: Loader2, animate: true };
            case 'extracting':
                return { label: 'Preparing...', color: 'text-amber-400', icon: Loader2, animate: true };
            case 'downloading':
                return { label: 'Downloading...', color: 'text-electric-400', icon: Download, animate: false };
            case 'processing':
                return { label: 'Processing...', color: 'text-neon-purple-400', icon: Loader2, animate: true };
            case 'completed':
                return { label: 'Complete!', color: 'text-emerald-400', icon: CheckCircle2, animate: false };
            case 'failed':
                return { label: 'Failed', color: 'text-rose-400', icon: XCircle, animate: false };
            default:
                return { label: 'Pending...', color: 'text-gray-400', icon: Clock, animate: false };
        }
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;

    // Format speed nicely
    const formatSpeed = (speedStr) => {
        if (!speedStr) return null;
        if (typeof speedStr === 'string') return speedStr;
        return `${(speedStr / 1024 / 1024).toFixed(1)} MB/s`;
    };

    // Format ETA
    const formatEta = (etaStr) => {
        if (!etaStr) return null;
        if (typeof etaStr === 'string') return etaStr;
        if (typeof etaStr === 'number') {
            const mins = Math.floor(etaStr / 60);
            const secs = etaStr % 60;
            if (mins > 0) return `${mins}m ${secs}s`;
            return `${secs}s`;
        }
        return etaStr;
    };

    // Get video URL for preview
    const videoUrl = getVideoUrl ? getVideoUrl(task_id) : `/api/download/${task_id}`;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="glass-card p-6 overflow-hidden"
            >
                {/* Header with video info */}
                <div className="flex items-start gap-4 mb-6">
                    {/* Thumbnail or icon */}
                    <div className="relative flex-shrink-0">
                        {videoInfo?.thumbnail ? (
                            <div className="w-20 h-14 rounded-lg overflow-hidden bg-surface-light">
                                <img
                                    src={videoInfo.thumbnail}
                                    alt={videoInfo.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-20 h-14 rounded-lg bg-surface-light flex items-center justify-center">
                                <Download className="w-6 h-6 text-gray-500" />
                            </div>
                        )}
                        {/* Status badge overlay */}
                        {isActive && (
                            <div className="absolute -bottom-2 -right-2 p-1.5 bg-surface rounded-full border-2 border-deep-space">
                                <StatusIcon className={`w-3 h-3 ${statusInfo.color} ${statusInfo.animate ? 'animate-spin' : ''}`} />
                            </div>
                        )}
                    </div>

                    {/* Video info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate text-lg">
                            {videoInfo?.title || filename || 'Downloading...'}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <span>{audioOnly ? 'Audio (MP3)' : 'Video'}</span>
                            {videoInfo?.uploader && (
                                <>
                                    <span>•</span>
                                    <span>{videoInfo.uploader}</span>
                                </>
                            )}
                        </p>
                    </div>

                    {/* Cancel button */}
                    {isActive && onCancel && (
                        <button
                            onClick={() => onCancel(task_id)}
                            className="text-gray-500 hover:text-rose-400 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                {/* Progress section */}
                {isActive && (
                    <div className="space-y-4">
                        {/* Progress bar */}
                        <div className="relative">
                            <div className="h-3 bg-surface-light rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-electric-500 via-electric-400 to-neon-purple-500 rounded-full relative"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(progress, 100)}%` }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                >
                                    {/* Shimmer effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                        animate={{ x: ['-100%', '200%'] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                    />
                                </motion.div>
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                                {/* Status */}
                                <span className={`flex items-center gap-1.5 ${statusInfo.color}`}>
                                    <StatusIcon className={`w-4 h-4 ${statusInfo.animate ? 'animate-spin' : ''}`} />
                                    {statusInfo.label}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-gray-400">
                                {/* Speed */}
                                {speed && (
                                    <span className="flex items-center gap-1">
                                        <Wifi className="w-4 h-4" />
                                        {formatSpeed(speed)}
                                    </span>
                                )}

                                {/* ETA */}
                                {eta && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {formatEta(eta)}
                                    </span>
                                )}

                                {/* Progress percentage */}
                                <span className="font-mono text-electric-400 font-medium">
                                    {progress.toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        {/* Filename */}
                        {filename && (
                            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                <HardDrive className="w-3 h-3" />
                                {filename}
                            </p>
                        )}
                    </div>
                )}

                {/* Complete state */}
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {/* Success message */}
                        <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium">Download complete!</span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3">
                            {/* Preview button - for all formats including audio */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowPreview(true)}
                                className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3"
                            >
                                <Eye className="w-5 h-5" />
                                <span>{audioOnly ? 'Listen' : 'Preview'}</span>
                            </motion.button>

                            {/* Download button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onDownloadFile?.(task_id, filename)}
                                className="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
                            >
                                <Download className="w-5 h-5" />
                                <span>Save to Device</span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Failed state */}
                {isFailed && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl"
                    >
                        <div className="flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-rose-400">Download failed</p>
                                <p className="text-sm text-rose-400/80 mt-1">
                                    {error || 'An error occurred while downloading. Please try again.'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Video Preview Modal */}
            <VideoPreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                videoUrl={videoUrl}
                filename={filename}
                onDownload={() => {
                    onDownloadFile?.(task_id, filename);
                    setShowPreview(false);
                }}
            />
        </>
    );
};

export default DownloadProgress;

