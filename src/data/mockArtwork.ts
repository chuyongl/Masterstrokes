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
    era: string;
    learningPoints: Hotspot[];
    quizQuestions: QuizQuestion[];
}

// Mock Data for Dutch Golden Age Curriculum

export const MOCK_DUTCH_GOLDEN_AGE_ARTWORKS: Artwork[] = [
    // Session 1: Face of the Republic
    {
        id: 'night-watch',
        title: 'The Night Watch',
        artist: 'Rembrandt van Rijn',
        imageUrl: '/artworks/night-watch.jpg',
        era: 'dutch-golden-age',
        learningPoints: [
            {
                id: 'nw-main',
                label: 'The Captain',
                clickArea: { x: 50, y: 50, radius: 15 },
                highlightCircle: { x: 50, y: 50, radius: 15 },
                tooltip: { text: 'Captain Frans Banning Cocq leading the company.', position: 'bottom' }
            }
        ],
        quizQuestions: [
            {
                id: 'nw-q1',
                learningPointId: 'nw-main',
                questionText: 'Which figure represents the leadership and forward movement of the group?',
                whiteCircle: { x: 50, y: 50, radius: 15 },
                overlayPosition: { x: 45, y: 45, width: 10, height: 10 },
                options: [
                    { id: 'a', isCorrect: true }, // Correct (Captain)
                    { id: 'b', isCorrect: false },
                    { id: 'c', isCorrect: false },
                    { id: 'd', isCorrect: false }
                ]
            }
        ]
    },
    {
        id: 'laughing-cavalier',
        title: 'The Laughing Cavalier',
        artist: 'Frans Hals',
        imageUrl: '/artworks/laughing-cavalier.jpg',
        era: 'dutch-golden-age',
        learningPoints: [
            {
                id: 'lc-sleeve',
                label: 'Embroidered Sleeve',
                clickArea: { x: 70, y: 65, radius: 15 },
                highlightCircle: { x: 70, y: 65, radius: 15 },
                tooltip: { text: 'Symbols of love and fortune (bees, arrows, flames).', position: 'left' }
            }
        ],
        quizQuestions: [
            {
                id: 'lc-q1',
                learningPointId: 'lc-sleeve',
                questionText: 'Find the detail that reveals symbols of love and fortune.',
                whiteCircle: { x: 50, y: 50, radius: 15 },
                overlayPosition: { x: 45, y: 45, width: 10, height: 10 },
                options: [{ id: 'a', isCorrect: true }, { id: 'b', isCorrect: false }, { id: 'c', isCorrect: false }]
            }
        ]
    },
    {
        id: 'girl-pearl-earring',
        title: 'Girl with a Pearl Earring',
        artist: 'Johannes Vermeer',
        imageUrl: '/artworks/girl-pearl-earring.jpg',
        era: 'dutch-golden-age',
        learningPoints: [
            {
                id: 'gpe-earring',
                label: 'The Pearl',
                clickArea: { x: 50, y: 58, radius: 5 },
                highlightCircle: { x: 50, y: 58, radius: 8 },
                tooltip: { text: 'The focal point that catches the light.', position: 'bottom' }
            }
        ],
        quizQuestions: [
            {
                id: 'gpe-q1',
                learningPointId: 'gpe-earring',
                questionText: 'Find the focal point that catches the light immediately.',
                whiteCircle: { x: 50, y: 58, radius: 8 },
                overlayPosition: { x: 45, y: 53, width: 10, height: 10 },
                options: [{ id: 'a', isCorrect: true }, { id: 'b', isCorrect: false }, { id: 'c', isCorrect: false }]
            }
        ]
    },

    // Session 2: Life in Detail
    {
        id: 'the-milkmaid',
        title: 'The Milkmaid',
        artist: 'Johannes Vermeer',
        imageUrl: '/artworks/the-milkmaid.jpg',
        era: 'dutch-golden-age',
        learningPoints: [
            {
                id: 'tm-bread',
                label: 'Bread & Milk',
                clickArea: { x: 50, y: 50, radius: 15 },
                highlightCircle: { x: 50, y: 50, radius: 15 },
                tooltip: { text: "Vermeer's mastery of light and texture.", position: 'bottom' }
            }
        ],
        quizQuestions: [
            {
                id: 'tm-q1',
                learningPointId: 'tm-bread',
                questionText: "Find the area that best demonstrates Vermeer's mastery of realistic texture.",
                whiteCircle: { x: 50, y: 50, radius: 15 },
                overlayPosition: { x: 45, y: 45, width: 10, height: 10 },
                options: [{ id: 'a', isCorrect: true }, { id: 'b', isCorrect: false }, { id: 'c', isCorrect: false }]
            }
        ]
    },
    // Session 2: Life in Detail (continued)
    {
        id: 'merry-family',
        title: 'The Merry Family',
        artist: 'Jan Steen',
        imageUrl: '/artworks/merry-family.jpg',
        era: 'dutch-golden-age',
        learningPoints: [{ id: 'mf-chaos', label: 'Noisy Children', clickArea: { x: 50, y: 50, radius: 15 }, highlightCircle: { x: 50, y: 50, radius: 20 }, tooltip: { text: 'Chaotic "Jan Steen household".', position: 'bottom' } }],
        quizQuestions: [{ id: 'mf-q1', learningPointId: 'mf-chaos', questionText: 'Tap the element that most contributes to the "chaotic" noise.', whiteCircle: { x: 50, y: 50, radius: 15 }, overlayPosition: { x: 45, y: 45, width: 10, height: 10 }, options: [{ id: 'a', isCorrect: true }, { id: 'b', isCorrect: false }] }]
    },
    {
        id: 'courtyard-delft',
        title: 'Courtyard of a House in Delft',
        artist: 'Pieter de Hooch',
        imageUrl: '/artworks/courtyard-delft.jpg',
        era: 'dutch-golden-age',
        learningPoints: [{ id: 'cd-archway', label: 'The Archway', clickArea: { x: 50, y: 50, radius: 15 }, highlightCircle: { x: 50, y: 50, radius: 15 }, tooltip: { text: 'A "doorkijkje" creating depth.', position: 'bottom' } }],
        quizQuestions: [{ id: 'cd-q1', learningPointId: 'cd-archway', questionText: 'Tap the feature that creates deep perspective.', whiteCircle: { x: 50, y: 50, radius: 15 }, overlayPosition: { x: 45, y: 45, width: 10, height: 10 }, options: [{ id: 'a', isCorrect: true }, { id: 'b', isCorrect: false }] }]
    },

    // Session 3: The World Around Us
    {
        id: 'view-of-delft',
        title: 'View of Delft',
        artist: 'Johannes Vermeer',
        imageUrl: '/artworks/view-of-delft.jpg',
        era: 'dutch-golden-age',
        learningPoints: [{ id: 'vod-sunlight', label: 'Sunlit Church', clickArea: { x: 50, y: 50, radius: 15 }, highlightCircle: { x: 50, y: 50, radius: 15 }, tooltip: { text: 'Sunlight breaking through clouds.', position: 'bottom' } }],
        quizQuestions: [{ id: 'vod-q1', learningPointId: 'vod-sunlight', questionText: 'Find where sunlight highlights the city.', whiteCircle: { x: 50, y: 50, radius: 15 }, overlayPosition: { x: 45, y: 45, width: 10, height: 10 }, options: [{ id: 'a', isCorrect: true }, { id: 'b', isCorrect: false }] }]
    },
    {
        id: 'windmill-wijk',
        title: 'The Windmill at Wijk bij Duurstede',
        artist: 'Jacob van Ruisdael',
        imageUrl: '/artworks/windmill-wijk.jpg',
        era: 'dutch-golden-age',
        learningPoints: [{ id: 'ww-mill', label: 'The Windmill', clickArea: { x: 50, y: 50, radius: 20 }, highlightCircle: { x: 50, y: 50, radius: 20 }, tooltip: { text: 'Symbol of Dutch engineering.', position: 'bottom' } }],
        quizQuestions: [{ id: 'ww-q1', learningPointId: 'ww-mill', questionText: 'Identify the symbol of Dutch resilience.', whiteCircle: { x: 50, y: 50, radius: 20 }, overlayPosition: { x: 40, y: 40, width: 20, height: 20 }, options: [{ id: 'a', isCorrect: true }, { id: 'b', isCorrect: false }] }]
    },
    {
        id: 'avenue-middelharnis',
        title: 'The Avenue at Middelharnis',
        artist: 'Meindert Hobbema',
        imageUrl: '/artworks/avenue-middelharnis.jpg',
        era: 'dutch-golden-age',
        learningPoints: [{ id: 'am-vanishing', label: 'Vanishing Point', clickArea: { x: 50, y: 50, radius: 10 }, highlightCircle: { x: 50, y: 50, radius: 10 }, tooltip: { text: 'Where road lines converge.', position: 'bottom' } }],
        quizQuestions: [{ id: 'am-q1', learningPointId: 'am-vanishing', questionText: 'Tap the exact point where lines converge.', whiteCircle: { x: 50, y: 50, radius: 10 }, overlayPosition: { x: 45, y: 45, width: 10, height: 10 }, options: [{ id: 'a', isCorrect: true }, { id: 'b', isCorrect: false }] }]
    },

    // Session 4: Silent Beauty
    {
        id: 'still-life-cheeses',
        title: 'Still Life with Cheeses',
        artist: 'Clara Peeters',
        imageUrl: '/artworks/still-life-cheeses.jpg',
        era: 'dutch-golden-age',
        learningPoints: [{ id: 'slc-reflection', label: 'Self-Portrait', clickArea: { x: 50, y: 50, radius: 8 }, highlightCircle: { x: 50, y: 50, radius: 8 }, tooltip: { text: 'Reflection in the lid.', position: 'bottom' } }],
        quizQuestions: [{ id: 'slc-q1', learningPointId: 'slc-reflection', questionText: 'Find where the artist hid her self-portrait.', whiteCircle: { x: 50, y: 50, radius: 8 }, overlayPosition: { x: 46, y: 46, width: 8, height: 8 }, options: [{ id: 'a', isCorrect: true }, { id: 'b', isCorrect: false }] }]
    },
    {
        id: 'vanitas-violin',
        title: 'Vanitas with Violin',
        artist: 'Pieter Claesz',
        imageUrl: '/artworks/vanitas-violin.jpg',
        era: 'dutch-golden-age',
        learningPoints: [{ id: 'vv-skull', label: 'The Skull', clickArea: { x: 50, y: 50, radius: 15 }, highlightCircle: { x: 50, y: 50, radius: 15 }, tooltip: { text: 'Memento Mori.', position: 'bottom' } }],
        quizQuestions: [{ id: 'vv-q1', learningPointId: 'vv-skull', questionText: 'Find the object that serves as a "Memento Mori".', whiteCircle: { x: 50, y: 50, radius: 15 }, overlayPosition: { x: 45, y: 45, width: 10, height: 10 }, options: [{ id: 'a', isCorrect: true }, { id: 'b', isCorrect: false }] }]
    },
    {
        id: 'flowers-glass-vase',
        title: 'Flowers in a Glass Vase',
        artist: 'Rachel Ruysch',
        imageUrl: '/artworks/flowers-glass-vase.jpg',
        era: 'dutch-golden-age',
        learningPoints: [{ id: 'fgv-seasons', label: 'Impossible Bloom', clickArea: { x: 50, y: 50, radius: 20 }, highlightCircle: { x: 50, y: 50, radius: 20 }, tooltip: { text: 'Flowers from different seasons.', position: 'bottom' } }],
        quizQuestions: [{ id: 'fgv-q1', learningPointId: 'fgv-seasons', questionText: 'Tap the center of this bouquet.', whiteCircle: { x: 50, y: 50, radius: 20 }, overlayPosition: { x: 40, y: 40, width: 20, height: 20 }, options: [{ id: 'a', isCorrect: true }, { id: 'b', isCorrect: false }] }]
    }
];

export const mockArtwork = MOCK_DUTCH_GOLDEN_AGE_ARTWORKS[2]; // Default to Pearl Earring for back-compat
