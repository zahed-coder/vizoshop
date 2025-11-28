  // src/components/ThreeDScene.jsx (No changes needed)
  import { Canvas, useFrame } from '@react-three/fiber';
  import { useGLTF, Environment, Float } from '@react-three/drei';
  import { useRef } from 'react'; // Don't forget to import useRef if not already!

  // 3D Model Component (for the hero section's main model)
  export const Model = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
    const group = useRef();
    // Ensure 'modern_store.glb' is in your public/ directory
    const { nodes, materials } = useGLTF('/modern_store.glb');

    useFrame(() => {
      if (group.current) {
        group.current.rotation.y += 0.002;
      }
    });

    return (
      <group ref={group} position={position} rotation={rotation} scale={scale} dispose={null}>
        {/* Ensure these mesh names (Cube, Cube001, etc.) match your GLB export */}
        <mesh geometry={nodes.Cube.geometry} material={materials.Material} />
        <mesh geometry={nodes.Cube001.geometry} material={materials['Material.001']} />
        <mesh geometry={nodes.Cube002.geometry} material={materials['Material.002']} />
      </group>
    );
  };

  // Floating 3D Icons (for the hero section's background elements)
  export const FloatingIcon = ({ icon, position, color }) => {
    const meshRef = useRef();

    useFrame((state) => {
      if (meshRef.current) {
        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
        meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime()) * 0.3;
      }
    });

    let geometry;
    switch(icon) {
      case 'cube': geometry = <boxGeometry args={[1, 1, 1]} />; break;
      case 'sphere': geometry = <sphereGeometry args={[0.7, 32, 32]} />; break;
      case 'torus': geometry = <torusGeometry args={[0.5, 0.2, 16, 32]} />; break;
      default: geometry = <boxGeometry args={[1, 1, 1]} />;
    }

    return (
      <mesh ref={meshRef} position={position}>
        {geometry}
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.8}
          envMapIntensity={1}
        />
      </mesh>
    );
  };

  // Main 3D Scene Component (what's lazy-loaded into HomePage)
  const ThreeDScene = () => (
    <div className="absolute inset-0 z-0 h-full w-full">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Environment preset="city" />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <Model position={[0, -2, 0]} scale={2} />
        </Float>
        <FloatingIcon icon="cube" position={[-5, 2, -5]} color="#245F73" />
        <FloatingIcon icon="sphere" position={[5, 3, -3]} color="#733224" />
        <FloatingIcon icon="torus" position={[0, 4, -7]} color="#BBBDBC" />
      </Canvas>
    </div>
  );

  export default ThreeDScene; // Export default so lazy() works