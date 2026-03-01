# Home Assistant API Integration

This document describes how to gather information from Home Assistant using the API.

## Prerequisites

1. Home Assistant instance running and accessible.
2. A Long-Lived Access Token for authentication.

## Getting a Long-Lived Access Token

1. Log in to your Home Assistant instance.
2. Click on your profile icon in the bottom left.
3. Scroll down to "Long-Lived Access Tokens".
4. Click "Create Token".
5. Give it a name (e.g., "LazyAutomation").
6. Copy the token and save it securely. You won't be able to see it again.

## API Endpoints Used

The following API endpoints are used by LazyAutomation:

### 1. Get All States
**Endpoint:** `GET /api/states`

Returns all states in Home Assistant. This is used to fetch:
- Rooms (areas)
- Sensors
- Appliances (lights, switches, fans, climate devices)

**Example:**
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  http://homeassistant.local:8123/api/states
```

### 2. Get Automations
**Endpoint:** `GET /api/automations`

Returns all automations in Home Assistant.

**Example:**
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  http://homeassistant.local:8123/api/automations
```

### 3. Get Services
**Endpoint:** `GET /api/services`

Returns all services available in Home Assistant.

## Filtering by Room

The application filters entities by room using the `area_id` attribute. To ensure entities are associated with rooms:

1. Go to Home Assistant Settings > Areas & Zones.
2. Create or edit areas (rooms).
3. Assign devices to areas in Settings > Devices & Services > Devices.

## Environment Variables

Set the following environment variables in your `.env` file:

```env
REACT_APP_HASS_HOST=http://homeassistant.local:8123
REACT_APP_HASS_TOKEN=your_long_lived_access_token_here
```

## Testing the API

You can test the API using curl:

```bash
# Test connection
curl -X GET \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://homeassistant.local:8123/api/

# Expected response: {"message": "API running."}
```

## Troubleshooting

### 401 Unauthorized
- Check that your access token is correct and not expired.
- Ensure the token has the required permissions.

### Connection Refused
- Check that Home Assistant is running.
- Verify the hostname and port in your configuration.

### No Data Showing
- Ensure devices are assigned to areas in Home Assistant.
- Check that the entities have the `area_id` attribute.
