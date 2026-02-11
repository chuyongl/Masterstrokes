import type { Artwork } from '../data/mockArtwork';

interface SheetArtwork {
    artwork_id: string;
    title: string;
    artist: string;
    image_url: string;
    era: string;
}

interface SheetLearningPoint {
    artwork_id: string;
    point_id: string;
    label: string;
    description: string;
    ai_prompt: string;
    x?: number | string;
    y?: number | string;
    radius?: number | string;
}

interface SheetQuizQuestion {
    artwork_id: string;
    point_id: string;
    question_text: string;
    correct_option_source: string;
}

interface SheetData {
    artworks: SheetArtwork[];
    learningPoints: SheetLearningPoint[];
    quizQuestions: SheetQuizQuestion[];
}

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

// Simple in-memory cache
let cachedData: SheetData | null = null;
let cachePromise: Promise<SheetData> | null = null;

export async function fetchSheetData(forceRefresh = false): Promise<SheetData> {
    if (!APPS_SCRIPT_URL) {
        console.warn('VITE_APPS_SCRIPT_URL not configured, using mock data');
        throw new Error('Apps Script URL not configured');
    }

    // Return cached data if available and not forcing refresh
    if (cachedData && !forceRefresh) {
        return cachedData;
    }

    // If a request is already in progress, return that promise
    if (cachePromise && !forceRefresh) {
        return cachePromise;
    }

    try {
        cachePromise = fetch(APPS_SCRIPT_URL).then(async (response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            cachedData = data; // Cache the result
            return data;
        });

        return await cachePromise;
    } catch (error) {
        console.error('Failed to fetch sheet data:', error);
        cachePromise = null; // Reset promise on error so we can try again
        throw error;
    }
}

