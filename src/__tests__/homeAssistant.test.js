// Mock settings
const mockSettings = {
  hassHost: 'http://localhost:8123',
  hassToken: 'test_token'
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => JSON.stringify(mockSettings)),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Import after mocks
const { fetchRooms, fetchSensors, fetchAppliances } = require('../services/homeAssistant.jsx');

describe('Home Assistant Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchRooms', () => {
    it('should return rooms from HA API areas when available', async () => {
      const mockAreas = [
        { area_id: 'living_room', name: 'Living Room' },
        { area_id: 'bedroom', name: 'Bedroom' }
      ];
      
      const mockStates = [
        { entity_id: 'light.living_room', attributes: {} }
      ];

      fetch.mockResolvedValueOnce(mockAreas); // /api/areas
      fetch.mockResolvedValueOnce(mockStates); // /api/states

      const rooms = await fetchRooms();

      expect(rooms).toHaveLength(2);
      expect(rooms[0].id).toBe('living_room');
      expect(rooms[1].id).toBe('bedroom');
    });

    it('should extract rooms from area_id attribute when no areas API', async () => {
      const mockStates = [
        { entity_id: 'sensor.bedroom_temp', attributes: { area_id: 'bedroom' } },
        { entity_id: 'light.living_room', attributes: { area_id: 'living_room' } }
      ];

      // First call returns empty areas, second call returns states
      fetch.mockResolvedValueOnce([]); // /api/areas
      fetch.mockResolvedValueOnce(mockStates); // /api/states

      const rooms = await fetchRooms();

      expect(rooms).toHaveLength(2);
      expect(rooms[0].id).toBe('bedroom');
      expect(rooms[1].id).toBe('living_room');
    });

    it('should use entity ID pattern as fallback when no area_id', async () => {
      const mockStates = [
        { entity_id: 'sensor.living_room_temperature', attributes: {} },
        { entity_id: 'light.bedroom_ceiling', attributes: {} }
      ];

      // No areas, fall back to entity ID parsing
      fetch.mockResolvedValueOnce([]); // /api/areas
      fetch.mockResolvedValueOnce(mockStates); // /api/states

      const rooms = await fetchRooms();

      // Should match known rooms from entity names
      expect(rooms.length).toBeGreaterThan(0);
    });

    it('should NOT return domain types as rooms', async () => {
      const mockStates = [
        { entity_id: 'sensor.anything', attributes: {} },
        { entity_id: 'switch.anything', attributes: {} },
        { entity_id: 'light.anything', attributes: {} },
        { entity_id: 'binary_sensor.anything', attributes: {} }
      ];

      fetch.mockResolvedValueOnce([]); // /api/areas
      fetch.mockResolvedValueOnce(mockStates); // /api/states

      const rooms = await fetchRooms();

      // Should not include sensor, switch, light, binary_sensor as room names
      const roomIds = rooms.map(r => r.id);
      expect(roomIds).not.toContain('sensor');
      expect(roomIds).not.toContain('switch');
      expect(roomIds).not.toContain('light');
      expect(roomIds).not.toContain('binary_sensor');
    });

    it('should return default rooms when no rooms found', async () => {
      const mockStates = [
        { entity_id: 'unknown.weird_entity', attributes: {} }
      ];

      fetch.mockResolvedValueOnce([]); // /api/areas
      fetch.mockResolvedValueOnce(mockStates); // /api/states

      const rooms = await fetchRooms();

      // Should return default rooms when nothing matches
      expect(rooms.length).toBeGreaterThan(0);
    });
  });

  describe('fetchSensors', () => {
    it('should filter sensors by room area_id', async () => {
      const mockStates = [
        { 
          entity_id: 'sensor.bedroom_temp', 
          attributes: { 
            area_id: 'bedroom', 
            friendly_name: 'Bedroom Temperature',
            unit_of_measurement: '°C'
          },
          state: '22'
        },
        { 
          entity_id: 'sensor.living_room_temp', 
          attributes: { 
            area_id: 'living_room',
            friendly_name: 'Living Room Temperature',
            unit_of_measurement: '°C'
          },
          state: '21'
        }
      ];

      fetch.mockResolvedValueOnce(mockStates);

      const room = { id: 'bedroom', name: 'Bedroom' };
      const sensors = await fetchSensors(room);

      expect(sensors).toHaveLength(1);
      expect(sensors[0].id).toBe('sensor.bedroom_temp');
      expect(sensors[0].name).toBe('Bedroom Temperature');
    });

    it('should match sensors by entity ID pattern when no area_id', async () => {
      const mockStates = [
        { 
          entity_id: 'sensor.kitchen_temp', 
          attributes: { friendly_name: 'Kitchen Temp' },
          state: '20'
        }
      ];

      fetch.mockResolvedValueOnce(mockStates);

      const room = { id: 'kitchen', name: 'Kitchen' };
      const sensors = await fetchSensors(room);

      expect(sensors).toHaveLength(1);
    });
  });

  describe('fetchAppliances', () => {
    it('should filter appliances by room area_id', async () => {
      const mockStates = [
        { 
          entity_id: 'light.bedroom_ceiling', 
          attributes: { area_id: 'bedroom', friendly_name: 'Bedroom Ceiling' },
          state: 'on'
        },
        { 
          entity_id: 'switch.garage_door', 
          attributes: { area_id: 'garage', friendly_name: 'Garage Door' },
          state: 'off'
        }
      ];

      fetch.mockResolvedValueOnce(mockStates);

      const room = { id: 'bedroom', name: 'Bedroom' };
      const appliances = await fetchAppliances(room);

      expect(appliances).toHaveLength(1);
      expect(appliances[0].id).toBe('light.bedroom_ceiling');
      expect(appliances[0].isOn).toBe(true);
    });
  });
});
