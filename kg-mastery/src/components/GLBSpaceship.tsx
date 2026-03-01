import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

function GeiselSpaceship() {
  const { scene } = useGLTF("/assets/geisel_library.glb");
  const spaceshipRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Mesh>(null);

  // Clone the scene to ensure we can use it safely
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useFrame((state) => {
    if (spaceshipRef.current) {
      // Bobbing motion
      spaceshipRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
      // Slight rotation
      spaceshipRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      spaceshipRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.05;
    }
    
    if (flameRef.current) {
      // Pulsing flame effect
      const scaleY = 1 + Math.random() * 0.5 + Math.sin(state.clock.elapsedTime * 20) * 0.5;
      flameRef.current.scale.set(1, scaleY, 1);
      
      // Update flame material opacity/emissive intensity if possible
      const material = flameRef.current.material as THREE.MeshStandardMaterial;
      if (material) {
        material.emissiveIntensity = 1 + Math.random() * 0.5;
      }
    }
  });

  return (
    <group ref={spaceshipRef} position={[0, 0, 0]} rotation={[0.4, -0.2, 0.1]}>
      {/* The 3D Model */}
      <primitive object={clonedScene} scale={0.012} position={[0, 0.5, 0]} />
      
      {/* Rocket Thruster Flame */}
      <mesh ref={flameRef} position={[0, -0.4, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.15, 1.2, 32]} />
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ffff" 
          emissiveIntensity={2} 
          transparent 
          opacity={0.8} 
        />
      </mesh>
      
      <mesh position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.08, 2, 32]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={4} 
          transparent 
          opacity={0.9} 
        />
      </mesh>
    </group>
  );
}

export default function GLBSpaceshipCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={1} color="#e879f9" />
      <GeiselSpaceship />
    </Canvas>
  );
}
