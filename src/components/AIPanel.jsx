import React, { useState } from 'react';
import { llmService } from '../services/llm.jsx';
import ModelSelector from './ModelSelector.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

const AIPanel = ({ room, sensors, appliances, automations, allSensors, allDevices }) => {
  const { settings, updateSettings } = useSettings();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'suggest', 'reason'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await llmService.processCommand(prompt, {
        rooms: room ? [room] : [],
        sensors,
        appliances,
        automations
      });
      setResponse(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestAutomations = async () => {
    setLoading(true);
    setError(null);
    setActiveTab('suggest');

    try {
      const result = await llmService.suggestAutomations(room, sensors, appliances);
      setResponse(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReasonContext = async () => {
    setLoading(true);
    setError(null);
    setActiveTab('reason');

    try {
      const result = await llmService.reasonAboutRoomContext(room, allSensors, allDevices);
      setResponse(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <h3>AI Assistant</h3>
        {room && <span className="ai-room-context">Room: {room.name}</span>}
      </div>
      
      <div className="ai-model-selector">
        <ModelSelector
          selectedModel={settings.selectedModel}
          onModelSelect={(model) => updateSettings({ selectedModel: model })}
        />
      </div>

      <div className="ai-tabs">
        <button 
          className={`ai-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
        <button 
          className={`ai-tab ${activeTab === 'suggest' ? 'active' : ''}`}
          onClick={handleSuggestAutomations}
          disabled={loading || !room}
        >
          💡 Suggest
        </button>
        <button 
          className={`ai-tab ${activeTab === 'reason' ? 'active' : ''}`}
          onClick={handleReasonContext}
          disabled={loading || !room}
        >
          🧠 Reason
        </button>
      </div>

      <div className="ai-content">
        {activeTab === 'chat' && (
          <form onSubmit={handleSubmit} className="ai-form">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask something like 'Turn on the kitchen lights'..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !prompt.trim()}>
              {loading ? '...' : 'Send'}
            </button>
          </form>
        )}

        {loading && <div className="ai-loading">Thinking...</div>}

        {error && <div className="ai-error">{error}</div>}

        {response && !loading && (
          <div className="ai-response">
            <pre>{response}</pre>
          </div>
        )}

        {!response && !loading && !error && (
          <div className="ai-placeholder">
            {activeTab === 'chat' 
              ? 'Ask me anything about your smart home...' 
              : activeTab === 'suggest'
                ? 'Click "Suggest" to get automation ideas for this room'
                : 'Click "Reason" to analyze which devices belong to this room'
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPanel;
