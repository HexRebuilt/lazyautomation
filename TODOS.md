# Todos for LazyAutomation

0. **LLM API Fix:**
    - [x] ## Task: Fix LLM API HTTP 502 Error
        **Goal**: Resolve the HTTP 502 error when connecting to LMStudio API through nginx reverse proxy to enable local LLM parsing of Home Assistant entities.
        
        **Files involved**:
        - .env: Contains VITE_LLM_API_URL=https://lmstudionvidia.hexrebuilt.xyz/v1
        - src/services/llm.jsx: LLM service implementation that uses proxy
        - src/components/Settings.jsx: Settings UI for LLM configuration
        - server.cjs: Node.js proxy server that forwards /api/proxy/* requests
        
        **Completion criteria**:
        - [x] LLM API returns successful responses instead of HTTP 502
        - [x] Connection to LMStudio works through the proxy
        - [x] Natural language processing of Home Assistant entities functions correctly
        - [x] No regression in other API connections (Home Assistant, Ollama)
        
        **Steps**:
        - [x] 1. Verify LMStudio service is running on host machine and accessible on the expected port
        - [x] 2. Check nginx proxy configuration to ensure it properly forwards to LMStudio
        - [x] 3. Test direct connection to LMStudio API to confirm service availability
        - [x] 4. Test connection through the application's proxy endpoint (/api/proxy/)
        - [x] 5. Verify .env configuration matches actual LMStudio endpoint
        - [x] 6. Check if USE_LOCAL_API setting is incorrectly causing fallback to Ollama
        - [x] 7. Examine server.cjs proxy implementation for potential issues
        - [x] 8. Test LLM connection through Settings UI to isolate the problem
        - [x] 9. Fix any misconfiguration in proxy settings or service URLs
        - [x] 10. Verify fix works for natural language processing of Home Assistant entities
        
        **Resolution**: Updated .env file to use VITE_ prefix for environment variables (required by Vite). Updated SettingsContext and settings.js to load environment variables as defaults. The LMStudio API is now accessible through the proxy endpoint.

1. **Model Selection:**
    - [x] ## Task: Add Model Dropdown with Server Status
        **Goal**: Create a model dropdown selector in Settings that shows available models and server connection status.
        
        **Files involved**:
        - src/components/ModelSelector.jsx: New component for model selection
        - src/components/Settings.jsx: Updated to include model selector
        - src/services/llm.jsx: Updated to use selected model from settings
        - src/services/settings.js: Added selectedModel field
        - src/context/SettingsContext.jsx: Added selectedModel field
        
        **Completion criteria**:
        - [x] Model dropdown displays available models from LMStudio/Ollama
        - [x] Server status indicator shows connection state (connected/disconnected/connecting)
        - [x] Selected model is saved to localStorage
        - [x] Model selection is used in LLM API calls
        - [x] Loaded model is displayed in status indicator
        
        **Resolution**: Created ModelSelector component with server status indicator, added model selection functionality, and integrated with settings.

2. **Room Selection Fix:**
    - [x] ## Task: Fix Room Selection for Systems without area_id
        **Goal**: Fix room selection by adding fallback to extract rooms from entity IDs when area_id is not available.
        
        **Files involved**:
        - src/services/homeAssistant.jsx: Updated fetchRooms function
        
        **Completion criteria**:
        - [x] Rooms are extracted from entity IDs when area_id is not available
        - [x] Support for Italian room names (soggiorno, cucina, camera_da_letto, etc.)
        - [x] Support for English room names (living_room, kitchen, bedroom, etc.)
        - [x] Duplicate room names are handled correctly
        - [x] Rooms are sorted alphabetically
        
        **Resolution**: Updated fetchRooms function to extract rooms from entity IDs as fallback when area_id is not available.

3. **Documentation:**
    - [x] Create a README.md file with project details.
    - [ ] Create a CONTRIBUTING.md file with contribution guidelines.
    - [ ] Create an ISSUE_TEMPLATE.md file for issue reporting.
    - [ ] Create a PULL_REQUEST_TEMPLATE.md file for pull request guidelines.

2. **WebUI Development:**
    - [x] Set up the frontend project using React (or Vue.js or Angular).
    - [x] Design the UI following Apple's guidelines.
    - [x] implement the UI components for room selection, sensor listing, appliance listing, and automation listing.
    - [x] Integrate with Home Assistant API to fetch room context, sensors, appliances, and automations.
    - [x] Ensure minimal data storage in the container, pulling data only when the dashboard is in use.
    - [x] Document how to gather information from Home Assistant via API or auth token.

3. **Docker Setup:**
    - [x] Create a Dockerfile for the application.
    - [x] Create a .env.example file with example environment variables.
    - [x] Ensure the .env file is not pushed to the repository.

4. **Testing and Deployment:**
    - [ ] Set up testing with Jest and other testing frameworks.
    - [ ] Create a CI/CD pipeline for automated testing and deployment.
    - [ ] Create a SBOM file for each release.

5. **Security:**
    - [ ] Ensure all sensitive data is stored in the .env file.
    - [ ] Follow security best practices for storing API keys and tokens.
    - [ ] Address any security issues found during testing and deployment.

6. **Localization:**
    - [ ] Add localization support for room names (English, Italian, Spanish, etc.)
    - [ ] Use APP_LOCALE env variable to set the display language
    - [ ] Support multiple language packs for room name translations supported by the smallest model available on the llm endpoint of chosing OR by selecting it on the settting page. 
    - [ ] Allow LLM-powered translation using local Ollama/LMStudio

7. **Features:**
    - [ ] Room detection from entity IDs (including Italian names like soggiorno, cucina, camera_da_letto)
    - [ ] Entity ID display for automation use
    - [x] LMStudio/Ollama connection support
    - [ ] Add automation editor
    - [ ] Add sensor history charts
    - [ ] Add device control from UI

8. **Security Fixes (from analysis):**
    - [ ] CRITICAL: Remove SYS_ADMIN capability from opencode-runner service
    - [ ] CRITICAL: Add .env to .gitignore and remove sensitive secrets from git history
    - [ ] HIGH: Pin all Docker image tags to specific versions (remove :latest)
    - [ ] HIGH: Update Dockerfile.opencode - pin base image with SHA digest
    - [ ] HIGH: Refactor Dockerfile.opencode to fix user switch order for npm operations
    - [ ] HIGH: Add read-only filesystem + tmpfs mounts to both services in docker-compose.yml
    - [ ] HIGH: Remove host.docker.internal from production webapp service
    - [ ] MEDIUM: Update Dockerfile - run npm install as non-root appuser before user switch
    - [ ] MEDIUM: Improve build caching in Dockerfile (copy package.json first, use npm ci)
    - [ ] MEDIUM: Add healthcheck endpoint validation in Dockerfile builder stage
    - [ ] MEDIUM: Update docker-entrypoint.sh with security validations (env check, path traversal prevention)
    - [ ] MEDIUM: Pin dependency versions in package.json (replace ^ ranges)
    - [ ] MEDIUM: Add Docker secrets configuration to docker-compose.yml for API keys and tokens
    - [ ] LOW: Remove unnecessary ENV npm_config_progress_bar_style=unicode from Dockerfile.opencode
    - [ ] LOW: Add cap_drop: [ALL] security_opt settings to webapp service in docker-compose.yml
    - [ ] MEDIUM: Run npm audit on package.json and fix discovered vulnerabilities
    - [ ] LONG-TERM: Set up automated vulnerability scanning pipeline (Trivy/Docker Scan)
    - [ ] LONG-TERM: Create security baseline documentation for all new Dockerfiles
