import { create } from 'zustand';

interface PanPosition {
    x: number;
    y: number;
}

interface OverlaidImage {
    questionId: string;
    imageUrl?: string;
    crop?: { x: number; y: number; zoom: number };
    position: { x: number; y: number; width: number; height: number };
}

interface GameStore {
    // Learning phase
    viewMode: 'overview' | 'exploration';
    foundHotspots: string[];
    activeTooltip: string | null;
    panPosition: PanPosition;

    // Quiz phase
    currentQuestionIndex: number;
    userAnswers: Map<string, string>; // questionId -> optionId
    overlaidImages: OverlaidImage[];

    // Game phase
    gamePhase: 'learning' | 'quiz' | 'results';
    startTime: number | null;
    endTime: number | null;

    // Actions
    setViewMode: (mode: 'overview' | 'exploration') => void;
    markHotspotFound: (id: string) => void;
    setActiveTooltip: (id: string | null) => void;
    updatePan: (x: number, y: number) => void;

    submitAnswer: (
        questionId: string,
        optionId: string,
        imageUrl: string | undefined,
        crop: { x: number; y: number; zoom: number } | undefined,
        position: { x: number; y: number; width: number; height: number }
    ) => void;
    nextQuestion: () => void;

    setGamePhase: (phase: 'learning' | 'quiz' | 'results') => void;
    startGame: () => void;
    resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
    // Initial state
    viewMode: 'overview',
    foundHotspots: [],
    activeTooltip: null,
    panPosition: { x: 0, y: 0 },

    currentQuestionIndex: 0,
    userAnswers: new Map(),
    overlaidImages: [],

    gamePhase: 'learning',
    startTime: null,
    endTime: null,

    // Actions
    setViewMode: (mode) => set({ viewMode: mode }),

    markHotspotFound: (id) => set((state) => ({
        foundHotspots: [...state.foundHotspots, id]
    })),

    setActiveTooltip: (id) => set({ activeTooltip: id }),

    updatePan: (x, y) => set({ panPosition: { x, y } }),

    submitAnswer: (questionId, optionId, imageUrl, crop, position) => set((state) => {
        const newAnswers = new Map(state.userAnswers);
        newAnswers.set(questionId, optionId);

        return {
            userAnswers: newAnswers,
            overlaidImages: [
                ...state.overlaidImages,
                { questionId, imageUrl, crop, position }
            ]
        };
    }),

    nextQuestion: () => set((state) => ({
        currentQuestionIndex: state.currentQuestionIndex + 1
    })),

    setGamePhase: (phase) => set({ gamePhase: phase }),

    startGame: () => set({
        startTime: Date.now(),
        gamePhase: 'learning'
    }),

    resetGame: () => set({
        viewMode: 'overview',
        foundHotspots: [],
        activeTooltip: null,
        panPosition: { x: 0, y: 0 },
        currentQuestionIndex: 0,
        userAnswers: new Map(),
        overlaidImages: [],
        gamePhase: 'learning',
        startTime: null,
        endTime: null
    })
}));
