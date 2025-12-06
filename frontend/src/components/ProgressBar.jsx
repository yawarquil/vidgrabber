import { motion } from 'framer-motion';
import {
    Zap,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';

const ProgressBar = ({
    progress = 0,
    status = 'pending',
    speed,
    eta,
    error,
    filename
}) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'extracting':
                return {
                    icon: Loader2,
                    label: 'Extracting info...',
                    color: 'text-amber-400',
                    bgColor: 'bg-amber-500',
                    animate: true,
                };
            case 'downloading':
                return {
                    icon: Zap,
                    label: 'Downloading...',
                    color: 'text-electric-400',
                    bgColor: 'bg-gradient-to-r from-electric-500 to-neon-purple-500',
                    animate: false,
                };
            case 'processing':
                return {
                    icon: Loader2,
                    label: 'Processing...',
                    color: 'text-neon-purple-400',
                    bgColor: 'bg-neon-purple-500',
                    animate: true,
                };
            case 'completed':
                return {
                    icon: CheckCircle2,
                    label: 'Complete!',
                    color: 'text-emerald-400',
                    bgColor: 'bg-emerald-500',
                    animate: false,
                };
            case 'failed':
                return {
                    icon: XCircle,
                    label: 'Failed',
                    color: 'text-rose-400',
                    bgColor: 'bg-rose-500',
                    animate: false,
                };
            case 'cancelled':
                return {
                    icon: AlertCircle,
                    label: 'Cancelled',
                    color: 'text-gray-400',
                    bgColor: 'bg-gray-500',
                    animate: false,
                };
            default:
                return {
                    icon: Clock,
                    label: 'Pending...',
                    color: 'text-gray-400',
                    bgColor: 'bg-gray-500',
                    animate: false,
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;
    const isActive = ['extracting', 'downloading', 'processing'].includes(status);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
        >
            {/* Status header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
                    <span className={`font-medium ${config.color}`}>{config.label}</span>
                </div>

                {isActive && (
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        {speed && (
                            <span className="flex items-center gap-1">
                                <Zap className="w-4 h-4" />
                                {speed}
                            </span>
                        )}
                        {eta && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                ETA: {eta}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Progress bar */}
            <div className="progress-bar">
                <motion.div
                    className={`progress-bar-fill ${config.bgColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                />
            </div>

            {/* Progress percentage and filename */}
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                    {filename ? (
                        <span className="truncate max-w-[300px] inline-block">{filename}</span>
                    ) : (
                        'Preparing download...'
                    )}
                </span>
                <span className={config.color}>{progress.toFixed(1)}%</span>
            </div>

            {/* Error message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg"
                >
                    <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-400">{error}</p>
                </motion.div>
            )}

            {/* Success celebration */}
            {status === 'completed' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
                >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <p className="text-sm text-emerald-400">Download ready! Click the button below to save.</p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ProgressBar;
