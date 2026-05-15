import { useEffect, useRef, useState } from 'react';

const Recorder = ({ onAudioReady, mode, language, onModeChange, onLanguageChange, disabled }) => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const recorderRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const updateTimer = () => {
    setRecordingTime((value) => value + 1);
  };

  const startRecording = async () => {
    setError('');
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setError('Audio recording is not supported by this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        if (onAudioReady) {
          onAudioReady(new File([blob], 'consultation.webm', { type: 'audio/webm' }));
        }
      };

      recorder.start();
      recorderRef.current = recorder;
      setStatus('recording');
      setRecordingTime(0);
      timerRef.current = setInterval(updateTimer, 1000);
    } catch (err) {
      setError('Unable to access microphone. Please enable audio permissions.');
    }
  };

  const pauseRecording = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.pause();
      setStatus('paused');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (recorderRef.current && recorderRef.current.state === 'paused') {
      recorderRef.current.resume();
      setStatus('recording');
      timerRef.current = setInterval(updateTimer, 1000);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
      recorderRef.current.stream.getTracks().forEach((track) => track.stop());
      recorderRef.current = null;
    }
    setStatus('stopped');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleFileUpload = (event) => {
    setError('');
    const file = event.target.files[0];
    if (file) {
      if (onAudioReady) onAudioReady(file);
      setStatus('uploaded');
    }
    event.target.value = '';
  };

  return (
    <div className="recorder-card">
      <div className="card-header">
        <h2>Record Consultation</h2>
        <p>Capture audio from the doctor-patient conversation and upload it for AI processing.</p>
      </div>

      <div className="control-row">
        <button className="button primary" type="button" onClick={startRecording} disabled={status === 'recording' || disabled}>
          Start Recording
        </button>
        <button
          className="button secondary"
          type="button"
          onClick={status === 'paused' ? resumeRecording : pauseRecording}
          disabled={(status !== 'recording' && status !== 'paused') || disabled}
        >
          {status === 'paused' ? 'Resume' : 'Pause'}
        </button>
        <button className="button danger" type="button" onClick={stopRecording} disabled={status === 'idle' || disabled}>
          Stop
        </button>
      </div>

      <div className="file-row">
        <label className={`upload-surface ${disabled ? 'upload-disabled' : ''}`}>
          <span className="upload-title">Upload audio file</span>
          <span className="upload-subtitle">Drop an audio clip or click to browse</span>
          <input type="file" accept="audio/*" onChange={handleFileUpload} disabled={disabled} />
        </label>
      </div>

      <div className="file-row">
        <label className="input-group">
          Mode
          <select className="input-control" value={mode} onChange={(event) => onModeChange?.(event.target.value)}>
            <option value="transcribe">Transcribe (same language)</option>
            <option value="translate">Translate to English</option>
          </select>
        </label>

        <label className="input-group">
          Language code
          <input
            className="input-control"
            type="text"
            maxLength={8}
            placeholder="auto or ta/en/hi..."
            value={language}
            onChange={(event) => onLanguageChange?.(event.target.value)}
          />
        </label>
      </div>

      <div className="status-block">
        <span>Status:</span>
        <strong>{status === 'idle' ? 'Ready' : status.charAt(0).toUpperCase() + status.slice(1)}</strong>
        <span>{recordingTime > 0 ? `- ${recordingTime}s` : ''}</span>
      </div>

      {error && <div className="alert small">{error}</div>}
    </div>
  );
};

export default Recorder;
