'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { OrbitControls, Effects } from '@react-three/drei'
import { UnrealBloomPass } from 'three-stdlib'
import * as THREE from 'three'
import { cn } from '@/lib/utils'
import { useDeviceCapability } from '@/hooks/useDeviceCapability'

extend({ UnrealBloomPass })

declare module '@react-three/fiber' {
  interface ThreeElements {
    unrealBloomPass: ThreeElements['mesh'] & {
      threshold?: number
      strength?: number
      radius?: number
      args?: [width?: number, height?: number, strength?: number]
    }
  }
}

/* ─── Module-level constants ────────────────────────────────────────────────── */
const ORBIT_SPEED = 1.7
const RING_RADIUS = 30
const TRAIL_LEN   = 25
const TILT_X      = [0.44, 1.13, 1.45] as const
const TILT_Z      = [0.17, 0.73, -0.38] as const

// Nucleus branded shapes
const STAR_OUTER  = 4.2   // 5-pointed star outer tip radius
const STAR_INNER  = 1.9   // 5-pointed star inner notch radius
const ZERO_R      = 5.6   // major radius of "0" torus (zero.pro)
const ZERO_TUBE   = 0.65  // tube thickness of "0"
const ZERO_TILT   = 0.42  // ~24° tilt on X axis for 3D depth

