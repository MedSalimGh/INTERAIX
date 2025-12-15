"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars, Cloud, Sphere, PerspectiveCamera, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// --- Asset Components ---

function NeonPlanet({ position, color, size, emissiveIntensity = 2 }: any) {
  const mesh = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (mesh.current) {
        mesh.current.rotation.y += delta * 0.1;
    }
    if (atmosphereRef.current) {
        atmosphereRef.current.rotation.y -= delta * 0.05;
    }
  });

  return (
    <group position={position}>
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
            <Sphere ref={mesh} args={[size, 64, 64]}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={emissiveIntensity}
                    roughness={0.4}
                    metalness={0.8}
                />
            </Sphere>
            {/* Atmosphere Glow / Wireframe Overlay */}
            <Sphere ref={atmosphereRef} args={[size * 1.2, 32, 32]}>
              <meshBasicMaterial color={color} transparent opacity={0.1} wireframe side={THREE.DoubleSide} />
            </Sphere>
        </Float>
    </group>
  );
}

function OrbitalTube({ radius, color, rotation }: any) {
    const ref = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (ref.current) {
             ref.current.rotation.z += delta * 0.05;
        }
    });

    return (
        <group ref={ref} rotation={rotation}>
             <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[radius, 0.03, 16, 100]} />
                <meshBasicMaterial color={color} transparent opacity={0.4} />
             </mesh>
        </group>
    )
}

// Realistic Nebula Clouds
function NebulaField() {
    return (
        <group>
            {/* Layered nebula clouds with varying colors and opacity */}
            <Float speed={0.3} rotationIntensity={0.05} floatIntensity={0.3}>
                <Cloud opacity={0.2} speed={0.05} segments={30} position={[-15, 0, -20]} color="#1b3984" bounds={[10, 4, 8]} />
                <Cloud opacity={0.15} speed={0.06} segments={25} position={[12, -8, -25]} color="#590d82" bounds={[10, 4, 8]} />
                <Cloud opacity={0.18} speed={0.04} segments={28} position={[0, 10, -30]} color="#2a1a4a" bounds={[15, 6, 10]} />
            </Float>
            
            {/* Closer, more vibrant nebula wisps */}
            <Float speed={0.8} rotationIntensity={0.15} floatIntensity={0.8}>
                <Cloud opacity={0.25} speed={0.15} segments={20} position={[8, 5, 2]} color="#00f3ff" bounds={[5, 2, 4]} />
                <Cloud opacity={0.22} speed={0.12} segments={18} position={[-10, -3, 5]} color="#bc13fe" bounds={[5, 2, 4]} />
            </Float>
        </group>
    );
}

// Distant Star Layers for Depth
function DistantStarLayers() {
    return (
        <group>
            <Stars radius={150} depth={80} count={3000} factor={5} saturation={0} fade speed={0.3} />
            <Sparkles count={200} scale={50} size={2} speed={0.2} opacity={0.3} color="#00f3ff" />
            <Sparkles count={150} scale={60} size={1.5} speed={0.15} opacity={0.2} color="#bc13fe" />
        </group>
    );
}

function ParticleConstellation() {
    const count = 1500;
    const { positions, originalPositions } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const originalPositions = new Float32Array(count * 3);
        const radius = 60;
        for(let i=0; i<count; i++) {
            const x = (Math.random() - 0.5) * radius;
            const y = (Math.random() - 0.5) * radius;
            const z = (Math.random() - 0.5) * radius;
            positions[i*3] = x;
            positions[i*3+1] = y;
            positions[i*3+2] = z;
            originalPositions[i*3] = x;
            originalPositions[i*3+1] = y;
            originalPositions[i*3+2] = z;
        }
        return { positions, originalPositions };
    }, [count]);

    const points = useRef<THREE.Points>(null!);
    
    useFrame((state) => {
        if(!points.current) return;
        
        const time = state.clock.getElapsedTime();
        const currentPositions = points.current.geometry.attributes.position.array as Float32Array;
        
        // Animate particles with flowing wave motion
        for(let i=0; i<count; i++) {
            const i3 = i * 3;
            const ox = originalPositions[i3];
            const oy = originalPositions[i3 + 1];
            const oz = originalPositions[i3 + 2];
            
            // Create flowing wave effect
            currentPositions[i3] = ox + Math.sin(time * 0.3 + oy * 0.05) * 0.5;
            currentPositions[i3 + 1] = oy + Math.cos(time * 0.2 + ox * 0.05) * 0.5;
            currentPositions[i3 + 2] = oz + Math.sin(time * 0.25 + ox * 0.03 + oy * 0.03) * 0.3;
        }
        
        points.current.geometry.attributes.position.needsUpdate = true;
        points.current.rotation.y = time * 0.01;
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial size={0.08} color="#00f3ff" transparent opacity={0.6} sizeAttenuation />
        </points>
    );
}

