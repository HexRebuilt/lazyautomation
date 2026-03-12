import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Header from '../components/Header.jsx';

describe('Header', () => {
  test('renders header with title', () => {
    render(
      <Header 
        theme="light"
        onThemeToggle={() => {}}
        hassStatus="connected"
        ollamaStatus="connected"
      />
    );
    
    expect(screen.getByText('LazyAutomation')).toBeInTheDocument();
  });

  test('renders Home navigation button', () => {
    render(
      <Header 
        theme="light"
        onThemeToggle={() => {}}
        hassStatus="connected"
        ollamaStatus="connected"
      />
    );
    
    expect(screen.getByText('🏠 Home')).toBeInTheDocument();
  });

  test('renders Settings navigation button', () => {
    render(
      <Header 
        theme="light"
        onThemeToggle={() => {}}
        hassStatus="connected"
        ollamaStatus="connected"
      />
    );
    
    expect(screen.getByText('⚙️ Settings')).toBeInTheDocument();
  });

  test('displays Home Assistant status', () => {
    render(
      <Header 
        theme="light"
        onThemeToggle={() => {}}
        hassStatus="connected"
        ollamaStatus="disconnected"
      />
    );
    
    expect(screen.getByText('HA')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  test('displays correct status classes for connected status', () => {
    render(
      <Header 
        theme="light"
        onThemeToggle={() => {}}
        hassStatus="connected"
        ollamaStatus="connected"
      />
    );
    
    const statusIndicators = document.querySelectorAll('.status-indicator');
    expect(statusIndicators[0]).toHaveClass('connected');
    expect(statusIndicators[1]).toHaveClass('connected');
  });

  test('displays correct status classes for disconnected status', () => {
    render(
      <Header 
        theme="light"
        onThemeToggle={() => {}}
        hassStatus="disconnected"
        ollamaStatus="disconnected"
      />
    );
    
    const statusIndicators = document.querySelectorAll('.status-indicator');
    expect(statusIndicators[0]).toHaveClass('disconnected');
    expect(statusIndicators[1]).toHaveClass('disconnected');
  });

  test('displays correct status classes for connecting status', () => {
    render(
      <Header 
        theme="light"
        onThemeToggle={() => {}}
        hassStatus="connecting"
        ollamaStatus="connecting"
      />
    );
    
    const statusIndicators = document.querySelectorAll('.status-indicator');
    expect(statusIndicators[0]).toHaveClass('connecting');
    expect(statusIndicators[1]).toHaveClass('connecting');
  });

  test('calls onNavigate when Home button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnNavigate = vi.fn();
    
    render(
      <Header 
        theme="light"
        onThemeToggle={() => {}}
        hassStatus="connected"
        ollamaStatus="connected"
        currentPage="settings"
        onNavigate={mockOnNavigate}
      />
    );
    
    await user.click(screen.getByText('🏠 Home'));
    expect(mockOnNavigate).toHaveBeenCalledWith('home');
  });

  test('calls onNavigate when Settings button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnNavigate = vi.fn();
    
    render(
      <Header 
        theme="light"
        onThemeToggle={() => {}}
        hassStatus="connected"
        ollamaStatus="connected"
        currentPage="home"
        onNavigate={mockOnNavigate}
      />
    );
    
    await user.click(screen.getByText('⚙️ Settings'));
    expect(mockOnNavigate).toHaveBeenCalledWith('settings');
  });

  test('calls onThemeToggle when theme button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnThemeToggle = vi.fn();
    
    render(
      <Header 
        theme="light"
        onThemeToggle={mockOnThemeToggle}
        hassStatus="connected"
        ollamaStatus="connected"
      />
    );
    
    await user.click(screen.getByRole('button', { name: /switch to dark mode/i }));
    expect(mockOnThemeToggle).toHaveBeenCalled();
  });

  test('displays sun icon in light mode', () => {
    render(
      <Header 
        theme="light"
        onThemeToggle={() => {}}
        hassStatus="connected"
        ollamaStatus="connected"
      />
    );
    
    expect(screen.getByText('☀️')).toBeInTheDocument();
  });

  test('displays moon icon in dark mode', () => {
    render(
      <Header 
        theme="dark"
        onThemeToggle={() => {}}
        hassStatus="connected"
        ollamaStatus="connected"
      />
    );
    
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });
});
