export interface Hotspot {
    id: string;
    label: string;
    pointType: 'general' | 'specific';
    categoryTag?: string;
    clickArea: {
        x: number; y: number; radius: number;
        rect?: { x: number; y: number; w: number; h: number };
        rects?: { x: number; y: number; w: number; h: number }[];  // multi-rect support
    };
    highlightCircle: {
        x: number; y: number; radius: number;
        rect?: { x: number; y: number; w: number; h: number };
        rects?: { x: number; y: number; w: number; h: number }[];
    };
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

export interface QuizRegion {
    id: string;
    point_id: string;
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface Artwork {
    id: string;
    title: string;
    artist: string;
    imageUrl: string;
    era: string;
    learningPoints: Hotspot[];
    quizQuestions: QuizQuestion[];
    quizRegions?: QuizRegion[];
}

// No mock data - types only
