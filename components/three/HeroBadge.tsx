'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { cn } from '@/lib/utils'
import { useDeviceCapability, type DeviceTier } from '@/hooks/useDeviceCapability'

/* ─── Shape builders ────────────────────────────────────────────────────────── */
function makeHexShape(r: number): THREE.Shape {
  const s = new THREE.Shape()
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 - Math.PI / 6
    const x = r * Math.cos(a)
    const y = r * Math.sin(a)
    i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)
  }
  s.closePath()
  return s
}

function makeStarShape(outerR: number, innerR: number): THREE.Shape {
  const s = new THREE.Shape()
  const pts = 5
  for (let i = 0; i < pts * 2; i++) {
    const a = (i * Math.PI) / pts - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    const x = r * Math.cos(a)
    const y = r * Math.sin(a)
    i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)
  }
  s.closePath()
  return s
}

/* ─── CSS fallback (low-tier devices — no Three.js) ────────────────────────── */
function CSSHexBadge({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex items-center justify-center select-none', className)}>
      {/* ambient glow pool */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 55%, rgba(255,184,0,0.22) 0%, transparent 68%)',
        }}
      />

      {/* outer orbit ring */}
      <div
        className="absolute rounded-full border"
        style={{
          inset: '6%',
          borderColor: 'rgba(255,184,0,0.3)',
          animation: 'spin-slow 10s linear infinite',
        }}
      >
        {/* blue dot */}
        <div
          className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full"
          style={{ background: '#60A5FA', boxShadow: '0 0 10px #60A5FA' }}
        />
        {/* green dot */}
        <div
          className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
          style={{ background: '#34D399', boxShadow: '0 0 10px #34D399' }}
        />
      </div>

      {/* inner orbit ring */}
      <div
        className="absolute rounded-full border"
        style={{
          inset: '18%',
          borderColor: 'rgba(255,184,0,0.15)',
          animation: 'spin-slow 16s linear infinite reverse',
        }}
      />

      {/* hexagon coin */}
      <div
        className="relative z-10 flex items-center justify-center"
        style={{
          width: '50%',
          height: '50%',
          clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
          background: 'linear-gradient(145deg, #FFCF40 0%, #FFB800 45%, #CC9400 100%)',
          boxShadow: '0 0 48px rgba(255,184,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
          animation: 'badge-float-y 3.2s ease-in-out infinite',
        }}
      >
        <span
          className="font-display text-black leading-none"
          style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}
          aria-hidden="true"
        >
          ★
        </span>
      </div>

      <style jsx>{`
        @keyframes badge-float-y {
          0%, 100% {
            transform: translateY(-8px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>

      {/* corner particle dots */}
      {[
        { top: '14%', left: '18%', size: 3, color: '#FFB800', delay: '0s' },
        { top: '22%', right: '12%', size: 2, color: '#60A5FA', delay: '0.4s' },
        { bottom: '18%', left: '14%', size: 2, color: '#34D399', delay: '0.8s' },
        { bottom: '14%', right: '18%', size: 3, color: '#FFB800', delay: '1.2s' },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: p.top,
            left: (p as { left?: string }).left,
            right: (p as { right?: string }).right,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: 0.7,
            animation: `glow-pulse 2s ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  )
}

