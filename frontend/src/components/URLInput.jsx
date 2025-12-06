import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Link2,
    Upload,
    Loader2,
    AlertCircle,
    Sparkles
} from 'lucide-react';

const URLInput = ({ onSubmit, isLoading, disabled }) => {
    const [url, setUrl] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');

    // Simple URL validation
    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!url.trim()) {
            setError('Please enter a video URL');
            return;
        }

        const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

        if (!isValidUrl(normalizedUrl)) {
            setError('Please enter a valid URL');
            return;
        }

        onSubmit(normalizedUrl);
    };

    const handlePaste = useCallback(async (e) => {
        // Auto-submit on paste if it's a valid URL
        const pastedText = e.clipboardData?.getData('text') || '';
        if (pastedText && isValidUrl(pastedText.startsWith('http') ? pastedText : `https://${pastedText}`)) {
            // Let the paste happen naturally, then auto-submit after a brief delay
            setTimeout(() => {
                const normalizedUrl = pastedText.startsWith('http') ? pastedText : `https://${pastedText}`;
                onSubmit(normalizedUrl);
            }, 100);
        }
    }, [onSubmit]);

    // Drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const text = e.dataTransfer.getData('text/plain');
        if (text) {
            setUrl(text);
            const normalizedUrl = text.startsWith('http') ? text : `https://${text}`;
            if (isValidUrl(normalizedUrl)) {
                onSubmit(normalizedUrl);
            }
        }
    };

    const showGlow = isFocused || (url && isValidUrl(url.startsWith('http') ? url : `https://${url}`));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl mx-auto"
        >
            <form onSubmit={handleSubmit}>
                <div
                    className={`
            relative glass-card p-2 transition-all duration-300
            ${isDragging ? 'border-electric-500 border-2' : ''}
            ${showGlow ? 'neon-glow' : ''}
          `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className={`
              flex items-center justify-center w-12 h-12 rounded-xl
              ${showGlow ? 'bg-electric-500/20' : 'bg-surface-light/50'}
              transition-colors duration-300
            `}>
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 text-electric-400 animate-spin" />
                            ) : (
                                <Link2 className={`w-5 h-5 ${showGlow ? 'text-electric-400' : 'text-gray-400'}`} />
                            )}
                        </div>

                        {/* Input field */}
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                setError('');
                            }}
                            onPaste={handlePaste}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Paste video URL from YouTube, Twitter, TikTok, Instagram..."
                            disabled={disabled || isLoading}
                            className="flex-1 bg-transparent border-none outline-none text-white 
                         placeholder-gray-500 text-lg py-3 px-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
                        />

                        {/* Submit button */}
                        <motion.button
                            type="submit"
                            disabled={disabled || isLoading || !url.trim()}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Fetching...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    <span>Extract</span>
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* Drag overlay */}
                    <AnimatePresence>
                        {isDragging && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-electric-500/10 rounded-2xl 
                           flex items-center justify-center border-2 border-dashed border-electric-500"
                            >
                                <div className="flex items-center gap-2 text-electric-400">
                                    <Upload className="w-6 h-6" />
                                    <span className="font-medium">Drop URL here</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Error message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 mt-3 text-rose-400 text-sm"
                        >
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            {/* Helper text */}
            <p className="text-center text-gray-500 text-sm mt-4">
                Works with <span className="text-electric-400 font-medium">1825+</span> sites including
                YouTube, Twitter/X, TikTok, Instagram, Vimeo, and more
            </p>
        </motion.div>
    );
};

export default URLInput;
