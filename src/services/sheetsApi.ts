import type { Artwork, QuizRegion } from '../data/gameTypes';
import annotationsData from '../data/annotations.json';

// ─── Sheet Row Interfaces ────────────────────────────────────────────────────

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
    point_type: 'general' | 'specific';
    description: string;
    ai_prompt?: string;
    category_tag?: string;  // e.g. "deity", "symbolic_object", "figure_group" — used by Q5 distractor lookup
    x?: number | string;
    y?: number | string;
    radius?: number | string;
}

interface SheetEraDialogue {
    era_id: string;
    progress_state: string;
    dialogue: string;
}

// Q1 Hotspot: tap the correct region on the actual image
export interface SheetQ1Hotspot {
    artwork_id: string;
    question_id: string;
    question_text: string;
    point_id: string;          // correct annotation region
    decoy_point_ids: string;   // comma-separated decoy point_ids
    rect_index: string;        // which rect (0-indexed) of the target point to use, default "0"
    era: string;
}

// Q2 Composition: pick the correct composition overlay (not point-gated)
export interface SheetQ2Composition {
    artwork_id: string;
    question_id: string;
    question_text: string;
    correct_composition: string;   // e.g. "horizontal_registers"
    wrong_compositions: string;    // comma-separated
    explanation: string;
    era: string;
    // Optional focus region (0-1 normalised coords). If present, overlay is positioned here.
    region_x?: string;
    region_y?: string;
    region_w?: string;
    region_h?: string;
}

// Q3 True/False
export interface SheetQ3TrueFalse {
    artwork_id: string;
    question_id: string;
    statement: string;
    correct_answer: string;   // "TRUE" | "FALSE"
    explanation: string;
    difficulty: string;       // "1" | "2" | "3"
    point_id: string;         // comma-separated point_ids — question belongs to any of these LPs
    era: string;
}


// Q4 Match: each row is one pair within a question_id group
export interface SheetQ4MatchRow {
    artwork_id: string;
    question_id: string;
    question_text: string;
    pair_id: string;
    left_label: string;
    right_label: string;
    point_id: string;         // which LP cluster this belongs to
    era: string;
}

export interface Q4MatchQuestion {
    question_id: string;
    artwork_id: string;
    question_text: string;
    point_id: string;
    pairs: { pair_id: string; left: string; right: string }[];
}

// Q5 Fill Blank
export interface SheetQ5FillBlank {
    artwork_id: string;
    question_id: string;
    question_text: string;
    point_id: string;          // the annotation region to blank out (and the correct answer crop)
    category_tag: string;      // used to find distractors from same-era other artworks
    era: string;
}


// ─── Aggregated SheetData ────────────────────────────────────────────────────

export interface SheetData {
    artworks: SheetArtwork[];
    learningPoints: SheetLearningPoint[];
    eraEntryDialogues?: SheetEraDialogue[];
    q1Hotspot: SheetQ1Hotspot[];
    q2Composition: SheetQ2Composition[];
    q3TrueFalse: SheetQ3TrueFalse[];
    q4Match: SheetQ4MatchRow[];
    q5FillBlank: SheetQ5FillBlank[];
}

// ─── Annotation region types ─────────────────────────────────────────────────

/**
 * A single bounding rectangle (normalized 0-1 coordinates).
 */
export interface AnnotationRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

/**
 * A quiz region from the annotation file — new format only: { rects: [...] }
 */
export interface AnnotationRegion {
    id: string;
    point_id: string;
    label: string;
    rects: AnnotationRect[];   // normalized 0-1 coordinates, ≥1 rects
}

/**
 * Parse a raw annotation region. Requires new format { rects: [...] }.
 * Old-format regions (bare x/y/w/h) are silently ignored — update the annotation file.
 */
function normalizeRegion(raw: any): AnnotationRegion | null {
    if (!Array.isArray(raw.rects) || raw.rects.length === 0) return null;
    return { id: raw.id, point_id: raw.point_id, label: raw.label, rects: raw.rects };
}


