'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { BattleState, Beyblade } from '@/types/game';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BattleSceneProps {
    state: BattleState;
    player: Beyblade;
    opponent: Beyblade;
}

export function BattleScene({ state, player, opponent }: BattleSceneProps) {
    return (
        <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 15, 25]} fov={50} />
            <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2.5} />

            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
            <spotLight position={[0, 20, 0]} angle={0.5} penumbra={1} intensity={2} castShadow />

            {/* Environment */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ArenaFloor />

            {/* Beyblades */}
            <Beyblade3D
                blade={player}
                isPlayer={true}
                hp={state.playerHP}
                isWinner={state.winner === player.id}
                isLoser={!!state.winner && state.winner !== 'draw' && state.winner !== player.id}
            />
            <Beyblade3D
                blade={opponent}
                isPlayer={false}
                hp={state.opponentHP}
                isWinner={state.winner === opponent.id}
                isLoser={!!state.winner && state.winner !== 'draw' && state.winner !== opponent.id}
            />
        </Canvas>
    );
}

function ArenaFloor() {
    return (
        <group position={[0, -2, 0]}>
            {/* Main Floor */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[15, 64]} />
                <meshStandardMaterial
                    color="#1e293b"
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Grid Lines */}
            <gridHelper args={[30, 30, '#334155', '#334155']} position={[0, 0.01, 0]} />

            {/* Outer Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                <ringGeometry args={[14.8, 15.5, 64]} />
                <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={2} toneMapped={false} />
            </mesh>
        </group>
    );
}

interface Beyblade3DProps {
    blade: Beyblade;
    isPlayer: boolean;
    hp: number;
    isWinner: boolean;
    isLoser: boolean;
}

function Beyblade3D({ blade, isPlayer, hp, isWinner, isLoser }: Beyblade3DProps) {
    const meshRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (!meshRef.current) return;

        const t = clock.getElapsedTime();

        // Winner Animation: Bounce in joy
        if (isWinner) {
            const bounce = Math.abs(Math.sin(t * 5)) * 2; // Fast bounce
            meshRef.current.position.y = bounce;
            meshRef.current.rotation.y += 0.1;
            return;
        }

        // Loser Animation: Fly out
        if (isLoser) {
            const flySpeed = 0.5;
            const direction = isPlayer ? -1 : 1; // Fly away from center based on side? 
            // Actually, just let them fly off tangent or straight back
            // Let's make them fly UP and AWAY
            meshRef.current.position.y += 0.2;
            meshRef.current.position.x += direction * 0.2;
            meshRef.current.rotation.z += 0.2; // Tumble
            return;
        }

        // Normal Battle Animation
        const speed = blade.stats.SPD / 20; // Scale speed
        const phaseOffset = isPlayer ? 0 : Math.PI; // Start opposite
        const direction = isPlayer ? 1 : -1;

        // Orbit radius
        const radius = 6;

        // Position
        const x = Math.cos(t * speed * direction + phaseOffset) * radius;
        const z = Math.sin(t * speed * direction + phaseOffset) * radius;

        // Wobble effect based on maxHP vs current HP or just random
        const wobble = Math.sin(t * 10) * 0.1;

        meshRef.current.position.set(x, 0, z);
        meshRef.current.rotation.y += 0.2; // Spin on axis
        meshRef.current.rotation.z = wobble; // Wobble
    });

    return (
        <group ref={meshRef}>
            {/* Body */}
            <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
                <cylinderGeometry args={[2, 1.5, 1, 32]} />
                <meshStandardMaterial color={blade.color} metalness={0.6} roughness={0.3} />
            </mesh>

            {/* Spinner Top */}
            <mesh position={[0, 1.1, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 0.5, 16]} />
                <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.1} />
            </mesh>

            {/* Glow Ring */}
            <mesh position={[0, 0.5, 0]}>
                <torusGeometry args={[2.1, 0.1, 8, 32]} />
                <meshStandardMaterial color={blade.color} emissive={blade.color} emissiveIntensity={2} toneMapped={false} />
            </mesh>
        </group>
    );
}
