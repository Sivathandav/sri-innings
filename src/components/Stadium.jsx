/**
 * Stadium.jsx — MA Chidambaram (Chepauk) Stadium, Chennai
 * Procedural Three.js reconstruction from 22 Hum3D reference renders.
 *
 * FIXES vs v1:
 *  - spotLight target-position (invalid R3F prop) → replaced with pointLights
 *  - BoundaryFence: 180 individual meshes → 2 InstancedMesh (1 draw call each)
 *  - ExteriorWall: 48 individual window meshes → 1 InstancedMesh
 *  - Removed railGeo and panelGeo (defined, never used)
 *  - CanopyColumns converted to InstancedMesh
 *  - StadiumSeating matrix init remains in useFrame with guard flag
 */

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const S = {
  boundaryR:     57,
  innerStandR:   58,
  lowerBackR:    70,
  walkwayR:      72,
  upperFrontR:   73,
  upperBackR:    82,
  outerWallEdge: 94,
  lowerH:        10,
  walkwayH:      10,
  upperH:        22,
  parapetH:      23,
  outerWallTopH: 24,
  canopyFrontH:  20,
  canopyBackH:   29,
  canopyFrontR:  63,
  canopyBackR:   87,
  waveAmp:       3.8,
  waveN:         4,
  floodlightR:   112,
  floodlightH:   55,
  numSections:   12,
  canopySections: new Set([0,1,2,3,4,5,6,7,8,9]),
}

// Materials at module level — created once
const MAT = {
  concrete:   new THREE.MeshStandardMaterial({ color:'#8a98b0', roughness:0.85, metalness:0.05 }),
  canopy:     new THREE.MeshStandardMaterial({ color:'#dde8f4', roughness:0.25, metalness:0.0, side:THREE.DoubleSide }),
  column:     new THREE.MeshStandardMaterial({ color:'#c8d4e0', roughness:0.5,  metalness:0.1 }),
  seatYellow: new THREE.MeshStandardMaterial({ color:'#e8a820', roughness:0.8 }),
  seatBlue:   new THREE.MeshStandardMaterial({ color:'#1a4e96', roughness:0.8 }),
  grass:      new THREE.MeshStandardMaterial({ color:'#2e6830', roughness:0.9 }),
  grassOuter: new THREE.MeshStandardMaterial({ color:'#265828', roughness:0.9 }),
  pitch:      new THREE.MeshStandardMaterial({ color:'#c4a96a', roughness:0.95 }),
  pitchLine:  new THREE.MeshStandardMaterial({ color:'#f0ead8', roughness:0.9 }),
  fence:      new THREE.MeshStandardMaterial({ color:'#1a2840', roughness:0.7, metalness:0.4 }),
  advert:     new THREE.MeshStandardMaterial({ color:'#051828', roughness:0.9 }),
  floodPole:  new THREE.MeshStandardMaterial({ color:'#6a7a8a', roughness:0.4, metalness:0.6 }),
  floodLight: new THREE.MeshStandardMaterial({
    color:'#fff8e8', emissive:'#fff8e8', emissiveIntensity:5, roughness:0.0, metalness:0.8,
  }),
  exterior:   new THREE.MeshStandardMaterial({ color:'#7a8a9e', roughness:0.8, metalness:0.1 }),
}

// ── Stand bowl profile ─────────────────────────────────────────────────
function buildBowlProfile() {
  return [
    new THREE.Vector2(S.boundaryR - 1, 0),
    new THREE.Vector2(S.innerStandR,   0.5),
    new THREE.Vector2(60,              2.5),
    new THREE.Vector2(63,              5.0),
    new THREE.Vector2(66,              7.5),
    new THREE.Vector2(S.lowerBackR,    S.lowerH),
    new THREE.Vector2(S.walkwayR,      S.walkwayH),
    new THREE.Vector2(S.upperFrontR,   S.walkwayH + 1.5),
    new THREE.Vector2(76,              15),
    new THREE.Vector2(79,              19),
    new THREE.Vector2(S.upperBackR,    S.upperH),
    new THREE.Vector2(83,              S.parapetH),
    new THREE.Vector2(86,              S.outerWallTopH),
    new THREE.Vector2(S.outerWallEdge, S.outerWallTopH),
    new THREE.Vector2(S.outerWallEdge, 0),
  ]
}

