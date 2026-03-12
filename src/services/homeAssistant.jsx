import { getHassConfig } from './settings.js';

// Use fetch through proxy to avoid CORS issues
const hassFetch = async (endpoint, options = {}) => {
  const config = getHassConfig();
  if (!config.host) {
    throw new Error('Home Assistant URL not configured');
  }
  
  const targetUrl = `${config.host}/api${endpoint}`;
  const proxyUrl = `/api/proxy/${encodeURIComponent(targetUrl)}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(config.token ? { 'Authorization': `Bearer ${config.token}` } : {})
  };
  
  const response = await fetch(proxyUrl, { headers });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return response.json();
};

export const fetchRooms = async () => {
  try {
    const states = await hassFetch('/states');
    
    // Try to get areas from Home Assistant API first
    let areas = [];
    try {
      areas = await hassFetch('/api/areas');
    } catch (e) {
      // Areas API not available, continue
    }
    
    const rooms = [];
    
    // If we have areas from HA, use those
    if (areas && areas.length > 0) {
      areas.forEach(area => {
        rooms.push({
          id: area.area_id,
          name: area.name || area.area_id,
          icon: getRoomIcon(area.area_id)
        });
      });
    } else {
      // Otherwise extract from entity IDs (e.g., sensor.living_room_temperature -> living_room)
      const roomNames = new Set();
      
      states.forEach(state => {
        const entityId = state.entity_id;
        // Try to extract room name from entity ID pattern: type.room_name.something
        const parts = entityId.split('.');
        if (parts.length >= 2) {
          const roomPart = parts[1];
          // Check if it looks like a room name (not a device type)
          const commonTypes = ['sensor', 'switch', 'light', 'binary_sensor', 'climate', 'fan', 'cover', 'lock', 'automation', 'scene', 'script', 'input_', 'binary_'];
          if (!commonTypes.includes(roomPart) && !roomPart.includes('_') && roomPart.length > 2) {
            roomNames.add(roomPart);
          }
        }
      });
      
      // Also try area_id if available
      states.forEach(state => {
        const areaId = state.attributes?.area_id;
        if (areaId) {
          roomNames.add(areaId);
        }
      });
      
      // Convert to rooms
      roomNames.forEach(name => {
        rooms.push({
          id: name,
          name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          icon: getRoomIcon(name)
        });
      });
    }
    
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
    
    const sensors = states
      .filter(state => {
        const entityId = state.entity_id;
        const attributes = state.attributes;
        
        // Check by area_id OR by entity ID pattern
        const hasAreaId = attributes?.area_id === room.id;
        const entityRoom = entityId.split('.')[1];
        const hasMatchingRoom = entityRoom === room.id || entityRoom === room.id.replace(/_/g, ' ');
        
        return (
          entityId.startsWith('sensor.') &&
          (hasAreaId || hasMatchingRoom)
        );
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
    
    const applianceTypes = ['light', 'switch', 'plug', 'outlet', 'fan', 'climate', 'cover', 'lock'];
    
    const appliances = states
      .filter(state => {
        const entityId = state.entity_id;
        const attributes = state.attributes;
        
        // Check by area_id OR by entity ID pattern
        const hasAreaId = attributes?.area_id === room.id;
        const entityRoom = entityId.split('.')[1];
        const hasMatchingRoom = entityRoom === room.id || entityRoom === room.id.replace(/_/g, ' ');
        
        return (
          applianceTypes.some(type => entityId.startsWith(`${type}.`)) &&
          (hasAreaId || hasMatchingRoom)
        );
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
