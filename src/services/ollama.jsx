import { getOllamaConfig } from './settings.js';

// Use fetch through proxy to avoid CORS issues
const ollamaFetch = async (endpoint, options = {}) => {
  const config = getOllamaConfig();
  if (!config.host) {
    throw new Error('Ollama host not configured');
  }
  
  // Determine if this is LMStudio/OAI-compatible endpoint
  const isOAICompatible = config.host.includes('/v1') || config.host.includes('lmstudio');
  
  // Use appropriate endpoint based on server type
  let apiEndpoint = endpoint;
  if (isOAICompatible && endpoint === '/api/tags') {
    apiEndpoint = '/v1/models';  // LMStudio uses /v1/models not /api/tags
  }
  
  const targetUrl = `${config.host}${apiEndpoint}`;
  const proxyUrl = `/api/proxy/${encodeURIComponent(targetUrl)}`;
  console.log('[Ollama/LMStudio] Fetching:', proxyUrl);
  
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
    // Try both Ollama and LMStudio endpoints
    const config = getOllamaConfig();
    if (!config.host) {
      return { connected: false, error: 'Ollama host not configured' };
    }
    
    const isOAICompatible = config.host.includes('/v1') || config.host.includes('lmstudio');
    const endpoint = isOAICompatible ? '/v1/models' : '/api/tags';
    
    await ollamaFetch(endpoint);
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
    const config = getOllamaConfig();
    const isOAICompatible = config.host.includes('/v1') || config.host.includes('lmstudio');
    const endpoint = isOAICompatible ? '/v1/models' : '/api/tags';
    
    const data = await ollamaFetch(endpoint);
    
    // Handle both Ollama and LMStudio response formats
    if (isOAICompatible) {
      return data.data || [];
    }
    return data.models || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};
