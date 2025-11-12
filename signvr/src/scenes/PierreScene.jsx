import { useEffect, useRef } from 'react'
import 'aframe'

const PierreScene = ({ onLoaded }) => {
  const sceneRef = useRef(null)

  useEffect(() => {
    const sceneEl = sceneRef.current
    if (!sceneEl) return undefined
    const handleLoaded = () => {
      onLoaded?.()
    }
    sceneEl.addEventListener('loaded', handleLoaded)
    return () => {
      sceneEl.removeEventListener('loaded', handleLoaded)
    }
  }, [onLoaded])

  return (
    <a-scene
      ref={sceneRef}
      embedded
      background="color: #0a0f17"
      renderer="colorManagement: true"
      vr-mode-ui="enabled: true"
    >
      <a-entity id="rig" position="0 1.6 3">
        <a-camera>
          <a-cursor fuse="true" fuse-timeout="1000" />
        </a-camera>
      </a-entity>
      <a-entity geometry="primitive: plane; width: 12; height: 12" material="color: #020617; shader: flat" rotation="-90 0 0" position="0 0 0" />
      <a-entity
        geometry="primitive: icosahedron; radius: 0.7; detail: 1"
        material="color: #64748b; roughness: 0.9; metalness: 0.05"
        position="0 1.6 -2"
        animation__float="property: position; dir: alternate; dur: 4000; easing: easeInOutSine; to: 0 1.8 -2"
        animation__roll="property: rotation; dur: 12000; loop: true; easing: linear; to: 0 360 0"
        forgiveness-stone
      />
      <a-entity geometry="primitive: circle; radius: 3.5" material="color: #1f2937; opacity: 0.5; transparent: true" rotation="-90 0 0" position="0 0 -2" />
      <a-entity light="type: ambient; intensity: 0.3; color: #f8fafc" />
      <a-entity light="type: point; intensity: 1.2; color: #f87171" position="-2 3 -3" />
      <a-entity light="type: point; intensity: 0.9; color: #38bdf8" position="2 2 -1" />
      <a-sky color="#050b16" />
    </a-scene>
  )
}

export default PierreScene
