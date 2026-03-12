import React from 'react';

const Header = ({ 
  theme, 
  onThemeToggle, 
  hassStatus, 
  ollamaStatus,
  currentPage = 'home',
  onNavigate
}) => {
  const getStatusClass = (status) => {
    if (status === 'connected') return 'connected';
    if (status === 'connecting') return 'connecting';
    return 'disconnected';
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1>LazyAutomation</h1>
        <nav className="header-nav">
          <button 
            className={`nav-button ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate('home')}
          >
            🏠 Home
          </button>
          <button 
            className={`nav-button ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>
      </div>
      <div className="header-right">
        <div className="connection-status" title="Home Assistant">
          <span className={`status-indicator ${getStatusClass(hassStatus)}`}></span>
          <span>HA</span>
        </div>
        <div className="connection-status" title="Ollama (AI)">
          <span className={`status-indicator ${getStatusClass(ollamaStatus)}`}></span>
          <span>AI</span>
        </div>
        <button 
          className="theme-toggle" 
          onClick={onThemeToggle}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
};

export default Header;
