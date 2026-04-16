import React, { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { DEFAULT_SETTINGS } from '../lib/groq'
export default function SettingsPanel({ settings, onSave, onClose }) {
  const [local, setLocal] = useState(settings)
  const [showKey, setShowKey] = useState(false)
  const set = (key, val) => setLocal((p) => ({ ...p, [key]: val }))
  return (
    <div style={overlay}>
      <div style={panel}>
        <div style={header}>
          <span style={{fontWeight:600,fontSize:15}}>Settings</span>
          <button onClick={onClose} style={closeBtn}><X size={16} /></button>
        </div>
        <div style={body}>
          <Section title="Groq API Key">
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <input type={showKey?'text':'password'} value={local.apiKey||''} onChange={e=>set('apiKey',e.target.value)} placeholder="gsk_..." style={inputStyle} />
              <button onClick={()=>setShowKey(!showKey)} style={iconBtn}>{showKey?<EyeOff size={14}/>:<Eye size={14}/>}</button>
            </div>
            <p style={{fontSize:11,color:'var(--text-muted)',marginTop:6}}>Get your key at console.groq.com</p>
          </Section>
          <Section title="Context Windows">
            <label style={labelStyle}>Suggestion context (chars)
              <input type="number" value={local.suggestionContextWindow} onChange={e=>set('suggestionContextWindow',Number(e.target.value))} style={{...inputStyle,width:100}} />
            </label>
            <label style={{...labelStyle,marginTop:8}}>Chat context (chars)
              <input type="number" value={local.chatContextWindow} onChange={e=>set('chatContextWindow',Number(e.target.value))} style={{...inputStyle,width:100}} />
            </label>
          </Section>
          <Section title="Live Suggestion Prompt">
            <textarea value={local.suggestionPrompt} onChange={e=>set('suggestionPrompt',e.target.value)} style={{...textareaStyle,minHeight:180}} />
            <button onClick={()=>set('suggestionPrompt',DEFAULT_SETTINGS.suggestionPrompt)} style={resetBtn}>Reset to default</button>
          </Section>
          <Section title="Chat Prompt">
            <textarea value={local.chatPrompt} onChange={e=>set('chatPrompt',e.target.value)} style={{...textareaStyle,minHeight:120}} />
            <button onClick={()=>set('chatPrompt',DEFAULT_SETTINGS.chatPrompt)} style={resetBtn}>Reset to default</button>
          </Section>
        </div>
        <div style={footer}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={()=>{onSave(local);onClose()}} style={saveBtn}>Save Settings</button>
        </div>
      </div>
    </div>
  )
}
function Section({ title, children }) {
  return <div style={{marginBottom:24}}><div style={{fontSize:11,fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>{title}</div>{children}</div>
}
const overlay={position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,backdropFilter:'blur(4px)'}
const panel={background:'var(--bg-panel)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',width:'560px',maxWidth:'95vw',maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 24px 80px rgba(0,0,0,0.5)'}
const header={display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',borderBottom:'1px solid var(--border)'}
const body={padding:'20px',overflowY:'auto',flex:1}
const footer={padding:'14px 20px',borderTop:'1px solid var(--border)',display:'flex',gap:10,justifyContent:'flex-end'}
const closeBtn={background:'transparent',color:'var(--text-secondary)',padding:4,borderRadius:6,display:'flex'}
const inputStyle={background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 12px',color:'var(--text-primary)',fontSize:13,width:'100%',outline:'none',fontFamily:'var(--font-mono)'}
const iconBtn={background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 10px',color:'var(--text-secondary)',display:'flex',flexShrink:0}
const textareaStyle={...inputStyle,resize:'vertical',fontFamily:'var(--font-mono)',fontSize:12,lineHeight:1.6,width:'100%'}
const labelStyle={display:'flex',flexDirection:'column',gap:6,color:'var(--text-secondary)',fontSize:13}
const resetBtn={marginTop:8,background:'transparent',color:'var(--text-muted)',fontSize:11,padding:'4px 0',textDecoration:'underline',textUnderlineOffset:2}
const cancelBtn={background:'var(--bg-card)',border:'1px solid var(--border)',color:'var(--text-secondary)',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:500}
const saveBtn={background:'var(--accent)',color:'#fff',borderRadius:8,padding:'8px 20px',fontSize:13,fontWeight:600}