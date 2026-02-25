import { useState } from 'react';
import { sendChatMessage } from '../../services/assistant.service.js';

export default function AssistantChat({ onClose }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSend(e) {
    e.preventDefault();
    const text = message.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setMessage('');
    setLoading(true);
    setError('');

    try {
      const res = await sendChatMessage(text);
      const reply = res?.data?.reply ?? 'No reply.';
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to send';
      setError(msg);
      setMessages((prev) => [...prev, { role: 'assistant', text: `Error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="assistant-chat">
      <div className="assistant-chat-messages">
        {messages.length === 0 ? (
          <p className="assistant-chat-placeholder">Send a message to the assistant. Replies are stub for now.</p>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`assistant-chat-bubble assistant-chat-bubble--${m.role}`}>
              {m.text}
            </div>
          ))
        )}
      </div>
      <form className="assistant-chat-form" onSubmit={handleSend}>
        {error ? <p className="assistant-chat-error">{error}</p> : null}
        <input
          type="text"
          className="assistant-chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button type="submit" className="assistant-chat-send" disabled={loading || !message.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
