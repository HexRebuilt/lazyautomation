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
    
    const rooms = [];
    const roomSet = new Set(); // Use Set for deduplication
    
    // Priority 1: Get areas from Home Assistant API
    let areas = [];
    const areaEndpoints = ['/areas', '/config/areas', '/area_registry'];
    
    for (const endpoint of areaEndpoints) {
      try {
        areas = await hassFetch(endpoint);
        if (areas && areas.length > 0) {
          console.log('Found areas from:', endpoint, areas);
          break;
        }
      } catch (e) {
        console.warn(`Failed to fetch areas from ${endpoint}:`, e.message);
      }
    }
    
    // Add areas from HA API - use the original name from HA
    if (areas && areas.length > 0) {
      areas.forEach(area => {
        const normalizedName = (area.name || area.area_id).toLowerCase().trim();
        if (!roomSet.has(normalizedName)) {
          roomSet.add(normalizedName);
          rooms.push({
            id: area.area_id,
            name: area.name || area.area_id, // Keep original name from HA
            icon: getRoomIcon(area.area_id)
          });
        }
      });
      
      // If we got rooms from areas, return them (sorted by original name)
      if (rooms.length > 0) {
        rooms.sort((a, b) => a.name.localeCompare(b.name));
        console.log('Rooms from HA API:', rooms);
        return rooms;
      }
    }
    
    // Priority 2: Extract unique area_ids from entity attributes
    console.log('===== EXTRACTING ROOMS FROM ENTITIES =====');
    
    states.forEach(state => {
      const areaId = state.attributes?.area_id;
      if (areaId) {
        const normalizedName = areaId.toLowerCase().trim();
        if (!roomSet.has(normalizedName)) {
          roomSet.add(normalizedName);
          rooms.push({
            id: areaId,
            name: areaId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            icon: getRoomIcon(areaId)
          });
        }
      }
    });
    
    // If we found rooms from area_id, return them (sorted by name)
    if (rooms.length > 0) {
      rooms.sort((a, b) => a.name.localeCompare(b.name));
      console.log('Rooms from area_id:', rooms);
      console.log('===== END ROOM EXTRACTION =====');
      return rooms;
    }
    
    // Priority 3: Extract rooms from entity IDs (fallback for systems without area_id)
    console.log('No area_id found, extracting rooms from entity IDs...');
    
    // Common room patterns in Italian and English
    const roomPatterns = [
      // Italian patterns
      'soggiorno', 'cucina', 'camera_da_letto', 'camera', 'letto', 'bagno', 
      'ingresso', 'salotto', 'studio', 'ripostiglio', 'cantina', 'soffitta',
      'garage', 'terrazzo', 'balcone', 'giardino', 'portico',
      // English patterns
      'living_room', 'kitchen', 'bedroom', 'bathroom', 'hallway', 'entrance',
      'dining_room', 'office', 'storage', 'basement', 'attic', 'garage',
      'terrace', 'balcony', 'garden', 'porch'
    ];
    
    states.forEach(state => {
      const entityId = state.entity_id;
      const parts = entityId.split('.');
      if (parts.length >= 2) {
        const entityName = parts[1].toLowerCase();
        
        // Check if entity name contains any room pattern
        for (const pattern of roomPatterns) {
          if (entityName.includes(pattern)) {
            const normalizedName = pattern.toLowerCase().trim();
            if (!roomSet.has(normalizedName)) {
              roomSet.add(normalizedName);
              rooms.push({
                id: normalizedName,
                name: pattern.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                icon: getRoomIcon(normalizedName)
              });
            }
            break;
          }
        }
      }
    });
    
    console.log('Rooms extracted from entity IDs:', rooms);
    console.log('===== END ROOM EXTRACTION =====');
    
    // Sort and return
    rooms.sort((a, b) => a.name.localeCompare(b.name));
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
        
        // Check by area_id (preferred method in HA) - this works for any language
        const areaId = attributes?.area_id;
        if (areaId) {
          const areaIdLower = areaId.toLowerCase();
          // Match by area_id directly
          if (areaIdLower === roomId) return true;
          // Match by area name in any language
          if (areaIdLower === roomName) return true;
          // Partial match (area_id contains room name or vice versa)
          if (areaIdLower.includes(roomName) || roomName.includes(areaIdLower)) return true;
        }
        
        // Also check entity ID for room match (legacy fallback)
        const entityRoom = entityId.split('.')[1]?.toLowerCase();
        if (entityRoom && (entityRoom.startsWith(roomId) || roomId.startsWith(entityRoom))) {
          return true;
        }
        
        return false;
      })
      .map(state => ({
        id: state.entity_id,
        // Show both friendly name and entity_id for automation reference
        name: state.attributes.friendly_name || state.entity_id,
        entityId: state.entity_id,  // Logical name for automation
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

// Get all sensors (not filtered by room) - for automation use
export const fetchAllSensors = async () => {
  try {
    const states = await hassFetch('/states');
    
    const sensors = states
      .filter(state => state.entity_id.startsWith('sensor.'))
      .map(state => ({
        id: state.entity_id,
        // Show both friendly name and entity_id for automation reference
        name: state.attributes.friendly_name || state.entity_id,
        entityId: state.entity_id,  // Logical name for automation
        state: state.state,
        unit: state.attributes.unit_of_measurement || '',
        deviceClass: state.attributes.device_class || 'default',
        lastChanged: state.last_changed
      }));
    
    return sensors;
  } catch (error) {
    console.error('Error fetching all sensors:', error);
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
        
        // Check by area_id (preferred method in HA) - this works for any language
        const areaId = attributes?.area_id;
        if (areaId) {
          const areaIdLower = areaId.toLowerCase();
          // Match by area_id directly
          if (areaIdLower === roomId) return true;
          // Match by area name in any language
          if (areaIdLower === roomName) return true;
          // Partial match (area_id contains room name or vice versa)
          if (areaIdLower.includes(roomName) || roomName.includes(areaIdLower)) return true;
        }
        
        // Also check entity ID for room match (legacy fallback)
        const entityRoom = entityId.split('.')[1]?.toLowerCase();
        if (entityRoom && (entityRoom.startsWith(roomId) || roomId.startsWith(entityRoom))) {
          return true;
        }
        
        return false;
      })
      .map(state => ({
        id: state.entity_id,
        // Show both friendly name and entity_id for automation reference
        name: state.attributes.friendly_name || state.entity_id,
        entityId: state.entity_id,  // Logical name for automation
        state: state.state,
        type: state.entity_id.split('.')[0],
        isOn: state.state === 'on',
        lastChanged: state.last_changed
      }));
    
    return appliances;
  } catch (error) {
    console.error('Error fetching appliances:', error);
    throw error;
  }
};

export const fetchAutomations = async (room) => {
  try {
    // Get all states and filter for automation entities
    const states = await hassFetch('/states');
    const automationEntities = states.filter(s => s.entity_id.startsWith('automation.'));
    
    const roomAutomations = automationEntities
      .filter(automation => {
        const alias = automation.attributes?.friendly_name || automation.entity_id;
        // Match by room name or room id in the alias
        const roomName = room.name.toLowerCase();
        const roomId = room.id.toLowerCase();
        return alias.toLowerCase().includes(roomName) || 
               alias.toLowerCase().includes(roomId) ||
               alias.toLowerCase().includes(roomId.replace(/_/g, ' '));
      })
      .map(automation => ({
        id: automation.entity_id,
        name: automation.attributes?.friendly_name || automation.entity_id,
        state: automation.state === 'on' ? 'enabled' : 'disabled',
        lastTriggered: automation.attributes?.last_triggered
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
    // Get all states and filter for automation entities
    const states = await hassFetch('/states');
    const automationEntities = states.filter(s => s.entity_id.startsWith('automation.'));
    
    // Group automations by room based on their alias/name
    const grouped = {};
    
    automationEntities.forEach(automation => {
      const alias = automation.attributes?.friendly_name || automation.entity_id;
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
        id: automation.entity_id,
        name: alias,
        state: automation.state === 'on' ? 'enabled' : 'disabled',
        lastTriggered: automation.attributes?.last_triggered
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
