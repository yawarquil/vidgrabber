import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Film,
    Music,
    ChevronDown,
    Check,
    HardDrive,
    Sparkles,
    FileText,
    Crown,
    Zap
} from 'lucide-react';

const FormatSelector = ({
    formats = [],
    recommendedFormats = [],
    selectedFormat,
    onSelectFormat,
    audioOnly,
    onAudioOnlyChange,
    embedSubs,
    onEmbedSubsChange,
    hasSubtitles
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Group formats by type
    const groupedFormats = useMemo(() => {
        const videoFormats = formats.filter(f => !f.is_audio_only && !f.is_video_only);
        const videoOnlyFormats = formats.filter(f => f.is_video_only);
        const audioFormats = formats.filter(f => f.is_audio_only);
        return {
            video: videoFormats,
            videoOnly: videoOnlyFormats,
            audio: audioFormats
        };
    }, [formats]);

    // Get selected format details
    const selectedFormatDetails = useMemo(() => {
        if (!selectedFormat) {
            // Return first recommended or 'best'
            if (recommendedFormats.length > 0) {
                return recommendedFormats[0];
            }
            return { id: 'best', label: 'Best Quality', description: 'Auto-select best available' };
        }

        const fromRecommended = recommendedFormats.find(f => f.id === selectedFormat);
        if (fromRecommended) return fromRecommended;

        const fromAll = formats.find(f => f.format_id === selectedFormat);
        if (fromAll) {
            return {
                id: fromAll.format_id,
                label: fromAll.quality_label,
                description: `${fromAll.resolution || 'Audio'} • ${fromAll.ext?.toUpperCase()} • ${fromAll.size_str}`,
                type: fromAll.is_audio_only ? 'audio' : 'video'
            };
        }

        return { id: selectedFormat, label: selectedFormat, description: '' };
    }, [selectedFormat, formats, recommendedFormats]);

    // Get quality badge based on height
    const getQualityBadge = (format) => {
        if (format.badge) return format.badge;
        const label = format.quality_label || format.label || '';
        if (label.includes('4K') || label.includes('2160')) return '4K';
        if (label.includes('2K') || label.includes('1440')) return '2K';
        if (label.includes('1080')) return 'HD';
        if (label.includes('720')) return 'HD';
        return null;
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return null;
        if (bytes >= 1024 * 1024 * 1024) {
            return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
        }
        if (bytes >= 1024 * 1024) {
            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        }
        return `${(bytes / 1024).toFixed(1)} KB`;
    };

    // Get icon for format type
    const getFormatIcon = () => {
        if (selectedFormatDetails.type === 'audio' || audioOnly) {
            return <Music className="w-5 h-5 text-neon-purple-400" />;
        }
        return <Film className="w-5 h-5 text-electric-400" />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
        >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-electric-400" />
                Download Options
            </h3>

            {/* Options row */}
            <div className="flex flex-wrap gap-3 mb-6">
                {/* Embed Subtitles Toggle */}
                <button
                    onClick={() => onEmbedSubsChange(!embedSubs)}
                    disabled={!hasSubtitles}
                    className={`
              flex items-center gap-2 px-4 py-2 rounded-xl border transition-all
              ${embedSubs
                            ? 'bg-electric-500/20 border-electric-500/50 text-electric-400'
                            : hasSubtitles
                                ? 'bg-surface-light/50 border-white/10 text-gray-400 hover:border-white/20'
                                : 'bg-surface-light/30 border-white/5 text-gray-600 cursor-not-allowed'}
            `}
                >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">
                        Embed Subtitles
                        {!hasSubtitles && <span className="text-xs ml-1">(N/A)</span>}
                    </span>
                    {embedSubs && <Check className="w-4 h-4" />}
                </button>
            </div>

            {/* Format selector dropdown */}
            <div className="relative z-[100]">
                <label className="block text-sm text-gray-400 mb-2">Select Format</label>

                {/* Selected format display */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between p-4 bg-surface-light/50 
                       rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${selectedFormatDetails.type === 'audio' ? 'bg-neon-purple-500/20' : 'bg-electric-500/20'}`}>
                            {getFormatIcon()}
                        </div>
                        <div className="text-left">
                            <div className="font-medium text-white flex items-center gap-2">
                                {selectedFormatDetails.label}
                                {getQualityBadge(selectedFormatDetails) && (
                                    <span className="px-1.5 py-0.5 bg-electric-500/20 text-electric-400 text-xs rounded font-bold">
                                        {getQualityBadge(selectedFormatDetails)}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-500">{selectedFormatDetails.description}</div>
                        </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-50 w-full mt-2 bg-surface border border-white/10 
                         rounded-xl shadow-2xl overflow-hidden max-h-[500px] overflow-y-auto"
                    >
                        {/* Recommended formats */}
                        {recommendedFormats.length > 0 && (
                            <div className="p-2 border-b border-white/10">
                                <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                                    <Crown className="w-3 h-3 text-amber-400" />
                                    Recommended
                                </div>
                                {recommendedFormats.map((format, idx) => (
                                    <button
                                        key={`rec-${format.id}-${idx}`}
                                        onClick={() => {
                                            onSelectFormat(format.id);
                                            onAudioOnlyChange(format.type === 'audio');
                                            setIsExpanded(false);
                                        }}
                                        className={`
                        w-full flex items-center gap-3 p-3 rounded-lg transition-colors
                        ${selectedFormat === format.id
                                                ? 'bg-electric-500/20 text-electric-400'
                                                : 'hover:bg-surface-light/50 text-white'}
                      `}
                                    >
                                        {format.type === 'audio' ? (
                                            <Music className="w-4 h-4 text-neon-purple-400" />
                                        ) : (
                                            <Film className="w-4 h-4" />
                                        )}
                                        <div className="flex-1 text-left">
                                            <div className="font-medium flex items-center gap-2">
                                                {format.label}
                                                {getQualityBadge(format) && (
                                                    <span className="px-1.5 py-0.5 bg-electric-500/20 text-electric-400 text-xs rounded font-bold">
                                                        {getQualityBadge(format)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                                {format.description}
                                                {format.filesize && (
                                                    <span className="text-electric-400">
                                                        {formatFileSize(format.filesize)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {selectedFormat === format.id && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* All video+audio formats */}
                        {groupedFormats.video.length > 0 && (
                            <div className="p-2 border-b border-white/10">
                                <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-emerald-400" />
                                    Video + Audio ({groupedFormats.video.length})
                                </div>
                                {groupedFormats.video.map((format, idx) => (
                                    <button
                                        key={`video-${format.format_id}-${idx}`}
                                        onClick={() => {
                                            onSelectFormat(format.format_id);
                                            onAudioOnlyChange(false);
                                            setIsExpanded(false);
                                        }}
                                        className={`
                        w-full flex items-center gap-3 p-3 rounded-lg transition-colors
                        ${selectedFormat === format.format_id
                                                ? 'bg-electric-500/20 text-electric-400'
                                                : 'hover:bg-surface-light/50 text-white'}
                      `}
                                    >
                                        <Film className="w-4 h-4" />
                                        <div className="flex-1 text-left">
                                            <div className="font-medium">{format.quality_label}</div>
                                            <div className="text-xs text-gray-500">
                                                {format.resolution && `${format.resolution} • `}
                                                {format.ext?.toUpperCase()} • {format.size_str}
                                            </div>
                                        </div>
                                        {selectedFormat === format.format_id && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Video-only formats */}
                        {groupedFormats.videoOnly.length > 0 && (
                            <div className="p-2 border-b border-white/10">
                                <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                                    <Film className="w-3 h-3 text-blue-400" />
                                    Video Only ({groupedFormats.videoOnly.length})
                                </div>
                                {groupedFormats.videoOnly.map((format, idx) => (
                                    <button
                                        key={`vidonly-${format.format_id}-${idx}`}
                                        onClick={() => {
                                            onSelectFormat(format.format_id);
                                            onAudioOnlyChange(false);
                                            setIsExpanded(false);
                                        }}
                                        className={`
                        w-full flex items-center gap-3 p-3 rounded-lg transition-colors
                        ${selectedFormat === format.format_id
                                                ? 'bg-electric-500/20 text-electric-400'
                                                : 'hover:bg-surface-light/50 text-white'}
                      `}
                                    >
                                        <Film className="w-4 h-4 text-blue-400" />
                                        <div className="flex-1 text-left">
                                            <div className="font-medium">{format.quality_label}</div>
                                            <div className="text-xs text-gray-500">
                                                {format.resolution && `${format.resolution} • `}
                                                {format.ext?.toUpperCase()} • {format.size_str}
                                                <span className="text-amber-400 ml-1">• No audio</span>
                                            </div>
                                        </div>
                                        {selectedFormat === format.format_id && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Audio-only formats */}
                        {groupedFormats.audio.length > 0 && (
                            <div className="p-2">
                                <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                                    <Music className="w-3 h-3 text-neon-purple-400" />
                                    Audio Only ({groupedFormats.audio.length})
                                </div>
                                {groupedFormats.audio.map((format, idx) => (
                                    <button
                                        key={`audio-${format.format_id}-${idx}`}
                                        onClick={() => {
                                            onSelectFormat(format.format_id);
                                            onAudioOnlyChange(true);
                                            setIsExpanded(false);
                                        }}
                                        className={`
                        w-full flex items-center gap-3 p-3 rounded-lg transition-colors
                        ${selectedFormat === format.format_id
                                                ? 'bg-neon-purple-500/20 text-neon-purple-400'
                                                : 'hover:bg-surface-light/50 text-white'}
                      `}
                                    >
                                        <Music className="w-4 h-4 text-neon-purple-400" />
                                        <div className="flex-1 text-left">
                                            <div className="font-medium">{format.quality_label}</div>
                                            <div className="text-xs text-gray-500">
                                                {format.ext?.toUpperCase()} • {format.size_str}
                                            </div>
                                        </div>
                                        {selectedFormat === format.format_id && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default FormatSelector;
