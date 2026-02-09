import React, { useEffect, useState, useRef } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
    id: number;
    userid: string;
    nickname: string;
    role: string;
    message: string;
    createdat: string;
}

export const PublicChatView: React.FC = () => {
    const { currentUser } = useAuthStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = () => {
        fetch('/api/public-chat?limit=50')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setMessages(data);
                } else {
                    console.error("Invalid chat data:", data);
                    setMessages([]);
                }
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        if (!currentUser) {
            alert('PLEASE LOGIN TO TRANSMIT');
            return;
        }

        try {
            const res = await fetch('/api/public-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.userId, message: input })
            });
            if (res.ok) {
                setInput('');
                fetchMessages();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="w-full h-[400px] glass-panel p-4 rounded-xl flex flex-col">
            <div className="flex items-center gap-2 text-indigo-400 mb-4 border-b border-white/5 pb-2">
                <MessageSquare className="w-5 h-5" />
                <h3 className="font-brand text-lg">NEURAL LINK [PUBLIC]</h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <AnimatePresence>
                {messages.map((msg) => {
                    const isMe = currentUser?.userId === msg.userid;
                    return (
                        <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold ${msg.role === 'admin' ? 'text-red-400' : 'text-slate-400'}`}>
                                    {msg.nickname || 'Unknown'}
                                </span>
                                <span className="text-[9px] text-slate-600">
                                    {new Date(msg.createdat).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <div className={`p-2 rounded-lg text-xs max-w-[85%] break-words
                                ${isMe 
                                    ? 'bg-indigo-500/20 text-indigo-100 border border-indigo-500/30 rounded-tr-none' 
                                    : 'bg-slate-800 text-slate-300 border border-slate-700 rounded-tl-none'}`}>
                                {msg.message}
                            </div>
                        </motion.div>
                    );
                })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="mt-4 flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={currentUser ? "Transmit message..." : "Login to transmit"}
                    className="flex-1 bg-slate-950/50 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    disabled={!currentUser}
                />
                <button 
                    type="submit"
                    disabled={!currentUser || !input.trim()}
                    className="p-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded border border-indigo-600/50 transition-colors disabled:opacity-50"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};
