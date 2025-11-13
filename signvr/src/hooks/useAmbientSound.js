import { useCallback, useEffect, useRef } from 'react'

const buildAmbientNodes = (context) => {
  const masterGain = context.createGain()
  masterGain.gain.value = 0
  masterGain.connect(context.destination)

  const createOsc = (type, frequency, detune = 0) => {
    const osc = context.createOscillator()
    osc.type = type
    osc.frequency.value = frequency
    osc.detune.value = detune
    osc.start()
    return osc
  }

  const oscLow = createOsc('sine', 96)
  const oscMid = createOsc('triangle', 168)
  const oscAir = createOsc('sawtooth', 420, -6)

  const airFilter = context.createBiquadFilter()
  airFilter.type = 'lowpass'
  airFilter.frequency.value = 1200
  airFilter.Q.value = 0.8

  const stereo = context.createStereoPanner()
  stereo.pan.value = 0

  const shimmerGain = context.createGain()
  shimmerGain.gain.value = 0.05

  oscLow.connect(masterGain)
  oscMid.connect(masterGain)
  oscAir.connect(shimmerGain)
  shimmerGain.connect(airFilter)
  airFilter.connect(stereo)
  stereo.connect(masterGain)

  const lfoPan = createOsc('sine', 0.03)
  const lfoPanGain = context.createGain()
  lfoPanGain.gain.value = 0.4
  lfoPan.connect(lfoPanGain)
  lfoPanGain.connect(stereo.pan)

  const lfoFilter = createOsc('sine', 0.017)
  const lfoFilterGain = context.createGain()
  lfoFilterGain.gain.value = 400
  lfoFilter.connect(lfoFilterGain)
  lfoFilterGain.connect(airFilter.frequency)

  const lfoTrem = createOsc('sine', 0.08)
  const lfoTremGain = context.createGain()
  lfoTremGain.gain.value = 0.08
  lfoTrem.connect(lfoTremGain)
  lfoTremGain.connect(masterGain.gain)

  lfoPan.start()
  lfoFilter.start()
  lfoTrem.start()

  const start = () => {
    masterGain.gain.cancelScheduledValues(context.currentTime)
    masterGain.gain.linearRampToValueAtTime(0.18, context.currentTime + 2.5)
  }

  const stop = () => {
    masterGain.gain.cancelScheduledValues(context.currentTime)
    masterGain.gain.linearRampToValueAtTime(0, context.currentTime + 1.5)
  }

  return {
    masterGain,
    nodes: [oscLow, oscMid, oscAir, shimmerGain, airFilter, stereo, lfoPan, lfoFilter, lfoTrem, lfoPanGain, lfoFilterGain, lfoTremGain],
    start,
    stop,
  }
}

export const useAmbientSound = () => {
  const contextRef = useRef(null)
  const ambientRef = useRef(null)
  const requestedStartRef = useRef(false)

  useEffect(() => {
    return () => {
      ambientRef.current?.stop()
      ambientRef.current = null
      if (contextRef.current) {
        contextRef.current.close()
        contextRef.current = null
      }
    }
  }, [])

  const ensureContext = useCallback(() => {
    if (!contextRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) return null
      contextRef.current = new AudioContextClass()
    }
    return contextRef.current
  }, [])

  const start = useCallback(async () => {
    const context = ensureContext()
    if (!context) return
    if (context.state === 'suspended') {
      await context.resume()
    }
    if (!ambientRef.current) {
      ambientRef.current = buildAmbientNodes(context)
    }
    if (!requestedStartRef.current) {
      ambientRef.current.start()
      requestedStartRef.current = true
    }
  }, [ensureContext])

  const stop = useCallback(() => {
    if (ambientRef.current && requestedStartRef.current) {
      ambientRef.current.stop()
      requestedStartRef.current = false
    }
  }, [])

  return { start, stop }
}

export default useAmbientSound
