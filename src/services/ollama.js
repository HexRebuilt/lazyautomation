import axios from 'axios';

const OLLAMA_HOST = process.env.REACT_APP_OLLAMA_HOST || 'http://localhost:11434';

const ollamaApi = axios.create({
  baseURL: OLLAMA_HOST,
  timeout: 5000
});

export const checkOllamaConnection = async () => {
  try {
    await ollamaApi.get('/api/tags');
    return { connected: true, error: null };
  } catch (error) {
    return { 
      connected: false, 
      error: error.message || 'Connection failed' 
    };
  }
};

export const getOllamaModels = async () => {
  try {
    const response = await ollamaApi.get('/api/tags');
    return response.data.models || [];
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return [];
  }
};

export default ollamaApi;
