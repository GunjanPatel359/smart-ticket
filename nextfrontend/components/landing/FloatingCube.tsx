"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function FloatingCube() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 5

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create animated sphere with custom geometry
    const geometry = new THREE.IcosahedronGeometry(2, 4)
    const material = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      roughness: 0.2,
      metalness: 0.8,
      flatShading: false,
    })
    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(10, 10, 5)
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0xa855f7, 0.5)
    pointLight.position.set(-10, -10, -5)
    scene.add(pointLight)

    // Animation
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      // Rotate sphere
      sphere.rotation.x += 0.003
      sphere.rotation.y += 0.005

      // Animate vertices for distortion effect
      const time = Date.now() * 0.001
      const positions = geometry.attributes.position
      const vertex = new THREE.Vector3()

      for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i)
        const distance = vertex.length()
        const distortion = Math.sin(distance * 2 + time) * 0.1
        vertex.normalize().multiplyScalar(distance + distortion)
        positions.setXYZ(i, vertex.x, vertex.y, vertex.z)
      }
      positions.needsUpdate = true
      geometry.computeVertexNormals()

      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener("resize", handleResize)

    // Mouse interaction
    let mouseX = 0
    let mouseY = 0
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return
      mouseX = (event.clientX / containerRef.current.clientWidth) * 2 - 1
      mouseY = -(event.clientY / containerRef.current.clientHeight) * 2 + 1
      sphere.rotation.y = mouseX * 0.5
      sphere.rotation.x = mouseY * 0.5
    }
    window.addEventListener("mousemove", handleMouseMove)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      geometry.dispose()
      material.dispose()
    }
  }, [])

  return <div ref={containerRef} className="w-full h-[400px] md:h-[500px]" />
}
