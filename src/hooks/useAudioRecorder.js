import { useRef, useState, useCallback } from 'react'
const CHUNK_INTERVAL_MS = 30_000
export function useAudioRecorder({ onChunk }) {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const chunksRef = useRef([])
  const flushChunk = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.requestData()
    }
  }, [])
  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = ['audio/webm;codecs=opus','audio/webm','audio/ogg','audio/mp4'].find((t) => MediaRecorder.isTypeSupported(t)) || ''
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      mediaRecorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
          onChunk(blob)
          chunksRef.current = []
        }
      }
      recorder.onerror = (e) => { setError('Recording error: ' + e.error?.message) }
      recorder.start()
      setIsRecording(true)
      intervalRef.current = setInterval(flushChunk, CHUNK_INTERVAL_MS)
    } catch (err) { setError(err.message || 'Microphone access denied') }
  }, [onChunk, flushChunk])
  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
    if (mediaRecorderRef.current) { mediaRecorderRef.current.requestData(); mediaRecorderRef.current.stop(); mediaRecorderRef.current = null }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null }
    setIsRecording(false)
  }, [])
  const manualFlush = useCallback(() => { flushChunk() }, [flushChunk])
  return { isRecording, error, start, stop, manualFlush }
}