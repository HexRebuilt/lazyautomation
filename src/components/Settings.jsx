import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';

const Settings = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState({ hass: false, ollama: false, llm: false });
  const [testResults, setTestResults] = useState({ hass: null, ollama: null, llm: null });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      resetSettings();
    }
  };

  const testConnection = async (type) => {
    setTesting(prev => ({ ...prev, [type]: true }));
    setTestResults(prev => ({ ...prev, [type]: null }));

    try {
      let result = { success: false, message: '' };
      let targetUrl = '';
      
      if (type === 'hass') {
        if (!settings.hassHost) {
          result = { success: false, message: 'Home Assistant URL not configured' };
        } else {
          targetUrl = `${settings.hassHost}/api/`;
          // Use proxy to avoid CORS
          const proxyUrl = `/api/proxy/${encodeURIComponent(targetUrl)}`;
          const response = await fetch(proxyUrl, {
            headers: settings.hassToken ? { 'Authorization': `Bearer ${settings.hassToken}` } : {}
          });
          if (response.ok) {
            result = { success: true, message: 'Connected successfully!' };
          } else {
            result = { success: false, message: `Connection failed (HTTP ${response.status})` };
          }
        }
      } else if (type === 'ollama') {
        if (!settings.ollamaHost) {
          result = { success: false, message: 'Ollama host not configured' };
        } else {
          targetUrl = `${settings.ollamaHost}/api/tags`;
          const proxyUrl = `/api/proxy/${encodeURIComponent(targetUrl)}`;
          const response = await fetch(proxyUrl);
          if (response.ok) {
            result = { success: true, message: 'Connected successfully!' };
          } else {
            result = { success: false, message: `Connection failed (HTTP ${response.status})` };
          }
        }
      } else if (type === 'llm') {
        if (!settings.llmApiUrl) {
          result = { success: false, message: 'LLM API URL not configured' };
        } else {
          targetUrl = `${settings.llmApiUrl}/models`;
          const proxyUrl = `/api/proxy/${encodeURIComponent(targetUrl)}`;
          const response = await fetch(proxyUrl);
          if (response.ok) {
            result = { success: true, message: 'Connected successfully!' };
          } else {
            result = { success: false, message: `Connection failed (HTTP ${response.status})` };
          }
        }
      }
      
      setTestResults(prev => ({ ...prev, [type]: result }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [type]: { success: false, message: error.message } 
      }));
    } finally {
      setTesting(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1>Settings</h1>
        <p className="settings-description">
          Configure your Home Assistant connection and AI settings. These settings are stored locally in your browser.
        </p>

        <form onSubmit={handleSave} className="settings-form">
          {/* Home Assistant Section */}
          <section className="settings-section">
            <h2>Home Assistant</h2>
            
            <div className="form-group">
              <label htmlFor="hassHost">Home Assistant URL</label>
              <input
                type="url"
                id="hassHost"
                value={settings.hassHost}
                onChange={(e) => updateSettings({ hassHost: e.target.value })}
                placeholder="https://homeassistant.local:8123"
              />
              <span className="form-hint">Use <code>http://host.docker.internal:8123</code> if running on same machine</span>
            </div>

            <div className="form-group">
              <label htmlFor="hassToken">Long-Lived Access Token</label>
              <input
                type="password"
                id="hassToken"
                value={settings.hassToken}
                onChange={(e) => updateSettings({ hassToken: e.target.value })}
                placeholder="Enter your Home Assistant token"
              />
              <span className="form-hint">Create a token in Home Assistant: Profile &gt; Long-Lived Access Tokens</span>
            </div>

            <button
              type="button"
              className="test-button"
              onClick={() => testConnection('hass')}
              disabled={testing.hass || !settings.hassHost}
            >
              {testing.hass ? 'Testing...' : 'Test Connection'}
            </button>
            {testResults.hass && (
              <span className={`test-result ${testResults.hass.success ? 'success' : 'error'}`}>
                {testResults.hass.message}
              </span>
            )}
          </section>

          {/* Ollama Section */}
          <section className="settings-section">
            <h2>Ollama (Local AI)</h2>
            
            <div className="form-group">
              <label htmlFor="ollamaHost">Ollama Host</label>
              <input
                type="url"
                id="ollamaHost"
                value={settings.ollamaHost}
                onChange={(e) => updateSettings({ ollamaHost: e.target.value })}
                placeholder="http://localhost:11434"
              />
              <span className="form-hint">Use <code>http://host.docker.internal:11434</code> if running on same machine</span>
            </div>

            <button
              type="button"
              className="test-button"
              onClick={() => testConnection('ollama')}
              disabled={testing.ollama}
            >
              {testing.ollama ? 'Testing...' : 'Test Connection'}
            </button>
            {testResults.ollama && (
              <span className={`test-result ${testResults.ollama.success ? 'success' : 'error'}`}>
                {testResults.ollama.message}
              </span>
            )}
          </section>

          {/* LLM API Section */}
          <section className="settings-section">
            <h2>LLM API (External / LMStudio)</h2>
            
            <div className="form-group">
              <label htmlFor="llmApiUrl">API URL</label>
              <input
                type="url"
                id="llmApiUrl"
                value={settings.llmApiUrl}
                onChange={(e) => updateSettings({ llmApiUrl: e.target.value })}
                placeholder="http://localhost:1234/v1"
              />
              <span className="form-hint">
                For LMStudio: Use your host IP (e.g., <code>http://192.168.1.x:1234/v1</code>)<br/>
                Or OpenAI-compatible API URL
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="llmApiKey">API Key</label>
              <input
                type="password"
                id="llmApiKey"
                value={settings.llmApiKey}
                onChange={(e) => updateSettings({ llmApiKey: e.target.value })}
                placeholder="Enter your API key (optional)"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.useLocalApi}
                  onChange={(e) => updateSettings({ useLocalApi: e.target.checked })}
                />
                Prefer local AI (Ollama) over external API
              </label>
            </div>

            <button
              type="button"
              className="test-button"
              onClick={() => testConnection('llm')}
              disabled={testing.llm}
            >
              {testing.llm ? 'Testing...' : 'Test Connection'}
            </button>
            {testResults.llm && (
              <span className={`test-result ${testResults.llm.success ? 'success' : 'error'}`}>
                {testResults.llm.message}
              </span>
            )}
          </section>

          {/* Actions */}
          <div className="form-actions">
            <button type="submit" className="save-button">
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
            <button type="button" className="reset-button" onClick={handleReset}>
              Reset to Defaults
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
