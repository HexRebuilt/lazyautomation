import { getLLMConfig, getOllamaConfig } from './settings.js';

// Determine if we're using an OpenAI-compatible API (LMStudio, OpenAI, Anthropic, etc.)
const isOpenAICompatible = (url) => {
  return url.includes('/v1') || url.includes('lmstudio') || url.includes('api.openai.com') || url.includes('api.anthropic.com');
};

// Use fetch through proxy to avoid CORS issues
const llmFetch = async (endpoint, options = {}) => {
  const config = getLLMConfig();
  
  let baseUrl = config.apiUrl;
  let headers = {};
  
  // Fall back to Ollama if no external API configured
  if (!baseUrl || config.useLocalApi) {
    const ollamaConfig = getOllamaConfig();
    baseUrl = ollamaConfig.host;
  }
  
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }
  
  const targetUrl = `${baseUrl}${endpoint}`;
  const proxyUrl = `/api/proxy/${encodeURIComponent(targetUrl)}`;
  console.log('[LLM] Fetching:', proxyUrl);
  
  const response = await fetch(proxyUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  return response.json();
};

// Get available models from the LLM provider
export const getLLMModels = async () => {
  try {
    const config = getLLMConfig();
    
    let baseUrl = config.apiUrl;
    if (!baseUrl || config.useLocalApi) {
      const ollamaConfig = getOllamaConfig();
      baseUrl = ollamaConfig.host;
    }
    
    if (isOpenAICompatible(baseUrl)) {
      // OpenAI-compatible endpoint (LMStudio, OpenAI, etc.)
      const data = await llmFetch('/v1/models');
      return data.data || [];
    } else {
      // Native Ollama
      const data = await llmFetch('/api/tags');
      return data.models || [];
    }
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};

// Check connection to LLM provider
export const checkLLMConnection = async () => {
  try {
    const models = await getLLMModels();
    return { connected: models.length > 0, models, error: null };
  } catch (error) {
    return { connected: false, models: [], error: error.message };
  }
};

// Send a chat completion request (supports natural language)
export const sendChatMessage = async (messages, options = {}) => {
  const config = getLLMConfig();
  
  let baseUrl = config.apiUrl;
  if (!baseUrl || config.useLocalApi) {
    const ollamaConfig = getOllamaConfig();
    baseUrl = ollamaConfig.host;
  }
  
  const defaultOptions = {
    temperature: 0.7,
    max_tokens: 1000,
    ...options
  };
  
  if (isOpenAICompatible(baseUrl)) {
    // OpenAI-compatible chat completion
    const response = await llmFetch('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: config.model || 'default',
        messages,
        ...defaultOptions
      })
    });
    
    return response.choices?.[0]?.message?.content || response.choices?.[0]?.text || '';
  } else {
    // Native Ollama - convert chat messages to prompt
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const response = await llmFetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        model: config.model || 'llama2',
        prompt,
        stream: false,
        ...defaultOptions
      })
    });
    
    return response.response || '';
  }
};

// Send a simple prompt/completion request
export const sendPrompt = async (prompt, options = {}) => {
  const config = getLLMConfig();
  
  let baseUrl = config.apiUrl;
  if (!baseUrl || config.useLocalApi) {
    const ollamaConfig = getOllamaConfig();
    baseUrl = ollamaConfig.host;
  }
  
  const defaultOptions = {
    temperature: 0.7,
    max_tokens: 1000,
    ...options
  };
  
  if (isOpenAICompatible(baseUrl)) {
    // OpenAI-compatible completion
    const response = await llmFetch('/v1/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: config.model || 'default',
        prompt,
        ...defaultOptions
      })
    });
    
    return response.choices?.[0]?.text || '';
  } else {
    // Native Ollama
    const response = await llmFetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        model: config.model || 'llama2',
        prompt,
        stream: false,
        ...defaultOptions
      })
    });
    
    return response.response || '';
  }
};

