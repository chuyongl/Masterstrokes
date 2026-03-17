import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
    completedLevels: string[];
    // chapter progress: key = `${artworkId}::${chapterIndex}`, e.g. "book-of-dead-hunefer::0"
    completedChapters: string[];

    markLevelComplete: (levelId: string) => void;
    isLevelCompleted: (levelId: string) => boolean;

    markChapterComplete: (artworkId: string, chapterIndex: number) => void;
    isChapterCompleted: (artworkId: string, chapterIndex: number) => boolean;
    getCompletedChapterCount: (artworkId: string) => number;
}

const chapterKey = (artworkId: string, chapterIndex: number) =>
    `${artworkId}::${chapterIndex}`;

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            completedLevels: [],
            completedChapters: [],

            markLevelComplete: (levelId) => set((state) => {
                if (state.completedLevels.includes(levelId)) return state;
                return { completedLevels: [...state.completedLevels, levelId] };
            }),

            isLevelCompleted: (levelId) => get().completedLevels.includes(levelId),

            markChapterComplete: (artworkId, chapterIndex) => {
                const key = chapterKey(artworkId, chapterIndex);
                set((state) => {
                    if (state.completedChapters.includes(key)) return state;
                    return { completedChapters: [...state.completedChapters, key] };
                });
            },

            isChapterCompleted: (artworkId, chapterIndex) =>
                get().completedChapters.includes(chapterKey(artworkId, chapterIndex)),

            getCompletedChapterCount: (artworkId) =>
                get().completedChapters.filter(k => k.startsWith(`${artworkId}::`)).length,
        }),
        { name: 'masterstrokes-user-storage' }
    )
);
