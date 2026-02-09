import React, { useState, useEffect } from 'react';
import { User, AlertTriangle, CheckCircle, Search } from 'lucide-react';

interface UserData {
    userId: string;
    nickname: string;
    role: 'user' | 'admin';
    status: 'active' | 'suspended';
    joinedAt: string;
}

export const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : data.data || []);
        } catch (e) {
            console.error("Failed to fetch users", e);
        }
    };

    const toggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            await fetch(`/api/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchUsers();
        } catch (e) {
            alert("Failed to update status");
        }
    };

    const filtered = users.filter(u => 
        u.nickname?.toLowerCase().includes(search.toLowerCase()) || 
        u.userId?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-brand text-cyan-400">AGENT ROSTER</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input 
                        placeholder="Search Agents..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10 p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 focus:border-cyan-500 outline-none w-64"
                    />
                </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800">
                <table className="w-full text-left">
                    <thead className="bg-slate-950 text-slate-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-4">Agent ID</th>
                            <th className="p-4">Nickname</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filtered.map(user => (
                            <tr key={user.userId} className="hover:bg-slate-800/30 transition-colors">
                                <td className="p-4 font-mono text-xs text-slate-400">{user.userId}</td>
                                <td className="p-4 font-bold text-white flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                        <User className="w-4 h-4 text-slate-400" />
                                    </div>
                                    {user.nickname}
                                </td>
                                <td className="p-4">
                                     <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-400'}`}>
                                        {user.role.toUpperCase()}
                                     </span>
                                </td>
                                <td className="p-4">
                                     <span className={`flex items-center gap-2 text-xs ${user.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {user.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                        {user.status?.toUpperCase() || 'UNKNOWN'}
                                     </span>
                                </td>
                                <td className="p-4 text-right">
                                    {user.role !== 'admin' && (
                                        <button 
                                            onClick={() => toggleStatus(user.userId, user.status)}
                                            className="text-xs hover:underline text-slate-500 hover:text-white"
                                        >
                                            {user.status === 'active' ? 'SUSPEND' : 'ACTIVATE'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="p-8 text-center text-slate-500">No agents found matching criteria.</div>}
            </div>
        </div>
    );
};
