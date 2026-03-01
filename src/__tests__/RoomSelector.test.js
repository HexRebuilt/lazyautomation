import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoomSelector from '../components/RoomSelector';

const mockRooms = [
  { id: 'living_room', name: 'Living Room', icon: '🛋️' },
  { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳' }
];

describe('RoomSelector', () => {
  test('renders room selector with rooms', () => {
    render(
      <RoomSelector 
        rooms={mockRooms} 
        selectedRoom={null} 
        onRoomSelect={() => {}} 
      />
    );
    
    expect(screen.getByText('Select Room')).toBeInTheDocument();
    expect(screen.getByText('Living Room')).toBeInTheDocument();
    expect(screen.getByText('Bedroom')).toBeInTheDocument();
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
  });

  test('calls onRoomSelect when room is clicked', () => {
    const mockOnRoomSelect = jest.fn();
    
    render(
      <RoomSelector 
        rooms={mockRooms} 
        selectedRoom={null} 
        onRoomSelect={mockOnRoomSelect} 
      />
    );
    
    fireEvent.click(screen.getByText('Living Room'));
    expect(mockOnRoomSelect).toHaveBeenCalledWith(mockRooms[0]);
  });

  test('highlights selected room', () => {
    render(
      <RoomSelector 
        rooms={mockRooms} 
        selectedRoom={mockRooms[0]} 
        onRoomSelect={() => {}} 
      />
    );
    
    const roomCards = document.querySelectorAll('.room-card');
    expect(roomCards[0]).toHaveClass('active');
  });
});
