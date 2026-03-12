import { getOllamaConfig } from './settings.js';

// Use fetch through proxy to avoid CORS issues
const ollamaFetch = async (endpoint, options = {}) => {
  const config = getOllamaConfig();
  if (!config.host) {
    throw new Error('Ollama host not configured');
  }
  
  const targetUrl = `${config.host}${endpoint}`;
  const proxyUrl = `/api/proxy/${encodeURIComponent(targetUrl)}`;
  
  const response = await fetch(proxyUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return response.json();
};

export const checkOllamaConnection = async () => {
  try {
    await ollamaFetch('/api/tags');
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
    const data = await ollamaFetch('/api/tags');
    return data.models || [];
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return [];
  }
};
