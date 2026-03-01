import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../components/Dashboard';

const mockSensors = [
  { id: 'sensor.temperature', name: 'Temperature', state: '22', unit: '°C' },
  { id: 'sensor.humidity', name: 'Humidity', state: '45', unit: '%' }
];

const mockAppliances = [
  { id: 'light.living_room', name: 'Living Room Light', state: 'on', type: 'light', isOn: true },
  { id: 'switch.fan', name: 'Fan', state: 'off', type: 'switch', isOn: false }
];

const mockAutomations = [
  { id: 'automation.1', name: 'Turn on lights at sunset', state: 'enabled', lastTriggered: '2024-01-01T00:00:00' },
  { id: 'automation.2', name: 'Turn off lights at midnight', state: 'disabled', lastTriggered: null }
];

describe('Dashboard', () => {
  test('renders sensors, appliances, and automations', () => {
    render(
      <Dashboard 
        sensors={mockSensors}
        appliances={mockAppliances}
        automations={mockAutomations}
        roomName="Living Room"
      />
    );
    
    expect(screen.getByText('📡 Sensors')).toBeInTheDocument();
    expect(screen.getByText('💡 Appliances')).toBeInTheDocument();
    expect(screen.getByText('⚙️ Automations')).toBeInTheDocument();
  });

  test('displays sensor data correctly', () => {
    render(
      <Dashboard 
        sensors={mockSensors}
        appliances={[]}
        automations={[]}
        roomName="Living Room"
      />
    );
    
    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('22 °C')).toBeInTheDocument();
    expect(screen.getByText('Humidity')).toBeInTheDocument();
    expect(screen.getByText('45 %')).toBeInTheDocument();
  });

  test('displays appliance status correctly', () => {
    render(
      <Dashboard 
        sensors={[]}
        appliances={mockAppliances}
        automations={[]}
        roomName="Living Room"
      />
    );
    
    expect(screen.getByText('Living Room Light')).toBeInTheDocument();
    expect(screen.getByText('Fan')).toBeInTheDocument();
    expect(screen.getByText('ON')).toBeInTheDocument();
    expect(screen.getByText('OFF')).toBeInTheDocument();
  });

  test('displays automation state correctly', () => {
    render(
      <Dashboard 
        sensors={[]}
        appliances={[]}
        automations={mockAutomations}
        roomName="Living Room"
      />
    );
    
    expect(screen.getByText('Turn on lights at sunset')).toBeInTheDocument();
    expect(screen.getByText('enabled')).toBeInTheDocument();
    expect(screen.getByText('disabled')).toBeInTheDocument();
  });

  test('shows empty message when no data', () => {
    render(
      <Dashboard 
        sensors={[]}
        appliances={[]}
        automations={[]}
        roomName="Living Room"
      />
    );
    
    expect(screen.getByText('No sensors found for this room.')).toBeInTheDocument();
    expect(screen.getByText('No appliances found for this room.')).toBeInTheDocument();
    expect(screen.getByText('No automations found for this room.')).toBeInTheDocument();
  });
});
