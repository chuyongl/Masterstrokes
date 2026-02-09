import { Home, Calendar, Trophy, User } from 'lucide-react';

export const NAV_ITEMS = [
    { id: 'hub', icon: Home, label: 'HOME', path: '/hub' },
    { id: 'daily', icon: Calendar, label: 'DAILY', path: '/hub' }, // mocked paths
    { id: 'rank', icon: Trophy, label: 'RANK', path: '/hub' },
    { id: 'profile', icon: User, label: 'PROFILE', path: '/hub' },
];
