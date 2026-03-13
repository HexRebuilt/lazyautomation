import React, { useState, useEffect } from 'react';
import { getLLMModels, checkLLMConnection } from '../services/llm.jsx';
import { getLLMConfig } from '../services/settings.js';

const ModelSelector = ({ selectedModel, onModelSelect }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('connecting');
  const [loadedModel, setLoadedModel] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check server connection first
        const connection = await checkLLMConnection();
        if (connection.connected) {
          setServerStatus('connected');
          setLoadedModel(connection.models[0]?.id || null);
          
          // Load available models
          const availableModels = await getLLMModels();
          setModels(availableModels);
          
          // If no model is selected, select the first one
          if (!selectedModel && availableModels.length > 0) {
            onModelSelect(availableModels[0].id);
          }
        } else {
          setServerStatus('disconnected');
          setError(connection.error || 'Failed to connect to LLM server');
        }
      } catch (err) {
        setServerStatus('disconnected');
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadModels();
    
    // Refresh models every 30 seconds
    const interval = setInterval(loadModels, 30000);
    return () => clearInterval(interval);
  }, [selectedModel, onModelSelect]);

  const getStatusClass = () => {
    switch (serverStatus) {
      case 'connected': return 'status-connected';
      case 'disconnected': return 'status-disconnected';
      default: return 'status-connecting';
    }
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      default: return 'Connecting...';
    }
  };

  return (
    <div className="model-selector">
      <div className="model-selector-header">
        <label htmlFor="model-select">AI Model:</label>
        <div className={`server-status ${getStatusClass()}`}>
          <span className="status-indicator"></span>
          <span className="status-text">{getStatusText()}</span>
          {loadedModel && (
            <span className="loaded-model">({loadedModel})</span>
          )}
        </div>
      </div>
      
      <select
        id="model-select"
        value={selectedModel || ''}
        onChange={(e) => onModelSelect(e.target.value)}
        disabled={loading || serverStatus !== 'connected'}
      >
        <option value="">Select a model</option>
        {models.map(model => (
          <option key={model.id} value={model.id}>
            {model.id}
          </option>
        ))}
      </select>
      
      {error && (
        <div className="model-error">
          {error}
        </div>
      )}
      
      {loading && (
        <div className="model-loading">
          Loading models...
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
