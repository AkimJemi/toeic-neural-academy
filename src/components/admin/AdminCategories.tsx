import React, { useState, useEffect } from 'react';
import { db } from '../../db/db';
import type { Category } from '../../db/db';
import { Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import * as Icons from 'lucide-react';

export const AdminCategories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Category>>({});
    const [isNew, setIsNew] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const data = await db.categories.toArray();
        setCategories(data);
    };

    const handleEdit = (cat: Category) => {
        setEditingId(cat.id);
        setFormData(cat);
        setIsNew(false);
    };

    const handleNew = () => {
        setEditingId('new');
        setFormData({
            id: '',
            title: '',
            icon: 'Globe',
            color: 'text-slate-400',
            bg: 'bg-slate-400/10',
            description: '',
            displayOrder: categories.length
        });
        setIsNew(true);
    };

    const handleSave = async () => {
        if (!formData.id || !formData.title) return;

        try {
            const payload = {
                ...formData,
                displayOrder: Number(formData.displayOrder)
            };

            if (isNew) {
                await fetch('/api/admin/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                await fetch(`/api/admin/categories/${formData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            setEditingId(null);
            loadCategories();
        } catch (e) {
            console.error("Failed to save category", e);
            alert("Failed to save category");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure? This might break quizzes linked to this category.")) return;
        try {
            await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            loadCategories();
        } catch (e) {
            console.error("Failed to delete", e);
        }
    };

    const IconPreview = ({ name }: { name?: string }) => {
        if (!name) return null;
        const Icon = (Icons as any)[name] || Icons.HelpCircle;
        return <Icon className="w-5 h-5" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-brand text-cyan-400">SECTOR COMMAND</h2>
                <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 border border-cyan-500/30">
                    <Plus className="w-4 h-4" /> ADD SECTOR
                </button>
            </div>

            {editingId === 'new' && (
                <div className="mt-4 p-6 bg-slate-900/80 border border-cyan-500/50 rounded-xl space-y-4">
                    <h3 className="text-lg font-bold text-white mb-4">New Sector Protocol</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            placeholder="ID (e.g. Part 1)" 
                            value={formData.id || ''} 
                            onChange={e => setFormData({...formData, id: e.target.value})}
                            className="bg-slate-950 border border-slate-700 p-2 rounded text-white"
                        />
                        <input 
                            placeholder="Title" 
                            value={formData.title || ''} 
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className="bg-slate-950 border border-slate-700 p-2 rounded text-white"
                        />
                        <input 
                            placeholder="Icon Name (Lucide)" 
                            value={formData.icon || ''} 
                            onChange={e => setFormData({...formData, icon: e.target.value})}
                            className="bg-slate-950 border border-slate-700 p-2 rounded text-white"
                        />
                        <input 
                            placeholder="Description" 
                            value={formData.description || ''} 
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="bg-slate-950 border border-slate-700 p-2 rounded text-white"
                        />
                         <input 
                            placeholder="Color Class (text-cyan-400)" 
                            value={formData.color || ''} 
                            onChange={e => setFormData({...formData, color: e.target.value})}
                            className="bg-slate-950 border border-slate-700 p-2 rounded text-white"
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                         <button onClick={() => setEditingId(null)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                         <button onClick={handleSave} className="px-4 py-2 bg-cyan-500 text-black font-bold rounded">Initialize</button>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {categories.map(cat => (
                    <div key={cat.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-slate-600 transition-all">
                        {editingId === cat.id ? (
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mr-4">
                                <input 
                                    value={formData.title || ''} 
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    className="bg-slate-950 border border-slate-700 p-2 rounded text-white"
                                />
                                <input 
                                    value={formData.description || ''} 
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    className="bg-slate-950 border border-slate-700 p-2 rounded text-white"
                                />
                                {/* Add more fields as needed for edit */}
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${cat.bg}`}>
                                    <IconPreview name={cat.icon} />
                                </div>
                                <div>
                                    <h3 className={`font-bold ${cat.color}`}>{cat.title}</h3>
                                    <p className="text-xs text-slate-500">{cat.id} • {cat.description}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            {editingId === cat.id ? (
                                <>
                                    <button onClick={handleSave} className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded"><Save className="w-4 h-4" /></button>
                                    <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-800 rounded"><X className="w-4 h-4" /></button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => handleEdit(cat)} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded"><Trash2 className="w-4 h-4" /></button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
