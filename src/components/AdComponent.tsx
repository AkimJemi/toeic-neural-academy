import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Info } from 'lucide-react';
import { useSubscriptionStore } from '../store/useSubscriptionStore';

interface AdComponentProps {
    type?: 'display' | 'video' | 'native';
    className?: string;
}

export const AdComponent: React.FC<AdComponentProps> = ({ type = 'display', className = '' }) => {
    const { isPremium } = useSubscriptionStore();

    // Do not render anything if the user is premium
    if (isPremium) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900/50 p-4 transition-all hover:bg-slate-800/80 group ${className}`}
        >
            <div className="absolute top-0 right-0 p-1">
                <span className="text-[9px] uppercase font-bold text-slate-600 tracking-tighter bg-slate-950 px-1 rounded">{type === 'video' ? 'VIDEO PROMO' : 'SPONSORED'}</span>
            </div>
            
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <Info className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-1 group-hover:text-indigo-300 transition-colors">
                        Neural Plus Early Access
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2">
                        Unlock advanced cognitive prediction and unlimited neural training sessions with Neural Plus.
                    </p>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                <button 
                    onClick={() => window.open('https://example.com/learn-more', '_blank')}
                    className="flex-1 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase transition-all shadow-lg shadow-indigo-500/10"
                >
                    Initialize Upgrade
                </button>
                <div className="px-2 py-1.5 rounded bg-slate-800 text-[10px] text-slate-500 font-mono italic">
                    v2.5.0_PROMO
                </div>
            </div>
            
            {/* Ambient Pulse Effect */}
            <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-indigo-500/10 blur-2xl rounded-full animate-pulse" />
        </motion.div>
    );
};
