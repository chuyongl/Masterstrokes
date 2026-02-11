import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
    completedLevels: string[];

    // Actions
    markLevelComplete: (levelId: string) => void;
    isLevelCompleted: (levelId: string) => boolean;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            completedLevels: [],

            markLevelComplete: (levelId) => set((state) => {
                if (state.completedLevels.includes(levelId)) return state;
                return { completedLevels: [...state.completedLevels, levelId] };
            }),

            isLevelCompleted: (levelId) => get().completedLevels.includes(levelId),
        }),
        {
            name: 'masterstrokes-user-storage', // unique name
        }
    )
);
