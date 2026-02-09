export type Language = 'ja' | 'en' | 'zh' | 'ko';

export interface Question {
    id: number;
    category: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    translations?: {
        [key: string]: {
            question: string;
            options: string[];
            explanation: string;
            category?: string;
        }
    };
    source?: string;
    isBookmarked?: boolean; // For local state
}

export interface QuizState {
    questions: Question[];
    currentQuestionIndex: number;
    score: number;
    showResults: boolean;
    answers: (number | undefined)[]; // Index of selected answers
    setAnswer: (questionIndex: number, answerIndex: number) => void;
    nextQuestion: () => void;
    prevQuestion: () => void;
    resetQuiz: () => void;
}

export interface User {
    userId: string;
    nickname: string;
    role: 'user' | 'admin';
    status?: 'active' | 'suspended';
    joinedAt: Date;
}

export interface Category {
    id: string; // e.g. 'Part 1'
    title: string; // e.g. 'Part 1: Photographs'
    icon: string; // Lucide icon name
    color: string;
    bg: string;
    description: string;
    displayOrder: number;
}
