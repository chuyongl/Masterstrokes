

// const GOOGLE_APP_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;

export interface LevelData {
    id: string;
    artworkUrl: string;
    artist: string;
    title: string;
    year: string;
    hotspots: Hotspot[];
    questions: Question[];
}

export interface Hotspot {
    id: string;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    label: string;
    description: string;
}

export interface Question {
    id: string;
    text: string;
    options: {
        id: string;
        imageUrl?: string; // Optional now
        crop?: { x: number; y: number; zoom: number }; // Dynamic crop
        filter?: string;
        isCorrect: boolean;
    }[];
}

// Mock Data
const MOCK_LEVEL: LevelData = {
    id: '1',
    artworkUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg',
    artist: 'Johannes Vermeer',
    title: 'Girl with a Pearl Earring',
    year: '1665',
    hotspots: [
        { id: 'h1', x: 42, y: 45, label: 'Earring', description: 'The focal point, a large pearl earring.' },
        { id: 'h2', x: 55, y: 35, label: 'Eyes', description: 'Her gaze is direct and enigmatic.' },
        { id: 'h3', x: 50, y: 20, label: 'Turban', description: 'Update explanation about the exotic turban.' },
    ],
    questions: [
        {
            id: 'q1',
            text: 'Which earring fits the painting?',
            options: [
                { id: 'opt1', imageUrl: 'https://placeholder.com/earring-correct.png', isCorrect: true },
                { id: 'opt2', imageUrl: 'https://placeholder.com/earring-wrong.png', isCorrect: false },
                { id: 'opt3', imageUrl: 'https://placeholder.com/earring-wrong2.png', isCorrect: false },
                { id: 'opt4', imageUrl: 'https://placeholder.com/earring-wrong3.png', isCorrect: false },
            ]
        }
    ]
};

export const api = {
    fetchLevels: async (): Promise<LevelData[]> => {
        // In real app, fetch from Google Script
        return new Promise((resolve) => setTimeout(() => resolve([MOCK_LEVEL]), 500));
    },

    fetchLevelById: async (_id: string): Promise<LevelData | null> => {
        return new Promise((resolve) => setTimeout(() => resolve(MOCK_LEVEL), 500));
    },

    submitScore: async (userId: string, stats: any) => {
        console.log('Submitting score for', userId, stats);
        // Post to Google Script
    }
};
