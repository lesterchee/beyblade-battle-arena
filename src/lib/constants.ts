import { Beyblade } from '@/types/game';

// Base stats for the 8 original blades generally follow:
// 10-100 scale for simplicity.

export const BEYBLADE_ROSTER: Beyblade[] = [
    {
        id: 'dragoon',
        name: 'Dragoon Storm',
        type: 'Attack',
        stats: { ATK: 85, DEF: 40, STA: 60, SPD: 90 },
        color: '#3b82f6', // Blue
    },
    {
        id: 'dranzer',
        name: 'Dranzer Flame',
        type: 'Balance',
        stats: { ATK: 70, DEF: 60, STA: 70, SPD: 75 },
        color: '#ef4444', // Red
    },
    {
        id: 'driger',
        name: 'Driger Thunder',
        type: 'Balance',
        stats: { ATK: 75, DEF: 55, STA: 65, SPD: 80 },
        color: '#a855f7', // Purple/White
    },
    {
        id: 'draciel',
        name: 'Draciel Fortress',
        type: 'Defense',
        stats: { ATK: 40, DEF: 95, STA: 80, SPD: 30 },
        color: '#22c55e', // Green
    },
    {
        id: 'valtryek',
        name: 'Valtryek Wing',
        type: 'Attack',
        stats: { ATK: 90, DEF: 35, STA: 50, SPD: 95 },
        color: '#1d4ed8', // Dark Blue
    },
    {
        id: 'spryzen',
        name: 'Spryzen Requiem',
        type: 'Balance',
        stats: { ATK: 80, DEF: 70, STA: 70, SPD: 60 },
        color: '#b91c1c', // Dark Red
    },
    {
        id: 'luinor',
        name: 'Luinor Destroy',
        type: 'Attack',
        stats: { ATK: 95, DEF: 30, STA: 40, SPD: 85 },
        color: '#fafafa', // White/Gold
    },
    {
        id: 'achilles',
        name: 'Achilles Hero',
        type: 'Balance',
        stats: { ATK: 75, DEF: 75, STA: 75, SPD: 65 },
        color: '#eab308', // Gold
    },
];

export const GAME_CONFIG = {
    TICK_RATE_MS: 100, // Game loop runs every 100ms
    BATTLE_DURATION_SEC: 60, // Standard match time
    BASE_DAMAGE: 5,
    CRIT_MULTIPLIER: 2.5,
    SPECIAL_CHANCE: 0.05, // 5% chance per tick interaction
};
