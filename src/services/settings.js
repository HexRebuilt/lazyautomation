// Settings helper - all config is stored in localStorage (user configured)
// No server-side config fetching to avoid exposing secrets

export const getSettings = () => {
  const defaultSettings = {
    hassHost: '',
    hassToken: '',
    ollamaHost: 'http://localhost:11434',
    llmApiUrl: '',
    llmApiKey: '',
    useLocalApi: true,
  };
  
  try {
    const saved = localStorage.getItem('lazyautomation_settings');
    const localSettings = saved ? JSON.parse(saved) : {};
    return { ...defaultSettings, ...localSettings };
  } catch {
    return defaultSettings;
  }
};

// Get Home Assistant configuration
export const getHassConfig = () => {
  const settings = getSettings();
  return {
    host: settings.hassHost || '',
    token: settings.hassToken || '',
  };
};

// Get Ollama configuration
export const getOllamaConfig = () => {
  const settings = getSettings();
  return {
    host: settings.ollamaHost || 'http://localhost:11434',
  };
};

// Get LLM configuration
export const getLLMConfig = () => {
  const settings = getSettings();
  return {
    apiUrl: settings.llmApiUrl,
    apiKey: settings.llmApiKey,
    useLocalApi: settings.useLocalApi,
  };
};

// Fetch placeholder - kept for API compatibility but does nothing
export const fetchServerConfig = async () => {
  // No-op - config must be set manually in Settings
  console.log('Config must be set manually in Settings page');
  return null;
};
