/**
 * Scene.jsx — R3F Canvas + PostFX
 *
 * FIX #1: LoadBridge no longer uses useProgress (only fires for async assets).
 * All geometry is procedural → progress never hit 100 → loader never dismissed.
 * Now uses a timed animation so the bar always resolves in ~1.2s.
 *
 * FIX #2: multisampling={4} + HalfFloatType, no DepthOfField (depth buffer conflict).
 */

import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  EffectComposer, Bloom, ChromaticAberration, Vignette, ToneMapping,
} from '@react-three/postprocessing'
import { ToneMappingMode, BlendFunction } from 'postprocessing'
import * as THREE from 'three'

import Stadium from './Stadium'
import Atmosphere from './Atmosphere'
import CameraRig from './CameraRig'

function LoadBridge({ onProgress, onLoaded }) {
  useEffect(() => {
    let p = 0
    const interval = setInterval(() => {
      p = Math.min(100, p + 7)
      onProgress(Math.floor(p))
      if (p >= 100) {
        clearInterval(interval)
        setTimeout(onLoaded, 350)
      }
    }, 50)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line

  return null
}

function PostFX() {
  return (
    <EffectComposer multisampling={4} frameBufferType={THREE.HalfFloatType}>
      <Bloom luminanceThreshold={0.38} luminanceSmoothing={0.82}
        intensity={1.6} radius={0.8} levels={8} mipmapBlur />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={[0.0007, 0.0007]}
        radialModulation
        modulationOffset={0.5}
      />
      <Vignette eskil={false} offset={0.14} darkness={0.72} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}

export default function Scene({ onProgress, onLoaded }) {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [130, 85, 130], fov: 52, near: 0.5, far: 800 }}
      gl={{ antialias: false, powerPreference: 'high-performance',
        outputColorSpace: 'srgb', stencilBuffer: false }}
      dpr={[1, 1.5]}
      frameloop="always"
    >
      <Suspense fallback={null}>
        <LoadBridge onProgress={onProgress} onLoaded={onLoaded} />
        <Atmosphere />
        <Stadium />
        <PostFX />
      </Suspense>
      <CameraRig />
    </Canvas>
  )
}
