import { Home, Search, Zap, UserSearch, User } from 'lucide-react';

export const NAV_ITEMS = [
    { id: 'home', icon: Home, emoji: '🏠', label: 'MUSEUM', path: '/home', dark: true },
    { id: 'explore', icon: Search, emoji: '🔍', label: 'EXPLORE', path: '/explore', dark: false },
    { id: 'challenge', icon: Zap, emoji: '⚡', label: 'CHALLENGE', path: '/challenge', dark: false },
    { id: 'detective', icon: UserSearch, emoji: '🕵️', label: 'DETECTIVE', path: '/detective', dark: true },
    { id: 'profile', icon: User, emoji: '👤', label: 'PROFILE', path: '/profile', dark: false },
];
