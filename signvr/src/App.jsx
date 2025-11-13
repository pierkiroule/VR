import { useMemo, useState } from 'react'
import './App.css'
import FluxScene from './scenes/FluxScene.jsx'
import PeauScene from './scenes/PeauScene.jsx'
import VoixScene from './scenes/VoixScene.jsx'
import PierreScene from './scenes/PierreScene.jsx'
import SouffleScene from './scenes/SouffleScene.jsx'
import useAmbientSound from './hooks/useAmbientSound.js'

function App() {
  const [activeModule, setActiveModule] = useState(null)
  const [sceneLoaded, setSceneLoaded] = useState(false)
  const ambient = useAmbientSound()

  const modules = useMemo(
    () => [
      {
        key: 'flux',
        title: 'Flux à dompter ⚡',
        subtitle: 'Canaliser l’énergie turbulente',
        Scene: FluxScene,
      },
      {
        key: 'peau',
        title: 'Peau de signes 🌌',
        subtitle: 'Tracer des mots qui apaisent',
        Scene: PeauScene,
      },
      {
        key: 'voix',
        title: 'Voix dans la bulle 💬',
        subtitle: 'Transformer la parole en vibration',
        Scene: VoixScene,
      },
      {
        key: 'pierre',
        title: 'Pierre du pardon 💎',
        subtitle: 'Laisser la roche se dissoudre en lumière',
        Scene: PierreScene,
      },
      {
        key: 'souffle',
        title: 'Souffle de lumière 🌬️',
        subtitle: 'Respirer et illuminer l’espace',
        Scene: SouffleScene,
      },
    ],
    [],
  )

  const handleSelectModule = async (moduleKey) => {
    setSceneLoaded(false)
    setActiveModule(moduleKey)
    await ambient.start()
  }

  const handleReturnHome = () => {
    setActiveModule(null)
    setSceneLoaded(false)
  }

  const currentModule = modules.find((module) => module.key === activeModule)
  const SceneComponent = currentModule?.Scene ?? null

  return (
    <div className="app-shell">
      <div className={`home-panel ${activeModule ? 'hidden' : 'visible'}`}>
        <header className="hero">
          <p className="tagline">Prototype thérapeutique immersif</p>
          <h1>SignVR – Transformer la douleur en langage</h1>
          <p className="intro">
            Une traversée poétique où les gestes, la voix et le souffle métamorphosent
            l’agitation intérieure en symboles lumineux.
          </p>
        </header>
        <div className="module-grid">
          {modules.map((module) => (
            <button
              key={module.key}
              className="module-card"
              type="button"
              onClick={() => handleSelectModule(module.key)}
            >
              <span className="module-title">{module.title}</span>
              <span className="module-subtitle">{module.subtitle}</span>
            </button>
          ))}
        </div>
      </div>

      {SceneComponent && (
        <div className={`scene-wrapper ${sceneLoaded ? 'scene-ready' : ''}`}>
          <SceneComponent onLoaded={() => setSceneLoaded(true)} />
          <button className="return-button" type="button" onClick={handleReturnHome}>
            Retour
          </button>
          {!sceneLoaded && <div className="scene-overlay">Respire… la scène se tisse.</div>}
        </div>
      )}
    </div>
  )
}

export default App