/* ─── ParticleSwarm ─────────────────────────────────────────────────────────── */
function ParticleSwarm({ count }: { count: number }) {
  const meshRef  = useRef<THREE.InstancedMesh>(null)
  const dummy    = useMemo(() => new THREE.Object3D(), [])
  const target   = useMemo(() => new THREE.Vector3(), [])
  const pColor   = useMemo(() => new THREE.Color(), [])
  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.25), [])
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), [])

  const positions = useMemo(() => {
    const pos: THREE.Vector3[] = []
    for (let i = 0; i < count; i++) {
      pos.push(new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
      ))
    }
    return pos
  }, [count])

  const parts = useMemo(() => {
    const nucleusCount       = Math.floor(count * 0.12)
    const electronTrailCount = Math.floor(count * 0.20)
    const trailPerRing       = Math.floor(electronTrailCount / 3)
    const ringCount          = count - nucleusCount - electronTrailCount
    const ringSize           = Math.floor(ringCount / 3)
    // Nucleus sub-groups: star (SB ⭐) + zero ring (0 from zero.pro) + core glow
    const starCount  = Math.floor(nucleusCount * 0.38)
    const zeroCount  = Math.floor(nucleusCount * 0.42)
    const coreCount  = nucleusCount - starCount - zeroCount
    return { nucleusCount, ringCount, ringSize, trailPerRing, starCount, zeroCount, coreCount }
  }, [count])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return

    const t = state.clock.getElapsedTime() * ORBIT_SPEED
    const { nucleusCount, ringCount, ringSize, trailPerRing,
            starCount, zeroCount, coreCount } = parts

    for (let i = 0; i < count; i++) {

      /* ────────────────────────────────────────────────────────────────────────
         NUCLEUS — branded: ⭐ Super Builders star  +  0 zero.pro ring  +  core
      ──────────────────────────────────────────────────────────────────────── */
      if (i < nucleusCount) {

        /* ── Star (Super Builders ⭐) — 5-pointed, slowly rotating ── */
        if (i < starCount) {
          const norm    = i / starCount
          const seg     = Math.floor(norm * 10)        // 10 half-edges for 5-pt star
          const segFrac = (norm * 10) % 1
          const r1      = seg % 2 === 0 ? STAR_OUTER : STAR_INNER
          const r2      = seg % 2 === 0 ? STAR_INNER : STAR_OUTER
          const r       = r1 + (r2 - r1) * segFrac
          // base angle: -π/2 so first tip points straight up
          const baseAngle = (seg     / 10) * Math.PI * 2 - Math.PI / 2
          const nextAngle = ((seg + 1) / 10) * Math.PI * 2 - Math.PI / 2
          const angle   = baseAngle + (nextAngle - baseAngle) * segFrac + t * 0.12
          const zWobble = Math.sin(t * 1.8 + i * 0.35) * 0.45
          target.set(Math.cos(angle) * r, Math.sin(angle) * r, zWobble)
          const pulse = 0.75 + 0.25 * Math.sin(t * 3.5 + i * 0.2)
          // Bright gold-yellow — the "trophy" colour
          pColor.setRGB(1.0 * pulse, 0.87 * pulse, 0.18 * pulse)

        /* ── Zero ring (zero.pro "0") — tilted torus, slow spin ── */
        } else if (i < starCount + zeroCount) {
          const ri    = i - starCount
          const phi   = (ri / zeroCount) * Math.PI * 2          // around big ring
          const theta = (ri / zeroCount) * Math.PI * 16         // wrap tube 8× for thickness
          const spin  = phi + t * 0.09
          // Torus surface point
          const rx    = (ZERO_R + Math.cos(theta) * ZERO_TUBE) * Math.cos(spin)
          const ry    = (ZERO_R + Math.cos(theta) * ZERO_TUBE) * Math.sin(spin)
          const rz    = Math.sin(theta) * ZERO_TUBE
          // Tilt ~24° on X so it reads as a 3D ring, not a flat disc
          const ct = Math.cos(ZERO_TILT), st = Math.sin(ZERO_TILT)
          target.set(rx, ry * ct - rz * st, ry * st + rz * ct)
          const bright = 0.55 + 0.3 * Math.sin(t * 2.2 + phi * 3)
          // Brand gold #FFB800
          pColor.setRGB(1.0 * bright, 0.722 * bright, 0.0)

        /* ── Core glow — dense bright cluster at centre ── */
        } else {
          const ri     = i - starCount - zeroCount
          const golden = 2.399963
          const theta  = Math.acos(1 - 2 * (ri + 0.5) / Math.max(coreCount, 1))
          const phi    = golden * ri + t * 1.4
          const r      = 1.1 + 0.5 * Math.sin(t * 4.5 + ri * 0.4)
          target.set(
            Math.sin(theta) * Math.cos(phi) * r,
            Math.sin(theta) * Math.sin(phi) * r,
            Math.cos(theta) * r,
          )
          // Near-white warm gold — the energy source
          pColor.setRGB(1.0, 0.93, 0.48)
        }

      /* ────────────────────────────────────────────────────────────────────────
         RING ELECTRONS
      ──────────────────────────────────────────────────────────────────────── */
      } else if (i < nucleusCount + ringCount) {
        const ri      = i - nucleusCount
        const ringIdx = Math.floor(ri / ringSize)
        const frac    = (ri - ringIdx * ringSize) / ringSize
        const speed   = (1.0 + ringIdx * 0.3) * (ringIdx === 1 ? -1 : 1)
        const angle   = frac * Math.PI * 2 + t * speed
        const ex = Math.cos(angle) * RING_RADIUS
        const ey = Math.sin(angle) * RING_RADIUS
        const cx = Math.cos(TILT_X[ringIdx])
        const sx = Math.sin(TILT_X[ringIdx])
        const ey1 = ey * cx
        const ez1 = ey * sx
        const cz  = Math.cos(TILT_Z[ringIdx])
        const sz  = Math.sin(TILT_Z[ringIdx])
        target.set(ex * cz - ey1 * sz, ex * sz + ey1 * cz, ez1)
        const bright = 0.5 + 0.2 * Math.sin(angle * 3 + t)
        // Ring 0: gold #FFB800 | Ring 1: blue #60A5FA | Ring 2: purple #C084FC
        if      (ringIdx === 0) pColor.setRGB(1.000 * bright, 0.722 * bright, 0.000)
        else if (ringIdx === 1) pColor.setRGB(0.376 * bright, 0.647 * bright, 0.980 * bright)
        else                    pColor.setRGB(0.753 * bright, 0.518 * bright, 0.988 * bright)

      /* ────────────────────────────────────────────────────────────────────────
         ELECTRON TRAILS
      ──────────────────────────────────────────────────────────────────────── */
      } else {
        const ei        = i - nucleusCount - ringCount
        const ringIdx   = Math.floor(ei / trailPerRing)
        const trailIdx  = ei - ringIdx * trailPerRing
        const trailFrac = trailIdx / trailPerRing
        const speed     = (1.0 + ringIdx * 0.3) * (ringIdx === 1 ? -1 : 1)
        const trailOffset = trailFrac * (TRAIL_LEN * 0.04)
        const angle = t * speed * 3.0 - trailOffset * (ringIdx === 1 ? -1 : 1)
        const tx = Math.cos(angle) * RING_RADIUS
        const ty = Math.sin(angle) * RING_RADIUS
        const cx = Math.cos(TILT_X[ringIdx])
        const sx = Math.sin(TILT_X[ringIdx])
        const ty1 = ty * cx
        const tz1 = ty * sx
        const cz  = Math.cos(TILT_Z[ringIdx])
        const sz  = Math.sin(TILT_Z[ringIdx])
        target.set(tx * cz - ty1 * sz, tx * sz + ty1 * cz, tz1)
        const fade = (1.0 - trailFrac) ** 2
        // Head: white flash → fades to ring colour
        if      (trailFrac < 0.015) pColor.setRGB(1.0, 1.0, 1.0)
        else if (ringIdx === 0)     pColor.setRGB(1.000 * fade, 0.722 * fade, 0.000)
        else if (ringIdx === 1)     pColor.setRGB(0.376 * fade, 0.647 * fade, 0.980 * fade)
        else                        pColor.setRGB(0.753 * fade, 0.518 * fade, 0.988 * fade)
      }

      positions[i].lerp(target, 0.1)
      dummy.position.copy(positions[i])
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, pColor)
    }

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} />
}

