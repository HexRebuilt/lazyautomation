# Todos for LazyAutomation

1. **Documentation:**
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
    - [x] Set up testing with Jest and other testing frameworks.
    - [ ] Create a CI/CD pipeline for automated testing and deployment.
    - [ ] Create a SBOM file for each release.

5. **Security:**
    - [x] Ensure all sensitive data is stored in the .env file.
    - [x] Follow security best practices for storing API keys and tokens.
    - [x] Address any security issues found during testing and deployment.

6. **Localization:**
    - [x] Add localization support for room names (English, Italian, Spanish, etc.)
    - [x] Use REACT_APP_LOCALE env variable to set the display language
    - [ ] Support multiple language packs for room name translations
    - [ ] Allow LLM-powered translation using local Ollama/LMStudio

7. **Features:**
    - [x] Room detection from entity IDs (including Italian names like soggiorno, cucina, camera_da_letto)
    - [x] Entity ID display for automation use
    - [x] LMStudio/Ollama connection support
    - [ ] Add automation editor
    - [ ] Add sensor history charts
    - [ ] Add device control from UI

8. **Security Fixes (from analysis):**
    - [x] CRITICAL: Remove SYS_ADMIN capability from opencode-runner service
    - [x] CRITICAL: Add .env to .gitignore and remove sensitive secrets from git history
    - [x] HIGH: Pin all Docker image tags to specific versions (remove :latest)
    - [x] HIGH: Update Dockerfile.opencode - pin base image with SHA digest
    - [x] HIGH: Refactor Dockerfile.opencode to fix user switch order for npm operations
    - [x] HIGH: Add read-only filesystem + tmpfs mounts to both services in docker-compose.yml
    - [x] HIGH: Remove host.docker.internal from production webapp service
    - [x] MEDIUM: Update Dockerfile - run npm install as non-root appuser before user switch
    - [x] MEDIUM: Improve build caching in Dockerfile (copy package.json first, use npm ci)
    - [x] MEDIUM: Add healthcheck endpoint validation in Dockerfile builder stage
    - [x] MEDIUM: Update docker-entrypoint.sh with security validations (env check, path traversal prevention)
    - [x] MEDIUM: Pin dependency versions in package.json (replace ^ ranges)
    - [x] MEDIUM: Add Docker secrets configuration to docker-compose.yml for API keys and tokens
    - [x] LOW: Remove unnecessary ENV npm_config_progress_bar_style=unicode from Dockerfile.opencode
    - [x] LOW: Add cap_drop: [ALL] security_opt settings to webapp service in docker-compose.yml
    - [x] MEDIUM: Run npm audit on package.json and fix discovered vulnerabilities
    - [ ] LONG-TERM: Set up automated vulnerability scanning pipeline (Trivy/Docker Scan)
    - [ ] LONG-TERM: Create security baseline documentation for all new Dockerfiles