// --- Controller Component ---

function SceneController() {
    const { camera, scene } = useThree();
    const groupRef = useRef<THREE.Group>(null);

    useEffect(() => {
        // Initial setup
        camera.position.set(0, 0, 20);
        if(scene.fog) scene.fog.color.set("#020205");

        // GSAP Scroll Interaction - Smoother and softer
        const ctx = gsap.context(() => {
             const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: document.body,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 2.5, // Increased for smoother scrolling
                }
             });

             // Move camera forward with easing for smoother feel
             tl.to(camera.position, { z: 5, ease: "power1.inOut" }, 0);
             // Rotate the entire group more gently
             tl.to(groupRef.current!.rotation, { z: 0.3, y: 0.15, ease: "power1.inOut" }, 0);
        });

        return () => ctx.revert();
    }, [camera, scene]);

    useFrame((state) => {
        const { pointer } = state;
        // Mouse Parallax (smooth damping)
        if(groupRef.current) {
            groupRef.current.rotation.x += (pointer.y * 0.05 - groupRef.current.rotation.x) * 0.05;
            groupRef.current.rotation.y += (pointer.x * 0.05 - groupRef.current.rotation.y) * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
             {/* Distant background layers */}
             <DistantStarLayers />
             
             {/* Realistic Nebula Field */}
             <NebulaField />
             
             {/* Mid-ground elements */}
             <ParticleConstellation />
             <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
             
             {/* Volumetric Fog Clouds - placed to fly through */}
             <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.5}>
                 <Cloud opacity={0.15} speed={0.1} segments={20} position={[0, -5, 5]} color="#1b3984" bounds={[8, 2, 4]} />
                 <Cloud opacity={0.15} speed={0.1} segments={20} position={[0, 8, -5]} color="#590d82" bounds={[8, 2, 4]} />
             </Float>

             {/* Planets with enhanced glow */}
             <NeonPlanet position={[6, 2, 0]} color="#00f3ff" size={1.8} emissiveIntensity={2.5} />
             <NeonPlanet position={[-7, -4, -5]} color="#bc13fe" size={2.5} emissiveIntensity={2} />
             <NeonPlanet position={[2, 8, -10]} color="#2e2eff" size={1.2} emissiveIntensity={3.5} />

             {/* Abstract Orbits */}
             <OrbitalTube radius={10} color="#00f3ff" rotation={[0.4, 0.2, 0]} />
             <OrbitalTube radius={14} color="#bc13fe" rotation={[-0.3, -0.1, 0.2]} />
             <OrbitalTube radius={18} color="#1b3984" rotation={[0, 0, 0.5]} />
        </group>
    );
}

export const NeonBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 bg-black">
            <Canvas>
                 {/* Camera with far clipping plane for deep space */}
                <PerspectiveCamera makeDefault fov={50} far={1000} near={0.1} position={[0,0,20]} />
                <color attach="background" args={["#020205"]} />
                <fogExp2 attach="fog" args={["#020205", 0.01]} />
                
                {/* Enhanced lighting for realism */}
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f3ff" distance={50} decay={2} />
                <pointLight position={[-10, -10, -10]} intensity={1.5} color="#bc13fe" distance={50} decay={2} />
                <pointLight position={[0, 15, -5]} intensity={0.8} color="#ffffff" distance={40} decay={2} />
                
                {/* Rim lighting for depth */}
                <spotLight position={[20, 0, 10]} intensity={0.5} angle={0.6} penumbra={1} color="#00f3ff" />
                <spotLight position={[-20, 0, 10]} intensity={0.5} angle={0.6} penumbra={1} color="#bc13fe" />

                <SceneController />

                <EffectComposer>
                    <Bloom 
                        luminanceThreshold={0.4} 
                        mipmapBlur 
                        intensity={1.8} 
                        radius={0.7} 
                    />
                    <Noise opacity={0.04} />
                    <Vignette offset={0.2} darkness={0.6} />
                </EffectComposer>
            </Canvas>
        </div>
    );
};
