export interface Era {
    id: string;
    name: string;
    period: string;
    color: string;
    icon: string;
}

export const ERAS: Era[] = [
    {
        id: 'renaissance',
        name: 'Renaissance',
        period: '14th-17th Century',
        color: '#8b5cf6', // Purple
        icon: '🎨'
    },
    {
        id: 'dutch-golden-age',
        name: 'Dutch Golden Age',
        period: '17th Century',
        color: '#f59e0b', // Amber
        icon: '🖼️'
    },
    {
        id: 'post-impressionism',
        name: 'Post-Impressionism',
        period: 'Late 19th Century',
        color: '#3b82f6', // Blue
        icon: '🌟'
    },
    {
        id: 'expressionism',
        name: 'Expressionism',
        period: 'Early 20th Century',
        color: '#ef4444', // Red
        icon: '😱'
    },
    {
        id: 'ukiyo-e',
        name: 'Ukiyo-e',
        period: '17th-19th Century',
        color: '#06b6d4', // Cyan
        icon: '🌊'
    },
    {
        id: 'regionalism',
        name: 'Regionalism',
        period: '1930s-1940s',
        color: '#84cc16', // Lime
        icon: '🌾'
    },
    {
        id: 'surrealism',
        name: 'Surrealism',
        period: '1920s-1950s',
        color: '#ec4899', // Pink
        icon: '⏰'
    }
];

// Map artwork IDs to eras
export const ARTWORK_ERA_MAP: Record<string, string> = {
    'girl-pearl-earring': 'dutch-golden-age',
    'starry-night': 'post-impressionism',
    'mona-lisa': 'renaissance',
    'the-scream': 'expressionism',
    'birth-of-venus': 'renaissance',
    'great-wave': 'ukiyo-e',
    'american-gothic': 'regionalism',
    'last-supper': 'renaissance',
    'persistence-memory': 'surrealism',
    'night-watch': 'dutch-golden-age'
};
