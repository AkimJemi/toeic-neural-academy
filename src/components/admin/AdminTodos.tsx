/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Trash2, Plus, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Todo {
    id: number;
    task: string;
    status: 'pending' | 'completed';
    priority: 'low' | 'medium' | 'high';
    category: string;
    createdat: string;
}

export const AdminTodos: React.FC = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTask, setNewTask] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [loading, setLoading] = useState(true);

    const fetchTodos = async () => {
        try {
            const res = await fetch('/api/admin/todos');
            const data = await res.json();
            setTodos(data);
        } catch (e) {
            console.error("Failed to fetch todos", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            const res = await fetch('/api/admin/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: newTask, priority, category: 'admin' })
            });
            if (res.ok) {
                setNewTask('');
                fetchTodos();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
        try {
            const res = await fetch(`/api/admin/todos/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchTodos();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("ERASE DIRECTIVE?")) return;
        try {
            const res = await fetch(`/api/admin/todos/${id}`, { method: 'DELETE' });
            if (res.ok) fetchTodos();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="text-center py-10 text-slate-500 animate-pulse font-mono">LINKING TASK DATABASE...</div>;

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-20">
            {/* Add Task Form */}
            <form onSubmit={handleAddTodo} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">New Directive</label>
                    <input 
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Define system objective..."
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                    />
                </div>
                <div className="w-full md:w-32 space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Priority</label>
                    <select 
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-cyan-500"
                    >
                        <option value="low">LOW</option>
                        <option value="medium">MED</option>
                        <option value="high">HIGH</option>
                    </select>
                </div>
                <button 
                    type="submit"
                    disabled={!newTask.trim()}
                    className="w-full md:w-auto px-6 py-3 bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-black font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" />
                    DEPLOY
                </button>
            </form>

            {/* Tasks List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-slate-400 font-brand text-sm tracking-widest uppercase">ACTIVE DIRECTIVES</h3>
                    <span className="text-[10px] font-mono text-slate-600">{todos.filter(t => t.status === 'pending').length} PENDING</span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                    <AnimatePresence mode="popLayout">
                        {todos.map((todo) => (
                            <motion.div 
                                key={todo.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 group
                                    ${todo.status === 'completed' 
                                        ? 'bg-slate-900/30 border-slate-800/50 opacity-60' 
                                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}`}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <button 
                                        onClick={() => toggleStatus(todo.id, todo.status)}
                                        className={`transition-colors flex-shrink-0 ${todo.status === 'completed' ? 'text-emerald-500' : 'text-slate-700 hover:text-cyan-500'}`}
                                    >
                                        {todo.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                    </button>
                                    <div className="space-y-1">
                                        <p className={`text-sm font-medium ${todo.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                            {todo.task}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter
                                                ${todo.priority === 'high' ? 'bg-rose-500/10 text-rose-500' : 
                                                  todo.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-500'}`}>
                                                {todo.priority}
                                            </span>
                                            <span className="text-[9px] text-slate-600 flex items-center gap-1 font-mono">
                                                <Clock className="w-3 h-3" />
                                                {new Date(todo.createdat).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => handleDelete(todo.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-rose-500 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {todos.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-slate-800/50 rounded-2xl">
                            <AlertCircle className="w-8 h-8 text-slate-800 mx-auto mb-3" />
                            <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">No Directives in Queue</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