// Main LLM Service with all AI features
export const llmService = {
  // Check if provider is compatible
  isProviderCompatible(providerName) {
    const supportedProviders = ['ollama', 'lmstudio', 'openai', 'anthropic', 'local'];
    return supportedProviders.includes(providerName?.toLowerCase());
  },

  // Natural language command processing
  async processCommand(command, context) {
    const { rooms, sensors, appliances, automations } = context;
    
    const systemPrompt = `You are a smart home assistant for Home Assistant. Your role is to:
1. Understand natural language commands and convert them to actionable responses
2. Suggest automations based on the current home state
3. Reason about which devices/sensors belong to which room based on their names and context

Available rooms: ${rooms.map(r => r.name).join(', ') || 'None'}
Total sensors: ${sensors.length}
Total appliances: ${appliances.length}
Total automations: ${automations.length}

Respond in a helpful, concise manner. If asked to control devices, provide the entity IDs that would be affected.`;

    const userMessage = `Command: "${command}"

Current context:
- Sensors: ${sensors.slice(0, 10).map(s => `${s.name} (${s.entityId})`).join(', ')}${sensors.length > 10 ? '...' : ''}
- Appliances: ${appliances.slice(0, 10).map(a => `${a.name} (${a.entityId}): ${a.state}`).join(', ')}${appliances.length > 10 ? '...' : ''}
- Automations: ${automations.slice(0, 5).map(a => `${a.name}`).join(', ')}${automations.length > 5 ? '...' : ''}`;

    try {
      const response = await sendChatMessage([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]);
      return response;
    } catch (error) {
      console.error('Error processing command:', error);
      throw error;
    }
  },

  // Auto-suggest automations based on room context
  async suggestAutomations(room, sensors, appliances) {
    const roomName = room?.name || 'this room';
    
    const systemPrompt = `You are a home automation expert for Home Assistant. Based on the provided sensors and appliances in a room, suggest useful automations.

For each suggestion, provide:
1. A brief description of what the automation does
2. The trigger (what starts it)
3. The action (what happens)
4. Entity IDs that would be involved

Be practical and focus on common use cases like:
- Turning lights on/off based on motion or time
- Sending notifications based on sensor readings
- Climate control based on temperature
- Energy saving automations`;

    const context = `Room: ${roomName}

Sensors in this room:
${sensors.map(s => `- ${s.name} (${s.entityId}): ${s.state} ${s.unit || ''}`).join('\n')}

Appliances in this room:
${appliances.map(a => `- ${a.name} (${a.entityId}): ${a.state} (${a.type})`).join('\n')}`;

    try {
      const response = await sendChatMessage([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: context }
      ]);
      return response;
    } catch (error) {
      console.error('Error suggesting automations:', error);
      throw error;
    }
  },

  // Reason about which entities belong to which room
  async reasonAboutRoomContext(room, allSensors, allAppliances) {
    const roomName = room?.name || 'this room';
    const roomId = room?.id || '';
    
    const systemPrompt = `You are a smart home expert. Analyze the provided entities and determine which ones likely belong to the specified room based on their names, entity IDs, and current states.

For each entity, explain briefly why it does or doesn't belong to the room.
Focus on:
- Entity names containing the room name or related keywords
- Device types typical for that room (e.g., kitchen = sensors about temperature, cooking; bedroom = lights, climate)
- Entity ID patterns`;

    const context = `Room to analyze: ${roomName} (ID: ${roomId})

All sensors in the home:
${allSensors.map(s => `- ${s.name} (${s.entityId}): ${s.state} ${s.unit || ''}`).join('\n')}

All appliances in the home:
${allAppliances.map(a => `- ${a.name} (${a.entityId}): ${a.state} (${a.type})`).join('\n')}`;

    try {
      const response = await sendChatMessage([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: context }
      ]);
      return response;
    } catch (error) {
      console.error('Error reasoning about room context:', error);
      throw error;
    }
  },

  // Generate embeddings (for future use)
  async generateEmbedding(text) {
    try {
      const config = getLLMConfig();
      
      let baseUrl = config.apiUrl;
      if (!baseUrl || config.useLocalApi) {
        const ollamaConfig = getOllamaConfig();
        baseUrl = ollamaConfig.host;
      }
      
      if (isOpenAICompatible(baseUrl)) {
        const response = await llmFetch('/v1/embeddings', {
          method: 'POST',
          body: JSON.stringify({
            model: 'text-embedding-ada-002',
            input: text
          })
        });
        return response.data?.[0]?.embedding;
      } else {
        // Ollama embeddings
        const response = await llmFetch('/api/embeddings', {
          method: 'POST',
          body: JSON.stringify({
            model: 'nomic-embed-text',
            prompt: text
          })
        });
        return response.embedding;
      }
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }
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
