# Operational Runbook

## Deployment Instructions
1. **Environment Setup**:
   - Ensure Docker and Docker Compose are installed.
   - Create a `.env` file using the template provided in `.env.example`.
   - Replace hardcoded values with environment variables:
     ```bash
     HASS_TOKEN=your_long_lived_access_token
     LLM_API_KEY=your_api_key_here
     OPENCODE_API_KEY=your_opencode_api_key_here
     CRON_SCHEDULE="0 4 * * * /bin/sh /app/cronjobs.sh"
     ```
   - All external URLs must use HTTPS for secure connections.

2. **Run Services**:
   ```bash
   docker-compose build --no-cache && docker-compose up -d
   ```

## Troubleshooting
1. **Connection Issues to Home Assistant**:
   - Verify `${REACT_APP_HASS_HOST}` and `has_token` are correctly set in `.env`.
   - Check CORS settings in Home Assistant to allow requests from the API Gateway.

2. **AI Provider Connection Errors**:
   - For LLM provider, ensure `${REACT_APP_LLM_API_KEY}` is valid and `${REACT_APP_LLM_API_URL}` uses HTTPS.
   - For local providers (Ollama/LMStudio), verify host and port are accessible:
     ```bash
     curl https://${REACT_APP_OLLAMA_HOST}/api/tags  # Check Ollama server
     curl http://${LMSTUDIO_HOST}/v1/models            # Check LMStudio server
     ```
   - Ensure environment variables for these services are set:
     ```bash
     export REACT_APP_OLLAMA_HOST=https://localhost:11434  # Use HTTPS if required by Ollama
     export LMSTUDIO_API_KEY=your_api_key_here         # If authentication is required
     ```

3. **Cron Job Failures**:
   - Check the task logs with:
     ```bash
     docker-compose logs opencode-runner --tail=100
     ```
   - Ensure `${CRON_SCHEDULE}` is set correctly and the cronjob script (`cronjobs.sh`) has proper permissions.

## Rollback Procedure
If an update fails or causes issues:
1. Stop all services:
   ```bash
   docker-compose down
   ```
2. Revert to a known good version of the Docker images and configuration files.
3. Restart services:
   ```bash
   docker-compose up -d
   ```