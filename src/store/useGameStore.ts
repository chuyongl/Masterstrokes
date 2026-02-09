import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LevelData } from '../services/api';

interface UserState {
    userId: string | null;
    selectedEraId: string | null; // User must select an Era during onboarding/register
    streak: number;
    gold: number;
    energy: number;
    maxEnergy: number;
    setUserId: (id: string) => void;
    setSelectedEraId: (id: string) => void;
    updateStats: (stats: Partial<UserState>) => void;
}

interface GameSessionState {
    currentLevel: LevelData | null;
    phase: 'learning' | 'quiz' | 'result';
    visitedHotspots: string[];
    selectedAnswers: Record<string, string>; // questionId -> optionId
    score: number;
    startTime: number | null;

    startLevel: (level: LevelData) => void;
    visitHotspot: (hotspotId: string) => void;
    selectAnswer: (questionId: string, optionId: string) => void;
    submitQuiz: () => void;
    resetLevel: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            userId: null,
            selectedEraId: null,
            streak: 0,
            gold: 0,
            energy: 5,
            maxEnergy: 5,
            setUserId: (id) => set({ userId: id }),
            setSelectedEraId: (id) => set({ selectedEraId: id }),
            updateStats: (stats) => set((state) => ({ ...state, ...stats })),
        }),
        { name: 'user-storage' }
    )
);

export const useGameStore = create<GameSessionState>((set, get) => ({
    currentLevel: null,
    phase: 'learning',
    visitedHotspots: [],
    selectedAnswers: {},
    score: 0,
    startTime: null,

    startLevel: (level) => set({
        currentLevel: level,
        phase: 'learning',
        visitedHotspots: [],
        selectedAnswers: {},
        score: 0,
        startTime: Date.now(),
    }),

    visitHotspot: (hotspotId) => set((state) => ({
        visitedHotspots: state.visitedHotspots.includes(hotspotId)
            ? state.visitedHotspots
            : [...state.visitedHotspots, hotspotId]
    })),

    selectAnswer: (questionId, optionId) => set((state) => ({
        selectedAnswers: { ...state.selectedAnswers, [questionId]: optionId }
    })),

    submitQuiz: () => {
        const state = get();
        if (!state.currentLevel) return;

        let correctCount = 0;
        state.currentLevel.questions.forEach(q => {
            const selected = state.selectedAnswers[q.id];
            const correctOption = q.options.find(o => o.isCorrect);
            if (selected === correctOption?.id) correctCount++;
        });

        set({ phase: 'result', score: correctCount });
    },

    resetLevel: () => set({
        phase: 'learning',
        visitedHotspots: [],
        selectedAnswers: {},
        score: 0,
        startTime: Date.now(),
    })
}));