/* ─── CSS fallback (low-tier) ───────────────────────────────────────────────── */
function CSSAtomFallback({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex items-center justify-center select-none', className)}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(255,184,0,0.15) 0%, rgba(96,165,250,0.06) 55%, transparent 80%)',
        }}
      />
      {/* Outer ring — gold */}
      <div
        className="absolute rounded-full border"
        style={{ inset: '8%', borderColor: 'rgba(255,184,0,0.4)', animation: 'spin-slow 8s linear infinite' }}
      >
        <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
          style={{ background: '#FFB800', boxShadow: '0 0 10px #FFB800' }} />
      </div>
      {/* Inner ring — blue */}
      <div
        className="absolute rounded-full border"
        style={{ inset: '22%', borderColor: 'rgba(96,165,250,0.3)', animation: 'spin-slow 12s linear infinite reverse' }}
      >
        <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
          style={{ background: '#60A5FA', boxShadow: '0 0 8px #60A5FA' }} />
      </div>
      {/* Nucleus — gold star */}
      <div
        className="relative z-10 flex items-center justify-center"
        style={{
          width: '22%', height: '22%',
          background: 'radial-gradient(circle, #FFCF40 0%, #FFB800 60%, #CC9400 100%)',
          clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
          boxShadow: '0 0 32px rgba(255,184,0,0.6)',
          animation: 'glow-pulse 2.4s ease-in-out infinite',
        }}
      />
    </div>
  )
}

/* ─── Canvas wrapper ────────────────────────────────────────────────────────── */
function ThreeHeroAnimation({ count, className }: { count: number; className?: string }) {
  return (
    <div className={cn('cursor-grab active:cursor-grabbing', className)}>
      <Canvas
        camera={{ position: [0, 0, 65], fov: 60 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ background: '#000' }}
      >
        <fog attach="fog" args={['#000000', 0.01]} />
        <ParticleSwarm count={count} />
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.6}
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
        />
        <Effects disableGamma>
          <unrealBloomPass threshold={0} strength={1.8} radius={0.4} />
        </Effects>
      </Canvas>
    </div>
  )
}

/* ─── Public export ─────────────────────────────────────────────────────────── */
export function HeroAnimation({ className }: { className?: string }) {
  const { tier } = useDeviceCapability()
  if (tier === 'low') return <CSSAtomFallback className={className} />
  return <ThreeHeroAnimation count={tier === 'high' ? 20_000 : 8_000} className={className} />
}
