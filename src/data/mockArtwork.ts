export interface Hotspot {
    id: string;
    label: string;
    clickArea: { x: number; y: number; radius: number }; // % coordinates
    highlightCircle: { x: number; y: number; radius: number }; // % coordinates
    tooltip: {
        text: string;
        position: 'top' | 'bottom' | 'left' | 'right';
    };
}

export interface QuizOption {
    id: string;
    imageUrl?: string;
    crop?: { x: number; y: number; zoom: number };
    filter?: string;
    isCorrect: boolean;
}

export interface QuizQuestion {
    id: string;
    learningPointId: string;
    questionText: string;
    whiteCircle: { x: number; y: number; radius: number }; // % coordinates
    overlayPosition: { x: number; y: number; width: number; height: number }; // % coordinates
    options: QuizOption[];
}

export interface Artwork {
    id: string;
    title: string;
    artist: string;
    imageUrl: string;
    learningPoints: Hotspot[];
    quizQuestions: QuizQuestion[];
}

// Mock data for "Girl with a Pearl Earring"
export const mockArtwork: Artwork = {
    id: 'girl-pearl-earring',
    title: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer',
    imageUrl: '/assets/girl-with-pearl-earring.svg',

    learningPoints: [
        {
            id: 'left-eye',
            label: 'Left Eye',
            clickArea: { x: 38, y: 35, radius: 5 },
            highlightCircle: { x: 38, y: 35, radius: 8 },
            tooltip: {
                text: 'The left eye is moister than the right eye, showing natural light effect',
                position: 'bottom'
            }
        },
        {
            id: 'ear-ring',
            label: 'Ear Ring',
            clickArea: { x: 50, y: 58, radius: 4 },
            highlightCircle: { x: 50, y: 58, radius: 6 },
            tooltip: {
                text: 'The ear ring is what make this painting famous',
                position: 'bottom'
            }
        },
        {
            id: 'head-band',
            label: 'Head Band',
            clickArea: { x: 50, y: 22, radius: 15 },
            highlightCircle: { x: 50, y: 22, radius: 25 },
            tooltip: {
                text: 'Head band color is blue and yellow opposite color',
                position: 'bottom'
            }
        }
    ],

    quizQuestions: [
        {
            id: 'q1',
            learningPointId: 'left-eye',
            questionText: 'Which is the correct left eye?',
            whiteCircle: { x: 38, y: 35, radius: 8 },
            overlayPosition: { x: 32, y: 30, width: 12, height: 10 },
            options: [
                { id: 'a', imageUrl: '/quiz/eye-1.svg', isCorrect: true },
                { id: 'b', imageUrl: '/quiz/eye-2.svg', isCorrect: false },
                { id: 'c', imageUrl: '/quiz/eye-3.svg', isCorrect: false },
                { id: 'd', imageUrl: '/quiz/eye-4.svg', isCorrect: false }
            ]
        },
        {
            id: 'q2',
            learningPointId: 'ear-ring',
            questionText: 'Which is the correct ear ring?',
            whiteCircle: { x: 50, y: 58, radius: 6 },
            overlayPosition: { x: 46, y: 54, width: 8, height: 8 },
            options: [
                { id: 'a', imageUrl: '/quiz/earring-1.svg', isCorrect: false },
                { id: 'b', imageUrl: '/quiz/earring-2.svg', isCorrect: true },
                { id: 'c', imageUrl: '/quiz/earring-3.svg', isCorrect: false },
                { id: 'd', imageUrl: '/quiz/earring-4.svg', isCorrect: false }
            ]
        },
        {
            id: 'q3',
            learningPointId: 'head-band',
            questionText: 'Which is the correct head band?',
            whiteCircle: { x: 50, y: 22, radius: 25 },
            overlayPosition: { x: 25, y: 10, width: 50, height: 24 },
            options: [
                { id: 'a', imageUrl: '/quiz/headband-1.svg', isCorrect: false },
                { id: 'b', imageUrl: '/quiz/headband-2.svg', isCorrect: false },
                { id: 'c', imageUrl: '/quiz/headband-3.svg', isCorrect: true },
                { id: 'd', imageUrl: '/quiz/headband-4.svg', isCorrect: false }
            ]
        }
    ]
};
