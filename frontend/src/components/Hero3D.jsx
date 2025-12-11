import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Float, OrbitControls } from '@react-three/drei'
import { motion } from 'framer-motion'

function AnimatedSphere() {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })
  
  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color="#8b5cf6"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          transparent
          opacity={0.8}
        />
      </Sphere>
    </Float>
  )
}

function BackgroundGeometry() {
  const positions = useMemo(() => {
    const positions = []
    const count = 50
    
    for (let i = 0; i < count; i++) {
      positions.push([
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ])
    }
    return positions
  }, [])
  
  return (
    <>
      {positions.map((position, index) => (
        <Float key={index} speed={Math.random() * 2 + 1} rotationIntensity={Math.random()}>
          <mesh position={position}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#6366f1" transparent opacity={0.6} />
          </mesh>
        </Float>
      ))}
    </>
  )
}

export default function Hero3D() {
  return (
    <motion.div 
      className="absolute inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#8b5cf6" intensity={0.5} />
        
        <AnimatedSphere />
        <BackgroundGeometry />
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </motion.div>
  )
}
