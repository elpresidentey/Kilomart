import { useEffect, useRef } from 'react'
import * as THREE from 'three'

type ThreeParticlesFieldProps = {
  className?: string
  particleCount?: number
}

export function ThreeParticlesField({
  className = '',
  particleCount = 180,
}: ThreeParticlesFieldProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (prefersReducedMotion) return

    let animationFrame = 0
    let disposed = false

    let renderer: THREE.WebGLRenderer | null = null

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      })
    } catch {
      return
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100)
    camera.position.z = 18

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    host.appendChild(renderer.domElement)

    const particles = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    for (let index = 0; index < particleCount; index += 1) {
      const offset = index * 3
      const spread = index % 3 === 0 ? 12 : 8
      positions[offset] = (Math.random() - 0.5) * spread * 2.2
      positions[offset + 1] = (Math.random() - 0.5) * spread * 1.6
      positions[offset + 2] = (Math.random() - 0.5) * 6

      velocities[offset] = (Math.random() - 0.5) * 0.012
      velocities[offset + 1] = (Math.random() - 0.5) * 0.01
      velocities[offset + 2] = (Math.random() - 0.5) * 0.008
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0xf5d0a3,
      size: 0.12,
      transparent: true,
      opacity: 0.86,
      sizeAttenuation: true,
      depthWrite: false,
    })

    const points = new THREE.Points(particles, material)
    scene.add(points)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const resize = () => {
      const width = host.clientWidth || 1
      const height = host.clientHeight || 1
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()

    const clock = new THREE.Clock()

    const tick = () => {
      if (disposed) return

      const elapsed = clock.getElapsedTime()
      const positionAttribute = particles.getAttribute('position') as THREE.BufferAttribute
      const positionArray = positionAttribute.array as Float32Array

      for (let index = 0; index < particleCount; index += 1) {
        const offset = index * 3
        positionArray[offset] += velocities[offset]
        positionArray[offset + 1] += velocities[offset + 1]
        positionArray[offset + 2] += velocities[offset + 2]

        const boundary = index % 3 === 0 ? 11 : 8.5
        if (positionArray[offset] > boundary) positionArray[offset] = -boundary
        if (positionArray[offset] < -boundary) positionArray[offset] = boundary
        if (positionArray[offset + 1] > boundary * 0.7) positionArray[offset + 1] = -boundary * 0.7
        if (positionArray[offset + 1] < -boundary * 0.7) positionArray[offset + 1] = boundary * 0.7
      }

      positionAttribute.needsUpdate = true
      points.rotation.y = elapsed * 0.06
      points.rotation.x = Math.sin(elapsed * 0.12) * 0.08
      camera.position.x = Math.sin(elapsed * 0.15) * 0.4
      camera.position.y = Math.cos(elapsed * 0.11) * 0.25
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
      animationFrame = window.requestAnimationFrame(tick)
    }

    animationFrame = window.requestAnimationFrame(tick)

    return () => {
      disposed = true
      window.cancelAnimationFrame(animationFrame)
      observer.disconnect()
      particles.dispose()
      material.dispose()
      renderer?.dispose()
      if (renderer?.domElement.parentNode === host) {
        host.removeChild(renderer.domElement)
      }
    }
  }, [particleCount])

  return <div ref={hostRef} className={className} aria-hidden="true" />
}
