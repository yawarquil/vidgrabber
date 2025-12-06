import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2 } from 'lucide-react';
import DownloadProgress from './DownloadProgress';
import { videoApi } from '../api/client';

const DownloadQueue = ({
    tasks = [],
    onDownloadFile,
    onRemoveTask,
    onCancelTask
}) => {
    if (tasks.length === 0) return null;

    // Separate active and completed tasks
    const activeTasks = tasks.filter(t =>
        ['pending', 'extracting', 'downloading', 'processing'].includes(t.status)
    );
    const completedTasks = tasks.filter(t =>
        ['completed', 'failed', 'cancelled'].includes(t.status)
    );

    // Get video stream URL for preview
    const getVideoUrl = (taskId) => videoApi.getStreamUrl(taskId);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Download className="w-5 h-5 text-electric-400" />
                    Downloads
                    {tasks.length > 0 && (
                        <span className="text-sm font-normal text-gray-500">
                            ({activeTasks.length} active, {completedTasks.length} completed)
                        </span>
                    )}
                </h3>

                {completedTasks.length > 0 && (
                    <button
                        onClick={() => completedTasks.forEach(t => onRemoveTask?.(t.task_id))}
                        className="text-sm text-gray-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear completed
                    </button>
                )}
            </div>

            {/* Active downloads - show prominently */}
            <AnimatePresence>
                {activeTasks.map((task) => (
                    <DownloadProgress
                        key={task.task_id}
                        task={task}
                        onDownloadFile={onDownloadFile}
                        onCancel={onCancelTask}
                        getVideoUrl={getVideoUrl}
                    />
                ))}
            </AnimatePresence>

            {/* Completed downloads - show in a grid */}
            {completedTasks.length > 0 && (
                <div className="space-y-2">
                    <AnimatePresence>
                        {completedTasks.map((task) => (
                            <DownloadProgress
                                key={task.task_id}
                                task={task}
                                onDownloadFile={onDownloadFile}
                                onCancel={onCancelTask}
                                getVideoUrl={getVideoUrl}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default DownloadQueue;

