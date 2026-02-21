function ErrorAlert({ message }) {
  return (
    <div className="dashboard-error" role="alert" aria-live="polite">
      <span className="dashboard-error-icon" aria-hidden="true">
        !
      </span>
      <div>
        <p className="dashboard-error-title">Something went wrong</p>
        <p className="dashboard-error-message">{message}</p>
      </div>
    </div>
  );
}

export default ErrorAlert;
