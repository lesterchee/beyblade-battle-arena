import { useReducer, useEffect, useCallback, useRef } from 'react';
import { Beyblade, BattleState, BattleLog } from '@/types/game';
import { GAME_CONFIG } from '@/lib/constants';
import { randomInt } from '@/lib/utils';
import { audioManager } from '@/lib/audio';

type Action =
    | { type: 'START_BATTLE' }
    | { type: 'TICK'; payload: { logs: BattleLog[]; damageMap: Record<string, number> } }
    | { type: 'END_BATTLE'; payload: { winner: string } }
    | { type: 'RESET' };

const INITIAL_HP = 1000;

const createInitialState = (blades: Beyblade[]): BattleState => {
    const participants: BattleState['participants'] = {};
    blades.forEach(b => {
        participants[b.id] = {
            hp: INITIAL_HP, // Could scale with stamina
            maxHP: INITIAL_HP,
            name: b.name,
            image: b.image,
            isDead: false
        };
    });

    return {
        playerHP: INITIAL_HP,
        opponentHP: INITIAL_HP,
        playerMaxHP: INITIAL_HP,
        opponentMaxHP: INITIAL_HP,
        timer: GAME_CONFIG.BATTLE_DURATION_SEC,
        logs: [],
        status: 'idle',
        winner: null,
        playerId: blades[0]?.id || '',
        opponentId: blades[1]?.id || '',
        participants
    };
};

function battleReducer(state: BattleState, action: Action): BattleState {
    switch (action.type) {
        case 'START_BATTLE':
            return { ...state, status: 'fighting' };
        case 'TICK':
            const newParticipants = { ...state.participants };
            const currentDuration = GAME_CONFIG.BATTLE_DURATION_SEC - state.timer;
            const MIN_DURATION = GAME_CONFIG.MIN_DURATION_SEC;

            // Apply damage to participants
            Object.entries(action.payload.damageMap).forEach(([id, damage]) => {
                const participant = newParticipants[id];
                if (participant) {
                    let newHP = participant.hp - damage;

                    // Invincibility Frame: Cannot die within first MIN_DURATION seconds
                    if (currentDuration < MIN_DURATION && newHP <= 0) {
                        newHP = 1;
                    }

                    participant.hp = Math.max(0, newHP);

                    if (participant.hp <= 0) {
                        participant.isDead = true;
                    }
                }
            });

            // Robust Mapping using stored IDs
            const p1 = newParticipants[state.playerId];
            const p2 = newParticipants[state.opponentId];

            return {
                ...state,
                participants: newParticipants,
                playerHP: p1 ? p1.hp : state.playerHP,
                opponentHP: p2 ? p2.hp : state.opponentHP,
                logs: [...state.logs, ...action.payload.logs],
                timer: Math.max(0, state.timer - (GAME_CONFIG.TICK_RATE_MS / 1000)),
            };
        case 'END_BATTLE':
            return { ...state, status: 'finished', winner: action.payload.winner };
        case 'RESET':
            // Instead of returning initialState (which is constant), we logically need to reset based on blades.
            // But reducer is pure. We might need a RESET_WITH_BLADES action or just reset HP.
            const resetParticipants = { ...state.participants };
            Object.keys(resetParticipants).forEach(key => {
                resetParticipants[key].hp = resetParticipants[key].maxHP;
                resetParticipants[key].isDead = false;
            });
            return {
                ...state,
                playerHP: state.playerMaxHP,
                opponentHP: state.opponentMaxHP,
                timer: GAME_CONFIG.BATTLE_DURATION_SEC,
                logs: [],
                status: 'idle',
                winner: null,
                participants: resetParticipants
            };
        default:
            return state;
    }
}

