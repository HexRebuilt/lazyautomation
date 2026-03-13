import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchRooms } from '../src/services/homeAssistant.jsx';

// Mock the settings service
vi.mock('../src/services/settings.js', () => ({
  getHassConfig: vi.fn(() => ({
    host: 'https://homeassistant.hexrebuilt.xyz',
    token: 'test-token',
  })),
}));

// Mock fetch
global.fetch = vi.fn();

describe('fetchRooms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('extracts rooms from entity IDs when area_id is not available', async () => {
    const mockStates = [
      { entity_id: 'media_player.camera_da_letto', attributes: {} },
      { entity_id: 'sensor.porta_ingresso_battery', attributes: {} },
      { entity_id: 'light.cucina', attributes: {} },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStates,
    });

    // Mock 404 for areas endpoint
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const rooms = await fetchRooms();

    expect(rooms).toHaveLength(3);
    expect(rooms.map(r => r.id)).toContain('camera_da_letto');
    expect(rooms.map(r => r.id)).toContain('ingresso');
    expect(rooms.map(r => r.id)).toContain('cucina');
  });

  it('extracts rooms from Italian entity IDs', async () => {
    const mockStates = [
      { entity_id: 'media_player.soggiorno', attributes: {} },
      { entity_id: 'sensor.bagno', attributes: {} },
      { entity_id: 'light.salotto', attributes: {} },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStates,
    });

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const rooms = await fetchRooms();

    expect(rooms).toHaveLength(3);
    expect(rooms.map(r => r.id)).toContain('soggiorno');
    expect(rooms.map(r => r.id)).toContain('bagno');
    expect(rooms.map(r => r.id)).toContain('salotto');
  });

  it('extracts rooms from English entity IDs', async () => {
    const mockStates = [
      { entity_id: 'light.living_room', attributes: {} },
      { entity_id: 'sensor.kitchen', attributes: {} },
      { entity_id: 'switch.bedroom', attributes: {} },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStates,
    });

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const rooms = await fetchRooms();

    expect(rooms).toHaveLength(3);
    expect(rooms.map(r => r.id)).toContain('living_room');
    expect(rooms.map(r => r.id)).toContain('kitchen');
    expect(rooms.map(r => r.id)).toContain('bedroom');
  });

  it('handles duplicate room names', async () => {
    const mockStates = [
      { entity_id: 'media_player.camera_da_letto', attributes: {} },
      { entity_id: 'sensor.camera_da_letto', attributes: {} },
      { entity_id: 'light.camera_da_letto', attributes: {} },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStates,
    });

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const rooms = await fetchRooms();

    expect(rooms).toHaveLength(1);
    expect(rooms[0].id).toBe('camera_da_letto');
  });

  it('returns empty array when no rooms are found', async () => {
    const mockStates = [
      { entity_id: 'sensor.temperature', attributes: {} },
      { entity_id: 'switch.power', attributes: {} },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStates,
    });

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const rooms = await fetchRooms();

    expect(rooms).toHaveLength(0);
  });

  it('sorts rooms alphabetically', async () => {
    const mockStates = [
      { entity_id: 'light.z_room', attributes: {} },
      { entity_id: 'light.a_room', attributes: {} },
      { entity_id: 'light.m_room', attributes: {} },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStates,
    });

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const rooms = await fetchRooms();

    expect(rooms).toHaveLength(3);
    expect(rooms[0].id).toBe('a_room');
    expect(rooms[1].id).toBe('m_room');
    expect(rooms[2].id).toBe('z_room');
  });
});