/** Bounding box that encloses all rects in a region (for click-area / highlight center). */
function boundingBox(rects: AnnotationRect[]): AnnotationRect {
    if (rects.length === 0) return { x: 0.45, y: 0.45, w: 0.1, h: 0.1 };
    const x1 = Math.min(...rects.map(r => r.x));
    const y1 = Math.min(...rects.map(r => r.y));
    const x2 = Math.max(...rects.map(r => r.x + r.w));
    const y2 = Math.max(...rects.map(r => r.y + r.h));
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

// ─── Fetch + Cache ───────────────────────────────────────────────────────────

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;
let cachedData: SheetData | null = null;
let cachePromise: Promise<SheetData> | null = null;

export async function fetchSheetData(forceRefresh = false): Promise<SheetData> {
    if (!APPS_SCRIPT_URL) {
        console.warn('VITE_APPS_SCRIPT_URL not configured, using mock data');
        throw new Error('Apps Script URL not configured');
    }
    if (cachedData && !forceRefresh) return cachedData;
    if (cachePromise && !forceRefresh) return cachePromise;
    try {
        cachePromise = fetch(APPS_SCRIPT_URL).then(async (response) => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            cachedData = data;
            return data;
        });
        return await cachePromise;
    } catch (error) {
        console.error('Failed to fetch sheet data:', error);
        cachePromise = null;
        throw error;
    }
}

// ─── Transform ───────────────────────────────────────────────────────────────

const ANCIENT_ERAS = [
    'Prehistoric', 'Mesopotamian', 'Ancient-Egyptian',
    'Ancient-Greco-Roman', 'Ancient-Indian', 'Ancient-Chinese', 'Medieval'
];

/**
 * Get normalized annotation regions for an artwork.
 * Returns a Map<point_id, AnnotationRegion> for O(1) lookup.
 */
export function getAnnotationRegions(artworkId: string): Map<string, AnnotationRegion> {
    const annotation = (annotationsData as any)[artworkId];
    const raw: any[] = annotation?.quiz_regions || [];
    const map = new Map<string, AnnotationRegion>();
    for (const r of raw) {
        const reg = normalizeRegion(r);
        if (reg) map.set(reg.point_id, reg);  // skip old-format regions
    }
    return map;
}


export function transformSheetDataToArtwork(
    sheetArtwork: SheetArtwork,
    learningPoints: SheetLearningPoint[],
): Artwork {
    const hasChinese = (text: string) => /[\u4e00-\u9fa5]/.test(text || '');

    const artworkLearningPoints = (learningPoints || []).filter(
        (lp) => lp.artwork_id === sheetArtwork.artwork_id && !hasChinese(lp.description)
    );

    const regionMap = getAnnotationRegions(sheetArtwork.artwork_id);

    // Process Learning Points → Hotspots
    const processedLearningPoints = artworkLearningPoints.map((lp, index) => {
        const region = regionMap.get(lp.point_id);

        let clickArea: any;
        let highlightCircle: any;

        if (region && region.rects.length > 0) {
            const bb = boundingBox(region.rects);
            clickArea = {
                x: (bb.x + bb.w / 2) * 100,
                y: (bb.y + bb.h / 2) * 100,
                radius: 10,
                rect: { x: bb.x * 100, y: bb.y * 100, w: bb.w * 100, h: bb.h * 100 },
                rects: region.rects.map(r => ({ x: r.x * 100, y: r.y * 100, w: r.w * 100, h: r.h * 100 }))
            };
            highlightCircle = { ...clickArea };
        } else {
            // general points or unlocated specifics: staggered defaults
            const x = lp.x ? Number(lp.x) : 50;
            const y = lp.y ? Number(lp.y) : 30 + (index * 20);
            const radius = lp.radius ? Number(lp.radius) : 10;
            clickArea = { x, y, radius };
            highlightCircle = { x, y, radius };
        }

        return {
            id: lp.point_id,
            label: lp.label,
            pointType: (lp.point_type || 'specific') as 'general' | 'specific',
            categoryTag: lp.category_tag || '',
            clickArea,
            highlightCircle,
            tooltip: { text: lp.description, position: 'bottom' as const }
        };
    });

    // Build QuizRegions from all annotation regions (specific only = has region)
    const finalQuizRegions: QuizRegion[] = Array.from(regionMap.values()).map(reg => {
        const bb = boundingBox(reg.rects);
        return {
            id: reg.id,
            point_id: reg.point_id,
            label: reg.label,
            x: bb.x,
            y: bb.y,
            w: bb.w,
            h: bb.h,
            rects: reg.rects  // preserve multi-rect for rendering
        };
    });

    // Handle relative image paths
    let imageUrl = sheetArtwork.image_url || `/artworks/${sheetArtwork.artwork_id}.jpg`;
    if (imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
        const baseUrl = import.meta.env.BASE_URL;
        if (baseUrl !== '/') imageUrl = `${baseUrl}${imageUrl.substring(1)}`;
    }

    let mappedEra = sheetArtwork.era;
    if (ANCIENT_ERAS.includes(mappedEra)) mappedEra = 'ancient-art';

    return {
        id: sheetArtwork.artwork_id,
        title: sheetArtwork.title,
        artist: sheetArtwork.artist,
        imageUrl,
        era: mappedEra,
        learningPoints: processedLearningPoints,
        quizQuestions: [],
        quizRegions: finalQuizRegions
    };
}

