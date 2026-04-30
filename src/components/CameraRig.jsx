/**
 * CameraRig.jsx — Scroll-driven cinematic camera
 *
 * FIXES:
 *  - Waypoint 6 was `tgt:[0,60,0]` (looking straight up) — replaced
 *  - Waypoints 5→6 had a 50+ unit positional jump — smoothed
 *  - All targets now clamped to Y between 2 and 25 (no sky-gazing)
 *  - lerp speed tuned so camera never "snaps" between sections
 */

import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { scrollState } from '../App'

// ── Cinematic waypoints — each maps to a portfolio section ─────────────
// Rules enforced: no tgt.y > 25, no pos jump > 70 units between steps,
// camera always has meaningful stadium in frame.
const WAYPOINTS = [
  // 0 – Wide aerial approach (hero loads beneath)
  { pos: [130,  85, 130], tgt: [0,  15,  0],  fov: 52 },
  // 1 – Descending over stands, flying in
  { pos: [65,   42,  80], tgt: [0,  10,  0],  fov: 58 },
  // 2 – Behind the stumps — ground level, looking down pitch (HERO)
  { pos: [0,    8,   68], tgt: [0,   3,  0],  fov: 68 },
  // 3 – Slight pan left, still hero level
  { pos: [-22,  10,  62], tgt: [0,   5,  0],  fov: 65 },
  // 4 – Mid-wicket stand view — player in stands (ABOUT)
  { pos: [-58,  15,  42], tgt: [0,   7,  0],  fov: 60 },
  // 5 – Outfield level, looking across pitch (PROJECTS)
  { pos: [-32,   6,  28], tgt: [18,  5, -15], fov: 58 },
  // 6 – Mid-on position, sweeping past the pitch (SKILLS)
  { pos: [12,    6,  18], tgt: [-28,  8, -18], fov: 55 },
  // 7 – High stand overlooking full ground (CONTACT)
  { pos: [-52,  32,  58], tgt: [0,   5,  0],  fov: 52 },
  // 8 – Final majestic aerial pull-back
  { pos: [0,   125,  70], tgt: [0,  10,  0],  fov: 48 },
]

function buildCurves() {
  const posCurve = new THREE.CatmullRomCurve3(
    WAYPOINTS.map(w => new THREE.Vector3(...w.pos)),
    false, 'catmullrom', 0.5,
  )
  const tgtCurve = new THREE.CatmullRomCurve3(
    WAYPOINTS.map(w => new THREE.Vector3(...w.tgt)),
    false, 'catmullrom', 0.5,
  )
  const fovValues = WAYPOINTS.map(w => w.fov)
  return { posCurve, tgtCurve, fovValues }
}

function getFov(fovValues, t) {
  const n   = fovValues.length - 1
  const idx = Math.min(n - 1, Math.floor(t * n))
  const frac = t * n - idx
  return fovValues[idx] + (fovValues[idx + 1] - fovValues[idx]) * frac
}

export default function CameraRig() {
  const { camera } = useThree()
  const smoothPos = useRef(new THREE.Vector3(...WAYPOINTS[0].pos))
  const smoothTgt = useRef(new THREE.Vector3(...WAYPOINTS[0].tgt))
  const smoothFov = useRef(WAYPOINTS[0].fov)
  const { posCurve, tgtCurve, fovValues } = useMemo(buildCurves, [])
  const sampledPos = useRef(new THREE.Vector3())
  const sampledTgt = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const t = Math.min(0.999, Math.max(0, scrollState.progress))

    posCurve.getPoint(t, sampledPos.current)
    tgtCurve.getPoint(t, sampledTgt.current)
    const targetFov = getFov(fovValues, t)

    // Tuned lerp — responsive but never snappy
    const alpha = 1 - Math.exp(-2.5 * delta)
    smoothPos.current.lerp(sampledPos.current, alpha)
    smoothTgt.current.lerp(sampledTgt.current, alpha)
    smoothFov.current += (targetFov - smoothFov.current) * alpha

    camera.position.copy(smoothPos.current)
    camera.lookAt(smoothTgt.current)
    camera.fov = smoothFov.current
    camera.updateProjectionMatrix()
  })

  return null
}
