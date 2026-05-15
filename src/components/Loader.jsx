const Loader = ({ title, message }) => {
  return (
    <div className="loader-card">
      <div className="spinner" />
      <div className="loader-copy">
        <strong>{title || 'Loading...'}</strong>
        <span>{message || 'Please wait...'}</span>
      </div>
    </div>
  );
};

export default Loader;
