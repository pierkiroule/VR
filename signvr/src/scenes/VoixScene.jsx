import { useEffect, useRef } from 'react'
import 'aframe'
import useMicrophoneLevel from '../hooks/useMicrophoneLevel.js'

const VoixScene = ({ onLoaded }) => {
  const sceneRef = useRef(null)
  const sphereRef = useRef(null)
  const auraRef = useRef(null)
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
    if (sphereRef.current) {
      sphereRef.current.setAttribute('mic-pulse', `level: ${level}`)
    }
    if (auraRef.current) {
      const scale = 2.2 + level * 6
      auraRef.current.object3D.scale.set(scale, scale, scale)
      auraRef.current.setAttribute('material', 'opacity', 0.18 + level * 0.3)
    }
  }, [level])

  return (
    <a-scene
      ref={sceneRef}
      embedded
      background="color: #09061d"
      renderer="physicallyCorrectLights: true; toneMapping: linear"
      vr-mode-ui="enabled: true"
    >
      <a-entity id="rig" position="0 1.6 2">
        <a-camera wasd-controls-enabled="false">
          <a-cursor fuse="false" />
        </a-camera>
      </a-entity>
      <a-entity ref={sphereRef} geometry="primitive: sphere; radius: 0.6" material="color: #a855f7; emissive: #9333ea; roughness: 0.2" position="0 1.6 -1.2" />
      <a-entity ref={auraRef} geometry="primitive: sphere; radius: 1.2" material="color: #dbb4fe; emissive: #c084fc; emissiveIntensity: 0.3; opacity: 0.18; transparent: true" position="0 1.6 -1.2" />
      <a-entity geometry="primitive: torus; radius: 1.4; radiusTubular: 0.03" material="color: #60a5fa; opacity: 0.4; transparent: true" rotation="90 0 0" position="0 1.6 -1.2" />
      <a-entity light="type: spot; intensity: 0.9; angle: 45; color: #c4b5fd" position="0 3 -0.3" target="#voice-target" />
      <a-entity id="voice-target" position="0 1.6 -1.2" />
      <a-sky color="#0b0624" />
    </a-scene>
  )
}

export default VoixScene
