/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, User, Layers, MessageSquare, FileText, Activity, CheckCircle } from 'lucide-react';
import { AdminUsers } from './AdminUsers';
import { AdminCategories } from './AdminCategories';
import { AdminSubmissions } from './AdminSubmissions';
import { AdminMessages } from './AdminMessages';
import { AdminTodos } from './AdminTodos';

export const AdminDashboard: React.FC = () => {
    const { currentUser, logout } = useAuthStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    
    const setActiveTab = (tab: string) => {
        setSearchParams({ tab });
    };

    const [stats, setStats] = useState({ users: 0, pending: 0, messages: 0 });

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                const data = await res.json();
                setStats({
                    users: data.totalUsers || 0,
                    pending: data.pendingSubmissions || 0,
                    messages: data.unreadMessages || 0
                });
            } catch (e) {
                console.error("Failed to fetch admin stats", e);
            }
        };
        fetchStats();
    }, []);

    if (!currentUser || currentUser.role !== 'admin') {
         return <div className="p-8 text-center text-rose-500 font-brand text-2xl">ACCESS DENIED</div>;
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'users', label: 'Agents', icon: User },
        { id: 'categories', label: 'Sectors', icon: Layers },
        { id: 'submissions', label: 'Intel', icon: FileText, badge: stats.pending },
        { id: 'messages', label: 'Signals', icon: MessageSquare, badge: stats.messages },
        { id: 'todos', label: 'Directives', icon: CheckCircle },
    ];

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-80px)]">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-brand text-indigo-400 tracking-tight">COMMAND CENTER</h1>
                    <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-1">
                        System Admin: {currentUser.nickname}
                    </p>
                </div>
                <button 
                    onClick={logout}
                    className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/50 text-rose-400 hover:bg-rose-500/20 text-sm font-bold transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    DISCONNECT
                </button>
            </header>

            {/* Scrollable Navigation */}
            <div className="mb-8 border-b border-slate-800 overflow-x-auto">
                <div className="flex gap-1 min-w-max pb-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold transition-all border-t border-x relative ${
                                activeTab === tab.id 
                                    ? 'bg-slate-900 border-slate-700 text-cyan-400 mb-[-1px] z-10' 
                                    : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/30'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {tab.badge ? (
                                <span className="ml-1 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] rounded-full">
                                    {tab.badge}
                                </span>
                            ) : null}
                            {activeTab === tab.id && (
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <DashboardCard 
                                title="ACTIVE AGENTS" 
                                value={stats.users} 
                                icon={User} 
                                color="text-cyan-400" 
                                bg="bg-cyan-950/30"
                            />
                            <DashboardCard 
                                title="PENDING INTEL" 
                                value={stats.pending} 
                                icon={FileText} 
                                color="text-amber-400" 
                                bg="bg-amber-950/30"
                                onClick={() => setActiveTab('submissions')}
                            />
                            <DashboardCard 
                                title="UNREAD SIGNALS" 
                                value={stats.messages} 
                                icon={MessageSquare} 
                                color="text-emerald-400" 
                                bg="bg-emerald-950/30"
                                onClick={() => setActiveTab('messages')}
                            />
                        </div>

                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                            <h2 className="text-xl font-brand text-slate-400 mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5" /> SYSTEM METRICS
                            </h2>
                            <div className="text-slate-500 font-mono text-sm space-y-2">
                                <p>[SYSTEM] Neural Link Operational.</p>
                                <p>[SYSTEM] Database Connection: STABLE (PostgreSQL/Oregon).</p>
                                <p>[SYSTEM] Last Sync: {new Date().toLocaleTimeString()}</p>
                                <p>[Security] Encryption Level: AES-256 (Simulated).</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && <AdminUsers />}
                {activeTab === 'categories' && <AdminCategories />}
                { activeTab === 'submissions' && <AdminSubmissions /> }
                { activeTab === 'messages' && <AdminMessages /> }
                { activeTab === 'todos' && <AdminTodos /> }
            </div>
        </div>
    );
};

const DashboardCard: React.FC<{ title: string, value: number, icon: any, color: string, bg: string, onClick?: () => void }> = ({ title, value, icon: Icon, color, bg, onClick }) => {
    return (
        <button 
            onClick={onClick}
            disabled={!onClick}
            className={`w-full text-left p-6 rounded-2xl border border-white/5 ${bg} backdrop-blur-sm relative overflow-hidden group transition-transform hover:scale-[1.02] active:scale-[0.98] ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
        >
             <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Icon className="w-24 h-24" />
             </div>
             <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-2">{title}</h3>
             <div className={`text-4xl font-bold font-brand ${color}`}>{value}</div>
        </button>
    );
};
