import React from 'react';

const Dashboard = ({ sensors, appliances, automations, roomName }) => {
  return (
    <div className="dashboard-grid">
      <div className="dashboard-card">
        <h3>📡 Sensors</h3>
        {sensors.length === 0 ? (
          <p>No sensors found for this room.</p>
        ) : (
          <ul className="sensor-list">
            {sensors.map(sensor => (
              <li key={sensor.id} className="sensor-item">
                <span className="sensor-name">{sensor.name}</span>
                <span className="sensor-state">
                  {sensor.state} {sensor.unit}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="dashboard-card">
        <h3>💡 Appliances</h3>
        {appliances.length === 0 ? (
          <p>No appliances found for this room.</p>
        ) : (
          <ul className="appliance-list">
            {appliances.map(appliance => (
              <li key={appliance.id} className="appliance-item">
                <span className="appliance-name">{appliance.name}</span>
                <span className={`status-badge ${appliance.isOn ? 'active' : 'inactive'}`}>
                  {appliance.isOn ? 'ON' : 'OFF'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="dashboard-card">
        <h3>⚙️ Automations</h3>
        {automations.length === 0 ? (
          <p>No automations found for this room.</p>
        ) : (
          <ul className="automation-list">
            {automations.map(automation => (
              <li key={automation.id} className="automation-item">
                <span className="automation-name">{automation.name}</span>
                <span className={`status-badge ${automation.state === 'enabled' ? 'active' : 'inactive'}`}>
                  {automation.state}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
