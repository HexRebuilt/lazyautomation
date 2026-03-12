# Todos for LazyAutomation

1. **Documentation:**
   - [x] Create a README.md file with project details.
   - [ ] Create a CONTRIBUTING.md file with contribution guidelines.
   - [ ] Create an ISSUE_TEMPLATE.md file for issue reporting.
   - [ ] Create a PULL_REQUEST_TEMPLATE.md file for pull request guidelines.

2. **WebUI Development:**
   - [ ] Set up the frontend project using React (or Vue.js or Angular).
   - [ ] Design the UI following Apple's guidelines.
   - [ ] Implement the UI components for room selection, sensor listing, appliance listing, and automation listing.
   - [ ] Integrate with Home Assistant API to fetch room context, sensors, appliances, and automations.
   - [ ] Ensure minimal data storage in the container, pulling data only when the dashboard is in use.
   - [ ] Document how to gather information from Home Assistant via API or auth token.

3. **Docker Setup:**
   - [ ] Create a Dockerfile for the application.
   - [ ] Create a .env.example file with example environment variables.
   - [ ] Ensure the .env file is not pushed to the repository.

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
   - [ ] Use REACT_APP_LOCALE env variable to set the display language
   - [ ] Support multiple language packs for room name translations
   - [ ] Allow LLM-powered translation using local Ollama/LMStudio
