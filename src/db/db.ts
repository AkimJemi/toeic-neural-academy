/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Dexie, { type Table } from 'dexie';


export interface User {
    userId: string;            // Primary key - login ID
    nickname: string;          // Display name
    role: 'user' | 'admin';
    status?: 'active' | 'suspended';
    joinedAt: Date;
}

export interface QuizAttempt {
    id?: number;
    userId: string;            // Foreign key to users.userId
    date: Date;
    score: number;
    totalQuestions: number;
    category: string;
    wrongQuestionIds: number[];
    userAnswers: { [questionId: number]: number };
}

export interface QuizSession {
    userId: string;            // Foreign key to users.userId
    category: string;
    currentQuestionIndex: number;
    answers: (number | undefined)[];
    lastUpdated: Date;
}

export interface Category {
    id: string; // Internal ID like 'Part 1'
    title: string; // Display title like 'Part 1: Photographs'
    icon: string; // Lucide icon name
    color: string; // CSS color class
    bg: string; // CSS background class
    description: string;
    displayOrder: number;
}

// Wrapper to handle both Local (Dexie) and Remote (Postgres API) operations
class NeuralDatabase extends Dexie {
    users!: Table<User>;
    attempts!: Table<QuizAttempt>;
    sessions!: Table<QuizSession>;

    constructor() {
        super('TOEICNeuralDB');
        this.version(1).stores({
            users: 'userId, role',
            attempts: '++id, userId, category, date',
            sessions: '[userId+category], userId, lastUpdated'
        });
    }
}

// Internal Local DB instance
const localDB = new NeuralDatabase();

// API Helper
const api = {
    get: async (endpoint: string) => {
        const res = await fetch(`/api${endpoint}`);
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return await res.json();
    },
    post: async (endpoint: string, data: any) => {
        const res = await fetch(`/api${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return await res.json();
    },
    patch: async (endpoint: string, data: any) => {
        const res = await fetch(`/api${endpoint}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return await res.json();
    },
    delete: async (endpoint: string) => {
        const res = await fetch(`/api${endpoint}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    }
};

// Hybrid Accessor (Reads from API/Cache, Writes to both if needed)
export const db = {
    users: {
        get: async (userId: string) => {
            try {
                // Try API first for latest authority
                const user = await api.get(`/users/${userId}`);
                await localDB.users.put(user); // Cache
                return user;
            } catch (e) {
                console.warn("Offline/API Error, falling back to local cache", e);
                return await localDB.users.get(userId);
            }
        },
        add: async (user: User) => {
            await api.post('/users', user);
            return await localDB.users.add(user);
        },
        startSession: async (userId: string) => {
            // Check if exists locally
            const local = await localDB.users.get(userId);
            if (local) return local;
            // If not, fetch from API
            try {
                const remote = await api.get(`/users/${userId}`);
                if (remote) {
                    await localDB.users.put(remote);
                    return remote;
                }
            } catch (e) {
                return null;
            }
            return null;
        },
        put: async (user: User) => {
            return await localDB.users.put(user);
        }
    },
    attempts: {
        add: async (attempt: QuizAttempt) => {
            // Save locally immediately
            const id = await localDB.attempts.add(attempt);
            // Sync to background (fire and forget or queue)
            // Note: In a full PWA we would use a Service Worker sync queue
            try {
                await api.post('/submit-question', { ...attempt, type: 'attempt_sync_placeholder' });
                // Note: The actual API for attempts isn't fully exposed in the provided server snippet solely for attempts, 
                // but we will simulate successful sync or add specific endpoint if needed.
                // For now, let's assume local storage is primary for history until we add full sync.
                console.log("Attempt saved locally", id);
            } catch (e) {
                console.warn("Failed to sync attempt to server", e);
            }
            return id;
        },
        where: (field: string) => localDB.attempts.where(field)
    },
    sessions: localDB.sessions, // Sessions are ephemeral and local-first usually
    categories: {
        toArray: async () => {
            // Always fetch from server to get latest structure
            try {
                return await api.get('/categories');
            } catch (e) {
                console.error("Failed to load categories", e);
                return [];
            }
        }
    }
};
