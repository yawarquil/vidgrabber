import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Globe,
    Search,
    Youtube,
    Twitter,
    Instagram,
    Film,
    Music,
    Tv,
    Radio,
    ChevronRight,
    Sparkles
} from 'lucide-react';

// Popular site icons mapping
const siteIcons = {
    youtube: Youtube,
    twitter: Twitter,
    x: Twitter,
    instagram: Instagram,
    tiktok: Film,
    vimeo: Film,
    twitch: Tv,
    soundcloud: Music,
    spotify: Music,
    dailymotion: Film,
    facebook: Globe,
    reddit: Globe,
};

// Site categories
const siteCategories = {
    'Social Media': ['youtube', 'twitter', 'instagram', 'tiktok', 'facebook', 'reddit', 'tumblr'],
    'Video Platforms': ['vimeo', 'dailymotion', 'bilibili', 'niconico', 'rutube'],
    'Streaming': ['twitch', 'kick', 'rumble'],
    'Audio': ['soundcloud', 'bandcamp', 'mixcloud'],
};

const SiteShowcase = ({ sites = [], siteCount = 0 }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Filter sites based on search
    const filteredSites = useMemo(() => {
        if (!sites.length) return [];

        let filtered = sites;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(site =>
                site.name.toLowerCase().includes(query) ||
                site.description.toLowerCase().includes(query)
            );
        }

        return filtered.slice(0, 50); // Limit display
    }, [sites, searchQuery]);

    // Popular sites for carousel
    const popularSites = useMemo(() => {
        const popular = ['YouTube', 'Twitter', 'Instagram', 'TikTok', 'Vimeo', 'Twitch', 'Reddit', 'Facebook'];
        return sites.filter(site =>
            popular.some(p => site.name.toLowerCase().includes(p.toLowerCase()))
        ).slice(0, 8);
    }, [sites]);

    const getIconForSite = (siteName) => {
        const name = siteName.toLowerCase();
        for (const [key, Icon] of Object.entries(siteIcons)) {
            if (name.includes(key)) {
                return Icon;
            }
        }
        return Globe;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-electric-500/20 to-neon-purple-500/20 rounded-xl">
                        <Globe className="w-6 h-6 text-electric-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Supported Sites</h3>
                        <p className="text-sm text-gray-400">
                            Works with <span className="text-electric-400 font-medium">{siteCount ? `${siteCount}+` : '1000+'}</span> websites
                        </p>
                    </div>
                </div>
            </div>

            {/* Popular sites carousel */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Popular Sites
                </h4>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {popularSites.length > 0 ? (
                        popularSites.map((site) => {
                            const Icon = getIconForSite(site.name);
                            return (
                                <motion.div
                                    key={site.name}
                                    whileHover={{ scale: 1.05 }}
                                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 
                             bg-surface-light/50 rounded-xl border border-white/5
                             hover:border-electric-500/30 transition-colors cursor-default"
                                >
                                    <Icon className="w-4 h-4 text-electric-400" />
                                    <span className="text-sm font-medium text-white whitespace-nowrap">
                                        {site.name}
                                    </span>
                                </motion.div>
                            );
                        })
                    ) : (
                        // Skeleton for popular sites
                        Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-28 h-10 bg-surface-light/50 rounded-xl animate-pulse"
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search sites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-11"
                />
            </div>

            {/* Site list */}
            <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredSites.length > 0 ? (
                    filteredSites.map((site) => {
                        const Icon = getIconForSite(site.name);
                        return (
                            <div
                                key={site.name}
                                className="flex items-center gap-3 p-2 rounded-lg 
                           hover:bg-surface-light/30 transition-colors group"
                            >
                                <Icon className="w-4 h-4 text-gray-500 group-hover:text-electric-400 transition-colors" />
                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                    {site.name}
                                </span>
                                <ChevronRight className="w-4 h-4 text-gray-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        );
                    })
                ) : searchQuery ? (
                    <div className="text-center py-8 text-gray-500">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No sites found matching "{searchQuery}"</p>
                    </div>
                ) : (
                    // Loading skeleton
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-2">
                            <div className="w-4 h-4 bg-surface-light rounded animate-pulse" />
                            <div className="h-4 bg-surface-light rounded w-32 animate-pulse" />
                        </div>
                    ))
                )}
            </div>

            {/* View all link */}
            {sites.length > 50 && !searchQuery && (
                <div className="mt-4 pt-4 border-t border-white/5 text-center">
                    <span className="text-sm text-gray-500">
                        And {sites.length - 50} more sites...
                    </span>
                </div>
            )}
        </motion.div>
    );
};

export default SiteShowcase;
