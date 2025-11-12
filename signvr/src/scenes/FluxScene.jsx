import { useEffect, useRef } from 'react'
import 'aframe'

const FluxScene = ({ onLoaded }) => {
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
      renderer="colorManagement: true; physicallyCorrectLights: true"
      background="color: #050912"
      vr-mode-ui="enabled: true"
    >
      <a-entity id="rig" position="0 1.6 0">
        <a-camera wasd-controls="acceleration: 30" look-controls="pointerLockEnabled: true" />
      </a-entity>
      <a-entity flow-field="count: 160; radius: 5.5" />
      <a-entity light="type: ambient; intensity: 0.5; color: #7dd3fc" />
      <a-entity light="type: directional; intensity: 0.7; color: #a855f7" position="2 3 2" />
      <a-sky color="#04060b" />
    </a-scene>
  )
}

export default FluxScene
