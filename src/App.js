import React, { useState, useEffect } from 'react';
import { fetchRooms, fetchSensors, fetchAppliances, fetchAutomations, checkHassConnection } from './services/homeAssistant';
import { checkOllamaConnection } from './services/ollama';
import useTheme from './hooks/useTheme';
import Header from './components/Header';
import RoomSelector from './components/RoomSelector';
import Dashboard from './components/Dashboard';
import './styles/index.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [appliances, setAppliances] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hassStatus, setHassStatus] = useState('connecting');
  const [ollamaStatus, setOllamaStatus] = useState('connecting');

  useEffect(() => {
    const checkConnections = async () => {
      const hass = await checkHassConnection();
      setHassStatus(hass.connected ? 'connected' : 'disconnected');

      const ollama = await checkOllamaConnection();
      setOllamaStatus(ollama.connected ? 'connected' : 'disconnected');
    };
    checkConnections();
    const interval = setInterval(checkConnections, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const roomsData = await fetchRooms();
        setRooms(roomsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load rooms. Please check your Home Assistant connection.');
        setLoading(false);
      }
    };
    loadRooms();
  }, []);

  useEffect(() => {
    const loadRoomData = async () => {
      if (!selectedRoom) return;
      
      setLoading(true);
      try {
        const [sensorsData, appliancesData, automationsData] = await Promise.all([
          fetchSensors(selectedRoom),
          fetchAppliances(selectedRoom),
          fetchAutomations(selectedRoom)
        ]);
        setSensors(sensorsData);
        setAppliances(appliancesData);
        setAutomations(automationsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load room data. Please check your Home Assistant connection.');
        setLoading(false);
      }
    };
    loadRoomData();
  }, [selectedRoom]);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  if (loading && rooms.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <Header 
        theme={theme}
        onThemeToggle={toggleTheme}
        hassStatus={hassStatus}
        ollamaStatus={ollamaStatus}
      />
      
      <main className="main-content">
        {error && <div className="error-message">{error}</div>}
        
        <RoomSelector 
          rooms={rooms} 
          selectedRoom={selectedRoom} 
          onRoomSelect={handleRoomSelect} 
        />
        
        {selectedRoom && !loading && (
          <Dashboard 
            sensors={sensors}
            appliances={appliances}
            automations={automations}
            roomName={selectedRoom.name}
          />
        )}
        
        {loading && selectedRoom && (
          <div className="loading">Loading room data...</div>
        )}
      </main>
    </div>
  );
}

export default App;