// Fisher-Yates Shuffle
export function shuffleOptions<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ─── Chapter logic ───────────────────────────────────────────────────────────

/**
 * Split an artwork's learning points into evenly-sized chapters (target 5–7 per chapter).
 */
export function buildChapters(pointIds: string[]): ChapterDef[] {
    const total = pointIds.length;
    if (total === 0) {
        return [{ chapterIndex: 0, type: 'learning', pointIds: [] }];
    }

    const numChapters = Math.max(1, Math.round(total / 6));
    const baseSize = Math.floor(total / numChapters);
    const remainder = total % numChapters;

    const chapters: ChapterDef[] = [];
    let offset = 0;
    for (let i = 0; i < numChapters; i++) {
        const size = i < remainder ? baseSize + 1 : baseSize;
        chapters.push({
            chapterIndex: i,
            type: 'learning',
            pointIds: pointIds.slice(offset, offset + size)
        });
        offset += size;
    }

    return chapters;
}


export interface ChapterDef {
    chapterIndex: number;
    type: 'learning';
    pointIds: string[];
}

/**
 * Filter quiz rows by whether their point_id is in the chapter's pointIds.
 * Used for Q1, Q3, Q4, Q5.
 */
export function filterByChapter<T extends { point_id: string }>(
    rows: T[],
    chapterPointIds: string[]
): T[] {
    const set = new Set(chapterPointIds);
    return rows.filter(r => set.has(r.point_id));
}

// ─── Public API ──────────────────────────────────────────────────────────────

import { FALLBACK_ANCIENT_ARTWORKS } from '../data/ancientArtworks';

export async function getAllArtworks(): Promise<Artwork[]> {
    try {
        const data = await fetchSheetData();
        const transformed = data.artworks.map((artwork) =>
            transformSheetDataToArtwork(artwork, data.learningPoints)
        );
        if (transformed.length === 0) return FALLBACK_ANCIENT_ARTWORKS;
        return transformed;
    } catch (error) {
        console.error('Failed to get artworks from sheet:', error);
        return FALLBACK_ANCIENT_ARTWORKS;
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
            transformSheetDataToArtwork(artwork, data.learningPoints)
        );
    } catch (error) {
        console.error('Failed to get artworks by era:', error);
        return [];
    }
}

export async function getEraEntryDialogues(
    eraId: string,
    progressState: string
): Promise<string[]> {
    try {
        const data = await fetchSheetData();
        const rows = data.eraEntryDialogues || [];
        return rows
            .filter(r => r.era_id === eraId && r.progress_state === progressState)
            .map(r => r.dialogue)
            .filter(Boolean);
    } catch {
        return [];
    }
}

// ─── Q1-Q7 accessors ─────────────────────────────────────────────────────────

/** All Q1 questions for an artwork, optionally filtered to a chapter's point IDs */
export async function getQ1Hotspot(
    artworkId: string,
    chapterPointIds?: string[]
): Promise<SheetQ1Hotspot[]> {
    const data = await fetchSheetData();
    let rows = (data.q1Hotspot || []).filter(q => q.artwork_id === artworkId);
    if (chapterPointIds) rows = rows.filter(q => chapterPointIds.includes(q.point_id));
    return rows;
}

