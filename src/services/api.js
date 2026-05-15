import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 300000,
});

export async function uploadAudioFile(file, options = {}) {
  const formData = new FormData();
  formData.append('audio_file', file);
  if (options.language) formData.append('language', options.language);
  formData.append('mode', options.mode || 'transcribe');

  const response = await apiClient.post('/transcribe', formData);
  return response.data;
}