// ── Tensile canopy section geometry ───────────────────────────────────
function buildCanopyGeometry(sectionIdx) {
  const RES_U = 32, RES_V = 12
  const secAngle  = (Math.PI * 2) / S.numSections
  const startAngle = sectionIdx * secAngle - Math.PI / 2
  const positions = [], uvs = [], indices = []

  for (let j = 0; j <= RES_V; j++) {
    const v = j / RES_V
    for (let i = 0; i <= RES_U; i++) {
      const u     = i / RES_U
      const angle = startAngle + u * secAngle
      const r     = S.canopyFrontR + v * (S.canopyBackR - S.canopyFrontR)
      const falloff = Math.pow(1 - v, 0.55)
      const wave  = Math.cos(u * S.waveN * Math.PI * 2) * S.waveAmp * falloff
      const tilt  = -v * 1.5
      const y     = S.canopyFrontH + v * (S.canopyBackH - S.canopyFrontH) + wave + tilt
      positions.push(Math.cos(angle) * r, y, Math.sin(angle) * r)
      uvs.push(u, v)
    }
  }
  for (let j = 0; j < RES_V; j++) {
    for (let i = 0; i < RES_U; i++) {
      const a = j * (RES_U + 1) + i, b = a + 1, c = a + RES_U + 1, d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

// ── Instanced canopy columns ───────────────────────────────────────────
function CanopyColumnsInstanced() {
  const COLS_PER_SEC = 5
  const TOTAL = S.canopySections.size * COLS_PER_SEC
  const colRef  = useRef()
  const domeRef = useRef()
  const colGeo  = useMemo(() => new THREE.CylinderGeometry(0.4, 0.5, S.canopyFrontH, 8), [])
  const domeGeo = useMemo(() => new THREE.SphereGeometry(0.9, 8, 6, 0, Math.PI*2, 0, Math.PI/2), [])

  useFrame(() => {
    if (colRef.current && !colRef.current.__set) {
      const dummy = new THREE.Object3D()
      let idx = 0
      S.canopySections.forEach(si => {
        const secAngle   = (Math.PI * 2) / S.numSections
        const startAngle = si * secAngle - Math.PI / 2
        for (let ci = 0; ci < COLS_PER_SEC; ci++) {
          const u = ci / (COLS_PER_SEC - 1)
          const angle = startAngle + u * secAngle
          const r = S.canopyFrontR + 0.5
          dummy.position.set(Math.cos(angle)*r, S.canopyFrontH/2, Math.sin(angle)*r)
          dummy.rotation.set(0, 0, 0)
          dummy.updateMatrix()
          colRef.current.setMatrixAt(idx, dummy.matrix)

          dummy.position.set(Math.cos(angle)*r, S.canopyFrontH, Math.sin(angle)*r)
          dummy.updateMatrix()
          domeRef.current.setMatrixAt(idx, dummy.matrix)
          idx++
        }
      })
      colRef.current.instanceMatrix.needsUpdate  = true
      domeRef.current.instanceMatrix.needsUpdate = true
      colRef.current.__set  = true
      domeRef.current.__set = true
    }
  })

  return (
    <>
      <instancedMesh ref={colRef}  args={[colGeo,  MAT.column, TOTAL]} />
      <instancedMesh ref={domeRef} args={[domeGeo, MAT.column, TOTAL]} />
    </>
  )
}

// ── Floodlight tower ───────────────────────────────────────────────────
function LightPanel({ position }) {
  return (
    <group position={position}>
      <mesh material={MAT.floodLight}>
        <boxGeometry args={[5.5, 3.5, 0.3]} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} material={MAT.floodLight}
          position={[(i % 4 - 1.5) * 1.2, (Math.floor(i / 4) - 1) * 1.1, 0.2]}>
          <boxGeometry args={[0.9, 0.8, 0.1]} />
        </mesh>
      ))}
    </group>
  )
}

