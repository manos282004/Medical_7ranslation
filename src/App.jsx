import { useEffect, useState } from 'react';
import Recorder from './components/Recorder';
import Transcript from './components/Transcript';
import Summary from './components/Summary';
import Loader from './components/Loader';
import { uploadAudioFile } from './services/api';

function App() {
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('idle');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('transcribe');
  const [language, setLanguage] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!isLoading) return undefined;
    setLoadingStep('transcribing');
    const timeout = setTimeout(() => {
      setLoadingStep((current) => (current === 'transcribing' ? 'summarizing' : current));
    }, 2200);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  const handleAudioUpload = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith('audio/')) {
      const message = 'Invalid audio file. Please upload a supported audio format.';
      setError(message);
      setToast({ type: 'error', message });
      return;
    }

    setIsLoading(true);
    setError('');
    setLoadingStep('transcribing');
    setTranscript('');
    setSummary('');

    try {
      const response = await uploadAudioFile(file, { mode, language: language.trim() });
      setTranscript(response.translated_transcript || response.original_transcript || 'No transcript returned.');
      setSummary(response.summary || 'No summary returned.');
      setToast({ type: 'success', message: 'Transcription completed successfully.' });
    } catch (uploadError) {
      const detail = uploadError.response?.data?.detail || uploadError.message || 'Failed to upload and process audio.';
      setError(detail);
      setToast({ type: 'error', message: `API failed: ${detail}` });
    } finally {
      setIsLoading(false);
      setLoadingStep('idle');
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Medical Assistant</p>
          <h1>Doctor&apos;s Voice Notes</h1>
          <p className="subtitle">Record consultations, transcribe speech, and generate a concise medical summary.</p>
        </div>
      </header>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <main className="dashboard-grid">
        <section className="panel panel-main">
          <Recorder
            onAudioReady={handleAudioUpload}
            mode={mode}
            language={language}
            onModeChange={setMode}
            onLanguageChange={setLanguage}
            disabled={isLoading}
          />
          {isLoading && (
            <Loader
              title={loadingStep === 'summarizing' ? 'Generating summary...' : 'Transcribing audio...'}
              message="Please wait while we process your consultation."
            />
          )}
          {error && <div className="alert">{error}</div>}
        </section>

        <section className="panel panel-output">
          <Transcript text={transcript} />
          <Summary text={summary} />
        </section>
      </main>

      <footer className="app-footer">Powered by OpenAI APIs</footer>
    </div>
  );
}

export default App;
