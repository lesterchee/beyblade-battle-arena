import React from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { Beyblade } from '@/types/game';

interface Beyblade3DProps {
    blade: Beyblade;
}

export const Beyblade3D = React.forwardRef<THREE.Group, Beyblade3DProps>(({ blade }, ref) => {
    const texture = useLoader(THREE.TextureLoader, blade.image || '');

    return (
        <group ref={ref}>
            <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
                <cylinderGeometry args={[2, 1.5, 1, 32]} />
                <meshStandardMaterial color={blade.color} metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[0, 1.01, 0]} rotation={[0, Math.PI, 0]}>
                <cylinderGeometry args={[1.6, 1.6, 0.1, 32]} />
                <meshBasicMaterial map={texture} />
            </mesh>
            <mesh position={[0, 1.1, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 0.1, 16]} />
                <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
                <torusGeometry args={[2.1, 0.1, 8, 32]} />
                <meshStandardMaterial color={blade.color} emissive={blade.color} emissiveIntensity={2} toneMapped={false} />
            </mesh>
        </group>
    );
});
Beyblade3D.displayName = 'Beyblade3D';
