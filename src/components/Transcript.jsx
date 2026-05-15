const formatTranscript = (text) => {
  if (!text) return [];
  const chunks = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return chunks.map((line, index) => ({
    speaker: index % 2 === 0 ? 'Doctor' : 'Patient',
    text: line,
  }));
};

const Transcript = ({ text }) => {
  const rows = formatTranscript(text);
  return (
    <div className="output-card">
      <div className="card-heading">
        <h2>Transcript</h2>
        <p>Complete speech-to-text transcript of the consultation.</p>
      </div>
      <div className="output-body">
        {rows.length > 0 ? (
          <div className="transcript-lines">
            {rows.map((row, index) => (
              <p key={`${row.speaker}-${index}`}>
                <strong>{row.speaker}:</strong> {row.text}
              </p>
            ))}
          </div>
        ) : (
          <p className="placeholder">Awaiting transcript output...</p>
        )}
      </div>
    </div>
  );
};

export default Transcript;
