export const MODELS = {
  transcription: 'whisper-large-v3',
  suggestions: 'meta-llama/llama-4-maverick-17b-128e-instruct',
  chat: 'meta-llama/llama-4-maverick-17b-128e-instruct',
}
export const DEFAULT_SETTINGS = {
  suggestionContextWindow: 600,
  chatContextWindow: 3000,
  suggestionPrompt: `You are an AI meeting copilot. Analyze the recent conversation transcript and generate exactly 3 highly useful, context-aware suggestions.

SUGGESTION TYPES:
- QUESTION: A follow-up question the user could ask right now
- ANSWER: A direct answer to a question that was just asked in the transcript
- FACT_CHECK: Flag a claim that may be inaccurate or needs verification
- TALKING_POINT: A relevant insight or angle to bring up
- CLARIFY: Clarify a term, concept, or ambiguous statement

RULES:
- Surface ANSWER type first if a direct question was just asked
- Mix types based on context
- Each suggestion must be immediately useful even before clicking
- Preview text must deliver standalone value
- Be specific to the actual content

Respond ONLY with valid JSON:
{"suggestions":[{"type":"ANSWER|QUESTION|FACT_CHECK|TALKING_POINT|CLARIFY","preview":"One clear useful sentence","detail_prompt":"A specific question for deep value"}]}`,
  chatPrompt: `You are a knowledgeable meeting assistant with access to the full conversation transcript.
When answering questions:
- Be direct and specific, reference actual transcript content when relevant
- Provide actionable well-structured answers
- Keep answers thorough but scannable
- If about something said in the meeting, quote or reference it directly
- Tone: confident, intelligent, concise`,
}
export async function transcribeAudio(audioBlob, apiKey) {
  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')
  formData.append('model', MODELS.transcription)
  formData.append('response_format', 'json')
  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: formData,
  })
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err?.error?.message || `Transcription failed: ${res.status}`) }
  const data = await res.json()
  return data.text?.trim() || ''
}
export async function generateSuggestions(recentTranscript, fullTranscript, apiKey, settings = {}) {
  const prompt = settings.suggestionPrompt || DEFAULT_SETTINGS.suggestionPrompt
  const contextWindow = settings.suggestionContextWindow || DEFAULT_SETTINGS.suggestionContextWindow
  const context = recentTranscript.slice(-contextWindow)
  if (!context.trim()) return []
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODELS.suggestions, max_tokens: 800, temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Recent transcript (last ~${contextWindow} chars):\n\n${context}\n\nGenerate 3 suggestions now.` }
      ]
    })
  })
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err?.error?.message || `Suggestions failed: ${res.status}`) }
  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content || '{}'
  const parsed = JSON.parse(raw)
  return parsed.suggestions || []
}
export async function generateChatAnswer(userMessage, fullTranscript, chatHistory, apiKey, settings = {}) {
  const prompt = settings.chatPrompt || DEFAULT_SETTINGS.chatPrompt
  const contextWindow = settings.chatContextWindow || DEFAULT_SETTINGS.chatContextWindow
  const transcriptContext = fullTranscript.slice(-contextWindow)
  const messages = [
    { role: 'system', content: `${prompt}\n\nFull conversation transcript so far:\n"""\n${transcriptContext || '(no transcript yet)'}\n"""` },
    ...chatHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage }
  ]
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODELS.chat, max_tokens: 1200, temperature: 0.5, stream: true, messages })
  })
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err?.error?.message || `Chat failed: ${res.status}`) }
  return res.body
}
export async function* streamResponse(body) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') return
      try { const json = JSON.parse(data); const delta = json.choices?.[0]?.delta?.content; if (delta) yield delta } catch {}
    }
  }
}