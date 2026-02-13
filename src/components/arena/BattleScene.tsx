'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { BattleState, Beyblade } from '@/types/game';
import { GAME_CONFIG } from '@/lib/constants';
import * as THREE from 'three';
import { Beyblade3D } from './Beyblade3D';

interface BattleSceneProps {
    state: BattleState;
    blades: Beyblade[];
}

// Physics Config
const FIELD_RADIUS = 14;
const GRAVITY = 0.15; // Pull to center
const BLADE_RADIUS = 2.0;

export function BattleScene({ state, blades }: BattleSceneProps) {
    return (
        <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 25, 35]} fov={45} />
            <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2.5} />

            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
            <spotLight position={[0, 20, 0]} angle={0.5} penumbra={1} intensity={2} castShadow />

            {/* Environment */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ArenaFloor />

            {/* Physics Manager & Beyblades */}
            <BattleManager state={state} blades={blades} />
        </Canvas>
    );
}

// Spark Particle System
interface Spark {
    id: number;
    x: number;
    z: number;
    vx: number;
    vz: number;
    life: number;
    color: string;
}

interface PhysicsBody {
    id: string;
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    mass: number;
}

function BattleManager({ state, blades }: BattleSceneProps) {
    // We use a Map to store refs for dynamic rendering
    const meshesRef = useRef<Map<string, THREE.Group>>(new Map());

    // Sparks State
    const [sparks, setSparks] = useState<Spark[]>([]);
    const sparkIdCounter = useRef(0);

    const createSparks = (x: number, z: number, intensity: number) => {
        const newSparks: Spark[] = [];
        const count = Math.floor(10 * intensity);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.5 * intensity;
            newSparks.push({
                id: sparkIdCounter.current++,
                x,
                z,
                vx: Math.cos(angle) * speed,
                vz: Math.sin(angle) * speed,
                life: 1.0,
                color: Math.random() > 0.5 ? '#facc15' : '#f97316'
            });
        }
        setSparks(prev => [...prev, ...newSparks]);
    };

    // Physics State
    const physics = useRef<Record<string, PhysicsBody>>({});
    const lastCollisionTime = useRef<Map<string, number>>(new Map());
    const initialized = useRef(false);

    // Initialize/Reset Physics
    useEffect(() => {
        if (state.status === 'fighting') {
            if (initialized.current) return;

            const newPhysics: Record<string, PhysicsBody> = {};
            const count = blades.length;
            // ... (rest of logic) ...

            if (count === 2) {
                // Classic VS Mode: Authentic Physics with Type Differentiation
                const p1 = blades[0];
                const p2 = blades[1];

                // Helper to get launch vectors based on type
                const getLaunch = (blade: Beyblade, sideMultiplier: number) => {
                    const isAttack = blade.type === 'Attack' || blade.type === 'Balance';
                    const spd = blade.stats.SPD / 100;

                    if (isAttack) {
                        // flower pattern: High tangential speed to ride the ridge
                        return {
                            pos: new THREE.Vector3(-8 * sideMultiplier, 0, -4 * sideMultiplier), // Far out
                            vel: new THREE.Vector3(0.15 * sideMultiplier, 0, (0.5 + spd * 0.2)), // Very high orbit speed
                        };
                    } else {
                        // defense/stamina: Center holder
                        return {
                            pos: new THREE.Vector3(-5 * sideMultiplier, 0, -2 * sideMultiplier), // Closer in
                            vel: new THREE.Vector3(0.05 * sideMultiplier, 0, (0.2 + spd * 0.1)), // Low speed, falls to center
                        };
                    }
                };

                const p1Launch = getLaunch(p1, 1);
                const p2Launch = getLaunch(p2, -1);

                newPhysics[p1.id] = {
                    id: p1.id,
                    pos: p1Launch.pos,
                    vel: p1Launch.vel,
                    mass: 1 + (p1.stats.DEF / 100)
                };

                newPhysics[p2.id] = {
                    id: p2.id,
                    pos: p2Launch.pos,
                    vel: p2Launch.vel,
                    mass: 1 + (p2.stats.DEF / 100)
                };
            } else {
                // Royal Rumble: Circular Distribution
                blades.forEach((blade, index) => {
                    const angle = (index / count) * Math.PI * 2;
                    const startRadius = 9 + (count > 4 ? 2 : 0); // Wider circle

                    newPhysics[blade.id] = {
                        id: blade.id,
                        pos: new THREE.Vector3(Math.cos(angle) * startRadius, 0, Math.sin(angle) * startRadius),
                        vel: new THREE.Vector3(0, 0, 0),
                        mass: 1 + (blade.stats.DEF / 100)
                    };

                    // Swirl Logic: Combine inward pull with tangential orbit
                    const spd = 0.25 + (blade.stats.SPD / 400);
                    const toCenter = new THREE.Vector3(-Math.cos(angle), 0, -Math.sin(angle)); // Inward
                    const tangent = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle)); // Counter-clockwise

                    newPhysics[blade.id].vel.copy(toCenter).multiplyScalar(spd * 0.5)
                        .add(tangent.multiplyScalar(spd * 0.5))
                        .add(new THREE.Vector3((Math.random() - 0.5) * 0.05, 0, (Math.random() - 0.5) * 0.05));
                });
            }

            physics.current = newPhysics;
            setSparks([]);
            initialized.current = true;
        } else {
            initialized.current = false;
        }
    }, [state.status, blades]);

    useFrame((_, delta) => {
        // Update Sparks
        setSparks(prev => prev.map(s => ({
            ...s,
            x: s.x + s.vx,
            z: s.z + s.vz,
            life: s.life - delta * 3,
            vx: s.vx * 0.9,
            vz: s.vz * 0.9
        })).filter(s => s.life > 0));

        if (state.status === 'fighting') {
            const bodies = Object.values(physics.current);
            const activeBodies = bodies.filter(b => !state.participants[b.id]?.isDead);

            activeBodies.forEach(b => {
                // 1. Forces
                const dist = Math.sqrt(b.pos.x ** 2 + b.pos.z ** 2);
                if (dist > 0) {
                    const force = GRAVITY * (dist / FIELD_RADIUS);
                    const angle = Math.atan2(b.pos.z, b.pos.x);
                    b.vel.x -= Math.cos(angle) * force * 0.1;
                    b.vel.z -= Math.sin(angle) * force * 0.1;
                }

                // 2. Movement
                b.pos.add(b.vel);

                // 3. Wall Collision
                // 3. Wall Collision
                const isEarlyGame = (GAME_CONFIG.BATTLE_DURATION_SEC - state.timer) < GAME_CONFIG.MIN_DURATION_SEC;
                // Actually simpler: if state.status is fighting and timer is high.
                // We'll revert to simple physics reflect but with a hard clamp if early game.

                if (dist > FIELD_RADIUS - BLADE_RADIUS) {
                    const normal = new THREE.Vector3(-b.pos.x, 0, -b.pos.z).normalize();

                    if (b.vel.dot(normal) < 0) {
                        // Standard bounce
                        b.vel.reflect(normal).multiplyScalar(0.7);
                        const overlap = dist - (FIELD_RADIUS - BLADE_RADIUS);
                        b.pos.add(normal.multiplyScalar(overlap));
                    }

                    // SAFETY NET: If early game, Force pull back if they are somehow still out
                    if (isEarlyGame && dist > FIELD_RADIUS - 0.5) {
                        b.vel.add(normal.multiplyScalar(0.5)); // Hard push in
                        b.pos.add(normal.multiplyScalar(0.5));
                    }
                }
            });

            // 4. Blade vs Blade Collision (Naive O(N^2))
            for (let i = 0; i < activeBodies.length; i++) {
                for (let j = i + 1; j < activeBodies.length; j++) {
                    const b1 = activeBodies[i];
                    const b2 = activeBodies[j];

                    const dx = b2.pos.x - b1.pos.x;
                    const dz = b2.pos.z - b1.pos.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    const minDist = BLADE_RADIUS * 2;

                    if (dist < minDist) {
                        // Collision
                        const now = Date.now();
                        const pairId = [b1.id, b2.id].sort().join('-');
                        const lastTime = lastCollisionTime.current.get(pairId) || 0;

                        if (now - lastTime > 100) {
                            const midX = (b1.pos.x + b2.pos.x) / 2;
                            const midZ = (b1.pos.z + b2.pos.z) / 2;
                            createSparks(midX, midZ, 1.5);
                            lastCollisionTime.current.set(pairId, now);
                        }

                        const nx = dx / dist;
                        const nz = dz / dist;
                        const rvx = b2.vel.x - b1.vel.x;
                        const rvz = b2.vel.z - b1.vel.z;
                        const velAlongNormal = rvx * nx + rvz * nz;

                        if (velAlongNormal < 0) {
                            const restitution = 1.5;
                            let impulse = -(1 + restitution) * velAlongNormal;
                            impulse /= (1 / b1.mass + 1 / b2.mass);

                            const impulseX = impulse * nx;
                            const impulseZ = impulse * nz;
                            const repulsion = 0.5;

                            b1.vel.x -= (impulseX + nx * -repulsion) / b1.mass;
                            b1.vel.z -= (impulseZ + nz * -repulsion) / b1.mass;
                            b2.vel.x += (impulseX + nx * repulsion) / b2.mass;
                            b2.vel.z += (impulseZ + nz * repulsion) / b2.mass;
                        }

                        const overlap = minDist - dist;
                        b1.pos.x -= nx * overlap * 0.51;
                        b1.pos.z -= nz * overlap * 0.51;
                        b2.pos.x += nx * overlap * 0.51;
                        b2.pos.z += nz * overlap * 0.51;
                    }
                }
            }
        }

        // 5. Update Meshes
        blades.forEach(blade => {
            const mesh = meshesRef.current.get(blade.id);
            const physicsBody = physics.current[blade.id];

            if (mesh && physicsBody) {
                mesh.position.set(physicsBody.pos.x, 0, physicsBody.pos.z);

                const data = state.participants[blade.id];
                const hpRatio = data ? Math.max(0, data.hp / data.maxHP) : 0;
                const spinSpd = 0.1 + (hpRatio * 0.3);

                // Spin
                if (state.status !== 'finished' && !data?.isDead) {
                    mesh.rotation.y += spinSpd;
                    // Tilt
                    mesh.rotation.x = physicsBody.vel.z * 1.5;
                    mesh.rotation.z = -physicsBody.vel.x * 1.5;
                } else if (state.winner === blade.id && state.status === 'finished') {
                    // Victory Dance
                    const t = Date.now() / 1000;
                    mesh.position.y = Math.abs(Math.sin(t * 10)) * 1.5;
                    mesh.rotation.y += 0.2;
                } else if (data?.isDead) {
                    // Dead state - stop spinning, maybe tip over
                    if (mesh.rotation.x < Math.PI / 2) mesh.rotation.x += 0.05;
                }
            }
        });
    });

    return (
        <>
            {blades.map(blade => (
                <Beyblade3D
                    key={blade.id}
                    ref={(el) => {
                        if (el) meshesRef.current.set(blade.id, el);
                        else meshesRef.current.delete(blade.id);
                    }}
                    blade={blade}
                />
            ))}

            <group>
                {sparks.map(s => (
                    <mesh key={s.id} position={[s.x, 0.5, s.z]}>
                        <boxGeometry args={[0.2 * s.life, 0.2 * s.life, 0.2 * s.life]} />
                        <meshBasicMaterial color={s.color} transparent opacity={s.life} />
                    </mesh>
                ))}
            </group>
        </>
    );
}

function ArenaFloor() {
    return (
        <group position={[0, -2, 0]}>
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[15, 64]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
            </mesh>
            <gridHelper args={[30, 30, '#334155', '#334155']} position={[0, 0.01, 0]} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                <ringGeometry args={[14.8, 15.5, 64]} />
                <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={2} toneMapped={false} />
            </mesh>
        </group>
    );
}
