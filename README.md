# LazyAutomation

LazyAutomation is a web-based dashboard for automating Home Assistant based on room context, available sensors, and appliances. It allows users to filter and view automations specific to each room.

## Features
- Room context-based automation.
- List available sensors and appliances for each room.
- View and manage automations for each room.
- Follow Apple's UI guidelines.
- Pull data from Home Assistant only when needed.

## Getting Started
1. Clone the repository.
2. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
3. Configure your Home Assistant settings in `.env`.
4. Run the application with Docker:
   ```bash
   docker-compose up -d
   ```
5. Access the application at `http://localhost:3000` (or the port you configured).

## Documentation
- [README.md](README.md): Project details.
- [CONTRIBUTING.md](CONTRIBUTING.md): Contribution guidelines.
- [ISSUE_TEMPLATE.md](ISSUE_TEMPLATE.md): Issue reporting template.
- [PULL_REQUEST_TEMPLATE.md](PULL_REQUEST_TEMPLATE.md): Pull request guidelines.
- [HOME_ASSISTANT_API.md](HOME_ASSISTANT_API.md): Home Assistant API integration guide.

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to the project.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
