import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Shield, User, ArrowRight, Activity, ChevronLeft } from 'lucide-react';

export const Login: React.FC = () => {
    const { login, signup } = useAuthStore();
    const navigate = useNavigate();
    
    const [isLogin, setIsLogin] = useState(true);
    const [userId, setUserId] = useState('');
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const success = await login(userId);
                if (success) {
                    navigate('/'); // Root/Dashboard
                } else {
                    setError('Start Failed: Agent ID Not Found');
                }
            } else {
                const result = await signup(userId, nickname);
                if (result.success) {
                    navigate('/'); 
                } else {
                    setError('Registration Failed: ' + result.error);
                }
            }
        } catch (err: any) {
            setError('System Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-slate-950 min-h-screen items-center justify-center p-4 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl p-8 shadow-2xl backdrop-blur-sm z-10">
                <div className="absolute top-4 left-4">
                     <button 
                        onClick={() => navigate('/')} 
                        className="text-slate-500 hover:text-cyan-400 transition-colors p-2 flex items-center gap-1 group"
                     >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-mono uppercase tracking-widest hidden sm:inline">Return to Base</span>
                     </button>
                </div>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 mb-4 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                        <Shield className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h1 className="text-2xl font-brand text-white tracking-widest">NEURAL IDENTITY</h1>
                    <p className="text-slate-500 text-xs font-mono uppercase mt-2">Authentication Protocol v9.2</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono text-cyan-400 uppercase mb-1 ml-1">Agent ID</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                <input 
                                    type="text" 
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono"
                                    placeholder="ENTER-ID-CODE"
                                    required
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                                <label className="block text-xs font-mono text-cyan-400 uppercase mb-1 ml-1">Codename</label>
                                <div className="relative">
                                    <Activity className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                    <input 
                                        type="text" 
                                        value={nickname}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono"
                                        placeholder="Display Name"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-lg text-rose-400 text-xs font-mono flex items-center gap-2">
                           <Activity className="w-3 h-3" /> {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'PROCESSING...' : (isLogin ? 'INITIALIZE LINK' : 'CREATE PROFILE')}
                        {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-slate-500 text-sm hover:text-cyan-400 transition-colors"
                    >
                        {isLogin ? (
                            <span>New Agent? <span className="text-cyan-400 underline decoration-dotted underline-offset-4">Register Protocol</span></span>
                        ) : (
                            <span>Existing Agent? <span className="text-cyan-400 underline decoration-dotted underline-offset-4">Identify</span></span>
                        )}
                    </button>
                </div>
            </div>
            
            <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-slate-600 font-mono">
                SECURE CONNECTION // ENCRYPTION: AES-256 // NEURAL NET: ACTIVE
            </div>
        </div>
    );
};
