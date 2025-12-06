import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2,
    Search,
    Film,
    Music,
    Sparkles,
    Clock
} from 'lucide-react';

const ExtractionProgress = ({ isExtracting, startTime }) => {
    const [elapsed, setElapsed] = useState(0);
    const [step, setStep] = useState(0);

    const steps = [
        { label: 'Connecting to server...', icon: Search, duration: 2 },
        { label: 'Fetching video info...', icon: Film, duration: 8 },
        { label: 'Loading available formats...', icon: Music, duration: 15 },
        { label: 'Preparing preview...', icon: Sparkles, duration: 20 },
    ];

    useEffect(() => {
        if (!isExtracting) {
            setElapsed(0);
            setStep(0);
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            setElapsed(elapsedSeconds);

            // Update step based on elapsed time
            let currentStep = 0;
            for (let i = 0; i < steps.length; i++) {
                if (elapsedSeconds >= steps[i].duration) {
                    currentStep = i;
                }
            }
            setStep(currentStep);
        }, 100);

        return () => clearInterval(interval);
    }, [isExtracting, startTime]);

    if (!isExtracting) return null;

    const currentStep = steps[Math.min(step, steps.length - 1)];
    const Icon = currentStep.icon;

    // Estimate remaining time (average extraction takes ~20-30 seconds)
    const estimatedTotal = 25;
    const progress = Math.min((elapsed / estimatedTotal) * 100, 95);
    const remaining = Math.max(estimatedTotal - elapsed, 5);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6 mt-8"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="p-2 bg-electric-500/20 rounded-lg"
                    >
                        <Loader2 className="w-5 h-5 text-electric-400" />
                    </motion.div>
                    <div>
                        <h3 className="font-semibold text-white">Extracting Video Info</h3>
                        <p className="text-sm text-gray-400">This may take 15-30 seconds...</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{elapsed}s elapsed</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 bg-surface-light rounded-full overflow-hidden mb-4">
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-electric-500 to-neon-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
                {/* Shimmer effect */}
                <motion.div
                    className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: [-80, 400] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {/* Steps indicator */}
            <div className="flex items-center justify-between">
                {steps.map((s, i) => {
                    const StepIcon = s.icon;
                    const isActive = i === step;
                    const isComplete = i < step;

                    return (
                        <div key={i} className="flex items-center gap-2">
                            <motion.div
                                className={`
                  p-1.5 rounded-lg transition-colors
                  ${isActive ? 'bg-electric-500/20 text-electric-400' :
                                        isComplete ? 'bg-emerald-500/20 text-emerald-400' :
                                            'bg-surface-light text-gray-600'}
                `}
                                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                                transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                            >
                                <StepIcon className="w-4 h-4" />
                            </motion.div>
                            {i < steps.length - 1 && (
                                <div className={`w-8 h-0.5 rounded ${isComplete ? 'bg-emerald-500/50' : 'bg-surface-light'}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Current step label */}
            <motion.p
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm text-gray-400 mt-4"
            >
                <Icon className="w-4 h-4 inline mr-2" />
                {currentStep.label}
                {remaining > 0 && elapsed > 5 && (
                    <span className="text-gray-500 ml-2">
                        (~{remaining}s remaining)
                    </span>
                )}
            </motion.p>
        </motion.div>
    );
};

export default ExtractionProgress;
