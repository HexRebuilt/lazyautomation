import { getHassConfig } from './settings.js';

// Use fetch through proxy to avoid CORS issues
const hassFetch = async (endpoint, options = {}) => {
  const config = getHassConfig();
  console.log('[HA Service] Config:', { host: config.host, hasToken: !!config.token });
  
  if (!config.host) {
    throw new Error('Home Assistant URL not configured');
  }
  
  // HA API requires /api prefix (e.g., /api/states, /api/areas)
  const targetUrl = `${config.host}/api${endpoint}`;
  console.log('[HA Service] Fetching:', targetUrl);
  const proxyUrl = `/api/proxy/${encodeURIComponent(targetUrl)}`;
  console.log('[HA Service] Proxy URL:', proxyUrl);
  
  const headers = {
    'Content-Type': 'application/json',
    ...(config.token ? { 'Authorization': `Bearer ${config.token}` } : {})
  };
  
  const response = await fetch(proxyUrl, { headers });
  
  console.log('[HA Service] Response status:', response.status);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return response.json();
};

export const fetchRooms = async () => {
  try {
    const states = await hassFetch('/states');
    console.log('Total entities loaded:', states.length);
    console.log('Sample entities:', states.slice(0, 5).map(s => s.entity_id));
    
    // Try to get areas from Home Assistant API - try multiple endpoints
    let areas = [];
    const areaEndpoints = ['/areas', '/config/areas', '/area_registry'];
    
    for (const endpoint of areaEndpoints) {
      try {
        console.log('Trying area endpoint:', endpoint);
        areas = await hassFetch(endpoint);
        if (areas && areas.length > 0) {
          console.log('Found areas from:', endpoint, areas);
          break;
        }
      } catch (e) {
        console.warn(`Failed to fetch areas from ${endpoint}:`, e.message);
      }
    }
    
    const rooms = [];
    const roomSet = new Set();
    
    // Priority 1: Use areas from HA API (MOST RELIABLE)
    if (areas && areas.length > 0) {
      console.log('Found areas from HA API:', areas);
      areas.forEach(area => {
        if (!roomSet.has(area.area_id)) {
          roomSet.add(area.area_id);
          rooms.push({
            id: area.area_id,
            name: area.name || area.area_id,
            icon: getRoomIcon(area.area_id)
          });
        }
      });
      
      // If we got rooms from areas, return them (sorted)
      if (rooms.length > 0) {
        rooms.sort((a, b) => a.name.localeCompare(b.name));
        return rooms;
      }
    }
    
    // Priority 2: Use area_id OR room_id from entity attributes
    console.log('Trying area_id and room_id from entity attributes...');
    console.log('Sample entity attributes:', states.slice(0, 3).map(s => ({ entity_id: s.entity_id, area_id: s.attributes?.area_id, room_id: s.attributes?.room_id, attributes: Object.keys(s.attributes || {}) })));
    
    // Map room_id to room names (based on what we found in your HA)
    const roomIdToName = {
      1: 'Kitchen',
      2: 'Living Room',
      3: 'Hallway',
      4: 'Bedroom',
      7: 'Bathroom'
    };
    
    states.forEach(state => {
      const areaId = state.attributes?.area_id;
      const roomId = state.attributes?.room_id;
      
      // Use area_id if available
      if (areaId && !roomSet.has(areaId)) {
        console.log('Found area_id:', areaId, 'from entity:', state.entity_id);
        roomSet.add(areaId);
        rooms.push({
          id: areaId,
          name: areaId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          icon: getRoomIcon(areaId)
        });
      }
      // Otherwise use room_id if available
      else if (roomId && !roomSet.has('room_' + roomId)) {
        const roomName = roomIdToName[roomId] || `Room ${roomId}`;
        console.log('Found room_id:', roomId, '->', roomName, 'from entity:', state.entity_id);
        roomSet.add('room_' + roomId);
        rooms.push({
          id: 'room_' + roomId,
          name: roomName,
          icon: getRoomIcon(roomName.toLowerCase().replace(' ', '_'))
        });
      }
    });
    
    // If we found rooms from area_id, return them
    if (rooms.length > 0) {
      rooms.sort((a, b) => a.name.localeCompare(b.name));
      return rooms;
    }
    
    // Priority 3: Extract from entity IDs as LAST RESORT fallback
    console.log('Falling back to entity ID parsing...');
    const knownDomains = new Set([
      'sensor', 'switch', 'light', 'binary_sensor', 'climate', 'fan', 'cover', 'lock',
      'automation', 'scene', 'script', 'input_boolean', 'input_number', 'input_text',
      'input_select', 'input_datetime', 'device_tracker', 'person', 'group', 'zone',
      'weather', 'calendar', 'camera', 'media_player', 'vacuum', 'water_heater',
      'humidifier', 'deconz', 'zha', 'zigbee', 'mqtt', 'tasmota', 'esphome', 'shelly',
      'hue', 'tradfri', 'ikea', 'sonos', 'alexa', 'google', 'homekit', 'nest',
      'remote', 'tv', 'receiver', 'update', 'select', 'number', 'button', 'text'
    ]);
    
    // Common room names to look for in entity IDs
    const knownRooms = new Set([
      'living_room', 'bedroom', 'kitchen', 'bathroom', 'office', 'garage', 'garden',
      'hallway', 'dining', 'basement', 'attic', 'laundry', 'closet', 'patio',
      'balcony', 'stairs', 'entry', 'foyer', 'den', 'playroom', 'gym', 'workshop'
    ]);
    
    states.forEach(state => {
      const entityId = state.entity_id;
      const parts = entityId.split('.');
      if (parts.length >= 2) {
        const domain = parts[0];
        const entityName = parts[1].toLowerCase();
        
        // Skip known domains (they would be wrong as room names)
        if (knownDomains.has(domain)) return;
        
        // Check if entity name matches a known room
        if (knownRooms.has(entityName)) {
          if (!roomSet.has(entityName)) {
            roomSet.add(entityName);
            rooms.push({
              id: entityName,
              name: entityName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
              icon: getRoomIcon(entityName)
            });
          }
        }
        
        // Also check: does the entity name START with a known room?
        for (const room of knownRooms) {
          if (entityName.startsWith(room) && (entityName === room || entityName[room.length] === '_')) {
            if (!roomSet.has(room)) {
              roomSet.add(room);
              rooms.push({
                id: room,
                name: room.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                icon: getRoomIcon(room)
              });
            }
          }
        }
      }
    });
    
    // Sort rooms alphabetically
    rooms.sort((a, b) => a.name.localeCompare(b.name));
    
    if (rooms.length === 0) {
      return getDefaultRooms();
    }
    
    return rooms;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

export const fetchSensors = async (room) => {
  try {
    const states = await hassFetch('/states');
    const roomId = room.id.toLowerCase();
    const roomName = room.name.toLowerCase();
    
    const sensors = states
      .filter(state => {
        const entityId = state.entity_id;
        const attributes = state.attributes;
        
        // Only process sensor entities
        if (!entityId.startsWith('sensor.')) return false;
        
        // Check by area_id (preferred method in HA)
        const areaId = attributes?.area_id;
        if (areaId && areaId.toLowerCase() === roomId) return true;
        
        // Also check if area_id contains the room name
        if (areaId && areaId.toLowerCase().includes(roomName)) return true;
        
        // Fallback: check entity ID pattern (domain.room.something)
        const parts = entityId.split('.');
        if (parts.length >= 2) {
          const entityRoom = parts[1].toLowerCase();
          // Match room_id or room name variations
          if (entityRoom === roomId || 
              entityRoom === roomId.replace(/_/g, ' ') ||
              roomName.includes(entityRoom) ||
              entityRoom.includes(roomId.replace(/_/g, ' '))) {
            return true;
          }
        }
        
        return false;
      })
      .map(state => ({
        id: state.entity_id,
        name: state.attributes.friendly_name || state.entity_id,
        state: state.state,
        unit: state.attributes.unit_of_measurement || '',
        deviceClass: state.attributes.device_class || 'default'
      }));
    
    return sensors;
  } catch (error) {
    console.error('Error fetching sensors:', error);
    throw error;
  }
};

export const fetchAppliances = async (room) => {
  try {
    const states = await hassFetch('/states');
    const roomId = room.id.toLowerCase();
    const roomName = room.name.toLowerCase();
    
    const applianceTypes = ['light', 'switch', 'plug', 'outlet', 'fan', 'climate', 'cover', 'lock', 'media_player', 'vacuum'];
    
    const appliances = states
      .filter(state => {
        const entityId = state.entity_id;
        const attributes = state.attributes;
        
        // Only process appliance entities
        const domain = entityId.split('.')[0];
        if (!applianceTypes.includes(domain)) return false;
        
        // Check by area_id (preferred method in HA)
        const areaId = attributes?.area_id;
        if (areaId && areaId.toLowerCase() === roomId) return true;
        
        // Also check if area_id contains the room name
        if (areaId && areaId.toLowerCase().includes(roomName)) return true;
        
        // Fallback: check entity ID pattern (domain.room.something)
        const parts = entityId.split('.');
        if (parts.length >= 2) {
          const entityRoom = parts[1].toLowerCase();
          // Match room_id or room name variations
          if (entityRoom === roomId || 
              entityRoom === roomId.replace(/_/g, ' ') ||
              roomName.includes(entityRoom) ||
              entityRoom.includes(roomId.replace(/_/g, ' '))) {
            return true;
          }
        }
        
        return false;
      })
      .map(state => ({
        id: state.entity_id,
        name: state.attributes.friendly_name || state.entity_id,
        state: state.state,
        type: state.entity_id.split('.')[0],
        isOn: state.state === 'on'
      }));
    
    return appliances;
  } catch (error) {
    console.error('Error fetching appliances:', error);
    throw error;
  }
};

export const fetchAutomations = async (room) => {
  try {
    const automations = await hassFetch('/automations');
    
    const roomAutomations = automations
      .filter(automation => {
        const alias = automation.alias || '';
        // Match by room name or room id in the alias
        const roomName = room.name.toLowerCase();
        const roomId = room.id.toLowerCase();
        return alias.toLowerCase().includes(roomName) || 
               alias.toLowerCase().includes(roomId) ||
               alias.toLowerCase().includes(roomId.replace(/_/g, ' '));
      })
      .map(automation => ({
        id: automation.id,
        name: automation.alias || automation.id,
        state: automation.enabled ? 'enabled' : 'disabled',
        lastTriggered: automation.last_triggered
      }));
    
    return roomAutomations;
  } catch (error) {
    console.error('Error fetching automations:', error);
    throw error;
  }
};

// Fetch all automations grouped by room
export const fetchAllAutomations = async () => {
  try {
    const automations = await hassFetch('/automations');
    
    // Group automations by room based on their alias
    const grouped = {};
    
    automations.forEach(automation => {
      const alias = automation.alias || 'Unknown';
      let roomName = 'Other';
      
      // Try to extract room from alias (e.g., "Turn on living room lights" -> "living room")
      const roomKeywords = ['living room', 'bedroom', 'kitchen', 'bathroom', 'office', 'garage', 'garden', 'hallway', 'dining', 'basement', 'attic'];
      for (const keyword of roomKeywords) {
        if (alias.toLowerCase().includes(keyword)) {
          roomName = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          break;
        }
      }
      
      if (!grouped[roomName]) {
        grouped[roomName] = [];
      }
      
      grouped[roomName].push({
        id: automation.id,
        name: alias,
        state: automation.enabled ? 'enabled' : 'disabled',
        lastTriggered: automation.last_triggered
      });
    });
    
    return grouped;
  } catch (error) {
    console.error('Error fetching all automations:', error);
    throw error;
  }
};

// Fetch all entities for the home page overview
export const fetchAllEntities = async () => {
  try {
    const states = await hassFetch('/states');
    
    const sensors = [];
    const appliances = [];
    const binarySensors = [];
    const lights = [];
    
    states.forEach(state => {
      const entityId = state.entity_id;
      const parts = entityId.split('.');
      const domain = parts[0];
      const entity = parts[1];
      
      const entityData = {
        id: entityId,
        name: state.attributes?.friendly_name || entityId,
        state: state.state,
        domain: domain,
        entity: entity,
      };
      
      if (domain === 'sensor') {
        sensors.push({
          ...entityData,
          unit: state.attributes?.unit_of_measurement || '',
          deviceClass: state.attributes?.device_class || 'default'
        });
      } else if (domain === 'binary_sensor') {
        binarySensors.push(entityData);
      } else if (domain === 'light') {
        lights.push({
          ...entityData,
          brightness: state.attributes?.brightness,
          rgb_color: state.attributes?.rgb_color,
          isOn: state.state === 'on'
        });
      } else if (['switch', 'plug', 'outlet', 'fan', 'climate', 'cover', 'lock'].includes(domain)) {
        appliances.push({
          ...entityData,
          isOn: state.state === 'on'
        });
      }
    });
    
    return { sensors, appliances, binarySensors, lights };
  } catch (error) {
    console.error('Error fetching all entities:', error);
    throw error;
  }
};

export const checkHassConnection = async () => {
  try {
    await hassFetch('/');
    return { connected: true, error: null };
  } catch (error) {
    return { 
      connected: false, 
      error: error.message || 'Connection failed' 
    };
  }
};

const getRoomIcon = (areaId) => {
  const icons = {
    living_room: '🛋️',
    bedroom: '🛏️',
    kitchen: '🍳',
    bathroom: '🚿',
    office: '💼',
    garage: '🚗',
    garden: '🌳'
  };
  return icons[areaId] || '🏠';
};

const getDefaultRooms = () => {
  return [
    { id: 'living_room', name: 'Living Room', icon: '🛋️' },
    { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
    { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
    { id: 'bathroom', name: 'Bathroom', icon: '🚿' },
    { id: 'office', name: 'Office', icon: '💼' }
  ];
};
