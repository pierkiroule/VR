import { useEffect, useRef } from 'react'
import 'aframe'
import useMicrophoneLevel from '../hooks/useMicrophoneLevel.js'

const SouffleScene = ({ onLoaded }) => {
  const sceneRef = useRef(null)
  const fieldRef = useRef(null)
  const level = useMicrophoneLevel(true)

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

  useEffect(() => {
    if (fieldRef.current) {
      fieldRef.current.setAttribute('breath-field', `level: ${level}; count: 90`)
    }
  }, [level])

  return (
    <a-scene
      ref={sceneRef}
      embedded
      background="color: #02121a"
      renderer="antialias: true; physicallyCorrectLights: true"
      vr-mode-ui="enabled: true"
    >
      <a-entity id="rig" position="0 1.6 1.5">
        <a-camera wasd-controls="acceleration: 20">
          <a-cursor fuse="false" />
        </a-camera>
      </a-entity>
      <a-entity ref={fieldRef} breath-field="level: 0; count: 90" position="0 1.5 -2.5" />
      <a-entity light="type: ambient; intensity: 0.4; color: #99f6e4" />
      <a-entity light="type: hemisphere; intensity: 0.8; groundColor: #0f172a; color: #38bdf8" position="0 2 0" />
      <a-entity geometry="primitive: plane; width: 12; height: 12" material="color: #010712; shader: flat" rotation="-90 0 0" position="0 0 -2" />
      <a-sky color="#031a23" />
    </a-scene>
  )
}

export default SouffleScene
