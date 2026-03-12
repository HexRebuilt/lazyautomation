/**
 * Tests for Home Assistant Service
 * 
 * Run with: npm test -- --testPathPattern=homeAssistant
 */

// Mock settings module
jest.mock('../services/settings.js', () => ({
  getHassConfig: jest.fn()
}));

const { getHassConfig } = require('../services/settings.js');

// Mock fetch globally
global.fetch = jest.fn();

// Import after mocks
const { fetchRooms, checkHassConnection, fetchSensors, fetchAppliances } = require('../services/homeAssistant.jsx');

describe('Home Assistant Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getHassConfig.mockReturnValue({
      host: 'http://localhost:8123',
      token: 'test_token'
    });
  });

  describe('API URL Construction', () => {
    it('should construct correct URL with /api prefix for states', async () => {
      const mockStates = [
        { entity_id: 'light.living_room', attributes: { area_id: 'living_room' }, state: 'on' }
      ];
      
      fetch.mockResolvedValueOnce(mockStates);
      fetch.mockResolvedValueOnce([]); // areas returns empty

      await fetchRooms();

      // Check first call was to /api/states
      const statesCall = fetch.mock.calls[0];
      expect(statesCall[0]).toContain('/api/states');
    });

    it('should construct correct URL with /api prefix for areas', async () => {
      const mockStates = [];
      const mockAreas = [{ area_id: 'living_room', name: 'Living Room' }];
      
      fetch.mockResolvedValueOnce(mockStates);
      fetch.mockResolvedValueOnce(mockAreas);

      await fetchRooms();

      // Check areas call was to /api/areas
      const areasCall = fetch.mock.calls[1];
      expect(areasCall[0]).toContain('/api/areas');
    });
  });

  describe('fetchRooms', () => {
    it('should return rooms from HA API areas when available', async () => {
      const mockAreas = [
        { area_id: 'living_room', name: 'Living Room' },
        { area_id: 'bedroom', name: 'Bedroom' }
      ];
      
      const mockStates = [];

      fetch.mockResolvedValueOnce(mockStates);
      fetch.mockResolvedValueOnce(mockAreas);

      const rooms = await fetchRooms();

      expect(rooms).toHaveLength(2);
      expect(rooms[0].id).toBe('living_room');
      expect(rooms[1].id).toBe('bedroom');
    });

    it('should extract rooms from area_id attribute when no areas API', async () => {
      const mockStates = [
        { entity_id: 'sensor.bedroom_temp', attributes: { area_id: 'bedroom' }, state: '22' },
        { entity_id: 'light.living_room', attributes: { area_id: 'living_room' }, state: 'on' }
      ];

      // First: /api/states, Second: /api/areas (empty)
      fetch.mockResolvedValueOnce(mockStates);
      fetch.mockResolvedValueOnce([]);

      const rooms = await fetchRooms();

      expect(rooms).toHaveLength(2);
      expect(rooms.map(r => r.id)).toContain('bedroom');
      expect(rooms.map(r => r.id)).toContain('living_room');
    });

    it('should NOT return domain types as rooms', async () => {
      const mockStates = [
        { entity_id: 'sensor.test', attributes: {}, state: 'test' },
        { entity_id: 'switch.test', attributes: {}, state: 'on' },
        { entity_id: 'light.test', attributes: {}, state: 'on' },
        { entity_id: 'binary_sensor.test', attributes: {}, state: 'off' }
      ];

      fetch.mockResolvedValueOnce(mockStates);
      fetch.mockResolvedValueOnce([]); // empty areas

      const rooms = await fetchRooms();

      // Should NOT contain domain names
      const roomIds = rooms.map(r => r.id);
      expect(roomIds).not.toContain('sensor');
      expect(roomIds).not.toContain('switch');
      expect(roomIds).not.toContain('light');
      expect(roomIds).not.toContain('binary_sensor');
    });

    it('should return default rooms when nothing found', async () => {
      const mockStates = [{ entity_id: 'unknown.weird', attributes: {}, state: 'unknown' }];

      fetch.mockResolvedValueOnce(mockStates);
      fetch.mockResolvedValueOnce([]); // empty areas

      const rooms = await fetchRooms();

      // Should return default rooms
      expect(rooms.length).toBeGreaterThan(0);
    });

    it('should throw error when host not configured', async () => {
      getHassConfig.mockReturnValue({ host: '', token: '' });

      await expect(fetchRooms()).rejects.toThrow('Home Assistant URL not configured');
    });
  });

  describe('checkHassConnection', () => {
    it('should return connected true when API responds OK', async () => {
      fetch.mockResolvedValueOnce({ message: 'API running' });

      const result = await checkHassConnection();

      expect(result.connected).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should return connected false when API responds with error', async () => {
      fetch.mockResolvedValueOnce(Promise.reject(new Error('HTTP 401')));

      const result = await checkHassConnection();

      expect(result.connected).toBe(false);
    });
  });

  describe('fetchSensors', () => {
    it('should filter sensors by area_id', async () => {
      const mockStates = [
        { 
          entity_id: 'sensor.bedroom_temp', 
          attributes: { area_id: 'bedroom', friendly_name: 'Bedroom Temp', unit_of_measurement: '°C' },
          state: '22'
        },
        { 
          entity_id: 'sensor.living_room_temp', 
          attributes: { area_id: 'living_room', friendly_name: 'Living Room Temp', unit_of_measurement: '°C' },
          state: '21'
        }
      ];

      fetch.mockResolvedValueOnce(mockStates);

      const sensors = await fetchSensors({ id: 'bedroom', name: 'Bedroom' });

      expect(sensors).toHaveLength(1);
      expect(sensors[0].id).toBe('sensor.bedroom_temp');
    });
  });

  describe('fetchAppliances', () => {
    it('should filter appliances by area_id', async () => {
      const mockStates = [
        { 
          entity_id: 'light.bedroom_ceiling', 
          attributes: { area_id: 'bedroom', friendly_name: 'Bedroom Ceiling' },
          state: 'on'
        },
        { 
          entity_id: 'switch.garage', 
          attributes: { area_id: 'garage', friendly_name: 'Garage' },
          state: 'off'
        }
      ];

      fetch.mockResolvedValueOnce(mockStates);

      const appliances = await fetchAppliances({ id: 'bedroom', name: 'Bedroom' });

      expect(appliances).toHaveLength(1);
      expect(appliances[0].id).toBe('light.bedroom_ceiling');
    });
  });
});
