import { Beyblade } from '@/types/game';

// Base stats for the 8 original blades generally follow:
// 10-100 scale for simplicity.

export const BEYBLADE_ROSTER: Beyblade[] = [
    {
        id: 'dragoon',
        name: 'Kayden Storm',
        type: 'Stamina', // Changed to Stamina based on stats
        stats: { ATK: 75, DEF: 85, STA: 100, SPD: 50 },
        color: '#06b6d4', // Cyan (Kayden Storm)
        image: '/images/dragoon.png',
    },
    {
        id: 'dranzer',
        name: 'Princess Lara',
        type: 'Balance',
        stats: { ATK: 70, DEF: 60, STA: 70, SPD: 50 },
        color: '#d946ef', // Pink/Purple (Princess Lara)
        image: '/images/princess_lara.png',
    },
    {
        id: 'driger',
        name: 'TiTa Thunder',
        type: 'Balance',
        stats: { ATK: 75, DEF: 55, STA: 65, SPD: 50 },
        color: '#e2e8f0', // White/Silver (TiTa Thunder)
        image: '/images/driger.png',
    },
    {
        id: 'draciel',
        name: 'Jacob Fortress',
        type: 'Defense',
        stats: { ATK: 40, DEF: 95, STA: 80, SPD: 50 },
        color: '#16a34a', // Green (Jacob Fortress)
        image: '/images/draciel.png',
    },
    {
        id: 'valtryek',
        name: 'King Owen',
        type: 'Attack',
        stats: { ATK: 100, DEF: 80, STA: 80, SPD: 50 },
        color: '#eab308', // Gold (King Owen)
        image: '/images/king-owen.png',
    },
    {
        id: 'spryzen',
        name: 'Thanos Lester',
        type: 'Balance',
        stats: { ATK: 80, DEF: 70, STA: 70, SPD: 50 },
        color: '#ef4444', // Red (Thanos Lester)
        image: '/images/spryzen.png',
    },
    {
        id: 'luinor',
        name: 'Queen Guen',
        type: 'Attack',
        stats: { ATK: 95, DEF: 30, STA: 40, SPD: 50 },
        color: '#8b5cf6', // Violet (Queen Guen - changed from white as TiTa is white)
        image: '/images/queen-guen.png',
    },
    {
        id: 'achilles',
        name: 'Peter Hero',
        type: 'Balance',
        stats: { ATK: 75, DEF: 75, STA: 75, SPD: 50 },
        color: '#f97316', // Orange (Peter Hero)
        image: '/images/achilles.png',
    },
];

export const GAME_CONFIG = {
    TICK_RATE_MS: 100, // Game loop runs every 100ms
    BATTLE_DURATION_SEC: 30, // Standard match time
    MIN_DURATION_SEC: 5, // Minimum time before knockout
    BASE_DAMAGE: 5,
    CRIT_MULTIPLIER: 2.5,
    SPECIAL_CHANCE: 0.05, // 5% chance per tick interaction
};