function FloodlightTower({ angle, radius = S.floodlightR, height = S.floodlightH }) {
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius
  return (
    <group position={[x, 0, z]}>
      <mesh material={MAT.concrete} position={[0, 1.5, 0]}>
        <boxGeometry args={[4, 3, 4]} />
      </mesh>
      <mesh material={MAT.floodPole} position={[0, height / 2 + 1.5, 0]}>
        <cylinderGeometry args={[0.5, 0.9, height, 8]} />
      </mesh>
      <mesh material={MAT.floodPole}
        position={[0, height + 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 14, 6]} />
      </mesh>
      <LightPanel position={[-5, height + 0.5, 0]} />
      <LightPanel position={[ 5, height + 0.5, 0]} />

      {/* FIX: was <spotLight target-position={...}> which is invalid R3F.
          Replaced with pointLight — radiates in all directions, simulates
          flood illumination without needing a target Object3D. */}
      <pointLight
        position={[0, height + 2, 0]}
        intensity={350}
        color="#fff6e8"
        distance={240}
        decay={1.4}
      />
    </group>
  )
}

function OutfieldMast({ angle, r = 46, h = 28 }) {
  const x = Math.cos(angle) * r, z = Math.sin(angle) * r
  return (
    <group position={[x, 0, z]}>
      <mesh material={MAT.floodPole} position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.2, 0.35, h, 6]} />
      </mesh>
      <mesh material={MAT.floodLight} position={[0, h + 0.3, 0]}>
        <boxGeometry args={[2.5, 1.8, 0.2]} />
      </mesh>
      <pointLight position={[0, h + 1, 0]} intensity={25} color="#fff5e0" distance={70} decay={2} />
    </group>
  )
}

// ── Boundary fence (FIX: InstancedMesh, not 180 separate meshes) ──────
function BoundaryFence() {
  const N_POST = 140, N_ADV = 48
  const fenceRef = useRef()
  const advRef   = useRef()
  const fenceGeo = useMemo(() => new THREE.BoxGeometry(0.06, 1.4, 0.06), [])
  const advGeo   = useMemo(() => new THREE.BoxGeometry(2.6, 0.9, 0.08), [])

  useFrame(() => {
    const dummy = new THREE.Object3D()
    if (fenceRef.current && !fenceRef.current.__set) {
      for (let i = 0; i < N_POST; i++) {
        const a = (i / N_POST) * Math.PI * 2
        dummy.position.set(Math.cos(a) * S.boundaryR, 0.7, Math.sin(a) * S.boundaryR)
        dummy.rotation.set(0, a, 0)
        dummy.updateMatrix()
        fenceRef.current.setMatrixAt(i, dummy.matrix)
      }
      fenceRef.current.instanceMatrix.needsUpdate = true
      fenceRef.current.__set = true
    }
    if (advRef.current && !advRef.current.__set) {
      for (let i = 0; i < N_ADV; i++) {
        const a = (i / N_ADV) * Math.PI * 2
        dummy.position.set(
          Math.cos(a) * (S.boundaryR + 0.2), 0.45,
          Math.sin(a) * (S.boundaryR + 0.2),
        )
        dummy.rotation.set(0, a + Math.PI / 2, 0)
        dummy.updateMatrix()
        advRef.current.setMatrixAt(i, dummy.matrix)
      }
      advRef.current.instanceMatrix.needsUpdate = true
      advRef.current.__set = true
    }
  })

  return (
    <>
      <instancedMesh ref={fenceRef} args={[fenceGeo, MAT.fence,  N_POST]} />
      <instancedMesh ref={advRef}   args={[advGeo,   MAT.advert, N_ADV]}  />
    </>
  )
}

