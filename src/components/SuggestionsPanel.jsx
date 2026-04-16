import React from 'react'
import { RefreshCw, Sparkles, HelpCircle, CheckCircle2, Lightbulb, BookOpen, AlertTriangle } from 'lucide-react'
const TYPE_CONFIG = {
  ANSWER:{label:'Answer',icon:CheckCircle2,color:'var(--tag-answer-text)',bg:'var(--tag-answer)',border:'rgba(74,222,128,0.2)'},
  QUESTION:{label:'Follow-up',icon:HelpCircle,color:'var(--tag-question-text)',bg:'var(--tag-question)',border:'rgba(96,165,250,0.2)'},
  FACT_CHECK:{label:'Fact Check',icon:AlertTriangle,color:'var(--tag-fact-text)',bg:'var(--tag-fact)',border:'rgba(251,191,36,0.2)'},
  TALKING_POINT:{label:'Talking Point',icon:Lightbulb,color:'var(--tag-talking-text)',bg:'var(--tag-talking)',border:'rgba(124,106,247,0.2)'},
  CLARIFY:{label:'Clarify',icon:BookOpen,color:'var(--tag-clarify-text)',bg:'var(--tag-clarify)',border:'rgba(248,113,113,0.2)'},
}
function SuggestionCard({ suggestion, onClick, isNew }) {
  const cfg = TYPE_CONFIG[suggestion.type] || TYPE_CONFIG.TALKING_POINT
  const Icon = cfg.icon
  return (
    <button onClick={() => onClick(suggestion)} style={{...card,borderColor:cfg.border}} className={isNew?'fade-in-up':''}>
      <div style={cardTop}>
        <span style={{...typeBadge,color:cfg.color,background:cfg.bg}}><Icon size={10} />{cfg.label}</span>
      </div>
      <p style={previewText}>{suggestion.preview}</p>
      <span style={clickHint}>Click for details</span>
    </button>
  )
}
export default function SuggestionsPanel({ batches, isLoading, onRefresh, onSuggestionClick }) {
  return (
    <div style={container}>
      <div style={panelHeader}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <Sparkles size={13} style={{color:'var(--accent)'}} />
          <span style={title}>Live Suggestions</span>
        </div>
        <button onClick={onRefresh} style={{...refreshBtn,opacity:isLoading?0.5:1}} disabled={isLoading}>
          <RefreshCw size={12} style={{animation:isLoading?'spin 1s linear infinite':'none'}} />
          {isLoading?'Updating...':'Refresh'}
        </button>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div style={scrollArea}>
        {batches.length===0 && !isLoading && (
          <div style={emptyState}>
            <Sparkles size={26} style={{color:'var(--text-muted)',marginBottom:12}} />
            <p style={{color:'var(--text-muted)',fontSize:13,textAlign:'center',lineHeight:1.7,maxWidth:200}}>Suggestions will appear once transcript begins</p>
          </div>
        )}
        {isLoading && batches.length===0 && (
          <div style={{display:'flex',flexDirection:'column',gap:10,padding:'8px 0'}}>
            {[0,1,2].map(i=><div key={i} style={{height:80,borderRadius:'var(--radius)',background:'var(--bg-card)',animationDelay:`${i*0.1}s`}} />)}
          </div>
        )}
        {batches.map((batch,batchIdx) => (
          <div key={batch.id} style={batchGroup}>
            <div style={batchLabel}><span>{batchIdx===0?'Latest':new Date(batch.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span></div>
            {batch.suggestions.map((s,i) => <SuggestionCard key={i} suggestion={s} onClick={onSuggestionClick} isNew={batchIdx===0} />)}
          </div>
        ))}
      </div>
    </div>
  )
}
const container={display:'flex',flexDirection:'column',height:'100%',background:'var(--bg-base)',borderRight:'1px solid var(--border)'}
const panelHeader={display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',borderBottom:'1px solid var(--border)',flexShrink:0}
const title={fontWeight:600,fontSize:13,color:'var(--text-primary)'}
const refreshBtn={display:'flex',alignItems:'center',gap:5,background:'var(--bg-card)',border:'1px solid var(--border)',color:'var(--text-secondary)',borderRadius:8,padding:'6px 12px',fontSize:11,fontWeight:500,cursor:'pointer'}
const scrollArea={flex:1,overflowY:'auto',padding:'12px',display:'flex',flexDirection:'column',gap:4}
const emptyState={display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 20px'}
const batchGroup={display:'flex',flexDirection:'column',gap:8,marginBottom:16}
const batchLabel={fontSize:10,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase',padding:'4px 2px',display:'flex',alignItems:'center',gap:6}
const card={background:'var(--bg-card)',border:'1px solid',borderRadius:'var(--radius)',padding:'12px 14px',textAlign:'left',cursor:'pointer',width:'100%',display:'flex',flexDirection:'column',gap:6}
const cardTop={display:'flex',alignItems:'center',gap:8}
const typeBadge={display:'inline-flex',alignItems:'center',gap:4,fontSize:10,fontWeight:600,letterSpacing:'0.06em',padding:'3px 7px',borderRadius:20,textTransform:'uppercase'}
const previewText={fontSize:13,color:'var(--text-primary)',lineHeight:1.5}
const clickHint={fontSize:10,color:'var(--text-muted)'}