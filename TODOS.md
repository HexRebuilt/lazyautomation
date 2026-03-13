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
