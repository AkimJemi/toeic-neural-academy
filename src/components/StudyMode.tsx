import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/useQuizStore';

import { Zap, Layers, Globe, Shield, Terminal, BookOpen, Award, Image, MessageCircle, Mic, PenTool, FileText, Library } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { Category } from '../db/db';
import { db } from '../db/db';
import { soundManager } from '../utils/sound';
import { RankingView } from './RankingView';
import { PublicChatView } from './PublicChatView';

const ICON_MAP: Record<string, any> = {
    Zap, Layers, Globe, Shield, Terminal, Award,
    Image, MessageCircle, Mic, PenTool, FileText, BookOpen, Library
};

export const StudyMode: React.FC = () => {
    const navigate = useNavigate();
    const { } = useQuizStore();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCats = async () => {

            try {
                const cats = await db.categories.toArray();
                setCategories(cats);
            } catch (error) {
                console.error("Failed to load categories", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCats();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-t-2 border-cyan-400 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full max-w-7xl mx-auto px-4 md:px-6 space-y-8 pb-24"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
                <div>
                    <h1 className="text-3xl md:text-5xl font-brand text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-2">
                        NEURAL COMMAND
                    </h1>
                    <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                        Select Mission Protocol
                    </p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content: Categories */}
                <div className="flex-1 space-y-6">
                    <h2 className="text-slate-400 font-brand text-sm tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-cyan-500" />
                        ACTIVE SECTORS
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-4">
                        {categories.map((cat) => {
                            const CategoryIcon = ICON_MAP[cat.icon] || Globe;
                            return (
                            <motion.button
                                    key={cat.id}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02 }}
                                    onMouseEnter={() => soundManager.hover()}
                                    onClick={async () => {
                                        soundManager.click();
                                        navigate(`/quiz/${cat.id}`);
                                    }}
                                    className="group relative p-4 bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-left transition-all overflow-hidden flex flex-col h-full min-h-[120px]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-indigo-500/0 group-hover:from-cyan-500/5 group-hover:to-indigo-500/5 transition-all duration-500" />
                                    
                                    <div className="flex items-start justify-between mb-2">
                                        <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ring-1 ring-white/10", cat.bg)}>
                                            <CategoryIcon className={clsx("w-4 h-4", cat.color)} />
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-500/20">Init</span>
                                        </div>
                                    </div>
                                    
                                    <div className="relative z-10 mt-auto">
                                        <h3 className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-2">
                                            {cat.title}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-1 hidden md:block">
                                            {cat.description}
                                        </p>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar: Ranking & Chat */}
                <div className="w-full lg:w-80 space-y-6">
                     <h2 className="text-slate-400 font-brand text-sm tracking-wider flex items-center gap-2">
                        <Globe className="w-4 h-4 text-indigo-500" />
                        GLOBAL NETWORK
                    </h2>
                    <RankingView />
                    <PublicChatView />

                    {/* Recommended Resources (Affiliate Section) */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-slate-400 font-brand text-sm tracking-wider flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-emerald-500" />
                            EXTERNAL MODULES
                        </h2>
                        
                        <div className="space-y-3">
                            {[
                                { title: "Neural Vocab Booster", desc: "Advanced lexicon expansion for Part 5/6.", price: "¥2,400" },
                                { title: "Listening Echo System", desc: "Native frequency synchronization.", price: "¥1,850" }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    whileHover={{ x: 5 }}
                                    className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg hover:border-emerald-500/30 transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-400">{item.title}</h4>
                                        <span className="text-[9px] font-mono text-slate-500">{item.price}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 line-clamp-2">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                        
                        <button className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-colors">
                            Explore Archive
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