export function useBattleEngine(blades: Beyblade[]) {
    // Memoize initial state creation? Use lazy init
    const [state, dispatch] = useReducer(battleReducer, blades, createInitialState);
    const stateRef = useRef(state);

    // Keep ref synced with state
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Update state if blades change (e.g. new battle selection)
    useEffect(() => {
        // Reset/Re-init if blades change significantly (different IDs)
        // For simplicity, we can just dispatch RESET which handles HP refresh
        // But if IDs change completely, we might need to recreate participants.
        // For now, assume this hook is mounted fresh for each battle or handled by parent.
    }, [blades]);

    const calculateDamage = useCallback((attacker: Beyblade, defender: Beyblade) => {
        const base = GAME_CONFIG.BASE_DAMAGE;
        const atkBonus = attacker.stats.ATK * 0.5;
        const defReduct = defender.stats.DEF * 0.3;
        const variance = randomInt(-5, 5);

        let damage = Math.max(1, base + atkBonus - defReduct + variance);

        // Critical hit chance based on Speed difference
        const critChance = attacker.stats.SPD > defender.stats.SPD ? 0.15 : 0.05;
        const isCrit = Math.random() < critChance;

        if (isCrit) {
            damage *= GAME_CONFIG.CRIT_MULTIPLIER;
        }

        return { damage: Math.floor(damage), isCrit };
    }, []);

    useEffect(() => {
        if (state.status !== 'fighting') return;

        const timerId = setInterval(() => {
            const currentState = stateRef.current;
            const activeIds = Object.keys(currentState.participants).filter(id => !currentState.participants[id].isDead);

            // End Condition
            const battleDuration = GAME_CONFIG.BATTLE_DURATION_SEC - currentState.timer;
            const MIN_BATTLE_TIME = GAME_CONFIG.MIN_DURATION_SEC;

            // 1v1 End
            if (activeIds.length <= 1 && battleDuration >= MIN_BATTLE_TIME) {
                const winner = activeIds.length === 1 ? activeIds[0] : 'draw';
                audioManager.playWin();
                dispatch({ type: 'END_BATTLE', payload: { winner } });
                return;
            }

            // Time Limit End
            if (currentState.timer <= 0 && battleDuration >= MIN_BATTLE_TIME) {
                // Winner is highest HP
                const sorted = Object.keys(currentState.participants).sort((a, b) => currentState.participants[b].hp - currentState.participants[a].hp);
                audioManager.playWin();
                dispatch({ type: 'END_BATTLE', payload: { winner: sorted[0] } });
                return;
            }

            // Min Duration Enforcement
            // If we should be ending but min time isn't met, we keep them at 1 HP inside the damage logic below or just don't end.
            // The above checks handle the "don't end" part.

            // Collision Logic (N-way)
            const clashChance = 0.3; // Per pair? Or global?
            // For N > 2, we should probably check pairs randomly.
            // Let's pick two random active blades to potentially clash.
            if (activeIds.length >= 2) {
                const willClash = Math.random() < clashChance;

                if (willClash) {
                    // Pick 2 random distinct fighters
                    const idx1 = randomInt(0, activeIds.length - 1);
                    let idx2 = randomInt(0, activeIds.length - 1);
                    while (idx2 === idx1) idx2 = randomInt(0, activeIds.length - 1);

                    const id1 = activeIds[idx1];
                    const id2 = activeIds[idx2];

                    const blade1 = blades.find(b => b.id === id1)!;
                    const blade2 = blades.find(b => b.id === id2)!;

                    const hit1 = calculateDamage(blade1, blade2); // 1 hits 2
                    const hit2 = calculateDamage(blade2, blade1); // 2 hits 1

                    const newLogs: BattleLog[] = [];
                    const timestamp = Date.now();
                    let someCrit = false;

                    // Log logic...
                    if (hit1.isCrit || hit2.isCrit) {
                        someCrit = true;
                        newLogs.push({
                            id: `crit-${timestamp}`,
                            timestamp,
                            message: `CRITICAL IMPACT!`,
                            type: 'critical',
                            damage: hit1.isCrit ? hit1.damage : hit2.damage
                        });
                    }

                    if (someCrit) audioManager.playCritical();
                    else audioManager.playClash();

                    if (!someCrit) {
                        newLogs.push({
                            id: `clash-${timestamp}`,
                            timestamp,
                            message: `${blade1.name} clashes with ${blade2.name}`,
                            type: 'clash'
                        });
                    }

                    // Enforce Min Duration (Clamp damage if < 10s)
                    let dmgTo1 = hit2.damage;
                    let dmgTo2 = hit1.damage;

                    if (battleDuration < MIN_BATTLE_TIME) {
                        if (currentState.participants[id1].hp - dmgTo1 <= 0) dmgTo1 = 0;
                        if (currentState.participants[id2].hp - dmgTo2 <= 0) dmgTo2 = 0;
                    }

                    dispatch({
                        type: 'TICK',
                        payload: {
                            logs: newLogs,
                            damageMap: {
                                [id1]: dmgTo1,
                                [id2]: dmgTo2
                            }
                        }
                    });

                } else {
                    dispatch({ type: 'TICK', payload: { logs: [], damageMap: {} } });
                }
            } else {
                dispatch({ type: 'TICK', payload: { logs: [], damageMap: {} } });
            }

        }, GAME_CONFIG.TICK_RATE_MS);

        return () => clearInterval(timerId);
    }, [state.status, blades, calculateDamage]);

    return {
        state,
        startBattle: () => dispatch({ type: 'START_BATTLE' }),
        resetBattle: () => dispatch({ type: 'RESET' }),
    };
}
