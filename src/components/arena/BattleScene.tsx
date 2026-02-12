'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { BattleState, Beyblade } from '@/types/game';
import * as THREE from 'three';
import { Beyblade3D } from './Beyblade3D';

interface BattleSceneProps {
    state: BattleState;
    player: Beyblade;
    opponent: Beyblade;
}

// Physics Config
const FIELD_RADIUS = 14;
const GRAVITY = 0.15; // Pull to center
const BLADE_RADIUS = 2.0;

export function BattleScene({ state, player, opponent }: BattleSceneProps) {
    return (
        <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 20, 30]} fov={45} />
            <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2.5} />

            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
            <spotLight position={[0, 20, 0]} angle={0.5} penumbra={1} intensity={2} castShadow />

            {/* Environment */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ArenaFloor />

            {/* Physics Manager & Beyblades */}
            <BattleManager state={state} player={player} opponent={opponent} />
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

function BattleManager({ state, player, opponent }: BattleSceneProps) {
    const playerMesh = useRef<THREE.Group>(null);
    const opponentMesh = useRef<THREE.Group>(null);

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
                color: Math.random() > 0.5 ? '#facc15' : '#f97316' // Yellow/Orange
            });
        }
        setSparks(prev => [...prev, ...newSparks]);
    };

    // Physics State
    const physics = useRef({
        p1: {
            pos: new THREE.Vector3(-6, 0, -2),
            vel: new THREE.Vector3(0, 0, 0),
            mass: 1
        },
        p2: {
            pos: new THREE.Vector3(6, 0, 2),
            vel: new THREE.Vector3(0, 0, 0),
            mass: 1
        }
    });

    const initialized = useRef(false);
    const lastCollisionTime = useRef(0);

    useEffect(() => {
        // Reset physics on new battle start
        if (state.status === 'fighting') {
            physics.current.p1.mass = 1 + (player.stats.DEF / 100);
            physics.current.p2.mass = 1 + (opponent.stats.DEF / 100);

            physics.current.p1.pos.set(-6, 0, -2);
            physics.current.p2.pos.set(6, 0, 2);

            const p1Spd = 0.3 + (player.stats.SPD / 300);
            const p2Spd = 0.3 + (opponent.stats.SPD / 300);

            physics.current.p1.vel.set(0.1, 0, p1Spd);
            physics.current.p2.vel.set(-0.1, 0, -p2Spd);

            initialized.current = true;
            setSparks([]);
        }
    }, [state.status, player, opponent]);

    useFrame((_, delta) => {
        // Update Sparks
        setSparks(prev => prev.map(s => ({
            ...s,
            x: s.x + s.vx,
            z: s.z + s.vz,
            life: s.life - delta * 3, // Fade out speed
            vx: s.vx * 0.9,
            vz: s.vz * 0.9
        })).filter(s => s.life > 0));

        if (!playerMesh.current || !opponentMesh.current) return;

        const p1 = physics.current.p1;
        const p2 = physics.current.p2;

        if (state.status === 'fighting') {
            // 1. Apply Forces (Gravity/Slope)
            const applySlope = (obj: typeof p1) => {
                const dist = Math.sqrt(obj.pos.x ** 2 + obj.pos.z ** 2);
                if (dist > 0) {
                    const force = GRAVITY * (dist / FIELD_RADIUS);
                    const angle = Math.atan2(obj.pos.z, obj.pos.x);
                    obj.vel.x -= Math.cos(angle) * force * 0.1;
                    obj.vel.z -= Math.sin(angle) * force * 0.1;
                }
            };
            applySlope(p1);
            applySlope(p2);

            // 2. Movement
            p1.pos.add(p1.vel);
            p2.pos.add(p2.vel);

            // 3. Wall Collision
            const checkWall = (obj: typeof p1) => {
                const dist = Math.sqrt(obj.pos.x ** 2 + obj.pos.z ** 2);
                if (dist > FIELD_RADIUS - BLADE_RADIUS) {
                    const normal = new THREE.Vector3(-obj.pos.x, 0, -obj.pos.z).normalize();
                    const dot = obj.vel.dot(normal);

                    if (dot < 0) {
                        obj.vel.reflect(normal).multiplyScalar(0.7);
                        const overlap = dist - (FIELD_RADIUS - BLADE_RADIUS);
                        obj.pos.add(normal.multiplyScalar(overlap));
                    }
                }
            };
            checkWall(p1);
            checkWall(p2);

            // 4. Blade Collision
            const dx = p2.pos.x - p1.pos.x;
            const dz = p2.pos.z - p1.pos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const minDist = BLADE_RADIUS * 2;

            if (dist < minDist) {
                // Collision!
                const now = Date.now();
                if (now - lastCollisionTime.current > 100) { // Limit spark frequency
                    const midX = (p1.pos.x + p2.pos.x) / 2;
                    const midZ = (p1.pos.z + p2.pos.z) / 2;
                    createSparks(midX, midZ, 1.5);
                    lastCollisionTime.current = now;
                }

                const nx = dx / dist;
                const nz = dz / dist;

                const rvx = p2.vel.x - p1.vel.x;
                const rvz = p2.vel.z - p1.vel.z;
                const velAlongNormal = rvx * nx + rvz * nz;

                if (velAlongNormal < 0) {
                    const restitution = 1.5;
                    let j = -(1 + restitution) * velAlongNormal;
                    j /= (1 / p1.mass + 1 / p2.mass);

                    const impulseX = j * nx;
                    const impulseZ = j * nz;
                    const repulsion = 0.5;

                    p1.vel.x -= (impulseX + nx * -repulsion) / p1.mass;
                    p1.vel.z -= (impulseZ + nz * -repulsion) / p1.mass;
                    p2.vel.x += (impulseX + nx * repulsion) / p2.mass;
                    p2.vel.z += (impulseZ + nz * repulsion) / p2.mass;
                }

                const overlap = minDist - dist;
                const separationX = nx * overlap * 0.51;
                const separationZ = nz * overlap * 0.51;

                p1.pos.x -= separationX;
                p1.pos.z -= separationZ;
                p2.pos.x += separationX;
                p2.pos.z += separationZ;
            }
        }

        // 5. Update Meshes & Rotation
        playerMesh.current.position.set(p1.pos.x, 0, p1.pos.z);
        opponentMesh.current.position.set(p2.pos.x, 0, p2.pos.z);

        const p1HealthRatio = Math.max(0, state.playerHP / state.playerMaxHP);
        const p2HealthRatio = Math.max(0, state.opponentHP / state.opponentMaxHP);

        const p1SpinSpd = 0.1 + (p1HealthRatio * 0.3);
        const p2SpinSpd = 0.1 + (p2HealthRatio * 0.3);

        if (state.status !== 'finished') {
            playerMesh.current.rotation.y += p1SpinSpd;
            opponentMesh.current.rotation.y -= p2SpinSpd;

            playerMesh.current.rotation.x = p1.vel.z * 1.5;
            playerMesh.current.rotation.z = -p1.vel.x * 1.5;
            opponentMesh.current.rotation.x = p2.vel.z * 1.5;
            opponentMesh.current.rotation.z = -p2.vel.x * 1.5;
        } else {
            const t = Date.now() / 1000;
            if (state.winner === player.id) {
                playerMesh.current.position.y = Math.abs(Math.sin(t * 10)) * 1.5;
                playerMesh.current.rotation.y += 0.2;
                opponentMesh.current.rotation.x = Math.PI / 4;
                opponentMesh.current.position.y = 0;
            } else if (state.winner === opponent.id) {
                opponentMesh.current.position.y = Math.abs(Math.sin(t * 10)) * 1.5;
                opponentMesh.current.rotation.y -= 0.2;
                playerMesh.current.rotation.x = Math.PI / 4;
                playerMesh.current.position.y = 0;
            }
        }
    });

    return (
        <>
            <Beyblade3D ref={playerMesh} blade={player} />
            <Beyblade3D ref={opponentMesh} blade={opponent} />

            {/* Sparks Rendering */}
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


