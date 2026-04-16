export function exportSession({ transcript, suggestionBatches, chatHistory }) {
  const timestamp = new Date().toISOString();
  const session = {
    exported_at: timestamp,
    transcript: { full_text: transcript, word_count: transcript.split(/\s+/).filter(Boolean).length },
    suggestion_batches: suggestionBatches.map((batch, i) => ({
      batch_number: i + 1, generated_at: batch.timestamp,
      suggestions: batch.suggestions.map((s) => ({ type: s.type, preview: s.preview, detail_prompt: s.detail_prompt }))
    })),
    chat_history: chatHistory.map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp }))
  };
  const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `twinmind-session-${Date.now()}.json`; a.click();
  URL.revokeObjectURL(url);
}