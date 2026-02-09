import { create } from 'zustand';
import type { QuizState } from '../types';
import { db } from '../db/db';
import { useAuthStore } from './useAuthStore';
import { normalizeKeys } from '../utils/normalize';

interface ExtendedQuizState extends QuizState {
    isActive: boolean;
    startQuiz: (category: string) => Promise<{ success: boolean; error?: string }>;
    endQuiz: () => void;
    saveProgress: (finalScore?: number) => Promise<void>;
}

export const useQuizStore = create<ExtendedQuizState>((set, get) => ({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    showResults: false,
    answers: [],
    isActive: false,

    startQuiz: async (category: string) => {
        try {
            const res = await fetch('/api/questions?category=' + (category === 'All' ? '' : category));
            if (!res.ok) throw new Error('Failed to fetch questions');
            const data = await res.json();
            // Handle pagination if API wrapper returns { data, pagination }
            const questions = Array.isArray(data) ? data : data.data;

            if (!questions || questions.length === 0) {
                return { success: false, error: 'SECTOR_EMPTY: No data available for this category.' };
            }

            // Check for existing session (Optional: restore session logic here)
            // For now, fresh start
            set({
                questions: normalizeKeys(questions),
                currentQuestionIndex: 0,
                score: 0,
                showResults: false,
                answers: [],
                isActive: true,
            });
            return { success: true };
        } catch (error) {
            console.error("[Neural Store] Failed to start quiz:", error);
            return { success: false, error: 'CONNECTION_ERROR: Failed to initialize Neural Link.' };
        }
    },

    setAnswer: (qIndex, aIndex) => {
        set((state) => {
            const newAnswers = [...state.answers];
            newAnswers[qIndex] = aIndex;
            return { answers: newAnswers };
        });
    },

    nextQuestion: () => {
        const state = get();
        if (state.currentQuestionIndex < state.questions.length - 1) {
            set({ currentQuestionIndex: state.currentQuestionIndex + 1 });
        } else {
            // Finish
            let score = 0;
            state.answers.forEach((ans, idx) => {
                if (ans === state.questions[idx].correctAnswer) {
                    score++;
                }
            });

            const finalize = async () => {
                await get().saveProgress(score);
                set({ showResults: true, score, isActive: false });
            };
            finalize();
        }
    },

    prevQuestion: () => {
        const state = get();
        if (state.currentQuestionIndex > 0) {
            set({ currentQuestionIndex: state.currentQuestionIndex - 1 });
        }
    },

    saveProgress: async (finalScore?: number) => {
        const state = get();
        const { questions, answers, score } = state;
        const scoreToPersist = finalScore !== undefined ? finalScore : score;

        const wrongQuestionIds: number[] = [];
        const userAnswers: { [id: number]: number } = {};

        questions.forEach((q, idx) => {
            if (answers[idx] !== undefined) {
                userAnswers[q.id] = answers[idx];
                if (answers[idx] !== q.correctAnswer) {
                    wrongQuestionIds.push(q.id);
                }
            }
        });

        try {
            const currentUser = useAuthStore.getState().currentUser;
            if (!currentUser) return;

            await db.attempts.add({
                userId: currentUser.userId,
                date: new Date(),
                score: scoreToPersist,
                totalQuestions: questions.length,
                category: questions[0]?.category || 'All',
                wrongQuestionIds,
                userAnswers
            });
        } catch (err) {
            console.error("[Neural Store] Save failed:", err);
        }
    },

    endQuiz: () => {
        set({ isActive: false, showResults: false });
    },

    resetQuiz: () => {
        set({
            currentQuestionIndex: 0,
            score: 0,
            showResults: false,
            answers: [],
            isActive: true
        });
    }
}));
