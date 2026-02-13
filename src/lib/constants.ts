import { Beyblade } from '@/types/game';

// Base stats for the 8 original blades generally follow:
// 10-100 scale for simplicity.

export const BEYBLADE_ROSTER: Beyblade[] = [
    {
        id: 'dragoon',
        name: 'Kayden Storm',
        type: 'Attack', // Should I change to Defense? User said "max out defense and stamina". I'll keep type as is unless user implies change. Actually max DEF/STA implies Defense type. I'll keep type as 'Attack' but maximize stats as requested. No, wait, if ID is 'dragoon' and name is changed, maybe type too? "Kayden Storm" sounds arguably okay. 
        // User specifically said "max out defense and stamina". 
        stats: { ATK: 80, DEF: 100, STA: 100, SPD: 80 },
        color: '#3b82f6', // Blue
        image: '/images/dragoon.png',
    },
    {
        id: 'dranzer',
        name: 'Dranzer Flame',
        type: 'Balance',
        stats: { ATK: 70, DEF: 60, STA: 70, SPD: 75 },
        color: '#ef4444', // Red
        image: '/images/dranzer.png',
    },
    {
        id: 'driger',
        name: 'Driger Thunder',
        type: 'Balance',
        stats: { ATK: 75, DEF: 55, STA: 65, SPD: 80 },
        color: '#a855f7', // Purple/White
        image: '/images/driger.png',
    },
    {
        id: 'draciel',
        name: 'Draciel Fortress',
        type: 'Defense',
        stats: { ATK: 40, DEF: 95, STA: 80, SPD: 30 },
        color: '#22c55e', // Green
        image: '/images/draciel.png',
    },
    {
        id: 'valtryek',
        name: 'King Owen',
        type: 'Attack',
        stats: { ATK: 100, DEF: 80, STA: 80, SPD: 100 },
        color: '#1d4ed8', // Dark Blue
        image: '/images/valtryek.png',
    },
    {
        id: 'spryzen',
        name: 'Thanos Lester',
        type: 'Balance',
        stats: { ATK: 80, DEF: 70, STA: 70, SPD: 60 },
        color: '#b91c1c', // Dark Red
        image: '/images/spryzen.png',
    },
    {
        id: 'luinor',
        name: 'Luinor Destroy',
        type: 'Attack',
        stats: { ATK: 95, DEF: 30, STA: 40, SPD: 85 },
        color: '#fafafa', // White/Gold
        image: '/images/luinor.png',
    },
    {
        id: 'achilles',
        name: 'Achilles Hero',
        type: 'Balance',
        stats: { ATK: 75, DEF: 75, STA: 75, SPD: 65 },
        color: '#eab308', // Gold
        image: '/images/achilles.png',
    },
];

export const GAME_CONFIG = {
    TICK_RATE_MS: 100, // Game loop runs every 100ms
    BATTLE_DURATION_SEC: 30, // Standard match time
    MIN_DURATION_SEC: 7, // Minimum time before knockout
    BASE_DAMAGE: 5,
    CRIT_MULTIPLIER: 2.5,
    SPECIAL_CHANCE: 0.05, // 5% chance per tick interaction
};
