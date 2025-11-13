import 'aframe'

const { AFRAME } = window
const THREE = window.THREE

if (!AFRAME) {
  throw new Error('A-Frame failed to load')
}

const ensureComponent = (name, definition) => {
  if (!AFRAME.components[name]) {
    AFRAME.registerComponent(name, definition)
  }
}

ensureComponent('flow-field', {
  schema: {
    count: { type: 'int', default: 160 },
    radius: { type: 'number', default: 4.5 },
  },
  init() {
    this.particles = []
    this.direction = new THREE.Vector3()
    for (let i = 0; i < this.data.count; i += 1) {
      const particle = document.createElement('a-sphere')
      const hue = 180 + Math.floor(Math.random() * 120)
      particle.setAttribute('radius', 0.05 + Math.random() * 0.03)
      particle.setAttribute(
        'material',
        `color: hsl(${hue}, 90%, 70%); opacity: 0.65; shader: flat; transparent: true`,
      )
      this.randomizeParticle(particle, true)
      this.el.appendChild(particle)
      this.particles.push({
        el: particle,
        speed: 0.0009 + Math.random() * 0.0025,
        offset: Math.random() * Math.PI * 2,
      })
    }
  },
  randomizeParticle(particle, initial = false) {
    const position = particle.object3D.position
    const radius = this.data.radius
    position.set(
      (Math.random() - 0.5) * radius * 2,
      (Math.random() - 0.5) * radius,
      (Math.random() - 0.5) * radius * 2 - 3,
    )
    if (!initial) {
      particle.setAttribute('material', 'opacity', 0)
      particle.setAttribute(
        'animation__fade',
        'property: material.opacity; to: 0.65; dur: 600; easing: easeOutQuad',
      )
    }
  },
  tick(time, delta) {
    const scene = this.el.sceneEl
    if (!scene?.camera) return
    scene.camera.getWorldDirection(this.direction)
    for (const particle of this.particles) {
      const { el, speed, offset } = particle
      const mesh = el.object3D
      const localSpeed = speed * delta * 60
      mesh.position.x += this.direction.x * localSpeed
      mesh.position.y += this.direction.y * localSpeed * 0.5
      mesh.position.z += this.direction.z * localSpeed
      mesh.rotation.y += localSpeed * 0.5
      mesh.position.y += Math.sin(time * 0.001 + offset) * 0.002 * delta
      if (mesh.position.length() > this.data.radius * 1.4 || mesh.position.z > 2) {
        this.randomizeParticle(el)
      }
    }
  },
})

ensureComponent('sign-trail', {
  schema: {
    distance: { type: 'number', default: 3 },
    decay: { type: 'int', default: 9000 },
  },
  init() {
    this.drawing = false
    this.scene = this.el.sceneEl
    this.canvas = this.scene?.canvas
    this.pointerMove = this.pointerMove.bind(this)
    this.startDrawing = this.startDrawing.bind(this)
    this.stopDrawing = this.stopDrawing.bind(this)
    if (this.scene) {
      this.scene.addEventListener('mousedown', this.startDrawing)
      window.addEventListener('mouseup', this.stopDrawing)
      window.addEventListener('mousemove', this.pointerMove)
    }
  },
  remove() {
    if (this.scene) {
      this.scene.removeEventListener('mousedown', this.startDrawing)
    }
    window.removeEventListener('mouseup', this.stopDrawing)
    window.removeEventListener('mousemove', this.pointerMove)
  },
  startDrawing(event) {
    this.drawing = true
    this.spawnSpark(event)
  },
  stopDrawing() {
    this.drawing = false
  },
  pointerMove(event) {
    if (!this.drawing) return
    this.spawnSpark(event)
  },
  spawnSpark(event) {
    if (!this.scene?.camera || !this.scene.canvas) return
    const rect = this.scene.canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    const vector = new THREE.Vector3(x, y, -1)
    vector.unproject(this.scene.camera)
    const cameraPosition = new THREE.Vector3()
    this.scene.camera.getWorldPosition(cameraPosition)
    const direction = vector.sub(cameraPosition).normalize()
    const point = cameraPosition.clone().add(direction.multiplyScalar(this.data.distance))
    const sparkle = document.createElement('a-sphere')
    sparkle.classList.add('sign-spark')
    sparkle.setAttribute('radius', 0.05 + Math.random() * 0.04)
    sparkle.setAttribute(
      'material',
      'color: #f8fafc; emissive: #7dd3fc; emissiveIntensity: 1.2; opacity: 0.85; transparent: true; shader: standard',
    )
    sparkle.object3D.position.copy(point)
    const decay = this.data.decay + Math.random() * 2000
    sparkle.setAttribute(
      'animation__fade',
      `property: material.opacity; to: 0; dur: ${decay}; easing: easeOutQuad`,
    )
    sparkle.setAttribute(
      'animation__shrink',
      `property: scale; to: 0 0 0; dur: ${decay}; easing: easeInQuad`,
    )
    this.el.appendChild(sparkle)
    setTimeout(() => {
      sparkle.parentNode?.removeChild(sparkle)
    }, decay + 500)
  },
})