/** Q2 is not point-gated — returns all for the artwork */
export async function getQ2Composition(artworkId: string): Promise<SheetQ2Composition[]> {
    const data = await fetchSheetData();
    return (data.q2Composition || []).filter(q => q.artwork_id === artworkId);
}

/** Q3 filtered by chapter point IDs. point_id field may be comma-separated; include if ANY match. */
export async function getQ3TrueFalse(
    artworkId: string,
    chapterPointIds?: string[]
): Promise<SheetQ3TrueFalse[]> {
    const data = await fetchSheetData();
    let rows = (data.q3TrueFalse || []).filter(q => q.artwork_id === artworkId);
    if (chapterPointIds) {
        const chapterSet = new Set(chapterPointIds);
        rows = rows.filter(q =>
            q.point_id.split(',').map(s => s.trim()).some(pid => chapterSet.has(pid))
        );
    }
    return rows;
}


/** Q4 grouped by question_id, filtered by chapter point IDs. point_id may be comma-separated; include if ANY match. */
export async function getQ4Match(
    artworkId: string,
    chapterPointIds?: string[]
): Promise<Q4MatchQuestion[]> {
    const data = await fetchSheetData();
    let rows = (data.q4Match || []).filter(r => r.artwork_id === artworkId);
    if (chapterPointIds) {
        const chapterSet = new Set(chapterPointIds);
        rows = rows.filter(r =>
            r.point_id.split(',').map(s => s.trim()).some(pid => chapterSet.has(pid))
        );
    }

    const grouped = new Map<string, Q4MatchQuestion>();
    for (const row of rows) {
        if (!grouped.has(row.question_id)) {
            grouped.set(row.question_id, {
                question_id: row.question_id,
                artwork_id: row.artwork_id,
                question_text: row.question_text,
                point_id: row.point_id,
                pairs: []
            });
        }
        grouped.get(row.question_id)!.pairs.push({
            pair_id: row.pair_id,
            left: row.left_label,
            right: row.right_label
        });
    }
    return Array.from(grouped.values());
}

/** Q5 filtered by chapter point IDs */
export async function getQ5FillBlank(
    artworkId: string,
    chapterPointIds?: string[]
): Promise<SheetQ5FillBlank[]> {
    const data = await fetchSheetData();
    let rows = (data.q5FillBlank || []).filter(q => q.artwork_id === artworkId);
    if (chapterPointIds) rows = rows.filter(q => chapterPointIds.includes(q.point_id));
    return rows;
}



// ─── Q5 Distractor lookup (category-based cross-artwork) ─────────────────────

/**
 * Find distractor crops for a Q5 FillBlank question.
 * Uses the category_tag on the Q5 row itself to find same-era other artworks
 * that have annotation regions tagged with the same category.
 *
 * @param artworkId  - the artwork being quizzed (excluded from results)
 * @param categoryTag - category_tag from the Q5 sheet row
 * @param era        - era string to restrict candidates (e.g. "Egyptian")
 * @param count      - how many distractors to return (default 3)
 * @returns array of { artwork_id, point_id } — consumer crops these regions as wrong options
 */
export async function getQ5Distractors(
    artworkId: string,
    categoryTag: string,
    era: string,
    count = 3
): Promise<{ artwork_id: string; point_id: string }[]> {
    const data = await fetchSheetData();

    // Build era lookup from artworks sheet
    const artworkEraMap = new Map(data.artworks.map(a => [a.artwork_id, a.era]));

    // Find LPs in same era, same category_tag, different artwork, specific type
    const candidates = data.learningPoints.filter(lp => {
        const lpEra = artworkEraMap.get(lp.artwork_id) || '';
        return (
            lp.artwork_id !== artworkId &&
            lpEra === era &&
            lp.category_tag === categoryTag &&
            lp.point_type === 'specific'
        );
    });

    // Shuffle, then pick only those that have a valid annotation region
    const distractors: { artwork_id: string; point_id: string }[] = [];
    for (const lp of shuffleOptions(candidates)) {
        const regions = getAnnotationRegions(lp.artwork_id);
        if (regions.has(lp.point_id)) {
            distractors.push({ artwork_id: lp.artwork_id, point_id: lp.point_id });
            if (distractors.length >= count) break;
        }
    }

    return distractors;
}

