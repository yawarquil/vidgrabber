import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Download,
    Github,
    Zap,
    Shield,
    Globe,
    ArrowRight,
    Sparkles
} from 'lucide-react';

// Components
import URLInput from './components/URLInput';
import VideoPreview from './components/VideoPreview';
import FormatSelector from './components/FormatSelector';
import ProgressBar from './components/ProgressBar';
import DownloadQueue from './components/DownloadQueue';
import SiteShowcase from './components/SiteShowcase';
import ExtractionProgress from './components/ExtractionProgress';

// API
import { videoApi, createProgressSocket } from './api/client';

function App() {
    // State
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractionStartTime, setExtractionStartTime] = useState(null);
    const [videoInfo, setVideoInfo] = useState(null);
    const [selectedFormat, setSelectedFormat] = useState('best');
    const [audioOnly, setAudioOnly] = useState(false);
    const [embedSubs, setEmbedSubs] = useState(false);
    const [downloadTasks, setDownloadTasks] = useState([]);
    const [sites, setSites] = useState([]);
    const [siteCount, setSiteCount] = useState(0);

    // Fetch supported sites on mount
    useEffect(() => {
        const fetchSites = async () => {
            try {
                const [sitesData, countData] = await Promise.all([
                    videoApi.getSites(),
                    videoApi.getSiteCount(),
                ]);
                setSites(sitesData);
                setSiteCount(countData.count);
            } catch (error) {
                console.error('Failed to fetch sites:', error);
            }
        };
        fetchSites();
    }, []);

    // Handle URL extraction
    const handleExtract = useCallback(async (url) => {
        setIsExtracting(true);
        setExtractionStartTime(Date.now());
        setVideoInfo(null);

        try {
            const info = await videoApi.extract(url);
            setVideoInfo(info);
            setSelectedFormat('best');
            setAudioOnly(false);
            toast.success('Video info extracted!');
        } catch (error) {
            toast.error(error.message || 'Failed to extract video info');
        } finally {
            setIsExtracting(false);
            setExtractionStartTime(null);
        }
    }, []);

    // Handle download
    const handleDownload = useCallback(async () => {
        if (!videoInfo) return;

        try {
            const task = await videoApi.download(videoInfo.url, {
                formatId: audioOnly ? 'bestaudio' : selectedFormat,
                audioOnly,
                embedSubs,
            });

            // Add task to queue
            setDownloadTasks(prev => [...prev, {
                ...task,
                videoInfo,
                audioOnly,
            }]);

            toast.success('Download started!');

            // Poll for status updates - faster polling for real-time feel
            const pollStatus = async () => {
                try {
                    const status = await videoApi.getStatus(task.task_id);

                    setDownloadTasks(prev => prev.map(t =>
                        t.task_id === task.task_id
                            ? { ...t, ...status }
                            : t
                    ));

                    if (!['completed', 'failed', 'cancelled'].includes(status.status)) {
                        setTimeout(pollStatus, 500); // Poll every 500ms for smooth progress
                    } else if (status.status === 'completed') {
                        toast.success('Download complete!');
                    } else if (status.status === 'failed') {
                        toast.error(status.error || 'Download failed');
                    }
                } catch (error) {
                    console.error('Status poll error:', error);
                    // Retry on error after a short delay
                    setTimeout(pollStatus, 1000);
                }
            };

            // Start polling immediately
            pollStatus();

        } catch (error) {
            toast.error(error.message || 'Failed to start download');
        }
    }, [videoInfo, selectedFormat, audioOnly, embedSubs]);

    // Handle file download
    const handleDownloadFile = useCallback((taskId, filename) => {
        const url = videoApi.getDownloadUrl(taskId);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'video';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, []);

    // Remove task from queue
    const handleRemoveTask = useCallback((taskId) => {
        setDownloadTasks(prev => prev.filter(t => t.task_id !== taskId));
    }, []);

    // Reset to initial state
    const handleReset = useCallback(() => {
        setVideoInfo(null);
        setSelectedFormat('best');
        setAudioOnly(false);
        setEmbedSubs(false);
    }, []);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b border-white/5">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-electric-500 to-neon-purple-500 rounded-xl">
                                <Download className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold gradient-text">VidGrabber</h1>
                                <p className="text-xs text-gray-500">Universal Video Downloader</p>
                            </div>
                        </div>

                        <nav className="flex items-center gap-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-500 hover:text-white transition-colors"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                        Download Videos from{' '}
                        <span className="gradient-text">Anywhere</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                        Fast, free, and privacy-focused. Grab videos from YouTube, Twitter,
                        TikTok, Instagram, and 1825+ other sites in seconds.
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap justify-center gap-6 mb-12">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Zap className="w-5 h-5 text-electric-400" />
                            <span>Lightning Fast</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <Shield className="w-5 h-5 text-emerald-400" />
                            <span>No Sign-up Required</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <Globe className="w-5 h-5 text-neon-purple-400" />
                            <span>{siteCount ? `${siteCount}+` : '1000+'} Sites Supported</span>
                        </div>
                    </div>
                </motion.div>

                {/* URL Input */}
                <URLInput
                    onSubmit={handleExtract}
                    isLoading={isExtracting}
                    disabled={false}
                />
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-4 pb-16">
                {/* Extraction Progress - shown while extracting */}
                <AnimatePresence>
                    {isExtracting && (
                        <ExtractionProgress
                            isExtracting={isExtracting}
                            startTime={extractionStartTime}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {videoInfo && !isExtracting && (
                        <motion.div
                            key="video-content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6 mb-12 mt-8 relative z-[200]"
                        >
                            {/* Video Preview */}
                            <VideoPreview
                                videoInfo={videoInfo}
                                isLoading={false}
                            />

                            {/* Format Selector & Download Button */}
                            {videoInfo && (
                                <>
                                    <FormatSelector
                                        formats={videoInfo.formats}
                                        recommendedFormats={videoInfo.recommended_formats}
                                        selectedFormat={selectedFormat}
                                        onSelectFormat={setSelectedFormat}
                                        audioOnly={audioOnly}
                                        onAudioOnlyChange={setAudioOnly}
                                        embedSubs={embedSubs}
                                        onEmbedSubsChange={setEmbedSubs}
                                        hasSubtitles={videoInfo.has_subtitles}
                                    />

                                    {/* Download Button */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex flex-col sm:flex-row gap-4"
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleDownload}
                                            className="flex-1 btn-primary text-lg py-4 flex items-center justify-center gap-3"
                                        >
                                            <Download className="w-6 h-6" />
                                            <span>Download {audioOnly ? 'Audio' : 'Video'}</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </motion.button>

                                        <button
                                            onClick={handleReset}
                                            className="btn-secondary"
                                        >
                                            New Download
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Download Queue - lower z-index so dropdown appears above */}
                {downloadTasks.length > 0 && (
                    <div className="mb-12 relative z-0">
                        <DownloadQueue
                            tasks={downloadTasks}
                            onDownloadFile={handleDownloadFile}
                            onRemoveTask={handleRemoveTask}
                        />
                    </div>
                )}

                {/* Site Showcase - only show when no video is being processed */}
                {!videoInfo && !isExtracting && (
                    <div className="max-w-3xl mx-auto">
                        <SiteShowcase sites={sites} siteCount={siteCount} />
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-500 text-sm mb-2">
                        VidGrabber - Universal Video Downloader
                    </p>
                    <p className="text-gray-600 text-xs">
                        For personal use only. Please respect copyright and terms of service of video platforms.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default App;