// ── Seating (InstancedMesh — unchanged, guard flag preserved) ──────────
function StadiumSeating() {
  const seatGeo = useMemo(() => new THREE.BoxGeometry(0.48, 0.42, 0.28), [])

  const lowerSeats = useMemo(() => {
    const data = [], ROWS = 13, rStart = 58.5, rEnd = 69.5
    for (let row = 0; row < ROWS; row++) {
      const t = row / (ROWS - 1)
      const r = rStart + t * (rEnd - rStart)
      const h = 0.8 + t * 9.2
      const n = Math.floor(2 * Math.PI * r / 0.52)
      for (let s = 0; s < n; s++) {
        const a = (s / n) * Math.PI * 2
        data.push({ position: [Math.cos(a)*r, h+0.21, Math.sin(a)*r], rotation: [-0.35, a+Math.PI, 0] })
      }
    }
    return data
  }, [])

  const upperSeats = useMemo(() => {
    const data = [], ROWS = 9, rStart = 73, rEnd = 81
    for (let row = 0; row < ROWS; row++) {
      const t = row / (ROWS - 1)
      const r = rStart + t * (rEnd - rStart)
      const h = 12 + t * 10
      const n = Math.floor(2 * Math.PI * r / 0.52)
      for (let s = 0; s < n; s++) {
        const a = (s / n) * Math.PI * 2
        data.push({ position: [Math.cos(a)*r, h+0.21, Math.sin(a)*r], rotation: [-0.32, a+Math.PI, 0] })
      }
    }
    return data
  }, [])

  const lowerRef = useRef()
  const upperRef = useRef()

  useFrame(() => {
    const dummy = new THREE.Object3D()
    if (lowerRef.current && !lowerRef.current.__matricesSet) {
      lowerSeats.forEach((s, i) => {
        dummy.position.set(...s.position)
        dummy.rotation.set(...s.rotation)
        dummy.updateMatrix()
        lowerRef.current.setMatrixAt(i, dummy.matrix)
      })
      lowerRef.current.instanceMatrix.needsUpdate = true
      lowerRef.current.__matricesSet = true
    }
    if (upperRef.current && !upperRef.current.__matricesSet) {
      upperSeats.forEach((s, i) => {
        dummy.position.set(...s.position)
        dummy.rotation.set(...s.rotation)
        dummy.updateMatrix()
        upperRef.current.setMatrixAt(i, dummy.matrix)
      })
      upperRef.current.instanceMatrix.needsUpdate = true
      upperRef.current.__matricesSet = true
    }
  })

  return (
    <>
      <instancedMesh ref={lowerRef} args={[seatGeo, MAT.seatYellow, lowerSeats.length]} />
      <instancedMesh ref={upperRef} args={[seatGeo, MAT.seatBlue,   upperSeats.length]} />
    </>
  )
}

