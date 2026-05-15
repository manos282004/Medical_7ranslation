const formatTranscript = (text) =>
  (text || '')
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

const Transcript = ({ text }) => {
  const rows = formatTranscript(text);
  return (
    <div className="output-card">
      <div className="card-heading">
        <h2>Patient Transcript</h2>
        <p>Patient-focused speech content extracted from the consultation.</p>
      </div>
      <div className="output-body">
        {rows.length > 0 ? (
          <div className="transcript-lines">
            {rows.map((line, index) => (
              <p key={`patient-line-${index}`}>
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="placeholder">Awaiting patient transcript output...</p>
        )}
      </div>
    </div>
  );
};

export default Transcript;
