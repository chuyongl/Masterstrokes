import { Home, Compass, Image as ImageIcon, User } from 'lucide-react';

export const NAV_ITEMS = [
    { id: 'hub', icon: Home, label: 'MUSEUM', path: '/hub' },
    { id: 'map', icon: Compass, label: 'MAP', path: '/map' },
    { id: 'collection', icon: ImageIcon, label: 'COLLECTION', path: '/collection' },
    { id: 'profile', icon: User, label: 'PROFILE', path: '/profile' },
];