// ── Cricket pitch ──────────────────────────────────────────────────────
function CricketPitch() {
  return (
    <group position={[0, 0.02, 0]}>
      <mesh material={MAT.pitch} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[3.05, 20.12]} />
      </mesh>
      {[-9.15, 9.15].map((z, i) => (
        <mesh key={i} material={MAT.pitchLine}
          position={[0, 0.01, z]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[3.66, 0.06]} />
        </mesh>
      ))}
      {[-8.23, 8.23].map((z, i) => (
        <mesh key={i} material={MAT.pitchLine}
          position={[0, 0.01, z]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[3.66, 0.06]} />
        </mesh>
      ))}
      {[-9.5, 9.5].map((z, i) => (
        <group key={i} position={[0, 0, z]}>
          {[-0.11, 0, 0.11].map((x, j) => (
            <mesh key={j} material={MAT.pitchLine} position={[x, 0.3, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.6, 6]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// ── Outfield ───────────────────────────────────────────────────────────
function Outfield() {
  return (
    <group>
      <mesh material={MAT.grassOuter} rotation={[-Math.PI/2, 0, 0]} position={[0,-0.05,0]}>
        <circleGeometry args={[S.outerWallEdge + 5, 80]} />
      </mesh>
      <mesh material={MAT.grass} rotation={[-Math.PI/2, 0, 0]}>
        <circleGeometry args={[S.boundaryR, 80]} />
      </mesh>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[27.3, 27.5, 80]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} opacity={0.4} transparent />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[(i / 10) * S.boundaryR, ((i + 0.5) / 10) * S.boundaryR, 80]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#2e6830' : '#305e32'} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ── Exterior wall (FIX: window panels → InstancedMesh) ─────────────────
function ExteriorWall() {
  const N_WIN = 48
  const winRef  = useRef()
  const winGeo  = useMemo(() => new THREE.BoxGeometry(2, 4, 0.6), [])

  useFrame(() => {
    if (winRef.current && !winRef.current.__set) {
      const dummy = new THREE.Object3D()
      for (let i = 0; i < N_WIN; i++) {
        const a = (i / N_WIN) * Math.PI * 2
        dummy.position.set(
          Math.cos(a) * (S.outerWallEdge + 0.7), 12,
          Math.sin(a) * (S.outerWallEdge + 0.7),
        )
        dummy.rotation.set(0, a + Math.PI / 2, 0)
        dummy.updateMatrix()
        winRef.current.setMatrixAt(i, dummy.matrix)
      }
      winRef.current.instanceMatrix.needsUpdate = true
      winRef.current.__set = true
    }
  })

  return (
    <group>
      <mesh material={MAT.exterior}>
        <cylinderGeometry args={[S.outerWallEdge+0.5, S.outerWallEdge+0.5, 24, 80, 1, true]} />
      </mesh>
      <mesh material={MAT.concrete} position={[0, 1, 0]}>
        <cylinderGeometry args={[S.outerWallEdge+1.5, S.outerWallEdge+1.5, 2, 80, 1, true]} />
      </mesh>
      <instancedMesh ref={winRef} args={[winGeo, MAT.concrete, N_WIN]} />
    </group>
  )
}

// ── Main export ────────────────────────────────────────────────────────
export default function Stadium() {
  const bowlPoints       = useMemo(buildBowlProfile, [])
  const canopyGeometries = useMemo(() =>
    Array.from({ length: S.numSections }, (_, i) =>
      S.canopySections.has(i) ? buildCanopyGeometry(i) : null
    ), [])

  return (
    <group>
      <Outfield />
      <CricketPitch />

      <mesh material={MAT.concrete}>
        <latheGeometry args={[bowlPoints, 72]} />
      </mesh>

      <StadiumSeating />

      {canopyGeometries.map((geo, i) =>
        geo ? <mesh key={i} geometry={geo} material={MAT.canopy} /> : null
      )}
      <CanopyColumnsInstanced />

      <ExteriorWall />
      <BoundaryFence />

      {[45, 135, 225, 315].map((deg, i) => (
        <FloodlightTower key={i} angle={(deg * Math.PI) / 180} />
      ))}
      <OutfieldMast angle={Math.PI * 0.2} r={48} h={30} />
      <OutfieldMast angle={Math.PI * 1.2} r={48} h={30} />

      <ambientLight intensity={0.07} color="#102040" />
      <hemisphereLight skyColor="#0a1628" groundColor="#1a3020" intensity={0.28} />

      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <pointLight key={i}
            position={[Math.cos(a)*71, 11, Math.sin(a)*71]}
            intensity={7} color="#fff0c8" distance={20} decay={2}
          />
        )
      })}
    </group>
  )
}
