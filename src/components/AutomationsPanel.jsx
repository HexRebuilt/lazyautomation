import React from 'react';

const AutomationsPanel = ({ automations = {} }) => {
  const rooms = Object.keys(automations);
  
  if (rooms.length === 0) {
    return (
      <div className="automations-panel">
        <h3>⚙️ Automations</h3>
        <p className="no-data">No automations found</p>
      </div>
    );
  }

  return (
    <div className="automations-panel">
      <h3>⚙️ Automations</h3>
      <div className="automations-list">
        {rooms.map(room => (
          <div key={room} className="automation-room">
            <h4>{room}</h4>
            <ul>
              {automations[room].map(automation => (
                <li key={automation.id} className="automation-item">
                  <span className="automation-name">{automation.name}</span>
                  <span className={`status-badge ${automation.state === 'enabled' ? 'active' : 'inactive'}`}>
                    {automation.state}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutomationsPanel;
