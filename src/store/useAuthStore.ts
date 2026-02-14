/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, type User } from '../db/db';

interface AuthState {
    currentUser: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (userId: string) => Promise<boolean>;
    signup: (userId: string, nickname: string, role?: 'user' | 'admin') => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            currentUser: null,
            isAuthenticated: false,
            isAdmin: false,

            login: async (userId: string) => {
                try {
                    // Fetch user from API (which checks DB)
                    const res = await fetch(`/api/users/${userId}`);
                    if (res.ok) {
                        const rawUser = await res.json();
                        // Normalize keys (API returns lowercase from Postgres/Prisma)
                        const user: User = {
                            userId: rawUser.userid || rawUser.userId,
                            nickname: rawUser.nickname,
                            role: rawUser.role,
                            status: rawUser.status,
                            joinedAt: new Date(rawUser.joinedat || rawUser.joinedAt || Date.now())
                        };

                        if (user.status === 'suspended') {
                            throw new Error('USER_SUSPENDED');
                        }
                        // Sync to local DB for offline capability if needed
                        await db.users.put(user);

                        set({
                            currentUser: user,
                            isAuthenticated: true,
                            isAdmin: user.role === 'admin'
                        });
                        return true;
                    }
                    console.warn(`Neural Diagnostic: Profile not found for [${userId}]`);
                    return false;
                } catch (error) {
                    console.error("CRITICAL: Downlink failure during login protocol:", error);
                    throw error;
                }
            },

            signup: async (userId: string, nickname: string, role: 'user' | 'admin' = 'user') => {
                try {
                    const res = await fetch('/api/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, nickname, role })
                    });

                    if (res.ok) {
                        const rawUser = await res.json();
                        const newUser: User = {
                            userId: rawUser.userid || rawUser.userId,
                            nickname: rawUser.nickname,
                            role: rawUser.role,
                            status: rawUser.status,
                            joinedAt: new Date(rawUser.joinedat || rawUser.joinedAt || Date.now())
                        };

                        // Sync to local DB
                        await db.users.put(newUser);

                        set({
                            currentUser: newUser,
                            isAuthenticated: true,
                            isAdmin: role === 'admin'
                        });
                        return { success: true };
                    }
                    return { success: false, error: 'verification_failed' };
                } catch (error: any) {
                    console.error("CRITICAL: Signup protocol failed. Diagnostic data:", error);
                    return { success: false, error: error.message || 'connection_failure' };
                }
            },

            logout: () => {
                set({ currentUser: null, isAuthenticated: false, isAdmin: false });
            }
        }),
        {
            name: 'toeic-neural-auth',
        }
    )
);
