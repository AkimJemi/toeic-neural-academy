import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuizStore } from '../store/useQuizStore';
import { soundManager } from '../utils/sound';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListeningPlayer } from './ListeningPlayer';
import { AdComponent } from './AdComponent';

export const Quiz: React.FC = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const { 
        questions, currentQuestionIndex, score, showResults, answers, isActive,
        setAnswer, nextQuestion, prevQuestion, endQuiz, resetQuiz, startQuiz 
    } = useQuizStore();

    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const initQuiz = async () => {
            if (!isActive && categoryId && !showResults) {
                const result = await startQuiz(categoryId);
                if (!result.success) {
                    setError(result.error || 'Initialization Failed');
                }
            }
        };
        initQuiz();
    }, [categoryId, isActive, showResults, startQuiz]);

    const handleExit = () => {
        endQuiz();
        navigate('/');
    };

    if (error) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-lg w-full shadow-2xl text-center"
                >
                    <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-6 animate-pulse" />
                    <h2 className="text-3xl font-brand text-white mb-4 uppercase italic">Access Restricted</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        {error}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button 
                            onClick={handleExit}
                            className="px-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all font-bold uppercase tracking-widest text-sm"
                        >
                            Return to Base
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!isActive && !showResults) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-t-2 border-cyan-400 rounded-full animate-spin" />
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const hasAnsweredCurrent = answers[currentQuestionIndex] !== undefined;

    // Shorts handling
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showResults) return;
            
            if (['1', '2', '3', '4'].includes(e.key)) {
                setAnswer(currentQuestionIndex, parseInt(e.key) - 1);
            }
            if (e.key === 'Enter' && hasAnsweredCurrent) {
                nextQuestion();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentQuestionIndex, hasAnsweredCurrent, showResults]);

    if (showResults) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-lg w-full shadow-2xl text-center"
                >
                    <h2 className="text-4xl font-brand text-cyan-400 mb-6 uppercase italic">Mission Complete</h2>
                    
                    <div className="flex justify-center mb-8">
                        <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                                <circle 
                                    cx="50" cy="50" r="45" fill="none" stroke="#22d3ee" strokeWidth="8" 
                                    pathLength="1"
                                    strokeDasharray="1"
                                    strokeDashoffset={1 - score / questions.length}
                                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                />
                            </svg>
                            <span className="text-4xl font-bold">{Math.round((score / questions.length) * 100)}%</span>
                        </div>
                    </div>

                    <p className="text-slate-400 mb-8">
                        Score: <span className="text-white font-bold">{score}</span> / {questions.length}
                    </p>

                    <div className="mb-8 max-w-sm mx-auto">
                        <AdComponent />
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button 
                            onClick={handleExit}
                            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all font-medium"
                        >
                            Back to Menu
                        </button>
                        <button 
                            onClick={resetQuiz}
                            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 transition-all font-bold"
                        >
                            Retry Mission
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button onClick={handleExit} className="text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                        Exit
                    </button>
                    <div className="h-6 w-px bg-slate-800" />
                    <span className="text-slate-400 text-sm">
                        Q.{currentQuestionIndex + 1} <span className="text-slate-600">/ {questions.length}</span>
                    </span>
                </div>
                <div className="text-cyan-400 font-brand text-xl italic">{currentQuestion?.category}</div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center">
                <div className="max-w-3xl w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <h1 className="text-2xl md:text-3xl font-medium leading-relaxed">
                                    {currentQuestion?.question || "Loading Question..."}
                                </h1>
                                {['Part 1', 'Part 2', 'Part 3', 'Part 4'].some(p => currentQuestion?.category?.includes(p)) && (
                                    <div className="mb-6">
                                        <ListeningPlayer 
                                            script={currentQuestion.question} 
                                            title={`Neural Audio: ${currentQuestion.category}`}
                                        />
                                    </div>
                                )}
                                {currentQuestion?.translations?.ja && (
                                     <p className="text-slate-500 text-sm">{currentQuestion.translations.ja.question}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {currentQuestion?.options?.map((option: string, idx: number) => {
                                    const isSelected = answers[currentQuestionIndex] === idx;
                                    const isCorrect = idx === currentQuestion.correctAnswer;
                                    
                                    let variant = "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800";
                                    if (isSelected && !hasAnsweredCurrent) variant = "bg-cyan-500/10 border-cyan-500 text-cyan-400";
                                    
                                    if (answers[currentQuestionIndex] !== undefined) {
                                        if (isCorrect) variant = "bg-emerald-500/10 border-emerald-500 text-emerald-400";
                                        if (isSelected && !isCorrect) variant = "bg-rose-500/10 border-rose-500 text-rose-400";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            disabled={hasAnsweredCurrent}
                                            onClick={() => {
                                                if (hasAnsweredCurrent) return;
                                                const isCorrect = idx === currentQuestion.correctAnswer;
                                                if (isCorrect) soundManager.success();
                                                else soundManager.error();
                                                
                                                setAnswer(currentQuestionIndex, idx);
                                            }}
                                            onMouseEnter={() => !hasAnsweredCurrent && soundManager.hover()}
                                            className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group ${variant}`}
                                        >
                                            <div className="flex items-center gap-4 relative z-10">
                                                <span className="w-8 h-8 rounded-lg bg-slate-900/50 flex items-center justify-center text-xs font-bold font-mono border border-white/10 group-hover:border-white/30 transition-colors">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-lg">{option}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Detailed Explanation (Root Analysis) */}
                            {answers[currentQuestionIndex] !== undefined && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 overflow-hidden"
                                >
                                    <h3 className="text-cyan-400 font-brand text-lg mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        ROOT ANALYSIS
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed mb-4">
                                        {currentQuestion.explanation}
                                    </p>
                                    {currentQuestion.translations?.ja?.explanation && (
                                        <p className="text-slate-500 text-sm border-t border-slate-800 pt-4">
                                            {currentQuestion.translations.ja.explanation}
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="bg-slate-900/80 backdrop-blur-md border-t border-slate-800 p-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button 
                        onClick={prevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="p-3 rounded-full hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={nextQuestion}
                        disabled={answers[currentQuestionIndex] === undefined}
                        className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all ${
                            answers[currentQuestionIndex] !== undefined
                                ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        {isLastQuestion ? 'COMPLETE MISSION' : 'NEXT SECTOR'}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
