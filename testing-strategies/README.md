# Testing Strategies

This folder contains testing strategies and test cases for the LazyAutomation application.

## Test Categories

### 1. Room Selection Tests
- [ ] Verify rooms are extracted from entity IDs when area_id is not available
- [ ] Verify room selection dropdown displays all available rooms
- [ ] Verify selecting a room loads the correct sensors, appliances, and automations
- [ ] Verify room selection persists across page navigation

### 2. Model Selection Tests
- [ ] Verify model dropdown displays available models from LMStudio/Ollama
- [ ] Verify server status indicator shows correct connection state
- [ ] Verify selected model is saved to settings
- [ ] Verify model selection is used in LLM API calls

### 3. LLM API Tests
- [ ] Verify LLM API connection works through proxy endpoint
- [ ] Verify chat completion requests use selected model
- [ ] Verify error handling for failed LLM connections

### 4. Home Assistant Integration Tests
- [ ] Verify Home Assistant connection status is displayed
- [ ] Verify sensors are loaded for selected room
- [ ] Verify appliances are loaded for selected room
- [ ] Verify automations are loaded for selected room

### 5. Settings Tests
- [ ] Verify settings are saved to localStorage
- [ ] Verify environment variables are loaded as defaults
- [ ] Verify settings can be reset to defaults

### 6. Security Tests
- [ ] Verify API keys are not exposed in client-side code
- [ ] Verify .env file is not tracked by git
- [ ] Verify environment variables use VITE_ prefix

## Test Execution

### Unit Tests
Run the existing unit tests:
```bash
npm test
```

### Integration Tests
Test the application manually by:
1. Starting the application with `docker-compose up -d`
2. Accessing the application at http://localhost:5002
3. Testing room selection and model selection functionality

### Manual Testing Checklist
- [ ] Room selection dropdown displays rooms
- [ ] Selecting a room loads room data
- [ ] Model dropdown displays available models
- [ ] Server status indicator shows correct state
- [ ] Settings are saved and loaded correctly
- [ ] LLM API calls work with selected model

## Test Coverage Goals
- 100% test coverage for critical components
- All existing features should continue to work after changes
- No regression in existing functionality