export function transformSheetDataToArtwork(
    sheetArtwork: SheetArtwork,
    learningPoints: SheetLearningPoint[],
    quizQuestions: SheetQuizQuestion[]
): Artwork {
    // Filter learning points for this artwork
    const artworkLearningPoints = learningPoints.filter(
        (lp) => lp.artwork_id === sheetArtwork.artwork_id
    );

    // Filter quiz questions for this artwork
    const artworkQuizQuestions = quizQuestions.filter(
        (qq) => qq.artwork_id === sheetArtwork.artwork_id
    );

    // Process Learning Points first to get coordinates
    const processedLearningPoints = artworkLearningPoints.map((lp, index) => {
        // Parse coordinates from Sheet, defaulting to calculated layout if missing
        const x = lp.x ? Number(lp.x) : 50;
        const y = lp.y ? Number(lp.y) : 30 + (index * 20);
        const radius = lp.radius ? Number(lp.radius) : 10;

        return {
            id: lp.point_id,
            label: lp.label,
            clickArea: {
                x,
                y,
                radius
            },
            highlightCircle: {
                x,
                y,
                radius
            },
            tooltip: {
                text: lp.description,
                position: 'bottom' as const
            }
        };
    });

    // Process Quiz Questions using coordinates from LPs
    const processedQuizQuestions = artworkQuizQuestions.map((qq, index) => {
        // Find corresponding Learning Point to get coordinates
        const lp = processedLearningPoints.find(p => p.id === qq.point_id);
        const x = lp ? lp.clickArea.x : 50;
        const y = lp ? lp.clickArea.y : 30 + (index * 20);

        // Generate Distractors (Wrong Answers)
        // Strategy: Use other learning points first, then random crops
        const otherLPs = processedLearningPoints.filter(p => p.id !== qq.point_id);
        const distractors: { x: number; y: number }[] = [];

        // 1. Add other learning points as distractors
        otherLPs.forEach(other => {
            if (distractors.length < 3) {
                distractors.push({ x: other.clickArea.x, y: other.clickArea.y });
            }
        });

        // 2. Fill remaining slots with random crops
        while (distractors.length < 3) {
            const rx = Math.floor(Math.random() * 80) + 10; // 10% to 90%
            const ry = Math.floor(Math.random() * 80) + 10;

            // Basic distance check to avoid overlapping with correct answer or existing distractors
            const isTooClose = [...distractors, { x, y }].some(pt => {
                const dist = Math.sqrt(Math.pow(pt.x - rx, 2) + Math.pow(pt.y - ry, 2));
                return dist < 15; // 15% threshold
            });

            if (!isTooClose) {
                distractors.push({ x: rx, y: ry });
            } else {
                // Failsafe break to prevent infinite loop (rare but possible)
                if (Math.random() > 0.9) distractors.push({ x: rx, y: ry });
            }
        }

        return {
            id: qq.point_id,
            learningPointId: qq.point_id,
            questionText: qq.question_text,
            whiteCircle: {
                x: x,
                y: y,
                radius: lp ? lp.clickArea.radius : 8
            },
            overlayPosition: {
                x: x - 4,
                y: y - 4,
                width: 8,
                height: 8
            },
            options: shuffleOptions([
                {
                    id: 'a',
                    // Correct answer
                    crop: { x, y, zoom: 300 },
                    filter: 'none',
                    isCorrect: true
                },
                {
                    id: 'b',
                    // Distractor 1
                    crop: { x: distractors[0].x, y: distractors[0].y, zoom: 300 },
                    filter: 'none',
                    isCorrect: false
                },
                {
                    id: 'c',
                    // Distractor 2
                    crop: { x: distractors[1].x, y: distractors[1].y, zoom: 300 },
                    filter: 'none',
                    isCorrect: false
                },
                {
                    id: 'd',
                    // Distractor 3
                    crop: { x: distractors[2].x, y: distractors[2].y, zoom: 300 },
                    filter: 'none',
                    isCorrect: false
                }
            ])
        };
    });

    // Handle relative paths for images (fix for GitHub Pages)
    let imageUrl = sheetArtwork.image_url;
    if (imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
        // Prepare base URL (remove trailing slash if exists to avoid double slashes)
        // Actually import.meta.env.BASE_URL usually ends with /.
        // So we join them carefully.
        const baseUrl = import.meta.env.BASE_URL;
        // If baseUrl is '/', we don't need to do anything if path starts with /
        if (baseUrl !== '/') {
            // If local path is "/artworks/..." and base is "/Masterstrokes/"
            // Result should be "/Masterstrokes/artworks/..."
            // We strip the leading slash from the image path
            imageUrl = `${baseUrl}${imageUrl.substring(1)}`;
        }
    }

    // Transform to Artwork format
    return {
        id: sheetArtwork.artwork_id,
        title: sheetArtwork.title,
        artist: sheetArtwork.artist,
        imageUrl: imageUrl,
        era: sheetArtwork.era,
        learningPoints: processedLearningPoints,
        quizQuestions: processedQuizQuestions
    };
}



// Fisher-Yates Shuffle
function shuffleOptions<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

import { MOCK_DUTCH_GOLDEN_AGE_ARTWORKS } from '../data/mockArtwork';

export async function getAllArtworks(): Promise<Artwork[]> {
    try {
        const data = await fetchSheetData();

        const transformed = data.artworks.map((artwork) =>
            transformSheetDataToArtwork(
                artwork,
                data.learningPoints,
                data.quizQuestions
            )
        );

        // If sheet is empty or fails to transform, return mock
        if (transformed.length === 0) return MOCK_DUTCH_GOLDEN_AGE_ARTWORKS;
        return transformed;
    } catch (error) {
        console.warn('Failed to get artworks from sheet, using mock data:', error);
        return MOCK_DUTCH_GOLDEN_AGE_ARTWORKS;
    }
}

export async function getArtworkById(id: string): Promise<Artwork | null> {
    try {
        const artworks = await getAllArtworks();
        return artworks.find((a) => a.id === id) || null;
    } catch (error) {
        console.error('Failed to get artwork:', error);
        return null;
    }
}

export async function getArtworksByEra(era: string): Promise<Artwork[]> {
    try {
        const data = await fetchSheetData();
        const eraArtworks = data.artworks.filter((a) => a.era === era);

        return eraArtworks.map((artwork) =>
            transformSheetDataToArtwork(
                artwork,
                data.learningPoints,
                data.quizQuestions
            )
        );
    } catch (error) {
        console.error('Failed to get artworks by era:', error);
        return [];
    }
}
