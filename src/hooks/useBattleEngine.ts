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

// Initial state creation supporting Teams
const createInitialState = (
    teamA: Beyblade[],
    teamB: Beyblade[],
    gameMode: '1v1' | '2v2' | 'royal-rumble' = '1v1'
): BattleState => {
    const participants: BattleState['participants'] = {};
    const playerIds: string[] = [];
    const opponentIds: string[] = [];

    // Initialize Team A (Player)
    teamA.forEach(b => {
        playerIds.push(b.id);
        participants[b.id] = {
            hp: INITIAL_HP,
            maxHP: INITIAL_HP,
            name: b.name,
            image: b.image,
            isDead: false,
            teamId: 'player'
        };
    });

    // Initialize Team B (Opponent)
    teamB.forEach(b => {
        opponentIds.push(b.id);
        participants[b.id] = {
            hp: INITIAL_HP,
            maxHP: INITIAL_HP,
            name: b.name,
            image: b.image,
            isDead: false,
            teamId: 'opponent'
        };
    });

    return {
        playerHP: INITIAL_HP, // Visual Aggregate or Captain HP
        opponentHP: INITIAL_HP,
        playerMaxHP: INITIAL_HP, // Could be sum of team?
        opponentMaxHP: INITIAL_HP,
        timer: GAME_CONFIG.BATTLE_DURATION_SEC,
        logs: [],
        status: 'idle',
        winner: null,
        playerId: teamA[0]?.id || '',
        opponentId: teamB[0]?.id || '',
        teams: {
            player: playerIds,
            opponent: opponentIds
        },
        gameMode,
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
                if (participant && !participant.isDead) { // Only damage living
                    let newHP = participant.hp - damage;

                    // Invincibility Frame
                    if (currentDuration < MIN_DURATION && newHP <= 0) {
                        newHP = 1;
                    }

                    participant.hp = Math.max(0, newHP);

                    if (participant.hp <= 0) {
                        participant.isDead = true;
                        // Log death?
                    }
                }
            });

            // Robust Mapping using stored IDs
            const p1 = newParticipants[state.playerId];
            const p2 = newParticipants[state.opponentId];

            // Victory Logic for Teams
            const playerTeamAlive = state.teams.player.some(id => !newParticipants[id].isDead);
            const opponentTeamAlive = state.teams.opponent.some(id => !newParticipants[id].isDead);
            let winner = null;

            if (!playerTeamAlive && !opponentTeamAlive) winner = 'draw';
            else if (!playerTeamAlive) winner = 'opponent'; // Team B wins
            else if (!opponentTeamAlive) winner = 'player'; // Team A wins

            // If winner found here via death (Knockout)
            if (winner) {
                // Return here or dispatch END_BATTLE in effect? 
                // Reducers should just update state. Effect will see winner and trigger audio.
                // But we need to set status to finished.
            }

            return {
                ...state,
                participants: newParticipants,
                playerHP: p1 ? p1.hp : state.playerHP,
                opponentHP: p2 ? p2.hp : state.opponentHP,
                logs: [...state.logs, ...action.payload.logs],
                timer: Math.max(0, state.timer - (GAME_CONFIG.TICK_RATE_MS / 1000)),
                // Determine winner in effect to play audio, but we can pre-calc status here if needed
            };

        case 'END_BATTLE':
            return { ...state, status: 'finished', winner: action.payload.winner };

        case 'RESET':
            // Simple reset for now, might need full re-init via props change
            const resetParticipants = { ...state.participants };
            Object.keys(resetParticipants).forEach(key => {
                resetParticipants[key].hp = resetParticipants[key].maxHP;
                resetParticipants[key].isDead = false;
            });
            return {
                ...state,
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

export function useBattleEngine(teamA: Beyblade[], teamB: Beyblade[], gameMode: '1v1' | '2v2' = '1v1') {
    // Wrap init to pass all args
    const [state, dispatch] = useReducer(battleReducer, null, () => createInitialState(teamA, teamB, gameMode));
    const stateRef = useRef(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Re-init if teams change significantly
    useEffect(() => {
        // Checking if IDs changed to avoid unnecessary resets
        const currentP = state.teams.player.join(',');
        const newP = teamA.map(b => b.id).join(',');
        const currentO = state.teams.opponent.join(',');
        const newO = teamB.map(b => b.id).join(',');

        if (currentP !== newP || currentO !== newO || state.gameMode !== gameMode) {
            // We can't easily swap state in reducer without a special action. 
            // Ideally we should key the component using this hook to force remount.
            // verifying 'resetBattle' handles simple restarts.
        }
    }, [teamA, teamB, gameMode, state.teams, state.gameMode]);


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

            // End Condition Logic
            const battleDuration = GAME_CONFIG.BATTLE_DURATION_SEC - currentState.timer;
            const MIN_BATTLE_TIME = GAME_CONFIG.MIN_DURATION_SEC;

            // Check Teams Alive
            const playerTeamAlive = currentState.teams.player.some(id => !currentState.participants[id].isDead);
            const opponentTeamAlive = currentState.teams.opponent.some(id => !currentState.participants[id].isDead);

            if (battleDuration >= MIN_BATTLE_TIME) {
                if (!playerTeamAlive && !opponentTeamAlive) {
                    audioManager.playWin();
                    dispatch({ type: 'END_BATTLE', payload: { winner: 'draw' } });
                    return;
                } else if (!playerTeamAlive) {
                    audioManager.playWin();
                    dispatch({ type: 'END_BATTLE', payload: { winner: teamB[0].id } }); // Or 'opponent'
                    return;
                } else if (!opponentTeamAlive) {
                    audioManager.playWin();
                    dispatch({ type: 'END_BATTLE', payload: { winner: teamA[0].id } }); // Or 'player'
                    return;
                }
            }

            // Time Limit End
            if (currentState.timer <= 0 && battleDuration >= MIN_BATTLE_TIME) {
                // Sum HP per team
                const hpA = currentState.teams.player.reduce((sum, id) => sum + currentState.participants[id].hp, 0);
                const hpB = currentState.teams.opponent.reduce((sum, id) => sum + currentState.participants[id].hp, 0);

                const winnerId = hpA >= hpB ? teamA[0].id : teamB[0].id;
                audioManager.playWin();
                dispatch({ type: 'END_BATTLE', payload: { winner: winnerId } });
                return;
            }

            // Collision Logic (Team Aware)
            const clashChance = 0.3;
            if (activeIds.length >= 2) {
                const willClash = Math.random() < clashChance;

                if (willClash) {
                    // Pick 1 from active IDs
                    const idx1 = randomInt(0, activeIds.length - 1);
                    const id1 = activeIds[idx1];
                    const p1 = currentState.participants[id1];

                    // Identify potential targets (Must be OPPOSITE TEAM)
                    const validTargets = activeIds.filter(id => currentState.participants[id].teamId !== p1.teamId);

                    if (validTargets.length > 0) {
                        const idx2 = randomInt(0, validTargets.length - 1);
                        const id2 = validTargets[idx2];

                        // Find Blade Objects
                        const blade1 = [...teamA, ...teamB].find(b => b.id === id1)!;
                        const blade2 = [...teamA, ...teamB].find(b => b.id === id2)!;

                        const hit1 = calculateDamage(blade1, blade2); // 1 hits 2
                        const hit2 = calculateDamage(blade2, blade1); // 2 hits 1

                        const newLogs: BattleLog[] = [];
                        const timestamp = Date.now();
                        let someCrit = false;

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
                        // No valid targets (enemy team dead but battle not ended?)
                        dispatch({ type: 'TICK', payload: { logs: [], damageMap: {} } });
                    }

                } else {
                    dispatch({ type: 'TICK', payload: { logs: [], damageMap: {} } });
                }
            } else {
                dispatch({ type: 'TICK', payload: { logs: [], damageMap: {} } });
            }

        }, GAME_CONFIG.TICK_RATE_MS);

        return () => clearInterval(timerId);
    }, [state.status, teamA, teamB, calculateDamage]);

    return {
        state,
        startBattle: () => dispatch({ type: 'START_BATTLE' }),
        resetBattle: () => dispatch({ type: 'RESET' }),
    };
}
