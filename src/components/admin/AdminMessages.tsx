import React, { useState, useEffect } from 'react';
import { Mail, Reply } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
    id: number;
    userId: string;
    nickname?: string;
    name: string;
    email: string;
    topic: string;
    message: string;
    reply?: string;
    status: 'unread' | 'read' | 'replied';
    createdAt: string;
}

export const AdminMessages: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [replyText, setReplyText] = useState('');
    const [viewingId, setViewingId] = useState<number | null>(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/admin/messages');
            const data = await res.json();
            setMessages(Array.isArray(data) ? data : data.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleReply = async (id: number) => {
        try {
            await fetch(`/api/admin/messages/${id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply: replyText })
            });
            setReplyText('');
            fetchMessages();
        } catch (e) {
            alert("Failed to send reply");
        }
    };

    const selectedMessage = messages.find(m => m.id === viewingId);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
            <div className="md:col-span-1 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-800 bg-slate-950/30">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Signals ({messages.length})</h3>
                </div>
                <div className="flex-1 overflow-y-auto w-full">
                    {messages.map(msg => (
                        <button
                            key={msg.id}
                            onClick={() => setViewingId(msg.id)}
                            className={`w-full text-left p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${viewingId === msg.id ? 'bg-cyan-500/5 border-l-2 border-l-cyan-500' : 'border-l-2 border-l-transparent'}`}
                        >
                            <div className="flex justify-between mb-1">
                                <span className={`text-xs font-bold ${msg.status === 'unread' ? 'text-rose-400' : 'text-slate-500'}`}>{msg.status.toUpperCase()}</span>
                                <span className="text-xs text-slate-600">{new Date(msg.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-bold text-slate-300 text-sm truncate">{msg.topic}</h4>
                            <p className="text-xs text-slate-500 truncate">{msg.name}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 relative">
                {selectedMessage ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6 flex flex-col h-full"
                    >
                        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">{selectedMessage.topic}</h2>
                                <div className="text-sm text-slate-400 flex items-center gap-2">
                                    <span className="text-cyan-400">{selectedMessage.name}</span>
                                    <span className="w-1 h-1 bg-slate-600 rounded-full" />
                                    <span>{selectedMessage.email}</span>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-slate-800 rounded text-xs text-slate-400 font-mono">
                                ID: {selectedMessage.userId || 'GUEST'}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
                            </div>

                            {selectedMessage.reply && (
                                <div className="ml-8 bg-cyan-900/10 border border-cyan-500/20 p-4 rounded-lg">
                                    <div className="text-xs text-cyan-500 font-bold mb-2 flex items-center gap-2">
                                        <Reply className="w-3 h-3" /> OFFICIAL RESPONSE
                                    </div>
                                    <p className="text-cyan-100">{selectedMessage.reply}</p>
                                </div>
                            )}
                        </div>

                        {!selectedMessage.reply && (
                            <div className="mt-auto pt-4 border-t border-slate-800">
                                <textarea
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder="Transmit response..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none h-24 resize-none mb-2"
                                />
                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => handleReply(selectedMessage.id)}
                                        className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg flex items-center gap-2"
                                    >
                                        <Reply className="w-4 h-4" /> TRANSMIT
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-600 flex-col">
                        <Mail className="w-16 h-16 opacity-20 mb-4" />
                        <p className="font-mono uppercase tracking-widest text-sm">Select a transmission</p>
                    </div>
                )}
            </div>
        </div>
    );
};