ensureComponent('mic-pulse', {
  schema: {
    level: { type: 'number', default: 0 },
  },
  update() {
    this.targetLevel = this.data.level
    if (this.level == null) {
      this.level = 0
    }
  },
  tick(time, delta) {
    if (!this.el.object3D) return
    this.level = THREE.MathUtils.lerp(this.level ?? 0, this.targetLevel ?? 0, Math.min(delta / 200, 0.25))
    const base = 1 + this.level * 3
    this.el.object3D.scale.set(base, base, base)
    const mesh = this.el.getObject3D('mesh')
    if (mesh?.material) {
      mesh.material.emissive = new THREE.Color(0.7 + this.level * 0.3, 0.35, 1)
      mesh.material.emissiveIntensity = 0.6 + this.level * 1.4
      mesh.material.opacity = 0.7 + this.level * 0.2
      mesh.material.needsUpdate = true
    }
  },
})

ensureComponent('forgiveness-stone', {
  init() {
    this.dissolved = false
    this.onClick = this.onClick.bind(this)
    this.glow = document.createElement('a-entity')
    this.glow.setAttribute('geometry', 'primitive: sphere; radius: 0.2')
    this.glow.setAttribute(
      'material',
      'color: #f5f5f5; emissive: #bae6fd; emissiveIntensity: 1.4; opacity: 0.3; transparent: true',
    )
    this.glow.setAttribute('scale', '1 1 1')
    this.el.appendChild(this.glow)
    this.el.addEventListener('click', this.onClick)
  },
  remove() {
    this.el.removeEventListener('click', this.onClick)
    this.glow?.parentNode?.removeChild(this.glow)
  },
  onClick() {
    if (this.dissolved) return
    this.dissolved = true
    this.el.setAttribute(
      'animation__scale',
      'property: scale; to: 0 0 0; dur: 2500; easing: easeOutExpo',
    )
    this.el.setAttribute(
      'animation__fade',
      'property: material.opacity; to: 0; dur: 2300; easing: easeInQuad',
    )
    this.glow.setAttribute(
      'animation__expand',
      'property: scale; to: 9 9 9; dur: 2400; easing: easeOutCubic',
    )
    this.glow.setAttribute(
      'animation__glow',
      'property: material.opacity; to: 0; dur: 2400; easing: linear; delay: 200',
    )
  },
})

ensureComponent('breath-field', {
  schema: {
    level: { type: 'number', default: 0 },
    count: { type: 'int', default: 80 },
  },
  init() {
    this.nodes = []
    this.level = 0
    this.targetLevel = 0
    for (let i = 0; i < this.data.count; i += 1) {
      const node = document.createElement('a-sphere')
      node.setAttribute('radius', 0.04 + Math.random() * 0.05)
      node.setAttribute(
        'material',
        'color: #f8fafc; emissive: #99f6e4; emissiveIntensity: 0.8; opacity: 0.6; transparent: true; shader: flat',
      )
      const basePosition = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.2) * 2.2,
        -1.8 - Math.random() * 3,
      )
      node.object3D.position.copy(basePosition)
      const offset = Math.random() * Math.PI * 2
      this.nodes.push({ el: node, basePosition, offset })
      this.el.appendChild(node)
    }
  },
  update() {
    this.targetLevel = this.data.level
  },
  tick(time, delta) {
    this.level = THREE.MathUtils.lerp(this.level, this.targetLevel ?? 0, Math.min(delta / 400, 0.2))
    const waveFactor = 0.35 + this.level * 3
    for (const node of this.nodes) {
      const { el, basePosition, offset } = node
      const obj = el.object3D
      obj.position.x = basePosition.x + Math.sin(time * 0.001 + offset) * 0.5 * (1 + this.level)
      obj.position.y =
        basePosition.y + Math.cos(time * 0.0012 + offset) * (waveFactor * 0.5 + this.level * 0.6)
      obj.position.z = basePosition.z + Math.sin(time * 0.0013 + offset) * 0.4
      const scale = 1 + this.level * 1.8
      obj.scale.set(scale, scale, scale)
    }
  },
})
