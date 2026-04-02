/**
 * Category = top-level grouping (formerly "Era").
 * Session  = sub-grouping within a Category (e.g. "Medieval" within Ancient Art).
 * Unit     = individual artwork.
 *
 * We keep `era` as an internal alias for backward compatibility
 * (routes, sheet column names, etc.), but the canonical term is Category.
 */

export interface Category {
    id: string;
    name: string;
    period: string;
    color: string;
    icon: string;
}

/** @deprecated Use Category instead */
export type Era = Category;

export const CATEGORIES: Category[] = [
    {
        id: 'ancient-art',
        name: 'Ancient Art',
        period: 'Prehistoric - 1400 CE',
        color: '#b45309',
        icon: '🏺'
    },
    {
        id: 'featured-classics',
        name: 'Featured Classics',
        period: '15th - 20th Century',
        color: '#D97706',
        icon: '⭐'
    },
];

/** @deprecated Use CATEGORIES instead */
export const ERAS = CATEGORIES;

/**
 * Map unit (artwork) IDs → category IDs.
 * Used when artwork.era might not match the category id directly.
 */
export const UNIT_CATEGORY_MAP: Record<string, string> = {
    // ── Featured Classics ──
    'girl-pearl-earring': 'featured-classics',
    'arnolfini-portrait': 'featured-classics',
    'las-meninas': 'featured-classics',
    'birth-of-venus': 'featured-classics',
    'grande-jatte': 'featured-classics',
    'night-watch': 'featured-classics',
    'washington-crossing': 'featured-classics',
    'the-ambassadors': 'featured-classics',
    'nighthawks': 'featured-classics',
    'kahlo-self-portrait': 'featured-classics',

    // ── Legacy era mappings ──
    'starry-night': 'post-impressionism',
    'mona-lisa': 'renaissance',
    'the-scream': 'expressionism',
    'great-wave': 'ukiyo-e',
    'american-gothic': 'regionalism',
    'last-supper': 'renaissance',
    'persistence-memory': 'surrealism',

    // Dutch Golden Age
    'laughing-cavalier': 'dutch-golden-age',
    'the-milkmaid': 'dutch-golden-age',
    'merry-family': 'dutch-golden-age',
    'courtyard-delft': 'dutch-golden-age',
    'view-of-delft': 'dutch-golden-age',
    'windmill-wijk': 'dutch-golden-age',
    'avenue-middelharnis': 'dutch-golden-age',
    'still-life-cheeses': 'dutch-golden-age',
    'vanitas-violin': 'dutch-golden-age',
    'flowers-glass-vase': 'dutch-golden-age'
};

/** @deprecated Use UNIT_CATEGORY_MAP instead */
export const ARTWORK_ERA_MAP = UNIT_CATEGORY_MAP;
