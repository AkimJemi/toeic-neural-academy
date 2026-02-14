import React, { useState, useEffect } from 'react';

import { Check, X, Eye, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Submission {
    id: number;
    category: string;
    question: string;
    options: string[] | string;
    correctAnswer: number;
    explanation: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export const AdminSubmissions: React.FC = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [viewingId, setViewingId] = useState<number | null>(null);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await fetch('/api/admin/submissions');
            const data = await res.json();
            setSubmissions(Array.isArray(data) ? data : data.data || []);
        } catch (e) {
            console.error("Failed to fetch submissions", e);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await fetch(`/api/admin/submissions/${id}/approve`, { method: 'POST' });
            setSubmissions(prev => prev.filter(s => s.id !== id));
            setViewingId(null);
        } catch (_) {
            alert("Approval Failed");
        }
    };

    const handleReject = async (id: number) => {
        if (!window.confirm("Reject this submission?")) return;
        try {
            await fetch(`/api/admin/submissions/${id}`, { method: 'DELETE' });
            setSubmissions(prev => prev.filter(s => s.id !== id));
            setViewingId(null);
        } catch (_) {
            alert("Rejection Failed");
        }
    };

    const parseOptions = (opts: any) => {
        try {
            return typeof opts === 'string' ? JSON.parse(opts) : opts;
        } catch (_) {
            return [];
        }
    };

    const selectedSubmission = submissions.find(s => s.id === viewingId);

    return (
        <div className="flex gap-6 h-[600px]">
            {/* List */}
            <div className="w-1/3 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-950/50 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Incoming Data ({submissions.length})</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {submissions.length === 0 && (
                        <div className="p-8 text-center text-slate-500 text-xs uppercase">No pending submissions</div>
                    )}
                    {submissions.map(sub => (
                        <button 
                            key={sub.id}
                            onClick={() => setViewingId(sub.id)}
                            className={`w-full text-left p-4 rounded-lg transition-colors border ${viewingId === sub.id ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-800/30 border-transparent hover:bg-slate-800'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-mono text-cyan-400 px-1.5 py-0.5 bg-cyan-950 rounded border border-cyan-500/20">{sub.category}</span>
                                <ChevronRight className={`w-4 h-4 text-slate-500 ${viewingId === sub.id ? 'text-cyan-400' : ''}`} />
                            </div>
                            <p className="text-sm text-slate-300 line-clamp-2 font-medium">{sub.question}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Detail View */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-8 relative overflow-y-auto">
                <AnimatePresence mode="wait">
                    {selectedSubmission ? (
                        <motion.div 
                            key={selectedSubmission.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 leading-relaxed">{selectedSubmission.question}</h2>
                                <div className="grid gap-2">
                                    {parseOptions(selectedSubmission.options).map((opt: string, idx: number) => (
                                        <div key={idx} className={`p-3 rounded-lg border ${idx === selectedSubmission.correctAnswer ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
                                            <span className="font-mono mr-4 opacity-50">{idx + 1}.</span>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                                <h3 className="text-cyan-400 font-brand text-sm mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Analytical Data
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{selectedSubmission.explanation}</p>
                            </div>

                            <div className="flex justify-end gap-4 pt-8 border-t border-slate-800">
                                <button 
                                    onClick={() => handleReject(selectedSubmission.id)}
                                    className="px-6 py-2 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" /> REJECT
                                </button>
                                <button 
                                    onClick={() => handleApprove(selectedSubmission.id)}
                                    className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                                >
                                    <Check className="w-4 h-4" /> INTEGRATE DATA
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-600 flex-col gap-4">
                            <Eye className="w-12 h-12 opacity-20" />
                            <p className="font-mono text-sm uppercase tracking-widest">Select an item to analyze</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
