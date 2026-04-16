# TwinMind Live Suggestions

An always-on AI meeting copilot that listens to live audio and continuously surfaces 3 context-aware suggestions while a conversation is happening.

## Stack
- **Frontend**: React 18 + Vite
- **Transcription**: Groq Whisper Large V3
- **Suggestions + Chat**: Groq meta-llama/llama-4-maverick-17b-128e-instruct (GPT-OSS 120B)
- **Deployment**: Vercel

## Setup
```bash
git clone https://github.com/starboy999-sys/twinmind-live-suggestions
cd twinmind-live-suggestions
npm install
npm run dev
```
Open http://localhost:5173, click Settings, paste your Groq API key from console.groq.com.

## Prompt Strategy

### 5 suggestion types triggered by context
| Type | When surfaced |
|------|--------------|
| ANSWER | A direct question was just asked |
| QUESTION | A topic opened with unexplored depth |
| FACT_CHECK | A specific claim or stat was stated |
| TALKING_POINT | A theme or decision point is emerging |
| CLARIFY | Jargon or ambiguity appeared |

ANSWER is always prioritized first if a question was just asked — this is highest value in meetings.

### Context windows
- Suggestions: 600 chars of recent transcript (reactive to what just happened)
- Chat: 3000 chars of full transcript (holistic for specific questions)

### Why it works
- JSON schema enforcement via response_format for zero parsing failures
- Preview text must deliver standalone value — forces specificity
- detail_prompt field generates targeted questions for richer chat answers
- Temperature 0.4 for suggestions (grounded), 0.5 for chat (flexible)

## Architecture
```
src/
  lib/groq.js              # All API calls + prompt config
  lib/export.js            # Session export to JSON
  hooks/useAudioRecorder.js # MediaRecorder with 30s chunks
  components/
    TranscriptPanel.jsx
    SuggestionsPanel.jsx
    ChatPanel.jsx
    SettingsPanel.jsx
  App.jsx                  # Orchestration + state
  index.css                # Design system
```