import AssistantChat from './AssistantChat.jsx';

export default function AssistantPanel({ onClose }) {
  return (
    <div className="assistant-panel" role="dialog" aria-label="Assistant">
      <div className="assistant-panel-header">
        <h2 className="assistant-panel-title">IEP Assistant</h2>
        <button type="button" className="assistant-panel-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <p className="assistant-panel-disclaimer">AI draft — requires educator review. Do not auto-save to IEP.</p>
      <AssistantChat onClose={onClose} />
    </div>
  );
}
