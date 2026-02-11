import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, Check, X } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { useAuthStore } from '../store/useAuthStore';

interface Flashcard {
    id: number;
    front: string;
    back: string;
    category?: string;
}

export const FlashcardView: React.FC = () => {
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const currentUser = useAuthStore((state) => state.currentUser);

    useEffect(() => {
        const loadCards = async () => {
             try {
                 const query = currentUser?.userId ? `?userId=${currentUser.userId}` : '';
                 const res = await fetch(`/api/questions${query}`);
                 const data = await res.json();
                 const questions = Array.isArray(data) ? data : (data.data || []);
                 
                 const generatedCards: Flashcard[] = questions.map((q: any) => ({
                     id: q.id,
                     front: q.question,
                     back: q.correctAnswer !== undefined ? q.options?.[q.correctAnswer] || "Answer not available" : "Answer Hidden",
                     category: q.category
                 })).slice(0, 50);

                 setCards(deployShuffle(generatedCards));
             } catch (e) {
                 console.error("Failed to load flashcards", e);
             } finally {
                 setLoading(false);
             }
        };
        loadCards();
    }, []);

    const deployShuffle = (array: any[]) => {
        return [...array].sort(() => Math.random() - 0.5);
    };

    const handleFlip = () => {
        soundManager.hover();
        setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
        soundManager.click();
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % cards.length);
        }, 150);
    };

    const handlePrev = () => {
        soundManager.click();
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        }, 150);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleFlip();
            } else if (e.code === 'ArrowRight') {
                handleNext();
            } else if (e.code === 'ArrowLeft') {
                handlePrev();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFlipped, cards.length, currentIndex]);

    if (loading) return <div className="p-8 text-center text-cyan-400 font-mono animate-pulse">Initializing Memory Matrix...</div>;
    if (cards.length === 0) return <div className="p-8 text-center text-slate-500">No Flashcards Available.</div>;

    const currentCard = cards[currentIndex];

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 relative">
            <div className="mb-12 flex items-center gap-6">
                <div className="flex flex-col items-center">
                    <span className="text-slate-500 font-mono text-[10px] uppercase tracking-tighter">Sector Index</span>
                    <span className="text-cyan-400 font-mono text-xl font-bold">
                        {String(currentIndex + 1).padStart(2, '0')} <span className="text-slate-700">/ {String(cards.length).padStart(2, '0')}</span>
                    </span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <button 
                    onClick={() => {
                        soundManager.click();
                        setCards(deployShuffle(cards));
                        setCurrentIndex(0);
                    }}
                    className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-cyan-400 hover:text-white hover:border-cyan-500/50 transition-all flex items-center gap-2 group"
                    title="Reshufle Sequence"
                >
                    <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Reshuffle</span>
                </button>
            </div>

            <div className="relative w-full max-w-lg aspect-[4/3] sm:aspect-[3/2] perspective-2000">
                <motion.div
                    className="w-full h-full relative preserve-3d cursor-pointer"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 150, damping: 20 }}
                    onClick={handleFlip}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] group hover:border-cyan-500/30 transition-colors overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                        <div className="absolute top-6 left-8 text-[10px] font-mono text-cyan-500/40 uppercase tracking-[0.2em]">Input Signal</div>
                        <div className="absolute top-6 right-8 text-[10px] font-mono text-slate-700 uppercase">{currentCard.category}</div>
                        
                        <h3 className="text-xl md:text-2xl font-medium text-slate-100 leading-relaxed max-w-md">
                            {currentCard.front}
                        </h3>
                        
                        <div className="absolute bottom-8 flex flex-col items-center gap-2">
                            <div className="px-3 py-1 bg-slate-950/50 border border-slate-800 rounded-full text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                                Tap or Space to Decrypt
                            </div>
                        </div>
                    </div>

                    {/* Back */}
                    <div 
                        className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-950 to-slate-950 border-2 border-indigo-500/20 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] rotate-y-180"
                        style={{ transform: 'rotateY(180deg)' }}
                    >
                        <div className="absolute top-6 left-8 text-[10px] font-mono text-indigo-400/40 uppercase tracking-[0.2em]">Verified Output</div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white leading-relaxed drop-shadow-lg">
                            {currentCard.back}
                        </h3>
                        <div className="absolute bottom-8 w-16 h-1 bg-indigo-500/20 rounded-full" />
                    </div>
                </motion.div>
            </div>

            <div className="mt-12 flex items-center gap-12">
                <button 
                    onClick={handlePrev}
                    className="flex flex-col items-center gap-1 group"
                >
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-all">
                        <X className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Previous</span>
                </button>

                <div className="flex flex-col items-center">
                    <div className="flex gap-1.5 mb-2">
                        {Array.from({ length: Math.min(cards.length, 5) }).map((_, i) => {
                            const activeIdx = currentIndex % 5;
                            return (
                                <div 
                                    key={i} 
                                    className={`h-1 rounded-full transition-all ${i === activeIdx ? 'w-4 bg-cyan-500' : 'w-1 bg-slate-800'}`} 
                                />
                            );
                        })}
                    </div>
                </div>

                <button 
                    onClick={handleNext}
                    className="flex flex-col items-center gap-1 group"
                >
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition-all">
                        <Check className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Next Data</span>
                </button>
            </div>

            {/* Hint for Desktop */}
            <div className="hidden lg:flex items-center gap-6 mt-12 text-slate-600 font-mono text-[9px] uppercase tracking-widest opacity-50">
                <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">Space</kbd> Flip</span>
                <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">←</kbd> Prev</span>
                <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">→</kbd> Next</span>
            </div>
        </div>
    );
};
