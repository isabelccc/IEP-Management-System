function LoadingState({ message }) {
  return (
    <div className="dashboard-loading" role="status" aria-live="polite">
      <span className="dashboard-spinner" aria-hidden="true" />
      <p className="dashboard-loading-text">{message || 'Loading...'}</p>
    </div>
  );
}

export default LoadingState;