# API Documentation

## Base URL
All endpoints use HTTPS:
```http
https://api.lazyautomation.example.com/v1
```

## Endpoints

### Authentication
- **Method**: `POST /auth/login`
  - **Parameters**: 
    - `username`: String (provided by Home Assistant)
    - `password`: String (provided by Home Assistant)
    - `has_token=${HAS_TOKEN}`: Optional, for direct token-based authentication
  - **Response**: `200 OK` with JWT token and user details.

### User Management
- **Method**: `POST /users`
  - **Parameters**: 
    - `name`: String
    - `role`: String (e.g., admin, user)
  - **Headers**:
    - `Authorization: Bearer ${JWT_TOKEN}`
  - **Response**: `201 Created` with the newly created user details.

### Room Context
- **Method**: `GET /rooms/{room_id}/sensors`
  - **Parameters**: 
    - `room_id`: Integer (unique room identifier)
    - `page=1&limit=10`: Optional pagination parameters
  - **Headers**:
    - `Authorization: Bearer ${JWT_TOKEN}`
  - **Response**: `200 OK` with a list of sensors and their states.

### Automation Tasks
- **Method**: `POST /tasks`
  - **Parameters**: 
    - `room_id`: Integer
    - `task_name`: String
    - `schedule=${CRON_SCHEDULE}`: Cron job schedule (defaults to `0 4 * * *` if not provided)
  - **Headers**:
    - `Authorization: Bearer ${JWT_TOKEN}`
  - **Response**: `201 Created` with task details.

### Error Codes
- `400 Bad Request`: Invalid input parameters or missing required fields.
- `401 Unauthorized`: Invalid or expired JWT token.
- `403 Forbidden`: User does not have permission to perform the requested action.
- `502 Bad Gateway`: Issues connecting to Home Assistant API or other external services.