import { useEffect, useRef } from 'react'
import 'aframe'

const PeauScene = ({ onLoaded }) => {
  const sceneRef = useRef(null)
  const trailAnchorRef = useRef(null)

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
    const sceneEl = sceneRef.current
    const trailEl = trailAnchorRef.current
    if (!sceneEl || !trailEl) return undefined
    const cursor = document.createElement('a-entity')
    cursor.setAttribute('cursor', 'fuse: false; rayOrigin: mouse')
    cursor.setAttribute('raycaster', 'objects: .draw-surface')
    sceneEl.appendChild(cursor)
    return () => {
      cursor.parentNode?.removeChild(cursor)
    }
  }, [])

  return (
    <a-scene
      ref={sceneRef}
      embedded
      background="color: #080c19"
      renderer="antialias: true"
      vr-mode-ui="enabled: true"
    >
      <a-entity id="rig" position="0 1.6 0">
        <a-camera>
          <a-cursor fuse="false" />
        </a-camera>
      </a-entity>
      <a-entity
        ref={trailAnchorRef}
        class="draw-surface"
        sign-trail="distance: 3; decay: 8000"
        position="0 0 0"
      />
      <a-entity light="type: point; intensity: 1; color: #60a5fa" position="0 2 -1" />
      <a-entity light="type: ambient; intensity: 0.4; color: #94a3b8" />
      <a-sky color="#0a1025" />
    </a-scene>
  )
}

export default PeauScene