/* ─── Three.js badge (mid + high tier) ─────────────────────────────────────── */
function ThreeHeroBadge({
  tier,
  className,
}: {
  tier: Exclude<DeviceTier, 'low'>
  className?: string
}) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let rafId = 0
    let isDestroyed = false

    /* ── Renderer ─────────────────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, tier === 'high' ? 2 : 1.5))
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    mount.appendChild(renderer.domElement)

    /* ── Scene ────────────────────────────────────────────────────────────── */
    const scene = new THREE.Scene()

    /* ── Camera ───────────────────────────────────────────────────────────── */
    const camera = new THREE.PerspectiveCamera(
      42,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    )
    const FRAME_RADIUS = 2.38

    function frameCamera(width: number, height: number) {
      const aspect = width / Math.max(height, 1)
      const halfFov = THREE.MathUtils.degToRad(camera.fov) / 2
      const distanceForHeight = FRAME_RADIUS / Math.tan(halfFov)
      const distanceForWidth = FRAME_RADIUS / (Math.tan(halfFov) * Math.max(aspect, 0.1))

      camera.aspect = aspect
      camera.position.set(0, 0.25, Math.max(distanceForHeight, distanceForWidth))
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
    }

    frameCamera(mount.clientWidth, mount.clientHeight)

    /* ── Lights ───────────────────────────────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.12))

    // Gold key light — front right
    const keyLight = new THREE.PointLight(0xFFB800, 5.0, 12)
    keyLight.position.set(2.5, 2.5, 3.5)
    scene.add(keyLight)

    // Cool blue rim — behind left (creates contrast with gold)
    const rimLight = new THREE.DirectionalLight(0x6090FF, 1.0)
    rimLight.position.set(-3, 1.5, -4)
    scene.add(rimLight)

    // Warm accent — below left (secondary specular hotspot)
    const accentLight = new THREE.PointLight(0xFFCF40, 2.5, 8)
    accentLight.position.set(-2, -2, 2.5)
    scene.add(accentLight)

    // Fill — above center
    const fillLight = new THREE.PointLight(0xffffff, 0.8, 10)
    fillLight.position.set(0, 4, 2)
    scene.add(fillLight)

    /* ── Materials ────────────────────────────────────────────────────────── */
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xFFB800,
      metalness: 0.97,
      roughness: 0.22,
      emissive: 0x7A5500,
      emissiveIntensity: 0.2,
    })
    const brightGoldMat = new THREE.MeshStandardMaterial({
      color: 0xFFCF40,
      metalness: 1.0,
      roughness: 0.08,
      emissive: 0xFFB800,
      emissiveIntensity: 0.55,
    })
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xFFB800,
      emissive: 0xFFB800,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.5,
    })
    const blueDotMat = new THREE.MeshStandardMaterial({
      color: 0x60A5FA,
      emissive: 0x60A5FA,
      emissiveIntensity: 4,
    })
    const greenDotMat = new THREE.MeshStandardMaterial({
      color: 0x34D399,
      emissive: 0x34D399,
      emissiveIntensity: 4,
    })

    /* ── Badge group (coin + star) ────────────────────────────────────────── */
    const badgeGroup = new THREE.Group()
    scene.add(badgeGroup)

    const DEPTH = 0.2
    const hexGeo = new THREE.ExtrudeGeometry(makeHexShape(1.0), {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.06,
      bevelSegments: 5,
    })
    // Centre the coin on the Z axis so it pivots around its middle
    hexGeo.translate(0, 0, -DEPTH / 2)

    const hexMesh = new THREE.Mesh(hexGeo, goldMat)
    badgeGroup.add(hexMesh)

    // Front star face (on top of coin front face)
    const starGeo = new THREE.ShapeGeometry(makeStarShape(0.54, 0.24))
    const starFront = new THREE.Mesh(starGeo, brightGoldMat)
    starFront.position.z = DEPTH / 2 + 0.022
    badgeGroup.add(starFront)

    // Back star face (mirrored onto the coin's rear face)
    const starBack = new THREE.Mesh(starGeo, brightGoldMat)
    starBack.position.z = -(DEPTH / 2 + 0.022)
    starBack.rotation.y = Math.PI
    badgeGroup.add(starBack)

    // Slight initial tilt so bevel edges are immediately visible
    badgeGroup.rotation.x = 0.08

    /* ── Orbit group (ring + dots — independent from badge spin) ─────────── */
    const orbitGroup = new THREE.Group()
    orbitGroup.rotation.x = Math.PI / 7   // tilt orbit plane for depth
    scene.add(orbitGroup)

    const ORBIT_R = 1.9
    const torusGeo = new THREE.TorusGeometry(ORBIT_R, 0.013, 8, 90)
    const torusMesh = new THREE.Mesh(torusGeo, ringMat)
    orbitGroup.add(torusMesh)

    const dot1Geo = new THREE.SphereGeometry(0.068, 12, 12)
    const dot1 = new THREE.Mesh(dot1Geo, blueDotMat)
    dot1.position.set(ORBIT_R, 0, 0)
    orbitGroup.add(dot1)

    const dot2Geo = new THREE.SphereGeometry(0.052, 10, 10)
    const dot2 = new THREE.Mesh(dot2Geo, greenDotMat)
    dot2.position.set(-ORBIT_R, 0, 0)
    orbitGroup.add(dot2)

    /* ── Particle field ───────────────────────────────────────────────────── */
    const pCount = tier === 'high' ? 340 : 170
    const pPos = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 2.0 + Math.random() * 1.4
      pPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.65
      pPos[i * 3 + 2] = r * Math.cos(phi) * 0.5
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const pMat = new THREE.PointsMaterial({
      color: 0xFFB800,
      size: 0.024,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true,
    })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    /* ── Resize ───────────────────────────────────────────────────────────── */
    function onResize() {
      if (!mount || isDestroyed) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      frameCamera(w, h)
      renderer.setSize(w, h)
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(mount)

    /* ── Visibility — pause RAF when tab hidden ───────────────────────────── */
    function onVisChange() {
      if (document.hidden) {
        cancelAnimationFrame(rafId)
      } else if (!isDestroyed) {
        animate()
      }
    }
    document.addEventListener('visibilitychange', onVisChange)

    /* ── Animation loop ───────────────────────────────────────────────────── */
    function animate() {
      if (isDestroyed) return
      rafId = requestAnimationFrame(animate)

      const t = Date.now() * 0.001

      // Badge: slow Y rotation + subtle vertical float
      badgeGroup.rotation.y += 0.006
      badgeGroup.position.y = 0.16 + Math.sin(t * 0.75) * 0.07

      // Orbit ring: independent Z spin
      orbitGroup.rotation.z += 0.0075

      // Particles: imperceptibly slow drift
      particles.rotation.y += 0.0007
      particles.rotation.x += 0.0003

      renderer.render(scene, camera)
    }

    animate()

    /* ── Cleanup ──────────────────────────────────────────────────────────── */
    return () => {
      isDestroyed = true
      cancelAnimationFrame(rafId)
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisChange)

      hexGeo.dispose()
      starGeo.dispose()
      torusGeo.dispose()
      dot1Geo.dispose()
      dot2Geo.dispose()
      pGeo.dispose()

      goldMat.dispose()
      brightGoldMat.dispose()
      ringMat.dispose()
      blueDotMat.dispose()
      greenDotMat.dispose()
      pMat.dispose()

      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [tier])

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ touchAction: 'none', willChange: 'transform' }}
    />
  )
}

/* ─── Public component ──────────────────────────────────────────────────────── */
export function HeroBadge({ className }: { className?: string }) {
  const { tier } = useDeviceCapability()

  if (tier === 'low') {
    return <CSSHexBadge className={className} />
  }

  return <ThreeHeroBadge tier={tier} className={className} />
}
