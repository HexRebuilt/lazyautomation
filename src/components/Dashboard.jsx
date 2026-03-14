import React from 'react';

const Dashboard = ({ sensors, appliances, automations, roomName, allDevices, allSensors }) => {
  return (
    <div className="dashboard-grid">
      {/* Devices Section - Top Level */}
      <div className="dashboard-card">
        <h3>💡 Devices</h3>
        {allDevices && allDevices.length > 0 ? (
          <ul className="device-list">
            {allDevices.map(device => (
              <li key={device.id} className="device-item">
                <div className="device-info">
                  <span className="device-name">{device.name}</span>
                  <span className="device-entity-id" title="Entity ID for automation">
                    {device.entityId || device.id}
                  </span>
                </div>
                <span className={`status-badge ${device.state === 'on' ? 'active' : 'inactive'}`}>
                  {device.state}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No devices found.</p>
        )}
      </div>

      {/* Sensors Section - Top Level */}
      <div className="dashboard-card">
        <h3>📡 Sensors</h3>
        {allSensors && allSensors.length > 0 ? (
          <ul className="sensor-list">
            {allSensors.map(sensor => (
              <li key={sensor.id} className="sensor-item">
                <div className="sensor-info">
                  <span className="sensor-name">{sensor.name}</span>
                  <span className="sensor-entity-id" title="Entity ID for automation">
                    {sensor.entityId || sensor.id}
                  </span>
                </div>
                <span className="sensor-state">
                  {sensor.state} {sensor.unit}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No sensors found.</p>
        )}
      </div>

      {/* Room-specific Section */}
      <div className="dashboard-card">
        <h3>🏠 Room: {roomName}</h3>
        <div className="room-details">
          <div className="room-section">
            <h4>Devices in this room</h4>
            {appliances.length === 0 ? (
              <p>No devices found for this room.</p>
            ) : (
              <ul className="appliance-list">
                {appliances.map(appliance => (
                  <li key={appliance.id} className="appliance-item">
                    <div className="appliance-info">
                      <span className="appliance-name">{appliance.name}</span>
                      <span className="appliance-entity-id" title="Entity ID for automation">
                        {appliance.entityId || appliance.id}
                      </span>
                    </div>
                    <span className={`status-badge ${appliance.isOn ? 'active' : 'inactive'}`}>
                      {appliance.isOn ? 'ON' : 'OFF'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="room-section">
            <h4>Sensors in this room</h4>
            {sensors.length === 0 ? (
              <p>No sensors found for this room.</p>
            ) : (
              <ul className="sensor-list">
                {sensors.map(sensor => (
                  <li key={sensor.id} className="sensor-item">
                    <div className="sensor-info">
                      <span className="sensor-name">{sensor.name}</span>
                      <span className="sensor-entity-id" title="Entity ID for automation">
                        {sensor.entityId || sensor.id}
                      </span>
                    </div>
                    <span className="sensor-state">
                      {sensor.state} {sensor.unit}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="room-section">
            <h4>Automations in this room</h4>
            {automations.length === 0 ? (
              <p>No automations found for this room.</p>
            ) : (
              <ul className="automation-list">
                {automations.map(automation => (
                  <li key={automation.id} className="automation-item">
                    <div className="automation-info">
                      <span className="automation-name">{automation.name}</span>
                      <span className="automation-entity-id" title="Entity ID for automation">
                        {automation.id}
                      </span>
                    </div>
                    <span className={`status-badge ${automation.state === 'enabled' ? 'active' : 'inactive'}`}>
                      {automation.state}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
