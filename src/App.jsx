import React, { useState, useEffect } from 'react';
import { fetchRooms, fetchSensors, fetchAppliances, fetchAutomations, checkHassConnection } from './services/homeAssistant.jsx';
import { checkOllamaConnection } from './services/ollama.jsx';
import useTheme from './hooks/useTheme.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import Header from './components/Header.jsx';
import RoomSelector from './components/RoomSelector.jsx';
import Dashboard from './components/Dashboard.jsx';
import Settings from './components/Settings.jsx';
import './styles/index.css';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState('home');
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [appliances, setAppliances] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hassStatus, setHassStatus] = useState('connecting');
  const [ollamaStatus, setOllamaStatus] = useState('connecting');

  // Check connections on mount
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

  // Load rooms on mount
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const roomsData = await fetchRooms();
        setRooms(roomsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load rooms. Please check your Home Assistant connection settings.');
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

  const handleNavigate = (page) => {
    setCurrentPage(page);
    if (page === 'home') {
      setError(null);
    }
  };

  if (loading && rooms.length === 0 && currentPage === 'home') {
    return (
      <div className="app">
        <Header 
          theme={theme}
          onThemeToggle={toggleTheme}
          hassStatus={hassStatus}
          ollamaStatus={ollamaStatus}
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />
        <main className="main-content">
          <div className="loading">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Header 
        theme={theme}
        onThemeToggle={toggleTheme}
        hassStatus={hassStatus}
        ollamaStatus={ollamaStatus}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />
      
      <main className="main-content">
        {currentPage === 'settings' ? (
          <Settings />
        ) : (
          <>
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
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
