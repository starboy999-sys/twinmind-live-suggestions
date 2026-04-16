import React, { useEffect, useRef, useState } from 'react'
import { Send, MessageSquare, Bot, User } from 'lucide-react'
export default function ChatPanel({ messages, isStreaming, onSend }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isStreaming])
  const handleSend = () => { const t = input.trim(); if (!t || isStreaming) return; onSend(t); setInput('') }
  const handleKey = (e) => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }
  return (
    <div style={container}>
      <div style={panelHeader}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <MessageSquare size={13} style={{color:'var(--accent)'}} />
          <span style={title}>Chat</span>
        </div>
        {messages.length>0 && <span style={{fontSize:11,color:'var(--text-muted)'}}>{messages.filter(m=>m.role==='assistant').length} answers</span>}
      </div>
      <div style={messagesArea}>
        {messages.length===0 && (
          <div style={emptyState}>
            <Bot size={28} style={{color:'var(--text-muted)',marginBottom:12}} />
            <p style={{color:'var(--text-muted)',fontSize:13,textAlign:'center',lineHeight:1.7,maxWidth:200}}>Click a suggestion or type a question about the conversation</p>
          </div>
        )}
        {messages.map((msg,i) => <MessageBubble key={i} message={msg} />)}
        {isStreaming && messages[messages.length-1]?.role!=='assistant' && (
          <div style={thinkingBubble}>
            <div style={{display:'flex',gap:5,alignItems:'center'}}>
              {[0,1,2].map(i => <span key={i} style={{...dot,animationDelay:`${i*0.15}s`}} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <style>{`@keyframes dotBounce{0%,100%{transform:translateY(0);opacity:0.4}50%{transform:translateY(-4px);opacity:1}}`}</style>
      <div style={inputArea}>
        <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey} placeholder="Ask about the conversation..." style={inputStyle} rows={1} disabled={isStreaming} />
        <button onClick={handleSend} disabled={!input.trim()||isStreaming} style={{...sendBtn,opacity:(!input.trim()||isStreaming)?0.4:1}}>
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}
function MessageBubble({ message }) {
  const isUser = message.role==='user'
  return (
    <div style={{...bubble,...(isUser?userBubble:assistantBubble)}} className="fade-in-up">
      <div style={bubbleHeader}>
        {isUser ? <User size={11}/> : <Bot size={11}/>}
        <span>{isUser?'You':'Assistant'}</span>
        <span style={{color:'var(--text-muted)',marginLeft:'auto',fontSize:10}}>{message.timestamp ? new Date(message.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''}</span>
      </div>
      <p style={bubbleText}>{message.content}</p>
    </div>
  )
}
const container={display:'flex',flexDirection:'column',height:'100%',background:'var(--bg-panel)'}
const panelHeader={display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',borderBottom:'1px solid var(--border)',flexShrink:0}
const title={fontWeight:600,fontSize:13,color:'var(--text-primary)'}
const messagesArea={flex:1,overflowY:'auto',padding:'14px',display:'flex',flexDirection:'column',gap:12}
const emptyState={display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 20px'}
const bubble={borderRadius:'var(--radius)',padding:'10px 12px',display:'flex',flexDirection:'column',gap:6,maxWidth:'100%'}
const userBubble={background:'var(--accent-glow)',border:'1px solid rgba(124,106,247,0.2)',alignSelf:'flex-end'}
const assistantBubble={background:'var(--bg-card)',border:'1px solid var(--border)',alignSelf:'flex-start'}
const bubbleHeader={display:'flex',alignItems:'center',gap:5,fontSize:11,color:'var(--text-muted)',fontWeight:500}
const bubbleText={fontSize:13,lineHeight:1.65,color:'var(--text-primary)',whiteSpace:'pre-wrap',wordBreak:'break-word'}
const inputArea={display:'flex',gap:8,padding:'12px 14px',borderTop:'1px solid var(--border)',flexShrink:0,alignItems:'flex-end'}
const inputStyle={flex:1,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,padding:'10px 12px',color:'var(--text-primary)',fontSize:13,resize:'none',outline:'none',lineHeight:1.5,fontFamily:'var(--font-ui)'}
const sendBtn={background:'var(--accent)',color:'#fff',borderRadius:10,padding:'10px 12px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}
const thinkingBubble={background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'14px 16px',alignSelf:'flex-start'}
const dot={width:6,height:6,borderRadius:'50%',background:'var(--text-muted)',display:'inline-block',animation:'dotBounce 0.9s ease-in-out infinite'}