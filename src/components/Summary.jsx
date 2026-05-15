const parseSummary = (text) => {
  const output = {
    chiefComplaint: '',
    clinicalNotes: '',
    recommendation: '',
  };

  if (!text) return output;

  const normalized = text.replace(/\r/g, '').trim();
  const lines = normalized.split('\n').map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith('chief complaint')) {
      output.chiefComplaint = line.replace(/chief complaint\s*[:\-]?\s*/i, '');
    } else if (lower.startsWith('clinical notes')) {
      output.clinicalNotes = line.replace(/clinical notes\s*[:\-]?\s*/i, '');
    } else if (lower.startsWith('recommendation') || lower.startsWith('plan')) {
      output.recommendation = line.replace(/(recommendation|plan)\s*[:\-]?\s*/i, '');
    }
  }

  if (!output.chiefComplaint && !output.clinicalNotes && !output.recommendation) {
    output.clinicalNotes = normalized;
  }

  return output;
};

const Summary = ({ text }) => {
  const parsed = parseSummary(text);
  return (
    <div className="output-card">
      <div className="card-heading">
        <h2>Medical Summary</h2>
        <p>Brief findings and recommended notes for doctor review.</p>
      </div>
      <div className="output-body">
        {text ? (
          <div className="summary-sections">
            <p><strong>Chief Complaint:</strong> {parsed.chiefComplaint || 'Not specified.'}</p>
            <p><strong>Clinical Notes:</strong> {parsed.clinicalNotes || 'Not specified.'}</p>
            <p><strong>Recommendation:</strong> {parsed.recommendation || 'Not specified.'}</p>
          </div>
        ) : (
          <p className="placeholder">Summary will appear after transcription.</p>
        )}
      </div>
    </div>
  );
};

export default Summary;
