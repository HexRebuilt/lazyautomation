import { getLLMConfig, getOllamaConfig } from './settings.js';

// Use fetch through proxy to avoid CORS issues
const llmFetch = async (endpoint, options = {}) => {
  const config = getLLMConfig();
  
  let baseUrl = config.apiUrl;
  let headers = {};
  
  // Fall back to Ollama if no external API
  if (!baseUrl || config.useLocalApi) {
    const ollamaConfig = getOllamaConfig();
    baseUrl = ollamaConfig.host;
  }
  
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }
  
  const targetUrl = `${baseUrl}${endpoint}`;
  const proxyUrl = `/api/proxy/${encodeURIComponent(targetUrl)}`;
  
  const response = await fetch(proxyUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return response.json();
};

export const llmService = {
  // Send a query to the LLM API
  async sendQuery(query, parameters = {}) {
    try {
      const config = getLLMConfig();
      
      if (!config.apiUrl && config.useLocalApi) {
        // Use Ollama
        const ollamaConfig = getOllamaConfig();
        const response = await fetch(`/api/proxy/${encodeURIComponent(`${ollamaConfig.host}/api/generate`)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: query, ...parameters })
        });
        const data = await response.json();
        return data.response;
      }

      if (!config.apiUrl) {
        throw new Error('LLM API URL not configured');
      }

      const response = await fetch(`/api/proxy/${encodeURIComponent(`${config.apiUrl}/api/generate`)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {})
        },
        body: JSON.stringify({ prompt: query, ...parameters })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error sending query to LLM:', error.message);
      throw error;
    }
  },

  // Check if the LLM provider is compatible
  isProviderCompatible(providerName) {
    const supportedProviders = ['ollama', 'lmstudio', 'openai', 'anthropic'];
    return supportedProviders.includes(providerName.toLowerCase());
  },

  // Generate embeddings using the LLM API
  async generateEmbedding(text) {
    try {
      const config = getLLMConfig();
      
      if (!config.apiUrl) {
        const ollamaConfig = getOllamaConfig();
        const response = await fetch(`/api/proxy/${encodeURIComponent(`${ollamaConfig.host}/api/embeddings`)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        const data = await response.json();
        return data.embedding;
      }

      const response = await fetch(`/api/proxy/${encodeURIComponent(`${config.apiUrl}/api/embeddings`)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {})
        },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error.message);
      throw error;
    }
  },
};

// Export helper to get the base API URL
export const getLLMAPIBaseURL = () => {
  const config = getLLMConfig();
  if (config.apiUrl) {
    return config.apiUrl;
  }
  const ollamaConfig = getOllamaConfig();
  return ollamaConfig.host;
};
