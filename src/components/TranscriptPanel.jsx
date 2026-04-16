import React, { useEffect, useRef } from 'react'
import { Mic, MicOff, AlertCircle } from 'lucide-react'
export default function TranscriptPanel({ transcript, isRecording, onStart, onStop, error }) {
  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [transcript])
  const lines = transcript ? transcript.split('\n').filter(Boolean) : []
  return (
    <div style={container}>
      <div style={panelHeader}>
        <div style={titleRow}>
          {isRecording && <span style={liveDot} className="animate-pulse-dot" />}
          <span style={title}>Transcript</span>
        </div>
        <button onClick={isRecording ? onStop : onStart} style={isRecording ? stopBtn : startBtn}>
          {isRecording ? <><MicOff size={14} /> Stop</> : <><Mic size={14} /> Start</>}
        </button>
      </div>
      {error && <div style={errorBox}><AlertCircle size={13} style={{flexShrink:0}} /><span>{error}</span></div>}
      <div style={transcriptArea}>
        {lines.length === 0 ? (
          <div style={emptyState}>
            <Mic size={28} style={{color:'var(--text-muted)',marginBottom:12}} />
            <p style={{color:'var(--text-muted)',fontSize:13,lineHeight:1.7,maxWidth:220,textAlign:'center'}}>
              {isRecording ? 'Listening... transcript will appear every ~30 seconds' : 'Press Start to begin capturing audio'}
            </p>
          </div>
        ) : lines.map((line, i) => <p key={i} style={{...transcriptLine,animationDelay:`${i*0.02}s`}} className="slide-in">{line}</p>)}
        <div ref={bottomRef} />
      </div>
      <div style={footer}><span style={{color:'var(--text-muted)',fontSize:11}}>{transcript.split(/\s+/).filter(Boolean).length} words</span></div>
    </div>
  )
}
const container={display:'flex',flexDirection:'column',height:'100%',background:'var(--bg-panel)',borderRight:'1px solid var(--border)'}
const panelHeader={display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',borderBottom:'1px solid var(--border)',flexShrink:0}
const titleRow={display:'flex',alignItems:'center',gap:8}
const title={fontWeight:600,fontSize:13,color:'var(--text-primary)',letterSpacing:'0.02em'}
const liveDot={width:7,height:7,borderRadius:'50%',background:'var(--green)',display:'inline-block',flexShrink:0}
const startBtn={display:'flex',alignItems:'center',gap:6,background:'var(--accent)',color:'#fff',borderRadius:8,padding:'7px 14px',fontSize:12,fontWeight:600}
const stopBtn={display:'flex',alignItems:'center',gap:6,background:'rgba(248,113,113,0.15)',color:'var(--red)',border:'1px solid rgba(248,113,113,0.3)',borderRadius:8,padding:'7px 14px',fontSize:12,fontWeight:600}
const errorBox={display:'flex',alignItems:'flex-start',gap:8,margin:'10px 14px 0',background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.25)',borderRadius:8,padding:'10px 12px',color:'var(--red)',fontSize:12,lineHeight:1.5}
const transcriptArea={flex:1,overflowY:'auto',padding:'14px 16px',display:'flex',flexDirection:'column',gap:10}
const transcriptLine={fontSize:13,lineHeight:1.75,color:'var(--text-primary)'}
const emptyState={display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,padding:'40px 20px',minHeight:200}
const footer={padding:'8px 16px',borderTop:'1px solid var(--border)',flexShrink:0}