import { useState, useEffect, createContext, useContext } from 'react';

const SettingsContext = createContext(null);

const defaultSettings = {
  hassHost: import.meta.env.VITE_HASS_HOST || '',
  hassToken: import.meta.env.VITE_HASS_TOKEN || '',
  ollamaHost: 'http://localhost:11434',
  llmApiUrl: import.meta.env.VITE_LLM_API_URL || '',
  llmApiKey: import.meta.env.VITE_LLM_API_KEY || '',
  useLocalApi: import.meta.env.VITE_USE_LOCAL_API === 'true' || false,
};

export const SettingsProvider = ({ children }) => {
  // Initialize from localStorage (which may have server config)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('lazyautomation_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If we have server config values, use them as defaults
        return { ...defaultSettings, ...parsed };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Sync to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('lazyautomation_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;
