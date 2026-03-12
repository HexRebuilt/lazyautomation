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
    
    const rooms = [];
    const processedEntities = new Set();
    
    states.forEach(state => {
      const attributes = state.attributes;
      
      if (attributes?.area_id && !processedEntities.has(attributes.area_id)) {
        processedEntities.add(attributes.area_id);
        rooms.push({
          id: attributes.area_id,
          name: attributes.friendly_name || attributes.area_id,
          icon: getRoomIcon(attributes.area_id)
        });
      }
    });
    
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
        return (
          entityId.startsWith('sensor.') &&
          attributes?.area_id === room.id
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
    
    const applianceTypes = ['light', 'switch', 'plug', 'outlet', 'fan', 'climate'];
    
    const appliances = states
      .filter(state => {
        const entityId = state.entity_id;
        const attributes = state.attributes;
        return (
          applianceTypes.some(type => entityId.startsWith(`${type}.`)) &&
          attributes?.area_id === room.id
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
        return alias.toLowerCase().includes(room.name.toLowerCase());
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
