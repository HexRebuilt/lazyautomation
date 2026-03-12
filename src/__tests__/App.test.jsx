import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SettingsProvider } from '../context/SettingsContext.jsx';
import App from '../App.jsx';

// Mock the services
vi.mock('../services/homeAssistant.jsx', () => ({
  fetchRooms: vi.fn().mockResolvedValue([
    { id: 'living_room', name: 'Living Room', icon: '🛋️' }
  ]),
  fetchSensors: vi.fn().mockResolvedValue([]),
  fetchAppliances: vi.fn().mockResolvedValue([]),
  fetchAutomations: vi.fn().mockResolvedValue([]),
  checkHassConnection: vi.fn().mockResolvedValue({ connected: true, error: null }),
}));

vi.mock('../services/ollama.jsx', () => ({
  checkOllamaConnection: vi.fn().mockResolvedValue({ connected: false, error: null }),
}));

vi.mock('../hooks/useTheme.jsx', () => ({
  __esModule: true,
  default: () => ({
    theme: 'light',
    toggleTheme: vi.fn(),
  }),
}));

const renderWithProvider = (component) => {
  return render(
    <SettingsProvider>
      {component}
    </SettingsProvider>
  );
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('renders app with header', async () => {
    renderWithProvider(<App />);
    await waitFor(() => {
      expect(screen.getByText('LazyAutomation')).toBeInTheDocument();
    });
  });

  test('renders navigation with Home button', async () => {
    renderWithProvider(<App />);
    await waitFor(() => {
      expect(screen.getByText('🏠 Home')).toBeInTheDocument();
    });
  });

  test('renders navigation with Settings button', async () => {
    renderWithProvider(<App />);
    await waitFor(() => {
      expect(screen.getByText('⚙️ Settings')).toBeInTheDocument();
    });
  });

  test('renders connection status indicators', async () => {
    renderWithProvider(<App />);
    await waitFor(() => {
      expect(screen.getByText('HA')).toBeInTheDocument();
      expect(screen.getByText('AI')).toBeInTheDocument();
    });
  });

  test('navigates to settings when Settings button clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('⚙️ Settings')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('⚙️ Settings'));
    
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });
});
