/**
 * Atmosphere.jsx
 * Night atmosphere for Chepauk IPL-match ambiance:
 *  - Starfield (InstancedMesh, 2500 stars)
 *  - Firefly particles drifting in the stadium air
 *  - Sky dome gradient (deep navy → horizon glow)
 *  - Light haze rings from floodlights
 */

import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// ── Starfield ──────────────────────────────────────────────────────────
function Stars({ count = 2500 }) {
  const mesh = useRef()

  const { geo, mat } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Distribute stars on a hemisphere above
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(1 - Math.random())   // uniform hemisphere
      const r     = 280 + Math.random() * 120

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 20  // keep above ground
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)

      sizes[i] = 0.3 + Math.random() * 0.9
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))

    const mat = new THREE.PointsMaterial({
      color: '#cce0ff',
      size: 0.6,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
      fog: false,
    })

    return { geo, mat }
  }, [count])

  return <points ref={mesh} geometry={geo} material={mat} />
}

// ── Firefly / dust motes in stadium air ───────────────────────────────
function Fireflies({ count = 600 }) {
  const mesh = useRef()

  const { positions, velocities } = useMemo(() => {
    const positions  = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Distribute within the stadium bowl
      const a = Math.random() * Math.PI * 2
      const r = 20 + Math.random() * 75
      positions[i * 3]     = Math.cos(a) * r
      positions[i * 3 + 1] = 2 + Math.random() * 28
      positions[i * 3 + 2] = Math.sin(a) * r

      velocities[i * 3]     = (Math.random() - 0.5) * 0.012
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.006
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.012
    }

    return { positions, velocities }
  }, [count])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions.slice(), 3))
    return g
  }, [positions])

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: '#ffe8a0',
    size: 0.22,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.55,
  }), [])

  useFrame((_, delta) => {
    const pos = geo.attributes.position.array

    for (let i = 0; i < count; i++) {
      pos[i * 3]     += velocities[i * 3]
      pos[i * 3 + 1] += velocities[i * 3 + 1]
      pos[i * 3 + 2] += velocities[i * 3 + 2]

      // Soft boundary — respawn if too far
      const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2]
      const r = Math.sqrt(x * x + z * z)
      if (r > 90 || y < 1 || y > 35) {
        const a = Math.random() * Math.PI * 2
        const nr = 20 + Math.random() * 60
        pos[i * 3]     = Math.cos(a) * nr
        pos[i * 3 + 1] = 5 + Math.random() * 20
        pos[i * 3 + 2] = Math.sin(a) * nr
      }
    }

    geo.attributes.position.needsUpdate = true
  })

  return <points geometry={geo} material={mat} />
}

// ── Sky dome ───────────────────────────────────────────────────────────
function SkyDome() {
  const mat = useMemo(() => {
    // Vertical gradient: zenith (deep navy) → horizon (slightly lighter)
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    const grad = ctx.createLinearGradient(0, 0, 0, 256)
    grad.addColorStop(0,   '#010812')  // zenith — near black
    grad.addColorStop(0.4, '#020d1e')  // deep night
    grad.addColorStop(0.7, '#051428')  // horizon approach
    grad.addColorStop(1,   '#081930')  // horizon
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 2, 256)

    const tex = new THREE.CanvasTexture(canvas)
    return new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.BackSide,
      fog: false,
    })
  }, [])

  return (
    <mesh material={mat}>
      <sphereGeometry args={[380, 32, 16]} />
    </mesh>
  )
}

// ── Floodlight haze rings (volumetric cone approximation) ──────────────
function FloodlightHaze() {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#fff8e0',
    transparent: true,
    opacity: 0.025,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [])

  return (
    <>
      {[45, 135, 225, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const x = Math.cos(rad) * 112
        const z = Math.sin(rad) * 112
        return (
          <mesh key={i} material={mat} position={[x, 0, z]}>
            {/* Cone pointing from tower down into stadium centre */}
            <coneGeometry args={[80, 55, 32, 1, true]} />
          </mesh>
        )
      })}
    </>
  )
}

// ── Horizon glow (city light pollution) ───────────────────────────────
function HorizonGlow() {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#1a3060',
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide,
    fog: false,
    depthWrite: false,
  }), [])

  return (
    <mesh material={mat} position={[0, -40, 0]}>
      <sphereGeometry args={[370, 32, 6, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.18]} />
    </mesh>
  )
}

// ── Main export ────────────────────────────────────────────────────────
export default function Atmosphere() {
  return (
    <>
      <SkyDome />
      <Stars count={2500} />
      <Fireflies count={500} />
      <FloodlightHaze />
      <HorizonGlow />

      {/* Fog for depth */}
      <fog attach="fog" args={['#020d1e', 80, 420]} />
    </>
  )
}
