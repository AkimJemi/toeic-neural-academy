import { motion, AnimatePresence } from 'framer-motion';
// Force rebuild
import { X, Check } from 'lucide-react';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import React from 'react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    const upgrade = useSubscriptionStore((state) => state.upgrade);

    const handleUpgrade = (plan: 'basic' | 'premium') => {
        // Map simplified plans to Stripe Price IDs (Mock for now)
        const priceId = plan === 'basic' ? 'price_basic_monthly' : 'price_premium_monthly';
        upgrade(priceId);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-inter"
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 relative overflow-hidden shadow-2xl shadow-emerald-500/10"
                    onClick={e => e.stopPropagation()}
                >
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
                            Neural <span className="text-emerald-400">Upgrade</span>
                        </h2>
                        <p className="text-slate-400 text-sm">Synchronize with advanced learning modules.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Basic Plan */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-emerald-500/50 transition-colors group">
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">Pro License</h3>
                            <div className="text-3xl font-black text-white mb-4">¥980<span className="text-sm text-slate-500 font-normal">/mo</span></div>
                            <ul className="space-y-3 mb-6 text-sm text-slate-300">
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited Neural Training</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Detailed Metrics</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Ad-free Interface</li>
                            </ul>
                            <button 
                                onClick={() => handleUpgrade('basic')}
                                className="w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors border border-slate-600"
                            >
                                Initiate
                            </button>
                        </div>

                        {/* Premium Plan */}
                        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 rounded-xl p-6 border border-indigo-500/50 relative overflow-hidden group">
                             <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors" />
                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg z-10">Recommended</div>
                            
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">Neural Sync+</h3>
                                <div className="text-3xl font-black text-white mb-4">¥1,980<span className="text-sm text-slate-500 font-normal">/mo</span></div>
                                <ul className="space-y-3 mb-6 text-sm text-slate-300">
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> All Pro Features</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> AI Weakness Prediction</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Full Mock Exams</li>
                                </ul>
                                <button 
                                    onClick={() => handleUpgrade('premium')}
                                    className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    Activate Sync
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
