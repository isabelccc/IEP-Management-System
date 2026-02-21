function AssistantOrb() {
  return (
    <button
      type="button"
      className="assistant-orb"
      aria-label="Open assistant"
      title="Assistant"
      onClick={() => window.alert('Assistant is coming soon.')}
    >
      <span className="assistant-orb-core" />
    </button>
  );
}

export default AssistantOrb;
