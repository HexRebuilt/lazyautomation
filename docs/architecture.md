# Architecture Overview

## High-Level Diagram
```mermaid
graph TD
    A[Client: LazyAutomation Frontend] -->|HTTPS| B[API Gateway]
    B --> C[Authentication Service]
    B --> D[Room Context Service]
    B --> E[Task Scheduler]
    
    subgraph Services
        C --> F[Home Assistant API]
        D --> G[Ollama/LMStudio]
        E --> H[CronJob Runner]
    end
    
    subgraph Databases
        F --> I[Home Assistant DB]
        H --> J[Local Task Queue]
    end
    
    style A fill:#4285F4,color:white
    style B fill:#EA4335,color:white
    style C,D,E fill:#34A853,color:white
    style F,G,H fill:#673AB7,color:white
    style I,J fill:#FBBC05,color:black
```

## Service Dependencies
1. **API Gateway**: 
   - Exposes all endpoints with HTTPS.
   - Uses `${HAS_TOKEN}` for authentication to Home Assistant API.
   - Routes requests to appropriate services based on the endpoint.

2. **Room Context Service**:
   - Fetches sensor data from Home Assistant using `${REACT_APP_HASS_HOST}`.
   - Integrates with Ollama (`${REACT_APP_OLLAMA_HOST}`) and LMStudio (`${LMSTUDIO_HOST}`) for AI-based context analysis.

3. **Task Scheduler**:
   - Executes cron jobs using `${CRON_SCHEDULE}`.
   - Uses environment variables to pass configuration, such as `LLM_API_KEY` or `OPENCODE_API_KEY`.

4. **External Services**:
   - Home Assistant API: Secure connection over HTTPS only.
   - LLM Provider: Connects via `${REACT_APP_LLM_API_URL}`.
   - OpenCode Runner: Authenticated with `${OPENCODE_API_KEY}`.