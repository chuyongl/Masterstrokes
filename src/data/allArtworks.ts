import type { Artwork } from './mockArtwork';

// All 10 sample artworks with real image URLs
export const MOCK_ARTWORKS: Artwork[] = [
    {
        id: 'girl-pearl-earring',
        title: 'Girl with a Pearl Earring',
        artist: 'Johannes Vermeer',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/1665_Girl_with_a_Pearl_Earring.jpg',
        learningPoints: [
            {
                id: 'pearl-earring',
                label: 'Pearl Earring',
                clickArea: { x: 50, y: 58, radius: 4 },
                highlightCircle: { x: 50, y: 58, radius: 6 },
                tooltip: {
                    text: 'The iconic pearl earring that gives the painting its name, painted with remarkable luminosity',
                    position: 'bottom'
                }
            },
            {
                id: 'turban',
                label: 'Blue Turban',
                clickArea: { x: 50, y: 22, radius: 15 },
                highlightCircle: { x: 50, y: 22, radius: 25 },
                tooltip: {
                    text: 'The exotic blue and yellow turban creates a striking contrast with the dark background',
                    position: 'bottom'
                }
            },
            {
                id: 'eye-contact',
                label: 'Direct Gaze',
                clickArea: { x: 38, y: 35, radius: 5 },
                highlightCircle: { x: 38, y: 35, radius: 8 },
                tooltip: {
                    text: "The girl's enigmatic gaze directly engages the viewer, creating an intimate connection",
                    position: 'bottom'
                }
            }
        ],
        quizQuestions: [
            {
                id: 'q1',
                learningPointId: 'pearl-earring',
                questionText: 'Which is the correct pearl earring?',
                whiteCircle: { x: 50, y: 58, radius: 6 },
                overlayPosition: { x: 46, y: 54, width: 8, height: 8 },
                options: [
                    { id: 'a', imageUrl: '/quiz/earring-1.svg', isCorrect: true },
                    { id: 'b', imageUrl: '/quiz/earring-2.svg', isCorrect: false },
                    { id: 'c', imageUrl: '/quiz/earring-3.svg', isCorrect: false },
                    { id: 'd', imageUrl: '/quiz/earring-4.svg', isCorrect: false }
                ]
            },
            {
                id: 'q2',
                learningPointId: 'turban',
                questionText: 'Which is the correct turban?',
                whiteCircle: { x: 50, y: 22, radius: 25 },
                overlayPosition: { x: 25, y: 10, width: 50, height: 24 },
                options: [
                    { id: 'a', imageUrl: '/quiz/headband-1.svg', isCorrect: false },
                    { id: 'b', imageUrl: '/quiz/headband-2.svg', isCorrect: true },
                    { id: 'c', imageUrl: '/quiz/headband-3.svg', isCorrect: false },
                    { id: 'd', imageUrl: '/quiz/headband-4.svg', isCorrect: false }
                ]
            },
            {
                id: 'q3',
                learningPointId: 'eye-contact',
                questionText: 'Which shows the correct gaze?',
                whiteCircle: { x: 38, y: 35, radius: 8 },
                overlayPosition: { x: 32, y: 30, width: 12, height: 10 },
                options: [
                    { id: 'a', imageUrl: '/quiz/eye-1.svg', isCorrect: true },
                    { id: 'b', imageUrl: '/quiz/eye-2.svg', isCorrect: false },
                    { id: 'c', imageUrl: '/quiz/eye-3.svg', isCorrect: false },
                    { id: 'd', imageUrl: '/quiz/eye-4.svg', isCorrect: false }
                ]
            }
        ]
    },
    {
        id: 'starry-night',
        title: 'The Starry Night',
        artist: 'Vincent van Gogh',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
        learningPoints: [
            {
                id: 'swirling-sky',
                label: 'Swirling Sky',
                clickArea: { x: 50, y: 30, radius: 20 },
                highlightCircle: { x: 50, y: 30, radius: 25 },
                tooltip: {
                    text: "Van Gogh's signature swirling brushstrokes create dynamic movement in the night sky",
                    position: 'bottom'
                }
            },
            {
                id: 'cypress-tree',
                label: 'Cypress Tree',
                clickArea: { x: 15, y: 50, radius: 10 },
                highlightCircle: { x: 15, y: 50, radius: 15 },
                tooltip: {
                    text: 'The dark cypress tree in the foreground reaches toward the sky like a flame',
                    position: 'bottom'
                }
            },
            {
                id: 'village',
                label: 'Peaceful Village',
                clickArea: { x: 50, y: 75, radius: 15 },
                highlightCircle: { x: 50, y: 75, radius: 20 },
                tooltip: {
                    text: 'The quiet village below contrasts with the turbulent sky above',
                    position: 'top'
                }
            }
        ],
        quizQuestions: [
            {
                id: 'q1',
                learningPointId: 'swirling-sky',
                questionText: 'Which shows the correct swirling pattern?',
                whiteCircle: { x: 50, y: 30, radius: 25 },
                overlayPosition: { x: 25, y: 5, width: 50, height: 50 },
                options: [
                    { id: 'a', imageUrl: '/quiz/sky-1.svg', isCorrect: true },
                    { id: 'b', imageUrl: '/quiz/sky-2.svg', isCorrect: false },
                    { id: 'c', imageUrl: '/quiz/sky-3.svg', isCorrect: false },
                    { id: 'd', imageUrl: '/quiz/sky-4.svg', isCorrect: false }
                ]
            },
            {
                id: 'q2',
                learningPointId: 'cypress-tree',
                questionText: 'Which is the correct cypress tree?',
                whiteCircle: { x: 15, y: 50, radius: 15 },
                overlayPosition: { x: 5, y: 20, width: 20, height: 60 },
                options: [
                    { id: 'a', imageUrl: '/quiz/tree-1.svg', isCorrect: false },
                    { id: 'b', imageUrl: '/quiz/tree-2.svg', isCorrect: true },
                    { id: 'c', imageUrl: '/quiz/tree-3.svg', isCorrect: false },
                    { id: 'd', imageUrl: '/quiz/tree-4.svg', isCorrect: false }
                ]
            },
            {
                id: 'q3',
                learningPointId: 'village',
                questionText: 'Which is the correct village?',
                whiteCircle: { x: 50, y: 75, radius: 20 },
                overlayPosition: { x: 30, y: 55, width: 40, height: 40 },
                options: [
                    { id: 'a', imageUrl: '/quiz/village-1.svg', isCorrect: true },
                    { id: 'b', imageUrl: '/quiz/village-2.svg', isCorrect: false },
                    { id: 'c', imageUrl: '/quiz/village-3.svg', isCorrect: false },
                    { id: 'd', imageUrl: '/quiz/village-4.svg', isCorrect: false }
                ]
            }
        ]
    },
    {
        id: 'the-scream',
        title: 'The Scream',
        artist: 'Edvard Munch',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg',
        learningPoints: [
            {
                id: 'screaming-figure',
                label: 'Screaming Figure',
                clickArea: { x: 50, y: 50, radius: 10 },
                highlightCircle: { x: 50, y: 50, radius: 15 },
                tooltip: {
                    text: 'The agonized figure represents existential anxiety and modern alienation',
                    position: 'bottom'
                }
            },
            {
                id: 'wavy-sky',
                label: 'Wavy Sky',
                clickArea: { x: 50, y: 25, radius: 20 },
                highlightCircle: { x: 50, y: 25, radius: 25 },
                tooltip: {
                    text: "The undulating sky mirrors the figure's emotional turmoil",
                    position: 'bottom'
                }
            },
            {
                id: 'bridge',
                label: 'Wooden Bridge',
                clickArea: { x: 70, y: 60, radius: 15 },
                highlightCircle: { x: 70, y: 60, radius: 20 },
                tooltip: {
                    text: 'The diagonal bridge creates depth and leads the eye into the composition',
                    position: 'top'
                }
            }
        ],
        quizQuestions: [
            {
                id: 'q1',
                learningPointId: 'screaming-figure',
                questionText: 'Which is the correct screaming figure?',
                whiteCircle: { x: 50, y: 50, radius: 15 },
                overlayPosition: { x: 35, y: 35, width: 30, height: 30 },
                options: [
                    { id: 'a', imageUrl: '/quiz/figure-1.svg', isCorrect: true },
                    { id: 'b', imageUrl: '/quiz/figure-2.svg', isCorrect: false },
                    { id: 'c', imageUrl: '/quiz/figure-3.svg', isCorrect: false },
                    { id: 'd', imageUrl: '/quiz/figure-4.svg', isCorrect: false }
                ]
            },
            {
                id: 'q2',
                learningPointId: 'wavy-sky',
                questionText: 'Which is the correct sky pattern?',
                whiteCircle: { x: 50, y: 25, radius: 25 },
                overlayPosition: { x: 25, y: 0, width: 50, height: 50 },
                options: [
                    { id: 'a', imageUrl: '/quiz/sky-1.svg', isCorrect: false },
                    { id: 'b', imageUrl: '/quiz/sky-2.svg', isCorrect: true },
                    { id: 'c', imageUrl: '/quiz/sky-3.svg', isCorrect: false },
                    { id: 'd', imageUrl: '/quiz/sky-4.svg', isCorrect: false }
                ]
            },
            {
                id: 'q3',
                learningPointId: 'bridge',
                questionText: 'Which is the correct bridge?',
                whiteCircle: { x: 70, y: 60, radius: 20 },
                overlayPosition: { x: 50, y: 40, width: 40, height: 40 },
                options: [
                    { id: 'a', imageUrl: '/quiz/bridge-1.svg', isCorrect: true },
                    { id: 'b', imageUrl: '/quiz/bridge-2.svg', isCorrect: false },
                    { id: 'c', imageUrl: '/quiz/bridge-3.svg', isCorrect: false },
                    { id: 'd', imageUrl: '/quiz/bridge-4.svg', isCorrect: false }
                ]
            }
        ]
    }
];
