import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Settings, Download, Zap } from 'lucide-react'
import TranscriptPanel from './components/TranscriptPanel'
import SuggestionsPanel from './components/SuggestionsPanel'
import ChatPanel from './components/ChatPanel'
import SettingsPanel from './components/SettingsPanel'
import { useAudioRecorder } from './hooks/useAudioRecorder'
import { transcribeAudio, generateSuggestions, generateChatAnswer, streamResponse, DEFAULT_SETTINGS } from './lib/groq'
import { exportSession } from './lib/export'
const SUGGESTION_INTERVAL_MS = 30_000
export default function App() {
  const [settings, setSettings] = useState(() => { try { const s = localStorage.getItem('tm_settings'); return s ? {...DEFAULT_SETTINGS,...JSON.parse(s)} : {...DEFAULT_SETTINGS} } catch { return {...DEFAULT_SETTINGS} } })
  const [showSettings, setShowSettings] = useState(!settings.apiKey)
  const [transcript, setTranscript] = useState('')
  const transcriptRef = useRef('')
  const [batches, setBatches] = useState([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const chatHistoryRef = useRef([])
  const suggestionTimerRef = useRef(null)
  const saveSettings = (newSettings) => { setSettings(newSettings); localStorage.setItem('tm_settings', JSON.stringify(newSettings)); if (newSettings.apiKey) setShowSettings(false) }
  const handleAudioChunk = useCallback(async (blob) => {
    if (!settings.apiKey) return
    try {
      const text = await transcribeAudio(blob, settings.apiKey)
      if (!text) return
      const updated = transcriptRef.current ? transcriptRef.current + '\n' + text : text
      transcriptRef.current = updated
      setTranscript(updated)
    } catch (err) { console.error('Transcription error:', err) }
  }, [settings.apiKey])
  const { isRecording, error: recorderError, start, stop, manualFlush } = useAudioRecorder({ onChunk: handleAudioChunk })
  const refreshSuggestions = useCallback(async () => {
    if (!settings.apiKey || !transcriptRef.current.trim()) return
    setSuggestionsLoading(true)
    try {
      const suggestions = await generateSuggestions(transcriptRef.current, transcriptRef.current, settings.apiKey, settings)
      if (suggestions.length > 0) { setBatches((prev) => [{ id: Date.now(), timestamp: new Date().toISOString(), suggestions }, ...prev]) }
    } catch (err) { console.error('Suggestions error:', err) } finally { setSuggestionsLoading(false) }
  }, [settings])
  const handleManualRefresh = useCallback(() => { if (isRecording) manualFlush(); setTimeout(() => refreshSuggestions(), 500) }, [isRecording, manualFlush, refreshSuggestions])
  useEffect(() => {
    if (isRecording) { suggestionTimerRef.current = setInterval(refreshSuggestions, SUGGESTION_INTERVAL_MS) }
    else { clearInterval(suggestionTimerRef.current) }
    return () => clearInterval(suggestionTimerRef.current)
  }, [isRecording, refreshSuggestions])
  const handleSend = useCallback(async (message) => {
    if (!settings.apiKey || isStreaming) return
    const userMsg = { role: 'user', content: message, timestamp: new Date().toISOString() }
    setChatMessages((prev) => [...prev, userMsg])
    const apiHistory = chatHistoryRef.current.map(m => ({ role: m.role, content: m.content }))
    setIsStreaming(true)
    let fullContent = ''
    try {
      const stream = await generateChatAnswer(message, transcriptRef.current, apiHistory, settings.apiKey, settings)
      const assistantMsg = { role: 'assistant', content: '', timestamp: new Date().toISOString() }
      setChatMessages((prev) => [...prev, assistantMsg])
      for await (const chunk of streamResponse(stream)) {
        fullContent += chunk
        setChatMessages((prev) => { const u = [...prev]; u[u.length-1] = {...assistantMsg, content: fullContent}; return u })
      }
      chatHistoryRef.current = [...chatHistoryRef.current, { role:'user', content:message }, { role:'assistant', content:fullContent }]
    } catch (err) {
      setChatMessages((prev) => [...prev, { role:'assistant', content:`Error: ${err.message}`, timestamp: new Date().toISOString() }])
    } finally { setIsStreaming(false) }
  }, [settings, isStreaming])
  const handleSuggestionClick = useCallback((suggestion) => { handleSend(suggestion.detail_prompt) }, [handleSend])
  const handleExport = () => exportSession({ transcript: transcriptRef.current, suggestionBatches: batches, chatHistory: chatMessages })
  const apiKeyMissing = !settings.apiKey
  return (
    <div style={appShell}>
      <div style={topBar}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <Zap size={15} style={{color:'var(--accent)'}} />
          <span style={{fontWeight:700,fontSize:14,color:'var(--text-primary)',letterSpacing:'-0.01em'}}>TwinMind</span>
          <span style={{fontSize:11,color:'var(--text-muted)',background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:20,padding:'2px 8px'}}>Live Suggestions</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {isRecording && <div style={recordingPill}><span style={recDot} className="animate-pulse-dot" />Recording</div>}
          <button onClick={handleExport} style={actionBtn}><Download size={14} />Export</button>
          <button onClick={()=>setShowSettings(true)} style={{...actionBtn,...(apiKeyMissing?{background:'var(--accent)',color:'#fff',border:'1px solid var(--accent)'}:{})}}><Settings size={14} />{apiKeyMissing?'Add API Key':'Settings'}</button>
        </div>
      </div>
      {apiKeyMissing && (
        <div style={{background:'rgba(124,106,247,0.08)',borderBottom:'1px solid rgba(124,106,247,0.2)',padding:'8px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:12,color:'var(--text-secondary)',flexShrink:0}}>
          <span>Add your Groq API key in Settings to start using live suggestions</span>
          <button onClick={()=>setShowSettings(true)} style={{background:'var(--accent)',color:'#fff',borderRadius:7,padding:'4px 12px',fontSize:12,fontWeight:600,cursor:'pointer'}}>Open Settings</button>
        </div>
      )}
      <div style={mainGrid}>
        <TranscriptPanel transcript={transcript} isRecording={isRecording} onStart={start} onStop={stop} error={recorderError} />
        <SuggestionsPanel batches={batches} isLoading={suggestionsLoading} onRefresh={handleManualRefresh} onSuggestionClick={handleSuggestionClick} />
        <ChatPanel messages={chatMessages} isStreaming={isStreaming} onSend={handleSend} />
      </div>
      {showSettings && <SettingsPanel settings={settings} onSave={saveSettings} onClose={()=>setShowSettings(false)} />}
    </div>
  )
}
const appShell={display:'flex',flexDirection:'column',height:'100vh',width:'100vw',overflow:'hidden'}
const topBar={display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 20px',height:48,background:'var(--bg-panel)',borderBottom:'1px solid var(--border)',flexShrink:0,zIndex:10}
const actionBtn={display:'flex',alignItems:'center',gap:5,background:'var(--bg-card)',border:'1px solid var(--border)',color:'var(--text-secondary)',borderRadius:8,padding:'6px 12px',fontSize:12,fontWeight:500,cursor:'pointer'}
const recordingPill={display:'flex',alignItems:'center',gap:6,background:'var(--green-dim)',border:'1px solid rgba(74,222,128,0.3)',color:'var(--green)',borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:600}
const recDot={width:6,height:6,borderRadius:'50%',background:'var(--green)',display:'inline-block'}
const mainGrid={flex:1,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',overflow:'hidden',minHeight:0}