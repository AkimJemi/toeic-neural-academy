import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Brain, LayoutDashboard, User, Settings, Layers } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import clsx from 'clsx';

export const Layout: React.FC = () => {
    const { isAuthenticated, isAdmin } = useAuthStore();

    const navItems = [
        { path: '/', icon: Brain, label: 'Study', exact: true },
        { path: '/flashcards', icon: Layers, label: 'Cards' },
        { path: '/analytics', icon: LayoutDashboard, label: 'Stats' },
    ];

    if (isAdmin) {
        navItems.push({ path: '/admin', icon: Settings, label: 'Admin' });
    }

    // Hide layout on specific routes like active Quiz if needed, but usually we keep it
    // The user requested bottom nav for mobile.

    return (
        <div className="min-h-screen text-white font-sans relative overflow-hidden flex flex-col">
             {/* Main Content Area */}
             <main className="flex-1 relative z-10 w-full overflow-y-auto overflow-x-hidden pt-20 pb-24 md:pt-24 md:pb-8">
                 <Outlet />
             </main>

             {/* WebGL Background is in App.tsx wrapping this, or we can put it here if we want per-page control.
                 For now, App.tsx handles the background opacity/state.
             */}

             {/* Desktop Navigation (Top-Right or Sidebar - let's go with minimal Top-Right for now as per design) */}
             <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-950/20 backdrop-blur-md border-b border-white/5 hidden md:flex items-center justify-between px-8 z-50">
                <div className="text-xl font-brand text-cyan-400 italic tracking-wider">
                    NEURAL<span className="text-white">ACADEMY</span>
                </div>
                <div className="flex items-center gap-8">
                    {navItems.map((item) => (
                        <NavLink 
                            key={item.path} 
                            to={item.path}
                            className={(navState) => clsx(
                                "flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-cyan-400 transition-colors",
                                navState.isActive ? "text-cyan-400" : "text-slate-500"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </NavLink>
                    ))}
                    {/* User Profile / Login status */}
                    <div className="w-px h-6 bg-slate-800" />
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono">
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
