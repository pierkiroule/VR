import { useEffect, useRef, useState } from 'react'

const createAnalyser = async () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) throw new Error('Web Audio API not supported')
  const context = new AudioContextClass()
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
  const source = context.createMediaStreamSource(stream)
  const analyser = context.createAnalyser()
  analyser.fftSize = 512
  analyser.smoothingTimeConstant = 0.8
  source.connect(analyser)
  return { context, analyser, stream }
}

const getLevel = (analyser, dataArray) => {
  analyser.getByteTimeDomainData(dataArray)
  let sum = 0
  for (let i = 0; i < dataArray.length; i += 1) {
    const v = dataArray[i] / 128 - 1
    sum += v * v
  }
  const rms = Math.sqrt(sum / dataArray.length)
  return Math.min(rms * 4, 1)
}

const stopStream = (stream) => {
  stream?.getTracks().forEach((track) => track.stop())
}

export const useMicrophoneLevel = (enabled) => {
  const [level, setLevel] = useState(0)
  const analyserRef = useRef(null)
  const dataRef = useRef(null)
  const frameRef = useRef(null)
  const streamRef = useRef(null)
  const contextRef = useRef(null)

  useEffect(() => {
    if (!enabled) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      analyserRef.current = null
      dataRef.current = null
      if (contextRef.current) {
        contextRef.current.close()
        contextRef.current = null
      }
      if (streamRef.current) {
        stopStream(streamRef.current)
        streamRef.current = null
      }
      setLevel(0)
      return () => {}
    }

    let stopped = false

    const setup = async () => {
      try {
        const { context, analyser, stream } = await createAnalyser()
        if (stopped) {
          stopStream(stream)
          context.close()
          return
        }
        analyserRef.current = analyser
        dataRef.current = new Uint8Array(analyser.frequencyBinCount)
        streamRef.current = stream
        contextRef.current = context

        const loop = () => {
          if (!analyserRef.current || !dataRef.current) return
          const nextLevel = getLevel(analyserRef.current, dataRef.current)
          setLevel((prev) => prev + (nextLevel - prev) * 0.3)
          frameRef.current = requestAnimationFrame(loop)
        }
        loop()
      } catch (error) {
        console.warn('Microphone capture failed', error)
      }
    }

    setup()

    return () => {
      stopped = true
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      if (contextRef.current) {
        contextRef.current.close()
        contextRef.current = null
      }
      if (streamRef.current) {
        stopStream(streamRef.current)
        streamRef.current = null
      }
      analyserRef.current = null
      dataRef.current = null
    }
  }, [enabled])

  return level
}

export default useMicrophoneLevel
