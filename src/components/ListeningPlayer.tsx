import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, RotateCcw, Mic2 } from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface ListeningPlayerProps {
    script: string;
    title?: string;
    autoPlay?: boolean;
}

export const ListeningPlayer: React.FC<ListeningPlayerProps> = ({ script, title = "Neural Audio Stream", autoPlay = false }) => {
    const { speak, pause, resume, stop, isPlaying, isPaused, progress, currentWord } = useTextToSpeech();
    const [rate, setRate] = useState(1.0);
    
    // Auto-play on mount
    useEffect(() => {
        if (autoPlay) {
            handlePlay();
        }
        return () => stop();
    }, [script, autoPlay]);

    const handlePlay = () => {
        if (isPaused) {
            resume();
        } else {
            speak(script, { rate, lang: 'en-US' });
        }
    };

    return (
        <div className="w-full bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 opacity-50" />
            
            {/* Header */}
            <div className="relative px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={clsx("w-2 h-2 rounded-full animate-pulse", isPlaying ? "bg-emerald-400" : "bg-slate-600")} />
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                     <select 
                        value={rate} 
                        onChange={(e) => setRate(parseFloat(e.target.value))}
                        className="bg-slate-800 text-xs text-slate-300 border border-slate-700 rounded px-1 py-0.5 focus:outline-none focus:border-cyan-500"
                    >
                        <option value="0.8">0.8x</option>
                        <option value="1.0">1.0x</option>
                        <option value="1.2">1.2x</option>
                        <option value="1.5">1.5x</option>
                    </select>
                </div>
            </div>

            {/* Visualizer / Progress */}
            <div className="relative h-24 flex items-center justify-center bg-slate-950/50">
                {isPlaying ? (
                    <div className="flex items-end gap-1 h-12">
                        {[...Array(10)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ height: [10, Math.random() * 40 + 10, 10] }}
                                transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5 }}
                                className="w-1 bg-cyan-500/50 rounded-t"
                            />
                        ))}
                    </div>
                ) : (
                    <Mic2 className="w-8 h-8 text-slate-700" />
                )}
                
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                    <motion.div 
                        className="h-full bg-cyan-500"
                        style={{ width: `${progress * 100}%` }}
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="relative p-4 flex items-center justify-between gap-4">
                <div className="text-xs font-mono text-cyan-400 truncate max-w-[150px] min-h-[1.5em]">
                    {currentWord || (isPlaying ? "..." : "Ready")}
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => { stop(); handlePlay(); }}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Restart"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>

                    <button 
                        onClick={() => isPlaying && !isPaused ? pause() : handlePlay()}
                        className={clsx(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg",
                            isPlaying && !isPaused 
                                ? "bg-slate-800 text-emerald-400 border border-emerald-500/30" 
                                : "bg-emerald-500 text-white hover:bg-emerald-400"
                        )}
                    >
                        {isPlaying && !isPaused ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                    
                     <button 
                        onClick={stop}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Stop"
                    >
                        <Square className="w-4 h-4 fill-current" />
                    </button>
                </div>
            </div>
            
            {/* Script Toggle (Optional) */}
             <div className="bg-slate-950 p-4 border-t border-slate-800 text-sm text-slate-400 font-serif leading-relaxed max-h-40 overflow-y-auto hidden group-hover:block">
                 {script}
             </div>
        </div>
    );
};
