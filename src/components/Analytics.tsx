import React from 'react';
import { BarChart, Activity } from 'lucide-react';

export const Analytics: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
            <div className="w-24 h-24 mb-6 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                <Activity className="w-12 h-12 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-brand text-white mb-2 tracking-widest">NEURAL ANALYTICS</h1>
            <p className="text-slate-500 font-mono mb-8 uppercase tracking-widest text-xs">
                Performance Metrics & Predictive Modeling
            </p>
            
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl max-w-md w-full backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-4 text-left">
                     <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <BarChart className="w-6 h-6 text-indigo-400" />
                     </div>
                     <div>
                         <h3 className="text-slate-200 font-bold">Data Insufficient</h3>
                         <p className="text-xs text-slate-500">More mission data required for analysis.</p>
                     </div>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[10%] animate-pulse" />
                </div>
            </div>
        </div>
    );
};
