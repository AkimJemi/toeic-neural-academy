import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Brain, LayoutDashboard, User, Settings, Layers, Zap } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { UpgradeModal } from './UpgradeModal';
import clsx from 'clsx';

export const Layout: React.FC = () => {
    const { isAuthenticated, isAdmin, currentUser } = useAuthStore();
    const status = useSubscriptionStore((state) => state.status);
    const setup = useSubscriptionStore((state) => state.setup);
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated && currentUser) {
            setup(currentUser);
        }
    }, [isAuthenticated, currentUser, setup]);

    const navItems = [
        { path: '/', icon: Brain, label: 'Study', exact: true },
        { path: '/flashcards', icon: Layers, label: 'Cards' },
        { path: '/analytics', icon: LayoutDashboard, label: 'Stats' },
        ...(isAdmin ? [{ path: '/admin', icon: Settings, label: 'Admin' }] : [])
    ];

    return (
        <div className="min-h-screen text-white font-sans relative overflow-hidden flex flex-col">
             {/* Main Content Area */}
             <main className="flex-1 relative z-10 w-full overflow-y-auto overflow-x-hidden pt-20 pb-24 md:pt-24 md:pb-8">
                 <Outlet />
             </main>

             <UpgradeModal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} />

             {/* Desktop Navigation */}
             <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-950/20 backdrop-blur-md border-b border-white/5 hidden md:flex items-center justify-between px-8 z-50">
                <div className="text-xl font-brand text-cyan-400 italic tracking-wider">
                    NEURAL<span className="text-white">ACADEMY</span>
                </div>
                <div className="flex items-center gap-8">
                    {navItems.map((item) => (
                        <NavLink 
                            key={item.path} 
                            to={item.path}
                            className={({ isActive }) => clsx(
                                "flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-cyan-400 transition-colors",
                                isActive ? "text-cyan-400" : "text-slate-500"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </NavLink>
                    ))}
                    
                    <div className="w-px h-6 bg-slate-800" />
                    
                    {/* Upgrade Button */}
                    {status === 'free' && (
                        <button 
                            onClick={() => setUpgradeModalOpen(true)}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
                        >
                            <Zap className="w-3 h-3 fill-emerald-400" />
                            Upgrade
                        </button>
                    )}

                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono border border-slate-700">
                             {isAuthenticated ? <User className="w-4 h-4 text-emerald-400" /> : <NavLink to="/login" className="flex items-center justify-center w-full h-full text-slate-400 hover:text-cyan-400 transition-colors"><User className="w-4 h-4" /></NavLink>}
                         </div>
                    </div>
                </div>
             </nav>

             {/* Mobile Bottom Navigation */}
             <nav className="fixed bottom-0 left-0 right-0 h-20 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 md:hidden z-50 px-6 pb-2">
                 <div className="h-full flex items-center justify-between max-w-sm mx-auto">
                    {navItems.map((item) => (
                        <NavLink 
                            key={item.path} 
                            to={item.path}
                            className={({ isActive }) => clsx(
                                "flex flex-col items-center justify-center w-16 h-full gap-1 transition-all",
                                isActive ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={clsx(
                                        "p-1.5 rounded-full transition-all",
                                        isActive ? "bg-cyan-950/50" : "bg-transparent"
                                    )}>
                                        <item.icon className={clsx("w-6 h-6", isActive && "fill-cyan-400/20")} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                 </div>
             </nav>
        </div>
    );
};
